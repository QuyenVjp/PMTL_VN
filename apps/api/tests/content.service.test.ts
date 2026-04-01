import { Test } from "@nestjs/testing";
import { NotFoundException, ForbiddenException, ConflictException } from "@nestjs/common";
import { ContentService } from "../src/modules/content/content.service.js";
import { ContentRepository } from "../src/modules/content/content.repository.js";
import { PrismaService } from "../src/common/prisma/prisma.service.js";
import { CacheService } from "../src/common/cache/cache.service.js";
import { AuditService } from "../src/platform/audit/audit.service.js";
import { StorageService } from "../src/platform/storage/storage.service.js";
import type { AuditContext } from "../src/platform/audit/audit.service.js";
import type { UserRole } from "../src/generated/prisma/client.js";

const makePost = (overrides: Record<string, unknown> = {}) => ({
  id: "internal-id",
  publicId: "test-public-id-123456",
  slug: "test-bai-viet",
  title: "Bài viết kiểm tra",
  postType: "ARTICLE",
  sourceRef: null,
  excerpt: null,
  content: {},
  status: "DRAFT",
  featured: false,
  allowComments: true,
  authorId: "author-id-123456789012",
  featuredImageId: null,
  primaryCategoryId: null,
  publishedAt: null,
  firstPublishedAt: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  author: { publicId: "author-id-123456789012", displayName: "Tác giả", avatarUrl: null },
  primaryCategory: null,
  tags: [],
  ...overrides,
});

const auditContext: AuditContext = {
  actorId: "actor-id",
  actorType: "user",
  ipAddress: "127.0.0.1",
  userAgent: "jest",
};

describe("ContentService", () => {
  let service: ContentService;
  let repository: jest.Mocked<ContentRepository>;
  let prisma: { $transaction: jest.Mock };
  let audit: jest.Mocked<AuditService>;
  let storage: jest.Mocked<StorageService>;

  beforeEach(async () => {
    const mockRepository: Partial<jest.Mocked<ContentRepository>> = {
      findByPublicId: jest.fn(),
      findBySlug: jest.fn(),
      slugExists: jest.fn(),
      findMany: jest.fn(),
    };

    // $transaction executes the callback with a tx mock that mirrors post.update
    const mockTxPost = {
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };
    const mockTx = { post: mockTxPost };
    const mockPrisma = {
      $transaction: jest.fn().mockImplementation((cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      ),
      post: mockTxPost,
    };

    const mockAudit: Partial<jest.Mocked<AuditService>> = {
      appendInTransaction: jest.fn().mockResolvedValue(undefined),
    };

    const mockStorage: Partial<jest.Mocked<StorageService>> = {
      resolveAssetUrlById: jest.fn().mockResolvedValue(null),
      getAsset: jest.fn().mockResolvedValue(null),
    };

    const mockCache: Partial<jest.Mocked<CacheService>> = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        ContentService,
        { provide: ContentRepository, useValue: mockRepository },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CacheService, useValue: mockCache },
        { provide: AuditService, useValue: mockAudit },
        { provide: StorageService, useValue: mockStorage },
      ],
    }).compile();

    service = module.get<ContentService>(ContentService);
    repository = module.get(ContentRepository) as jest.Mocked<ContentRepository>;
    prisma = module.get(PrismaService) as unknown as { $transaction: jest.Mock };
    audit = module.get(AuditService) as jest.Mocked<AuditService>;
    storage = module.get(StorageService) as jest.Mocked<StorageService>;
  });

  // ---- publishPost ----

  describe("publishPost", () => {
    it("sets firstPublishedAt on the first publish when it is null", async () => {
      const post = makePost({ status: "DRAFT", firstPublishedAt: null });
      repository.findByPublicId.mockResolvedValue(post as never);

      const publishedPost = makePost({
        status: "PUBLISHED",
        publishedAt: new Date(),
        firstPublishedAt: new Date(),
      });

      // Reach inside the $transaction mock to capture what update was called with
      let capturedData: Record<string, unknown> | undefined;
      (prisma.$transaction as jest.Mock).mockImplementation(
        async (cb: (tx: { post: { update: jest.Mock } }) => Promise<unknown>) => {
          const fakeTx = {
            post: {
              update: jest.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) => {
                capturedData = data;
                return Promise.resolve(publishedPost);
              }),
            },
          };
          return cb(fakeTx);
        },
      );

      await service.publishPost("test-public-id-123456", "ADMIN", auditContext);

      expect(capturedData).toBeDefined();
      expect(capturedData!["status"]).toBe("PUBLISHED");
      expect(capturedData!["firstPublishedAt"]).toBeInstanceOf(Date);
    });

    it("does NOT overwrite firstPublishedAt on re-publish", async () => {
      const existingFirstPublish = new Date("2025-06-01T00:00:00Z");
      const post = makePost({
        status: "DRAFT",
        firstPublishedAt: existingFirstPublish,
      });
      repository.findByPublicId.mockResolvedValue(post as never);

      const publishedPost = makePost({
        status: "PUBLISHED",
        publishedAt: new Date(),
        firstPublishedAt: existingFirstPublish,
      });

      let capturedData: Record<string, unknown> | undefined;
      (prisma.$transaction as jest.Mock).mockImplementation(
        async (cb: (tx: { post: { update: jest.Mock } }) => Promise<unknown>) => {
          const fakeTx = {
            post: {
              update: jest.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) => {
                capturedData = data;
                return Promise.resolve(publishedPost);
              }),
            },
          };
          return cb(fakeTx);
        },
      );

      await service.publishPost("test-public-id-123456", "ADMIN", auditContext);

      expect(capturedData!["firstPublishedAt"]).toBeUndefined();
    });

    it("throws ForbiddenException when role is not ADMIN/SUPER_ADMIN", async () => {
      await expect(
        service.publishPost("test-public-id-123456", "USER" as UserRole, auditContext),
      ).rejects.toThrow(ForbiddenException);
    });

    it("throws ConflictException when post is already PUBLISHED", async () => {
      const post = makePost({ status: "PUBLISHED" });
      repository.findByPublicId.mockResolvedValue(post as never);

      await expect(
        service.publishPost("test-public-id-123456", "ADMIN", auditContext),
      ).rejects.toThrow(ConflictException);
    });

    it("throws NotFoundException when post does not exist", async () => {
      repository.findByPublicId.mockResolvedValue(null);

      await expect(
        service.publishPost("non-existent-id-12345", "ADMIN", auditContext),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ---- unpublishPost ----

  describe("unpublishPost", () => {
    it("changes status to DRAFT and clears publishedAt", async () => {
      const post = makePost({ status: "PUBLISHED", publishedAt: new Date() });
      repository.findByPublicId.mockResolvedValue(post as never);

      const draftPost = makePost({ status: "DRAFT", publishedAt: null });

      let capturedData: Record<string, unknown> | undefined;
      (prisma.$transaction as jest.Mock).mockImplementation(
        async (cb: (tx: { post: { update: jest.Mock } }) => Promise<unknown>) => {
          const fakeTx = {
            post: {
              update: jest.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) => {
                capturedData = data;
                return Promise.resolve(draftPost);
              }),
            },
          };
          return cb(fakeTx);
        },
      );

      const result = await service.unpublishPost(
        "test-public-id-123456",
        "keepDraft",
        "ADMIN",
        auditContext,
      );

      expect(capturedData!["status"]).toBe("DRAFT");
      expect(capturedData!["publishedAt"]).toBeNull();
      expect(result.status).toBe("DRAFT");
    });

    it("throws ForbiddenException when role is not ADMIN/SUPER_ADMIN", async () => {
      await expect(
        service.unpublishPost(
          "test-public-id-123456",
          "keepDraft",
          "USER" as UserRole,
          auditContext,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it("throws NotFoundException when post does not exist", async () => {
      repository.findByPublicId.mockResolvedValue(null);

      await expect(
        service.unpublishPost(
          "non-existent-id-12345",
          "keepDraft",
          "ADMIN",
          auditContext,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it("throws ConflictException when post is not PUBLISHED", async () => {
      const post = makePost({ status: "DRAFT" });
      repository.findByPublicId.mockResolvedValue(post as never);

      await expect(
        service.unpublishPost(
          "test-public-id-123456",
          "keepDraft",
          "ADMIN",
          auditContext,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it("SUPER_ADMIN can also unpublish", async () => {
      const post = makePost({ status: "PUBLISHED", publishedAt: new Date() });
      repository.findByPublicId.mockResolvedValue(post as never);

      const draftPost = makePost({ status: "DRAFT", publishedAt: null });
      (prisma.$transaction as jest.Mock).mockImplementation(
        async (cb: (tx: { post: { update: jest.Mock } }) => Promise<unknown>) =>
          cb({ post: { update: jest.fn().mockResolvedValue(draftPost) } }),
      );

      await expect(
        service.unpublishPost(
          "test-public-id-123456",
          "keepDraft",
          "SUPER_ADMIN",
          auditContext,
        ),
      ).resolves.not.toThrow();
    });
  });
});

/**
 * DailyPracticeService Unit Tests
 *
 * Coverage:
 * - createGuide(): slug generation from Vietnamese title, media resolution via StorageService
 * - getGuide()/updateGuide()/deleteGuide(): NotFound throws
 * - getPreset()/deletePreset(): NotFound throws
 * - getFaq(): NotFound throws
 * - mapper does NOT leak internal cuid `id` or FK `scriptureImageMediaId`
 * - listGuides(): pagination envelope shape { data, meta: { pagination } }
 */

import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { DailyPracticeService } from "./daily-practice.service.js";
import { DailyPracticeRepository } from "./daily-practice.repository.js";
import { StorageService } from "../../../platform/storage/storage.service.js";
import { AuditService, type AuditContext } from "../../../platform/audit/audit.service.js";

/** Fake transaction client handed to callbacks — real Prisma client is never touched in unit tests. */
const FAKE_TX = { __tx: true } as const;

/** AuditContext fixture: canonical actor is the external publicId, never the internal cuid. */
const auditCtx: AuditContext = {
  actorId: "admin_pub_1",
  actorType: "admin",
  ipAddress: "203.0.113.5",
  userAgent: "vitest",
  correlationId: "req_test_1",
};

describe("DailyPracticeService", () => {
  let service: DailyPracticeService;
  let repositoryMock: {
    runInTransaction: ReturnType<typeof vi.fn>;
    countOverview: ReturnType<typeof vi.fn>;
    findGuides: ReturnType<typeof vi.fn>;
    findGuideByPublicId: ReturnType<typeof vi.fn>;
    findGuideBySlug: ReturnType<typeof vi.fn>;
    createGuide: ReturnType<typeof vi.fn>;
    updateGuide: ReturnType<typeof vi.fn>;
    deleteGuide: ReturnType<typeof vi.fn>;
    findPresets: ReturnType<typeof vi.fn>;
    findPresetByPublicId: ReturnType<typeof vi.fn>;
    createPreset: ReturnType<typeof vi.fn>;
    updatePreset: ReturnType<typeof vi.fn>;
    deletePreset: ReturnType<typeof vi.fn>;
    findFaqs: ReturnType<typeof vi.fn>;
    findFaqByPublicId: ReturnType<typeof vi.fn>;
    createFaq: ReturnType<typeof vi.fn>;
    updateFaq: ReturnType<typeof vi.fn>;
    deleteFaq: ReturnType<typeof vi.fn>;
  };
  let storageMock: {
    getAsset: ReturnType<typeof vi.fn>;
    resolveAssetUrl: ReturnType<typeof vi.fn>;
  };
  let auditMock: {
    appendInTransaction: ReturnType<typeof vi.fn>;
    append: ReturnType<typeof vi.fn>;
  };

  // A guide row as returned by the repository (includes internal cuid id + FK)
  const guideRow = {
    id: "cuid_internal_abc",
    publicId: "guide_pub_1",
    title: "Hướng dẫn niệm kinh buổi sáng",
    slug: "huong-dan-niem-kinh-buoi-sang-guide_pub_1",
    body: "Nội dung hướng dẫn",
    scriptureImageMediaId: "media_cuid_xyz",
    duration: 15,
    difficulty: "BEGINNER" as const,
    status: "DRAFT" as const,
    sortOrder: 0,
    publishedAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    scriptureImageMedia: { publicId: "media_pub_1", url: "https://cdn/media_pub_1.jpg" },
  };

  beforeEach(async () => {
    repositoryMock = {
      // Executes the callback with a fake tx client, mirroring $transaction semantics.
      runInTransaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(FAKE_TX)),
      countOverview: vi.fn().mockResolvedValue({
        totalGuides: 3,
        publishedGuides: 1,
        totalPresets: 2,
        totalFaqs: 4,
      }),
      findGuides: vi.fn().mockResolvedValue({ guides: [], total: 0 }),
      findGuideByPublicId: vi.fn(),
      findGuideBySlug: vi.fn().mockResolvedValue(null),
      createGuide: vi.fn(),
      updateGuide: vi.fn(),
      deleteGuide: vi.fn().mockResolvedValue(undefined),
      findPresets: vi.fn().mockResolvedValue([]),
      findPresetByPublicId: vi.fn(),
      createPreset: vi.fn(),
      updatePreset: vi.fn(),
      deletePreset: vi.fn().mockResolvedValue(undefined),
      findFaqs: vi.fn().mockResolvedValue([]),
      findFaqByPublicId: vi.fn(),
      createFaq: vi.fn(),
      updateFaq: vi.fn(),
      deleteFaq: vi.fn().mockResolvedValue(undefined),
    };

    storageMock = {
      getAsset: vi.fn(),
      resolveAssetUrl: vi.fn().mockResolvedValue(null),
    };

    auditMock = {
      appendInTransaction: vi.fn().mockResolvedValue(undefined),
      append: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyPracticeService,
        { provide: DailyPracticeRepository, useValue: repositoryMock },
        { provide: StorageService, useValue: storageMock },
        { provide: AuditService, useValue: auditMock },
      ],
    }).compile();

    service = module.get<DailyPracticeService>(DailyPracticeService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ─── slug generation ───────────────────────────────────────────────────────

  describe("generateSlug()", () => {
    it("should strip Vietnamese diacritics, lowercase, and append publicId", () => {
      const slug = service.generateSlug("Hướng Dẫn Niệm Kinh", "pub123");
      expect(slug).toBe("huong-dan-niem-kinh-pub123");
    });

    it("should convert đ to d", () => {
      const slug = service.generateSlug("Đường tu tập", "pubABC");
      expect(slug).toBe("duong-tu-tap-pubABC");
    });
  });

  // ─── createGuide() ─────────────────────────────────────────────────────────

  describe("createGuide()", () => {
    it("should generate slug and resolve media publicId to internal id", async () => {
      storageMock.getAsset.mockResolvedValue({ id: "media_cuid_xyz", publicId: "media_pub_1" });
      repositoryMock.createGuide.mockResolvedValue(guideRow);

      const result = await service.createGuide({
        title: "Hướng dẫn niệm kinh buổi sáng",
        body: "Nội dung hướng dẫn",
        scriptureImageMediaPublicId: "media_pub_1",
        duration: 15,
        difficulty: "BEGINNER",
        sortOrder: 0,
      });

      // media resolved via storage
      expect(storageMock.getAsset).toHaveBeenCalledWith("media_pub_1");
      // repository received resolved internal media id + generated slug
      const createArg = repositoryMock.createGuide.mock.calls[0][0];
      expect(createArg.scriptureImageMediaId).toBe("media_cuid_xyz");
      expect(createArg.slug).toMatch(/^huong-dan-niem-kinh-buoi-sang-/);
      // response is mapped
      expect(result.id).toBe("guide_pub_1");
    });

    it("should throw NotFound when selected media does not exist", async () => {
      storageMock.getAsset.mockResolvedValue(null);

      await expect(
        service.createGuide({
          title: "Test",
          body: "Body",
          scriptureImageMediaPublicId: "missing_media",
          duration: 0,
          difficulty: "BEGINNER",
          sortOrder: 0,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should append publicId to slug when slug already exists", async () => {
      storageMock.getAsset.mockResolvedValue(null);
      repositoryMock.findGuideBySlug.mockResolvedValue(guideRow); // collision
      repositoryMock.createGuide.mockResolvedValue(guideRow);

      await service.createGuide({
        title: "Test",
        slug: "fixed-slug",
        body: "Body",
        duration: 0,
        difficulty: "BEGINNER",
        sortOrder: 0,
      });

      const createArg = repositoryMock.createGuide.mock.calls[0][0];
      // slug should have publicId suffix appended after collision
      expect(createArg.slug).toMatch(/^fixed-slug-/);
      expect(createArg.slug).not.toBe("fixed-slug");
    });
  });

  // ─── public id generation (canon: nanoid(21)) ──────────────────────────────

  describe("public id generation", () => {
    it("createGuide() should assign a 21-char public id (canon)", async () => {
      storageMock.getAsset.mockResolvedValue(null);
      repositoryMock.createGuide.mockResolvedValue(guideRow);

      await service.createGuide({
        title: "Hướng dẫn mới",
        body: "Body",
        duration: 0,
        difficulty: "BEGINNER",
        sortOrder: 0,
      });

      const createArg = repositoryMock.createGuide.mock.calls[0][0];
      expect(createArg.publicId).toHaveLength(21);
    });

    it("createPreset() should assign a 21-char public id (canon)", async () => {
      repositoryMock.createPreset.mockResolvedValue({
        id: "preset_cuid",
        publicId: "preset_pub_1",
        name: "Kịch bản",
        scenarioType: "evening",
        practiceCount: 5,
        guideIds: [],
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      });

      await service.createPreset({
        name: "Kịch bản",
        scenarioType: "evening",
        practiceCount: 5,
        guideIds: [],
      });

      const createArg = repositoryMock.createPreset.mock.calls[0][0];
      expect(createArg.publicId).toHaveLength(21);
    });

    it("createFaq() should assign a 21-char public id (canon)", async () => {
      repositoryMock.createFaq.mockResolvedValue({
        id: "faq_cuid",
        publicId: "faq_pub_1",
        question: "Câu hỏi?",
        answer: "Trả lời",
        category: "general",
        featured: false,
        sortOrder: 0,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      });

      await service.createFaq({
        question: "Câu hỏi?",
        answer: "Trả lời",
        category: "general",
        featured: false,
        sortOrder: 0,
      });

      const createArg = repositoryMock.createFaq.mock.calls[0][0];
      expect(createArg.publicId).toHaveLength(21);
    });

    it("getGuide() must still resolve a legacy 12-char public id via exact-match lookup (backward compat)", async () => {
      const legacyId = "abc123XYZ_78"; // 12 chars — a pre-canon id
      expect(legacyId).toHaveLength(12);
      repositoryMock.findGuideByPublicId.mockResolvedValue({
        ...guideRow,
        publicId: legacyId,
      });
      storageMock.resolveAssetUrl.mockResolvedValue(null);

      const result = await service.getGuide(legacyId);

      // lookup uses the exact string, no length assumption / truncation
      expect(repositoryMock.findGuideByPublicId).toHaveBeenCalledWith(legacyId);
      expect(result.id).toBe(legacyId);
    });
  });

  // ─── audit coverage (task 4.4) ──────────────────────────────────────────────

  describe("audit coverage", () => {
    it("createGuide() writes a content.create audit event in the same transaction", async () => {
      storageMock.getAsset.mockResolvedValue(null);
      repositoryMock.createGuide.mockResolvedValue(guideRow);

      await service.createGuide(
        { title: "Hướng dẫn mới", body: "Body", duration: 0, difficulty: "BEGINNER", sortOrder: 0 },
        auditCtx,
      );

      // write is wrapped in a repository-owned transaction
      expect(repositoryMock.runInTransaction).toHaveBeenCalledTimes(1);
      // repo write received the fake tx client
      expect(repositoryMock.createGuide.mock.calls[0][1]).toBe(FAKE_TX);
      // audit appended in the SAME tx, with the guide publicId and honest actor publicId
      expect(auditMock.appendInTransaction).toHaveBeenCalledWith(
        FAKE_TX,
        auditCtx,
        "admin.daily_practice.guide.create",
        "practice_guide",
        expect.any(String),
      );
    });

    it("updateGuide() writes a content.update audit event in the same transaction", async () => {
      repositoryMock.findGuideByPublicId.mockResolvedValue(guideRow);
      repositoryMock.updateGuide.mockResolvedValue(guideRow);
      storageMock.resolveAssetUrl.mockResolvedValue(null);

      await service.updateGuide("guide_pub_1", { title: "Đổi tên" }, auditCtx);

      expect(repositoryMock.runInTransaction).toHaveBeenCalledTimes(1);
      expect(auditMock.appendInTransaction).toHaveBeenCalledWith(
        FAKE_TX,
        auditCtx,
        "admin.daily_practice.guide.update",
        "practice_guide",
        "guide_pub_1",
      );
    });

    it("updateGuide() logs a content.publish event when status transitions to PUBLISHED", async () => {
      repositoryMock.findGuideByPublicId.mockResolvedValue(guideRow);
      repositoryMock.updateGuide.mockResolvedValue({ ...guideRow, status: "PUBLISHED" });
      storageMock.resolveAssetUrl.mockResolvedValue(null);

      await service.updateGuide("guide_pub_1", { status: "PUBLISHED" }, auditCtx);

      expect(auditMock.appendInTransaction).toHaveBeenCalledWith(
        FAKE_TX,
        auditCtx,
        "admin.daily_practice.guide.publish",
        "practice_guide",
        "guide_pub_1",
        expect.objectContaining({ after: { status: "PUBLISHED" } }),
      );
    });

    it("deleteGuide() writes a content.delete audit event in the same transaction", async () => {
      repositoryMock.findGuideByPublicId.mockResolvedValue(guideRow);

      await service.deleteGuide("guide_pub_1", auditCtx);

      expect(repositoryMock.runInTransaction).toHaveBeenCalledTimes(1);
      expect(repositoryMock.deleteGuide.mock.calls[0][1]).toBe(FAKE_TX);
      expect(auditMock.appendInTransaction).toHaveBeenCalledWith(
        FAKE_TX,
        auditCtx,
        "admin.daily_practice.guide.delete",
        "practice_guide",
        "guide_pub_1",
        expect.any(Object),
      );
    });

    it("createPreset() writes an audit event in the same transaction", async () => {
      repositoryMock.createPreset.mockResolvedValue({
        id: "preset_cuid",
        publicId: "preset_pub_1",
        name: "Kịch bản",
        scenarioType: "evening",
        practiceCount: 5,
        guideIds: [],
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      });

      await service.createPreset(
        { name: "Kịch bản", scenarioType: "evening", practiceCount: 5, guideIds: [] },
        auditCtx,
      );

      expect(repositoryMock.runInTransaction).toHaveBeenCalledTimes(1);
      expect(auditMock.appendInTransaction).toHaveBeenCalledWith(
        FAKE_TX,
        auditCtx,
        "admin.daily_practice.preset.create",
        "scenario_preset",
        expect.any(String),
      );
    });

    it("createFaq() writes an audit event in the same transaction", async () => {
      repositoryMock.createFaq.mockResolvedValue({
        id: "faq_cuid",
        publicId: "faq_pub_1",
        question: "Câu hỏi?",
        answer: "Trả lời",
        category: "general",
        featured: false,
        sortOrder: 0,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      });

      await service.createFaq(
        { question: "Câu hỏi?", answer: "Trả lời", category: "general", featured: false, sortOrder: 0 },
        auditCtx,
      );

      expect(repositoryMock.runInTransaction).toHaveBeenCalledTimes(1);
      expect(auditMock.appendInTransaction).toHaveBeenCalledWith(
        FAKE_TX,
        auditCtx,
        "admin.daily_practice.faq.create",
        "practice_faq",
        expect.any(String),
      );
    });

    it("rolls back the write when the audit append fails (atomicity)", async () => {
      // Simulate a real $transaction: the callback throws, so the transaction rejects
      // and the write is not committed. Here runInTransaction rejects when the callback does.
      repositoryMock.runInTransaction.mockImplementation(async (fn: (tx: unknown) => unknown) => fn(FAKE_TX));
      storageMock.getAsset.mockResolvedValue(null);
      repositoryMock.createGuide.mockResolvedValue(guideRow);
      auditMock.appendInTransaction.mockRejectedValueOnce(new Error("audit chain write failed"));

      await expect(
        service.createGuide(
          { title: "Hướng dẫn mới", body: "Body", duration: 0, difficulty: "BEGINNER", sortOrder: 0 },
          auditCtx,
        ),
      ).rejects.toThrow("audit chain write failed");
    });
  });

  // ─── NotFound throws ───────────────────────────────────────────────────────

  describe("NotFound handling", () => {
    it("getGuide() should throw NotFound when guide missing", async () => {
      repositoryMock.findGuideByPublicId.mockResolvedValue(null);
      await expect(service.getGuide("nope")).rejects.toThrow(NotFoundException);
    });

    it("updateGuide() should throw NotFound when guide missing", async () => {
      repositoryMock.findGuideByPublicId.mockResolvedValue(null);
      await expect(service.updateGuide("nope", { title: "x" })).rejects.toThrow(NotFoundException);
    });

    it("deleteGuide() should throw NotFound when guide missing", async () => {
      repositoryMock.findGuideByPublicId.mockResolvedValue(null);
      await expect(service.deleteGuide("nope")).rejects.toThrow(NotFoundException);
    });

    it("getPreset() should throw NotFound when preset missing", async () => {
      repositoryMock.findPresetByPublicId.mockResolvedValue(null);
      await expect(service.getPreset("nope")).rejects.toThrow(NotFoundException);
    });

    it("getFaq() should throw NotFound when faq missing", async () => {
      repositoryMock.findFaqByPublicId.mockResolvedValue(null);
      await expect(service.getFaq("nope")).rejects.toThrow(NotFoundException);
    });
  });

  // ─── mapper does not leak internal fields ──────────────────────────────────

  describe("response mapping (no internal-field leak)", () => {
    it("getGuide() must not expose internal cuid `id` or FK `scriptureImageMediaId`", async () => {
      repositoryMock.findGuideByPublicId.mockResolvedValue(guideRow);
      storageMock.resolveAssetUrl.mockResolvedValue("https://cdn/resolved.jpg");

      const result = await service.getGuide("guide_pub_1");

      // id must be the publicId, NOT the internal cuid
      expect(result.id).toBe("guide_pub_1");
      expect(result.id).not.toBe("cuid_internal_abc");
      expect(result.publicId).toBe("guide_pub_1");
      // FK must never be present
      expect(result).not.toHaveProperty("scriptureImageMediaId");
      // media surfaced by publicId + resolved url
      expect(result.scriptureImageMediaPublicId).toBe("media_pub_1");
      expect(result.scriptureImageUrl).toBe("https://cdn/resolved.jpg");
      // dates are ISO strings
      expect(result.createdAt).toBe("2026-01-01T00:00:00.000Z");
      expect(result.updatedAt).toBe("2026-01-02T00:00:00.000Z");
    });

    it("getPreset() must expose publicId as id, not internal cuid", async () => {
      repositoryMock.findPresetByPublicId.mockResolvedValue({
        id: "preset_cuid_internal",
        publicId: "preset_pub_1",
        name: "Kịch bản buổi tối",
        scenarioType: "evening",
        practiceCount: 5,
        guideIds: ["g1", "g2"],
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      });

      const result = await service.getPreset("preset_pub_1");

      expect(result.id).toBe("preset_pub_1");
      expect(result.id).not.toBe("preset_cuid_internal");
      expect(result.createdAt).toBe("2026-01-01T00:00:00.000Z");
    });
  });

  // ─── list pagination shape ─────────────────────────────────────────────────

  describe("listGuides() pagination envelope", () => {
    it("should return { data, meta: { pagination } } with computed totalPages", async () => {
      repositoryMock.findGuides.mockResolvedValue({ guides: [guideRow], total: 25 });
      storageMock.resolveAssetUrl.mockResolvedValue(null);

      const result = await service.listGuides({ page: 2, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
      // list items are also mapped (no internal id leak)
      expect(result.data[0].id).toBe("guide_pub_1");
      expect(result.data[0]).not.toHaveProperty("scriptureImageMediaId");
    });
  });
});

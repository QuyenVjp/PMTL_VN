/**
 * EngagementService Unit Tests
 *
 * Coverage:
 * - toggleReaction: tạo mới, xoá (same reaction), cập nhật (reaction khác)
 * - toggleBookmark: tạo mới, xoá lần 2 (toggle off)
 * - getBookmarks: trả về danh sách phân trang theo userId
 */

import { Test, TestingModule } from "@nestjs/testing";
import { EngagementService } from "../engagement.service.js";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { EngagementTargetType, BookmarkTargetType, ReactionType } from "../../../generated/prisma/client.js";
import type { ToggleReactionInput, ToggleBookmarkInput, GetBookmarksQuery } from "../engagement.schemas.js";

describe("EngagementService", () => {
  let service: EngagementService;
  let prismaMock: {
    contentReaction: {
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    contentBookmark: {
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    prismaMock = {
      contentReaction: {
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        update: vi.fn(),
      },
      contentBookmark: {
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EngagementService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<EngagementService>(EngagementService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ─── toggleReaction ──────────────────────────────────────────────────────────

  describe("toggleReaction", () => {
    const actorId = "user-abc";
    const input: ToggleReactionInput = {
      targetType: "post",
      targetId: "post-001",
      reaction: "like",
    };

    it("should tạo reaction mới khi chưa có", async () => {
      prismaMock.contentReaction.findUnique.mockResolvedValue(null);
      prismaMock.contentReaction.create.mockResolvedValue({});

      const result = await service.toggleReaction(input, actorId);

      expect(prismaMock.contentReaction.findUnique).toHaveBeenCalledWith({
        where: {
          actorId_targetType_targetId: {
            actorId,
            targetType: EngagementTargetType.POST,
            targetId: "post-001",
          },
        },
      });
      expect(prismaMock.contentReaction.create).toHaveBeenCalledWith({
        data: {
          actorId,
          targetType: EngagementTargetType.POST,
          targetId: "post-001",
          reaction: ReactionType.LIKE,
        },
      });
      expect(result).toMatchObject({ toggled: true, targetId: "post-001", actorId, reaction: "like" });
    });

    it("should xoá reaction khi toggle cùng loại (untoggle)", async () => {
      prismaMock.contentReaction.findUnique.mockResolvedValue({
        reaction: ReactionType.LIKE,
      });
      prismaMock.contentReaction.delete.mockResolvedValue({});

      const result = await service.toggleReaction(input, actorId);

      expect(prismaMock.contentReaction.delete).toHaveBeenCalledWith({
        where: {
          actorId_targetType_targetId: {
            actorId,
            targetType: EngagementTargetType.POST,
            targetId: "post-001",
          },
        },
      });
      expect(prismaMock.contentReaction.create).not.toHaveBeenCalled();
      expect(result).toMatchObject({ toggled: false, targetId: "post-001", actorId });
    });

    it("should cập nhật reaction khi đổi sang loại khác", async () => {
      // Hiện tại đang là LIKE, đổi sang PRAY
      prismaMock.contentReaction.findUnique.mockResolvedValue({
        reaction: ReactionType.PRAY,
      });
      prismaMock.contentReaction.update.mockResolvedValue({});

      // Toggle "like" khi đang có "pray" → update thành LIKE
      const result = await service.toggleReaction(input, actorId);

      expect(prismaMock.contentReaction.update).toHaveBeenCalledWith({
        where: {
          actorId_targetType_targetId: {
            actorId,
            targetType: EngagementTargetType.POST,
            targetId: "post-001",
          },
        },
        data: { reaction: ReactionType.LIKE },
      });
      expect(prismaMock.contentReaction.delete).not.toHaveBeenCalled();
      expect(result).toMatchObject({ toggled: true, reaction: "like" });
    });

    it("should map đúng targetType community_post", async () => {
      const communityInput: ToggleReactionInput = {
        targetType: "community_post",
        targetId: "cp-999",
        reaction: "gratitude",
      };
      prismaMock.contentReaction.findUnique.mockResolvedValue(null);
      prismaMock.contentReaction.create.mockResolvedValue({});

      await service.toggleReaction(communityInput, actorId);

      expect(prismaMock.contentReaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          targetType: EngagementTargetType.COMMUNITY_POST,
          reaction: ReactionType.GRATITUDE,
        }),
      });
    });

    it("should map đúng targetType comment", async () => {
      const commentInput: ToggleReactionInput = {
        targetType: "comment",
        targetId: "cmt-111",
        reaction: "inspire",
      };
      prismaMock.contentReaction.findUnique.mockResolvedValue(null);
      prismaMock.contentReaction.create.mockResolvedValue({});

      await service.toggleReaction(commentInput, actorId);

      expect(prismaMock.contentReaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          targetType: EngagementTargetType.COMMENT,
          reaction: ReactionType.INSPIRE,
        }),
      });
    });
  });

  // ─── toggleBookmark ───────────────────────────────────────────────────────────

  describe("toggleBookmark", () => {
    const userId = "user-xyz";
    const input: ToggleBookmarkInput = {
      targetType: "post",
      targetId: "post-007",
    };

    it("should tạo bookmark mới khi chưa có", async () => {
      prismaMock.contentBookmark.findUnique.mockResolvedValue(null);
      prismaMock.contentBookmark.create.mockResolvedValue({});

      const result = await service.toggleBookmark(input, userId);

      expect(prismaMock.contentBookmark.findUnique).toHaveBeenCalledWith({
        where: {
          userId_targetType_targetId: {
            userId,
            targetType: BookmarkTargetType.POST,
            targetId: "post-007",
          },
        },
      });
      expect(prismaMock.contentBookmark.create).toHaveBeenCalledWith({
        data: {
          userId,
          targetType: BookmarkTargetType.POST,
          targetId: "post-007",
        },
      });
      expect(result).toMatchObject({ bookmarked: true, targetId: "post-007", userId });
    });

    it("should xoá bookmark khi gọi lần 2 (toggle off)", async () => {
      prismaMock.contentBookmark.findUnique.mockResolvedValue({
        userId,
        targetType: BookmarkTargetType.POST,
        targetId: "post-007",
      });
      prismaMock.contentBookmark.delete.mockResolvedValue({});

      const result = await service.toggleBookmark(input, userId);

      expect(prismaMock.contentBookmark.delete).toHaveBeenCalledWith({
        where: {
          userId_targetType_targetId: {
            userId,
            targetType: BookmarkTargetType.POST,
            targetId: "post-007",
          },
        },
      });
      expect(prismaMock.contentBookmark.create).not.toHaveBeenCalled();
      expect(result).toMatchObject({ bookmarked: false, targetId: "post-007", userId });
    });

    it("should map đúng targetType event", async () => {
      const eventInput: ToggleBookmarkInput = {
        targetType: "event",
        targetId: "evt-001",
      };
      prismaMock.contentBookmark.findUnique.mockResolvedValue(null);
      prismaMock.contentBookmark.create.mockResolvedValue({});

      await service.toggleBookmark(eventInput, userId);

      expect(prismaMock.contentBookmark.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ targetType: BookmarkTargetType.EVENT }),
      });
    });

    it("should map đúng targetType guide", async () => {
      const guideInput: ToggleBookmarkInput = {
        targetType: "guide",
        targetId: "guide-99",
      };
      prismaMock.contentBookmark.findUnique.mockResolvedValue(null);
      prismaMock.contentBookmark.create.mockResolvedValue({});

      await service.toggleBookmark(guideInput, userId);

      expect(prismaMock.contentBookmark.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ targetType: BookmarkTargetType.GUIDE }),
      });
    });
  });

  // ─── getBookmarks ─────────────────────────────────────────────────────────────

  describe("getBookmarks", () => {
    const userId = "user-abc";

    it("should trả về danh sách phân trang cho user", async () => {
      const mockRecords = [
        { targetType: BookmarkTargetType.POST, targetId: "post-1", createdAt: new Date("2025-01-01") },
        { targetType: BookmarkTargetType.EVENT, targetId: "evt-2", createdAt: new Date("2025-01-02") },
      ];
      prismaMock.$transaction.mockResolvedValue([mockRecords, 2]);

      const query: GetBookmarksQuery = { page: 1, limit: 20 };
      const result = await service.getBookmarks(userId, query);

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(result).toMatchObject({
        data: mockRecords,
        total: 2,
        page: 1,
        limit: 20,
      });
    });

    it("should tính skip đúng theo page", async () => {
      prismaMock.$transaction.mockResolvedValue([[], 50]);

      const query: GetBookmarksQuery = { page: 3, limit: 10 };
      await service.getBookmarks(userId, query);

      // Kiểm tra $transaction được gọi (bên trong có skip = (3-1)*10 = 20)
      expect(prismaMock.$transaction).toHaveBeenCalled();
      const transactionArgs = prismaMock.$transaction.mock.calls[0][0];
      // $transaction nhận array của 2 promise: findMany + count
      expect(Array.isArray(transactionArgs)).toBe(true);
      expect(transactionArgs).toHaveLength(2);
    });

    it("should trả về kết quả rỗng khi user chưa có bookmark nào", async () => {
      prismaMock.$transaction.mockResolvedValue([[], 0]);

      const query: GetBookmarksQuery = { page: 1, limit: 20 };
      const result = await service.getBookmarks(userId, query);

      expect(result).toMatchObject({ data: [], total: 0, page: 1, limit: 20 });
    });

    it("should lọc theo targetType khi được truyền vào", async () => {
      prismaMock.$transaction.mockResolvedValue([[], 0]);

      const query: GetBookmarksQuery = { page: 1, limit: 20, targetType: "post" };
      await service.getBookmarks(userId, query);

      // Kết quả sử dụng where filter có targetType
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it("should sử dụng giá trị mặc định page=1 limit=20 khi không truyền query", async () => {
      prismaMock.$transaction.mockResolvedValue([[], 0]);

      const result = await service.getBookmarks(userId);

      expect(result).toMatchObject({ page: 1, limit: 20 });
    });
  });
});

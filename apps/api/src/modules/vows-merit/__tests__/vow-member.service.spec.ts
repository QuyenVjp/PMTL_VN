/**
 * VowMemberService Unit Tests
 *
 * Coverage:
 * - createVow: tạo bản ghi vow, kiểm tra dữ liệu được truyền đúng
 * - listVows: trả về danh sách phân trang lọc theo userId (và status tuỳ chọn)
 * - fulfillVow: cập nhật status → COMPLETED
 * - updateProgress: tăng currentCount (atomic increment), throw nếu không active
 * - addMeritTransfer: tạo merit transfer, throw khi tổng % vượt 100
 * - getVow: trả về vow, throw NotFoundException nếu không tìm thấy
 */

import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { VowMemberService } from "../vow-member.service.js";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { AuditService } from "../../../platform/audit/audit.service.js";
import type { CreateVowInput, MemberVowQuery, FulfillVowInput, UpdateVowProgressInput, AddMeritTransferInput } from "../vow-member.schemas.js";

// ─── Fixture helpers ──────────────────────────────────────────────────────────

function makeVowRecord(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    publicId: "vow_test_public_id_001",
    userId: "user-abc",
    vowType: "CHANTING",
    description: "Trì niệm 10000 biến",
    targetCount: 10000,
    currentCount: 0,
    status: "ACTIVE",
    startDate: new Date("2025-01-01"),
    endDate: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    meritTransfers: [],
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("VowMemberService", () => {
  let service: VowMemberService;
  let prismaMock: {
    vow: {
      create: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUniqueOrThrow: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
    meritTransfer: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let auditMock: {
    appendInTransaction: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    prismaMock = {
      vow: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      meritTransfer: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      $transaction: vi.fn(async (callback: (tx: typeof prismaMock) => unknown) => callback(prismaMock)),
    };
    auditMock = {
      appendInTransaction: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VowMemberService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: AuditService,
          useValue: auditMock,
        },
      ],
    }).compile();

    service = module.get<VowMemberService>(VowMemberService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ─── createVow ──────────────────────────────────────────────────────────────

  describe("createVow()", () => {
    const userId = "user-abc";
    const input: CreateVowInput = {
      vowType: "CHANTING",
      description: "Trì niệm Đại Bi Chú 10000 biến",
      targetCount: 10000,
      startDate: "2025-01-01",
    };

    it("should tạo vow và trả về DTO đúng cấu trúc", async () => {
      const created = makeVowRecord();
      prismaMock.vow.create.mockResolvedValue(created);

      const result = await service.createVow(input, userId);

      expect(prismaMock.vow.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          vowType: "CHANTING",
          description: "Trì niệm Đại Bi Chú 10000 biến",
          targetCount: 10000,
          currentCount: 0,
          status: "ACTIVE",
        }),
      });
      expect(result).toMatchObject({
        publicId: created.publicId,
        vowType: "CHANTING",
        status: "ACTIVE",
        currentCount: 0,
        targetCount: 10000,
      });
    });

    it("should sinh publicId bằng nanoid (không rỗng, đủ độ dài)", async () => {
      const created = makeVowRecord();
      prismaMock.vow.create.mockResolvedValue(created);

      await service.createVow(input, userId);

      const callData = prismaMock.vow.create.mock.calls[0][0].data;
      expect(typeof callData.publicId).toBe("string");
      expect(callData.publicId.length).toBe(21);
    });

    it("should set targetCount thành null khi không truyền vào", async () => {
      const inputWithoutTarget: CreateVowInput = {
        vowType: "CUSTOM",
        description: "Nguyện không xác định số lượng",
        startDate: "2025-03-01",
      };
      const created = makeVowRecord({ targetCount: null });
      prismaMock.vow.create.mockResolvedValue(created);

      await service.createVow(inputWithoutTarget, userId);

      expect(prismaMock.vow.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ targetCount: null }),
      });
    });

    it("should set endDate đúng khi được truyền vào", async () => {
      const inputWithEnd: CreateVowInput = {
        vowType: "LIFE_RELEASE",
        description: "Phóng sinh 100 con cá",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      };
      const created = makeVowRecord({ endDate: new Date("2025-12-31") });
      prismaMock.vow.create.mockResolvedValue(created);

      await service.createVow(inputWithEnd, userId);

      const callData = prismaMock.vow.create.mock.calls[0][0].data;
      expect(callData.endDate).toBeInstanceOf(Date);
    });

    it("should tính progressPercent = 0 khi currentCount = 0", async () => {
      prismaMock.vow.create.mockResolvedValue(makeVowRecord({ currentCount: 0, targetCount: 100 }));

      const result = await service.createVow(input, userId);

      expect(result.progressPercent).toBe(0);
    });
  });

  // ─── listVows ───────────────────────────────────────────────────────────────

  describe("listVows()", () => {
    const userId = "user-abc";
    const query: MemberVowQuery = { limit: 20, offset: 0 };

    it("should trả về danh sách phân trang với meta đúng", async () => {
      const vows = [makeVowRecord(), makeVowRecord({ publicId: "vow_002", status: "COMPLETED" })];
      prismaMock.vow.findMany.mockResolvedValue(vows);
      prismaMock.vow.count.mockResolvedValue(2);

      const result = await service.listVows(userId, query);

      expect(prismaMock.vow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId },
          skip: 0,
          take: 20,
        }),
      );
      expect(prismaMock.vow.count).toHaveBeenCalledWith({ where: { userId } });
      expect(result.data).toHaveLength(2);
      expect(result.meta.pagination).toMatchObject({
        total: 2,
        limit: 20,
        offset: 0,
        hasMore: false,
      });
    });

    it("should lọc theo status khi được truyền", async () => {
      prismaMock.vow.findMany.mockResolvedValue([makeVowRecord()]);
      prismaMock.vow.count.mockResolvedValue(1);

      const queryWithStatus: MemberVowQuery = { limit: 20, offset: 0, status: "ACTIVE" };
      await service.listVows(userId, queryWithStatus);

      expect(prismaMock.vow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId, status: "ACTIVE" },
        }),
      );
    });

    it("should tính hasMore đúng khi còn trang tiếp theo", async () => {
      prismaMock.vow.findMany.mockResolvedValue([makeVowRecord()]);
      prismaMock.vow.count.mockResolvedValue(25);

      const result = await service.listVows(userId, { limit: 10, offset: 0 });

      expect(result.meta.pagination.hasMore).toBe(true);
    });

    it("should trả về mảng rỗng khi user chưa có nguyện lực nào", async () => {
      prismaMock.vow.findMany.mockResolvedValue([]);
      prismaMock.vow.count.mockResolvedValue(0);

      const result = await service.listVows(userId, query);

      expect(result.data).toHaveLength(0);
      expect(result.meta.pagination.total).toBe(0);
    });

    it("should sắp xếp theo createdAt desc", async () => {
      prismaMock.vow.findMany.mockResolvedValue([]);
      prismaMock.vow.count.mockResolvedValue(0);

      await service.listVows(userId, query);

      expect(prismaMock.vow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: "desc" },
        }),
      );
    });
  });

  // ─── fulfillVow (completeVow) ───────────────────────────────────────────────

  describe("fulfillVow()", () => {
    const userId = "user-abc";
    const input: FulfillVowInput = { publicId: "vow_test_public_id_001" };

    it("should cập nhật status thành COMPLETED", async () => {
      const vowRecord = makeVowRecord();
      prismaMock.vow.findFirst.mockResolvedValue(vowRecord);
      prismaMock.vow.update.mockResolvedValue({ ...vowRecord, status: "COMPLETED" });

      const result = await service.fulfillVow(input, userId);

      expect(prismaMock.vow.update).toHaveBeenCalledWith({
        where: { id: vowRecord.id },
        data: { status: "COMPLETED" },
      });
      expect(result.status).toBe("COMPLETED");
    });

    it("should throw NotFoundException khi publicId không tồn tại", async () => {
      prismaMock.vow.findFirst.mockResolvedValue(null);

      await expect(service.fulfillVow(input, userId)).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException khi vow không ở trạng thái ACTIVE", async () => {
      prismaMock.vow.findFirst.mockResolvedValue(makeVowRecord({ status: "COMPLETED" }));

      await expect(service.fulfillVow(input, userId)).rejects.toThrow(BadRequestException);
    });

    it("should chỉ tìm vow thuộc đúng userId", async () => {
      prismaMock.vow.findFirst.mockResolvedValue(null);

      await expect(service.fulfillVow(input, "another-user")).rejects.toThrow(NotFoundException);

      expect(prismaMock.vow.findFirst).toHaveBeenCalledWith({
        where: { publicId: input.publicId, userId: "another-user" },
      });
    });
  });

  // ─── updateProgress ─────────────────────────────────────────────────────────

  describe("updateProgress()", () => {
    const userId = "user-abc";
    const input: UpdateVowProgressInput = {
      publicId: "vow_test_public_id_001",
      addCount: 500,
    };

    it("should tăng currentCount bằng atomic increment", async () => {
      const vowRecord = makeVowRecord();
      prismaMock.vow.findFirst.mockResolvedValue(vowRecord);
      prismaMock.vow.update.mockResolvedValue({ ...vowRecord, currentCount: 500 });

      const result = await service.updateProgress(input, userId);

      expect(prismaMock.vow.update).toHaveBeenCalledWith({
        where: { id: vowRecord.id },
        data: { currentCount: { increment: 500 } },
      });
      expect(result.currentCount).toBe(500);
    });

    it("should throw NotFoundException khi vow không tồn tại", async () => {
      prismaMock.vow.findFirst.mockResolvedValue(null);

      await expect(service.updateProgress(input, userId)).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException khi vow không ở trạng thái ACTIVE", async () => {
      prismaMock.vow.findFirst.mockResolvedValue(makeVowRecord({ status: "VOIDED" }));

      await expect(service.updateProgress(input, userId)).rejects.toThrow(BadRequestException);
    });

    it("should tính progressPercent đúng sau khi cập nhật", async () => {
      const vowRecord = makeVowRecord({ targetCount: 1000 });
      prismaMock.vow.findFirst.mockResolvedValue(vowRecord);
      prismaMock.vow.update.mockResolvedValue({ ...vowRecord, currentCount: 500 });

      const result = await service.updateProgress(input, userId);

      expect(result.progressPercent).toBe(50);
    });
  });

  // ─── addMeritTransfer ────────────────────────────────────────────────────────

  describe("addMeritTransfer()", () => {
    const userId = "user-abc";
    const input: AddMeritTransferInput = {
      vowPublicId: "vow_test_public_id_001",
      transferPercent: 30,
      targetLabel: "Hồi hướng cho cha mẹ",
    };

    it("should tạo merit transfer khi tổng % không vượt 100", async () => {
      const vowRecord = makeVowRecord();
      prismaMock.vow.findFirst.mockResolvedValue(vowRecord);
      prismaMock.meritTransfer.findMany.mockResolvedValue([
        { transferPercent: 40 },
      ]);
      const createdTransfer = {
        publicId: "transfer_001",
        transferPercent: 30,
        targetLabel: "Hồi hướng cho cha mẹ",
        note: null,
        createdAt: new Date(),
      };
      prismaMock.meritTransfer.create.mockResolvedValue(createdTransfer);

      const result = await service.addMeritTransfer(input, userId);

      expect(prismaMock.meritTransfer.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          vowId: vowRecord.id,
          transferPercent: 30,
          targetLabel: "Hồi hướng cho cha mẹ",
        }),
      });
      expect(result).toMatchObject({
        publicId: "transfer_001",
        transferPercent: 30,
        targetLabel: "Hồi hướng cho cha mẹ",
      });
    });

    it("should throw BadRequestException khi tổng % vượt 100", async () => {
      prismaMock.vow.findFirst.mockResolvedValue(makeVowRecord());
      prismaMock.meritTransfer.findMany.mockResolvedValue([
        { transferPercent: 80 },
      ]);

      // 80 + 30 = 110 > 100 → throw
      await expect(service.addMeritTransfer(input, userId)).rejects.toThrow(BadRequestException);
      expect(prismaMock.meritTransfer.create).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException khi vow không tồn tại", async () => {
      prismaMock.vow.findFirst.mockResolvedValue(null);

      await expect(service.addMeritTransfer(input, userId)).rejects.toThrow(NotFoundException);
    });

    it("should cho phép tổng đúng bằng 100%", async () => {
      prismaMock.vow.findFirst.mockResolvedValue(makeVowRecord());
      prismaMock.meritTransfer.findMany.mockResolvedValue([
        { transferPercent: 70 },
      ]);
      prismaMock.meritTransfer.create.mockResolvedValue({
        publicId: "t-002",
        transferPercent: 30,
        targetLabel: "Hồi hướng chúng sinh",
        note: null,
        createdAt: new Date(),
      });

      // 70 + 30 = 100 → OK, không throw
      await expect(service.addMeritTransfer(input, userId)).resolves.toBeDefined();
    });
  });

  // ─── getVow ──────────────────────────────────────────────────────────────────

  describe("getVow()", () => {
    const userId = "user-abc";
    const publicId = "vow_test_public_id_001";

    it("should trả về vow DTO khi tìm thấy", async () => {
      const vowRecord = makeVowRecord({ meritTransfers: [] });
      prismaMock.vow.findFirst.mockResolvedValue(vowRecord);

      const result = await service.getVow(publicId, userId);

      expect(prismaMock.vow.findFirst).toHaveBeenCalledWith({
        where: { publicId, userId },
        include: { meritTransfers: true },
      });
      expect(result).toMatchObject({ publicId, status: "ACTIVE" });
    });

    it("should throw NotFoundException khi không tìm thấy", async () => {
      prismaMock.vow.findFirst.mockResolvedValue(null);

      await expect(service.getVow(publicId, userId)).rejects.toThrow(NotFoundException);
    });

    it("should bao gồm meritTransfers trong kết quả", async () => {
      const transfers = [
        { publicId: "t-1", transferPercent: 50, targetLabel: "Cha mẹ", note: null, createdAt: new Date() },
      ];
      prismaMock.vow.findFirst.mockResolvedValue(makeVowRecord({ meritTransfers: transfers }));

      const result = await service.getVow(publicId, userId);

      expect(result.meritTransfers).toHaveLength(1);
      expect(result.totalTransferPercent).toBe(50);
    });
  });
});

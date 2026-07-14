/**
 * Little House — Object-level authorization (IDOR) regression tests
 *
 * Threat: a member who knows/guesses another member's `publicId` must NOT be
 * able to read that record or write a recitation into it.
 *
 * Contract (design/03-domains/little-house/CONTRACTS.md): member object routes
 * return 404 when the target does not belong to the caller — existence must not
 * leak. Admin lookups remain unscoped.
 *
 * These tests exercise the REAL repository + REAL service against a Prisma mock
 * that faithfully simulates the `where` filter, so a missing owner predicate is
 * a genuine failure rather than a mock artifact.
 */

import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { LittleHouseService } from "../little-house.service.js";
import { LittleHouseRepository } from "../little-house.repository.js";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { AuditService } from "../../../platform/audit/audit.service.js";
import type { AuditContext } from "../../../platform/audit/audit.service.js";
import type { LogRecitationInput } from "../little-house.schemas.js";

const USER_A = "user-A";
const USER_B = "user-B";

function makeRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "id-A",
    publicId: "lh_recordA",
    userId: USER_A,
    beneficiaryName: "Người thụ hưởng A",
    vowText: "Nguyện văn",
    status: "SIGNED",
    draftedAt: new Date("2026-01-01"),
    signedAt: new Date("2026-01-02"),
    chantedAt: null,
    burnedAt: null,
    cancelledAt: null,
    createdAt: new Date("2026-01-01"),
    user: { publicId: "pub-A", displayName: "A" },
    recitations: [],
    completions: [],
    dottingSessions: [],
    combustionLogs: [],
    fraudLogs: [],
    ...overrides,
  };
}

const auditCtx: AuditContext = {} as AuditContext;

describe("LittleHouse object-level authorization", () => {
  let service: LittleHouseService;
  let recordA: ReturnType<typeof makeRecord>;
  let recordB: ReturnType<typeof makeRecord>;
  let prismaMock: {
    lhRecord: {
      findUnique: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
    };
    lhRecitation: { create: ReturnType<typeof vi.fn> };
  };

  beforeEach(async () => {
    recordA = makeRecord();
    recordB = makeRecord({ id: "id-B", publicId: "lh_recordB", userId: USER_B, user: { publicId: "pub-B", displayName: "B" } });
    const records = [recordA, recordB];

    // findUnique ignores userId (only publicId is unique) — simulates the
    // vulnerable path if the service ever routes through it.
    const findUnique = vi.fn(({ where }: { where: { publicId: string } }) =>
      Promise.resolve(records.find((r) => r.publicId === where.publicId) ?? null),
    );
    // findFirst honours an optional userId predicate — the secure path.
    const findFirst = vi.fn(
      ({ where }: { where: { publicId: string; userId?: string } }) =>
        Promise.resolve(
          records.find(
            (r) => r.publicId === where.publicId && (where.userId === undefined || r.userId === where.userId),
          ) ?? null,
        ),
    );

    prismaMock = {
      lhRecord: { findUnique, findFirst },
      lhRecitation: { create: vi.fn((args: { data: unknown }) => Promise.resolve(args.data)) },
    };

    const auditMock = { append: vi.fn(), appendInTransaction: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LittleHouseService,
        LittleHouseRepository,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuditService, useValue: auditMock },
      ],
    }).compile();

    service = module.get(LittleHouseService);
  });

  afterEach(() => vi.clearAllMocks());

  it("member A reads own record A", async () => {
    const detail = await service.getRecord(recordA.publicId, USER_A);
    expect(detail.id).toBe(recordA.publicId);
  });

  it("member A CANNOT read record B (404, no existence leak)", async () => {
    await expect(service.getRecord(recordB.publicId, USER_A)).rejects.toBeInstanceOf(NotFoundException);
  });

  it("admin (no owner scope) can read record B", async () => {
    const detail = await service.getRecord(recordB.publicId);
    expect(detail.id).toBe(recordB.publicId);
  });

  it("member A CANNOT log a recitation into record B", async () => {
    const input: LogRecitationInput = {
      recitationType: "DA_BEI_ZHOU",
      count: 108,
      sessionDate: new Date("2026-02-01").toISOString(),
    };
    await expect(service.logRecitation(recordB.publicId, input, USER_A, auditCtx)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("member A CAN log a recitation into own record A", async () => {
    const input: LogRecitationInput = {
      recitationType: "DA_BEI_ZHOU",
      count: 108,
      sessionDate: new Date("2026-02-01").toISOString(),
    };
    await expect(service.logRecitation(recordA.publicId, input, USER_A, auditCtx)).resolves.toBeDefined();
  });

  it("member detail does not expose owner email", async () => {
    const detail = await service.getRecord(recordA.publicId, USER_A);
    expect(JSON.stringify(detail)).not.toContain("email");
  });

  it("member lookup passes owner-scoped select without email", async () => {
    await service.getRecord(recordA.publicId, USER_A);
    expect(prismaMock.lhRecord.findFirst).toHaveBeenCalled();
    const call = prismaMock.lhRecord.findFirst.mock.calls.at(-1)?.[0] as {
      where: { publicId: string; userId: string };
      include: { user: { select: Record<string, boolean> } };
    };
    expect(call.where).toEqual({ publicId: recordA.publicId, userId: USER_A });
    expect(call.include.user.select.email).toBeUndefined();
  });

  it("admin lookup uses unscoped findUnique and may include email", async () => {
    await service.getRecord(recordB.publicId);
    expect(prismaMock.lhRecord.findUnique).toHaveBeenCalled();
    const call = prismaMock.lhRecord.findUnique.mock.calls.at(-1)?.[0] as {
      where: { publicId: string };
      include: { user: { select: Record<string, boolean> } };
    };
    expect(call.where).toEqual({ publicId: recordB.publicId });
    expect(call.include.user.select.email).toBe(true);
  });
});

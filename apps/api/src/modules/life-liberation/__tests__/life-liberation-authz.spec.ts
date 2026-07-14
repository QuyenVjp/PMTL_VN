/**
 * Life Liberation — Object-level authorization (IDOR) regression tests
 *
 * Threats:
 * 1. Member detail is unscoped — A can read B's life-release record (incl. email).
 * 2. Proxy mutation does not verify `record.userId === sponsorId` — A can add a
 *    beneficiary to B's PROXY record.
 *
 * Contract: member routes are self-owned. Cross-user access returns 404 so
 * existence and private fields do not leak. Admin detail stays unscoped.
 * Predatory species / habitat guards must keep working.
 */

import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { LifeLiberationService } from "../life-liberation.service.js";
import { LifeLiberationRepository } from "../life-liberation.repository.js";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { AuditService } from "../../../platform/audit/audit.service.js";
import type { AuditContext } from "../../../platform/audit/audit.service.js";
import type { ProxyReleaseInput } from "../life-liberation.schemas.js";

const USER_A = "user-A";
const USER_B = "user-B";

function makeRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "ll-id-A",
    publicId: "ll_recordA",
    userId: USER_A,
    recordType: "PROXY",
    status: "PENDING",
    releaseDate: new Date("2026-03-01"),
    locationName: "Hồ A",
    locationCoords: null,
    merit: null,
    notes: null,
    createdAt: new Date("2026-01-01"),
    user: { publicId: "pub-A", displayName: "A", email: "a@example.com" },
    animals: [{ species: "FISH", quantity: 10, isPredatory: false, sourceLocation: null }],
    proxyItems: [],
    ...overrides,
  };
}

const auditCtx: AuditContext = {} as AuditContext;

describe("LifeLiberation object-level authorization", () => {
  let service: LifeLiberationService;
  let recordA: ReturnType<typeof makeRecord>;
  let recordB: ReturnType<typeof makeRecord>;
  let prismaMock: {
    lifeReleaseRecord: {
      findUnique: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
    };
    proxyLifeRelease: { create: ReturnType<typeof vi.fn> };
    $transaction: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    recordA = makeRecord();
    recordB = makeRecord({
      id: "ll-id-B",
      publicId: "ll_recordB",
      userId: USER_B,
      user: { publicId: "pub-B", displayName: "B", email: "b@example.com" },
    });
    const records = [recordA, recordB];

    const findUnique = vi.fn(({ where }: { where: { publicId: string } }) =>
      Promise.resolve(records.find((r) => r.publicId === where.publicId) ?? null),
    );
    const findFirst = vi.fn(
      ({ where }: { where: { publicId: string; userId?: string } }) =>
        Promise.resolve(
          records.find(
            (r) => r.publicId === where.publicId && (where.userId === undefined || r.userId === where.userId),
          ) ?? null,
        ),
    );

    prismaMock = {
      lifeReleaseRecord: { findUnique, findFirst },
      proxyLifeRelease: {
        create: vi.fn((args: { data: unknown }) => Promise.resolve({ id: "proxy-1", ...(args.data as object) })),
      },
      $transaction: vi.fn(async (cb: (tx: typeof prismaMock) => unknown) => cb(prismaMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LifeLiberationService,
        LifeLiberationRepository,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuditService, useValue: { append: vi.fn(), appendInTransaction: vi.fn() } },
      ],
    }).compile();

    service = module.get(LifeLiberationService);
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

  it("member A CANNOT add a proxy beneficiary to record B", async () => {
    const input: ProxyReleaseInput = {
      beneficiary: "Người thụ hưởng B",
      merit: "Hồi hướng",
      anonymityMode: "full_anonymity",
    };
    await expect(service.addProxyRelease(recordB.publicId, input, USER_A, auditCtx)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prismaMock.proxyLifeRelease.create).not.toHaveBeenCalled();
  });

  it("member A CAN add a proxy beneficiary to own record A", async () => {
    const input: ProxyReleaseInput = {
      beneficiary: "Người thụ hưởng A",
      merit: "Hồi hướng",
      anonymityMode: "full_anonymity",
    };
    await expect(service.addProxyRelease(recordA.publicId, input, USER_A, auditCtx)).resolves.toBeDefined();
  });

  it("member detail does not expose owner email", async () => {
    const detail = await service.getRecord(recordA.publicId, USER_A);
    expect(JSON.stringify(detail)).not.toContain("email");
    expect(JSON.stringify(detail)).not.toContain("a@example.com");
  });

  it("member lookup passes owner-scoped select without email", async () => {
    await service.getRecord(recordA.publicId, USER_A);
    const call = prismaMock.lifeReleaseRecord.findFirst.mock.calls.at(-1)?.[0] as {
      where: { publicId: string; userId: string };
      include: { user: { select: Record<string, boolean> } };
    };
    expect(call.where).toEqual({ publicId: recordA.publicId, userId: USER_A });
    expect(call.include.user.select.email).toBeUndefined();
  });
});

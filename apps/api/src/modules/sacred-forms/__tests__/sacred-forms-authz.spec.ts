/**
 * Sacred Forms — Object-level authorization (IDOR) regression tests
 *
 * Threat: GET /member/sacred-forms/my-applications/:publicId currently resolves
 * by publicId alone, so member A can read member B's application (incl. formData,
 * email, review notes).
 *
 * Contract: my-applications is self-owned. Cross-user access must return 404 so
 * existence and private fields do not leak. Admin detail stays unscoped.
 */

import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { SacredFormsService } from "../sacred-forms.service.js";
import { SacredFormsRepository } from "../sacred-forms.repository.js";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { AuditService } from "../../../platform/audit/audit.service.js";

const USER_A = "user-A";
const USER_B = "user-B";

function makeApplicant(overrides: Record<string, unknown> = {}) {
  return {
    id: "app-id-A",
    publicId: "sf_appA",
    userId: USER_A,
    templateId: "tpl-1",
    status: "PENDING",
    formData: { secret: "private-of-A" },
    reviewNotes: null,
    probationEndsAt: null,
    approvedAt: null,
    rejectedAt: null,
    createdAt: new Date("2026-01-01"),
    template: { publicId: "tpl-pub", titleVi: "Mẫu quy y", formType: "REFUGE_FORM" },
    user: { publicId: "pub-A", displayName: "A", email: "a@example.com" },
    prerequisites: [],
    auditLogs: [],
    ...overrides,
  };
}

describe("SacredForms object-level authorization", () => {
  let service: SacredFormsService;
  let appA: ReturnType<typeof makeApplicant>;
  let appB: ReturnType<typeof makeApplicant>;
  let prismaMock: {
    formApplicant: {
      findUnique: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    appA = makeApplicant();
    appB = makeApplicant({
      id: "app-id-B",
      publicId: "sf_appB",
      userId: USER_B,
      formData: { secret: "private-of-B" },
      user: { publicId: "pub-B", displayName: "B", email: "b@example.com" },
    });
    const apps = [appA, appB];

    const findUnique = vi.fn(({ where }: { where: { publicId: string } }) =>
      Promise.resolve(apps.find((a) => a.publicId === where.publicId) ?? null),
    );
    const findFirst = vi.fn(
      ({ where }: { where: { publicId: string; userId?: string } }) =>
        Promise.resolve(
          apps.find(
            (a) => a.publicId === where.publicId && (where.userId === undefined || a.userId === where.userId),
          ) ?? null,
        ),
    );

    prismaMock = {
      formApplicant: { findUnique, findFirst },
      $transaction: vi.fn(async (cb: (tx: typeof prismaMock) => unknown) => cb(prismaMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SacredFormsService,
        SacredFormsRepository,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuditService, useValue: { append: vi.fn(), appendInTransaction: vi.fn() } },
      ],
    }).compile();

    service = module.get(SacredFormsService);
  });

  afterEach(() => vi.clearAllMocks());

  it("member A reads own application A", async () => {
    const detail = await service.getMyApplicant(appA.publicId, USER_A);
    expect(detail.id).toBe(appA.publicId);
  });

  it("member A CANNOT read application B (404, no existence leak)", async () => {
    await expect(service.getMyApplicant(appB.publicId, USER_A)).rejects.toBeInstanceOf(NotFoundException);
  });

  it("admin (unscoped) can still read application B", async () => {
    const detail = await service.getApplicant(appB.publicId);
    expect(detail.id).toBe(appB.publicId);
  });

  it("cross-user denial does not return B's private formData", async () => {
    try {
      await service.getMyApplicant(appB.publicId, USER_A);
      throw new Error("expected NotFoundException");
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException);
      expect(JSON.stringify(err)).not.toContain("private-of-B");
      expect(JSON.stringify(err)).not.toContain("b@example.com");
    }
  });

  it("member lookup passes owner-scoped select without email", async () => {
    await service.getMyApplicant(appA.publicId, USER_A);
    const call = prismaMock.formApplicant.findFirst.mock.calls.at(-1)?.[0] as {
      where: { publicId: string; userId: string };
      include: { user: { select: Record<string, boolean> } };
    };
    expect(call.where).toEqual({ publicId: appA.publicId, userId: USER_A });
    expect(call.include.user.select.email).toBeUndefined();
  });
});

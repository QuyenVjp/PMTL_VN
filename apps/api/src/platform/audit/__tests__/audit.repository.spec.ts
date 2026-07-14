/**
 * AuditRepository append-only behaviour (unit, mocked Prisma).
 * Proves: advisory lock, sequence chain, no raw IP column, publicId present.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuditRepository } from "../audit.repository.js";
import { AUDIT_CHAIN_LOCK_KEY, computeRowHash } from "../audit-integrity.js";
import type { CreateAuditLogInput } from "../audit.schemas.js";

describe("AuditRepository.create (append-only)", () => {
  let repo: AuditRepository;
  let stored: Array<Record<string, unknown>>;
  let prismaMock: {
    $transaction: ReturnType<typeof vi.fn>;
    $executeRaw: ReturnType<typeof vi.fn>;
    auditLog: {
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    stored = [];
    const tx = {
      $executeRaw: vi.fn(async () => 1),
      auditLog: {
        findFirst: vi.fn(async () => {
          if (stored.length === 0) return null;
          const last = stored[stored.length - 1]!;
          return { sequenceNumber: last.sequenceNumber, rowHash: last.rowHash };
        }),
        create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
          // Reject raw IP if ever present
          if ("ipAddress" in data) {
            throw new Error("raw ipAddress must never be persisted");
          }
          stored.push(data);
          return data;
        }),
      },
    };

    prismaMock = {
      $transaction: vi.fn(async (cb: (t: typeof tx) => unknown) => cb(tx)),
      $executeRaw: tx.$executeRaw,
      auditLog: {
        findFirst: tx.auditLog.findFirst,
        create: tx.auditLog.create,
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    repo = new AuditRepository(prismaMock as any);
  });

  const baseInput = (): CreateAuditLogInput => ({
    actorType: "user",
    actorId: "u1",
    action: "auth.login",
    resource: "session",
    resourceId: "sess-1",
    ipAddressHash: "a".repeat(64),
    userAgent: "vitest",
    correlationId: "req_1",
    metadata: { origin: "admin" },
  });

  it("takes advisory lock then inserts genesis row with seq=1", async () => {
    const row = await repo.create(baseInput());
    expect(prismaMock.$transaction).toHaveBeenCalledOnce();
    expect(row.sequenceNumber).toBe(1n);
    expect(row.previousHash).toBeNull();
    expect(row.publicId).toEqual(expect.any(String));
    expect(String(row.publicId).length).toBe(21);
    expect(row.rowHash).toMatch(/^[a-f0-9]{64}$/);
    expect(row).not.toHaveProperty("ipAddress");
  });

  it("chains previousHash across consecutive appends", async () => {
    const a = await repo.create(baseInput());
    const b = await repo.create({ ...baseInput(), action: "auth.logout" });

    expect(b.sequenceNumber).toBe(2n);
    expect(b.previousHash).toBe(a.rowHash);

    // Recompute hash for A matches stored
    const recomputedA = computeRowHash(
      1n,
      null,
      {
        actorType: "user",
        actorId: "u1",
        action: "auth.login",
        resource: "session",
        resourceId: "sess-1",
        publicId: a.publicId as string,
        correlationId: "req_1",
        metadata: { origin: "admin" },
        ipAddressHash: "a".repeat(64),
        userAgent: "vitest",
      },
      a.createdAt as Date,
    );
    expect(recomputedA).toBe(a.rowHash);
  });

  it("createInTransaction uses the provided client (no nested $transaction)", async () => {
    const tx = {
      $executeRaw: vi.fn(async () => 1),
      auditLog: {
        findFirst: vi.fn(async () => null),
        create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => data),
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await repo.createInTransaction(tx as any, baseInput());
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(tx.$executeRaw).toHaveBeenCalled();
    expect(tx.auditLog.create).toHaveBeenCalledOnce();
  });

  it("lock key is the documented constant", () => {
    expect(AUDIT_CHAIN_LOCK_KEY).toBe("pmtl.audit_chain");
  });
});

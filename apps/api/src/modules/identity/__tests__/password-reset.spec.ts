/**
 * Password-reset security unit tests (review reopen 2026-07-13).
 *
 * Covers:
 * - expired / used / invalid token
 * - sequential replay
 * - concurrent claim (conditional updateMany count !== 1)
 * - concurrent forgot serialization path (advisory lock + invalidate)
 * - no plain-token logging
 * - admin vs member audience routing into EmailService
 * - audit uses publicId not internal id
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { IdentityService } from "../identity.service.js";

type Tx = {
  $executeRaw: ReturnType<typeof vi.fn>;
  passwordResetToken: {
    updateMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
  };
  user: { update: ReturnType<typeof vi.fn> };
  session: { updateMany: ReturnType<typeof vi.fn> };
};

function makeService(opts?: {
  user?: { id: string; publicId: string; email: string; role: string } | null;
  resetToken?: {
    id: string;
    userId: string;
    tokenHash: string;
    usedAt: Date | null;
    expiresAt: Date;
    user: { publicId: string };
  } | null;
  claimCount?: number;
}) {
  const tx: Tx = {
    $executeRaw: vi.fn().mockResolvedValue(undefined),
    passwordResetToken: {
      updateMany: vi.fn().mockImplementation(async (args: { data?: { usedAt?: Date }; where?: { usedAt?: null } }) => {
        // First updateMany in reset = claim; later ones = sibling invalidate
        if (args.where && "tokenHash" in (args.where as object)) {
          return { count: opts?.claimCount ?? 1 };
        }
        return { count: 1 };
      }),
      create: vi.fn().mockResolvedValue({ id: "tok1" }),
      findUnique: vi.fn().mockResolvedValue(opts?.resetToken ?? null),
    },
    user: { update: vi.fn().mockResolvedValue({}) },
    session: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
  };

  const prisma = {
    user: {
      findUnique: vi.fn().mockResolvedValue(opts?.user ?? null),
    },
    passwordResetToken: {
      findUnique: vi.fn().mockResolvedValue(opts?.resetToken ?? null),
    },
    $transaction: vi.fn(async (fn: (t: Tx) => Promise<unknown>) => fn(tx)),
  };

  const config = {
    emailProvider: "log",
  };

  const emailService = {
    dispatchPasswordReset: vi.fn(),
  };

  const audit = {
    appendInTransaction: vi.fn().mockResolvedValue(undefined),
  };

  const sessions = {};
  const tracing = {};

  const service = new IdentityService(
    prisma as never,
    config as never,
    sessions as never,
    audit as never,
    tracing as never,
    emailService as never,
  );

  const logger = { log: vi.fn(), error: vi.fn(), warn: vi.fn() };
  (service as unknown as { logger: typeof logger }).logger = logger;

  return { service, prisma, tx, emailService, audit, logger };
}

describe("IdentityService.requestPasswordReset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("anti-enumeration: unknown email still returns success and sends nothing", async () => {
    const { service, emailService, prisma } = makeService({ user: null });
    const result = await service.requestPasswordReset({ email: "ghost@x.com" });
    expect(result).toEqual({ success: true });
    expect(emailService.dispatchPasswordReset).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("admin user → audience admin; no plain token in logs", async () => {
    const { service, emailService, logger, tx, audit } = makeService({
      user: {
        id: "cuid_1",
        publicId: "pub_admin_1",
        email: "admin@pmtl.vn",
        role: "ADMIN",
      },
    });

    await service.requestPasswordReset({ email: "admin@pmtl.vn" });

    expect(tx.$executeRaw).toHaveBeenCalled();
    expect(tx.passwordResetToken.updateMany).toHaveBeenCalled();
    expect(tx.passwordResetToken.create).toHaveBeenCalled();
    expect(emailService.dispatchPasswordReset).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "admin@pmtl.vn",
        audience: "admin",
        token: expect.any(String),
      }),
    );
    // Audit actor/resource use publicId
    expect(audit.appendInTransaction).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ actorId: "pub_admin_1", actorType: "user" }),
      "auth.password_reset_request",
      "user",
      "pub_admin_1",
    );

    const logPayloads = logger.log.mock.calls.map((c) => JSON.stringify(c[0]));
    for (const p of logPayloads) {
      expect(p).not.toMatch(/"token":"[a-f0-9]{20,}/);
      // token value from dispatch must not leak into identity logger
      const token = (emailService.dispatchPasswordReset.mock.calls[0]?.[0] as { token: string }).token;
      expect(p).not.toContain(token);
    }
  });

  it("member user → audience member", async () => {
    const { service, emailService } = makeService({
      user: {
        id: "cuid_m",
        publicId: "pub_m",
        email: "member@pmtl.vn",
        role: "MEMBER",
      },
    });
    await service.requestPasswordReset({ email: "Member@PMTL.vn" });
    expect(emailService.dispatchPasswordReset).toHaveBeenCalledWith(
      expect.objectContaining({ audience: "member" }),
    );
  });

  it("SUPER_ADMIN → audience admin", async () => {
    const { service, emailService } = makeService({
      user: {
        id: "cuid_s",
        publicId: "pub_s",
        email: "super@pmtl.vn",
        role: "SUPER_ADMIN",
      },
    });
    await service.requestPasswordReset({ email: "super@pmtl.vn" });
    expect(emailService.dispatchPasswordReset).toHaveBeenCalledWith(
      expect.objectContaining({ audience: "admin" }),
    );
  });
});

describe("IdentityService.resetPassword", () => {
  const validToken = {
    id: "rt1",
    userId: "cuid_u",
    tokenHash: "will-be-overridden-by-hash-of-input",
    usedAt: null,
    expiresAt: new Date(Date.now() + 60_000),
    user: { publicId: "pub_u" },
  };

  it("invalid token → BadRequest", async () => {
    const { service } = makeService({ resetToken: null });
    await expect(
      service.resetPassword({ token: "nope", password: "NewPass1!" }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("expired token → BadRequest", async () => {
    const { service } = makeService({
      resetToken: {
        ...validToken,
        expiresAt: new Date(Date.now() - 1000),
      },
    });
    await expect(
      service.resetPassword({ token: "expired", password: "NewPass1!" }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("used token → BadRequest", async () => {
    const { service } = makeService({
      resetToken: {
        ...validToken,
        usedAt: new Date(),
      },
    });
    await expect(
      service.resetPassword({ token: "used", password: "NewPass1!" }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("concurrent second claim (updateMany count 0) → BadRequest", async () => {
    const { service } = makeService({
      resetToken: { ...validToken },
      claimCount: 0,
    });
    await expect(
      service.resetPassword({ token: "race", password: "NewPass1!" }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("happy path: claim + sibling invalidate + password + sessions + audit", async () => {
    const { service, tx, audit } = makeService({
      resetToken: { ...validToken },
      claimCount: 1,
    });

    const result = await service.resetPassword({
      token: "good-token",
      password: "NewPass1!",
    });
    expect(result).toEqual({ success: true });

    // claim + sibling invalidate
    expect(tx.passwordResetToken.updateMany).toHaveBeenCalled();
    expect(tx.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "cuid_u" },
        data: expect.objectContaining({ passwordHash: expect.any(String) }),
      }),
    );
    expect(tx.session.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "cuid_u", revokedAt: null },
      }),
    );
    expect(audit.appendInTransaction).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ actorId: "pub_u" }),
      "auth.password_reset_complete",
      "user",
      "pub_u",
      { field: "password" },
    );
  });

  it("sequential replay: second call sees usedAt and fails", async () => {
    let usedAt: Date | null = null;
    const { service, tx } = makeService({
      resetToken: {
        ...validToken,
        get usedAt() {
          return usedAt;
        },
      } as never,
      claimCount: 1,
    });

    // After first success, mark used
    tx.passwordResetToken.updateMany.mockImplementation(async (args: { where?: { usedAt?: null }; data?: { usedAt?: Date } }) => {
      if (args.where && "tokenHash" in (args.where as object)) {
        if (usedAt) return { count: 0 };
        usedAt = new Date();
        return { count: 1 };
      }
      return { count: 0 };
    });
    // findUnique reflects usedAt after first claim
    tx.passwordResetToken.findUnique.mockImplementation(async () => ({
      ...validToken,
      usedAt,
    }));

    await expect(
      service.resetPassword({ token: "good", password: "NewPass1!" }),
    ).resolves.toEqual({ success: true });

    await expect(
      service.resetPassword({ token: "good", password: "NewPass1!" }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

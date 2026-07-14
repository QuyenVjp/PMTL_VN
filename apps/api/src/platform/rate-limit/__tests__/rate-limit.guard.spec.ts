import { describe, expect, it, vi, beforeEach } from "vitest";
import { HttpException } from "@nestjs/common";
import { RateLimitGuard } from "../rate-limit.guard.js";

function makeGuard(opts?: {
  allowed?: boolean | ((key: string) => boolean);
  salt?: string;
}) {
  const allowedFn =
    typeof opts?.allowed === "function"
      ? opts.allowed
      : () => opts?.allowed ?? true;

  const rateLimitService = {
    checkLimit: vi.fn(async (key: string) => ({
      allowed: allowedFn(key),
      remaining: allowedFn(key) ? 3 : 0,
      resetAt: new Date(Date.now() + 60_000),
    })),
  };
  const reflector = {
    getAllAndOverride: vi.fn(),
  };
  const config = {
    auditIpSalt: opts?.salt ?? "test-salt-for-rate-limit-email-hashing",
  };

  const guard = new RateLimitGuard(
    reflector as never,
    rateLimitService as never,
    config as never,
  );
  return { guard, rateLimitService, reflector, config };
}

function makeContext(request: Record<string, unknown>) {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as never;
}

describe("RateLimitGuard — dual bucket for forgot password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forgot_password checks IP bucket and hashed-email bucket", async () => {
    const { guard, rateLimitService, reflector } = makeGuard({ allowed: true });
    reflector.getAllAndOverride.mockReturnValue("auth.forgot_password");

    const req = {
      ip: "203.0.113.10",
      headers: {},
      body: { email: "Admin@Example.COM " },
      socket: {},
    };

    await expect(guard.canActivate(makeContext(req))).resolves.toBe(true);

    const keys = rateLimitService.checkLimit.mock.calls.map((c) => c[0] as string);
    expect(keys).toHaveLength(2);
    expect(keys[0]).toBe("ip:203.0.113.10");
    expect(keys[1]).toMatch(/^email:[a-f0-9]{64}$/);
    // Raw email must never appear in the key
    expect(keys[1]).not.toContain("Admin");
    expect(keys[1]).not.toContain("example.com");
    expect(keys[1]).not.toContain("@");
  });

  it("email normalization: same mailbox → same hashed key", () => {
    const { guard } = makeGuard();
    const a = guard.hashEmailKey("  User@Example.com ");
    const b = guard.hashEmailKey("user@example.com");
    expect(a).toBe(b);
    expect(a).toMatch(/^email:[a-f0-9]{64}$/);
  });

  it("different emails → different hashed keys", () => {
    const { guard } = makeGuard();
    expect(guard.hashEmailKey("a@x.com")).not.toBe(guard.hashEmailKey("b@x.com"));
  });

  it("one denied bucket blocks the request (email budget exhausted)", async () => {
    const { guard, rateLimitService, reflector } = makeGuard({
      allowed: (key) => !key.startsWith("email:"),
    });
    reflector.getAllAndOverride.mockReturnValue("auth.forgot_password");

    const req = {
      ip: "203.0.113.10",
      headers: {},
      body: { email: "victim@example.com" },
      socket: {},
    };

    await expect(guard.canActivate(makeContext(req))).rejects.toBeInstanceOf(HttpException);
    // Both buckets still checked (IP + email) so counters tick
    expect(rateLimitService.checkLimit).toHaveBeenCalledTimes(2);
  });

  it("IP budget denied blocks even when email bucket is free", async () => {
    const { guard, reflector } = makeGuard({
      allowed: (key) => !key.startsWith("ip:"),
    });
    reflector.getAllAndOverride.mockReturnValue("auth.forgot_password");

    const req = {
      ip: "203.0.113.99",
      headers: {},
      body: { email: "ok@example.com" },
      socket: {},
    };

    await expect(guard.canActivate(makeContext(req))).rejects.toMatchObject({
      status: 429,
    });
  });

  it("reset_password uses only IP bucket (no email dual-check)", async () => {
    const { guard, rateLimitService, reflector } = makeGuard({ allowed: true });
    reflector.getAllAndOverride.mockReturnValue("auth.reset_password");

    const req = {
      ip: "198.51.100.1",
      headers: {},
      body: { token: "abc", password: "x" },
      socket: {},
    };

    await expect(guard.canActivate(makeContext(req))).resolves.toBe(true);
    const keys = rateLimitService.checkLimit.mock.calls.map((c) => c[0] as string);
    expect(keys).toEqual(["ip:198.51.100.1"]);
  });

  it("authenticated request uses user:{id} key", async () => {
    const { guard, rateLimitService, reflector } = makeGuard({ allowed: true });
    reflector.getAllAndOverride.mockReturnValue("auth.login");

    const req = {
      user: { id: "cuid_user_1" },
      ip: "1.2.3.4",
      headers: {},
      body: {},
      socket: {},
    };

    await expect(guard.canActivate(makeContext(req))).resolves.toBe(true);
    expect(rateLimitService.checkLimit.mock.calls[0]?.[0]).toBe("user:cuid_user_1");
  });

  it("no endpoint decorator → allow without checking", async () => {
    const { guard, rateLimitService, reflector } = makeGuard();
    reflector.getAllAndOverride.mockReturnValue(undefined);
    await expect(guard.canActivate(makeContext({ headers: {}, socket: {} }))).resolves.toBe(true);
    expect(rateLimitService.checkLimit).not.toHaveBeenCalled();
  });
});

/**
 * After successful password reset the controller must clear access/refresh/CSRF cookies
 * with the same domain/path/sameSite/secure policy as logout.
 */
import { describe, expect, it, vi } from "vitest";
import { IdentityController } from "../identity.controller.js";

describe("IdentityController.resetPassword cookie clear", () => {
  it("clears access, refresh, and csrf cookies on success", async () => {
    const identityService = {
      resetPassword: vi.fn().mockResolvedValue({ success: true }),
    };
    const configService = {
      cookieSecure: true,
      cookieDomain: ".pmtl.local",
      accessTokenTtlMinutes: 15,
      refreshTokenTtlDays: 7,
    };

    const controller = new IdentityController(
      identityService as never,
      configService as never,
    );

    const res = {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    };

    const result = await controller.resetPassword(
      { token: "t", password: "NewPass1!" },
      res as never,
    );

    expect(result).toEqual({ success: true });
    expect(identityService.resetPassword).toHaveBeenCalledWith({
      token: "t",
      password: "NewPass1!",
    });

    const cleared = res.clearCookie.mock.calls.map((c) => c[0] as string);
    expect(cleared).toEqual(
      expect.arrayContaining(["pmtl_access", "pmtl_refresh", "csrf_token"]),
    );
    expect(cleared).toHaveLength(3);

    // Policy matches logout: path /, sameSite strict, secure, domain
    for (const call of res.clearCookie.mock.calls) {
      const options = call[1] as {
        path: string;
        sameSite: string;
        secure: boolean;
        domain?: string;
      };
      expect(options.path).toBe("/");
      expect(options.sameSite).toBe("strict");
      expect(options.secure).toBe(true);
      expect(options.domain).toBe(".pmtl.local");
    }
  });

  it("does not clear cookies when reset throws", async () => {
    const identityService = {
      resetPassword: vi.fn().mockRejectedValue(new Error("Token không hợp lệ hoặc đã hết hạn")),
    };
    const configService = {
      cookieSecure: false,
      cookieDomain: "",
      accessTokenTtlMinutes: 15,
      refreshTokenTtlDays: 7,
    };
    const controller = new IdentityController(
      identityService as never,
      configService as never,
    );
    const res = { clearCookie: vi.fn(), cookie: vi.fn() };

    await expect(
      controller.resetPassword({ token: "bad", password: "NewPass1!" }, res as never),
    ).rejects.toThrow();
    expect(res.clearCookie).not.toHaveBeenCalled();
  });
});

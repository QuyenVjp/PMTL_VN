import { describe, expect, it, vi, beforeEach } from "vitest";
import { EmailService } from "../email.service.js";

function makeConfig(overrides: { webOrigin?: string; adminOrigin?: string; emailProvider?: string } = {}) {
  return {
    webOrigin: overrides.webOrigin ?? "https://web.pmtl.local",
    adminOrigin: overrides.adminOrigin ?? "https://admin.pmtl.local",
    emailProvider: overrides.emailProvider ?? "log",
  };
}

function makeService(
  overrides: { webOrigin?: string; adminOrigin?: string; emailProvider?: string } = {},
) {
  const config = makeConfig(overrides);
  const logProvider = { send: vi.fn().mockResolvedValue(undefined) };
  const smtpProvider = { send: vi.fn().mockResolvedValue(undefined) };
  const resendProvider = { send: vi.fn().mockResolvedValue(undefined) };
  const service = new EmailService(
    config as never,
    logProvider as never,
    smtpProvider as never,
    resendProvider as never,
  );
  return { service, logProvider, smtpProvider, resendProvider };
}

describe("EmailService password reset URL owner", () => {
  it("admin audience → ADMIN_ORIGIN /auth/dat-lai-mat-khau?token=...", () => {
    const { service } = makeService();
    const url = service.buildResetPasswordUrl("tok_admin_1", "admin");
    expect(url).toBe(
      "https://admin.pmtl.local/auth/dat-lai-mat-khau?token=tok_admin_1",
    );
  });

  it("member audience → WEB_ORIGIN /dat-lai-mat-khau?token=... (design AUTH_UX_CONTRACT)", () => {
    const { service } = makeService();
    const url = service.buildResetPasswordUrl("tok_member_1", "member");
    expect(url).toBe(
      "https://web.pmtl.local/dat-lai-mat-khau?token=tok_member_1",
    );
  });

  it("never uses WEB_ORIGIN for admin audience", () => {
    const { service } = makeService({
      webOrigin: "https://web.should-not-appear",
      adminOrigin: "https://admin.only",
    });
    const url = service.buildResetPasswordUrl("t", "admin");
    expect(url).toContain("https://admin.only/");
    expect(url).not.toContain("web.should-not-appear");
    expect(url).toContain("/auth/dat-lai-mat-khau");
  });

  it("never uses English /reset-password path", () => {
    const { service } = makeService();
    expect(service.buildResetPasswordUrl("t", "admin")).not.toContain("/reset-password");
    expect(service.buildResetPasswordUrl("t", "member")).not.toContain("/reset-password");
  });

  it("sendPasswordReset builds audience-correct URL into message body", async () => {
    const { service, logProvider } = makeService();
    await service.sendPasswordReset({
      email: "admin@example.com",
      token: "secret_token",
      audience: "admin",
    });
    expect(logProvider.send).toHaveBeenCalledOnce();
    const call = logProvider.send.mock.calls[0]?.[0] as {
      to: string;
      text: string;
      html: string;
    };
    expect(call.to).toBe("admin@example.com");
    expect(call.text).toContain(
      "https://admin.pmtl.local/auth/dat-lai-mat-khau?token=secret_token",
    );
    expect(call.html).toContain(
      "https://admin.pmtl.local/auth/dat-lai-mat-khau?token=secret_token",
    );
  });

  it("dispatchPasswordReset does not log token or reset URL", () => {
    const { service } = makeService();
    const logSpy = vi.spyOn((service as unknown as { logger: { log: (o: unknown) => void } }).logger, "log");
    // Access private logger via reflection on Nest Logger — re-stub by wrapping send
    // Safer: intercept by replacing logger property if present
    const fakeLogger = { log: vi.fn(), error: vi.fn() };
    (service as unknown as { logger: typeof fakeLogger }).logger = fakeLogger;

    service.dispatchPasswordReset({
      email: "a@b.c",
      token: "PLAIN_TOKEN_MUST_NOT_APPEAR",
      audience: "member",
    });

    const payloads = fakeLogger.log.mock.calls.map((c) => JSON.stringify(c[0]));
    for (const p of payloads) {
      expect(p).not.toContain("PLAIN_TOKEN_MUST_NOT_APPEAR");
      expect(p).not.toContain("token=");
      expect(p).not.toContain("/dat-lai-mat-khau");
    }
    expect(fakeLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: "email.outbox.dispatch",
        lane: "auth.password_reset",
        audience: "member",
        to: "a@b.c",
      }),
    );
  });
});

describe("EmailService provider selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses log provider by default", async () => {
    const { service, logProvider, smtpProvider } = makeService({ emailProvider: "log" });
    await service.sendPasswordReset({
      email: "m@x.com",
      token: "t",
      audience: "member",
    });
    expect(logProvider.send).toHaveBeenCalled();
    expect(smtpProvider.send).not.toHaveBeenCalled();
  });
});

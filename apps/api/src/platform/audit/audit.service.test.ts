import { describe, expect, it } from "vitest";

import { buildAuditLogInput, type AuditContext } from "./audit.service.js";
import { hashIpAddress } from "./audit-integrity.js";

const SALT = "test-salt-16chars!";

describe("buildAuditLogInput", () => {
  it("omits undefined optional fields", () => {
    const context: AuditContext = {
      actorType: "user",
    };

    const input = buildAuditLogInput(context, "auth.login", "session", "session-1", undefined, SALT);

    expect(input).toEqual({
      actorType: "user",
      action: "auth.login",
      resource: "session",
      resourceId: "session-1",
    });
  });

  it("hashes IP and never includes raw ipAddress in the create payload", () => {
    const context: AuditContext = {
      actorId: "u1",
      actorType: "user",
      ipAddress: "127.0.0.1",
      userAgent: "vitest",
      correlationId: "req_abc",
    };

    const input = buildAuditLogInput(context, "auth.login", "session", "session-1", {
      foo: "bar",
    }, SALT);

    expect(input).toEqual({
      actorId: "u1",
      actorType: "user",
      action: "auth.login",
      resource: "session",
      resourceId: "session-1",
      metadata: { foo: "bar" },
      ipAddressHash: hashIpAddress("127.0.0.1", SALT),
      userAgent: "vitest",
      correlationId: "req_abc",
    });
    expect(input).not.toHaveProperty("ipAddress");
    expect(JSON.stringify(input)).not.toContain("127.0.0.1");
  });

  it("recursively redacts sensitive metadata before persistence", () => {
    const context: AuditContext = { actorType: "admin", actorId: "pub_admin" };
    const input = buildAuditLogInput(
      context,
      "user.update",
      "user",
      "pub_user",
      {
        password: "nope",
        nested: { resetToken: "t", note: "ok" },
        list: [{ accessToken: "x", n: 1 }],
      },
      SALT,
    );
    expect(input.metadata).toEqual({
      list: [{ n: 1 }],
      nested: { note: "ok" },
    });
    expect(JSON.stringify(input)).not.toMatch(/password|token/i);
  });

  it("skips IP hash when salt is missing even if raw IP is present", () => {
    const context: AuditContext = {
      actorType: "user",
      ipAddress: "203.0.113.9",
    };
    const input = buildAuditLogInput(context, "auth.login", "session");
    expect(input.ipAddressHash).toBeUndefined();
    expect(input).not.toHaveProperty("ipAddress");
  });
});

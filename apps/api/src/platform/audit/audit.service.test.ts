import { describe, expect, it } from "vitest";

import { buildAuditLogInput, type AuditContext } from "./audit.service.js";

describe("buildAuditLogInput", () => {
  it("omits undefined optional fields", () => {
    const context: AuditContext = {
      actorType: "user",
    };

    const input = buildAuditLogInput(context, "auth.login", "session", "session-1");

    expect(input).toEqual({
      actorType: "user",
      action: "auth.login",
      resource: "session",
      resourceId: "session-1",
    });
  });

  it("keeps metadata when provided", () => {
    const context: AuditContext = {
      actorId: "u1",
      actorType: "user",
      ipAddress: "127.0.0.1",
    };

    const input = buildAuditLogInput(context, "auth.login", "session", "session-1", {
      foo: "bar",
    });

    expect(input).toEqual({
      actorId: "u1",
      actorType: "user",
      action: "auth.login",
      resource: "session",
      resourceId: "session-1",
      metadata: { foo: "bar" },
      ipAddress: "127.0.0.1",
    });
  });
});

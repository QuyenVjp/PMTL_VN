import { describe, expect, it } from "vitest";

import { resolveDevAdminSeedConfig } from "./dev-admin-seed-config.js";

describe("resolveDevAdminSeedConfig", () => {
  it("enables admin seeding by default in development", () => {
    const config = resolveDevAdminSeedConfig({
      PMTL_APP_ENV: "dev",
    });

    expect(config.enabled).toBe(true);
    expect(config.email).toBe("admin@pmtl.local");
    expect(config.password).toBe("PmtlAdmin!123");
    expect(config.displayName).toBe("PMTL Admin");
    expect(config.role).toBe("SUPER_ADMIN");
  });

  it("disables admin seeding by default in production", () => {
    const config = resolveDevAdminSeedConfig({
      PMTL_APP_ENV: "prod",
    });

    expect(config.enabled).toBe(false);
  });

  it("throws when role is invalid", () => {
    expect(() =>
      resolveDevAdminSeedConfig({
        PMTL_APP_ENV: "dev",
        SEED_ADMIN_ROLE: "OWNER",
      }),
    ).toThrow("SEED_ADMIN_ROLE must be ADMIN or SUPER_ADMIN");
  });
});

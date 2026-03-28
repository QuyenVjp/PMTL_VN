import type { UserRole } from "../../generated/prisma/client.js";

export interface DevAdminSeedConfig {
  enabled: boolean;
  email: string;
  password: string;
  displayName: string;
  role: Extract<UserRole, "ADMIN" | "SUPER_ADMIN">;
}

type EnvMap = Record<string, string | undefined>;

const DEFAULT_EMAIL = "admin@pmtl.local";
const DEFAULT_PASSWORD = "PmtlAdmin!123";
const DEFAULT_DISPLAY_NAME = "PMTL Admin";
const DEFAULT_ROLE: DevAdminSeedConfig["role"] = "SUPER_ADMIN";

function readFlag(value: string | undefined): boolean | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true;
  }
  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false;
  }

  throw new Error("SEED_ADMIN_ENABLED must be true or false");
}

function getDefaultEnabled(env: EnvMap): boolean {
  const appEnv = (env.PMTL_APP_ENV ?? env.NODE_ENV ?? "development").toLowerCase();
  return appEnv !== "prod" && appEnv !== "production";
}

function normalizeRole(value: string | undefined): DevAdminSeedConfig["role"] {
  const normalized = value?.trim().toUpperCase();

  if (!normalized || normalized === "SUPER_ADMIN") {
    return "SUPER_ADMIN";
  }

  if (normalized === "ADMIN") {
    return "ADMIN";
  }

  throw new Error("SEED_ADMIN_ROLE must be ADMIN or SUPER_ADMIN");
}

export function resolveDevAdminSeedConfig(env: EnvMap = process.env): DevAdminSeedConfig {
  const enabled = readFlag(env.SEED_ADMIN_ENABLED) ?? getDefaultEnabled(env);
  const email = (env.SEED_ADMIN_EMAIL ?? DEFAULT_EMAIL).trim().toLowerCase();
  const password = (env.SEED_ADMIN_PASSWORD ?? DEFAULT_PASSWORD).trim();
  const displayName = (env.SEED_ADMIN_DISPLAY_NAME ?? DEFAULT_DISPLAY_NAME).trim();
  const role = normalizeRole(env.SEED_ADMIN_ROLE);

  if (!email) {
    throw new Error("SEED_ADMIN_EMAIL cannot be empty");
  }

  if (password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters");
  }

  if (!displayName) {
    throw new Error("SEED_ADMIN_DISPLAY_NAME cannot be empty");
  }

  return {
    enabled,
    email,
    password,
    displayName,
    role,
  };
}

import type { UserRole, UserStatus } from "../../generated/prisma/client.js";

export const IDENTITY_POLICY = {
  PASSWORD_MIN_LENGTH: 8,
  ACCESS_TOKEN_TTL_MINUTES: 15,
  REFRESH_TOKEN_TTL_DAYS: 30,
  MAX_ACTIVE_SESSIONS: 10,
  RESET_TOKEN_TTL_HOURS: 1,
} as const;

export function canUserLogin(status: UserStatus): boolean {
  return status === "ACTIVE";
}

export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === "SUPER_ADMIN";
}

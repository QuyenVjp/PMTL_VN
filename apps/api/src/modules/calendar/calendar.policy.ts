import type { UserRole } from "../../generated/prisma/client.js";

/** Authorization: only admins and super-admins may manage calendar events */
export function canManageEvents(role: UserRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

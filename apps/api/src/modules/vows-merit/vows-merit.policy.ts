import type { UserRole } from "../../generated/prisma/client.js";

/** Authorization: only admins and super-admins may create assisted vow/merit entries */
export function canCreateAssistedEntry(role: UserRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

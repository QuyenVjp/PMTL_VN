import type { UserRole } from "../../generated/prisma/client.js";

/** Authorization: only admins and super-admins may moderate community content */
export function canModerateContent(role: UserRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

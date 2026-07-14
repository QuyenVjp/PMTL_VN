/**
 * Canonical identity role vocabulary for the admin app.
 *
 * Single owner for the compile-time role union so both `lib/` (auth) and
 * `features/` (users, moderation, settings) import the same type downward
 * without inverting layering. Mirrors the backend `UserRole` enum
 * (apps/api Prisma schema): MEMBER | ADMIN | SUPER_ADMIN.
 *
 * NOTE: This is the identity *role code*, not a localized display label and
 * not the free-text "volunteer title" domain field — those remain `string`.
 */

/** Identity role code as issued by the API auth/identity layer. */
export type UserRole = "MEMBER" | "ADMIN" | "SUPER_ADMIN";

/** Roles that grant access to the admin console. */
export type AdminRole = Extract<UserRole, "ADMIN" | "SUPER_ADMIN">;

/**
 * Type guard: narrows an untrusted backend string to an admin role.
 * Accepts `string` because callers validate raw envelope values.
 */
export function isAdminRole(role: string): role is AdminRole {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/** All role codes in canonical (ascending-privilege) order. */
const ALL_ROLES: readonly UserRole[] = ["MEMBER", "ADMIN", "SUPER_ADMIN"] as const;

/**
 * Roles an actor may assign to a target, projecting the backend
 * `AdminUsersService.changeRole` gate exactly:
 *
 * - Setting a target *to* SUPER_ADMIN, or changing a target that *is already*
 *   SUPER_ADMIN, requires the actor to be SUPER_ADMIN.
 * - So a SUPER_ADMIN actor may assign any role to any target.
 * - An ADMIN actor may only move a MEMBER/ADMIN target within MEMBER↔ADMIN,
 *   and may not touch a SUPER_ADMIN target at all.
 * - Any non-admin actor (defensive) may assign nothing.
 *
 * The returned list is the exact set of options the role Select should render,
 * so the client never offers a transition the server would reject with 403.
 */
export function assignableRolesForActor(
  actorRole: UserRole,
  targetRole: UserRole,
): UserRole[] {
  if (actorRole === "SUPER_ADMIN") {
    return [...ALL_ROLES];
  }
  if (actorRole === "ADMIN") {
    // Cannot manage a SUPER_ADMIN target, and can never grant SUPER_ADMIN.
    if (targetRole === "SUPER_ADMIN") return [];
    return ["MEMBER", "ADMIN"];
  }
  return [];
}

/** Whether the actor may change the target's role at all (i.e. has ≥1 assignable role). */
export function canManageTargetRole(actorRole: UserRole, targetRole: UserRole): boolean {
  return assignableRolesForActor(actorRole, targetRole).length > 0;
}

import type { AccessArgs, RequestUser } from "./types";

const ROLE_ORDER = ["member", "moderator", "editor", "admin", "super-admin"] as const;

type RoleName = (typeof ROLE_ORDER)[number];

function getRoleRank(role: unknown): number {
  if (typeof role !== "string") {
    return -1;
  }

  return ROLE_ORDER.indexOf(role as RoleName);
}

export function hasRole(user: RequestUser | Record<string, unknown> | null | undefined, minimumRole: RoleName): boolean {
  return getRoleRank(user?.role) >= getRoleRank(minimumRole);
}

export function isRole(minimumRole: RoleName) {
  return ({ req }: AccessArgs): boolean => hasRole(req.user, minimumRole);
}

export function isSelfOrRole(minimumRole: RoleName) {
  return ({ req }: AccessArgs): boolean | { id: { equals: string | number } } => {
    if (hasRole(req.user, minimumRole)) {
      return true;
    }

    if (!req.user?.id) {
      return false;
    }

    return {
      id: {
        equals: req.user.id,
      },
    };
  };
}

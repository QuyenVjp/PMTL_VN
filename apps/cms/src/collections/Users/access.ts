import { isAdmin } from "@/access/is-admin";

type UserQueryAccess =
  | boolean
  | {
      id: {
        equals: number | string;
      };
    };

type UserAccessArgs = {
  req: {
    user?: {
      id?: number | string;
      role?: unknown;
    } | null;
  };
};

export function canManageUserRoles({ req }: UserAccessArgs): boolean {
  return req.user?.role === "super-admin" || req.user?.role === "admin";
}

function canReadUsers({ req }: UserAccessArgs): UserQueryAccess {
  if (req.user?.role === "super-admin" || req.user?.role === "admin") {
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
}

function canUpdateUsers({ req }: UserAccessArgs): UserQueryAccess {
  if (req.user?.role === "super-admin" || req.user?.role === "admin") {
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
}

export const userAccess = {
  read: canReadUsers,
  create: isAdmin,
  update: canUpdateUsers,
  delete: isAdmin,
};

import { isAdmin } from "@/access/is-admin";
import { isSelfOrRole } from "@/access/roles";

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

const canReadUsers = isSelfOrRole("admin") as ({ req }: UserAccessArgs) => UserQueryAccess;
const canUpdateUsers = isSelfOrRole("admin") as ({ req }: UserAccessArgs) => UserQueryAccess;

export const userAccess = {
  read: canReadUsers,
  create: isAdmin,
  update: canUpdateUsers,
  delete: isAdmin,
};

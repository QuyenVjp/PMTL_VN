import { isAdmin } from "@/access/is-admin";

export const requestGuardAccess = {
  read: isAdmin,
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
};

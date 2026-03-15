import { isAdmin } from "@/access/is-admin";

export const pushJobAccess = {
  read: isAdmin,
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
};

import { isAdmin } from "@/access/is-admin";

export const auditLogAccess = {
  read: isAdmin,
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
};

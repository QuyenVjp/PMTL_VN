import { isAdmin } from "@/access/is-admin";
import { isAuthenticated } from "@/access/is-authenticated";
import { ownedByUserField } from "@/access/owned-by-user";

const ownUserRecord = ownedByUserField("user");

export const chantPreferenceAccess = {
  read: ownUserRecord,
  create: isAuthenticated,
  update: ownUserRecord,
  delete: isAdmin,
};

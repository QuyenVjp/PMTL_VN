import { isAdmin } from "@/access/is-admin";
import { isModeratorOrAbove } from "@/access/is-moderator-or-above";

export const commentAccess = {
  read: () => true,
  create: () => true,
  update: isModeratorOrAbove,
  delete: isAdmin,
};

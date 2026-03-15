import { isAdmin } from "@/access/is-admin";
import { isAuthenticated } from "@/access/is-authenticated";
import { isModeratorOrAbove } from "@/access/is-moderator-or-above";

export const moderationReportAccess = {
  read: isModeratorOrAbove,
  create: isAuthenticated,
  update: isModeratorOrAbove,
  delete: isAdmin,
};

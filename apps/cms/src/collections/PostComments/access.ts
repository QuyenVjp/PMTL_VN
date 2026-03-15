import { isAdmin } from "@/access/is-admin";
import { isModeratorOrAbove } from "@/access/is-moderator-or-above";

export const postCommentAccess = {
  read: () => ({
    and: [
      {
        moderationStatus: {
          equals: "approved",
        },
      },
      {
        isHidden: {
          not_equals: true,
        },
      },
    ],
  }),
  create: () => true,
  update: isModeratorOrAbove,
  delete: isAdmin,
};

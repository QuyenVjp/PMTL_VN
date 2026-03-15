import { isAdmin } from "@/access/is-admin";
import { isAuthenticated } from "@/access/is-authenticated";
import { isModeratorOrAbove } from "@/access/is-moderator-or-above";

function canReadCommunityComment() {
  return {
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
  };
}

export const communityCommentAccess = {
  read: canReadCommunityComment,
  create: isAuthenticated,
  update: isModeratorOrAbove,
  delete: isAdmin,
};

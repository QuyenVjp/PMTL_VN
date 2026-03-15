import { isAdmin } from "@/access/is-admin";
import { isModeratorOrAbove } from "@/access/is-moderator-or-above";

function canReadGuestbookEntry() {
  return {
    approvalStatus: {
      equals: "approved",
    },
  };
}

export const guestbookEntryAccess = {
  read: canReadGuestbookEntry,
  create: () => true,
  update: isModeratorOrAbove,
  delete: isAdmin,
};

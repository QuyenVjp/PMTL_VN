import { isAuthenticated } from "@/access/is-authenticated";
import { isEditorOrAdmin } from "@/access/is-editor-or-admin";

import type { AccessArgs } from "@/access/types";

function canReadPost({ req }: AccessArgs) {
  if (req.user) {
    return true;
  }

  return {
    or: [
      {
        _status: {
          equals: "published",
        },
      },
      {
        _status: {
          exists: false,
        },
      },
    ],
  };
}

export const postAccess = {
  read: canReadPost,
  create: isEditorOrAdmin,
  update: isEditorOrAdmin,
  delete: isEditorOrAdmin,
  readVersions: isAuthenticated,
};

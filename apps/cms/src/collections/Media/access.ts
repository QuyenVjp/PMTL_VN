import { isAuthenticated } from "@/access/is-authenticated";
import { isEditorOrAdmin } from "@/access/is-editor-or-admin";

export const mediaAccess = {
  read: () => true,
  create: isAuthenticated,
  update: isEditorOrAdmin,
  delete: isEditorOrAdmin,
};


import { isEditorOrAdmin } from "@/access/is-editor-or-admin";

export const sutraAccess = {
  read: () => true,
  create: isEditorOrAdmin,
  update: isEditorOrAdmin,
  delete: isEditorOrAdmin,
};

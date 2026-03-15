import { isEditorOrAdmin } from "@/access/is-editor-or-admin";

export const downloadAccess = {
  read: () => true,
  create: isEditorOrAdmin,
  update: isEditorOrAdmin,
  delete: isEditorOrAdmin,
};

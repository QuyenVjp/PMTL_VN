import { isEditorOrAdmin } from "@/access/is-editor-or-admin";

export const tagAccess = {
  read: () => true,
  create: isEditorOrAdmin,
  update: isEditorOrAdmin,
  delete: isEditorOrAdmin,
};

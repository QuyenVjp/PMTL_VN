import { isEditorOrAdmin } from "@/access/is-editor-or-admin";

export const hubPageAccess = {
  read: () => true,
  create: isEditorOrAdmin,
  update: isEditorOrAdmin,
  delete: isEditorOrAdmin,
};

import { isEditorOrAdmin } from "@/access/is-editor-or-admin";

export const chantItemAccess = {
  read: () => true,
  create: isEditorOrAdmin,
  update: isEditorOrAdmin,
  delete: isEditorOrAdmin,
};

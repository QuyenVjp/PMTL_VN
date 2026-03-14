import { isEditorOrAdmin } from "@/access/is-editor-or-admin";

export const categoryAccess = {
  read: () => true,
  create: isEditorOrAdmin,
  update: isEditorOrAdmin,
  delete: isEditorOrAdmin,
};


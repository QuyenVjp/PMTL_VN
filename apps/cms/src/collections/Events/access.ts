import { isEditorOrAdmin } from "@/access/is-editor-or-admin";

export const eventAccess = {
  read: () => true,
  create: isEditorOrAdmin,
  update: isEditorOrAdmin,
  delete: isEditorOrAdmin,
};


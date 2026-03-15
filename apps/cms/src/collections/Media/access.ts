import { isEditorOrAdmin } from "@/access/is-editor-or-admin";

export const mediaAccess = {
  read: () => true,
  create: isEditorOrAdmin,
  update: isEditorOrAdmin,
  delete: isEditorOrAdmin,
};


import { isEditorOrAdmin } from "@/access/is-editor-or-admin";

export const lunarEventAccess = {
  read: isEditorOrAdmin,
  create: isEditorOrAdmin,
  update: isEditorOrAdmin,
  delete: isEditorOrAdmin,
};

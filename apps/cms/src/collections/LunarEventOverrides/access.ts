import { isEditorOrAdmin } from "@/access/is-editor-or-admin";

export const lunarEventOverrideAccess = {
  read: isEditorOrAdmin,
  create: isEditorOrAdmin,
  update: isEditorOrAdmin,
  delete: isEditorOrAdmin,
};

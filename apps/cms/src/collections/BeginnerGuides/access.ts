import { isEditorOrAdmin } from "@/access/is-editor-or-admin";

export const beginnerGuideAccess = {
  read: () => true,
  create: isEditorOrAdmin,
  update: isEditorOrAdmin,
  delete: isEditorOrAdmin,
};

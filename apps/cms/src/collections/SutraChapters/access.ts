import { isEditorOrAdmin } from "@/access/is-editor-or-admin";

export const sutraChapterAccess = {
  read: () => true,
  create: isEditorOrAdmin,
  update: isEditorOrAdmin,
  delete: isEditorOrAdmin,
};

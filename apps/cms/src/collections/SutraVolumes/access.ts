import { isEditorOrAdmin } from "@/access/is-editor-or-admin";

export const sutraVolumeAccess = {
  read: () => true,
  create: isEditorOrAdmin,
  update: isEditorOrAdmin,
  delete: isEditorOrAdmin,
};

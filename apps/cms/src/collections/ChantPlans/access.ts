import { isEditorOrAdmin } from "@/access/is-editor-or-admin";

export const chantPlanAccess = {
  read: () => true,
  create: isEditorOrAdmin,
  update: isEditorOrAdmin,
  delete: isEditorOrAdmin,
};

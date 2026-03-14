import type { AccessArgs } from "./types";

export function isEditorOrAdmin({ req }: AccessArgs): boolean {
  return (
    req.user?.role === "super-admin" ||
    req.user?.role === "admin" ||
    req.user?.role === "editor"
  );
}

import type { AccessArgs } from "./types";

export function isAdmin({ req }: AccessArgs): boolean {
  return req.user?.role === "super-admin" || req.user?.role === "admin";
}

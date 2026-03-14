import type { AccessArgs } from "./types";

export function isAuthenticated({ req }: AccessArgs): boolean {
  return Boolean(req.user);
}


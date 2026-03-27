import { queryClient } from "./query-client.js";

/** Invalidate all queries matching a key family prefix */
export function invalidateFamily(keyPrefix: readonly unknown[]) {
  return queryClient.invalidateQueries({ queryKey: [...keyPrefix] });
}

/** Invalidate an exact query key */
export function invalidateExact(key: readonly unknown[]) {
  return queryClient.invalidateQueries({ queryKey: [...key], exact: true });
}

/** Invalidate dashboard aggregate */
export function invalidateDashboard() {
  return queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
}

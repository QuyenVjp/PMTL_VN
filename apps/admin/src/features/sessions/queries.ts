import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";
import type { AdminSessionListItem, SessionListFilters } from "./types.js";

export const sessionAdminKeys = {
  all: ["admin-sessions"] as const,
  lists: () => [...sessionAdminKeys.all, "list"] as const,
  list: (filters: SessionListFilters) => [...sessionAdminKeys.lists(), filters] as const,
};

export function sessionListOptions(filters: SessionListFilters = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
    status: filters.status || undefined,
    userId: filters.userId || undefined,
  };

  return queryOptions({
    queryKey: sessionAdminKeys.list(filters),
    queryFn: () => adminClient.get<ListEnvelope<AdminSessionListItem>>("/admin/sessions", params),
  });
}

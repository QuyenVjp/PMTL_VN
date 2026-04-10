import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";
import type { LhListItem, LhFraudItem } from "./types.js";

export type { LhListItem, LhFraudItem } from "./types.js";

export const lhKeys = {
  all: ["little-house"] as const,
  lists: () => [...lhKeys.all, "list"] as const,
  list: (f: Record<string, unknown>) => [...lhKeys.lists(), f] as const,
  detail: (id: string) => [...lhKeys.all, "detail", id] as const,
  fraud: (f: Record<string, unknown>) => [...lhKeys.all, "fraud", f] as const,
};

export function lhListOptions(filters: { limit?: number; offset?: number; status?: string; search?: string } = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
  };
  if (filters.status) params.status = filters.status;
  if (filters.search) params.search = filters.search;

  return queryOptions({
    queryKey: lhKeys.list(filters),
    queryFn: () => adminClient.get<ListEnvelope<LhListItem>>("/admin/little-house", params),
  });
}

export function lhFraudListOptions(filters: { limit?: number; offset?: number; severity?: string; resolved?: boolean } = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
  };
  if (filters.severity) params.severity = filters.severity;
  if (filters.resolved !== undefined) params.resolved = filters.resolved;

  return queryOptions({
    queryKey: lhKeys.fraud(filters),
    queryFn: () => adminClient.get<ListEnvelope<LhFraudItem>>("/admin/little-house/fraud", params),
  });
}

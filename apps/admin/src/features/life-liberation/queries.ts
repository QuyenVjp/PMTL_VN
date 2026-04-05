import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";
import type { LifeReleaseListItem, SpeciesSummaryItem } from "./types.js";

export const lifeReleaseKeys = {
  all: ["life-releases"] as const,
  lists: () => [...lifeReleaseKeys.all, "list"] as const,
  list: (f: Record<string, unknown>) => [...lifeReleaseKeys.lists(), f] as const,
  summary: () => [...lifeReleaseKeys.all, "species-summary"] as const,
};

export function lifeReleaseListOptions(filters: { limit?: number; offset?: number; status?: string; recordType?: string } = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
  };
  if (filters.status) params.status = filters.status;
  if (filters.recordType) params.recordType = filters.recordType;

  return queryOptions({
    queryKey: lifeReleaseKeys.list(filters),
    queryFn: () => adminClient.get<ListEnvelope<LifeReleaseListItem>>("/life-liberation", params),
  });
}

export function speciesSummaryOptions() {
  return queryOptions({
    queryKey: lifeReleaseKeys.summary(),
    queryFn: () => adminClient.get<ListEnvelope<SpeciesSummaryItem>>("/life-liberation/species-summary"),
  });
}

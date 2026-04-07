import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";
import type { CharityListItem, FraudAlertItem, VowListItem, GuidanceQueueItem } from "./types.js";

export type { CharityListItem };

export const charityKeys = {
  all: ["charities"] as const,
  lists: () => [...charityKeys.all, "list"] as const,
  list: (f: Record<string, unknown>) => [...charityKeys.lists(), f] as const,
};

export const fraudAlertKeys = {
  all: ["fraud-alerts"] as const,
  lists: () => [...fraudAlertKeys.all, "list"] as const,
  list: (f: Record<string, unknown>) => [...fraudAlertKeys.lists(), f] as const,
};

export const vowKeys = {
  all: ["purity-vows"] as const,
  lists: () => [...vowKeys.all, "list"] as const,
  list: (f: Record<string, unknown>) => [...vowKeys.lists(), f] as const,
};

export const guidanceKeys = {
  all: ["guidance-queue"] as const,
  lists: () => [...guidanceKeys.all, "list"] as const,
  list: (f: Record<string, unknown>) => [...guidanceKeys.lists(), f] as const,
};

export function charityListOptions(filters: { limit?: number; offset?: number; status?: string; search?: string } = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
  };
  if (filters.status) params.status = filters.status;
  if (filters.search) params.search = filters.search;

  return queryOptions({
    queryKey: charityKeys.list(filters),
    queryFn: () => adminClient.get<ListEnvelope<CharityListItem>>("/admin/dharma-compliance/charities", params),
  });
}

export function fraudAlertListOptions(filters: { limit?: number; offset?: number; severity?: string; resolved?: boolean } = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
  };
  if (filters.severity) params.severity = filters.severity;
  if (filters.resolved !== undefined) params.resolved = filters.resolved;

  return queryOptions({
    queryKey: fraudAlertKeys.list(filters),
    queryFn: () => adminClient.get<ListEnvelope<FraudAlertItem>>("/admin/dharma-compliance/fraud-alerts", params),
  });
}

export function vowListOptions(filters: { limit?: number; offset?: number; status?: string; purityLevel?: string } = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
  };
  if (filters.status) params.status = filters.status;
  if (filters.purityLevel) params.purityLevel = filters.purityLevel;

  return queryOptions({
    queryKey: vowKeys.list(filters),
    queryFn: () => adminClient.get<ListEnvelope<VowListItem>>("/admin/dharma-compliance/vows", params),
  });
}

export function guidanceQueueOptions(filters: { limit?: number; offset?: number; urgency?: string; status?: string } = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
  };
  if (filters.urgency) params.urgency = filters.urgency;
  if (filters.status) params.status = filters.status;

  return queryOptions({
    queryKey: guidanceKeys.list(filters),
    queryFn: () => adminClient.get<ListEnvelope<GuidanceQueueItem>>("/admin/dharma-compliance/vows/guidance-queue", params),
  });
}

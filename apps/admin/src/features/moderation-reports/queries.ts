import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";
import type { ModerationReportListItem, ReportListFilters } from "./types.js";

export const reportKeys = {
  all: ["admin-moderation-reports"] as const,
  lists: () => [...reportKeys.all, "list"] as const,
  list: (filters: ReportListFilters) => [...reportKeys.lists(), filters] as const,
};

export function reportListOptions(filters: ReportListFilters = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
    status: filters.status || undefined,
    targetType: filters.targetType || undefined,
  };

  return queryOptions({
    queryKey: reportKeys.list(filters),
    queryFn: () =>
      adminClient.get<ListEnvelope<ModerationReportListItem>>("/moderation/reports", params),
  });
}

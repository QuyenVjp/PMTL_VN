import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type {
  ModerationReportListItem,
} from "@pmtl/api-client";

/**
 * Moderation reports query keys per ADMIN_PAGE_API_MAPPING.
 * Invalidation rules (line 113):
 * - decision mutation: invalidate report list + detail + affected target workspace list/detail + dashboard pendingModeration widget
 */

export interface ReportListFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const reportKeys = {
  all: ["admin-moderation-reports"] as const,
  lists: () => [...reportKeys.all, "list"] as const,
  list: (filters: ReportListFilters) => [...reportKeys.lists(), filters] as const,
  details: () => [...reportKeys.all, "detail"] as const,
  detail: (publicId: string) => [...reportKeys.details(), publicId] as const,
};

export function reportListOptions(filters: ReportListFilters = {}) {
  const rawPage = filters.page ?? 1;
  const rawLimit = filters.limit ?? 20;
  const page = Math.max(rawPage, 1);
  const limit = Math.min(Math.max(rawLimit, 1), 100);
  const normalizedFilters: ReportListFilters = {
    ...filters,
    page,
    limit,
  };
  const params: Record<string, string | number | boolean | undefined> = {
    page,
    limit,
    status: normalizedFilters.status || undefined,
    search: normalizedFilters.search || undefined,
  };

  return queryOptions({
    queryKey: reportKeys.list(normalizedFilters),
    queryFn: () =>
      adminClient.get<{ data: ModerationReportListItem[] }>(
        "/moderation/reports",
        params
      ),
  });
}

export function reportDetailOptions(publicId: string) {
  return queryOptions({
    queryKey: reportKeys.detail(publicId),
    queryFn: () =>
      adminClient.get<ModerationReportListItem>(
        `/moderation/reports/${publicId}`
      ),
    enabled: !!publicId,
  });
}

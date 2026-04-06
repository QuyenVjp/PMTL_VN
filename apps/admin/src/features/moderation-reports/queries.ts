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
  const params: Record<string, string | number | boolean | undefined> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    status: filters.status || undefined,
    search: filters.search || undefined,
  };

  return queryOptions({
    queryKey: reportKeys.list(filters),
    queryFn: () =>
      adminClient.get<{ data: ModerationReportListItem[] }>(
        "/admin/moderation/reports",
        params
      ),
  });
}

export function reportDetailOptions(publicId: string) {
  return queryOptions({
    queryKey: reportKeys.detail(publicId),
    queryFn: () =>
      adminClient.get<ModerationReportListItem>(
        `/admin/moderation/reports/${publicId}`
      ),
    enabled: !!publicId,
  });
}

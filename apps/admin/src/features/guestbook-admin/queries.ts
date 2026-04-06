import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { createAdminListQuery } from "@/lib/query/create-admin-query.js";

/**
 * Guestbook admin queries per ADMIN_FEATURE_QUERY_PLAN line 45
 * Covers: overview, entries, moderation queue, analytics
 */

export interface GuestbookOverview {
  totalEntries: number;
  publishedEntries: number;
  pendingModeration: number;
  avgSentiment: number;
  lastActivity: string;
}

export interface GuestbookEntryItem {
  publicId: string;
  visitorName: string;
  message: string;
  status: "PUBLISHED" | "PENDING" | "HIDDEN" | "DELETED";
  sentiment?: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  createdAt: string;
}

export interface ListFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sentiment?: string;
}

export const guestbookAdminKeys = {
  all: ["admin-guestbook"] as const,
  overview: () => [...guestbookAdminKeys.all, "overview"] as const,
  entries: {
    lists: () => [...guestbookAdminKeys.all, "entries", "list"] as const,
    list: (filters: ListFilters = {}) => [...guestbookAdminKeys.entries.lists(), filters] as const,
    details: () => [...guestbookAdminKeys.all, "entries", "detail"] as const,
    detail: (publicId: string) => [...guestbookAdminKeys.entries.details(), publicId] as const,
  },
  moderation: {
    lists: () => [...guestbookAdminKeys.all, "moderation", "list"] as const,
    list: (filters: ListFilters = {}) => [...guestbookAdminKeys.moderation.lists(), filters] as const,
  },
  analytics: {
    lists: () => [...guestbookAdminKeys.all, "analytics", "list"] as const,
    list: (filters: ListFilters = {}) => [...guestbookAdminKeys.analytics.lists(), filters] as const,
  },
};

/**
 * Fetch guestbook overview
 */
export function getGuestbookOverviewQuery() {
  return queryOptions({
    queryKey: guestbookAdminKeys.overview(),
    queryFn: () =>
      adminClient.get<{ data: GuestbookOverview }>("/admin/guestbook/overview"),
  });
}

/**
 * Fetch paginated list of guestbook entries
 */
export function getGuestbookEntriesQuery(filters: ListFilters = {}) {
  const params: Record<string, unknown> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };

  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.sentiment) params.sentiment = filters.sentiment;

  return createAdminListQuery<GuestbookEntryItem>({
    queryKey: guestbookAdminKeys.entries.list(filters),
    endpoint: "/admin/guestbook/entries",
    params,
  });
}

/**
 * Fetch single guestbook entry detail
 */
export function getGuestbookEntryQuery(publicId: string) {
  return queryOptions({
    queryKey: guestbookAdminKeys.entries.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: GuestbookEntryItem }>(`/admin/guestbook/entries/${publicId}`),
    enabled: !!publicId,
  });
}

/**
 * Fetch moderation queue
 */
export function getGuestbookModerationQueueQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<{ publicId: string; visitorName: string; message: string; submittedAt: string }>({
    queryKey: guestbookAdminKeys.moderation.list(filters),
    endpoint: "/admin/guestbook/moderation-queue",
    params,
  });
}

/**
 * Fetch guestbook analytics
 */
export function getGuestbookAnalyticsQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 50,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<{ publicId: string; metric: string; value: number; timestamp: string }>({
    queryKey: guestbookAdminKeys.analytics.list(filters),
    endpoint: "/admin/guestbook/analytics",
    params,
  });
}

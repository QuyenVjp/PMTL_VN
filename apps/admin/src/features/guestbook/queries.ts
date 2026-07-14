import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { PaginatedList } from "@/lib/api/envelopes.js";

export interface GuestbookItem {
  publicId: string;
  content: string;
  status: string;
  author: { publicId: string; displayName: string; email: string };
  approvedBy?: { publicId: string; displayName: string } | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GuestbookFilters {
  limit?: number;
  offset?: number;
  status?: string;
}

export const guestbookKeys = {
  all: ["admin-guestbook"] as const,
  lists: () => [...guestbookKeys.all, "list"] as const,
  list: (filters: GuestbookFilters) => [...guestbookKeys.lists(), filters] as const,
  details: () => [...guestbookKeys.all, "detail"] as const,
  detail: (publicId: string) => [...guestbookKeys.details(), publicId] as const,
};

export function guestbookListOptions(filters: GuestbookFilters = {}) {
  return queryOptions({
    queryKey: guestbookKeys.list(filters),
    // Phase 4.2 batch 2: after client unwrap, payload is { items, pagination }
    // (NOT the legacy ListEnvelope { data, meta.pagination }).
    queryFn: () =>
      adminClient.get<PaginatedList<GuestbookItem>>("/admin/community/guestbook", {
        limit: filters.limit ?? 20,
        offset: filters.offset ?? 0,
        status: filters.status || undefined,
      }),
  });
}

export function guestbookDetailOptions(publicId: string) {
  return queryOptions({
    queryKey: guestbookKeys.detail(publicId),
    queryFn: () => adminClient.get<GuestbookItem>(`/admin/community/guestbook/${publicId}`),
    enabled: Boolean(publicId),
  });
}

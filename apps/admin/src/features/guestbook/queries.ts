import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";

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
};

export function guestbookListOptions(filters: GuestbookFilters = {}) {
  return queryOptions({
    queryKey: guestbookKeys.list(filters),
    queryFn: () =>
      adminClient.get<ListEnvelope<GuestbookItem>>("/admin/community/guestbook", {
        limit: filters.limit ?? 20,
        offset: filters.offset ?? 0,
        status: filters.status || undefined,
      }),
  });
}

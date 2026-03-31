import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";

// ── Types ───────────────────────────────────────────────────────────

export interface CalendarEventItem {
  publicId: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string | null;
  location: string | null;
  eventType: string;
  coverImagePublicId: string | null;
  posterImagePublicId: string | null;
  coverImageUrl: string | null;
  posterImageUrl: string | null;
  status: string;
  createdBy: { publicId: string; displayName: string };
  publishedAt: string | null;
  createdAt: string;
}

export interface CalendarEventFilters {
  limit?: number;
  offset?: number;
  status?: string;
  search?: string;
  eventType?: string;
}

// ── Query key factory ───────────────────────────────────────────────

export const eventKeys = {
  all: ["admin-events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (filters: CalendarEventFilters) => [...eventKeys.lists(), filters] as const,
};

// ── Query options ───────────────────────────────────────────────────

export function eventListOptions(filters: CalendarEventFilters = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 20,
    offset: filters.offset ?? 0,
    search: filters.search || undefined,
    status: filters.status || undefined,
    eventType: filters.eventType || undefined,
  };

  return queryOptions({
    queryKey: eventKeys.list(filters),
    queryFn: () =>
      adminClient.get<ListEnvelope<CalendarEventItem>>("/admin/calendar/events", params),
  });
}

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
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (publicId: string) => [...eventKeys.details(), publicId] as const,
};

// ── Query options ───────────────────────────────────────────────────

export function eventListOptions(filters: CalendarEventFilters = {}) {
  const rawLimit = filters.limit ?? 20;
  const rawOffset = filters.offset ?? 0;
  const limit = Math.min(Math.max(rawLimit, 1), 100);
  const offset = Math.max(rawOffset, 0);
  const normalizedFilters: CalendarEventFilters = {
    ...filters,
    limit,
    offset,
  };
  const params: Record<string, string | number | boolean | undefined> = {
    limit,
    offset,
    search: normalizedFilters.search || undefined,
    status: normalizedFilters.status || undefined,
    eventType: normalizedFilters.eventType || undefined,
  };

  return queryOptions({
    queryKey: eventKeys.list(normalizedFilters),
    queryFn: () =>
      adminClient.get<ListEnvelope<CalendarEventItem>>("/admin/calendar/events", params),
  });
}

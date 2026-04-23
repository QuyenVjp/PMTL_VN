import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";
import type { EventListItem } from "./types.js";

export type { EventListItem } from "./types.js";

export interface EventDetail extends EventListItem {
  description: string | null;
}

export const eventKeys = {
  all: ["buddhist-events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (f: Record<string, unknown>) => [...eventKeys.lists(), f] as const,
  detail: (id: string) => [...eventKeys.all, "detail", id] as const,
  registrations: (id: string) => [...eventKeys.all, "registrations", id] as const,
};

export function eventDetailOptions(publicId: string) {
  return queryOptions({
    queryKey: eventKeys.detail(publicId),
    queryFn: () => adminClient.get<EventDetail>(`/admin/events/${publicId}`),
    enabled: Boolean(publicId),
  });
}

export function eventListOptions(filters: { limit?: number; offset?: number; status?: string; eventType?: string; search?: string } = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
  };
  if (filters.status) params.status = filters.status;
  if (filters.eventType) params.eventType = filters.eventType;
  if (filters.search) params.search = filters.search;

  return queryOptions({
    queryKey: eventKeys.list(filters),
    queryFn: () => adminClient.get<ListEnvelope<EventListItem>>("/admin/events", params),
  });
}

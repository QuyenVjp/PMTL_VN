import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { createAdminListQuery, createAdminDetailQuery } from "@/lib/query/create-admin-query.js";

/**
 * Events admin queries per ADMIN_FEATURE_QUERY_PLAN line 51
 * Covers: list, detail, agenda, speakers, CTAs, overrides, status, advisory preview, inspect
 */

export interface EventListItem {
  publicId: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  attendeeCount: number;
  createdAt: string;
}

export interface EventDetail extends EventListItem {
  description: string;
  imageUrl?: string;
  agendaItems: number;
  speakers: number;
  ctas: number;
}

export interface AgendaItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  speakerId?: string;
  order: number;
}

export interface Speaker {
  publicId: string;
  name: string;
  title?: string;
  bio?: string;
  imageUrl?: string;
}

export interface EventCta {
  id: string;
  title: string;
  url: string;
  position: number;
}

export interface CalendarOverride {
  publicId: string;
  date: string;
  lunarDate: string;
  overrideType: string;
  createdAt: string;
}

export interface EventListFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const eventKeys = {
  all: ["admin-events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (filters: EventListFilters = {}) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (eventId: string) => [...eventKeys.details(), eventId] as const,
  agenda: {
    lists: () => [...eventKeys.all, "agenda", "list"] as const,
    list: (eventId: string) => [...eventKeys.agenda.lists(), eventId] as const,
  },
  speakers: {
    lists: () => [...eventKeys.all, "speakers", "list"] as const,
    list: (eventId: string) => [...eventKeys.speakers.lists(), eventId] as const,
  },
  ctas: {
    lists: () => [...eventKeys.all, "ctas", "list"] as const,
    list: (eventId: string) => [...eventKeys.ctas.lists(), eventId] as const,
  },
  overrides: {
    lists: () => [...eventKeys.all, "overrides", "list"] as const,
    list: (filters?: EventListFilters) => [...eventKeys.overrides.lists(), filters] as const,
    details: () => [...eventKeys.all, "overrides", "detail"] as const,
    detail: (publicId: string) => [...eventKeys.overrides.details(), publicId] as const,
  },
  status: () => [...eventKeys.all, "status"] as const,
  advisoryPreview: (params: Record<string, unknown>) => [...eventKeys.all, "advisory-preview", params] as const,
  inspect: (params: Record<string, unknown>) => [...eventKeys.all, "inspect", params] as const,
};

/**
 * Fetch paginated list of events
 */
export function getEventsQuery(filters: EventListFilters = {}) {
  const params: Record<string, unknown> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };
  if (filters.status) params.status = filters.status;
  if (filters.search) params.search = filters.search;

  return createAdminListQuery<EventListItem>({
    queryKey: eventKeys.list(filters),
    endpoint: "/admin/events",
    params,
  });
}

/**
 * Fetch single event detail
 */
export function getEventQuery(eventId: string) {
  return createAdminDetailQuery<EventDetail>({
    queryKey: eventKeys.detail(eventId),
    endpoint: `/admin/events/${eventId}`,
    enabled: !!eventId,
  });
}

/**
 * Fetch event agenda items
 */
export function getEventAgendaQuery(eventId: string) {
  return queryOptions({
    queryKey: eventKeys.agenda.list(eventId),
    queryFn: () =>
      adminClient.get<{ data: AgendaItem[] }>(`/admin/events/${eventId}/agenda`),
    enabled: !!eventId,
  });
}

/**
 * Fetch event speakers
 */
export function getEventSpeakersQuery(eventId: string) {
  return queryOptions({
    queryKey: eventKeys.speakers.list(eventId),
    queryFn: () =>
      adminClient.get<{ data: Speaker[] }>(`/admin/events/${eventId}/speakers`),
    enabled: !!eventId,
  });
}

/**
 * Fetch event CTAs
 */
export function getEventCtasQuery(eventId: string) {
  return queryOptions({
    queryKey: eventKeys.ctas.list(eventId),
    queryFn: () =>
      adminClient.get<{ data: EventCta[] }>(`/admin/events/${eventId}/ctas`),
    enabled: !!eventId,
  });
}

/**
 * Fetch calendar overrides
 */
export function getCalendarOverridesQuery(filters?: EventListFilters) {
  const params: Record<string, unknown> = {
    page: filters?.page ?? 1,
    limit: filters?.limit ?? 50,
  };

  return createAdminListQuery<CalendarOverride>({
    queryKey: eventKeys.overrides.list(filters),
    endpoint: "/admin/calendar/overrides",
    params,
  });
}

/**
 * Fetch single calendar override
 */
export function getCalendarOverrideQuery(publicId: string) {
  return createAdminDetailQuery<CalendarOverride>({
    queryKey: eventKeys.overrides.detail(publicId),
    endpoint: `/admin/calendar/overrides/${publicId}`,
    enabled: !!publicId,
  });
}

/**
 * Fetch calendar status
 */
export function getCalendarStatusQuery() {
  return queryOptions({
    queryKey: eventKeys.status(),
    queryFn: () =>
      adminClient.get<{
        data: {
          syncStatus: string;
          lastSync: string;
          nextSync: string;
        };
      }>("/admin/calendar/status"),
  });
}

/**
 * Preview calendar advisory for a given date
 */
export function getCalendarAdvisoryPreviewQuery(params: { date: string; userId?: string }) {
  return queryOptions({
    queryKey: eventKeys.advisoryPreview(params),
    queryFn: () =>
      adminClient.get<{ data: unknown }>("/admin/calendar/advisory-preview", params),
    enabled: !!params.date,
  });
}

/**
 * Inspect calendar computation for debugging
 */
export function getCalendarInspectQuery(params: { date: string; debug?: boolean }) {
  return queryOptions({
    queryKey: eventKeys.inspect(params),
    queryFn: () =>
      adminClient.get<{ data: unknown }>("/admin/calendar/inspect", params),
    enabled: !!params.date,
  });
}

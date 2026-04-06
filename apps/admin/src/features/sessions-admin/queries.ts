import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { createAdminListQuery } from "@/lib/query/create-admin-query.js";

/**
 * Sessions admin queries per ADMIN_FEATURE_QUERY_PLAN line 43
 * Covers: overview, active sessions, session history, device info
 */

export interface SessionsOverview {
  activeSessions: number;
  sessionsToday: number;
  uniqueDevices: number;
  averageSessionDuration: number;
  lastActivity: string;
}

export interface SessionItem {
  publicId: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  lastActivity: string;
  createdAt: string;
  expiresAt: string;
}

export interface SessionHistoryItem {
  publicId: string;
  userId: string;
  action: "LOGIN" | "LOGOUT" | "EXPIRE" | "REVOKE";
  ipAddress: string;
  deviceType: string;
  timestamp: string;
}

export interface ListFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  userId?: string;
}

export const sessionsAdminKeys = {
  all: ["admin-sessions"] as const,
  overview: () => [...sessionsAdminKeys.all, "overview"] as const,
  active: {
    lists: () => [...sessionsAdminKeys.all, "active", "list"] as const,
    list: (filters: ListFilters = {}) => [...sessionsAdminKeys.active.lists(), filters] as const,
    details: () => [...sessionsAdminKeys.all, "active", "detail"] as const,
    detail: (publicId: string) => [...sessionsAdminKeys.active.details(), publicId] as const,
  },
  history: {
    lists: () => [...sessionsAdminKeys.all, "history", "list"] as const,
    list: (filters: ListFilters = {}) => [...sessionsAdminKeys.history.lists(), filters] as const,
  },
  devices: {
    lists: () => [...sessionsAdminKeys.all, "devices", "list"] as const,
    list: (filters: ListFilters = {}) => [...sessionsAdminKeys.devices.lists(), filters] as const,
  },
};

/**
 * Fetch sessions overview
 */
export function getSessionsOverviewQuery() {
  return queryOptions({
    queryKey: sessionsAdminKeys.overview(),
    queryFn: () =>
      adminClient.get<{ data: SessionsOverview }>("/admin/sessions/overview"),
  });
}

/**
 * Fetch paginated list of active sessions
 */
export function getActiveSessionsQuery(filters: ListFilters = {}) {
  const params: Record<string, unknown> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };

  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.userId) params.userId = filters.userId;

  return createAdminListQuery<SessionItem>({
    queryKey: sessionsAdminKeys.active.list(filters),
    endpoint: "/admin/sessions/active",
    params,
  });
}

/**
 * Fetch single session detail
 */
export function getSessionQuery(publicId: string) {
  return queryOptions({
    queryKey: sessionsAdminKeys.active.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: SessionItem }>(`/admin/sessions/active/${publicId}`),
    enabled: !!publicId,
  });
}

/**
 * Fetch paginated list of session history
 */
export function getSessionHistoryQuery(filters: ListFilters = {}) {
  const params: Record<string, unknown> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 50,
  };

  if (filters.search) params.search = filters.search;
  if (filters.userId) params.userId = filters.userId;

  return createAdminListQuery<SessionHistoryItem>({
    queryKey: sessionsAdminKeys.history.list(filters),
    endpoint: "/admin/sessions/history",
    params,
  });
}

/**
 * Fetch paginated list of devices
 */
export function getDevicesQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<{ publicId: string; userId: string; deviceType: string; lastSeen: string; sessionCount: number }>({
    queryKey: sessionsAdminKeys.devices.list(filters),
    endpoint: "/admin/sessions/devices",
    params,
  });
}

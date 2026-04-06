import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { createAdminListQuery } from "@/lib/query/create-admin-query.js";

/**
 * Notifications admin queries per ADMIN_FEATURE_QUERY_PLAN line 41
 * Covers: overview, notification types, templates, schedules, delivery logs
 */

export interface NotificationsOverview {
  totalNotifications: number;
  deliveredToday: number;
  failedToday: number;
  activeSchedules: number;
  lastDelivery: string;
}

export interface NotificationTypeItem {
  publicId: string;
  name: string;
  slug: string;
  category: string;
  enabled: boolean;
  createdAt: string;
}

export interface NotificationTemplateItem {
  publicId: string;
  typeId: string;
  name: string;
  language: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
}

export interface ListFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export const notificationsAdminKeys = {
  all: ["admin-notifications"] as const,
  overview: () => [...notificationsAdminKeys.all, "overview"] as const,
  types: {
    lists: () => [...notificationsAdminKeys.all, "types", "list"] as const,
    list: (filters: ListFilters = {}) => [...notificationsAdminKeys.types.lists(), filters] as const,
    details: () => [...notificationsAdminKeys.all, "types", "detail"] as const,
    detail: (publicId: string) => [...notificationsAdminKeys.types.details(), publicId] as const,
  },
  templates: {
    lists: () => [...notificationsAdminKeys.all, "templates", "list"] as const,
    list: (filters: ListFilters = {}) => [...notificationsAdminKeys.templates.lists(), filters] as const,
    details: () => [...notificationsAdminKeys.all, "templates", "detail"] as const,
    detail: (publicId: string) => [...notificationsAdminKeys.templates.details(), publicId] as const,
  },
  schedules: {
    lists: () => [...notificationsAdminKeys.all, "schedules", "list"] as const,
    list: (filters: ListFilters = {}) => [...notificationsAdminKeys.schedules.lists(), filters] as const,
  },
  logs: {
    lists: () => [...notificationsAdminKeys.all, "logs", "list"] as const,
    list: (filters: ListFilters = {}) => [...notificationsAdminKeys.logs.lists(), filters] as const,
  },
};

/**
 * Fetch notifications overview
 */
export function getNotificationsOverviewQuery() {
  return queryOptions({
    queryKey: notificationsAdminKeys.overview(),
    queryFn: () =>
      adminClient.get<{ data: NotificationsOverview }>("/admin/notifications/overview"),
  });
}

/**
 * Fetch paginated list of notification types
 */
export function getNotificationTypesQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<NotificationTypeItem>({
    queryKey: notificationsAdminKeys.types.list(filters),
    endpoint: "/admin/notifications/types",
    params,
  });
}

/**
 * Fetch single notification type detail
 */
export function getNotificationTypeQuery(publicId: string) {
  return queryOptions({
    queryKey: notificationsAdminKeys.types.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: NotificationTypeItem }>(`/admin/notifications/types/${publicId}`),
    enabled: !!publicId,
  });
}

/**
 * Fetch paginated list of templates
 */
export function getNotificationTemplatesQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<NotificationTemplateItem>({
    queryKey: notificationsAdminKeys.templates.list(filters),
    endpoint: "/admin/notifications/templates",
    params,
  });
}

/**
 * Fetch single template detail
 */
export function getNotificationTemplateQuery(publicId: string) {
  return queryOptions({
    queryKey: notificationsAdminKeys.templates.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: NotificationTemplateItem }>(`/admin/notifications/templates/${publicId}`),
    enabled: !!publicId,
  });
}

/**
 * Fetch paginated list of schedules
 */
export function getNotificationSchedulesQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<{ publicId: string; name: string; nextRun: string; active: boolean }>({
    queryKey: notificationsAdminKeys.schedules.list(filters),
    endpoint: "/admin/notifications/schedules",
    params,
  });
}

/**
 * Fetch paginated list of delivery logs
 */
export function getNotificationLogsQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 50,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<{ publicId: string; notificationId: string; status: string; timestamp: string }>({
    queryKey: notificationsAdminKeys.logs.list(filters),
    endpoint: "/admin/notifications/logs",
    params,
  });
}

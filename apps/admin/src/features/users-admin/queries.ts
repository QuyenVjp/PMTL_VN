import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { createAdminListQuery } from "@/lib/query/create-admin-query.js";

/**
 * Users admin queries per ADMIN_FEATURE_QUERY_PLAN line 42
 * Covers: overview, users, roles, permissions, activity
 */

export interface UsersOverview {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  bannedUsers: number;
  lastActivity: string;
}

export interface UserItem {
  publicId: string;
  email: string;
  name: string;
  role: string;
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  lastLogin?: string;
  createdAt: string;
}

export interface RoleItem {
  publicId: string;
  name: string;
  slug: string;
  description: string;
  userCount: number;
  createdAt: string;
}

export interface ListFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
}

export const usersAdminKeys = {
  all: ["admin-users"] as const,
  overview: () => [...usersAdminKeys.all, "overview"] as const,
  users: {
    lists: () => [...usersAdminKeys.all, "users", "list"] as const,
    list: (filters: ListFilters = {}) => [...usersAdminKeys.users.lists(), filters] as const,
    details: () => [...usersAdminKeys.all, "users", "detail"] as const,
    detail: (publicId: string) => [...usersAdminKeys.users.details(), publicId] as const,
  },
  roles: {
    lists: () => [...usersAdminKeys.all, "roles", "list"] as const,
    list: (filters: ListFilters = {}) => [...usersAdminKeys.roles.lists(), filters] as const,
    details: () => [...usersAdminKeys.all, "roles", "detail"] as const,
    detail: (publicId: string) => [...usersAdminKeys.roles.details(), publicId] as const,
  },
  permissions: {
    lists: () => [...usersAdminKeys.all, "permissions", "list"] as const,
    list: (filters: ListFilters = {}) => [...usersAdminKeys.permissions.lists(), filters] as const,
  },
  activity: {
    lists: () => [...usersAdminKeys.all, "activity", "list"] as const,
    list: (filters: ListFilters = {}) => [...usersAdminKeys.activity.lists(), filters] as const,
  },
};

/**
 * Fetch users overview
 */
export function getUsersOverviewQuery() {
  return queryOptions({
    queryKey: usersAdminKeys.overview(),
    queryFn: () =>
      adminClient.get<{ data: UsersOverview }>("/admin/users/overview"),
  });
}

/**
 * Fetch paginated list of users
 */
export function getUsersQuery(filters: ListFilters = {}) {
  const params: Record<string, unknown> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };

  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.role) params.role = filters.role;

  return createAdminListQuery<UserItem>({
    queryKey: usersAdminKeys.users.list(filters),
    endpoint: "/admin/users",
    params,
  });
}

/**
 * Fetch single user detail
 */
export function getUserQuery(publicId: string) {
  return queryOptions({
    queryKey: usersAdminKeys.users.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: UserItem }>(`/admin/users/${publicId}`),
    enabled: !!publicId,
  });
}

/**
 * Fetch paginated list of roles
 */
export function getRolesQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<RoleItem>({
    queryKey: usersAdminKeys.roles.list(filters),
    endpoint: "/admin/users/roles",
    params,
  });
}

/**
 * Fetch single role detail
 */
export function getRoleQuery(publicId: string) {
  return queryOptions({
    queryKey: usersAdminKeys.roles.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: RoleItem }>(`/admin/users/roles/${publicId}`),
    enabled: !!publicId,
  });
}

/**
 * Fetch paginated list of permissions
 */
export function getPermissionsQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 50,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<{ publicId: string; name: string; slug: string; description: string }>({
    queryKey: usersAdminKeys.permissions.list(filters),
    endpoint: "/admin/users/permissions",
    params,
  });
}

/**
 * Fetch paginated list of user activity
 */
export function getUserActivityQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 50,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<{ publicId: string; userId: string; action: string; timestamp: string }>({
    queryKey: usersAdminKeys.activity.list(filters),
    endpoint: "/admin/users/activity",
    params,
  });
}

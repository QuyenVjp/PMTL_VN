import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope, SingleEnvelope } from "@/lib/api/envelopes.js";
import type { AdminUserListItem, AdminUserDetail, UserListFilters } from "./types.js";

/** Query key factory — keeps cache keys consistent across the feature */
export const userAdminKeys = {
  all: ["admin-users"] as const,
  lists: () => [...userAdminKeys.all, "list"] as const,
  list: (filters: UserListFilters) => [...userAdminKeys.lists(), filters] as const,
  details: () => [...userAdminKeys.all, "detail"] as const,
  detail: (publicId: string) => [...userAdminKeys.details(), publicId] as const,
  auditHistory: (publicId: string) => [...userAdminKeys.all, "audit", publicId] as const,
  practiceStats: (publicId: string) => [...userAdminKeys.all, "practice", publicId] as const,
};

/** List users with pagination + filters */
export function userListOptions(filters: UserListFilters = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 20,
    offset: filters.offset ?? 0,
    search: filters.search || undefined,
    role: filters.role || undefined,
    status: filters.status || undefined,
  };

  return queryOptions({
    queryKey: userAdminKeys.list(filters),
    queryFn: () => adminClient.get<ListEnvelope<AdminUserListItem>>("/admin/users", params),
  });
}

/** Single user detail */
export function userDetailOptions(publicId: string) {
  return queryOptions({
    queryKey: userAdminKeys.detail(publicId),
    queryFn: () => adminClient.get<SingleEnvelope<AdminUserDetail>>(`/admin/users/${publicId}`),
    enabled: !!publicId,
  });
}

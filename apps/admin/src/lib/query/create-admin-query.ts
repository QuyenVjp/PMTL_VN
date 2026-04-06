import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";

/**
 * Standard paginated list query helper
 * Handles common pagination pattern with page/limit
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedListResponse<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Create a paginated list query with standard options
 * @example
 * export const postAdminKeys = { all: ["admin-posts"], lists: () => [...postAdminKeys.all, "list"], list: (filters) => [...postAdminKeys.lists(), filters] };
 * export function getAdminPostsQuery(filters) {
 *   return createAdminListQuery({
 *     queryKey: postAdminKeys.list(filters),
 *     endpoint: "/admin/posts",
 *     params: filters,
 *   });
 * }
 */
export function createAdminListQuery<T>({
  queryKey,
  endpoint,
  params,
}: {
  queryKey: readonly unknown[];
  endpoint: string;
  params?: Record<string, unknown>;
}) {
  return queryOptions({
    queryKey: queryKey as unknown[],
    queryFn: () =>
      adminClient.get<PaginatedListResponse<T>>(endpoint, params as Record<string, string | number | boolean | undefined> | undefined),
  });
}

/**
 * Create a single item detail query with standard options
 * @example
 * export const postAdminKeys = { all: ["admin-posts"], details: () => [...postAdminKeys.all, "detail"], detail: (id) => [...postAdminKeys.details(), id] };
 * export function getAdminPostQuery(postId) {
 *   return createAdminDetailQuery({
 *     queryKey: postAdminKeys.detail(postId),
 *     endpoint: `/admin/posts/${postId}`,
 *     enabled: !!postId,
 *   });
 * }
 */
export function createAdminDetailQuery<T>({
  queryKey,
  endpoint,
  enabled,
}: {
  queryKey: readonly unknown[];
  endpoint: string;
  enabled?: boolean;
}) {
  return queryOptions({
    queryKey: queryKey as unknown[],
    queryFn: () => adminClient.get<T>(endpoint),
    enabled,
  });
}

/**
 * Create a custom admin query with full control
 * Use this when standard patterns don't fit
 */
export function createAdminQuery<T>({
  queryKey,
  endpoint,
  params,
  enabled,
  staleTime,
}: {
  queryKey: readonly unknown[];
  endpoint: string;
  params?: Record<string, unknown>;
  enabled?: boolean;
  staleTime?: number;
}) {
  return queryOptions({
    queryKey: queryKey as unknown[],
    queryFn: () => adminClient.get<T>(endpoint, params as Record<string, string | number | boolean | undefined> | undefined),
    enabled,
    staleTime,
  });
}

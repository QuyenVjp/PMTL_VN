import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { createAdminListQuery, createAdminDetailQuery } from "@/lib/query/create-admin-query.js";

/**
 * Post admin queries per ADMIN_FEATURE_QUERY_PLAN line 33
 * Covers: list, detail, status enums
 */

export interface PostListItem {
  publicId: string;
  title: string;
  slug: string;
  authorId: string;
  authorName: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface PostDetail extends PostListItem {
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags: string[];
  viewCount: number;
  commentCount: number;
}

export interface PostStatus {
  value: string;
  label: string;
}

export interface PostListFilters {
  page?: number;
  limit?: number;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  search?: string;
}

export const postAdminKeys = {
  all: ["admin-posts"] as const,
  lists: () => [...postAdminKeys.all, "list"] as const,
  list: (filters: PostListFilters = {}) => [...postAdminKeys.lists(), filters] as const,
  details: () => [...postAdminKeys.all, "detail"] as const,
  detail: (publicId: string) => [...postAdminKeys.details(), publicId] as const,
  aux: {
    statuses: () => [...postAdminKeys.all, "aux", "statuses"] as const,
  },
};

/**
 * Fetch paginated list of posts
 */
export function getAdminPostsQuery(filters: PostListFilters = {}) {
  const params: Record<string, unknown> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };

  if (filters.status) {
    params.status = filters.status;
  }
  if (filters.search) {
    params.search = filters.search;
  }

  return createAdminListQuery<PostListItem>({
    queryKey: postAdminKeys.list(filters),
    endpoint: "/admin/posts",
    params,
  });
}

/**
 * Fetch single post detail
 */
export function getAdminPostQuery(publicId: string) {
  return createAdminDetailQuery<PostDetail>({
    queryKey: postAdminKeys.detail(publicId),
    endpoint: `/admin/posts/${publicId}`,
    enabled: !!publicId,
  });
}

/**
 * Fetch available post statuses for filtering/forms
 */
export function getPostStatusesQuery() {
  return queryOptions({
    queryKey: postAdminKeys.aux.statuses(),
    queryFn: () =>
      adminClient.get<{ data: PostStatus[] }>("/admin/posts/statuses"),
  });
}

import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListResponse } from "@/lib/api/envelopes.js";

// ── Posts ─────────────────────────────────────────────────────────────

export interface PostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: string;
  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
  featuredImageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostDetail extends PostListItem {
  content: unknown;
  featuredImageId: string | null;
}

export interface PostListFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const postKeys = {
  all: ["admin-posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (filters: PostListFilters) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (publicId: string) => [...postKeys.details(), publicId] as const,
};

export function postListOptions(filters: PostListFilters = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    status: filters.status || undefined,
  };

  return queryOptions({
    queryKey: postKeys.list(filters),
    queryFn: () => adminClient.get<ListResponse<PostListItem>>("/content/admin/posts", params),
  });
}

export function postDetailOptions(publicId: string) {
  return queryOptions({
    queryKey: postKeys.detail(publicId),
    queryFn: () => adminClient.get<PostDetail>(`/content/admin/posts/${publicId}`),
    enabled: !!publicId,
  });
}

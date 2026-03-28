import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";

// ── Posts ─────────────────────────────────────────────────────────────

export interface PostListItem {
  publicId: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: string;
  authorId: string;
  authorName: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostDetail extends PostListItem {
  content: unknown;
  featuredImageId: string | null;
}

export interface PostListFilters {
  limit?: number;
  offset?: number;
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
    limit: filters.limit ?? 20,
    offset: filters.offset ?? 0,
    search: filters.search || undefined,
    status: filters.status || undefined,
  };

  return queryOptions({
    queryKey: postKeys.list(filters),
    queryFn: () => adminClient.get<ListEnvelope<PostListItem>>("/content/posts", params),
  });
}

export function postDetailOptions(publicId: string) {
  return queryOptions({
    queryKey: postKeys.detail(publicId),
    queryFn: () => adminClient.get<PostDetail>(`/content/posts/${publicId}`),
    enabled: !!publicId,
  });
}

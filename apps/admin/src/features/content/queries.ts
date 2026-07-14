import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListResponse } from "@/lib/api/envelopes.js";

// ── Posts ─────────────────────────────────────────────────────────────

export interface PostListItem {
  id: string;
  publicId: string;
  slug: string;
  title: string;
  postType: string;
  sourceRef: string | null;
  excerpt: string | null;
  status: string;
  featured: boolean;
  allowComments: boolean;
  author: { id: string; displayName: string; avatarUrl: string | null };
  primaryCategory: { id: string; name: string; slug: string; level?: number; path?: string | null } | null;
  tags: { id: string; name: string; slug: string }[];
  featuredImageUrl: string | null;
  publishedAt: string | null;
  firstPublishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostTopic {
  id: string;
  publicId: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parentName: string | null;
  level: number;
  path: string | null;
  sortOrder: number;
  postCount: number;
  createdAt: string;
  updatedAt: string;
  children: PostTopic[];
}

export interface PostTopicListResponse {
  items: PostTopic[];
  tree: PostTopic[];
}

export interface PostContentPayload {
  bodyHtml?: string;
  html?: string;
  body?: string;
  [key: string]: unknown;
}

export interface PostDetail extends PostListItem {
  content: PostContentPayload | null;
}

export interface PostListFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  postType?: string;
  featured?: boolean;
}

export const postKeys = {
  all: ["admin-posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (filters: PostListFilters) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (publicId: string) => [...postKeys.details(), publicId] as const,
};

export const postTopicKeys = {
  all: ["admin-post-topics"] as const,
  lists: () => [...postTopicKeys.all, "list"] as const,
};

export function postListOptions(filters: PostListFilters = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    status: filters.status || undefined,
  };

  return queryOptions({
    queryKey: postKeys.list(filters),
    queryFn: () => adminClient.get<ListResponse<PostListItem>>("/admin/content/posts", params),
  });
}

export function postDetailOptions(publicId: string) {
  return queryOptions({
    queryKey: postKeys.detail(publicId),
    queryFn: () => adminClient.get<PostDetail>(`/admin/content/posts/${publicId}`),
    enabled: !!publicId,
  });
}

export function postTopicListOptions() {
  return queryOptions({
    queryKey: postTopicKeys.lists(),
    queryFn: () => adminClient.get<PostTopicListResponse>("/admin/content/topics"),
  });
}

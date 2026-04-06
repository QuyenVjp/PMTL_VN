import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { createAdminListQuery } from "@/lib/query/create-admin-query.js";

/**
 * Community posts admin queries per ADMIN_FEATURE_QUERY_PLAN line 44
 * Covers: overview, posts, topics, moderation queue, analytics
 */

export interface CommunityPostsOverview {
  totalPosts: number;
  pendingModeration: number;
  flaggedPosts: number;
  activeTopics: number;
  lastActivity: string;
}

export interface CommunityPostItem {
  publicId: string;
  title: string;
  authorId: string;
  authorName: string;
  topicId: string;
  status: "PUBLISHED" | "HIDDEN" | "PENDING" | "FLAGGED";
  replyCount: number;
  createdAt: string;
}

export interface TopicItem {
  publicId: string;
  name: string;
  slug: string;
  description: string;
  postCount: number;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: string;
}

export interface ListFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  topicId?: string;
}

export const communityPostsAdminKeys = {
  all: ["admin-community-posts"] as const,
  overview: () => [...communityPostsAdminKeys.all, "overview"] as const,
  posts: {
    lists: () => [...communityPostsAdminKeys.all, "posts", "list"] as const,
    list: (filters: ListFilters = {}) => [...communityPostsAdminKeys.posts.lists(), filters] as const,
    details: () => [...communityPostsAdminKeys.all, "posts", "detail"] as const,
    detail: (publicId: string) => [...communityPostsAdminKeys.posts.details(), publicId] as const,
  },
  topics: {
    lists: () => [...communityPostsAdminKeys.all, "topics", "list"] as const,
    list: (filters: ListFilters = {}) => [...communityPostsAdminKeys.topics.lists(), filters] as const,
    details: () => [...communityPostsAdminKeys.all, "topics", "detail"] as const,
    detail: (publicId: string) => [...communityPostsAdminKeys.topics.details(), publicId] as const,
  },
  moderation: {
    lists: () => [...communityPostsAdminKeys.all, "moderation", "list"] as const,
    list: (filters: ListFilters = {}) => [...communityPostsAdminKeys.moderation.lists(), filters] as const,
  },
  analytics: {
    lists: () => [...communityPostsAdminKeys.all, "analytics", "list"] as const,
    list: (filters: ListFilters = {}) => [...communityPostsAdminKeys.analytics.lists(), filters] as const,
  },
};

/**
 * Fetch community posts overview
 */
export function getCommunityPostsOverviewQuery() {
  return queryOptions({
    queryKey: communityPostsAdminKeys.overview(),
    queryFn: () =>
      adminClient.get<{ data: CommunityPostsOverview }>("/admin/community-posts/overview"),
  });
}

/**
 * Fetch paginated list of community posts
 */
export function getCommunityPostsQuery(filters: ListFilters = {}) {
  const params: Record<string, unknown> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };

  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.topicId) params.topicId = filters.topicId;

  return createAdminListQuery<CommunityPostItem>({
    queryKey: communityPostsAdminKeys.posts.list(filters),
    endpoint: "/admin/community-posts",
    params,
  });
}

/**
 * Fetch single community post detail
 */
export function getCommunityPostQuery(publicId: string) {
  return queryOptions({
    queryKey: communityPostsAdminKeys.posts.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: CommunityPostItem }>(`/admin/community-posts/${publicId}`),
    enabled: !!publicId,
  });
}

/**
 * Fetch paginated list of topics
 */
export function getCommunityTopicsQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<TopicItem>({
    queryKey: communityPostsAdminKeys.topics.list(filters),
    endpoint: "/admin/community-posts/topics",
    params,
  });
}

/**
 * Fetch single topic detail
 */
export function getCommunityTopicQuery(publicId: string) {
  return queryOptions({
    queryKey: communityPostsAdminKeys.topics.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: TopicItem }>(`/admin/community-posts/topics/${publicId}`),
    enabled: !!publicId,
  });
}

/**
 * Fetch moderation queue
 */
export function getModerationQueueQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<{ publicId: string; postId: string; reason: string; reportedAt: string }>({
    queryKey: communityPostsAdminKeys.moderation.list(filters),
    endpoint: "/admin/community-posts/moderation-queue",
    params,
  });
}

/**
 * Fetch community analytics
 */
export function getCommunityAnalyticsQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 50,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<{ publicId: string; metric: string; value: number; timestamp: string }>({
    queryKey: communityPostsAdminKeys.analytics.list(filters),
    endpoint: "/admin/community-posts/analytics",
    params,
  });
}

import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { createAdminListQuery } from "@/lib/query/create-admin-query.js";

/**
 * Moderated comments admin queries per ADMIN_FEATURE_QUERY_PLAN line 46
 * Covers: overview, comments, threads, moderation queue, analytics
 */

export interface ModeratedCommentsOverview {
  totalComments: number;
  publishedComments: number;
  pendingModeration: number;
  flaggedComments: number;
  lastActivity: string;
}

export interface CommentItem {
  publicId: string;
  content: string;
  authorId: string;
  authorName: string;
  targetType: string;
  targetId: string;
  status: "PUBLISHED" | "PENDING" | "HIDDEN" | "DELETED";
  replyCount: number;
  createdAt: string;
}

export interface CommentThreadItem {
  publicId: string;
  targetType: string;
  targetId: string;
  commentCount: number;
  status: "OPEN" | "CLOSED";
  createdAt: string;
}

export interface ListFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  targetType?: string;
}

export const moderatedCommentsAdminKeys = {
  all: ["admin-moderated-comments"] as const,
  overview: () => [...moderatedCommentsAdminKeys.all, "overview"] as const,
  comments: {
    lists: () => [...moderatedCommentsAdminKeys.all, "comments", "list"] as const,
    list: (filters: ListFilters = {}) => [...moderatedCommentsAdminKeys.comments.lists(), filters] as const,
    details: () => [...moderatedCommentsAdminKeys.all, "comments", "detail"] as const,
    detail: (publicId: string) => [...moderatedCommentsAdminKeys.comments.details(), publicId] as const,
  },
  threads: {
    lists: () => [...moderatedCommentsAdminKeys.all, "threads", "list"] as const,
    list: (filters: ListFilters = {}) => [...moderatedCommentsAdminKeys.threads.lists(), filters] as const,
    details: () => [...moderatedCommentsAdminKeys.all, "threads", "detail"] as const,
    detail: (publicId: string) => [...moderatedCommentsAdminKeys.threads.details(), publicId] as const,
  },
  moderation: {
    lists: () => [...moderatedCommentsAdminKeys.all, "moderation", "list"] as const,
    list: (filters: ListFilters = {}) => [...moderatedCommentsAdminKeys.moderation.lists(), filters] as const,
  },
  analytics: {
    lists: () => [...moderatedCommentsAdminKeys.all, "analytics", "list"] as const,
    list: (filters: ListFilters = {}) => [...moderatedCommentsAdminKeys.analytics.lists(), filters] as const,
  },
};

/**
 * Fetch moderated comments overview
 */
export function getModeratedCommentsOverviewQuery() {
  return queryOptions({
    queryKey: moderatedCommentsAdminKeys.overview(),
    queryFn: () =>
      adminClient.get<{ data: ModeratedCommentsOverview }>("/admin/moderated-comments/overview"),
  });
}

/**
 * Fetch paginated list of comments
 */
export function getCommentsQuery(filters: ListFilters = {}) {
  const params: Record<string, unknown> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };

  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.targetType) params.targetType = filters.targetType;

  return createAdminListQuery<CommentItem>({
    queryKey: moderatedCommentsAdminKeys.comments.list(filters),
    endpoint: "/admin/moderated-comments",
    params,
  });
}

/**
 * Fetch single comment detail
 */
export function getCommentQuery(publicId: string) {
  return queryOptions({
    queryKey: moderatedCommentsAdminKeys.comments.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: CommentItem }>(`/admin/moderated-comments/${publicId}`),
    enabled: !!publicId,
  });
}

/**
 * Fetch paginated list of threads
 */
export function getCommentThreadsQuery(filters: ListFilters = {}) {
  const params: Record<string, unknown> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };

  if (filters.search) params.search = filters.search;
  if (filters.targetType) params.targetType = filters.targetType;

  return createAdminListQuery<CommentThreadItem>({
    queryKey: moderatedCommentsAdminKeys.threads.list(filters),
    endpoint: "/admin/moderated-comments/threads",
    params,
  });
}

/**
 * Fetch single thread detail
 */
export function getThreadQuery(publicId: string) {
  return queryOptions({
    queryKey: moderatedCommentsAdminKeys.threads.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: CommentThreadItem }>(`/admin/moderated-comments/threads/${publicId}`),
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

  return createAdminListQuery<{ publicId: string; commentId: string; reason: string; reportedAt: string }>({
    queryKey: moderatedCommentsAdminKeys.moderation.list(filters),
    endpoint: "/admin/moderated-comments/moderation-queue",
    params,
  });
}

/**
 * Fetch moderated comments analytics
 */
export function getModeratedCommentsAnalyticsQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 50,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<{ publicId: string; metric: string; value: number; timestamp: string }>({
    queryKey: moderatedCommentsAdminKeys.analytics.list(filters),
    endpoint: "/admin/moderated-comments/analytics",
    params,
  });
}

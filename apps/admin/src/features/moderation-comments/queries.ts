import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { PaginatedList } from "@/lib/api/envelopes.js";

export interface ModerationCommentItem {
  publicId: string;
  status: string;
  reasonCode: string;
  targetType: string;
  targetId: string;
  description: string | null;
  reporterSummary: {
    publicId: string;
    displayName: string;
    role: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ModerationCommentFilters {
  limit?: number;
  offset?: number;
  status?: string;
  targetType?: string;
}

export const moderationCommentKeys = {
  all: ["admin-moderation-comments"] as const,
  lists: () => [...moderationCommentKeys.all, "list"] as const,
  list: (filters: ModerationCommentFilters) =>
    [...moderationCommentKeys.lists(), filters] as const,
  details: () => [...moderationCommentKeys.all, "detail"] as const,
  detail: (publicId: string) => [...moderationCommentKeys.details(), publicId] as const,
};

export function moderationCommentListOptions(filters: ModerationCommentFilters = {}) {
  return queryOptions({
    queryKey: moderationCommentKeys.list(filters),
    // Phase 4.2 batch 2: shares /moderation/reports with moderation-reports.
    // After client unwrap, payload is { items, pagination }.
    queryFn: () =>
      adminClient.get<PaginatedList<ModerationCommentItem>>("/moderation/reports", {
        limit: filters.limit ?? 20,
        offset: filters.offset ?? 0,
        status: filters.status || undefined,
        targetType: filters.targetType || "COMMENT",
      }),
  });
}

export function moderationCommentDetailOptions(publicId: string) {
  return queryOptions({
    queryKey: moderationCommentKeys.detail(publicId),
    queryFn: () =>
      adminClient.get<ModerationCommentItem>(`/moderation/reports/${publicId}`),
    enabled: Boolean(publicId),
  });
}

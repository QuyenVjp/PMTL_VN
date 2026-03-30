import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";

export interface CommunityPostItem {
  publicId: string;
  content: string;
  status: string;
  heartCount: number;
  commentCount: number;
  reportCount: number;
  isHidden: boolean;
  isPinned: boolean;
  author: { publicId: string; displayName: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPostFilters {
  limit?: number;
  offset?: number;
  status?: string;
  search?: string;
}

export const communityPostKeys = {
  all: ["admin-community-posts"] as const,
  lists: () => [...communityPostKeys.all, "list"] as const,
  list: (filters: CommunityPostFilters) => [...communityPostKeys.lists(), filters] as const,
  details: () => [...communityPostKeys.all, "detail"] as const,
  detail: (id: string) => [...communityPostKeys.details(), id] as const,
};

export function communityPostListOptions(filters: CommunityPostFilters = {}) {
  return queryOptions({
    queryKey: communityPostKeys.list(filters),
    queryFn: () =>
      adminClient.get<ListEnvelope<CommunityPostItem>>("/admin/community/posts", {
        limit: filters.limit ?? 20,
        offset: filters.offset ?? 0,
        status: filters.status || undefined,
        search: filters.search || undefined,
      }),
  });
}

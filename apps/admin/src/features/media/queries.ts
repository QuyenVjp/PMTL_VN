import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";

export interface MediaAssetListItem {
  publicId: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  width: number | null;
  height: number | null;
  status: string;
  uploaderPublicId: string;
  uploaderName: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, string> | null;
}

export interface MediaListFilters {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  mimeType?: string;
}

export const mediaKeys = {
  all: ["admin-media"] as const,
  lists: () => [...mediaKeys.all, "list"] as const,
  list: (filters: MediaListFilters) => [...mediaKeys.lists(), filters] as const,
  details: () => [...mediaKeys.all, "detail"] as const,
  detail: (publicId: string) => [...mediaKeys.details(), publicId] as const,
};

export function mediaListOptions(filters: MediaListFilters = {}) {
  const rawLimit = filters.limit ?? 20;
  const rawOffset = filters.offset ?? 0;
  const limit = Math.min(Math.max(rawLimit, 1), 100);
  const offset = Math.max(rawOffset, 0);
  const normalizedFilters: MediaListFilters = {
    ...filters,
    limit,
    offset,
  };
  const params: Record<string, string | number | boolean | undefined> = {
    limit,
    offset,
    search: normalizedFilters.search || undefined,
    status: normalizedFilters.status || undefined,
    mimeType: normalizedFilters.mimeType || undefined,
  };

  return queryOptions({
    queryKey: mediaKeys.list(normalizedFilters),
    queryFn: () => adminClient.get<ListEnvelope<MediaAssetListItem>>("/admin/media", params),
  });
}

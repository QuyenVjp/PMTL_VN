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
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 20,
    offset: filters.offset ?? 0,
    search: filters.search || undefined,
    status: filters.status || undefined,
    mimeType: filters.mimeType || undefined,
  };

  return queryOptions({
    queryKey: mediaKeys.list(filters),
    queryFn: () => adminClient.get<ListEnvelope<MediaAssetListItem>>("/admin/media", params),
  });
}

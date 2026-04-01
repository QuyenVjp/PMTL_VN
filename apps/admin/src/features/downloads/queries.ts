import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";

// ── Types ───────────────────────────────────────────────────────────

export interface DownloadItem {
  publicId: string;
  title: string;
  description: string | null;
  category: string;
  fileMediaPublicId: string | null;
  thumbnailMediaPublicId: string | null;
  thumbnailUrl: string | null;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  status: string;
  uploader: { publicId: string; displayName: string; avatarUrl: string | null };
  publishedAt: string | null;
  createdAt: string;
}

export interface DownloadListFilters {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  category?: string;
}

// ── Query Keys ──────────────────────────────────────────────────────

export const downloadKeys = {
  all: ["admin-downloads"] as const,
  lists: () => [...downloadKeys.all, "list"] as const,
  list: (filters: DownloadListFilters) => [...downloadKeys.lists(), filters] as const,
  details: () => [...downloadKeys.all, "detail"] as const,
  detail: (publicId: string) => [...downloadKeys.details(), publicId] as const,
};

// ── Query Options ───────────────────────────────────────────────────

export function downloadListOptions(filters: DownloadListFilters = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 20,
    offset: filters.offset ?? 0,
    search: filters.search || undefined,
    status: filters.status || undefined,
    category: filters.category || undefined,
  };

  return queryOptions({
    queryKey: downloadKeys.list(filters),
    queryFn: () =>
      adminClient.get<ListEnvelope<DownloadItem>>("/admin/content/downloads", params),
  });
}

export function downloadDetailOptions(publicId: string) {
  return queryOptions({
    queryKey: downloadKeys.detail(publicId),
    queryFn: () =>
      adminClient.get<DownloadItem>(`/admin/content/downloads/${publicId}`),
    enabled: Boolean(publicId),
  });
}

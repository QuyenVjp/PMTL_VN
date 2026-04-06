import { createAdminListQuery, createAdminDetailQuery } from "@/lib/query/create-admin-query.js";

/**
 * Media admin queries per ADMIN_FEATURE_QUERY_PLAN line 41
 * Covers: assets list, detail
 */

export interface MediaAssetListItem {
  publicId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  duration?: number;
  uploadedBy: string;
  uploadedAt: string;
  usage: {
    posts: number;
    guides: number;
    otherContent: number;
  };
}

export interface MediaAssetDetail extends MediaAssetListItem {
  url: string;
  thumbnailUrl?: string;
  originalFileName: string;
  storageKey: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface MediaListFilters {
  page?: number;
  limit?: number;
  mimeType?: string;
  search?: string;
}

export const mediaAdminKeys = {
  all: ["admin-media"] as const,
  lists: () => [...mediaAdminKeys.all, "list"] as const,
  list: (filters: MediaListFilters = {}) => [...mediaAdminKeys.lists(), filters] as const,
  details: () => [...mediaAdminKeys.all, "detail"] as const,
  detail: (publicId: string) => [...mediaAdminKeys.details(), publicId] as const,
};

/**
 * Fetch paginated list of media assets
 */
export function getMediaAssetsQuery(filters: MediaListFilters = {}) {
  const params: Record<string, unknown> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };

  if (filters.mimeType) {
    params.mimeType = filters.mimeType;
  }
  if (filters.search) {
    params.search = filters.search;
  }

  return createAdminListQuery<MediaAssetListItem>({
    queryKey: mediaAdminKeys.list(filters),
    endpoint: "/admin/media",
    params,
  });
}

/**
 * Fetch single media asset detail
 */
export function getMediaAssetQuery(publicId: string) {
  return createAdminDetailQuery<MediaAssetDetail>({
    queryKey: mediaAdminKeys.detail(publicId),
    endpoint: `/admin/media/${publicId}`,
    enabled: !!publicId,
  });
}

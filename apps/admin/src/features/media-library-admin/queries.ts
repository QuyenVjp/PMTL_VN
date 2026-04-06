import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { createAdminListQuery } from "@/lib/query/create-admin-query.js";

/**
 * Media library admin queries per ADMIN_FEATURE_QUERY_PLAN line 38
 * Covers: overview, collections, media items, tags, downloads
 */

export interface MediaLibraryOverview {
  totalCollections: number;
  totalMedia: number;
  publishedMedia: number;
  totalSize: number;
  lastPublished: string;
}

export interface MediaCollectionItem {
  publicId: string;
  name: string;
  slug: string;
  description: string;
  mediaCount: number;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
}

export interface MediaLibraryItem {
  publicId: string;
  title: string;
  collectionId: string;
  mimeType: string;
  size: number;
  duration?: number;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
}

export interface ListFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export const mediaLibraryAdminKeys = {
  all: ["admin-media-library"] as const,
  overview: () => [...mediaLibraryAdminKeys.all, "overview"] as const,
  collections: {
    lists: () => [...mediaLibraryAdminKeys.all, "collections", "list"] as const,
    list: (filters: ListFilters = {}) => [...mediaLibraryAdminKeys.collections.lists(), filters] as const,
    details: () => [...mediaLibraryAdminKeys.all, "collections", "detail"] as const,
    detail: (publicId: string) => [...mediaLibraryAdminKeys.collections.details(), publicId] as const,
  },
  media: {
    lists: () => [...mediaLibraryAdminKeys.all, "media", "list"] as const,
    list: (filters: ListFilters = {}) => [...mediaLibraryAdminKeys.media.lists(), filters] as const,
    details: () => [...mediaLibraryAdminKeys.all, "media", "detail"] as const,
    detail: (publicId: string) => [...mediaLibraryAdminKeys.media.details(), publicId] as const,
  },
  tags: {
    lists: () => [...mediaLibraryAdminKeys.all, "tags", "list"] as const,
    list: (filters: ListFilters = {}) => [...mediaLibraryAdminKeys.tags.lists(), filters] as const,
  },
  downloads: () => [...mediaLibraryAdminKeys.all, "downloads"] as const,
};

/**
 * Fetch media library overview
 */
export function getMediaLibraryOverviewQuery() {
  return queryOptions({
    queryKey: mediaLibraryAdminKeys.overview(),
    queryFn: () =>
      adminClient.get<{ data: MediaLibraryOverview }>("/admin/media-library/overview"),
  });
}

/**
 * Fetch paginated list of collections
 */
export function getMediaLibraryCollectionsQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<MediaCollectionItem>({
    queryKey: mediaLibraryAdminKeys.collections.list(filters),
    endpoint: "/admin/media-library/collections",
    params,
  });
}

/**
 * Fetch single collection detail
 */
export function getMediaLibraryCollectionQuery(publicId: string) {
  return queryOptions({
    queryKey: mediaLibraryAdminKeys.collections.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: MediaCollectionItem }>(`/admin/media-library/collections/${publicId}`),
    enabled: !!publicId,
  });
}

/**
 * Fetch paginated list of media items
 */
export function getMediaLibraryItemsQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<MediaLibraryItem>({
    queryKey: mediaLibraryAdminKeys.media.list(filters),
    endpoint: "/admin/media-library/media",
    params,
  });
}

/**
 * Fetch single media item detail
 */
export function getMediaLibraryItemQuery(publicId: string) {
  return queryOptions({
    queryKey: mediaLibraryAdminKeys.media.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: MediaLibraryItem }>(`/admin/media-library/media/${publicId}`),
    enabled: !!publicId,
  });
}

/**
 * Fetch paginated list of tags
 */
export function getMediaLibraryTagsQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 50,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<{ publicId: string; name: string; usageCount: number }>({
    queryKey: mediaLibraryAdminKeys.tags.list(filters),
    endpoint: "/admin/media-library/tags",
    params,
  });
}

/**
 * Fetch downloadable resources
 */
export function getMediaLibraryDownloadsQuery() {
  return queryOptions({
    queryKey: mediaLibraryAdminKeys.downloads(),
    queryFn: () =>
      adminClient.get<{ data: Array<{ id: string; name: string; url: string }> }>(
        "/admin/media-library/downloads"
      ),
  });
}

import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";

// ── Types ─────────────────────────────────────────────────────────────

export type CollectionType =
  | "PHOTO_ALBUM"
  | "VIDEO_PLAYLIST"
  | "MIXED_GALLERY"
  | "FEATURED_STORY_GALLERY";

export type ItemType =
  | "IMAGE"
  | "VIDEO_EMBED"
  | "UPLOADED_VIDEO"
  | "POSTER"
  | "EXTERNAL_PLAYLIST_LINK";

export interface CollectionListItem {
  publicId:           string;
  title:              string;
  slug:               string;
  collectionType:     CollectionType;
  description:        string | null;
  sourceNote:         string | null;
  featured:           boolean;
  sortOrder:          number;
  status:             "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt:        string | null;
  itemCount:          number;
  coverImageUrl:      string | null;
  coverMediaPublicId: string | null;
  createdByName:      string;
  createdAt:          string;
  updatedAt:          string;
}

export interface CollectionItem {
  publicId:           string;
  itemType:           ItemType;
  externalUrl:        string | null;
  title:              string | null;
  caption:            string | null;
  ownerModule:        string | null;
  ownerPublicRef:     string | null;
  sortOrder:          number;
  createdAt:          string;
  mediaAssetPublicId: string | null;
  mediaAssetUrl:      string | null;
  mediaAssetFilename: string | null;
  mediaAssetMimeType: string | null;
  mediaAssetWidth:    number | null;
  mediaAssetHeight:   number | null;
  mediaAssetSize:     number | null;
}

// ── Query keys ────────────────────────────────────────────────────────

export const mediaLibraryKeys = {
  all:         ["admin-media-library"] as const,
  collections: () => [...mediaLibraryKeys.all, "collections"] as const,
  collection:  (id: string) => [...mediaLibraryKeys.collections(), id] as const,
  items:       (collectionId: string) => [...mediaLibraryKeys.collection(collectionId), "items"] as const,
};

// ── Query options ─────────────────────────────────────────────────────

export interface ListCollectionsFilters {
  search?:         string;
  collectionType?: CollectionType;
  status?:         string;
  limit?:          number;
  offset?:         number;
}

export function collectionsListOptions(filters: ListCollectionsFilters = {}) {
  const params: Record<string, string | number | undefined> = {
    limit:          filters.limit  ?? 50,
    offset:         filters.offset ?? 0,
    search:         filters.search         || undefined,
    collectionType: filters.collectionType || undefined,
    status:         filters.status         || undefined,
  };

  return queryOptions({
    queryKey: [...mediaLibraryKeys.collections(), filters],
    queryFn:  () =>
      adminClient.get<ListEnvelope<CollectionListItem>>(
        "/admin/content/media-library/collections",
        params,
      ),
  });
}

export function collectionItemsOptions(collectionPublicId: string) {
  return queryOptions({
    queryKey: mediaLibraryKeys.items(collectionPublicId),
    queryFn:  () =>
      adminClient.get<{ data: CollectionItem[] }>(
        `/admin/content/media-library/collections/${collectionPublicId}/items`,
        { limit: 100, offset: 0 },
      ),
    enabled: !!collectionPublicId,
  });
}

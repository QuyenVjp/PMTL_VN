import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { createAdminListQuery } from "@/lib/query/create-admin-query.js";

import type { ChantEnvironmentRulesResponse } from "@/features/chant-admin/types";

/**
 * Chant admin queries per ADMIN_FEATURE_QUERY_PLAN line 40
 * Covers: overview, collections, chants, recordings, lyrics, environment rules
 */

export interface ChantOverview {
  totalCollections: number;
  totalChants: number;
  publishedChants: number;
  recordings: number;
  lastPublished: string;
}

export interface ChantCollectionItem {
  publicId: string;
  name: string;
  slug: string;
  description: string;
  chantCount: number;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
}

export interface ChantItem {
  publicId: string;
  title: string;
  collectionId: string;
  difficulty: string;
  duration: number;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
}

export interface ListFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export const chantAdminKeys = {
  all: ["admin-chanting"] as const,
  overview: () => [...chantAdminKeys.all, "overview"] as const,
  collections: {
    lists: () => [...chantAdminKeys.all, "collections", "list"] as const,
    list: (filters: ListFilters = {}) => [...chantAdminKeys.collections.lists(), filters] as const,
    details: () => [...chantAdminKeys.all, "collections", "detail"] as const,
    detail: (publicId: string) => [...chantAdminKeys.collections.details(), publicId] as const,
  },
  chants: {
    lists: () => [...chantAdminKeys.all, "chants", "list"] as const,
    list: (filters: ListFilters = {}) => [...chantAdminKeys.chants.lists(), filters] as const,
    details: () => [...chantAdminKeys.all, "chants", "detail"] as const,
    detail: (publicId: string) => [...chantAdminKeys.chants.details(), publicId] as const,
  },
  recordings: {
    lists: () => [...chantAdminKeys.all, "recordings", "list"] as const,
    list: (filters: ListFilters = {}) => [...chantAdminKeys.recordings.lists(), filters] as const,
  },
  lyrics: {
    lists: () => [...chantAdminKeys.all, "lyrics", "list"] as const,
    list: (filters: ListFilters = {}) => [...chantAdminKeys.lyrics.lists(), filters] as const,
  },
  environmentRules: () => [...chantAdminKeys.all, "environment-rules"] as const,
};

/**
 * Fetch chant overview
 */
export function getChantOverviewQuery() {
  return queryOptions({
    queryKey: chantAdminKeys.overview(),
    queryFn: () =>
      adminClient.get<{ data: ChantOverview }>("/admin/chant/overview"),
  });
}

/**
 * Fetch paginated list of collections
 */
export function getChantCollectionsQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<ChantCollectionItem>({
    queryKey: chantAdminKeys.collections.list(filters),
    endpoint: "/admin/chant/collections",
    params,
  });
}

/**
 * Fetch single collection detail
 */
export function getChantCollectionQuery(publicId: string) {
  return queryOptions({
    queryKey: chantAdminKeys.collections.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: ChantCollectionItem }>(`/admin/chant/collections/${publicId}`),
    enabled: !!publicId,
  });
}

/**
 * Fetch paginated list of chants
 */
export function getChantItemsQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<ChantItem>({
    queryKey: chantAdminKeys.chants.list(filters),
    endpoint: "/admin/chant/chants",
    params,
  });
}

/**
 * Fetch single chant detail
 */
export function getChantItemQuery(publicId: string) {
  return queryOptions({
    queryKey: chantAdminKeys.chants.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: ChantItem }>(`/admin/chant/chants/${publicId}`),
    enabled: !!publicId,
  });
}

/**
 * Fetch paginated list of recordings
 */
export function getChantRecordingsQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<{ publicId: string; chantId: string; artist: string; duration: number }>({
    queryKey: chantAdminKeys.recordings.list(filters),
    endpoint: "/admin/chant/recordings",
    params,
  });
}

/**
 * Fetch paginated list of lyrics
 */
export function getChantLyricsQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<{ publicId: string; chantId: string; language: string; romanization?: string }>({
    queryKey: chantAdminKeys.lyrics.list(filters),
    endpoint: "/admin/chant/lyrics",
    params,
  });
}

/**
 * Fetch environment rules
 */
async function fetchEnvironmentRules(): Promise<ChantEnvironmentRulesResponse> {
  return adminClient.get<ChantEnvironmentRulesResponse>("/admin/content/chanting/environment-rules");
}

export function getChantEnvironmentRulesQueryOptions() {
  return queryOptions({
    queryKey: chantAdminKeys.environmentRules(),
    queryFn: fetchEnvironmentRules,
    staleTime: 5 * 60 * 1000,
  });
}

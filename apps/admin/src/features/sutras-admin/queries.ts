import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { createAdminListQuery } from "@/lib/query/create-admin-query.js";

/**
 * Sutras admin queries per ADMIN_FEATURE_QUERY_PLAN line 39
 * Covers: overview, texts, translations, commentaries, interpretations
 */

export interface SutrasOverview {
  totalTexts: number;
  publishedTexts: number;
  translations: number;
  commentaries: number;
  interpretations: number;
  lastPublished: string;
}

export interface SutraTextItem {
  publicId: string;
  title: string;
  slug: string;
  language: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
}

export interface SutraTranslationItem {
  publicId: string;
  sutraId: string;
  language: string;
  translator: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
}

export interface ListFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export const sutrasAdminKeys = {
  all: ["admin-sutras"] as const,
  overview: () => [...sutrasAdminKeys.all, "overview"] as const,
  texts: {
    lists: () => [...sutrasAdminKeys.all, "texts", "list"] as const,
    list: (filters: ListFilters = {}) => [...sutrasAdminKeys.texts.lists(), filters] as const,
    details: () => [...sutrasAdminKeys.all, "texts", "detail"] as const,
    detail: (publicId: string) => [...sutrasAdminKeys.texts.details(), publicId] as const,
  },
  translations: {
    lists: () => [...sutrasAdminKeys.all, "translations", "list"] as const,
    list: (filters: ListFilters = {}) => [...sutrasAdminKeys.translations.lists(), filters] as const,
    details: () => [...sutrasAdminKeys.all, "translations", "detail"] as const,
    detail: (publicId: string) => [...sutrasAdminKeys.translations.details(), publicId] as const,
  },
  commentaries: {
    lists: () => [...sutrasAdminKeys.all, "commentaries", "list"] as const,
    list: (filters: ListFilters = {}) => [...sutrasAdminKeys.commentaries.lists(), filters] as const,
  },
  interpretations: {
    lists: () => [...sutrasAdminKeys.all, "interpretations", "list"] as const,
    list: (filters: ListFilters = {}) => [...sutrasAdminKeys.interpretations.lists(), filters] as const,
  },
};

/**
 * Fetch sutras overview
 */
export function getSutrasOverviewQuery() {
  return queryOptions({
    queryKey: sutrasAdminKeys.overview(),
    queryFn: () =>
      adminClient.get<{ data: SutrasOverview }>("/admin/sutras/overview"),
  });
}

/**
 * Fetch paginated list of sutra texts
 */
export function getSutraTextsQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<SutraTextItem>({
    queryKey: sutrasAdminKeys.texts.list(filters),
    endpoint: "/admin/sutras/texts",
    params,
  });
}

/**
 * Fetch single sutra text detail
 */
export function getSutraTextQuery(publicId: string) {
  return queryOptions({
    queryKey: sutrasAdminKeys.texts.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: SutraTextItem }>(`/admin/sutras/texts/${publicId}`),
    enabled: !!publicId,
  });
}

/**
 * Fetch paginated list of translations
 */
export function getSutraTranslationsQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<SutraTranslationItem>({
    queryKey: sutrasAdminKeys.translations.list(filters),
    endpoint: "/admin/sutras/translations",
    params,
  });
}

/**
 * Fetch single translation detail
 */
export function getSutraTranslationQuery(publicId: string) {
  return queryOptions({
    queryKey: sutrasAdminKeys.translations.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: SutraTranslationItem }>(`/admin/sutras/translations/${publicId}`),
    enabled: !!publicId,
  });
}

/**
 * Fetch paginated list of commentaries
 */
export function getSutraCommentariesQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<{ publicId: string; title: string; author: string; sutraId: string }>({
    queryKey: sutrasAdminKeys.commentaries.list(filters),
    endpoint: "/admin/sutras/commentaries",
    params,
  });
}

/**
 * Fetch paginated list of interpretations
 */
export function getSutraInterpretationsQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<{ publicId: string; title: string; author: string; sutraId: string }>({
    queryKey: sutrasAdminKeys.interpretations.list(filters),
    endpoint: "/admin/sutras/interpretations",
    params,
  });
}

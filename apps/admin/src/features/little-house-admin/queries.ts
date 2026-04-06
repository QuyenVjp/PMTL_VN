import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { createAdminListQuery } from "@/lib/query/create-admin-query.js";

/**
 * Little House admin queries per ADMIN_FEATURE_QUERY_PLAN line 36
 * Covers: overview, guides, case variants, faq, downloads
 */

export interface LittleHouseOverview {
  totalGuides: number;
  publishedGuides: number;
  caseVariants: number;
  faqEntries: number;
  lastPublished: string;
}

export interface LittleHouseGuideListItem {
  publicId: string;
  title: string;
  slug: string;
  difficulty: string;
  estimatedMinutes: number;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
}

export interface LittleHouseCaseVariantItem {
  publicId: string;
  name: string;
  scenario: string;
  practiceCount: number;
  createdAt: string;
}

export interface ListFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export const littleHouseAdminKeys = {
  all: ["admin-little-house"] as const,
  overview: () => [...littleHouseAdminKeys.all, "overview"] as const,
  guides: {
    lists: () => [...littleHouseAdminKeys.all, "guides", "list"] as const,
    list: (filters: ListFilters = {}) => [...littleHouseAdminKeys.guides.lists(), filters] as const,
    details: () => [...littleHouseAdminKeys.all, "guides", "detail"] as const,
    detail: (publicId: string) => [...littleHouseAdminKeys.guides.details(), publicId] as const,
  },
  caseVariants: {
    lists: () => [...littleHouseAdminKeys.all, "variants", "list"] as const,
    list: (filters: ListFilters = {}) => [...littleHouseAdminKeys.caseVariants.lists(), filters] as const,
    details: () => [...littleHouseAdminKeys.all, "variants", "detail"] as const,
    detail: (publicId: string) => [...littleHouseAdminKeys.caseVariants.details(), publicId] as const,
  },
  faq: {
    lists: () => [...littleHouseAdminKeys.all, "faq", "list"] as const,
    list: (filters: ListFilters = {}) => [...littleHouseAdminKeys.faq.lists(), filters] as const,
  },
  downloads: () => [...littleHouseAdminKeys.all, "downloads"] as const,
};

/**
 * Fetch little house overview
 */
export function getLittleHouseOverviewQuery() {
  return queryOptions({
    queryKey: littleHouseAdminKeys.overview(),
    queryFn: () =>
      adminClient.get<{ data: LittleHouseOverview }>("/admin/little-house/overview"),
  });
}

/**
 * Fetch paginated list of guides
 */
export function getLittleHouseGuidesQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<LittleHouseGuideListItem>({
    queryKey: littleHouseAdminKeys.guides.list(filters),
    endpoint: "/admin/little-house/guides",
    params,
  });
}

/**
 * Fetch paginated list of case variants
 */
export function getLittleHouseCaseVariantsQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<LittleHouseCaseVariantItem>({
    queryKey: littleHouseAdminKeys.caseVariants.list(filters),
    endpoint: "/admin/little-house/case-variants",
    params,
  });
}

/**
 * Fetch paginated list of FAQ entries
 */
export function getLittleHouseFaqQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<{ publicId: string; question: string; answer: string; category: string; featured: boolean }>({
    queryKey: littleHouseAdminKeys.faq.list(filters),
    endpoint: "/admin/little-house/faq",
    params,
  });
}

/**
 * Fetch downloadable resources
 */
export function getLittleHouseDownloadsQuery() {
  return queryOptions({
    queryKey: littleHouseAdminKeys.downloads(),
    queryFn: () =>
      adminClient.get<{ data: Array<{ id: string; name: string; url: string }> }>(
        "/admin/little-house/downloads"
      ),
  });
}

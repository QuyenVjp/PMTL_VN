import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { createAdminListQuery } from "@/lib/query/create-admin-query.js";

/**
 * Daily practice admin queries per ADMIN_FEATURE_QUERY_PLAN line 35
 * Covers: overview, guides, presets, faq, downloads
 */

export interface DailyPracticeOverview {
  totalGuides: number;
  publishedGuides: number;
  presets: number;
  faqEntries: number;
  lastPublished: string;
}

export interface PracticeGuideListItem {
  publicId: string;
  title: string;
  slug: string;
  duration: number;
  difficulty: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
}

export interface ScenarioPresetListItem {
  publicId: string;
  name: string;
  scenarioType: string;
  practiceCount: number;
  createdAt: string;
}

export interface PracticeFaqItem {
  publicId: string;
  question: string;
  answer: string;
  category: string;
  featured: boolean;
  createdAt: string;
}

export interface ListFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export const dailyPracticeAdminKeys = {
  all: ["admin-daily-practice"] as const,
  overview: () => [...dailyPracticeAdminKeys.all, "overview"] as const,
  guides: {
    lists: () => [...dailyPracticeAdminKeys.all, "guides", "list"] as const,
    list: (filters: ListFilters = {}) => [...dailyPracticeAdminKeys.guides.lists(), filters] as const,
    details: () => [...dailyPracticeAdminKeys.all, "guides", "detail"] as const,
    detail: (publicId: string) => [...dailyPracticeAdminKeys.guides.details(), publicId] as const,
  },
  presets: {
    lists: () => [...dailyPracticeAdminKeys.all, "presets", "list"] as const,
    list: (filters: ListFilters = {}) => [...dailyPracticeAdminKeys.presets.lists(), filters] as const,
    details: () => [...dailyPracticeAdminKeys.all, "presets", "detail"] as const,
    detail: (publicId: string) => [...dailyPracticeAdminKeys.presets.details(), publicId] as const,
  },
  faq: {
    lists: () => [...dailyPracticeAdminKeys.all, "faq", "list"] as const,
    list: (filters: ListFilters = {}) => [...dailyPracticeAdminKeys.faq.lists(), filters] as const,
    details: () => [...dailyPracticeAdminKeys.all, "faq", "detail"] as const,
    detail: (publicId: string) => [...dailyPracticeAdminKeys.faq.details(), publicId] as const,
  },
  downloads: () => [...dailyPracticeAdminKeys.all, "downloads"] as const,
};

/**
 * Fetch daily practice overview
 */
export function getDailyPracticeOverviewQuery() {
  return queryOptions({
    queryKey: dailyPracticeAdminKeys.overview(),
    queryFn: () =>
      adminClient.get<{ data: DailyPracticeOverview }>("/admin/daily-practice/overview"),
  });
}

/**
 * Fetch paginated list of practice guides
 */
export function getDailyPracticeGuidesQuery(filters: ListFilters = {}) {
  const params: Record<string, unknown> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };
  if (filters.search) params.search = filters.search;

  return createAdminListQuery<PracticeGuideListItem>({
    queryKey: dailyPracticeAdminKeys.guides.list(filters),
    endpoint: "/admin/daily-practice/guides",
    params,
  });
}

/**
 * Fetch paginated list of scenario presets
 */
export function getDailyPracticePresetsQuery(filters: ListFilters = {}) {
  const params: Record<string, unknown> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };
  if (filters.search) params.search = filters.search;

  return createAdminListQuery<ScenarioPresetListItem>({
    queryKey: dailyPracticeAdminKeys.presets.list(filters),
    endpoint: "/admin/daily-practice/presets",
    params,
  });
}

/**
 * Fetch paginated list of FAQ entries
 */
export function getDailyPracticeFaqQuery(filters: ListFilters = {}) {
  const params: Record<string, unknown> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };
  if (filters.search) params.search = filters.search;

  return createAdminListQuery<PracticeFaqItem>({
    queryKey: dailyPracticeAdminKeys.faq.list(filters),
    endpoint: "/admin/daily-practice/faq",
    params,
  });
}

/**
 * Fetch downloadable resources
 */
export function getDailyPracticeDownloadsQuery() {
  return queryOptions({
    queryKey: dailyPracticeAdminKeys.downloads(),
    queryFn: () =>
      adminClient.get<{ data: Array<{ id: string; name: string; url: string }> }>(
        "/admin/daily-practice/downloads"
      ),
  });
}

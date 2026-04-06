import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { createAdminListQuery } from "@/lib/query/create-admin-query.js";

/**
 * Canon (Kinh văn) admin queries
 * Covers: scripture catalog, practice guidelines, difficulty levels, recitation counts
 */

export interface CanonOverview {
  totalScriptures: number;
  publishedScriptures: number;
  practiceGuides: number;
  lastUpdated: string;
}

export interface ScriptureItem {
  publicId: string;
  name: string;
  chineseName: string;
  abbreviation: string;
  category: "CORE" | "SUPPLEMENTARY" | "REFERENCE";
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  estimatedMinutes: number;
  minRecitations?: number;
  maxRecitations?: number;
  status: "PUBLISHED" | "DRAFT";
  createdAt: string;
}

export interface PracticeGuidelineItem {
  publicId: string;
  scriptureId: string;
  guidance: string;
  purpose: string;
  targetAudience: string;
  createdAt: string;
}

export interface ListFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  difficulty?: string;
}

export const canonAdminKeys = {
  all: ["admin-canon"] as const,
  overview: () => [...canonAdminKeys.all, "overview"] as const,
  scriptures: {
    lists: () => [...canonAdminKeys.all, "scriptures", "list"] as const,
    list: (filters: ListFilters = {}) => [...canonAdminKeys.scriptures.lists(), filters] as const,
    details: () => [...canonAdminKeys.all, "scriptures", "detail"] as const,
    detail: (publicId: string) => [...canonAdminKeys.scriptures.details(), publicId] as const,
  },
  guidelines: {
    lists: () => [...canonAdminKeys.all, "guidelines", "list"] as const,
    list: (filters: ListFilters = {}) => [...canonAdminKeys.guidelines.lists(), filters] as const,
    details: () => [...canonAdminKeys.all, "guidelines", "detail"] as const,
    detail: (publicId: string) => [...canonAdminKeys.guidelines.details(), publicId] as const,
  },
};

/**
 * Fetch canon overview
 */
export function getCanonOverviewQuery() {
  return queryOptions({
    queryKey: canonAdminKeys.overview(),
    queryFn: () =>
      adminClient.get<{ data: CanonOverview }>("/admin/canon/overview"),
  });
}

/**
 * Fetch paginated list of scriptures
 */
export function getScripturesQuery(filters: ListFilters = {}) {
  const params: Record<string, unknown> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };

  if (filters.search) params.search = filters.search;
  if (filters.category) params.category = filters.category;
  if (filters.difficulty) params.difficulty = filters.difficulty;

  return createAdminListQuery<ScriptureItem>({
    queryKey: canonAdminKeys.scriptures.list(filters),
    endpoint: "/admin/canon/scriptures",
    params,
  });
}

/**
 * Fetch single scripture detail
 */
export function getScriptureQuery(publicId: string) {
  return queryOptions({
    queryKey: canonAdminKeys.scriptures.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: ScriptureItem }>(`/admin/canon/scriptures/${publicId}`),
    enabled: !!publicId,
  });
}

/**
 * Fetch practice guidelines
 */
export function getPracticeGuidelinesQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<PracticeGuidelineItem>({
    queryKey: canonAdminKeys.guidelines.list(filters),
    endpoint: "/admin/canon/guidelines",
    params,
  });
}

/**
 * Fetch single guideline detail
 */
export function getPracticeGuidelineQuery(publicId: string) {
  return queryOptions({
    queryKey: canonAdminKeys.guidelines.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: PracticeGuidelineItem }>(`/admin/canon/guidelines/${publicId}`),
    enabled: !!publicId,
  });
}

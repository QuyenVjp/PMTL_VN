import { createAdminListQuery, createAdminDetailQuery } from "@/lib/query/create-admin-query.js";

/**
 * Beginner guides admin queries per ADMIN_FEATURE_QUERY_PLAN line 34
 * Covers: list, detail
 */

export interface BeginnerGuideListItem {
  publicId: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  estimatedMinutes: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface BeginnerGuideDetail extends BeginnerGuideListItem {
  content: string;
  excerpt?: string;
  coverImage?: string;
  videoUrl?: string;
  sections: Array<{
    id: string;
    title: string;
    content: string;
    order: number;
  }>;
  tags: string[];
}

export interface GuideListFilters {
  page?: number;
  limit?: number;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  search?: string;
}

export const beginnerGuideAdminKeys = {
  all: ["admin-beginner-guides"] as const,
  lists: () => [...beginnerGuideAdminKeys.all, "list"] as const,
  list: (filters: GuideListFilters = {}) => [...beginnerGuideAdminKeys.lists(), filters] as const,
  details: () => [...beginnerGuideAdminKeys.all, "detail"] as const,
  detail: (slugOrId: string) => [...beginnerGuideAdminKeys.details(), slugOrId] as const,
};

/**
 * Fetch paginated list of beginner guides
 */
export function getAdminBeginnerGuidesQuery(filters: GuideListFilters = {}) {
  const params: Record<string, unknown> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };

  if (filters.status) {
    params.status = filters.status;
  }
  if (filters.difficulty) {
    params.difficulty = filters.difficulty;
  }
  if (filters.search) {
    params.search = filters.search;
  }

  return createAdminListQuery<BeginnerGuideListItem>({
    queryKey: beginnerGuideAdminKeys.list(filters),
    endpoint: "/admin/beginner-guides",
    params,
  });
}

/**
 * Fetch single beginner guide detail
 */
export function getAdminBeginnerGuideQuery(slugOrId: string) {
  return createAdminDetailQuery<BeginnerGuideDetail>({
    queryKey: beginnerGuideAdminKeys.detail(slugOrId),
    endpoint: `/admin/beginner-guides/${slugOrId}`,
    enabled: !!slugOrId,
  });
}

import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { createAdminListQuery } from "@/lib/query/create-admin-query.js";

/**
 * Daily Recitation (Công Khóa) admin queries
 * Covers: practice schedules, recitation guidelines, daily routines, tracking
 */

export interface RecitationOverview {
  totalPracticeSchedules: number;
  activePractitioners: number;
  completionRate: number;
  guidanceDocuments: number;
  lastUpdated: string;
}

export interface PracticeScheduleItem {
  publicId: string;
  name: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  dailyMinutes: number;
  scriptureList: Array<{ scriptureId: string; recitations: number }>;
  minRecitations: number;
  maxRecitations?: number;
  status: "PUBLISHED" | "DRAFT";
  createdAt: string;
}

export interface RecitationGuidelineItem {
  publicId: string;
  scheduleId: string;
  topic: string;
  guidance: string;
  importance: "CRITICAL" | "IMPORTANT" | "REFERENCE";
  createdAt: string;
}

export interface DailyRoutineItem {
  publicId: string;
  scheduleId: string;
  dayNumber: number;
  scriptureSequence: string[];
  timing: string;
  notes: string;
  createdAt: string;
}

export interface ListFilters {
  page?: number;
  limit?: number;
  search?: string;
  difficulty?: string;
  status?: string;
}

export const recitationAdminKeys = {
  all: ["admin-daily-recitation"] as const,
  overview: () => [...recitationAdminKeys.all, "overview"] as const,
  schedules: {
    lists: () => [...recitationAdminKeys.all, "schedules", "list"] as const,
    list: (filters: ListFilters = {}) => [...recitationAdminKeys.schedules.lists(), filters] as const,
    details: () => [...recitationAdminKeys.all, "schedules", "detail"] as const,
    detail: (publicId: string) => [...recitationAdminKeys.schedules.details(), publicId] as const,
  },
  guidelines: {
    lists: () => [...recitationAdminKeys.all, "guidelines", "list"] as const,
    list: (filters: ListFilters = {}) => [...recitationAdminKeys.guidelines.lists(), filters] as const,
    details: () => [...recitationAdminKeys.all, "guidelines", "detail"] as const,
    detail: (publicId: string) => [...recitationAdminKeys.guidelines.details(), publicId] as const,
  },
  routines: {
    lists: () => [...recitationAdminKeys.all, "routines", "list"] as const,
    list: (filters: ListFilters = {}) => [...recitationAdminKeys.routines.lists(), filters] as const,
    details: () => [...recitationAdminKeys.all, "routines", "detail"] as const,
    detail: (publicId: string) => [...recitationAdminKeys.routines.details(), publicId] as const,
  },
};

/**
 * Fetch daily recitation overview
 */
export function getRecitationOverviewQuery() {
  return queryOptions({
    queryKey: recitationAdminKeys.overview(),
    queryFn: () =>
      adminClient.get<{ data: RecitationOverview }>("/admin/daily-recitation/overview"),
  });
}

/**
 * Fetch paginated list of practice schedules
 */
export function getPracticeSchedulesQuery(filters: ListFilters = {}) {
  const params: Record<string, unknown> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };

  if (filters.search) params.search = filters.search;
  if (filters.difficulty) params.difficulty = filters.difficulty;
  if (filters.status) params.status = filters.status;

  return createAdminListQuery<PracticeScheduleItem>({
    queryKey: recitationAdminKeys.schedules.list(filters),
    endpoint: "/admin/daily-recitation/schedules",
    params,
  });
}

/**
 * Fetch single practice schedule detail
 */
export function getPracticeScheduleQuery(publicId: string) {
  return queryOptions({
    queryKey: recitationAdminKeys.schedules.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: PracticeScheduleItem }>(`/admin/daily-recitation/schedules/${publicId}`),
    enabled: !!publicId,
  });
}

/**
 * Fetch recitation guidelines
 */
export function getRecitationGuidelinesQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<RecitationGuidelineItem>({
    queryKey: recitationAdminKeys.guidelines.list(filters),
    endpoint: "/admin/daily-recitation/guidelines",
    params,
  });
}

/**
 * Fetch single guideline detail
 */
export function getRecitationGuidelineQuery(publicId: string) {
  return queryOptions({
    queryKey: recitationAdminKeys.guidelines.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: RecitationGuidelineItem }>(`/admin/daily-recitation/guidelines/${publicId}`),
    enabled: !!publicId,
  });
}

/**
 * Fetch daily routines
 */
export function getDailyRoutinesQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 50,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<DailyRoutineItem>({
    queryKey: recitationAdminKeys.routines.list(filters),
    endpoint: "/admin/daily-recitation/routines",
    params,
  });
}

/**
 * Fetch single daily routine detail
 */
export function getDailyRoutineQuery(publicId: string) {
  return queryOptions({
    queryKey: recitationAdminKeys.routines.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: DailyRoutineItem }>(`/admin/daily-recitation/routines/${publicId}`),
    enabled: !!publicId,
  });
}

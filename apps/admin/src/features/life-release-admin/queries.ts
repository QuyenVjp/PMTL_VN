import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { createAdminListQuery } from "@/lib/query/create-admin-query.js";

/**
 * Life release admin queries per ADMIN_FEATURE_QUERY_PLAN line 37
 * Covers: overview, rituals, dedicants, locations, sponsorships
 */

export interface LifeReleaseOverview {
  totalRituals: number;
  publishedRituals: number;
  dedicants: number;
  locations: number;
  lastPublished: string;
}

export interface LifeReleaseRitualItem {
  publicId: string;
  name: string;
  description: string;
  duration: number;
  capacity: number;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
}

export interface LifeReleaseDedicantItem {
  publicId: string;
  name: string;
  intention: string;
  ritualId: string;
  createdAt: string;
}

export interface ListFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export const lifeReleaseAdminKeys = {
  all: ["admin-life-release"] as const,
  overview: () => [...lifeReleaseAdminKeys.all, "overview"] as const,
  rituals: {
    lists: () => [...lifeReleaseAdminKeys.all, "rituals", "list"] as const,
    list: (filters: ListFilters = {}) => [...lifeReleaseAdminKeys.rituals.lists(), filters] as const,
    details: () => [...lifeReleaseAdminKeys.all, "rituals", "detail"] as const,
    detail: (publicId: string) => [...lifeReleaseAdminKeys.rituals.details(), publicId] as const,
  },
  dedicants: {
    lists: () => [...lifeReleaseAdminKeys.all, "dedicants", "list"] as const,
    list: (filters: ListFilters = {}) => [...lifeReleaseAdminKeys.dedicants.lists(), filters] as const,
  },
  locations: {
    lists: () => [...lifeReleaseAdminKeys.all, "locations", "list"] as const,
    list: (filters: ListFilters = {}) => [...lifeReleaseAdminKeys.locations.lists(), filters] as const,
  },
  sponsorships: () => [...lifeReleaseAdminKeys.all, "sponsorships"] as const,
};

/**
 * Fetch life release overview
 */
export function getLifeReleaseOverviewQuery() {
  return queryOptions({
    queryKey: lifeReleaseAdminKeys.overview(),
    queryFn: () =>
      adminClient.get<{ data: LifeReleaseOverview }>("/admin/life-release/overview"),
  });
}

/**
 * Fetch paginated list of rituals
 */
export function getLifeReleaseRitualsQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<LifeReleaseRitualItem>({
    queryKey: lifeReleaseAdminKeys.rituals.list(filters),
    endpoint: "/admin/life-release/rituals",
    params,
  });
}

/**
 * Fetch single ritual detail
 */
export function getLifeReleaseRitualQuery(publicId: string) {
  return queryOptions({
    queryKey: lifeReleaseAdminKeys.rituals.detail(publicId),
    queryFn: () =>
      adminClient.get<{ data: LifeReleaseRitualItem }>(`/admin/life-release/rituals/${publicId}`),
    enabled: !!publicId,
  });
}

/**
 * Fetch paginated list of dedicants
 */
export function getLifeReleaseDicantsQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<LifeReleaseDedicantItem>({
    queryKey: lifeReleaseAdminKeys.dedicants.list(filters),
    endpoint: "/admin/life-release/dedicants",
    params,
  });
}

/**
 * Fetch paginated list of locations
 */
export function getLifeReleaseLocationsQuery(filters: ListFilters = {}) {
  const params = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    ...(filters.search && { search: filters.search }),
  };

  return createAdminListQuery<{ publicId: string; name: string; address: string; capacity: number }>({
    queryKey: lifeReleaseAdminKeys.locations.list(filters),
    endpoint: "/admin/life-release/locations",
    params,
  });
}

/**
 * Fetch sponsorships
 */
export function getLifeReleaseSponsorsQuery() {
  return queryOptions({
    queryKey: lifeReleaseAdminKeys.sponsorships(),
    queryFn: () =>
      adminClient.get<{ data: Array<{ id: string; name: string; amount: number }> }>(
        "/admin/life-release/sponsorships"
      ),
  });
}

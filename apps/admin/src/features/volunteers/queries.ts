import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { PaginatedList } from "@/lib/api/envelopes.js";

// ── Types ───────────────────────────────────────────────────────────

export interface VolunteerItem {
  publicId: string;
  displayName: string;
  role: string;
  avatarUrl: string | null;
  phone: string | null;
  zaloLink: string | null;
  bio: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VolunteerFilters {
  limit?: number;
  offset?: number;
  isActive?: boolean;
  search?: string;
}

// ── Query key factory ───────────────────────────────────────────────

export const volunteerKeys = {
  all: ["admin-volunteers"] as const,
  lists: () => [...volunteerKeys.all, "list"] as const,
  list: (filters: VolunteerFilters) => [...volunteerKeys.lists(), filters] as const,
  details: () => [...volunteerKeys.all, "detail"] as const,
  detail: (publicId: string) => [...volunteerKeys.details(), publicId] as const,
};

// ── Query options ───────────────────────────────────────────────────

export function volunteerListOptions(filters: VolunteerFilters = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
  };

  if (filters.isActive !== undefined) {
    params.isActive = filters.isActive;
  }
  if (filters.search) {
    params.search = filters.search;
  }

  return queryOptions({
    queryKey: volunteerKeys.list(filters),
    queryFn: () =>
      // Phase 4.2 batch 3a: after client unwrap, payload is { items, pagination }.
      adminClient.get<PaginatedList<VolunteerItem>>("/admin/volunteers", params),
  });
}

export function volunteerDetailOptions(publicId: string) {
  return queryOptions({
    queryKey: volunteerKeys.detail(publicId),
    queryFn: () => adminClient.get<VolunteerItem>(`/admin/volunteers/${publicId}`),
    enabled: Boolean(publicId),
  });
}

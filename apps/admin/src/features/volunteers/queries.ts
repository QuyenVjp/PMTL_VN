import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";

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
}

export interface VolunteerFilters {
  limit?: number;
  offset?: number;
}

// ── Query key factory ───────────────────────────────────────────────

export const volunteerKeys = {
  all: ["admin-volunteers"] as const,
  lists: () => [...volunteerKeys.all, "list"] as const,
  list: (filters: VolunteerFilters) => [...volunteerKeys.lists(), filters] as const,
};

// ── Query options ───────────────────────────────────────────────────

export function volunteerListOptions(filters: VolunteerFilters = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
  };

  return queryOptions({
    queryKey: volunteerKeys.list(filters),
    queryFn: () =>
      adminClient.get<ListEnvelope<VolunteerItem>>("/admin/volunteers", params),
  });
}

/**
 * SCAFFOLD — queries.ts
 *
 * Replace [Feature] / [feature] / [features] / [domain] throughout.
 * Never expose internal DB `id` — use publicId only.
 */
import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";

// ── Item shape (matches API response) ────────────────────────────────

export interface [Feature]Item {
  publicId: string;
  title: string;
  status: string;
  createdAt: string;
  // Add remaining fields — never include internal `id`
}

// ── List filters ──────────────────────────────────────────────────────

export interface [Feature]ListFilters {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
}

// ── Query keys ────────────────────────────────────────────────────────

export const [feature]Keys = {
  all:     ["admin-[features]"] as const,
  lists:   () => [...[feature]Keys.all, "list"] as const,
  list:    (f: [Feature]ListFilters) => [...[feature]Keys.lists(), f] as const,
  details: () => [...[feature]Keys.all, "detail"] as const,
  detail:  (publicId: string) => [...[feature]Keys.details(), publicId] as const,
};

// ── Query options ─────────────────────────────────────────────────────

export function [feature]ListOptions(filters: [Feature]ListFilters = {}) {
  const params: Record<string, string | number | undefined> = {
    limit:  filters.limit  ?? 20,
    offset: filters.offset ?? 0,
    search: filters.search || undefined,
    status: filters.status || undefined,
  };

  return queryOptions({
    queryKey: [feature]Keys.list(filters),
    queryFn:  () =>
      adminClient.get<ListEnvelope<[Feature]Item>>("/admin/[domain]/[features]", params),
  });
}

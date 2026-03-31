import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";

// ── Types ───────────────────────────────────────────────────────────

export interface GuideItem {
  publicId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverMediaPublicId: string | null;
  coverImageUrl: string | null;
  category: string;
  status: string;
  author: { publicId: string; displayName: string; avatarUrl: string | null };
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GuideListFilters {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  category?: string;
}

// ── Query Keys ──────────────────────────────────────────────────────

export const guideKeys = {
  all: ["admin-beginner-guides"] as const,
  lists: () => [...guideKeys.all, "list"] as const,
  list: (filters: GuideListFilters) => [...guideKeys.lists(), filters] as const,
  details: () => [...guideKeys.all, "detail"] as const,
  detail: (publicId: string) => [...guideKeys.details(), publicId] as const,
};

// ── Query Options ───────────────────────────────────────────────────

export function guideListOptions(filters: GuideListFilters = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 20,
    offset: filters.offset ?? 0,
    search: filters.search || undefined,
    status: filters.status || undefined,
    category: filters.category || undefined,
  };

  return queryOptions({
    queryKey: guideKeys.list(filters),
    queryFn: () =>
      adminClient.get<ListEnvelope<GuideItem>>("/admin/content/guides", params),
  });
}

import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";

// ── Types ───────────────────────────────────────────────────────────

export interface VowHistoryItem {
  publicId: string;
  vowType: string;
  description: string;
  targetCount: number | null;
  currentCount: number;
  status: string;
  member?: { publicId: string; displayName: string; email: string; avatarUrl?: string | null };
  user?: { publicId: string; displayName: string; email: string; avatarUrl?: string | null };
  startDate: string;
  createdAt: string;
}

export interface MemberSearchResult {
  publicId: string;
  displayName: string;
  email: string;
}

export interface MemberVowSummary {
  publicId: string;
  vowType: string;
  description: string;
  targetCount: number | null;
  currentCount: number;
  status: string;
}

export interface VowHistoryFilters {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
}

// ── Query Keys ──────────────────────────────────────────────────────

export const assistedEntryKeys = {
  all: ["admin-assisted-entry"] as const,
  lists: () => [...assistedEntryKeys.all, "list"] as const,
  list: (filters: VowHistoryFilters) => [...assistedEntryKeys.lists(), filters] as const,
  details: () => [...assistedEntryKeys.all, "detail"] as const,
  detail: (memberPublicId: string) => [...assistedEntryKeys.details(), memberPublicId] as const,
  memberSearch: (search: string) =>
    [...assistedEntryKeys.all, "member-search", search] as const,
  memberVows: (memberPublicId: string) =>
    [...assistedEntryKeys.detail(memberPublicId), "member-vows"] as const,
};

// ── Query Options ───────────────────────────────────────────────────

export function vowHistoryOptions(filters: VowHistoryFilters = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 20,
    offset: filters.offset ?? 0,
    search: filters.search || undefined,
    status: filters.status || undefined,
  };

  return queryOptions({
    queryKey: assistedEntryKeys.list(filters),
    queryFn: () =>
      adminClient.get<ListEnvelope<VowHistoryItem>>(
        "/admin/vows/assisted-entry/history",
        params,
      ),
  });
}

export function memberSearchOptions(search: string) {
  return queryOptions({
    queryKey: assistedEntryKeys.memberSearch(search),
    queryFn: () =>
      adminClient.get<MemberSearchResult[]>(
        "/admin/vows/assisted-entry/members/search",
        { search, limit: 10 },
      ),
    enabled: search.length >= 2,
  });
}

export function memberVowsOptions(memberPublicId: string | undefined) {
  return queryOptions({
    queryKey: assistedEntryKeys.memberVows(memberPublicId ?? ""),
    queryFn: () =>
      adminClient.get<{
        data: MemberVowSummary[];
        member: { publicId: string; displayName: string };
      }>(`/admin/vows/assisted-entry/members/${memberPublicId}/vows`),
    enabled: Boolean(memberPublicId),
  });
}

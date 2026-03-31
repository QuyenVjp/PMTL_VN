import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client";
import type { ListEnvelope } from "@/lib/api/envelopes.js";

// ── Types ────────────────────────────────────────────────────────────

export interface WisdomEntryAuthor {
  publicId: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface WisdomEntryItem {
  id: string;
  publicId: string;
  title: string;
  slug: string;
  entryType: "BACH_THOAI" | "KHAI_THI" | "PHAT_NGON" | "PHAP_HOI";
  sourceFamily: string | null;
  sourceUrl: string | null;
  sourceCode: string | null;
  originalText: string | null;
  translatedText: string | null;
  excerpt: string | null;
  tags: string[];
  status: string;
  author: WisdomEntryAuthor;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Query key factory ────────────────────────────────────────────────

export const wisdomKeys = {
  all: ["admin-wisdom"] as const,
  lists: () => [...wisdomKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...wisdomKeys.lists(), filters] as const,
  detail: (publicId: string) => [...wisdomKeys.all, "detail", publicId] as const,
};

// ── Query options ────────────────────────────────────────────────────

export function wisdomEntryListOptions(filters: { limit?: number; offset?: number; status?: string; entryType?: string } = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 20,
    offset: filters.offset ?? 0,
    ...(filters.status && { status: filters.status }),
    ...(filters.entryType && { entryType: filters.entryType }),
  };
  return queryOptions({
    queryKey: wisdomKeys.list(filters),
    queryFn: () => adminClient.get<ListEnvelope<WisdomEntryItem>>("/admin/wisdom/entries", params),
  });
}

export function wisdomEntryDetailOptions(publicId: string) {
  return queryOptions({
    queryKey: wisdomKeys.detail(publicId),
    queryFn: () => adminClient.get<WisdomEntryItem>(`/admin/wisdom/entries/${publicId}`),
  });
}

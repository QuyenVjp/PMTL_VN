import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "./client.js";
import type { ListEnvelope } from "../core/envelopes.js";

// ── Types ─────────────────────────────────────────────────────────────

export type SessionStatus = "active" | "revoked" | "expired";

export interface AdminSessionListItem {
  sessionId: string;
  userPublicId: string;
  userDisplayName: string;
  userEmail: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  status: SessionStatus;
}

export interface SessionListFilters {
  status?: SessionStatus;
  userId?: string;
  limit?: number;
  offset?: number;
}

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  active: "Hoạt động",
  revoked: "Đã thu hồi",
  expired: "Hết hạn",
};

export function sessionStatusLabel(status: SessionStatus): string {
  return SESSION_STATUS_LABELS[status] ?? status;
}

export function sessionStatusVariant(
  status: SessionStatus,
): "default" | "secondary" | "outline" {
  if (status === "active") return "secondary";
  if (status === "expired") return "outline";
  return "default";
}

// ── Query key factory ─────────────────────────────────────────────────

export const sessionAdminKeys = {
  all: ["admin-sessions"] as const,
  lists: () => [...sessionAdminKeys.all, "list"] as const,
  list: (filters: SessionListFilters) => [...sessionAdminKeys.lists(), filters] as const,
  details: () => [...sessionAdminKeys.all, "detail"] as const,
  detail: (sessionId: string) => [...sessionAdminKeys.details(), sessionId] as const,
};

// ── Query options ─────────────────────────────────────────────────────

export function sessionListOptions(filters: SessionListFilters = {}) {
  return queryOptions({
    queryKey: sessionAdminKeys.list(filters),
    queryFn: () =>
      adminClient.get<ListEnvelope<AdminSessionListItem>>("/admin/sessions", {
        limit: filters.limit ?? 50,
        offset: filters.offset ?? 0,
        status: filters.status,
        userId: filters.userId,
      }),
  });
}

export function sessionDetailOptions(sessionId: string | undefined) {
  return queryOptions({
    queryKey: sessionAdminKeys.detail(sessionId ?? ""),
    queryFn: () =>
      adminClient.get<{ data: AdminSessionListItem }>(`/admin/sessions/${sessionId ?? ""}`),
    enabled: Boolean(sessionId),
  });
}

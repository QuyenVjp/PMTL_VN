/** API-aligned types for Admin Sessions feature */

export type SessionStatus = "active" | "revoked" | "expired";

/** Session list item returned by GET /admin/sessions */
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

export function sessionStatusVariant(status: SessionStatus): "default" | "secondary" | "outline" {
  if (status === "active") return "secondary";
  if (status === "expired") return "outline";
  return "default"; // revoked
}

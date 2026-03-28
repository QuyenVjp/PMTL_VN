import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "./client.js";
import type { ListEnvelope } from "../core/envelopes.js";

// ── Types ─────────────────────────────────────────────────────────────

export type ReportStatus = "PENDING" | "RESOLVED_HIDE" | "RESOLVED_IGNORE" | "RESOLVED_ESCALATE";
export type DecisionType = "hide" | "ignore" | "escalate";

export interface ReporterSummary {
  publicId: string;
  displayName: string;
  role: string;
}

export interface ModerationReportListItem {
  publicId: string;
  status: ReportStatus;
  reasonCode: string;
  targetType: string;
  targetId: string;
  description: string | null;
  reporterSummary: ReporterSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportListFilters {
  status?: ReportStatus;
  targetType?: string;
  limit?: number;
  offset?: number;
}

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: "Chờ xử lý",
  RESOLVED_HIDE: "Đã ẩn",
  RESOLVED_IGNORE: "Bỏ qua",
  RESOLVED_ESCALATE: "Đã leo thang",
};

export const DECISION_LABELS: Record<DecisionType, string> = {
  hide: "Ẩn nội dung",
  ignore: "Bỏ qua",
  escalate: "Leo thang",
};

export function reportStatusLabel(status: ReportStatus): string {
  return REPORT_STATUS_LABELS[status] ?? status;
}

export function reportStatusVariant(
  status: ReportStatus,
): "default" | "secondary" | "outline" {
  if (status === "PENDING") return "outline";
  if (status === "RESOLVED_IGNORE") return "secondary";
  return "default";
}

export const statusFilterOptions = [
  { label: "Chờ xử lý", value: "PENDING" },
  { label: "Đã ẩn", value: "RESOLVED_HIDE" },
  { label: "Bỏ qua", value: "RESOLVED_IGNORE" },
  { label: "Đã leo thang", value: "RESOLVED_ESCALATE" },
];

// ── Query key factory ─────────────────────────────────────────────────

export const reportKeys = {
  all: ["admin-moderation-reports"] as const,
  lists: () => [...reportKeys.all, "list"] as const,
  list: (filters: ReportListFilters) => [...reportKeys.lists(), filters] as const,
};

// ── Query options ─────────────────────────────────────────────────────

export function reportListOptions(filters: ReportListFilters = {}) {
  return queryOptions({
    queryKey: reportKeys.list(filters),
    queryFn: () =>
      adminClient.get<ListEnvelope<ModerationReportListItem>>("/moderation/reports", {
        limit: filters.limit ?? 50,
        offset: filters.offset ?? 0,
        status: filters.status,
        targetType: filters.targetType,
      }),
  });
}

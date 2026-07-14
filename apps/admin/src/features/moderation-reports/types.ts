/**
 * Moderation reports types — re-exported from @pmtl/api-client.
 * Source of truth: packages/api-client/src/admin/moderation-reports.ts
 */
export {
  REPORT_STATUS_LABELS,
  DECISION_LABELS,
  reportStatusLabel,
  reportStatusVariant,
  statusFilterOptions,
} from "@pmtl/api-client";

export type {
  ReportStatus,
  DecisionType,
  ReporterSummary,
  ModerationReportListItem,
  ModerationReportDetail,
  ReportTargetPreview,
  ReportListFilters,
} from "@pmtl/api-client";

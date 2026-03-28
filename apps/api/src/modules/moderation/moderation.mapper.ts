import type { ModerationReport, User } from "../../generated/prisma/client.js";

type ReporterRow = Pick<User, "publicId" | "displayName" | "role">;

type TargetPreview = {
  type: string;
  publicId: string;
  title: string;
  slug: string | null;
};

export function mapReportToListItem(
  report: ModerationReport,
  reporter: ReporterRow | null | undefined,
) {
  return {
    publicId: report.publicId,
    status: report.status,
    reasonCode: report.reasonCode,
    targetType: report.targetType,
    targetId: report.targetId,
    description: report.description,
    reporterSummary: reporter
      ? { publicId: reporter.publicId, displayName: reporter.displayName, role: reporter.role }
      : null,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

export function mapReportToDetail(
  report: ModerationReport,
  reporter: ReporterRow | null | undefined,
  targetPreview: TargetPreview,
) {
  return {
    publicId: report.publicId,
    status: report.status,
    reasonCode: report.reasonCode,
    description: report.description,
    targetType: report.targetType,
    targetId: report.targetId,
    targetPreview,
    reporterSummary: reporter
      ? { publicId: reporter.publicId, displayName: reporter.displayName, role: reporter.role }
      : null,
    decisionBy: report.decisionBy,
    decisionAt: report.decisionAt,
    decisionNote: report.decisionNote,
    currentDecisionOptions: report.status === "PENDING" ? ["hide", "ignore", "escalate"] : [],
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

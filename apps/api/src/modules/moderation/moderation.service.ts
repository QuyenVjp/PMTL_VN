import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { NotFoundError, ConflictError } from "../../common/errors/app-error.js";
import { ModerationRepository } from "./moderation.repository.js";
import type { ReportStatus } from "../../generated/prisma/client.js";
import type { ModerationReportListQuery, ModerationDecisionInput } from "./moderation.schemas.js";

const DECISION_TO_STATUS: Record<string, ReportStatus> = {
  hide: "RESOLVED_HIDE",
  ignore: "RESOLVED_IGNORE",
  escalate: "RESOLVED_ESCALATE",
};

@Injectable()
export class ModerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: ModerationRepository,
    private readonly audit: AuditService,
  ) {}

  async list(query: ModerationReportListQuery) {
    const { reports, total } = await this.repository.findMany(query);

    // Batch-fetch reporter display names
    const reporterIds = [...new Set(reports.map((r) => r.reporterUserId))];
    const reporters = reporterIds.length > 0
      ? await this.prisma.user.findMany({
          where: { id: { in: reporterIds } },
          select: { id: true, publicId: true, displayName: true, role: true },
        })
      : [];
    const reporterMap = new Map(reporters.map((u) => [u.id, u]));

    return {
      data: reports.map((r) => {
        const reporter = reporterMap.get(r.reporterUserId);
        return {
          publicId: r.publicId,
          status: r.status,
          reasonCode: r.reasonCode,
          targetType: r.targetType,
          targetId: r.targetId,
          description: r.description,
          reporterSummary: reporter
            ? { publicId: reporter.publicId, displayName: reporter.displayName, role: reporter.role }
            : null,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        };
      }),
      meta: {
        pagination: {
          total,
          limit: query.limit,
          offset: query.offset,
          hasMore: query.offset + query.limit < total,
        },
      },
    };
  }

  async getDetail(publicId: string) {
    const report = await this.repository.findByPublicId(publicId);
    if (!report) {
      throw new NotFoundError("Báo cáo", publicId);
    }

    // Fetch reporter info
    const reporter = await this.prisma.user.findUnique({
      where: { id: report.reporterUserId },
      select: { publicId: true, displayName: true, role: true },
    });

    // Build target preview — fetch title from target table
    const targetPreview = await this.buildTargetPreview(report.targetType, report.targetId);

    // Decision options based on current status
    const currentDecisionOptions = report.status === "PENDING"
      ? ["hide", "ignore", "escalate"]
      : [];

    return {
      data: {
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
        currentDecisionOptions,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      },
    };
  }

  async resolveReport(
    publicId: string,
    input: ModerationDecisionInput,
    actorId: string,
    auditCtx: AuditContext,
  ) {
    const report = await this.repository.findByPublicId(publicId);
    if (!report) {
      throw new NotFoundError("Báo cáo", publicId);
    }

    if (report.status !== "PENDING") {
      throw new ConflictError("Báo cáo đã được xử lý");
    }

    const newStatus = DECISION_TO_STATUS[input.decision];
    if (!newStatus) {
      throw new ConflictError("Quyết định không hợp lệ");
    }

    const updated = await this.repository.updateDecision(
      publicId,
      newStatus,
      actorId,
      input.note,
    );

    await this.audit.append(
      auditCtx,
      "admin.user.status_change",
      "moderation_report",
      report.id,
      {
        decision: input.decision,
        targetType: report.targetType,
        targetId: report.targetId,
        note: input.note,
      },
    );

    return {
      data: {
        publicId: updated.publicId,
        status: updated.status,
        decisionBy: updated.decisionBy,
        decisionAt: updated.decisionAt,
        decisionNote: updated.decisionNote,
      },
    };
  }

  private async buildTargetPreview(targetType: string, targetId: string) {
    if (targetType === "post") {
      const post = await this.prisma.post.findUnique({
        where: { id: targetId },
        select: { publicId: true, title: true, slug: true, status: true },
      });
      return post
        ? { type: "post", publicId: post.publicId, title: post.title, slug: post.slug }
        : { type: "post", publicId: targetId, title: "(Đã xóa)", slug: null };
    }

    // Fallback for types not yet in schema
    return { type: targetType, publicId: targetId, title: `(${targetType})`, slug: null };
  }
}

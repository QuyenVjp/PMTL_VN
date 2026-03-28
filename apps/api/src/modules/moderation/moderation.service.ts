import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { NotFoundError, ConflictError } from "../../common/errors/app-error.js";
import { ModerationRepository } from "./moderation.repository.js";
import { mapReportToListItem, mapReportToDetail } from "./moderation.mapper.js";
import { assertReportIsPending } from "./moderation.policy.js";
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

    const reporterIds = [...new Set(reports.map((r) => r.reporterUserId))];
    const reporters = reporterIds.length > 0
      ? await this.prisma.user.findMany({
          where: { id: { in: reporterIds } },
          select: { id: true, publicId: true, displayName: true, role: true },
        })
      : [];
    const reporterMap = new Map(reporters.map((u) => [u.id, u]));

    return {
      data: reports.map((r) => mapReportToListItem(r, reporterMap.get(r.reporterUserId))),
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

    const reporter = await this.prisma.user.findUnique({
      where: { id: report.reporterUserId },
      select: { publicId: true, displayName: true, role: true },
    });

    const targetPreview = await this.buildTargetPreview(report.targetType, report.targetId);

    return { data: mapReportToDetail(report, reporter, targetPreview) };
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

    assertReportIsPending(report.status);

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

    const auditMeta: Record<string, unknown> = {
      decision: input.decision,
      targetType: report.targetType,
      targetId: report.targetId,
    };
    if (input.note !== undefined) auditMeta.note = input.note;

    await this.audit.append(
      auditCtx,
      "admin.user.status_change",
      "moderation_report",
      report.id,
      auditMeta,
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

    return { type: targetType, publicId: targetId, title: `(${targetType})`, slug: null };
  }
}

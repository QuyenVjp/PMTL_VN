import { Injectable, Logger } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { NotFoundError, ConflictError } from "../../common/errors/app-error.js";
import { ModerationRepository } from "./moderation.repository.js";
import { mapReportToListItem, mapReportToDetail } from "./moderation.mapper.js";
import { assertReportIsPending } from "./moderation.policy.js";
import type { ReportStatus } from "../../generated/prisma/client.js";
import type {
  ModerationReportListQuery,
  ModerationDecisionInput,
  SubmitReportInput,
  AdminCommentQuery,
} from "./moderation.schemas.js";

const DECISION_TO_STATUS: Record<string, ReportStatus> = {
  hide: "RESOLVED_HIDE",
  ignore: "RESOLVED_IGNORE",
  escalate: "RESOLVED_ESCALATE",
};

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

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

    // Phase 4.2 batch 2: canary list shape — rides inside transport `data`.
    // Shared by moderation-reports + moderation-comments Admin readers.
    // Do NOT return legacy ListEnvelope { data, meta.pagination } (double-wraps on wire).
    return {
      items: reports.map((r) => mapReportToListItem(r, reporterMap.get(r.reporterUserId))),
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + query.limit < total,
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
      "moderation.report.resolved",
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

  // ─── Public report submission ───────────────────────────────────────────────

  async submitReport(input: SubmitReportInput, reporterUserId: string, auditCtx: AuditContext) {
    const duplicate = await this.repository.findDuplicatePendingReport(
      reporterUserId,
      input.targetType,
      input.targetId,
    );
    if (duplicate) {
      throw new ConflictError("Bạn đã báo cáo mục này và đang chờ xử lý");
    }

    const publicId = nanoid(21);
    const report = await this.repository.createReport({
      publicId,
      reporterUserId,
      targetType: input.targetType,
      targetId: input.targetId,
      reasonCode: input.reasonCode,
      description: input.description,
    });

    await this.audit.append(auditCtx, "moderation.report.submitted", "moderation_report", report.publicId, {
      targetType: input.targetType,
      targetId: input.targetId,
      reasonCode: input.reasonCode,
    });

    this.logger.log({
      msg: "report.submitted",
      reporterUserId,
      publicId: report.publicId,
      targetType: input.targetType,
    });

    return {
      data: {
        publicId: report.publicId,
        status: report.status,
        targetType: report.targetType,
        targetId: report.targetId,
        reasonCode: report.reasonCode,
        createdAt: report.createdAt,
      },
    };
  }

  // ─── Admin comment moderation ─────────────────────────────────────────────

  async listCommentsForModeration(query: AdminCommentQuery) {
    const reportedCommentIds = await this.prisma.moderationReport
      .findMany({
        where: { targetType: "comment", status: "PENDING" },
        select: { targetId: true },
      })
      .then((rows) => rows.map((r) => r.targetId));

    const where = {
      OR: [
        { isHidden: true },
        ...(reportedCommentIds.length > 0 ? [{ publicId: { in: reportedCommentIds } }] : []),
      ],
    };

    const [data, total] = await Promise.all([
      this.prisma.communityComment.findMany({
        where,
        include: {
          author: { select: { publicId: true, displayName: true } },
          post: { select: { publicId: true, content: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.communityComment.count({ where }),
    ]);

    return {
      data: data.map((c) => ({
        publicId: c.publicId,
        content: c.content,
        isHidden: c.isHidden,
        author: c.author,
        post: { publicId: c.post.publicId },
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
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

  async hideComment(publicId: string, actorId: string, auditCtx: AuditContext) {
    const comment = await this.prisma.communityComment.findUnique({
      where: { publicId },
      include: { author: { select: { publicId: true, displayName: true } } },
    });
    if (!comment) {
      throw new NotFoundError("Bình luận", publicId);
    }

    if (comment.isHidden) {
      throw new ConflictError("Bình luận đã bị ẩn");
    }

    const updated = await this.prisma.communityComment.update({
      where: { publicId },
      data: { isHidden: true },
    });

    await this.audit.append(auditCtx, "moderation.comment.hidden", "community_comment", publicId, {
      action: "hide",
      commentAuthor: comment.author.publicId,
    });

    this.logger.log({ msg: "comment.hidden", publicId, actorId });

    return {
      data: {
        publicId: updated.publicId,
        isHidden: updated.isHidden,
        updatedAt: updated.updatedAt,
      },
    };
  }

  async restoreComment(publicId: string, actorId: string, auditCtx: AuditContext) {
    const comment = await this.prisma.communityComment.findUnique({
      where: { publicId },
      include: { author: { select: { publicId: true, displayName: true } } },
    });
    if (!comment) {
      throw new NotFoundError("Bình luận", publicId);
    }

    if (!comment.isHidden) {
      throw new ConflictError("Bình luận không ở trạng thái ẩn");
    }

    const updated = await this.prisma.communityComment.update({
      where: { publicId },
      data: { isHidden: false },
    });

    await this.audit.append(auditCtx, "moderation.comment.restored", "community_comment", publicId, {
      action: "restore",
      commentAuthor: comment.author.publicId,
    });

    this.logger.log({ msg: "comment.restored", publicId, actorId });

    return {
      data: {
        publicId: updated.publicId,
        isHidden: updated.isHidden,
        updatedAt: updated.updatedAt,
      },
    };
  }

  // ─── Admin: comment detail ────────────────────────────────────────────────

  async getCommentDetail(publicId: string) {
    const comment = await this.prisma.communityComment.findUnique({
      where: { publicId },
      include: {
        author: { select: { publicId: true, displayName: true, role: true } },
        post: { select: { publicId: true, content: true } },
      },
    });
    if (!comment) {
      throw new NotFoundError("Bình luận", publicId);
    }

    const pendingReports = await this.prisma.moderationReport.findMany({
      where: { targetType: "comment", targetId: publicId, status: "PENDING" },
      select: { publicId: true, reasonCode: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return {
      data: {
        publicId: comment.publicId,
        content: comment.content,
        isHidden: comment.isHidden,
        author: comment.author,
        post: { publicId: comment.post.publicId },
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        pendingReports,
      },
    };
  }

  // ─── Admin: recompute summary ─────────────────────────────────────────────

  async recomputeSummary(auditCtx: AuditContext) {
    const [pending, resolvedHide, resolvedIgnore, resolvedEscalate, total] = await Promise.all([
      this.prisma.moderationReport.count({ where: { status: "PENDING" } }),
      this.prisma.moderationReport.count({ where: { status: "RESOLVED_HIDE" } }),
      this.prisma.moderationReport.count({ where: { status: "RESOLVED_IGNORE" } }),
      this.prisma.moderationReport.count({ where: { status: "RESOLVED_ESCALATE" } }),
      this.prisma.moderationReport.count(),
    ]);

    const hiddenComments = await this.prisma.communityComment.count({ where: { isHidden: true } });

    const summary = {
      total,
      pending,
      resolved: resolvedHide + resolvedIgnore + resolvedEscalate,
      byStatus: {
        PENDING: pending,
        RESOLVED_HIDE: resolvedHide,
        RESOLVED_IGNORE: resolvedIgnore,
        RESOLVED_ESCALATE: resolvedEscalate,
      },
      hiddenComments,
      recomputedAt: new Date().toISOString(),
    };

    await this.audit.append(auditCtx, "moderation.summary.recomputed", "moderation_summary", "global", {
      pending,
      total,
      hiddenComments,
    });

    this.logger.log({ msg: "moderation.summary.recomputed", pending, total });

    return { data: summary };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

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

import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { DharmaComplianceRepository } from "./dharma-compliance.repository.js";
import {
  mapCharityToAdminItem,
  mapCharityToDetail,
  mapFraudAlertToItem,
  mapVowToAdminItem,
  mapThoughtLogToItem,
  mapGuidanceToItem,
} from "./dharma-compliance.mapper.js";
import type {
  CharityQuery,
  CreateCharityInput,
  UpdateCharityStatusInput,
  CreateCharityRuleInput,
  UpdateCharityRuleInput,
  FraudAlertQuery,
  ResolveFraudAlertInput,
  VowQuery,
  RegisterVowInput,
  LogThoughtInput,
  GuidanceRequestInput,
  RespondGuidanceInput,
  ReportViolationInput,
  ThoughtLogQuery,
  GuidanceQueueQuery,
} from "./dharma-compliance.schemas.js";

const REPEAT_VIOLATION_WINDOW_DAYS = 30;
const REPEAT_VIOLATION_ESCALATION_THRESHOLD = 3;

@Injectable()
export class DharmaComplianceService {
  constructor(
    private readonly repo: DharmaComplianceRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ─── Charity ─────────────────────────────────────────────────────────────

  async listCharities(query: CharityQuery) {
    const { data, total } = await this.repo.findManyCharities(query);
    return {
      data: data.map(mapCharityToAdminItem),
      meta: { total, limit: query.limit, offset: query.offset },
    };
  }

  async getCharity(publicId: string) {
    const charity = await this.repo.findCharityByPublicId(publicId);
    if (!charity) throw new NotFoundException("Tổ chức từ thiện không tồn tại");
    return mapCharityToDetail(charity);
  }

  async createCharity(input: CreateCharityInput, adminId: string, auditCtx: AuditContext) {
    const charity = await this.repo.createCharity(input, nanoid(21));
    await this.audit.append(auditCtx, "admin.charity.create", "charity", charity.publicId, {
      name: input.name,
      charityType: input.charityType,
    });
    return mapCharityToDetail(charity);
  }

  async updateCharityStatus(publicId: string, input: UpdateCharityStatusInput, adminId: string, auditCtx: AuditContext) {
    const charity = await this.repo.findCharityByPublicId(publicId);
    if (!charity) throw new NotFoundException("Tổ chức từ thiện không tồn tại");
    // Atomic: status change + audit log in a single transaction. If audit fails, the
    // status change rolls back so the charity record never drifts from the audit trail.
    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await tx.charityWhitelist.update({
        where: { id: charity.id },
        data: { status: input.status as never },
      });
      await this.audit.appendInTransaction(
        tx,
        auditCtx,
        "admin.charity.status_update",
        "charity",
        publicId,
        { from: charity.status, to: input.status, reason: input.reason, adminId },
      );
      return next;
    });
    return mapCharityToDetail(updated);
  }

  // ─── Fraud Alerts ─────────────────────────────────────────────────────────

  async listFraudAlerts(query: FraudAlertQuery) {
    const { data, total } = await this.repo.findManyFraudAlerts(query);
    return {
      data: data.map(mapFraudAlertToItem),
      meta: { total, limit: query.limit, offset: query.offset },
    };
  }

  async getFraudAlert(publicId: string) {
    const alert = await this.repo.findFraudAlertByPublicId(publicId);
    if (!alert) throw new NotFoundException("Cảnh báo gian lận không tồn tại");
    return mapFraudAlertToItem(alert);
  }

  async resolveFraudAlert(publicId: string, input: ResolveFraudAlertInput, adminId: string, auditCtx: AuditContext) {
    const alert = await this.repo.findFraudAlertByPublicId(publicId);
    if (!alert) throw new NotFoundException("Cảnh báo gian lận không tồn tại");
    if (alert.resolvedAt) throw new BadRequestException("Cảnh báo đã được xử lý");
    const updated = await this.repo.resolveFraudAlert(alert.id, input.resolution, adminId);
    await this.audit.append(auditCtx, "admin.fraud_alert.resolve", "fraud_alert", publicId, {
      resolution: input.resolution,
    });
    return mapFraudAlertToItem(updated);
  }

  // ─── Marital Purity Vow (Admin) ───────────────────────────────────────────

  async listVows(query: VowQuery) {
    const { data, total } = await this.repo.findManyVows(query);
    return {
      data: data.map(mapVowToAdminItem),
      meta: { total, limit: query.limit, offset: query.offset },
    };
  }

  async getVow(publicId: string) {
    const vow = await this.repo.findVowByPublicId(publicId);
    if (!vow) throw new NotFoundException("Lời nguyện không tồn tại");
    return {
      ...mapVowToAdminItem(vow),
      thoughtLogs: vow.thoughtLogs.map(mapThoughtLogToItem),
      recentGuidance: vow.guidanceReqs.map(mapGuidanceToItem),
    };
  }

  // ─── Vow (Member) ─────────────────────────────────────────────────────────

  async registerVow(input: RegisterVowInput, userId: string, auditCtx: AuditContext) {
    const existing = await this.repo.findVowByUserId(userId);
    if (existing) throw new BadRequestException("Bạn đã có lời nguyện thanh tu đang hoạt động");
    const vow = await this.repo.createVow(
      { ...input, vowDate: new Date(input.vowDate) },
      userId,
      input.spouseId,
      nanoid(21),
    );
    await this.repo.appendVowAudit(vow.id, "VOW_REGISTERED", userId, "Đăng ký lời nguyện thanh tu");
    await this.audit.append(auditCtx, "member.vow.register", "marital_purity_vow", vow.publicId, {
      purityLevel: input.purityLevel,
    });
    return mapVowToAdminItem(vow);
  }

  async getMyVow(userId: string) {
    const vow = await this.repo.findVowByUserId(userId);
    if (!vow) throw new NotFoundException("Bạn chưa có lời nguyện thanh tu");
    return mapVowToAdminItem(vow);
  }

  async logThought(input: LogThoughtInput, userId: string, _auditCtx: AuditContext) {
    const vow = await this.repo.findVowByUserId(userId);
    if (!vow) throw new NotFoundException("Không tìm thấy lời nguyện đang hoạt động");
    const log = await this.repo.createThoughtLog(input, vow.id);
    // Crisis escalation: intensity 9–10
    if (input.intensity >= 9) {
      await this.repo.appendVowAudit(vow.id, "CRISIS_THOUGHT_LOGGED", userId, `Cường độ tâm niệm: ${input.intensity}/10`);
    }
    return mapThoughtLogToItem(log);
  }

  async getThoughtLogs(userId: string, query: ThoughtLogQuery) {
    const vow = await this.repo.findVowByUserId(userId);
    if (!vow) throw new NotFoundException("Không tìm thấy lời nguyện đang hoạt động");
    const { data, total } = await this.repo.findThoughtLogs(vow.id, query);
    return { data: data.map(mapThoughtLogToItem), meta: { total } };
  }

  async submitGuidanceRequest(input: GuidanceRequestInput, userId: string, _auditCtx: AuditContext) {
    const vow = await this.repo.findVowByUserId(userId);
    if (!vow) throw new NotFoundException("Không tìm thấy lời nguyện đang hoạt động");
    const req = await this.repo.createGuidanceRequest(input, vow.id, nanoid(21));
    await this.repo.appendVowAudit(vow.id, "GUIDANCE_REQUESTED", userId, `Danh mục: ${input.category}`);
    return mapGuidanceToItem(req);
  }

  async reportViolation(input: ReportViolationInput, userId: string, auditCtx: AuditContext) {
    const vow = await this.repo.findVowByUserId(userId);
    if (!vow) throw new NotFoundException("Không tìm thấy lời nguyện đang hoạt động");
    await this.repo.updateVowStatus(vow.id, "PAUSED");
    await this.repo.appendVowAudit(vow.id, "VIOLATION_REPORTED", userId,
      `Loại: ${input.violationType} | ${input.description}`,
      { status: "ACTIVE" },
      { status: "PAUSED" },
    );
    await this.audit.append(auditCtx, "member.vow.violation", "marital_purity_vow", vow.publicId, {
      violationType: input.violationType,
      occurredAt: input.occurredAt,
    });

    const repeatEscalation = await this.escalateRepeatViolationIfNeeded(vow.id, vow.publicId, userId, input, auditCtx);

    return {
      message: repeatEscalation.escalated
        ? "Đã ghi nhận vi phạm lặp lại và chuyển vào hàng đợi hỗ trợ Dharma."
        : "Đã ghi nhận vi phạm. Hãy thực hành sám hối và liên hệ Dharma Support.",
      escalation: repeatEscalation,
    };
  }

  private async escalateRepeatViolationIfNeeded(
    vowId: string,
    vowPublicId: string,
    userId: string,
    input: ReportViolationInput,
    auditCtx: AuditContext,
  ) {
    const since = new Date();
    since.setDate(since.getDate() - REPEAT_VIOLATION_WINDOW_DAYS);

    const recentViolationCount = await this.repo.countRecentVowAuditEvents(vowId, "VIOLATION_REPORTED", since);
    if (recentViolationCount < REPEAT_VIOLATION_ESCALATION_THRESHOLD) {
      return {
        escalated: false,
        recentViolationCount,
        threshold: REPEAT_VIOLATION_ESCALATION_THRESHOLD,
      };
    }

    const existing = await this.repo.findOpenGuidanceRequest(vowId, "VIOLATION_RECOVERY");
    if (existing) {
      await this.repo.appendVowAudit(
        vowId,
        "REPEAT_VIOLATION_ESCALATION_SKIPPED",
        userId,
        `Đã có yêu cầu hướng dẫn đang mở sau ${recentViolationCount} vi phạm trong ${REPEAT_VIOLATION_WINDOW_DAYS} ngày`,
        undefined,
        { guidanceRequestId: existing.id, recentViolationCount },
      );
      return {
        escalated: true,
        alreadyQueued: true,
        guidanceRequestId: existing.id,
        recentViolationCount,
        threshold: REPEAT_VIOLATION_ESCALATION_THRESHOLD,
      };
    }

    const guidance = await this.repo.createGuidanceRequest(
      {
        category: "VIOLATION_RECOVERY",
        question: "Tự động chuyển hỗ trợ vì thành viên báo cáo vi phạm lời nguyện lặp lại.",
        context: `Số lần vi phạm trong ${REPEAT_VIOLATION_WINDOW_DAYS} ngày: ${recentViolationCount}. Lần mới nhất: ${input.violationType} lúc ${input.occurredAt}. Mô tả: ${input.description}`,
        urgency: "CRISIS",
      },
      vowId,
      nanoid(21),
    );

    await this.repo.appendVowAudit(
      vowId,
      "REPEAT_VIOLATION_ESCALATED",
      userId,
      `Tự động chuyển hàng đợi hỗ trợ sau ${recentViolationCount} vi phạm trong ${REPEAT_VIOLATION_WINDOW_DAYS} ngày`,
      undefined,
      { guidanceRequestId: guidance.id, recentViolationCount },
    );
    await this.audit.append(auditCtx, "member.vow.repeat_violation_escalate", "marital_purity_vow", vowPublicId, {
      guidanceRequestId: guidance.id,
      recentViolationCount,
      threshold: REPEAT_VIOLATION_ESCALATION_THRESHOLD,
    });

    return {
      escalated: true,
      alreadyQueued: false,
      guidanceRequestId: guidance.id,
      recentViolationCount,
      threshold: REPEAT_VIOLATION_ESCALATION_THRESHOLD,
    };
  }

  // ─── Guidance Queue (Admin/Support) ──────────────────────────────────────

  async listGuidanceQueue(query: GuidanceQueueQuery) {
    const { data, total } = await this.repo.findGuidanceQueue(query);
    return {
      data: data.map(mapGuidanceToItem),
      meta: { total, limit: query.limit, offset: query.offset },
    };
  }

  async respondToGuidance(id: string, input: RespondGuidanceInput, adminId: string, auditCtx: AuditContext) {
    const updated = await this.repo.respondToGuidance(id, input.response);
    await this.audit.append(auditCtx, "admin.guidance.respond", "marital_guidance_request", id, {});
    return mapGuidanceToItem(updated);
  }

  // ─── Public: Approved Accounts ───────────────────────────────────────────

  /** GET /api/dharma-compliance/approved-accounts — public display of verified charity accounts */
  async listApprovedAccounts() {
    const data = await this.prisma.charityWhitelist.findMany({
      where: { status: "VERIFIED" as never },
      select: {
        publicId: true,
        name: true,
        charityType: true,
        website: true,
        contactEmail: true,
        registrationNumber: true,
      },
      orderBy: { name: "asc" },
    });
    return { data };
  }

  /** GET /api/dharma-compliance/charities/:publicId — public charity detail */
  async getPublicCharity(publicId: string) {
    const charity = await this.prisma.charityWhitelist.findUnique({
      where: { publicId },
      select: {
        publicId: true,
        name: true,
        charityType: true,
        status: true,
        website: true,
        contactEmail: true,
        notes: true,
        createdAt: true,
      },
    });
    if (!charity) throw new NotFoundException("Tổ chức từ thiện không tồn tại");
    if (charity.status !== "VERIFIED") throw new NotFoundException("Tổ chức từ thiện không tồn tại");
    return { data: charity };
  }

  // ─── Admin: Charity lifecycle actions ────────────────────────────────────

  /** POST /api/admin/dharma-compliance/charities/:publicId/verify */
  async verifyCharity(publicId: string, auditCtx: AuditContext) {
    const charity = await this.repo.findCharityByPublicId(publicId);
    if (!charity) throw new NotFoundException("Tổ chức từ thiện không tồn tại");
    if (charity.status === "VERIFIED" as unknown) throw new ConflictException("Tổ chức đã được xác minh");
    if (charity.status === "REVOKED" as unknown) throw new BadRequestException("Tổ chức đã bị thu hồi, không thể xác minh lại");
    const updated = await this.repo.updateCharityStatus(charity.id, "VERIFIED");
    await this.audit.append(auditCtx, "admin.charity.verify", "charity", publicId, { previousStatus: charity.status });
    return mapCharityToDetail(updated);
  }

  /** POST /api/admin/dharma-compliance/charities/:publicId/suspend */
  async suspendCharity(publicId: string, reason: string, auditCtx: AuditContext) {
    const charity = await this.repo.findCharityByPublicId(publicId);
    if (!charity) throw new NotFoundException("Tổ chức từ thiện không tồn tại");
    if (charity.status === "REVOKED" as unknown) throw new BadRequestException("Tổ chức đã bị thu hồi");
    const updated = await this.repo.updateCharityStatus(charity.id, "SUSPENDED");
    await this.audit.append(auditCtx, "admin.charity.suspend", "charity", publicId, { reason, previousStatus: charity.status });
    return mapCharityToDetail(updated);
  }

  /** POST /api/admin/dharma-compliance/charities/:publicId/revoke */
  async revokeCharity(publicId: string, reason: string, auditCtx: AuditContext) {
    const charity = await this.repo.findCharityByPublicId(publicId);
    if (!charity) throw new NotFoundException("Tổ chức từ thiện không tồn tại");
    const updated = await this.repo.updateCharityStatus(charity.id, "REVOKED");
    await this.audit.append(auditCtx, "admin.charity.revoke", "charity", publicId, { reason, previousStatus: charity.status });
    return mapCharityToDetail(updated);
  }

  // ─── Admin: Whitelisting Rules ────────────────────────────────────────────

  /** GET /api/admin/dharma-compliance/charities/:publicId/rules */
  async listCharityRules(charityPublicId: string) {
    const charity = await this.repo.findCharityByPublicId(charityPublicId);
    if (!charity) throw new NotFoundException("Tổ chức từ thiện không tồn tại");
    const rules = await this.prisma.charityWhitelistingRule.findMany({
      where: { charityId: charity.id },
      orderBy: { createdAt: "asc" },
    });
    return {
      data: rules.map((r) => ({
        publicId: r.publicId,
        criteriaType: r.criteriaType,
        notes: r.notes,
        satisfied: r.satisfied,
        evidenceUrl: r.evidenceUrl,
        verifiedAt: r.verifiedAt,
        createdAt: r.createdAt,
      })),
    };
  }

  /** POST /api/admin/dharma-compliance/charities/:publicId/rules */
  async createCharityRule(
    charityPublicId: string,
    input: CreateCharityRuleInput,
    auditCtx: AuditContext,
  ) {
    const charity = await this.repo.findCharityByPublicId(charityPublicId);
    if (!charity) throw new NotFoundException("Tổ chức từ thiện không tồn tại");

    // Prevent duplicate criteria type for same charity
    const existing = await this.prisma.charityWhitelistingRule.findFirst({
      where: { charityId: charity.id, criteriaType: input.ruleType as never },
    });
    if (existing) throw new ConflictException("Tiêu chí xác minh loại này đã tồn tại cho tổ chức này");

    const rule = await this.prisma.charityWhitelistingRule.create({
      data: {
        publicId: nanoid(21),
        charityId: charity.id,
        criteriaType: input.ruleType as never,
        notes: input.description,
        evidenceUrl: input.evidenceUrl,
        satisfied: false,
      },
    });
    await this.audit.append(auditCtx, "admin.charity.rule.create", "charity_rule", rule.publicId, {
      charityId: charityPublicId,
      criteriaType: input.ruleType,
    });
    return {
      data: {
        publicId: rule.publicId,
        criteriaType: rule.criteriaType,
        notes: rule.notes,
        satisfied: rule.satisfied,
        evidenceUrl: rule.evidenceUrl,
        createdAt: rule.createdAt,
      },
    };
  }

  /** PATCH /api/admin/dharma-compliance/charities/:publicId/rules/:rulePublicId */
  async updateCharityRule(
    charityPublicId: string,
    rulePublicId: string,
    input: UpdateCharityRuleInput,
    auditCtx: AuditContext,
  ) {
    const charity = await this.repo.findCharityByPublicId(charityPublicId);
    if (!charity) throw new NotFoundException("Tổ chức từ thiện không tồn tại");

    const rule = await this.prisma.charityWhitelistingRule.findUnique({
      where: { publicId: rulePublicId },
    });
    if (!rule || rule.charityId !== charity.id) throw new NotFoundException("Tiêu chí xác minh không tồn tại");

    const updated = await this.prisma.charityWhitelistingRule.update({
      where: { id: rule.id },
      data: {
        ...(input.verified !== undefined && {
          satisfied: input.verified,
          verifiedAt: input.verified ? new Date() : null,
        }),
        ...(input.evidenceUrl !== undefined && { evidenceUrl: input.evidenceUrl }),
        ...(input.description !== undefined && { notes: input.description }),
      },
    });
    await this.audit.append(auditCtx, "admin.charity.rule.update", "charity_rule", rulePublicId, {
      changes: input,
    });
    return {
      data: {
        publicId: updated.publicId,
        criteriaType: updated.criteriaType,
        notes: updated.notes,
        satisfied: updated.satisfied,
        evidenceUrl: updated.evidenceUrl,
        verifiedAt: updated.verifiedAt,
        createdAt: updated.createdAt,
      },
    };
  }

  // ─── Admin: User Charity Interactions ────────────────────────────────────

  /** GET /api/admin/dharma-compliance/interactions */
  async listInteractions(query: { limit?: number; offset?: number; userId?: string; interactionType?: string }) {
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    const where: Record<string, unknown> = {};
    if (query.userId) where.userId = query.userId;
    if (query.interactionType) where.interactionType = query.interactionType;

    const [data, total] = await Promise.all([
      this.prisma.userCharityInteraction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          charity: { select: { publicId: true, name: true } },
          user: { select: { publicId: true, displayName: true } },
        },
      }),
      this.prisma.userCharityInteraction.count({ where }),
    ]);

    return {
      data: data.map((i) => ({
        id: i.id,
        interactionType: i.interactionType,
        referenceId: i.referenceId,
        verified: i.verified,
        charity: i.charity ? { publicId: i.charity.publicId, name: i.charity.name } : null,
        user: i.user ? { publicId: i.user.publicId, displayName: i.user.displayName } : null,
        createdAt: i.createdAt,
      })),
      meta: { total, limit, offset, hasMore: offset + limit < total },
    };
  }

  // ─── Admin: Status Overview ───────────────────────────────────────────────

  /** GET /api/admin/dharma-compliance/status */
  async getAdminStatus() {
    const [verifiedCount, pendingCount, suspendedCount, unresolvedAlertCount] = await Promise.all([
      this.prisma.charityWhitelist.count({ where: { status: "VERIFIED" as never } }),
      this.prisma.charityWhitelist.count({ where: { status: "PENDING_VERIFICATION" as never } }),
      this.prisma.charityWhitelist.count({ where: { status: "SUSPENDED" as never } }),
      this.prisma.fraudDetectionAlert.count({ where: { resolvedAt: null } }),
    ]);

    return {
      charities: {
        verified: verifiedCount,
        pending: pendingCount,
        suspended: suspendedCount,
      },
      fraudAlerts: {
        unresolved: unresolvedAlertCount,
      },
      checkedAt: new Date().toISOString(),
    };
  }
}

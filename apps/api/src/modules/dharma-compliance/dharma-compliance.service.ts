import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { nanoid } from "nanoid";
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

@Injectable()
export class DharmaComplianceService {
  constructor(
    private readonly repo: DharmaComplianceRepository,
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
    const updated = await this.repo.updateCharityStatus(charity.id, input.status);
    await this.audit.append(auditCtx, "admin.charity.status_update", "charity", publicId, {
      from: charity.status,
      to: input.status,
      reason: input.reason,
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

  async logThought(input: LogThoughtInput, userId: string, auditCtx: AuditContext) {
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

  async submitGuidanceRequest(input: GuidanceRequestInput, userId: string, auditCtx: AuditContext) {
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
    return { message: "Đã ghi nhận vi phạm. Hãy thực hành sám hối và liên hệ Dharma Support." };
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
}

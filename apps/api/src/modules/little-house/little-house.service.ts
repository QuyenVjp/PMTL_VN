import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { LittleHouseRepository } from "./little-house.repository.js";
import { mapLhToItem, mapLhToDetail, mapFraudToItem } from "./little-house.mapper.js";
import type {
  LhQuery,
  CreateLhRecordInput,
  LogRecitationInput,
  DottingSessionInput,
  CombustionLogInput,
  FlagFraudInput,
  ResolveFraudInput,
  FraudQuery,
} from "./little-house.schemas.js";

// Valid state machine transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["SIGNED", "CANCELLED"],
  SIGNED: ["CHANTED", "CANCELLED"],
  CHANTED: ["BURNED", "CANCELLED"],
  BURNED: [],
  CANCELLED: [],
};

@Injectable()
export class LittleHouseService {
  constructor(
    private readonly repo: LittleHouseRepository,
    private readonly audit: AuditService,
  ) {}

  private assertTransition(current: string, next: string): void {
    if (!VALID_TRANSITIONS[current]?.includes(next)) {
      throw new BadRequestException(
        `Không thể chuyển trạng thái từ ${current} sang ${next}`,
      );
    }
  }

  async listRecords(query: LhQuery) {
    const { data, total } = await this.repo.findMany(query);
    return { data: data.map(mapLhToItem), meta: { total, limit: query.limit, offset: query.offset } };
  }

  /**
   * Member lane — ALWAYS scoped to ownerUserId. Cross-user → 404.
   * Prefer this over optional-owner getRecord so callers cannot forget the owner arg.
   */
  async getMemberRecord(publicId: string, ownerUserId: string) {
    const r = await this.repo.findMemberByPublicId(publicId, ownerUserId);
    if (!r) throw new NotFoundException("Hồ sơ sớ không tồn tại");
    return mapLhToDetail(r);
  }

  /** Admin lane — unscoped. Never call from member controllers. */
  async getAdminRecord(publicId: string) {
    const r = await this.repo.findAdminByPublicId(publicId);
    if (!r) throw new NotFoundException("Hồ sơ sớ không tồn tại");
    return mapLhToDetail(r);
  }

  /**
   * @deprecated Prefer getMemberRecord / getAdminRecord so ownership cannot be forgotten.
   * Kept as a thin dispatcher for any residual internal callers.
   */
  async getRecord(publicId: string, ownerUserId?: string) {
    if (ownerUserId !== undefined) {
      return this.getMemberRecord(publicId, ownerUserId);
    }
    return this.getAdminRecord(publicId);
  }

  async createRecord(input: CreateLhRecordInput, userId: string, auditCtx: AuditContext) {
    const r = await this.repo.create(input, userId, nanoid(21));
    await this.audit.append(auditCtx, "member.lh.create", "lh_record", r.publicId, {
      beneficiaryName: input.beneficiaryName,
    });
    return mapLhToItem(r);
  }

  async advanceStatus(publicId: string, nextStatus: string, adminId: string, auditCtx: AuditContext) {
    const r = await this.repo.findByPublicId(publicId);
    if (!r) throw new NotFoundException("Hồ sơ sớ không tồn tại");
    this.assertTransition(r.status, nextStatus);

    const timestamps: Partial<Record<string, Date>> = {};
    if (nextStatus === "SIGNED") timestamps.signedAt = new Date();
    if (nextStatus === "CHANTED") timestamps.chantedAt = new Date();
    if (nextStatus === "BURNED") timestamps.burnedAt = new Date();
    if (nextStatus === "CANCELLED") timestamps.cancelledAt = new Date();

    const updated = await this.repo.updateStatus(r.id, nextStatus, timestamps);
    await this.audit.append(auditCtx, "admin.lh.advance", "lh_record", publicId, {
      from: r.status,
      to: nextStatus,
    });
    return mapLhToItem(updated);
  }

  async logRecitation(publicId: string, input: LogRecitationInput, userId: string, _auditCtx: AuditContext) {
    // Scope to the calling member so A cannot write a recitation into B's record.
    const r = await this.repo.findByPublicId(publicId, userId);
    if (!r) throw new NotFoundException("Hồ sơ sớ không tồn tại");
    if (["BURNED", "CANCELLED"].includes(r.status)) {
      throw new BadRequestException("Không thể ghi tụng kinh cho hồ sơ đã kết thúc");
    }
    return this.repo.logRecitation(input, r.id);
  }

  async startDotting(publicId: string, input: DottingSessionInput, operatorId: string, auditCtx: AuditContext) {
    const r = await this.repo.findByPublicId(publicId);
    if (!r) throw new NotFoundException("Hồ sơ sớ không tồn tại");
    if (r.status !== "SIGNED") {
      throw new BadRequestException("Chỉ có thể điểm nhãn sau khi đã ký sớ");
    }
    const session = await this.repo.createDottingSession(input, r.id);
    await this.audit.append(auditCtx, "admin.lh.dotting_start", "lh_record", publicId, {});
    return session;
  }

  async completeDotting(sessionId: string, _auditCtx: AuditContext) {
    return this.repo.completeDottingSession(sessionId);
  }

  async logCombustion(publicId: string, input: CombustionLogInput, operatorId: string, auditCtx: AuditContext) {
    const r = await this.repo.findByPublicId(publicId);
    if (!r) throw new NotFoundException("Hồ sơ sớ không tồn tại");
    if (r.status !== "CHANTED") {
      throw new BadRequestException("Chỉ có thể hóa sớ sau khi đã tụng kinh (CHANTED)");
    }
    const log = await this.repo.createCombustionLog(input, r.id);
    await this.repo.createCompletion(r.id, input.operatorName);
    // Auto-advance to BURNED
    await this.repo.updateStatus(r.id, "BURNED", { burnedAt: new Date(input.burnedAt) });
    await this.audit.append(auditCtx, "admin.lh.combust", "lh_record", publicId, {
      burnedAt: input.burnedAt,
    });
    return log;
  }

  // ─── Fraud ────────────────────────────────────────────────────────────────

  async listFraud(query: FraudQuery) {
    const { data, total } = await this.repo.findManyFraud(query);
    return { data: data.map(mapFraudToItem), meta: { total, limit: query.limit, offset: query.offset } };
  }

  async flagFraud(publicId: string, input: FlagFraudInput, adminId: string, auditCtx: AuditContext) {
    const r = await this.repo.findByPublicId(publicId);
    if (!r) throw new NotFoundException("Hồ sơ sớ không tồn tại");
    const flag = await this.repo.flagFraud(input, r.id);
    await this.audit.append(auditCtx, "admin.lh.fraud_flag", "lh_record", publicId, {
      severity: input.severity,
    });
    return mapFraudToItem(flag);
  }

  async resolveFraud(fraudId: string, input: ResolveFraudInput, adminId: string, auditCtx: AuditContext) {
    const resolved = await this.repo.resolveFraud(fraudId, input.resolution);
    await this.audit.append(auditCtx, "admin.lh.fraud_resolve", "lh_fraud", fraudId, {});
    return mapFraudToItem(resolved);
  }
}

import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import type { NameChangeProbation } from "../../generated/prisma/client.js";
import { SacredFormsRepository } from "./sacred-forms.repository.js";
import { mapTemplateToItem, mapApplicantToItem, mapApplicantToDetail } from "./sacred-forms.mapper.js";
import type {
  TemplateQuery,
  CreateTemplateInput,
  ApplicantQuery,
  SubmitApplicationInput,
  ReviewApplicationInput,
  UpdatePrerequisiteInput,
  DisposalPolarityInput,
  ApproveApplicationInput,
  RejectApplicationInput,
  BurnApplicationInput,
  ProbationQuery,
} from "./sacred-forms.schemas.js";

// Design: design/03-domains/sacred-forms/CONTRACTS.md
// Burn time gate: 06:00-07:00, 08:00-09:00, 16:00-17:00 (server local hour)
const VALID_BURN_HOUR_RANGES: Array<[number, number]> = [
  [6, 7],
  [8, 9],
  [16, 17],
];

function isValidBurnTime(date: Date): boolean {
  const hour = date.getHours();
  return VALID_BURN_HOUR_RANGES.some(([from, to]) => hour >= from && hour < to);
}

@Injectable()
export class SacredFormsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repo: SacredFormsRepository,
    private readonly audit: AuditService,
  ) {}

  // ─── Templates ────────────────────────────────────────────────────────────

  async listTemplates(query: TemplateQuery) {
    const { data, total } = await this.repo.findManyTemplates(query);
    return { data: data.map(mapTemplateToItem), meta: { total, limit: query.limit, offset: query.offset } };
  }

  async getTemplate(publicId: string) {
    const t = await this.repo.findTemplateByPublicId(publicId);
    if (!t) throw new NotFoundException("Mẫu đơn không tồn tại");
    return mapTemplateToItem(t);
  }

  async createTemplate(input: CreateTemplateInput, adminId: string, auditCtx: AuditContext) {
    const t = await this.prisma.$transaction(async (tx) => {
      const created = await this.repo.createTemplate(input, nanoid(21), tx);
      await this.audit.appendInTransaction(
        tx,
        auditCtx,
        "admin.sacred_form_template.create",
        "sacred_form_template",
        created.publicId,
        { formType: input.formType },
      );
      return created;
    });
    return mapTemplateToItem(t);
  }

  async toggleTemplate(publicId: string, isActive: boolean, adminId: string, auditCtx: AuditContext) {
    const t = await this.repo.findTemplateByPublicId(publicId);
    if (!t) throw new NotFoundException("Mẫu đơn không tồn tại");
    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await this.repo.toggleTemplateActive(t.id, isActive, tx);
      await this.audit.appendInTransaction(
        tx,
        auditCtx,
        "admin.sacred_form_template.toggle",
        "sacred_form_template",
        publicId,
        { isActive },
      );
      return next;
    });
    return mapTemplateToItem(updated);
  }

  // ─── Applications ─────────────────────────────────────────────────────────

  async listApplicants(query: ApplicantQuery) {
    const { data, total } = await this.repo.findManyApplicants(query);
    return { data: data.map(mapApplicantToItem), meta: { total, limit: query.limit, offset: query.offset } };
  }

  /**
   * Admin (unscoped) applicant detail.
   */
  async getApplicant(publicId: string) {
    const a = await this.repo.findApplicantByPublicId(publicId);
    if (!a) throw new NotFoundException("Đơn đăng ký không tồn tại");
    return mapApplicantToDetail(a);
  }

  /**
   * Member self-owned applicant detail. Always scopes by current user so
   * cross-user publicId yields 404 without leaking existence or private fields.
   */
  async getMyApplicant(publicId: string, ownerUserId: string) {
    const a = await this.repo.findApplicantByPublicId(publicId, ownerUserId);
    if (!a) throw new NotFoundException("Đơn đăng ký không tồn tại");
    return mapApplicantToDetail(a);
  }

  async submitApplication(input: SubmitApplicationInput, userId: string, auditCtx: AuditContext) {
    const template = await this.repo.findTemplateByPublicId(input.templatePublicId);
    if (!template) throw new NotFoundException("Mẫu đơn không tồn tại");
    if (!template.isActive) throw new BadRequestException("Mẫu đơn không còn hoạt động");

    const existing = await this.repo.findApplicantByUserAndTemplate(userId, template.id);
    if (existing) throw new BadRequestException("Bạn đã có đơn đăng ký đang xử lý cho mẫu này");

    const applicant = await this.prisma.$transaction(async (tx) => {
      const created = await this.repo.createApplicant(template.id, userId, input.formData, nanoid(21), tx);
      await this.repo.appendApplicantAudit(created.id, userId, "APPLICATION_SUBMITTED", undefined, tx);
      await this.audit.appendInTransaction(
        tx,
        auditCtx,
        "member.sacred_form.submit",
        "form_applicant",
        created.publicId,
        { formType: template.formType },
      );
      return created;
    });
    return mapApplicantToItem(applicant);
  }

  async reviewApplication(publicId: string, input: ReviewApplicationInput, adminId: string, auditCtx: AuditContext) {
    const applicant = await this.repo.findApplicantByPublicId(publicId);
    if (!applicant) throw new NotFoundException("Đơn đăng ký không tồn tại");
    if (!["PENDING", "UNDER_REVIEW"].includes(applicant.status)) {
      throw new BadRequestException("Đơn đã được xử lý");
    }

    let status: string;
    const extra: { reviewNotes?: string; probationEndsAt?: Date; approvedAt?: Date; rejectedAt?: Date } = {
      reviewNotes: input.reviewNotes,
    };

    switch (input.decision) {
      case "APPROVE":
        status = "APPROVED";
        extra.approvedAt = new Date();
        break;
      case "REJECT":
        status = "REJECTED";
        extra.rejectedAt = new Date();
        break;
      case "PROBATION":
        status = "PROBATION";
        if (input.probationDays) {
          const end = new Date();
          end.setDate(end.getDate() + input.probationDays);
          extra.probationEndsAt = end;
        }
        break;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await this.repo.updateApplicantStatus(applicant.id, status!, extra, tx);
      await this.repo.appendApplicantAudit(applicant.id, adminId, `APPLICATION_${input.decision}D`, input.reviewNotes, tx);
      await this.audit.appendInTransaction(
        tx,
        auditCtx,
        "admin.sacred_form.review",
        "form_applicant",
        publicId,
        { decision: input.decision },
      );
      return next;
    });
    return mapApplicantToItem(updated);
  }

  async updatePrerequisite(applicantPublicId: string, input: UpdatePrerequisiteInput, actorId: string, _auditCtx: AuditContext) {
    const applicant = await this.repo.findApplicantByPublicId(applicantPublicId);
    if (!applicant) throw new NotFoundException("Đơn đăng ký không tồn tại");
    const prereq = await this.repo.upsertPrerequisite(applicant.id, input);
    await this.repo.appendApplicantAudit(applicant.id, actorId, "PREREQUISITE_UPDATED", `${input.name}: ${input.status}`);
    return prereq;
  }

  // ─── Disposal Polarity ────────────────────────────────────────────────────

  async listDisposalPolarities() {
    const data = await this.repo.findDisposalPolarities();
    return { data };
  }

  async createDisposalPolarity(input: DisposalPolarityInput, adminId: string, auditCtx: AuditContext) {
    const record = await this.prisma.$transaction(async (tx) => {
      const created = await this.repo.createDisposalPolarity(input, tx);
      // No publicId on disposal polarity — use stable formType as resource key.
      await this.audit.appendInTransaction(
        tx,
        auditCtx,
        "admin.disposal_polarity.create",
        "disposal_polarity_record",
        input.formType,
        { formType: input.formType, polarity: input.polarity },
      );
      return created;
    });
    return record;
  }

  // ─── Approve ──────────────────────────────────────────────────────────────

  async approveApplication(publicId: string, input: ApproveApplicationInput, adminId: string, auditCtx: AuditContext) {
    const applicant = await this.repo.findApplicantByPublicId(publicId);
    if (!applicant) throw new NotFoundException("Đơn đăng ký không tồn tại");
    if (!["PENDING", "UNDER_REVIEW"].includes(applicant.status)) {
      throw new BadRequestException("Chỉ có thể duyệt đơn đang ở trạng thái chờ hoặc đang xem xét");
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await this.repo.approveApplicant(applicant.id, input.reviewNotes, tx);
      await this.repo.appendApplicantAudit(applicant.id, adminId, "APPLICATION_APPROVED", input.reviewNotes, tx);
      await this.audit.appendInTransaction(
        tx,
        auditCtx,
        "admin.sacred_form.approve",
        "form_applicant",
        publicId,
        { reviewNotes: input.reviewNotes },
      );
      return next;
    });
    return mapApplicantToItem(updated);
  }

  // ─── Reject ───────────────────────────────────────────────────────────────

  async rejectApplication(publicId: string, input: RejectApplicationInput, adminId: string, auditCtx: AuditContext) {
    const applicant = await this.repo.findApplicantByPublicId(publicId);
    if (!applicant) throw new NotFoundException("Đơn đăng ký không tồn tại");
    if (!["PENDING", "UNDER_REVIEW"].includes(applicant.status)) {
      throw new BadRequestException("Chỉ có thể từ chối đơn đang ở trạng thái chờ hoặc đang xem xét");
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await this.repo.rejectApplicant(applicant.id, input.rejectionReason, tx);
      await this.repo.appendApplicantAudit(applicant.id, adminId, "APPLICATION_REJECTED", input.rejectionReason, tx);
      await this.audit.appendInTransaction(
        tx,
        auditCtx,
        "admin.sacred_form.reject",
        "form_applicant",
        publicId,
        { rejectionReason: input.rejectionReason },
      );
      return next;
    });
    return mapApplicantToItem(updated);
  }

  // ─── Burn ─────────────────────────────────────────────────────────────────

  async burnApplication(publicId: string, input: BurnApplicationInput, adminId: string, auditCtx: AuditContext) {
    const applicant = await this.repo.findApplicantByPublicId(publicId);
    if (!applicant) throw new NotFoundException("Đơn đăng ký không tồn tại");
    if (applicant.status !== "APPROVED") {
      throw new BadRequestException("Chỉ có thể đốt đơn đã được duyệt");
    }

    // Burn time gate: hard-block outside 06-07, 08-09, 16-17
    const burnTime = new Date(input.burnTime);
    if (!isValidBurnTime(burnTime)) {
      throw new BadRequestException({
        error: "INVALID_BURN_CONDITIONS",
        message: "Thời gian đốt đơn không hợp lệ. Chỉ được đốt trong khung giờ: 06:00-07:00, 08:00-09:00, 16:00-17:00.",
      });
    }

    // Weather gate: soft-block — advisory only, user must confirm
    if (!input.weatherConfirmed) {
      throw new BadRequestException({
        error: "WEATHER_CONFIRMATION_REQUIRED",
        message: "Vui lòng xác nhận thời tiết tốt (nắng, không mưa) trước khi đốt đơn.",
      });
    }

    // Check for duplicate probation
    const existingProbation = await this.repo.findProbationByApplicantId(applicant.id);
    if (existingProbation) {
      throw new ConflictException("Đơn đăng ký này đã có probation tồn tại");
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Complete the applicant
      const updated = await this.repo.completeApplicant(applicant.id, tx);

      // Create 100-day probation
      const probation = await this.repo.createNameChangeProbation(
        {
          publicId: nanoid(21),
          formApplicantId: applicant.id,
          userId: applicant.userId,
          oldDharmaName: input.oldDharmaName,
          newDharmaName: input.newDharmaName,
          probationDurationDays: 100,
        },
        tx,
      );

      await this.repo.appendApplicantAudit(
        applicant.id,
        adminId,
        "APPLICATION_BURNED",
        `Probation bắt đầu ${probation.probationStartDate.toISOString()}, kết thúc ${probation.probationEndDate.toISOString()}`,
        tx,
      );
      await this.audit.appendInTransaction(
        tx,
        auditCtx,
        "admin.sacred_form.burn",
        "form_applicant",
        publicId,
        {
          probationPublicId: probation.publicId,
          probationEndDate: probation.probationEndDate.toISOString(),
        },
      );

      return { updated, probation };
    });

    return {
      applicant: mapApplicantToItem(result.updated),
      probation: {
        publicId: result.probation.publicId,
        probationStartDate: result.probation.probationStartDate.toISOString(),
        probationEndDate: result.probation.probationEndDate.toISOString(),
        probationDurationDays: result.probation.probationDurationDays,
        isActive: result.probation.isActive,
      },
    };
  }

  // ─── All Probations (admin) ───────────────────────────────────────────────

  async listAllProbations(query: ProbationQuery) {
    const { data, total } = await this.repo.findAllProbations(query);
    const now = new Date();
    const items = data.map((p: NameChangeProbation) => ({
      publicId: p.publicId,
      userId: p.userId,
      oldDharmaName: p.oldDharmaName,
      newDharmaName: p.newDharmaName,
      probationStartDate: p.probationStartDate.toISOString(),
      probationEndDate: p.probationEndDate.toISOString(),
      daysRemaining: Math.max(0, Math.ceil((p.probationEndDate.getTime() - now.getTime()) / 86_400_000)),
      isActive: p.isActive,
    }));
    return { data: items, meta: { total, limit: query.limit, offset: query.offset } };
  }

  // ─── My Probations ────────────────────────────────────────────────────────

  async getMyProbations(userId: string, query: ProbationQuery) {
    const { data, total } = await this.repo.findProbationsByUserId(userId, query);
    const now = new Date();
    const items = data.map((p: NameChangeProbation) => ({
      publicId: p.publicId,
      oldDharmaName: p.oldDharmaName,
      newDharmaName: p.newDharmaName,
      probationStartDate: p.probationStartDate.toISOString(),
      probationEndDate: p.probationEndDate.toISOString(),
      daysRemaining: Math.max(0, Math.ceil((p.probationEndDate.getTime() - now.getTime()) / 86_400_000)),
      isActive: p.isActive,
    }));
    return { data: items, meta: { total, limit: query.limit, offset: query.offset } };
  }

  // ─── Status Aggregate ─────────────────────────────────────────────────────

  async getStatusAggregate() {
    return this.repo.getStatusAggregate();
  }
}

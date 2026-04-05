import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
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
} from "./sacred-forms.schemas.js";

@Injectable()
export class SacredFormsService {
  constructor(
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
    const t = await this.repo.createTemplate(input, nanoid(21));
    await this.audit.append(auditCtx, "admin.sacred_form_template.create", "sacred_form_template", t.publicId, {
      formType: input.formType,
    });
    return mapTemplateToItem(t);
  }

  async toggleTemplate(publicId: string, isActive: boolean, adminId: string, auditCtx: AuditContext) {
    const t = await this.repo.findTemplateByPublicId(publicId);
    if (!t) throw new NotFoundException("Mẫu đơn không tồn tại");
    const updated = await this.repo.toggleTemplateActive(t.id, isActive);
    await this.audit.append(auditCtx, "admin.sacred_form_template.toggle", "sacred_form_template", publicId, {
      isActive,
    });
    return mapTemplateToItem(updated);
  }

  // ─── Applications ─────────────────────────────────────────────────────────

  async listApplicants(query: ApplicantQuery) {
    const { data, total } = await this.repo.findManyApplicants(query);
    return { data: data.map(mapApplicantToItem), meta: { total, limit: query.limit, offset: query.offset } };
  }

  async getApplicant(publicId: string) {
    const a = await this.repo.findApplicantByPublicId(publicId);
    if (!a) throw new NotFoundException("Đơn đăng ký không tồn tại");
    return mapApplicantToDetail(a);
  }

  async submitApplication(input: SubmitApplicationInput, userId: string, auditCtx: AuditContext) {
    const template = await this.repo.findTemplateByPublicId(input.templatePublicId);
    if (!template) throw new NotFoundException("Mẫu đơn không tồn tại");
    if (!template.isActive) throw new BadRequestException("Mẫu đơn không còn hoạt động");

    const existing = await this.repo.findApplicantByUserAndTemplate(userId, template.id);
    if (existing) throw new BadRequestException("Bạn đã có đơn đăng ký đang xử lý cho mẫu này");

    const applicant = await this.repo.createApplicant(template.id, userId, input.formData as Record<string, unknown> | undefined, nanoid(21));
    await this.repo.appendApplicantAudit(applicant.id, userId, "APPLICATION_SUBMITTED");
    await this.audit.append(auditCtx, "member.sacred_form.submit", "form_applicant", applicant.publicId, {
      formType: template.formType,
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

    const updated = await this.repo.updateApplicantStatus(applicant.id, status!, extra);
    await this.repo.appendApplicantAudit(applicant.id, adminId, `APPLICATION_${input.decision}D`, input.reviewNotes);
    await this.audit.append(auditCtx, "admin.sacred_form.review", "form_applicant", publicId, {
      decision: input.decision,
    });
    return mapApplicantToItem(updated);
  }

  async updatePrerequisite(applicantPublicId: string, input: UpdatePrerequisiteInput, actorId: string, auditCtx: AuditContext) {
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
    const record = await this.repo.createDisposalPolarity(input);
    await this.audit.append(auditCtx, "admin.disposal_polarity.create", "disposal_polarity_record", record.id, {
      formType: input.formType,
      polarity: input.polarity,
    });
    return record;
  }
}

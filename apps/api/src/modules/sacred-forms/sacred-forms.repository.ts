import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type {
  TemplateQuery,
  CreateTemplateInput,
  ApplicantQuery,
  UpdatePrerequisiteInput,
  DisposalPolarityInput,
} from "./sacred-forms.schemas.js";

@Injectable()
export class SacredFormsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Templates ────────────────────────────────────────────────────────────

  async findManyTemplates(query: TemplateQuery) {
    const where = {
      ...(query.formType && { formType: query.formType as never }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };
    const [data, total] = await Promise.all([
      this.prisma.sacredFormTemplate.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.sacredFormTemplate.count({ where }),
    ]);
    return { data, total };
  }

  async findTemplateByPublicId(publicId: string) {
    return this.prisma.sacredFormTemplate.findUnique({ where: { publicId } });
  }

  async createTemplate(input: CreateTemplateInput, publicId: string) {
    return this.prisma.sacredFormTemplate.create({
      data: {
        publicId,
        formType: input.formType as never,
        titleVi: input.titleVi,
        titleZh: input.titleZh,
        description: input.description,
        prerequisitesDef: input.prerequisitesDef as never,
        formSchema: input.formSchema as never,
      },
    });
  }

  async toggleTemplateActive(id: string, isActive: boolean) {
    return this.prisma.sacredFormTemplate.update({ where: { id }, data: { isActive } });
  }

  // ─── Applicants ──────────────────────────────────────────────────────────

  async findManyApplicants(query: ApplicantQuery) {
    const where = {
      ...(query.status && { status: query.status as never }),
      ...(query.templateId && { templateId: query.templateId }),
    };
    const [data, total] = await Promise.all([
      this.prisma.formApplicant.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip: query.offset,
        include: {
          template: { select: { publicId: true, titleVi: true, formType: true } },
          user: { select: { publicId: true, displayName: true } },
        },
      }),
      this.prisma.formApplicant.count({ where }),
    ]);
    return { data, total };
  }

  async findApplicantByPublicId(publicId: string) {
    return this.prisma.formApplicant.findUnique({
      where: { publicId },
      include: {
        template: true,
        user: { select: { publicId: true, displayName: true, email: true } },
        prerequisites: true,
        auditLogs: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
  }

  async findApplicantByUserAndTemplate(userId: string, templateId: string) {
    return this.prisma.formApplicant.findFirst({
      where: { userId, templateId, status: { notIn: ["REJECTED", "REVOKED"] } },
    });
  }

  async createApplicant(templateId: string, userId: string, formData: Record<string, unknown> | undefined, publicId: string) {
    return this.prisma.formApplicant.create({
      data: {
        publicId,
        templateId,
        userId,
        formData: formData as never,
        status: "PENDING",
      },
    });
  }

  async updateApplicantStatus(
    id: string,
    status: string,
    extra?: { reviewNotes?: string; probationEndsAt?: Date; approvedAt?: Date; rejectedAt?: Date },
  ) {
    return this.prisma.formApplicant.update({
      where: { id },
      data: { status: status as never, ...extra },
    });
  }

  async appendApplicantAudit(applicantId: string, actor: string, action: string, details?: string) {
    return this.prisma.sacredFormAuditLog.create({
      data: { applicantId, actor, action, details },
    });
  }

  async upsertPrerequisite(applicantId: string, input: UpdatePrerequisiteInput) {
    const existing = await this.prisma.formPrerequisiteEntry.findFirst({
      where: { applicantId, name: input.name },
    });
    if (existing) {
      return this.prisma.formPrerequisiteEntry.update({
        where: { id: existing.id },
        data: {
          status: input.status as never,
          evidence: input.evidence,
          completedAt: input.status === "COMPLETED" ? new Date() : undefined,
        },
      });
    }
    return this.prisma.formPrerequisiteEntry.create({
      data: {
        applicantId,
        name: input.name,
        status: input.status as never,
        evidence: input.evidence,
        completedAt: input.status === "COMPLETED" ? new Date() : undefined,
      },
    });
  }

  // ─── Disposal Polarity ────────────────────────────────────────────────────

  async createDisposalPolarity(input: DisposalPolarityInput) {
    return this.prisma.disposalPolarityRecord.create({
      data: {
        formType: input.formType,
        polarity: input.polarity,
        rationale: input.rationale,
        effectiveAt: new Date(input.effectiveAt),
      },
    });
  }

  async findDisposalPolarities() {
    return this.prisma.disposalPolarityRecord.findMany({
      orderBy: { effectiveAt: "desc" },
    });
  }
}

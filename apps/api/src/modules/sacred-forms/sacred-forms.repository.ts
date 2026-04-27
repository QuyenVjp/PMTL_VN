import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { PrismaClient } from "../../generated/prisma/client.js";
import type {
  TemplateQuery,
  CreateTemplateInput,
  ApplicantQuery,
  UpdatePrerequisiteInput,
  DisposalPolarityInput,
  ProbationQuery,
} from "./sacred-forms.schemas.js";

type TransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

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

  async createTemplate(input: CreateTemplateInput, publicId: string, tx?: TransactionClient) {
    const db = tx ?? this.prisma;
    return db.sacredFormTemplate.create({
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

  async toggleTemplateActive(id: string, isActive: boolean, tx?: TransactionClient) {
    const db = tx ?? this.prisma;
    return db.sacredFormTemplate.update({ where: { id }, data: { isActive } });
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

  async createApplicant(
    templateId: string,
    userId: string,
    formData: Record<string, unknown> | undefined,
    publicId: string,
    tx?: TransactionClient,
  ) {
    const db = tx ?? this.prisma;
    return db.formApplicant.create({
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
    tx?: TransactionClient,
  ) {
    const db = tx ?? this.prisma;
    return db.formApplicant.update({
      where: { id },
      data: { status: status as never, ...extra },
    });
  }

  async appendApplicantAudit(
    applicantId: string,
    actor: string,
    action: string,
    details?: string,
    tx?: TransactionClient,
  ) {
    const db = tx ?? this.prisma;
    return db.sacredFormAuditLog.create({
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

  async createDisposalPolarity(input: DisposalPolarityInput, tx?: TransactionClient) {
    const db = tx ?? this.prisma;
    return db.disposalPolarityRecord.create({
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

  // ─── Approve / Reject ─────────────────────────────────────────────────────

  async approveApplicant(id: string, reviewNotes?: string, tx?: TransactionClient) {
    const db = tx ?? this.prisma;
    return db.formApplicant.update({
      where: { id },
      data: {
        status: "APPROVED" as never,
        approvedAt: new Date(),
        reviewNotes: reviewNotes ?? null,
      },
    });
  }

  async rejectApplicant(id: string, rejectionReason: string, tx?: TransactionClient) {
    const db = tx ?? this.prisma;
    return db.formApplicant.update({
      where: { id },
      data: {
        status: "REJECTED" as never,
        rejectedAt: new Date(),
        reviewNotes: rejectionReason,
      },
    });
  }

  // ─── Burn + Probation ─────────────────────────────────────────────────────

  async completeApplicant(id: string, tx?: TransactionClient) {
    const db = tx ?? this.prisma;
    return db.formApplicant.update({
      where: { id },
      data: { status: "COMPLETED" as never },
    });
  }

  async createNameChangeProbation(
    data: {
      publicId: string;
      formApplicantId: string;
      userId: string;
      oldDharmaName?: string;
      newDharmaName?: string;
      probationDurationDays: number;
    },
    tx?: TransactionClient,
  ) {
    const db = tx ?? this.prisma;
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + data.probationDurationDays);

    return db.nameChangeProbation.create({
      data: {
        publicId: data.publicId,
        formApplicantId: data.formApplicantId,
        userId: data.userId,
        oldDharmaName: data.oldDharmaName ?? null,
        newDharmaName: data.newDharmaName ?? null,
        probationStartDate: start,
        probationDurationDays: data.probationDurationDays,
        probationEndDate: end,
        isActive: true,
      },
    });
  }

  async findProbationByApplicantId(formApplicantId: string) {
    return this.prisma.nameChangeProbation.findUnique({
      where: { formApplicantId },
    });
  }

  // ─── My Probations ────────────────────────────────────────────────────────

  async findProbationsByUserId(userId: string, query: ProbationQuery) {
    const where: Record<string, unknown> = { userId };
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const [data, total] = await Promise.all([
      this.prisma.nameChangeProbation.findMany({
        where,
        orderBy: { probationStartDate: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.nameChangeProbation.count({ where }),
    ]);
    return { data, total };
  }

  async findAllProbations(query: ProbationQuery) {
    const where: Record<string, unknown> = {};
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const [data, total] = await Promise.all([
      this.prisma.nameChangeProbation.findMany({
        where,
        orderBy: { probationStartDate: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.nameChangeProbation.count({ where }),
    ]);
    return { data, total };
  }

  // ─── Status Aggregate ─────────────────────────────────────────────────────

  async getStatusAggregate() {
    const [
      totalPending,
      totalUnderReview,
      totalApproved,
      totalRejected,
      totalCompleted,
      totalActiveProbations,
    ] = await Promise.all([
      this.prisma.formApplicant.count({ where: { status: "PENDING" as never } }),
      this.prisma.formApplicant.count({ where: { status: "UNDER_REVIEW" as never } }),
      this.prisma.formApplicant.count({ where: { status: "APPROVED" as never } }),
      this.prisma.formApplicant.count({ where: { status: "REJECTED" as never } }),
      this.prisma.formApplicant.count({ where: { status: "COMPLETED" as never } }),
      this.prisma.nameChangeProbation.count({ where: { isActive: true } }),
    ]);

    return {
      applicants: {
        pending: totalPending,
        underReview: totalUnderReview,
        approved: totalApproved,
        rejected: totalRejected,
        completed: totalCompleted,
      },
      activeProbations: totalActiveProbations,
    };
  }
}

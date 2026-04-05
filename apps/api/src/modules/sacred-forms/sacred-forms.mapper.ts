import type {
  SacredFormTemplate,
  FormApplicant,
  FormPrerequisiteEntry,
  SacredFormAuditLog,
} from "../../generated/prisma/client.js";

export function mapTemplateToItem(t: SacredFormTemplate) {
  return {
    id: t.publicId,
    formType: t.formType,
    titleVi: t.titleVi,
    titleZh: t.titleZh,
    description: t.description,
    isActive: t.isActive,
    createdAt: t.createdAt,
  };
}

type ApplicantWithRelations = FormApplicant & {
  template?: { publicId: string; titleVi: string; formType: string } | null;
  user?: { publicId: string; displayName: string; email?: string } | null;
  prerequisites?: FormPrerequisiteEntry[];
  auditLogs?: SacredFormAuditLog[];
};

export function mapApplicantToItem(a: ApplicantWithRelations) {
  return {
    id: a.publicId,
    status: a.status,
    probationEndsAt: a.probationEndsAt,
    approvedAt: a.approvedAt,
    rejectedAt: a.rejectedAt,
    template: a.template
      ? { id: a.template.publicId, titleVi: a.template.titleVi, formType: a.template.formType }
      : null,
    user: a.user ? { id: a.user.publicId, name: a.user.displayName } : null,
    createdAt: a.createdAt,
  };
}

export function mapApplicantToDetail(a: ApplicantWithRelations) {
  return {
    ...mapApplicantToItem(a),
    reviewNotes: a.reviewNotes,
    formData: a.formData,
    prerequisites: (a.prerequisites ?? []).map((p) => ({
      name: p.name,
      status: p.status,
      completedAt: p.completedAt,
      evidence: p.evidence,
    })),
    auditLogs: (a.auditLogs ?? []).map((l) => ({
      actor: l.actor,
      action: l.action,
      details: l.details,
      createdAt: l.createdAt,
    })),
  };
}

import { z } from "zod";

export const templateQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  formType: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});
export type TemplateQuery = z.infer<typeof templateQuerySchema>;

export const createTemplateSchema = z.object({
  formType: z.enum([
    "REFUGE_FORM",
    "VOW_FORM",
    "MERIT_TRANSFER_FORM",
    "RECITATION_CERTIFICATE",
    "DHARMA_STUDY_FORM",
  ]),
  titleVi: z.string().min(2).max(200),
  titleZh: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  prerequisitesDef: z.record(z.string(), z.unknown()).optional(),
  formSchema: z.record(z.string(), z.unknown()).optional(),
});
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;

export const applicantQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.string().optional(),
  templateId: z.string().optional(),
});
export type ApplicantQuery = z.infer<typeof applicantQuerySchema>;

export const submitApplicationSchema = z.object({
  templatePublicId: z.string().min(1),
  formData: z.record(z.string(), z.unknown()).optional(),
});
export type SubmitApplicationInput = z.infer<typeof submitApplicationSchema>;

export const reviewApplicationSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT", "PROBATION"]),
  reviewNotes: z.string().max(2000).optional(),
  probationDays: z.number().int().min(1).max(365).optional(),
});
export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>;

export const updatePrerequisiteSchema = z.object({
  name: z.string().min(2).max(200),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "WAIVED"]),
  evidence: z.string().max(500).optional(),
});
export type UpdatePrerequisiteInput = z.infer<typeof updatePrerequisiteSchema>;

export const disposalPolaritySchema = z.object({
  formType: z.string().min(1),
  polarity: z.enum(["BURN", "BURY", "WATER", "RECYCLE"]),
  rationale: z.string().max(1000).optional(),
  effectiveAt: z.string().datetime(),
});
export type DisposalPolarityInput = z.infer<typeof disposalPolaritySchema>;

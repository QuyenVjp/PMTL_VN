import { z } from "zod";

export const lifeReleaseContentStatusSchema = z.enum(["DRAFT", "PUBLISHED"]);
export type LifeReleaseContentStatus = z.infer<typeof lifeReleaseContentStatusSchema>;

export const lifeReleaseGuideGroupSchema = z.enum([
  "NGHI_THUC",
  "LUU_Y_CHUAN_BI",
  "HOI_DAP",
]);
export type LifeReleaseGuideGroup = z.infer<typeof lifeReleaseGuideGroupSchema>;

export const lifeReleaseGuideSchema = z.object({
  publicId: z.string().min(8),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  groupKey: lifeReleaseGuideGroupSchema,
  sourceReference: z.string().min(1),
  reviewNote: z.string().min(1),
  warningNotes: z.array(z.string().min(1)).default([]),
  displayOrder: z.number().int().min(0),
  updatedAt: z.string(),
});
export type LifeReleaseGuideDto = z.infer<typeof lifeReleaseGuideSchema>;

export const lifeReleaseVariantSchema = z.object({
  publicId: z.string().min(8),
  name: z.string().min(1),
  summary: z.string().min(1),
  routeSlug: z.string().regex(/^[a-z0-9-]+$/),
  sourceReference: z.string().min(1),
  reviewNote: z.string().min(1),
  warningNotes: z.array(z.string().min(1)).default([]),
  displayOrder: z.number().int().min(0),
  updatedAt: z.string(),
});
export type LifeReleaseVariantDto = z.infer<typeof lifeReleaseVariantSchema>;

export const lifeReleaseFaqSchema = z.object({
  publicId: z.string().min(8),
  question: z.string().min(1),
  answer: z.string().min(1),
  sourceReference: z.string().min(1),
  displayOrder: z.number().int().min(0),
  updatedAt: z.string(),
});
export type LifeReleaseFaqDto = z.infer<typeof lifeReleaseFaqSchema>;

export const lifeReleaseDownloadSchema = z.object({
  publicId: z.string().min(8),
  title: z.string().min(1),
  assetType: z.enum(["GUIDE_PDF", "CHECKLIST", "PRAYER_CARD"]),
  fileName: z.string().min(1),
  displayOrder: z.number().int().min(0),
});
export type LifeReleaseDownloadDto = z.infer<typeof lifeReleaseDownloadSchema>;

export const lifeReleaseOverviewSchema = z.object({
  publicId: z.string().min(8),
  slug: z.literal("phong-sanh"),
  title: z.literal("Phóng sanh"),
  status: lifeReleaseContentStatusSchema,
  updatedAt: z.string(),
  updatedByLabel: z.string().min(1),
  boundarySummary: z.object({
    differentFromJournal: z.string().min(1),
    differentFromCalendar: z.string().min(1),
    nonNegotiables: z.array(z.string().min(1)).min(1),
  }),
  sourceReferences: z.array(z.string().min(1)).min(1),
  versionNotes: z.array(z.string().min(1)).min(1),
  guides: z.array(lifeReleaseGuideSchema),
  ritualVariants: z.array(lifeReleaseVariantSchema),
  faq: z.array(lifeReleaseFaqSchema),
  downloads: z.array(lifeReleaseDownloadSchema),
});
export type LifeReleaseOverviewDto = z.infer<typeof lifeReleaseOverviewSchema>;

export const createLifeReleaseGuideSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  summary: z.string().min(8).max(800).trim(),
  groupKey: lifeReleaseGuideGroupSchema,
  sourceReference: z.string().min(3).max(300).trim(),
  reviewNote: z.string().min(3).max(500).trim(),
  warningNotes: z.array(z.string().min(1).max(300)).max(8).default([]),
  displayOrder: z.number().int().min(0).default(0),
});
export type CreateLifeReleaseGuideInput = z.infer<typeof createLifeReleaseGuideSchema>;

export const updateLifeReleaseGuideSchema = createLifeReleaseGuideSchema.partial();
export type UpdateLifeReleaseGuideInput = z.infer<typeof updateLifeReleaseGuideSchema>;

export const createLifeReleaseVariantSchema = z.object({
  name: z.string().min(3).max(200).trim(),
  summary: z.string().min(8).max(800).trim(),
  routeSlug: z.string().regex(/^[a-z0-9-]+$/),
  sourceReference: z.string().min(3).max(300).trim(),
  reviewNote: z.string().min(3).max(500).trim(),
  warningNotes: z.array(z.string().min(1).max(300)).max(8).default([]),
  displayOrder: z.number().int().min(0).default(0),
});
export type CreateLifeReleaseVariantInput = z.infer<typeof createLifeReleaseVariantSchema>;

export const updateLifeReleaseVariantSchema = createLifeReleaseVariantSchema.partial();
export type UpdateLifeReleaseVariantInput = z.infer<typeof updateLifeReleaseVariantSchema>;

export const createLifeReleaseFaqSchema = z.object({
  question: z.string().min(6).max(300).trim(),
  answer: z.string().min(6).max(4000).trim(),
  sourceReference: z.string().min(3).max(300).trim(),
  displayOrder: z.number().int().min(0).default(0),
});
export type CreateLifeReleaseFaqInput = z.infer<typeof createLifeReleaseFaqSchema>;

export const updateLifeReleaseFaqSchema = createLifeReleaseFaqSchema.partial();
export type UpdateLifeReleaseFaqInput = z.infer<typeof updateLifeReleaseFaqSchema>;

export const publishLifeReleaseSchema = z.object({
  status: lifeReleaseContentStatusSchema,
  changeSummary: z.string().min(3).max(500).trim(),
});
export type PublishLifeReleaseInput = z.infer<typeof publishLifeReleaseSchema>;

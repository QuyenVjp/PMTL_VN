import { z } from "zod";

export const selfCultivationStatusSchema = z.enum(["DRAFT", "PUBLISHED"]);
export type SelfCultivationStatus = z.infer<typeof selfCultivationStatusSchema>;

export const selfCultivationGuideGroupSchema = z.enum([
  "BAT_DAU",
  "CACH_DUNG",
  "BAO_QUAN",
  "TRUONG_HOP_SU_DUNG",
  "TAI_XUONG",
]);
export type SelfCultivationGuideGroup = z.infer<typeof selfCultivationGuideGroupSchema>;

export const selfCultivationGuideSchema = z.object({
  publicId: z.string().min(8),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  groupKey: selfCultivationGuideGroupSchema,
  sourceReference: z.string().min(1),
  boundaryNote: z.string().optional(),
  warningNotes: z.array(z.string().min(1)).default([]),
  displayOrder: z.number().int().min(0),
  updatedAt: z.string(),
});
export type SelfCultivationGuideDto = z.infer<typeof selfCultivationGuideSchema>;

export const selfCultivationFaqSchema = z.object({
  publicId: z.string().min(8),
  question: z.string().min(1),
  answer: z.string().min(1),
  sourceReference: z.string().min(1),
  displayOrder: z.number().int().min(0),
  updatedAt: z.string(),
});
export type SelfCultivationFaqDto = z.infer<typeof selfCultivationFaqSchema>;

export const selfCultivationDownloadSchema = z.object({
  publicId: z.string().min(8),
  title: z.string().min(1),
  assetType: z.enum(["PRINTABLE", "GUIDE_PDF", "BANG_PHAN_BIET"]),
  fileName: z.string().min(1),
  displayOrder: z.number().int().min(0),
});
export type SelfCultivationDownloadDto = z.infer<typeof selfCultivationDownloadSchema>;

export const selfCultivationOverviewSchema = z.object({
  publicId: z.string().min(8),
  slug: z.literal("kinh-van-tu-tu"),
  title: z.literal("Kinh văn tự tu"),
  status: selfCultivationStatusSchema,
  updatedAt: z.string(),
  updatedByLabel: z.string().min(1),
  boundarySummary: z.object({
    differentFromDailyPractice: z.string().min(1),
    differentFromLittleHouse: z.string().min(1),
    nonNegotiables: z.array(z.string().min(1)).min(1),
  }),
  sourceReferences: z.array(z.string().min(1)).min(1),
  versionNotes: z.array(z.string().min(1)).min(1),
  guides: z.array(selfCultivationGuideSchema),
  faq: z.array(selfCultivationFaqSchema),
  downloads: z.array(selfCultivationDownloadSchema),
});
export type SelfCultivationOverviewDto = z.infer<typeof selfCultivationOverviewSchema>;

export const createSelfCultivationGuideSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  summary: z.string().min(8).max(800).trim(),
  groupKey: selfCultivationGuideGroupSchema,
  sourceReference: z.string().min(3).max(300).trim(),
  boundaryNote: z.string().max(500).trim().optional(),
  warningNotes: z.array(z.string().min(1).max(300)).max(8).default([]),
  displayOrder: z.number().int().min(0).default(0),
});
export type CreateSelfCultivationGuideInput = z.infer<typeof createSelfCultivationGuideSchema>;

export const updateSelfCultivationGuideSchema = createSelfCultivationGuideSchema.partial();
export type UpdateSelfCultivationGuideInput = z.infer<typeof updateSelfCultivationGuideSchema>;

export const createSelfCultivationFaqSchema = z.object({
  question: z.string().min(6).max(300).trim(),
  answer: z.string().min(6).max(4000).trim(),
  sourceReference: z.string().min(3).max(300).trim(),
  displayOrder: z.number().int().min(0).default(0),
});
export type CreateSelfCultivationFaqInput = z.infer<typeof createSelfCultivationFaqSchema>;

export const updateSelfCultivationFaqSchema = createSelfCultivationFaqSchema.partial();
export type UpdateSelfCultivationFaqInput = z.infer<typeof updateSelfCultivationFaqSchema>;

export const publishSelfCultivationSchema = z.object({
  status: selfCultivationStatusSchema,
  changeSummary: z.string().min(3).max(500).trim(),
});
export type PublishSelfCultivationInput = z.infer<typeof publishSelfCultivationSchema>;

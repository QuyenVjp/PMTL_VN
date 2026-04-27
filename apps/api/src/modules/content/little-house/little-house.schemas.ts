import { z } from "zod";

export const littleHouseStatusSchema = z.enum(["DRAFT", "PUBLISHED"]);
export type LittleHouseStatus = z.infer<typeof littleHouseStatusSchema>;

export const littleHouseGuideGroupSchema = z.enum([
  "BAT_DAU",
  "TRI_TUNG",
  "DOT_HAU_XU_LY",
  "TRA_CUU",
  "THUC_HANH",
]);
export type LittleHouseGuideGroup = z.infer<typeof littleHouseGuideGroupSchema>;

export const littleHouseGuideSchema = z.object({
  publicId: z.string().min(8),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  groupKey: littleHouseGuideGroupSchema,
  sourceReference: z.string().min(1),
  versionNote: z.string().min(1),
  warningNotes: z.array(z.string().min(1)).default([]),
  displayOrder: z.number().int().min(0),
  updatedAt: z.string(),
});
export type LittleHouseGuideDto = z.infer<typeof littleHouseGuideSchema>;

export const littleHouseCaseVariantSchema = z.object({
  publicId: z.string().min(8),
  name: z.string().min(1),
  summary: z.string().min(1),
  relatedGroup: littleHouseGuideGroupSchema,
  sourceReference: z.string().min(1),
  reviewNote: z.string().min(1),
  warningNotes: z.array(z.string().min(1)).default([]),
  displayOrder: z.number().int().min(0),
  updatedAt: z.string(),
});
export type LittleHouseCaseVariantDto = z.infer<typeof littleHouseCaseVariantSchema>;

export const littleHouseFaqSchema = z.object({
  publicId: z.string().min(8),
  question: z.string().min(1),
  answer: z.string().min(1),
  sourceReference: z.string().min(1),
  displayOrder: z.number().int().min(0),
  updatedAt: z.string(),
});
export type LittleHouseFaqDto = z.infer<typeof littleHouseFaqSchema>;

export const littleHouseDownloadSchema = z.object({
  publicId: z.string().min(8),
  title: z.string().min(1),
  assetType: z.enum(["PRINTABLE", "GUIDE_PDF", "IMAGE_COMPARE", "CHECKLIST"]),
  fileName: z.string().min(1),
  displayOrder: z.number().int().min(0),
});
export type LittleHouseDownloadDto = z.infer<typeof littleHouseDownloadSchema>;

export const littleHouseOverviewSchema = z.object({
  publicId: z.string().min(8),
  slug: z.literal("ngoi-nha-nho"),
  title: z.literal("Ngôi Nhà Nhỏ"),
  status: littleHouseStatusSchema,
  updatedAt: z.string(),
  updatedByLabel: z.string().min(1),
  boundarySummary: z.object({
    differentFromSelfCultivation: z.string().min(1),
    differentFromDailyPractice: z.string().min(1),
    nonNegotiables: z.array(z.string().min(1)).min(1),
  }),
  sourceReferences: z.array(z.string().min(1)).min(1),
  versionNotes: z.array(z.string().min(1)).min(1),
  guides: z.array(littleHouseGuideSchema),
  caseVariants: z.array(littleHouseCaseVariantSchema),
  faq: z.array(littleHouseFaqSchema),
  downloads: z.array(littleHouseDownloadSchema),
});
export type LittleHouseOverviewDto = z.infer<typeof littleHouseOverviewSchema>;

export const createLittleHouseGuideSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  summary: z.string().min(8).max(800).trim(),
  groupKey: littleHouseGuideGroupSchema,
  sourceReference: z.string().min(3).max(300).trim(),
  versionNote: z.string().min(3).max(500).trim(),
  warningNotes: z.array(z.string().min(1).max(300)).max(8).default([]),
  displayOrder: z.number().int().min(0).default(0),
});
export type CreateLittleHouseGuideInput = z.infer<typeof createLittleHouseGuideSchema>;

export const updateLittleHouseGuideSchema = createLittleHouseGuideSchema.partial();
export type UpdateLittleHouseGuideInput = z.infer<typeof updateLittleHouseGuideSchema>;

export const createLittleHouseCaseVariantSchema = z.object({
  name: z.string().min(3).max(200).trim(),
  summary: z.string().min(8).max(800).trim(),
  relatedGroup: littleHouseGuideGroupSchema,
  sourceReference: z.string().min(3).max(300).trim(),
  reviewNote: z.string().min(3).max(500).trim(),
  warningNotes: z.array(z.string().min(1).max(300)).max(8).default([]),
  displayOrder: z.number().int().min(0).default(0),
});
export type CreateLittleHouseCaseVariantInput = z.infer<typeof createLittleHouseCaseVariantSchema>;

export const updateLittleHouseCaseVariantSchema = createLittleHouseCaseVariantSchema.partial();
export type UpdateLittleHouseCaseVariantInput = z.infer<typeof updateLittleHouseCaseVariantSchema>;

export const createLittleHouseFaqSchema = z.object({
  question: z.string().min(6).max(300).trim(),
  answer: z.string().min(6).max(4000).trim(),
  sourceReference: z.string().min(3).max(300).trim(),
  displayOrder: z.number().int().min(0).default(0),
});
export type CreateLittleHouseFaqInput = z.infer<typeof createLittleHouseFaqSchema>;

export const updateLittleHouseFaqSchema = createLittleHouseFaqSchema.partial();
export type UpdateLittleHouseFaqInput = z.infer<typeof updateLittleHouseFaqSchema>;

export const publishLittleHouseSchema = z.object({
  status: littleHouseStatusSchema,
  changeSummary: z.string().min(3).max(500).trim(),
});
export type PublishLittleHouseInput = z.infer<typeof publishLittleHouseSchema>;

import { z } from "zod";

// ── Post schemas ──────────────────────────────────────────────────────

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  content: z.record(z.string(), z.unknown()), // Lexical JSON
  featuredImageId: z.string().optional(),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  featuredImageId: z.string().optional().nullable(),
});

export const listPostsQuerySchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  authorId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const postResponseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  content: z.record(z.string(), z.unknown()),
  status: z.string(),
  author: z.object({
    id: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().nullable(),
  }),
  featuredImageUrl: z.string().nullable(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CreatePostRequest = z.infer<typeof createPostSchema>;
export type UpdatePostRequest = z.infer<typeof updatePostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
export type PostResponse = z.infer<typeof postResponseSchema>;

// ── Guide schemas ──────────────────────────────────────────────────────

export const guideQuerySchema = z.object({
  category: z.string().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  tag: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.string().optional(),
  search: z.string().optional(),
});

export const createGuideSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  content: z.record(z.string(), z.unknown()), // Lexical JSON
  category: z.enum(["BEGINNER", "DAILY_PRACTICE", "LITTLE_HOUSE", "LIFE_RELEASE", "GENERAL"]),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  difficulty: z.number().int().min(1).max(5),
  estimatedMinutes: z.number().int().min(1).max(480),
  tags: z.array(z.string().min(1).max(50)).max(10),
  featuredImageId: z.string().optional(),
});

export const updateGuideSchema = createGuideSchema.partial();

export type GuideQuery = z.infer<typeof guideQuerySchema>;
export type CreateGuideRequest = z.infer<typeof createGuideSchema>;
export type UpdateGuideRequest = z.infer<typeof updateGuideSchema>;

// ── Download schemas ──────────────────────────────────────────────────────

export const downloadQuerySchema = z.object({
  category: z.string().optional(),
  fileType: z.enum(["PDF", "AUDIO", "VIDEO", "IMAGE", "DOCUMENT"]).optional(),
  tag: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.string().optional(),
  search: z.string().optional(),
});

export const createDownloadSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(["GUIDE", "TEMPLATE", "REFERENCE", "FAQ"]),
  fileType: z.enum(["PDF", "AUDIO", "VIDEO", "IMAGE", "DOCUMENT"]),
  fileSize: z.number().int().min(0),
  filePath: z.string().min(1),
  fileUrl: z.string().min(1),
  tags: z.array(z.string().min(1).max(50)).max(10),
  thumbnailId: z.string().optional(),
});

export const updateDownloadSchema = createDownloadSchema.partial();

export type DownloadQuery = z.infer<typeof downloadQuerySchema>;
export type CreateDownloadRequest = z.infer<typeof createDownloadSchema>;
export type UpdateDownloadRequest = z.infer<typeof updateDownloadSchema>;

// ── Media Collection schemas ──────────────────────────────────────────────────────

const COLLECTION_TYPES = [
  "PHOTO_ALBUM",
  "VIDEO_PLAYLIST",
  "MIXED_GALLERY",
  "FEATURED_STORY_GALLERY",
] as const;

const ITEM_TYPES = [
  "IMAGE",
  "VIDEO_EMBED",
  "UPLOADED_VIDEO",
  "POSTER",
  "EXTERNAL_PLAYLIST_LINK",
] as const;

export const createCollectionSchema = z.object({
  title:              z.string().min(1).max(200),
  slug:               z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  collectionType:     z.enum(COLLECTION_TYPES),
  description:        z.string().max(2000).optional(),
  sourceNote:         z.string().max(1000).optional(),
  coverMediaPublicId: z.string().optional(),
  featured:           z.boolean().optional(),
  sortOrder:          z.coerce.number().int().min(0).optional(),
});

export const updateCollectionSchema = z.object({
  title:              z.string().min(1).max(200).optional(),
  slug:               z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  description:        z.string().max(2000).optional().nullable(),
  sourceNote:         z.string().max(1000).optional().nullable(),
  coverMediaPublicId: z.string().optional().nullable(),
  featured:           z.boolean().optional(),
  sortOrder:          z.coerce.number().int().min(0).optional(),
});

export const listCollectionsSchema = z.object({
  search:         z.string().optional(),
  collectionType: z.enum(COLLECTION_TYPES).optional(),
  status:         z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  featured:       z.coerce.boolean().optional(),
  limit:          z.coerce.number().int().min(1).max(100).default(20),
  offset:         z.coerce.number().int().min(0).default(0),
});

export const addCollectionItemSchema = z.object({
  itemType:          z.enum(ITEM_TYPES),
  mediaAssetPublicId: z.string().optional(),
  externalUrl:       z.string().url("URL không hợp lệ").optional(),
  title:             z.string().max(300).optional(),
  caption:           z.string().max(1000).optional(),
  ownerModule:       z.string().max(50).optional(),
  ownerPublicRef:    z.string().max(200).optional(),
  sortOrder:         z.coerce.number().int().min(0).optional(),
}).refine(
  (d) => d.mediaAssetPublicId !== undefined || d.externalUrl !== undefined,
  "Phải có mediaAssetPublicId hoặc externalUrl",
);

export const updateCollectionItemSchema = z.object({
  title:      z.string().max(300).optional().nullable(),
  caption:    z.string().max(1000).optional().nullable(),
  sortOrder:  z.coerce.number().int().min(0).optional(),
});

export const listItemsSchema = z.object({
  limit:  z.coerce.number().int().min(1).max(200).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateCollectionRequest = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionRequest = z.infer<typeof updateCollectionSchema>;
export type ListCollectionsQuery = z.infer<typeof listCollectionsSchema>;
export type AddCollectionItemRequest = z.infer<typeof addCollectionItemSchema>;
export type UpdateCollectionItemRequest = z.infer<typeof updateCollectionItemSchema>;
export type ListItemsQuery = z.infer<typeof listItemsSchema>;

// ── Chanting schemas ──────────────────────────────────────────────────────

export const groupKeySchema = z.enum([
  "time-rules",
  "place-rules",
  "food-body-rules",
  "posture-hygiene-rules",
  "special-location-cautions",
  "non-interpretive-cautions",
]);

export const severitySchema = z.enum([
  "advisory",
  "caution",
  "strong_guardrail",
  "quality_guidance",
  "reference_only",
]);

export const productizationModeSchema = z.enum([
  "warning_card",
  "checklist_item",
  "safe_lane_suggestion",
  "drawer_note",
  "reference_only_note",
  "do_not_automate",
]);

export const chantEnvironmentRuleResponseSchema = z.object({
  ruleKey: z.string(),
  title: z.string(),
  canonicalWording: z.string(),
  severity: severitySchema,
  productizationMode: productizationModeSchema,
  safeLaneRefs: z.array(z.string()).optional(),
  avoidItems: z.array(z.string()).optional(),
  shortReason: z.string().nullable(),
  sourceReference: z.string().nullable(),
  versionNote: z.string().nullable(),
  referenceOnly: z.boolean(),
});

export const severityLegendItemSchema = z.object({
  severity: severitySchema,
  label: z.string(),
  description: z.string(),
});

export const chantEnvironmentRuleGroupResponseSchema = z.object({
  groupKey: groupKeySchema,
  title: z.string(),
  summary: z.string(),
  severityLegend: z.array(severityLegendItemSchema),
  rules: z.array(chantEnvironmentRuleResponseSchema),
  lastReviewedAt: z.string(),
  versionNote: z.string().nullable(),
});

export const groupCardSchema = z.object({
  groupKey: groupKeySchema,
  title: z.string(),
  summary: z.string(),
  ruleCount: z.number(),
});

export const introSchema = z.object({
  title: z.string(),
  summary: z.string(),
  updatedAt: z.string(),
});

export const quickChecklistSchema = z.object({
  beforeYouStart: z.array(z.string()),
  whenToPause: z.array(z.string()),
  safeLaneSuggestions: z.array(z.string()),
});

export const specialLocationHighlightSchema = z.object({
  topic: z.string(),
  summary: z.string(),
});

export const referenceOnlyCautionSchema = z.object({
  topic: z.string(),
  summary: z.string(),
  ctaLabel: z.string(),
  ctaHref: z.string(),
});

export const relatedGuideRefSchema = z.object({
  title: z.string(),
  href: z.string(),
  surface: z.string(),
});

export const chantEnvironmentRulesPageResponseSchema = z.object({
  intro: introSchema,
  groupCards: z.array(groupCardSchema),
  groups: z.array(chantEnvironmentRuleGroupResponseSchema),
  quickChecklist: quickChecklistSchema,
  specialLocationHighlights: z.array(specialLocationHighlightSchema),
  referenceOnlyCautions: z.array(referenceOnlyCautionSchema),
  relatedGuideRefs: z.array(relatedGuideRefSchema),
});

export const q161ContentRulePackResponseSchema = z.object({
  chantKey: z.literal("le_phat_dai_sam_hoi_van"),
  reviewStatus: z.literal("human_review_required"),
  recitationCaps: z.array(
    z.object({
      key: z.string().check(z.minLength(1)),
      scope: z.enum(["single_day_total", "cross_day_total"]),
      maxCount: z.number().int().positive(),
      appliesTo: z.string().check(z.minLength(1)),
    }),
  ),
  crossDayCapRules: z.array(
    z.object({
      key: z.string().check(z.minLength(1)),
      window: z.string().check(z.minLength(1)),
      maxCount: z.number().check(z.int(), z.gte(1)),
    }),
  ),
  audienceCapRules: z.array(
    z.object({
      audience: z.string().check(z.minLength(1)),
      maxCount: z.number().check(z.int(), z.gte(1)),
    }),
  ),
  littleHouseCapRules: z.array(
    z.object({
      dayType: z.string().check(z.minLength(1)),
      capType: z.enum(["total_all_types", "per_type", "per_target_type"]),
      maxCount: z.number().check(z.int(), z.gte(1)),
    }),
  ),
});

export type Q161ContentRulePackResponse = z.infer<typeof q161ContentRulePackResponseSchema>;

export const adminUpdateEnvironmentRuleSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    canonicalWording: z.string().trim().min(1).optional(),
    severity: severitySchema.optional(),
    productizationMode: productizationModeSchema.optional(),
    safeLaneRefs: z.array(z.string().trim().min(1)).optional(),
    avoidItems: z.array(z.string().trim().min(1)).optional(),
    shortReason: z.string().trim().max(500).nullable().optional(),
    sourceReference: z.string().trim().max(500).nullable().optional(),
    versionNote: z.string().trim().max(500).nullable().optional(),
    referenceOnly: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Payload cập nhật không được để trống.",
  });

export type GroupKey = z.infer<typeof groupKeySchema>;
export type Severity = z.infer<typeof severitySchema>;
export type ProductizationMode = z.infer<typeof productizationModeSchema>;
export type ChantEnvironmentRuleResponse = z.infer<typeof chantEnvironmentRuleResponseSchema>;
export type ChantEnvironmentRuleGroupResponse = z.infer<typeof chantEnvironmentRuleGroupResponseSchema>;
export type ChantEnvironmentRulesPageResponse = z.infer<typeof chantEnvironmentRulesPageResponseSchema>;
export type AdminUpdateEnvironmentRuleInput = z.infer<typeof adminUpdateEnvironmentRuleSchema>;
import { z } from "zod";

export const askQuestionSchema = z.object({
  title: z.string().check(z.minLength(10), z.maxLength(300)),
  body: z.string().check(z.minLength(20), z.maxLength(5000)),
  categoryId: z.string().check(z.maxLength(100)).optional(),
  tags: z.array(z.string().check(z.maxLength(50))).check(z.maxLength(5)).optional(),
  isAnonymous: z.boolean().default(false),
});

export type AskQuestionInput = z.infer<typeof askQuestionSchema>;

export const submitAnswerSchema = z.object({
  questionId: z.string().check(z.minLength(1)),
  body: z.string().check(z.minLength(20), z.maxLength(10000)),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;

export const wisdomQaQuerySchema = z.object({
  page: z.coerce.number().check(z.int(), z.gte(1)).default(1),
  pageSize: z.coerce.number().check(z.int(), z.gte(1), z.lte(50)).default(12),
  status: z.enum(["open", "answered", "closed"]).optional(),
  categoryId: z.string().check(z.maxLength(100)).optional(),
});

export type WisdomQaQuery = z.infer<typeof wisdomQaQuerySchema>;

export const q161RulePackResponseSchema = z.object({
  sourceCode: z.literal("q161"),
  reviewStatus: z.literal("human_review_required"),
  recitationCaps: z.array(
    z.object({
      key: z.string().check(z.minLength(1)),
      scope: z.enum(["single_day_total", "cross_day_total"]),
      maxCount: z.number().check(z.int(), z.gte(1)),
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

export type Q161RulePackResponse = z.infer<typeof q161RulePackResponseSchema>;

// ── Admin Wisdom Entry schemas ───────────────────────────────────────

export const wisdomEntryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.string().optional(),
  entryType: z.string().optional(),
  search: z.string().optional(),
});
export type WisdomEntryQuery = z.infer<typeof wisdomEntryQuerySchema>;

export const createWisdomEntrySchema = z.object({
  title: z.string().min(3).max(300),
  slug: z.string().min(3).max(200).optional(),
  entryType: z.enum(["BACH_THOAI", "KHAI_THI", "PHAT_NGON", "PHAP_HOI"]).default("BACH_THOAI"),
  sourceFamily: z.string().max(100).optional(),
  sourceUrl: z.string().max(500).optional(),
  sourceCode: z.string().max(200).optional(),
  originalText: z.string().optional(),
  translatedText: z.string().optional(),
  tags: z.array(z.string().max(50)).max(10).default([]),
});
export type CreateWisdomEntryInput = z.infer<typeof createWisdomEntrySchema>;

export const updateWisdomEntrySchema = z.object({
  title: z.string().min(3).max(300).optional(),
  slug: z.string().min(3).max(200).optional(),
  entryType: z.enum(["BACH_THOAI", "KHAI_THI", "PHAT_NGON", "PHAP_HOI"]).optional(),
  sourceFamily: z.string().max(100).optional(),
  sourceUrl: z.string().max(500).optional(),
  sourceCode: z.string().max(200).optional(),
  originalText: z.string().optional(),
  translatedText: z.string().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});
export type UpdateWisdomEntryInput = z.infer<typeof updateWisdomEntrySchema>;

export const wisdomEntryResponseSchema = z.object({
  id: z.string(),
  publicId: z.string(),
  title: z.string(),
  slug: z.string(),
  entryType: z.string(),
  sourceFamily: z.string().nullable(),
  sourceUrl: z.string().nullable(),
  sourceCode: z.string().nullable(),
  originalText: z.string().nullable(),
  translatedText: z.string().nullable(),
  tags: z.array(z.string()),
  status: z.string(),
  author: z.object({
    publicId: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().nullable(),
  }),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type WisdomEntryResponse = z.infer<typeof wisdomEntryResponseSchema>;

// ── Authority Profile schemas ───────────────────────────────────────

export const createAuthorityProfileSchema = z.object({
  name: z.string().min(2).max(200),
  title: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  sourceFamily: z.string().max(100).optional(),
});
export type CreateAuthorityProfileInput = z.infer<typeof createAuthorityProfileSchema>;

export const updateAuthorityProfileSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  title: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  sourceFamily: z.string().max(100).optional(),
});
export type UpdateAuthorityProfileInput = z.infer<typeof updateAuthorityProfileSchema>;

export const authorityProfileQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  isActive: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});
export type AuthorityProfileQuery = z.infer<typeof authorityProfileQuerySchema>;

// ── Public wisdom entries hub schemas ───────────────────────────────

export const wisdomEntryPublicQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  type: z.enum(["BACH_THOAI", "KHAI_THI", "PHAT_NGON", "PHAP_HOI"]).optional(),
  sourceFamily: z.string().max(100).optional(),
});
export type WisdomEntryPublicQuery = z.infer<typeof wisdomEntryPublicQuerySchema>;

// ── Duplicate check schema ──────────────────────────────────────────

export const duplicateCheckSchema = z.object({
  title: z.string().min(1).max(300),
});
export type DuplicateCheckInput = z.infer<typeof duplicateCheckSchema>;

// ── Gemini assist schemas ───────────────────────────────────────────

export const suggestSlugSchema = z.object({
  title: z.string().min(3).max(300),
  sourceCode: z.string().max(200).optional(),
});
export type SuggestSlugInput = z.infer<typeof suggestSlugSchema>;

export const suggestSlugResponseSchema = z.object({
  slug: z.string().min(3).max(200),
  model: z.string(),
});
export type SuggestSlugResponse = z.infer<typeof suggestSlugResponseSchema>;

export const translationDraftSchema = z.object({
  originalText: z.string().min(5).max(20000),
  title: z.string().max(300).optional(),
  sourceCode: z.string().max(200).optional(),
});
export type TranslationDraftInput = z.infer<typeof translationDraftSchema>;

export const translationDraftResponseSchema = z.object({
  translatedText: z.string().min(5),
  model: z.string(),
});
export type TranslationDraftResponse = z.infer<typeof translationDraftResponseSchema>;

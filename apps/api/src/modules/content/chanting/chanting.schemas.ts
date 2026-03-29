import { z } from "zod";

// Canonical group keys per API_DTO_SHAPE_PLAN.md
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

// Single rule response
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

// Severity legend item
export const severityLegendItemSchema = z.object({
  severity: severitySchema,
  label: z.string(),
  description: z.string(),
});

// Group response for /:groupKey endpoint
export const chantEnvironmentRuleGroupResponseSchema = z.object({
  groupKey: groupKeySchema,
  title: z.string(),
  summary: z.string(),
  severityLegend: z.array(severityLegendItemSchema),
  rules: z.array(chantEnvironmentRuleResponseSchema),
  lastReviewedAt: z.string(),
  versionNote: z.string().nullable(),
});

// Group card for page aggregate
export const groupCardSchema = z.object({
  groupKey: groupKeySchema,
  title: z.string(),
  summary: z.string(),
  ruleCount: z.number(),
});

// Intro section
export const introSchema = z.object({
  title: z.string(),
  summary: z.string(),
  updatedAt: z.string(),
});

// Checklist section
export const quickChecklistSchema = z.object({
  beforeYouStart: z.array(z.string()),
  whenToPause: z.array(z.string()),
  safeLaneSuggestions: z.array(z.string()),
});

// Special location highlight
export const specialLocationHighlightSchema = z.object({
  topic: z.string(),
  summary: z.string(),
});

// Reference-only caution
export const referenceOnlyCautionSchema = z.object({
  topic: z.string(),
  summary: z.string(),
  ctaLabel: z.string(),
  ctaHref: z.string(),
});

// Related guide ref
export const relatedGuideRefSchema = z.object({
  title: z.string(),
  href: z.string(),
  surface: z.string(),
});

// Full page DTO per API_DTO_SHAPE_PLAN.md ChantEnvironmentRulesPageDto
export const chantEnvironmentRulesPageResponseSchema = z.object({
  intro: introSchema,
  groupCards: z.array(groupCardSchema),
  groups: z.array(chantEnvironmentRuleGroupResponseSchema),
  quickChecklist: quickChecklistSchema,
  specialLocationHighlights: z.array(specialLocationHighlightSchema),
  referenceOnlyCautions: z.array(referenceOnlyCautionSchema),
  relatedGuideRefs: z.array(relatedGuideRefSchema),
});

export type GroupKey = z.infer<typeof groupKeySchema>;
export type Severity = z.infer<typeof severitySchema>;
export type ProductizationMode = z.infer<typeof productizationModeSchema>;
export type ChantEnvironmentRuleResponse = z.infer<typeof chantEnvironmentRuleResponseSchema>;
export type ChantEnvironmentRuleGroupResponse = z.infer<typeof chantEnvironmentRuleGroupResponseSchema>;
export type ChantEnvironmentRulesPageResponse = z.infer<typeof chantEnvironmentRulesPageResponseSchema>;

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

export type AdminUpdateEnvironmentRuleInput = z.infer<typeof adminUpdateEnvironmentRuleSchema>;

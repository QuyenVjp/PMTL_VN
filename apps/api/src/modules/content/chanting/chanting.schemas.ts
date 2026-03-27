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

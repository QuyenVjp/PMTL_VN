import { z } from "zod";

// ============================================================================
// Shared rule item schema (matches design/04-execution-overlay/api/schemas/practice-support-playbook.schema.json)
// ============================================================================

export const ruleItemSchema = z.object({
  ruleCode: z.string().regex(/^[a-z0-9-]+$/),
  label: z.string().min(1),
  description: z.string().min(1),
  severity: z.enum(["info", "warning", "critical"]),
});

export type RuleItem = z.infer<typeof ruleItemSchema>;

// ============================================================================
// Vietnam Home Practice Guide DTO
// ============================================================================

export const vietnamHomePracticeGuideSchema = z.object({
  publicId: z.string().min(8),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  overview: z.string().min(1),
  homeAltarRules: z.array(ruleItemSchema),
  heartIncenseFallbackRules: z.array(ruleItemSchema),
  littleHouseDisciplineRules: z.array(ruleItemSchema),
  familyCoordinationRules: z.array(ruleItemSchema),
  sacredItemRules: z.array(ruleItemSchema),
  accidentalViolationRecovery: z.array(ruleItemSchema),
  vegetarianDisciplineRules: z.array(ruleItemSchema),
  officeNutritionNotes: z.array(z.string().min(1)),
  supplementalDietNotes: z.array(z.string().min(1)),
  complianceAndEthicsRules: z.array(ruleItemSchema),
  updatedAt: z.string(),
});

export type VietnamHomePracticeGuideDto = z.infer<typeof vietnamHomePracticeGuideSchema>;

// ============================================================================
// Admin update schema (partial for PATCH)
// ONLY the 3 approved editable fields per scope
// ============================================================================

export const updateVietnamHomePracticeGuideSchema = z.object({
  vegetarianDisciplineRules: z.array(ruleItemSchema).optional(),
  officeNutritionNotes: z.array(z.string().min(1)).optional(),
  supplementalDietNotes: z.array(z.string().min(1)).optional(),
});

export type UpdateVietnamHomePracticeGuideInput = z.infer<typeof updateVietnamHomePracticeGuideSchema>;

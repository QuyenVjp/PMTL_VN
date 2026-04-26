import { z } from "zod";

// ─── Charity Whitelist ────────────────────────────────────────────────────────

export const charityQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.string().optional(),
  search: z.string().optional(),
});
export type CharityQuery = z.infer<typeof charityQuerySchema>;

export const createCharitySchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  websiteUrl: z.string().url().optional(),
  registrationNumber: z.string().max(100).optional(),
  charityType: z.enum(["FOOD_BANK", "MEDICAL", "EDUCATION", "DISASTER_RELIEF", "ANIMAL_WELFARE", "OTHER"]),
  contactEmail: z.string().email().optional(),
});
export type CreateCharityInput = z.infer<typeof createCharitySchema>;

export const updateCharityStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "FLAGGED", "PENDING_REVIEW"]),
  reason: z.string().trim().min(5).max(500),
});
export type UpdateCharityStatusInput = z.infer<typeof updateCharityStatusSchema>;

// ─── Charity Lifecycle (suspend / revoke) ────────────────────────────────────

export const suspendCharitySchema = z.object({
  reason: z.string().trim().min(5).max(500),
});
export type SuspendCharityInput = z.infer<typeof suspendCharitySchema>;

export const revokeCharitySchema = z.object({
  reason: z.string().trim().min(5).max(500),
});
export type RevokeCharityInput = z.infer<typeof revokeCharitySchema>;

// ─── Charity Whitelisting Rules ───────────────────────────────────────────────
// Mirrors Prisma enum WhitelistingCriteriaType (prisma/schema.prisma:1681)
export const whitelistingCriteriaTypeSchema = z.enum([
  "LEGAL_REGISTRATION",
  "FINANCIAL_TRANSPARENCY",
  "MONK_VERIFICATION",
  "COMMUNITY_ENDORSEMENT",
  "TRACK_RECORD",
  "AUDIT_REPORT",
  "NO_FRAUD_HISTORY",
]);
export type WhitelistingCriteriaType = z.infer<typeof whitelistingCriteriaTypeSchema>;

export const createCharityRuleSchema = z.object({
  ruleType: whitelistingCriteriaTypeSchema,
  description: z.string().trim().min(5).max(1000),
  evidenceUrl: z.string().trim().url().max(500).optional(),
});
export type CreateCharityRuleInput = z.infer<typeof createCharityRuleSchema>;

export const updateCharityRuleSchema = z
  .object({
    verified: z.boolean().optional(),
    evidenceUrl: z.string().trim().url().max(500).optional(),
    description: z.string().trim().min(5).max(1000).optional(),
  })
  .refine(
    (v) => v.verified !== undefined || v.evidenceUrl !== undefined || v.description !== undefined,
    { message: "Phải cung cấp ít nhất một trường cập nhật" },
  );
export type UpdateCharityRuleInput = z.infer<typeof updateCharityRuleSchema>;

// ─── Fraud Alerts ─────────────────────────────────────────────────────────────

export const fraudAlertQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  severity: z.string().optional(),
  resolved: z.coerce.boolean().optional(),
});
export type FraudAlertQuery = z.infer<typeof fraudAlertQuerySchema>;

export const resolveFraudAlertSchema = z.object({
  resolution: z.string().min(10).max(1000),
});
export type ResolveFraudAlertInput = z.infer<typeof resolveFraudAlertSchema>;

// ─── Marital Purity Vow ───────────────────────────────────────────────────────

export const vowQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.string().optional(),
  purityLevel: z.string().optional(),
});
export type VowQuery = z.infer<typeof vowQuerySchema>;

export const registerVowSchema = z.object({
  spouseId: z.string().optional(),
  vowDate: z.string().datetime(),
  purityLevel: z.enum(["FULL", "EMOTIONAL", "PHYSICAL"]),
  kissAllowed: z.boolean().default(false),
  hugAllowed: z.boolean().default(true),
  sleepArrangement: z.enum(["SAME_BED", "SEPARATE_BEDS", "SEPARATE_ROOMS"]).default("SEPARATE_BEDS"),
  dailyRecitations: z.array(z.string()).default([]),
  notes: z.string().max(2000).optional(),
});
export type RegisterVowInput = z.infer<typeof registerVowSchema>;

export const logThoughtSchema = z.object({
  thoughtType: z.enum(["SEXUAL", "ATTACHMENT", "JEALOUSY", "PHYSICAL_URGE"]),
  intensity: z.number().int().min(1).max(10),
  durationMinutes: z.number().int().min(0).optional(),
  trigger: z.string().max(500).optional(),
  responseAction: z.enum(["RECITATION", "MEDITATION", "SEPARATION", "COLD_SHOWER"]).optional(),
  recitationsUsed: z.array(z.string()).default([]),
  resolved: z.boolean().default(false),
  reflection: z.string().max(2000).optional(),
});
export type LogThoughtInput = z.infer<typeof logThoughtSchema>;

export const guidanceRequestSchema = z.object({
  category: z.enum([
    "DEFINITION",
    "BOUNDARY",
    "EMOTIONAL_CARE",
    "VIOLATION_RECOVERY",
    "SLEEP_ARRANGEMENT",
    "CAREGIVING",
  ]),
  question: z.string().min(5).max(500),
  context: z.string().max(1000).optional(),
  urgency: z.enum(["ROUTINE", "URGENT", "CRISIS"]).default("ROUTINE"),
});
export type GuidanceRequestInput = z.infer<typeof guidanceRequestSchema>;

export const respondGuidanceSchema = z.object({
  response: z.string().min(10).max(5000),
});
export type RespondGuidanceInput = z.infer<typeof respondGuidanceSchema>;

export const reportViolationSchema = z.object({
  violationType: z.enum(["ACCIDENTAL_TOUCH", "PARTIAL_BREACH", "FULL_BREACH"]),
  occurredAt: z.string().datetime(),
  description: z.string().min(5).max(2000),
});
export type ReportViolationInput = z.infer<typeof reportViolationSchema>;

export const thoughtLogQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  days: z.coerce.number().int().min(1).max(90).default(7),
});
export type ThoughtLogQuery = z.infer<typeof thoughtLogQuerySchema>;

export const guidanceQueueQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  urgency: z.string().optional(),
  status: z.string().optional(),
});
export type GuidanceQueueQuery = z.infer<typeof guidanceQueueQuerySchema>;

// ─── Charity Firewall (Content Scanning) ──────────────────────────────────────

export const contentScanInputSchema = z.object({
  text: z.string().min(1).max(10000),
  contentType: z.enum([
    "POST",
    "COMMENT",
    "DONATION_FORM",
    "MESSAGE",
    "OTHER",
    "post",
    "comment",
    "testimonial",
    "guestbook",
    "wisdom_question",
    "wisdom_answer",
    "contact_message",
  ]),
});
export type ContentScanInput = z.infer<typeof contentScanInputSchema>;

export interface ScanResult {
  userId: string;
  contentType: string;
  contentId: string;
  text: string;
  detectedPatterns: {
    type: string;
    confidence: "HIGH" | "MEDIUM" | "LOW";
    matchedText: string;
  }[];
  hasViolation: boolean;
  whitelistedMatch?: {
    charityName: string;
    bankAccount: string;
  };
  violationId?: string;
  userViolationCount: number;
  escalatedToAlert: boolean;
  alertId?: string;
}

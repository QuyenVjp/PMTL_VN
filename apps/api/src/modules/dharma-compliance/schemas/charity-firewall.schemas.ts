import { z } from "zod";

/**
 * Charity Firewall Schemas
 * Zod validation for bank pattern detection and content violation scanning
 */

// ─── Bank Pattern Match ────────────────────────────────────────────────────

export const bankPatternMatchSchema = z.object({
  pattern: z.string().min(1).describe("Pattern identifier (e.g., VN_STK, IBAN, CARD_16_DIGIT)"),
  matchedText: z
    .string()
    .min(1)
    .describe("The actual matched text from input"),
  confidence: z
    .enum(["HIGH", "MEDIUM", "LOW"])
    .describe("Confidence level of the match"),
  type: z
    .enum(["VN_ACCOUNT", "IBAN", "CARD", "EWALLET", "UNKNOWN"])
    .describe("Classification of the matched account type"),
  context: z
    .string()
    .optional()
    .describe("Surrounding text context for debugging"),
  position: z
    .object({
      start: z.number().int().min(0),
      end: z.number().int().min(0),
    })
    .optional()
    .describe("Position in the original text"),
});

export type BankPatternMatch = z.infer<typeof bankPatternMatchSchema>;

// ─── Content Violation Event ───────────────────────────────────────────────

export const contentViolationEventSchema = z.object({
  eventId: z
    .string()
    .describe("Unique identifier for this violation event"),
  timestamp: z
    .string()
    .datetime()
    .describe("When the violation was detected (ISO 8601)"),
  sourceType: z
    .enum(["USER_COMMENT", "POST_CONTENT", "PROFILE_BIO", "MESSAGE", "FORUM_POST", "CHARITY_APPLICATION"])
    .describe("Type of content being scanned"),
  sourceId: z
    .string()
    .describe("ID of the source (comment ID, post ID, user ID, etc)"),
  contentHash: z
    .string()
    .describe("SHA256 hash of scanned content for deduplication"),
  detectedPatterns: z
    .array(bankPatternMatchSchema)
    .describe("Array of detected bank patterns"),
  violationSeverity: z
    .enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"])
    .describe("Severity based on pattern confidence and frequency"),
  additionalFlags: z
    .array(z.string())
    .default([])
    .describe("Additional security flags (e.g., 'REPEATED_PATTERN', 'MULTIPLE_WALLETS')"),
  actionRequired: z
    .enum(["IMMEDIATE_BLOCK", "MANUAL_REVIEW", "QUARANTINE", "LOG_ONLY"])
    .describe("Recommended action by the system"),
  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .describe("Additional context-specific metadata"),
});

export type ContentViolationEvent = z.infer<typeof contentViolationEventSchema>;

// ─── Firewall Scan Result ─────────────────────────────────────────────────

export const firewallScanResultSchema = z.object({
  scanId: z
    .string()
    .describe("Unique scan session ID"),
  isClean: z
    .boolean()
    .describe("True if no violations detected, false otherwise"),
  riskLevel: z
    .enum(["SAFE", "LOW_RISK", "MEDIUM_RISK", "HIGH_RISK", "CRITICAL"])
    .describe("Overall risk assessment"),
  totalPatternsFound: z
    .number()
    .int()
    .min(0)
    .describe("Total number of patterns detected"),
  highConfidenceCount: z
    .number()
    .int()
    .min(0)
    .describe("Count of HIGH confidence matches"),
  mediumConfidenceCount: z
    .number()
    .int()
    .min(0)
    .describe("Count of MEDIUM confidence matches"),
  lowConfidenceCount: z
    .number()
    .int()
    .min(0)
    .describe("Count of LOW confidence matches"),
  detailedMatches: z
    .array(bankPatternMatchSchema)
    .describe("Detailed match information"),
  summary: z
    .string()
    .describe("Human-readable summary of scan results"),
  recommendedAction: z
    .enum(["ALLOW", "FLAG_FOR_REVIEW", "QUARANTINE", "BLOCK"])
    .describe("Recommended action"),
  scanDurationMs: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("How long the scan took in milliseconds"),
});

export type FirewallScanResult = z.infer<typeof firewallScanResultSchema>;

// ─── Scan Request ────────────────────────────────────────────────────────

export const scanRequestSchema = z.object({
  content: z
    .string()
    .max(50000)
    .describe("Text content to scan for financial patterns"),
  contentType: z
    .enum([
      "PLAIN_TEXT",
      "MARKDOWN",
      "HTML",
      "USER_COMMENT",
      "POST_BODY",
      "PROFILE_FIELD",
    ])
    .default("PLAIN_TEXT")
    .describe("Format of the content"),
  sourceId: z
    .string()
    .optional()
    .describe("ID of the source (for audit trail)"),
  onlyCheckHighConfidence: z
    .boolean()
    .default(false)
    .describe("Only return HIGH confidence matches"),
  maskResults: z
    .boolean()
    .default(false)
    .describe("Mask matched account numbers in results"),
});

export type ScanRequest = z.infer<typeof scanRequestSchema>;

// ─── Batch Scan Request ──────────────────────────────────────────────────

export const batchScanRequestSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().describe("Unique identifier for this item"),
        content: z.string().max(50000),
        contentType: z
          .enum([
            "PLAIN_TEXT",
            "MARKDOWN",
            "HTML",
            "USER_COMMENT",
            "POST_BODY",
            "PROFILE_FIELD",
          ])
          .default("PLAIN_TEXT"),
      }),
    )
    .min(1)
    .max(100)
    .describe("Array of content items to scan"),
  stopOnFirstViolation: z
    .boolean()
    .default(false)
    .describe("Stop scanning after finding first HIGH confidence violation"),
});

export type BatchScanRequest = z.infer<typeof batchScanRequestSchema>;

// ─── Batch Scan Response ─────────────────────────────────────────────────

export const batchScanResponseSchema = z.object({
  batchId: z.string().describe("Unique batch scan ID"),
  totalScanned: z.number().int().min(0),
  cleanItems: z.number().int().min(0),
  flaggedItems: z.number().int().min(0),
  results: z
    .array(
      z.object({
        itemId: z.string(),
        isClean: z.boolean(),
        riskLevel: z.enum(["SAFE", "LOW_RISK", "MEDIUM_RISK", "HIGH_RISK", "CRITICAL"]),
        matchCount: z.number().int().min(0),
        scanResult: firewallScanResultSchema.optional(),
      }),
    )
    .describe("Individual scan results for each item"),
});

export type BatchScanResponse = z.infer<typeof batchScanResponseSchema>;

// ─── Violation Report ────────────────────────────────────────────────────

export const violationReportSchema = z.object({
  reportId: z.string().describe("Unique report ID"),
  eventId: z.string().describe("Associated content violation event ID"),
  detectionTimestamp: z
    .string()
    .datetime()
    .describe("When violation was detected"),
  reportedAt: z
    .string()
    .datetime()
    .describe("When violation was reported"),
  reportedByUserId: z
    .string()
    .optional()
    .describe("User ID if reported manually"),
  reportStatus: z
    .enum(["OPEN", "UNDER_REVIEW", "RESOLVED", "FALSE_POSITIVE", "WHITELISTED"])
    .default("OPEN"),
  violationDetails: contentViolationEventSchema,
  moderatorNotes: z
    .string()
    .optional()
    .describe("Notes from moderator"),
  resolutionAction: z
    .enum([
      "CONTENT_REMOVED",
      "ACCOUNT_SUSPENDED",
      "ACCOUNT_BANNED",
      "WARNING_ISSUED",
      "DISMISSED",
      "ESCALATED",
    ])
    .optional(),
  resolvedAt: z
    .string()
    .datetime()
    .optional(),
});

export type ViolationReport = z.infer<typeof violationReportSchema>;

// ─── Firewall Statistics ─────────────────────────────────────────────────

export const firewallStatisticsSchema = z.object({
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  totalScans: z.number().int().min(0),
  totalViolations: z.number().int().min(0),
  violationsByType: z.record(z.string(), z.number().int()),
  violationsBySeverity: z.object({
    CRITICAL: z.number().int().min(0),
    HIGH: z.number().int().min(0),
    MEDIUM: z.number().int().min(0),
    LOW: z.number().int().min(0),
  }),
  detectionsByAccountType: z.record(z.string(), z.number().int()),
  falsePositiveRate: z.number().min(0).max(1),
  averageScanTimeMs: z.number().min(0),
});

export type FirewallStatistics = z.infer<typeof firewallStatisticsSchema>;

// ─── Whitelist Entry ─────────────────────────────────────────────────────

export const whitelistEntrySchema = z.object({
  id: z.string(),
  patternHash: z
    .string()
    .describe("Hash of the pattern (for deduplication)"),
  matchedText: z
    .string()
    .optional()
    .describe("Original matched text (optional, for reference)"),
  reason: z
    .enum([
      "FALSE_POSITIVE",
      "LEGITIMATE_USE",
      "TESTING",
      "ADMIN_OVERRIDE",
    ])
    .describe("Why this pattern was whitelisted"),
  sourceId: z.string().optional().describe("Source ID that this applies to"),
  createdAt: z.string().datetime(),
  createdBy: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export type WhitelistEntry = z.infer<typeof whitelistEntrySchema>;

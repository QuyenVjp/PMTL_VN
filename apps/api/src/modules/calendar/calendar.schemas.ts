import { z } from "zod";

// ── Public schemas ──────────────────────────────────────────────────────

export const createEventSchema = z.object({
  title: z.string().check(z.minLength(5), z.maxLength(200)),
  summary: z.string().check(z.maxLength(500)).optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
  location: z.string().check(z.maxLength(300)).optional(),
  isRecurring: z.boolean().default(false),
}).check(
  z.refine(
    (value) => !value.endAt || new Date(value.endAt).getTime() >= new Date(value.startAt).getTime(),
    "endAt must be greater than or equal to startAt",
  ),
);

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const eventQuerySchema = z.object({
  page: z.coerce.number().check(z.int(), z.gte(1)).default(1),
  pageSize: z.coerce.number().check(z.int(), z.gte(1), z.lte(50)).default(12),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type EventQuery = z.infer<typeof eventQuerySchema>;

export const q161CalendarRulePackResponseSchema = z.object({
  sourceCode: z.literal("q161"),
  rulePackKey: z.literal("lphv_special_days_q161"),
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

export type Q161CalendarRulePackResponse = z.infer<typeof q161CalendarRulePackResponseSchema>;

export const advisoryRuntimeStatusResponseSchema = z.object({
  generatedAt: z.string().datetime(),
  cacheMode: z.literal("live"),
});

export type AdvisoryRuntimeStatusResponse = z.infer<typeof advisoryRuntimeStatusResponseSchema>;

// ── Admin schemas ───────────────────────────────────────────────────────

export const adminEventQuerySchema = z.object({
  limit: z.coerce.number().check(z.int(), z.gte(1), z.lte(100)).default(20),
  offset: z.coerce.number().check(z.int(), z.gte(0)).default(0),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]).optional(),
  search: z.string().check(z.maxLength(200)).optional(),
  eventType: z.string().check(z.maxLength(100)).optional(),
});

export type AdminEventQuery = z.infer<typeof adminEventQuerySchema>;

export const adminCreateEventSchema = z.object({
  title: z.string().check(z.minLength(3), z.maxLength(200)),
  description: z.string().check(z.maxLength(5000)).optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
  location: z.string().check(z.maxLength(300)).optional(),
  eventType: z.string().check(z.minLength(1), z.maxLength(100)).default("general"),
  coverImagePublicId: z.string().optional(),
  posterImagePublicId: z.string().optional(),
}).check(
  z.refine(
    (value) => !value.endAt || new Date(value.endAt).getTime() >= new Date(value.startAt).getTime(),
    "endAt phải lớn hơn hoặc bằng startAt",
  ),
);

export type AdminCreateEventInput = z.infer<typeof adminCreateEventSchema>;

export const adminUpdateEventSchema = z.object({
  title: z.string().check(z.minLength(3), z.maxLength(200)).optional(),
  description: z.string().check(z.maxLength(5000)).optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  location: z.string().check(z.maxLength(300)).optional(),
  eventType: z.string().check(z.minLength(1), z.maxLength(100)).optional(),
  coverImagePublicId: z.string().optional().nullable(),
  posterImagePublicId: z.string().optional().nullable(),
});

export type AdminUpdateEventInput = z.infer<typeof adminUpdateEventSchema>;

// ── Agenda item schemas ────────────────────────────────────────────────

export const createAgendaItemSchema = z.object({
  title: z.string().check(z.minLength(1), z.maxLength(300)),
  description: z.string().check(z.maxLength(2000)).optional(),
  startTime: z.string().check(z.maxLength(20)).optional(),
  endTime: z.string().check(z.maxLength(20)).optional(),
  sortOrder: z.number().check(z.int(), z.gte(0)).optional(),
});

export type CreateAgendaItemInput = z.infer<typeof createAgendaItemSchema>;

export const updateAgendaItemSchema = z.object({
  title: z.string().check(z.minLength(1), z.maxLength(300)).optional(),
  description: z.string().check(z.maxLength(2000)).optional().nullable(),
  startTime: z.string().check(z.maxLength(20)).optional().nullable(),
  endTime: z.string().check(z.maxLength(20)).optional().nullable(),
  sortOrder: z.number().check(z.int(), z.gte(0)).optional(),
});

export type UpdateAgendaItemInput = z.infer<typeof updateAgendaItemSchema>;

export const reorderAgendaItemsSchema = z.object({
  items: z.array(
    z.object({
      publicId: z.string().check(z.minLength(1)),
      sortOrder: z.number().check(z.int(), z.gte(0)),
    }),
  ).check(z.minLength(1)),
});

export type ReorderAgendaItemsInput = z.infer<typeof reorderAgendaItemsSchema>;

// ── Event lifecycle schemas ────────────────────────────────────────────

export const rescheduleEventSchema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
  note: z.string().check(z.maxLength(500)).optional(),
});

export type RescheduleEventInput = z.infer<typeof rescheduleEventSchema>;

// ── Bardo 49-day tracker schemas ───────────────────────────────────────

export const createDeceasedProfileSchema = z.object({
  name: z.string().check(z.minLength(1), z.maxLength(200)),
  relationship: z.string().check(z.minLength(1), z.maxLength(100)),
  dateOfDeath: z.string().date(),
});

export type CreateDeceasedProfileInput = z.infer<typeof createDeceasedProfileSchema>;

// ── Daily practice advisory schemas ──────────────────────────────────
// Design: design/03-domains/calendar/USE_CASES/compose-daily-practice-advisory.md

export const DAY_ROLES = [
  "regular_day",
  "special_practice_day",
  "spirit_day",
  "major_holiday",
  "buddha_bodhisattva_day",
  "tet_window_day",
  "luc_trai_day",
] as const;

export type DayRole = (typeof DAY_ROLES)[number];

export const SURFACE_TARGETS = [
  "calendar",
  "member_dashboard",
  "homepage_banner",
  "notification_only",
] as const;

export type SurfaceTarget = (typeof SURFACE_TARGETS)[number];

// ── Advisory card (short, elderly-friendly) ───────────────────────────

export interface AdvisoryCard {
  /** Short heading, e.g. "Mùng 1 tháng 2 âm lịch" */
  readonly title: string;
  /** 1-3 line body text — elderly-friendly, no jargon */
  readonly body: string;
  /** Card intent for FE styling */
  readonly cardKind: "info" | "recommendation" | "caution" | "household";
}

// ── Warning profile ───────────────────────────────────────────────────

export interface WarningProfile {
  /** Machine-readable warning key */
  readonly key: string;
  /** Human-readable Vietnamese summary */
  readonly summaryVi: string;
  /** Severity for UI treatment */
  readonly severity: "info" | "caution" | "hard_block";
}

// ── Source reference ──────────────────────────────────────────────────

export interface AdvisorySourceRef {
  /** Machine key, e.g. "q161" */
  readonly sourceKey: string;
  /** Display label, e.g. "Q&A 161" */
  readonly sourceLabel: string;
  /** Optional URL to canonical source */
  readonly sourceUrl?: string;
  /** Review status of the source material */
  readonly reviewStatus: "verified" | "human_review_required" | "draft";
}

// ── Surface plan ──────────────────────────────────────────────────────

export interface SurfacePlan {
  /** Where this advisory should be displayed */
  readonly targets: readonly SurfaceTarget[];
  /** Priority hint for FE (higher = more prominent placement) */
  readonly priority: "low" | "normal" | "high";
}

// ── Notification plan ─────────────────────────────────────────────────

export interface NotificationPlan {
  /** Whether pre-notification is enabled for this advisory */
  readonly preNotifyEnabled: boolean;
  /** Lead times, e.g. ["T-1", "same_day"] */
  readonly leadTimes: readonly string[];
  /** Channels eligible for delivery */
  readonly eligibleChannels: readonly string[];
}

// ── Recommended action ────────────────────────────────────────────────

export interface RecommendedAction {
  /** Machine key, e.g. "vegetarian", "life_release" */
  readonly key: string;
  /** Vietnamese label */
  readonly labelVi: string;
  /** Action kind for FE rendering */
  readonly actionKind: "encourage" | "avoid" | "required";
}

// ── Compose result (full advisory output) ─────────────────────────────

export interface AdvisoryComposeResult {
  /** ISO date string the advisory was computed for */
  readonly date: string;
  /** Timezone used for date boundary resolution */
  readonly userTimezone: string;
  /** Vietnamese weekday label */
  readonly weekdayVi: string;
  /** Computed day tags */
  readonly dayTags: readonly string[];
  /** Resolved day role */
  readonly dayRole: DayRole;
  /** Short, elderly-friendly cards for UI */
  readonly advisoryCards: readonly AdvisoryCard[];
  /** Structured recommended actions */
  readonly recommendedActions: readonly RecommendedAction[];
  /** Optional warning profile */
  readonly warningProfile: readonly WarningProfile[];
  /** Links to source-backed content */
  readonly sourceRefs: readonly AdvisorySourceRef[];
  /** Where to surface this advisory */
  readonly surfacePlan: SurfacePlan;
  /** Pre-notification intent */
  readonly notificationPlan: NotificationPlan;
  /** ISO timestamp when this advisory was generated */
  readonly generatedAt: string;
}

// ── Input validation for compose endpoint ─────────────────────────────

export const composeAdvisoryQuerySchema = z.object({
  date: z
    .string()
    .date()
    .optional()
    .default(() => new Date().toISOString().slice(0, 10)),
  tz: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .default("Asia/Ho_Chi_Minh"),
});

export type ComposeAdvisoryQuery = z.infer<typeof composeAdvisoryQuerySchema>;

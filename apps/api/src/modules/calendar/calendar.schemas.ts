import { z } from "zod";

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

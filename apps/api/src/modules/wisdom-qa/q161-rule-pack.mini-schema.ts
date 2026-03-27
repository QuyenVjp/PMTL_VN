import * as z from "zod/mini";
import type { Q161RulePackResponse } from "./wisdom-qa.schemas.js";

const q161RulePackMiniSchema = z.object({
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

export function parseQ161RulePackWithMini(input: unknown): Q161RulePackResponse {
  return q161RulePackMiniSchema.parse(input) as Q161RulePackResponse;
}

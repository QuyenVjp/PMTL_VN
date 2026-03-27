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

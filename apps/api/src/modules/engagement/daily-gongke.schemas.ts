import { z } from "zod";

// Mỗi trụ cột daily gongke: key -> số lần
// Ví dụ: { "niem_phat": 108, "niem_chu": 21, "tung_kinh": 1 }
export const coreCountsSchema = z.record(z.string().min(1), z.number().int().min(0).max(10000));

export const upsertDailyGongkeSchema = z.object({
  date: z.string().date(), // "YYYY-MM-DD"
  coreCounts: coreCountsSchema,
  busyMode: z.boolean().default(false),
  heartIncense: z.boolean().default(false),
  note: z.string().max(500).optional(),
});
export type UpsertDailyGongkeInput = z.infer<typeof upsertDailyGongkeSchema>;

export const dailyGongkeQuerySchema = z.object({
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  limit: z.coerce.number().int().min(1).max(90).default(30),
  offset: z.coerce.number().int().min(0).default(0),
});
export type DailyGongkeQuery = z.infer<typeof dailyGongkeQuerySchema>;

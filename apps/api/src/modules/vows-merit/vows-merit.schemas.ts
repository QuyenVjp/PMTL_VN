import { z } from "zod";

export const createVowSchema = z.object({
  type: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type CreateVowInput = z.infer<typeof createVowSchema>;

export const logMeritSchema = z.object({
  vowId: z.string().min(1),
  note: z.string().max(1000).optional(),
  completedAt: z.string().datetime().optional(),
});

export type LogMeritInput = z.infer<typeof logMeritSchema>;

export const vowQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  status: z.enum(["active", "completed", "paused"]).optional(),
});

export type VowQuery = z.infer<typeof vowQuerySchema>;

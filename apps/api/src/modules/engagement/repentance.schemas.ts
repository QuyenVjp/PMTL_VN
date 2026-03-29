import { z } from "zod";

export const upsertRepentanceSchema = z.object({
  date: z.string().date(), // "YYYY-MM-DD"
  count: z.number().int().min(0).max(100000),
  privateNote: z.string().max(2000).optional(),
});
export type UpsertRepentanceInput = z.infer<typeof upsertRepentanceSchema>;

export const repentanceQuerySchema = z.object({
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  limit: z.coerce.number().int().min(1).max(90).default(30),
  offset: z.coerce.number().int().min(0).default(0),
});
export type RepentanceQuery = z.infer<typeof repentanceQuerySchema>;

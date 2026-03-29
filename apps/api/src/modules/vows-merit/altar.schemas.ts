import { z } from "zod";

export const createAltarLogSchema = z.object({
  date: z.string().date(), // "YYYY-MM-DD"
  actionType: z.enum(["INCENSE", "MAINTENANCE", "MOVE", "HEART_INCENSE"]),
  checklistState: z.record(z.string().min(1), z.boolean()),
  note: z.string().max(1000).optional(),
});
export type CreateAltarLogInput = z.infer<typeof createAltarLogSchema>;

export const altarLogQuerySchema = z.object({
  actionType: z.enum(["INCENSE", "MAINTENANCE", "MOVE", "HEART_INCENSE"]).optional(),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  limit: z.coerce.number().int().min(1).max(90).default(30),
  offset: z.coerce.number().int().min(0).default(0),
});
export type AltarLogQuery = z.infer<typeof altarLogQuerySchema>;

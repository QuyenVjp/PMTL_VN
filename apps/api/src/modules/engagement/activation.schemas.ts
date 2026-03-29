import { z } from "zod";

// Tag gợi ý lane thực hành — advisory only, không chẩn đoán y tế
export const SYMPTOM_SUGGESTIONS: Record<string, string[]> = {
  PAIN: ["altar_maintenance", "repentance", "heart_incense"],
  BAD_DREAM: ["little_house", "repentance", "vow_renewal"],
  FAMILY_CONFLICT: ["little_house", "family_relation_vow", "repentance"],
  OTHER: ["repentance", "heart_incense"],
};

export const createActivationLogSchema = z.object({
  date: z.string().date(),
  symptomTag: z.enum(["PAIN", "BAD_DREAM", "FAMILY_CONFLICT", "OTHER"]),
  privateNote: z.string().max(2000).optional(),
});
export type CreateActivationLogInput = z.infer<typeof createActivationLogSchema>;

export const activationLogQuerySchema = z.object({
  symptomTag: z.enum(["PAIN", "BAD_DREAM", "FAMILY_CONFLICT", "OTHER"]).optional(),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  limit: z.coerce.number().int().min(1).max(90).default(30),
  offset: z.coerce.number().int().min(0).default(0),
});
export type ActivationLogQuery = z.infer<typeof activationLogQuerySchema>;

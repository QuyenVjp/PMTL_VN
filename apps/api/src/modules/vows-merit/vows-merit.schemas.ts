import { z } from "zod";

export const vowQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.string().optional(),
  vowType: z.string().optional(),
  search: z.string().optional(),
});
export type VowQuery = z.infer<typeof vowQuerySchema>;

export const assistedEntrySchema = z.object({
  memberPublicId: z.string().min(1),
  vowType: z.enum(["LIFE_RELEASE", "CHANTING", "SUTRA_READING", "CUSTOM"]),
  description: z.string().min(5).max(2000),
  targetCount: z.number().int().min(1).optional(),
  startDate: z.string().date(),
  assistReason: z.string().min(10).max(500),
});
export type AssistedEntryInput = z.infer<typeof assistedEntrySchema>;

export const assistedProgressEntrySchema = z.object({
  memberPublicId: z.string().min(1),
  vowPublicId: z.string().min(1),
  addCount: z.number().int().min(1).max(100000),
  note: z.string().max(500).optional(),
  assistReason: z.string().min(10).max(500),
});
export type AssistedProgressEntryInput = z.infer<typeof assistedProgressEntrySchema>;

export const lifeReleaseEntrySchema = z.object({
  memberPublicId: z.string().min(1),
  animalType: z.string().min(1).max(100),
  quantity: z.number().int().min(1),
  location: z.string().max(500).optional(),
  note: z.string().max(2000).optional(),
  journalDate: z.string().date(),
  assistReason: z.string().min(10).max(500),
});
export type LifeReleaseEntryInput = z.infer<typeof lifeReleaseEntrySchema>;

export const memberSearchSchema = z.object({
  search: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});
export type MemberSearchQuery = z.infer<typeof memberSearchSchema>;

export const assistedEntryHistorySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type AssistedEntryHistoryQuery = z.infer<typeof assistedEntryHistorySchema>;

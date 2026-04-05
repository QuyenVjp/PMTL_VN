import { z } from "zod";

export const altarItemQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  itemType: z.string().optional(),
  condition: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  userId: z.string().optional(),
});
export type AltarItemQuery = z.infer<typeof altarItemQuerySchema>;

export const createAltarItemSchema = z.object({
  itemType: z.enum([
    "INCENSE_BURNER",
    "CANDLE_HOLDER",
    "FLOWER_VASE",
    "WATER_CUP",
    "FRUIT_PLATE",
    "STATUE",
    "LAMP",
    "BELL",
    "OTHER",
  ]),
  name: z.string().min(2).max(200),
  acquisitionAt: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
});
export type CreateAltarItemInput = z.infer<typeof createAltarItemSchema>;

export const updateAltarItemConditionSchema = z.object({
  condition: z.enum(["GOOD", "NEEDS_ATTENTION", "REQUIRES_REPLACEMENT", "RETIRED"]),
  notes: z.string().max(500).optional(),
});
export type UpdateAltarItemConditionInput = z.infer<typeof updateAltarItemConditionSchema>;

export const validationLogQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  protocolType: z.string().optional(),
  userId: z.string().optional(),
});
export type ValidationLogQuery = z.infer<typeof validationLogQuerySchema>;

export const createValidationLogSchema = z.object({
  altarItemPublicId: z.string().optional(),
  protocolType: z.enum([
    "DAILY_CLEANING",
    "INCENSE_INSERTION",
    "WATER_REFRESH",
    "FLOWER_REPLACEMENT",
    "LAMP_CHECK",
    "MONTHLY_DEEP_CLEAN",
  ]),
  passed: z.boolean(),
  notes: z.string().max(500).optional(),
  performedAt: z.string().datetime(),
});
export type CreateValidationLogInput = z.infer<typeof createValidationLogSchema>;

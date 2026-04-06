/**
 * Altar Validation Schemas — Zod DTOs for AltarValidationService
 *
 * Design: design/03-domains/altar-management/CONTRACTS.md
 * Design: design/03-domains/altar-management/USE_CASES/
 */

import { z } from "zod";

// ─── Pre-ceremony condition check ─────────────────────────────────────────────

export const altarConditionCheckSchema = z.object({
  ceremonyType: z.enum(["BURN_NNN", "DAILY_RECITATION", "LIFE_RELEASE", "GENERAL"]),
  incenseReady: z.boolean(),
  waterTemperatureStatus: z.enum(["COOL", "WARM", "HOT", "BOILING"]),
  containerMaterial: z.enum(["CERAMIC_WHITE", "PORCELAIN", "METAL", "OTHER"]).optional(),
});
export type AltarConditionCheckDto = z.infer<typeof altarConditionCheckSchema>;

// ─── Damage report ────────────────────────────────────────────────────────────

export const altarDamageReportSchema = z.object({
  itemsAffected: z
    .array(z.string().min(1).max(200))
    .min(1, "Phải chỉ định ít nhất một pháp khí bị hư hỏng"),
  itemDescriptions: z.string().max(2000).optional(),
  acknowledgedProtocol: z.literal(true, "Bạn phải xác nhận đã đọc giao thức xử lý pháp khí hư hỏng"),
});
export type AltarDamageReportDto = z.infer<typeof altarDamageReportSchema>;

// ─── Incense validation ───────────────────────────────────────────────────────

export const incenseValidateSchema = z.object({
  stickCount: z
    .number()
    .int()
    .min(1)
    .max(99),
  statueCount: z.number().int().min(1).optional(),
  burnerCount: z.number().int().min(1).optional(),
  offeringHour: z.number().int().min(0).max(23).optional(),
});
export type IncenseValidateDto = z.infer<typeof incenseValidateSchema>;

// ─── Water temperature validation ────────────────────────────────────────────

export const waterValidateSchema = z.object({
  temperatureStatus: z.enum(["COOL", "WARM", "HOT", "BOILING"]),
  note: z.string().max(500).optional(),
});
export type WaterValidateDto = z.infer<typeof waterValidateSchema>;

// ─── Fruit plate atomic replacement ──────────────────────────────────────────

export const fruitPlateReplaceSchema = z.object({
  newFruitComposition: z
    .array(
      z.object({
        fruitType: z.string().min(1).max(100),
        quantity: z.number().int().min(1),
        condition: z.enum(["FRESH", "GOOD"]).default("FRESH"),
      }),
    )
    .min(1, "Đĩa trái cây mới phải có ít nhất một loại trái cây"),
});
export type FruitPlateReplaceDto = z.infer<typeof fruitPlateReplaceSchema>;

// ─── Altar photo submit (auspicious-beast AI filter) ─────────────────────────

export const altarPhotoSubmitSchema = z.object({
  photoUrl: z.string().url("URL ảnh không hợp lệ"),
  itemDescriptions: z
    .array(z.string().min(1).max(500))
    .min(1, "Phải mô tả ít nhất một vật phẩm trong ảnh"),
});
export type AltarPhotoSubmitDto = z.infer<typeof altarPhotoSubmitSchema>;

// ─── Hardware item (phật cụ) assignment ──────────────────────────────────────

export const createHardwareItemSchema = z.object({
  name: z.string().min(2).max(200),
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
  assignedTo: z
    .string()
    .min(2)
    .max(200),
});
export type CreateHardwareItemDto = z.infer<typeof createHardwareItemSchema>;

export const retireHardwareItemSchema = z.object({
  retirementPledge: z.string().max(1000).optional(),
  wrappingCommitted: z.literal(true, "Bạn phải cam kết bọc vải đỏ và cất đi pháp khí cũ"),
  notUsedForPersonalUse: z.literal(true, "Bạn phải cam kết không dùng pháp khí cũ cho sinh hoạt cá nhân"),
});
export type RetireHardwareItemDto = z.infer<typeof retireHardwareItemSchema>;

// ─── Grand incense (Đại Hương) session ───────────────────────────────────────

export const grandIncenseStartSchema = z.object({
  isOilLampLit: z.boolean(),
  isIncenseLit: z.boolean(),
});
export type GrandIncenseStartDto = z.infer<typeof grandIncenseStartSchema>;

export const grandIncenseSessionAdvanceSchema = z.object({
  mouthBlowingDetected: z.boolean().default(false),
});
export type GrandIncenseSessionAdvanceDto = z.infer<typeof grandIncenseSessionAdvanceSchema>;

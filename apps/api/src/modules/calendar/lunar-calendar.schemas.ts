import { z } from "zod";
import type { AuspiciousDayType } from "./lunar-calendar.data.js";

/**
 * Lunar date information with auspicious day detection
 */
export interface AuspiciousDayInfo {
  readonly date: string; // ISO solar date (YYYY-MM-DD)
  readonly lunarMonth: number; // 1-12
  readonly lunarDay: number; // 1-30
  readonly isAuspicious: boolean;
  readonly dayTypes: readonly AuspiciousDayType[];
  readonly labelVi: string; // Vietnamese label (e.g., "Ngày Vía Quán Thế Âm Bồ Tát")
  readonly meritMultiplier: "standard" | "high" | "highest";
}

/**
 * Lunar date range for batch queries
 */
export const lunarDateRangeSchema = z.object({
  fromDate: z.string().date(),
  toDate: z.string().date(),
});

export type LunarDateRange = z.infer<typeof lunarDateRangeSchema>;

/**
 * Query parameters for getting auspicious days in a range
 */
export const getAuspiciousDaysSchema = z.object({
  month: z.coerce
    .number()
    .int()
    .min(1)
    .max(12)
    .optional()
    .describe("Lunar month (1-12)"),
  year: z.coerce
    .number()
    .int()
    .min(1900)
    .max(2100)
    .optional()
    .describe("Lunar year"),
  dayType: z.string().optional().describe("Filter by auspicious day type"),
});

export type GetAuspiciousDaysQuery = z.infer<typeof getAuspiciousDaysSchema>;

/**
 * Response schema for lunar date conversion
 */
export const lunarDateResponseSchema = z.object({
  gregorianDate: z.string().datetime(),
  lunarMonth: z.number().int().min(1).max(12),
  lunarDay: z.number().int().min(1).max(30),
  isLeapMonth: z.boolean(),
  lunarMonthLabel: z.string(),
  lunarDayLabel: z.string(),
  fullLabelVi: z.string(),
  isAuspicious: z.boolean(),
  dayTypes: z.array(z.string()),
});

export type LunarDateResponse = z.infer<typeof lunarDateResponseSchema>;

/**
 * Response schema for auspicious day info
 */
export const auspiciousDayInfoSchema = z.object({
  date: z.string().date(),
  lunarMonth: z.number().int().min(1).max(12),
  lunarDay: z.number().int().min(1).max(30),
  isAuspicious: z.boolean(),
  dayTypes: z.array(z.string()),
  labelVi: z.string(),
  meritMultiplier: z.enum(["standard", "high", "highest"]),
});

export type AuspiciousDayInfoResponse = z.infer<
  typeof auspiciousDayInfoSchema
>;

/**
 * Batch lunar date conversion request
 */
export const batchLunarConversionSchema = z.object({
  dates: z
    .array(z.string().datetime())
    .min(1)
    .max(365)
    .describe("Array of Gregorian dates to convert"),
});

export type BatchLunarConversionRequest = z.infer<
  typeof batchLunarConversionSchema
>;

/**
 * Batch lunar date conversion response
 */
export const batchLunarConversionResponseSchema = z.object({
  results: z.array(lunarDateResponseSchema),
  total: z.number().int().nonnegative(),
});

export type BatchLunarConversionResponse = z.infer<
  typeof batchLunarConversionResponseSchema
>;

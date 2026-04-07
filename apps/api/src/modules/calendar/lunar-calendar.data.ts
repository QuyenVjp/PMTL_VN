/**
 * Static Buddhist festival calendar data
 * All dates are lunar calendar (Âm lịch)
 *
 * These are the base recurring festivals. Admin can override via lunarEventOverrides.
 */

export const AUSPICIOUS_DAY_TYPES = [
  "MONTHLY_FIRST", // Mùng 1 Âm lịch
  "MONTHLY_FIFTEENTH", // Rằm (15) Âm lịch
  "GUANYIN_BIRTHDAY", // 2/19 Âm lịch
  "GUANYIN_ENLIGHTENMENT", // 6/19 Âm lịch
  "GUANYIN_MONASTIC", // 9/19 Âm lịch
  "SHAKYAMUNI_BIRTHDAY", // 4/8 Âm lịch (Phật Đản)
  "SHAKYAMUNI_ENLIGHTENMENT", // 12/8 Âm lịch
  "AMITABHA_BIRTHDAY", // 11/17 Âm lịch
  "KSITIGARBHA_BIRTHDAY", // 7/30 Âm lịch (Địa Tạng)
  "MEDICINE_BUDDHA", // 9/30 Âm lịch
  "VESAK", // Phật Đản (full moon of 4th lunar month)
  "VU_LAN", // 7/15 Âm lịch (Vu Lan Festival)
  "TRUNG_NGUYEN", // 7/15 Âm lịch (Trung Nguyên - same as Vu Lan, different intent)
  "TRUNG_THU", // 8/15 Âm lịch
  "TRUNG_CUU", // 9/9 Âm lịch
  "DOAN_NGO", // 5/5 Âm lịch
  "NGUYEN_TIEU", // 1/15 Âm lịch (Nguyên Tiêu)
  "TET_NGUYEN_DAN", // 1/1 Âm lịch
  "LUC_TRAI_DAY", // 8, 14, 15, 23, 29, 30 Âm lịch
] as const;

export type AuspiciousDayType = (typeof AUSPICIOUS_DAY_TYPES)[number];

/**
 * Buddhist festival dates (lunar calendar)
 * Format: [lunarMonth, lunarDay, dayType, labelVi]
 */
export interface FestivalEntry {
  readonly lunarMonth: number;
  readonly lunarDay: number;
  readonly dayType: AuspiciousDayType;
  readonly labelVi: string;
  readonly meritMultiplier?: "standard" | "high" | "highest";
}

export const BUDDHIST_FESTIVAL_CALENDAR: readonly FestivalEntry[] = [
  // Ngày Vía Quán Thế Âm Bồ Tát (Guanyin)
  {
    lunarMonth: 2,
    lunarDay: 19,
    dayType: "GUANYIN_BIRTHDAY",
    labelVi: "Ngày Vía Quán Thế Âm Bồ Tát — Đản sanh",
    meritMultiplier: "highest",
  },
  {
    lunarMonth: 6,
    lunarDay: 19,
    dayType: "GUANYIN_ENLIGHTENMENT",
    labelVi: "Ngày Vía Quán Thế Âm Bồ Tát — Thành đạo",
    meritMultiplier: "highest",
  },
  {
    lunarMonth: 9,
    lunarDay: 19,
    dayType: "GUANYIN_MONASTIC",
    labelVi: "Ngày Vía Quán Thế Âm Bồ Tát — Xuất gia",
    meritMultiplier: "highest",
  },

  // Ngày Vía Phật Thích Ca Mâu Ni (Shakyamuni)
  {
    lunarMonth: 4,
    lunarDay: 8,
    dayType: "SHAKYAMUNI_BIRTHDAY",
    labelVi: "Lễ Phật Đản — Khánh đản Đức Phật Thích Ca",
    meritMultiplier: "highest",
  },
  {
    lunarMonth: 12,
    lunarDay: 8,
    dayType: "SHAKYAMUNI_ENLIGHTENMENT",
    labelVi: "Ngày Đức Phật Thích Ca Thành Đạo",
    meritMultiplier: "highest",
  },

  // Ngày Vía Phật A Di Đà (Amitabha)
  {
    lunarMonth: 11,
    lunarDay: 17,
    dayType: "AMITABHA_BIRTHDAY",
    labelVi: "Ngày Vía Đức Phật A Di Đà",
    meritMultiplier: "high",
  },

  // Ngày Vía Địa Tạng Vương Bồ Tát (Ksitigarbha)
  {
    lunarMonth: 7,
    lunarDay: 30,
    dayType: "KSITIGARBHA_BIRTHDAY",
    labelVi: "Khánh đản Địa Tạng Vương Bồ Tát",
    meritMultiplier: "high",
  },

  // Ngày Vía Dược Sư Phật (Medicine Buddha)
  {
    lunarMonth: 9,
    lunarDay: 30,
    dayType: "MEDICINE_BUDDHA",
    labelVi: "Ngày Vía Dược Sư Lưu Ly Quang Như Lai",
    meritMultiplier: "high",
  },

  // Ngày Tết (Lunar New Year)
  {
    lunarMonth: 1,
    lunarDay: 1,
    dayType: "TET_NGUYEN_DAN",
    labelVi: "Tết Nguyên Đán — Mùng 1 Tết",
    meritMultiplier: "highest",
  },

  // Ngày Nguyên Tiêu (Lantern Festival)
  {
    lunarMonth: 1,
    lunarDay: 15,
    dayType: "NGUYEN_TIEU",
    labelVi: "Tết Nguyên Tiêu",
    meritMultiplier: "high",
  },

  // Ngày Đoan Ngọ
  {
    lunarMonth: 5,
    lunarDay: 5,
    dayType: "DOAN_NGO",
    labelVi: "Tết Đoan Ngọ",
    meritMultiplier: "high",
  },

  // Ngày Vu Lan / Trung Nguyên
  {
    lunarMonth: 7,
    lunarDay: 15,
    dayType: "VU_LAN",
    labelVi: "Đại lễ Vu Lan — Lễ Trung Nguyên",
    meritMultiplier: "highest",
  },

  // Ngày Trung Thu
  {
    lunarMonth: 8,
    lunarDay: 15,
    dayType: "TRUNG_THU",
    labelVi: "Tết Trung Thu",
    meritMultiplier: "high",
  },

  // Ngày Trùng Cửu
  {
    lunarMonth: 9,
    lunarDay: 9,
    dayType: "TRUNG_CUU",
    labelVi: "Tết Trùng Cửu",
    meritMultiplier: "high",
  },
];

/**
 * Luc Trai lunar days (六齋日) - Buddhist fasting/precept days
 * These occur on the 8th, 14th, 15th, 23rd, 29th, and 30th of each lunar month
 */
export const LUC_TRAI_LUNAR_DAYS = [8, 14, 15, 23, 29, 30] as const;

/**
 * Lookup festival by lunar month and day
 * @param lunarMonth Lunar month (1-12)
 * @param lunarDay Lunar day (1-30)
 * @returns Festival entry if found, undefined otherwise
 */
export function lookupFestival(
  lunarMonth: number,
  lunarDay: number,
): FestivalEntry | undefined {
  return BUDDHIST_FESTIVAL_CALENDAR.find(
    (f) => f.lunarMonth === lunarMonth && f.lunarDay === lunarDay,
  );
}

/**
 * Get all festivals for a given lunar month
 * @param lunarMonth Lunar month (1-12)
 * @returns Array of festival entries for that month
 */
export function getFestivalsForMonth(lunarMonth: number): FestivalEntry[] {
  return BUDDHIST_FESTIVAL_CALENDAR.filter(
    (f) => f.lunarMonth === lunarMonth,
  );
}

/**
 * Map auspicious day type to recitation caps from Q161
 * Returns the recommended recitation count for days with special significance
 */
export function getRecitationCapForDayType(
  dayType: AuspiciousDayType,
): number {
  const capMap: Record<AuspiciousDayType, number> = {
    MONTHLY_FIRST: 49,
    MONTHLY_FIFTEENTH: 49,
    GUANYIN_BIRTHDAY: 108,
    GUANYIN_ENLIGHTENMENT: 108,
    GUANYIN_MONASTIC: 108,
    SHAKYAMUNI_BIRTHDAY: 108,
    SHAKYAMUNI_ENLIGHTENMENT: 108,
    AMITABHA_BIRTHDAY: 88,
    KSITIGARBHA_BIRTHDAY: 79,
    MEDICINE_BUDDHA: 88,
    VESAK: 108,
    VU_LAN: 49,
    TRUNG_NGUYEN: 49,
    TRUNG_THU: 27,
    TRUNG_CUU: 63,
    DOAN_NGO: 49,
    NGUYEN_TIEU: 27,
    TET_NGUYEN_DAN: 108,
    LUC_TRAI_DAY: 8,
  };
  return capMap[dayType] || 21; // Default fallback
}

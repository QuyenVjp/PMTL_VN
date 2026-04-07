import { Lunar } from "lunar-typescript";

/**
 * Vietnamese lunar date representation
 * Based on Chinese lunar calendar (Âm lịch)
 */
export interface LunarDate {
  readonly lunarYear: number;
  readonly lunarMonth: number;
  readonly lunarDay: number;
  readonly isLeapMonth: boolean;
  readonly lunarMonthLabel: string; // "Giêng", "Hai", "Ba", ..., "Chạp"
  readonly lunarDayLabel: string; // "Mùng 1", "Mùng 2", ..., "30"
  readonly fullLabelVi: string; // "Mùng 1 tháng Giêng năm Bính Ngọ"
}

// Vietnamese lunar month names
const LUNAR_MONTH_NAMES_VI = [
  "Giêng",
  "Hai",
  "Ba",
  "Tư",
  "Năm",
  "Sáu",
  "Bảy",
  "Tám",
  "Chín",
  "Mười",
  "Mười Một",
  "Chạp",
] as const;

// Vietnamese lunar day names
const LUNAR_DAY_NAMES_VI = Array.from({ length: 30 }, (_, i) => {
  if (i === 0) return "Mùng 1";
  if (i < 9) return `Mùng ${i + 1}`;
  if (i === 9) return "Mười";
  if (i < 19) return `Mười ${i - 9}`;
  if (i === 19) return "Hai Mươi";
  return `Hai Mươi ${i - 19}`;
});

// Heavenly Stems (Thiên Can)
const HEAVENLY_STEMS = [
  "Giáp",
  "Ất",
  "Bính",
  "Đinh",
  "Mậu",
  "Kỷ",
  "Canh",
  "Tân",
  "Nhâm",
  "Quý",
] as const;

// Earthly Branches (Địa Chi)
const EARTHLY_BRANCHES = [
  "Tý",
  "Sửu",
  "Dần",
  "Mão",
  "Thìn",
  "Tỵ",
  "Ngọ",
  "Mùi",
  "Thân",
  "Dậu",
  "Tuất",
  "Hợi",
] as const;

/**
 * Convert a Gregorian date to Vietnamese lunar date
 * @param date Gregorian date
 * @returns LunarDate with Vietnamese labels
 */
export function gregorianToLunar(date: Date): LunarDate {
  const lunar = Lunar.fromDate(date);

  const lunarYear = lunar.getYear();
  const rawMonth = lunar.getMonth(); // negative for leap months in lunar-typescript
  const isLeapMonth = rawMonth < 0;
  const lunarMonth = Math.abs(rawMonth);
  const lunarDay = lunar.getDay();

  const monthLabel = LUNAR_MONTH_NAMES_VI[lunarMonth - 1];
  const dayLabel = LUNAR_DAY_NAMES_VI[lunarDay - 1];

  // Format Sexagenary year (Thiên Can - Địa Chi)
  const heavenlyIndex = (lunarYear - 1) % 10;
  const earthlyIndex = (lunarYear - 1) % 12;
  const yearLabel = `${HEAVENLY_STEMS[heavenlyIndex]} ${EARTHLY_BRANCHES[earthlyIndex]}`;

  return {
    lunarYear,
    lunarMonth,
    lunarDay,
    isLeapMonth,
    lunarMonthLabel: monthLabel,
    lunarDayLabel: dayLabel,
    fullLabelVi: `${dayLabel} tháng ${monthLabel} năm ${yearLabel}`,
  };
}

/**
 * Convert lunar date to Gregorian date
 * @param lunarYear Lunar year
 * @param lunarMonth Lunar month (1-12)
 * @param lunarDay Lunar day (1-29/30)
 * @param isLeapMonth Whether this is a leap month
 * @returns Gregorian Date
 */
export function lunarToGregorian(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  isLeapMonth: boolean = false,
): Date {
  // lunar-typescript encodes leap months as negative month numbers
  const encodedMonth = isLeapMonth ? -lunarMonth : lunarMonth;
  const lunar = Lunar.fromYmd(lunarYear, encodedMonth, lunarDay);
  const solar = lunar.getSolar();
  return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
}

/**
 * Check if a Gregorian date is lunar 1st or 15th (auspicious days)
 * @param date Gregorian date
 * @returns true if lunar 1st or 15th
 */
export function isLunarFirstOrFifteenth(date: Date): boolean {
  const lunar = gregorianToLunar(date);
  return lunar.lunarDay === 1 || lunar.lunarDay === 15;
}

/**
 * Check if a lunar day is a Luc Trai day (fasting precept days: 8, 14, 15, 23, 29, 30)
 * @param lunarDay Lunar day of month (1-30)
 * @returns true if Luc Trai day
 */
export function isLucTraiDay(lunarDay: number): boolean {
  const LUC_TRAI_DAYS = [8, 14, 15, 23, 29, 30];
  return LUC_TRAI_DAYS.includes(lunarDay);
}

/**
 * Format a lunar date as Vietnamese text
 * @param lunar LunarDate object
 * @returns Formatted text (e.g., "Mùng 1 tháng Giêng")
 */
export function formatLunarDateVi(lunar: LunarDate): string {
  return `${lunar.lunarDayLabel} tháng ${lunar.lunarMonthLabel}`;
}

/**
 * Format a lunar date with year as Vietnamese text
 * @param lunar LunarDate object
 * @returns Formatted text with year
 */
export function formatLunarDateViWithYear(lunar: LunarDate): string {
  return lunar.fullLabelVi;
}

/**
 * Get lunar date for a specific lunar month/day
 * (tries current year first, then next year if the date has passed)
 * @param lunarMonth Lunar month (1-12)
 * @param lunarDay Lunar day (1-29/30)
 * @returns Date of that lunar date in current or next year
 */
export function getLunarDayDate(
  lunarMonth: number,
  lunarDay: number,
): { gregorianDate: Date; lunar: LunarDate; isPassed: boolean } {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Try current year
  try {
    const gregorianDate = lunarToGregorian(
      currentYear,
      lunarMonth,
      lunarDay,
      false,
    );
    const lunar = gregorianToLunar(gregorianDate);
    const isPassed = gregorianDate < now;

    // If passed, try next year
    if (isPassed) {
      const nextYearDate = lunarToGregorian(
        currentYear + 1,
        lunarMonth,
        lunarDay,
        false,
      );
      const nextYearLunar = gregorianToLunar(nextYearDate);
      return {
        gregorianDate: nextYearDate,
        lunar: nextYearLunar,
        isPassed: false,
      };
    }

    return { gregorianDate, lunar, isPassed: false };
  } catch {
    // Some lunar dates don't exist (e.g., 30th in a 29-day month)
    // Try previous day
    return getLunarDayDate(lunarMonth, Math.max(1, lunarDay - 1));
  }
}

/**
 * Get all lunar dates in a Gregorian date range
 * @param fromDate Start date (inclusive)
 * @param toDate End date (inclusive)
 * @returns Array of LunarDate for each day in range
 */
export function getLunarDatesInRange(
  fromDate: Date,
  toDate: Date,
): Array<{ gregorianDate: Date; lunar: LunarDate }> {
  const result: Array<{ gregorianDate: Date; lunar: LunarDate }> = [];
  const current = new Date(fromDate);

  while (current <= toDate) {
    const lunar = gregorianToLunar(current);
    result.push({
      gregorianDate: new Date(current),
      lunar,
    });
    current.setDate(current.getDate() + 1);
  }

  return result;
}

import { Injectable } from "@nestjs/common";
import {
  gregorianToLunar,
  isLunarFirstOrFifteenth,
  isLucTraiDay,
  formatLunarDateVi,
  getLunarDayDate,
  getLunarDatesInRange,
} from "./lunar-calendar.utils.js";
import {
  BUDDHIST_FESTIVAL_CALENDAR,
  getRecitationCapForDayType,
  lookupFestival,
  type AuspiciousDayType,
} from "./lunar-calendar.data.js";
import type { AuspiciousDayInfo } from "./lunar-calendar.schemas.js";

@Injectable()
export class LunarCalendarService {
  /**
   * Get lunar date info for a specific Gregorian date
   */
  getLunarDate(date: Date) {
    return gregorianToLunar(date);
  }

  /**
   * Check if a date is lunar 1st or 15th
   * These are the monthly auspicious days (mùng 1 or rằm)
   */
  isLunarFirstOrFifteenth(date: Date): boolean {
    return isLunarFirstOrFifteenth(date);
  }

  /**
   * Check if a lunar day is a Luc Trai day (fasting precept day)
   * @param lunarDay Lunar day (1-30)
   */
  isLucTraiDay(lunarDay: number): boolean {
    return isLucTraiDay(lunarDay);
  }

  /**
   * Get all auspicious day types for a given date
   */
  detectDayTypes(date: Date): AuspiciousDayType[] {
    const lunar = gregorianToLunar(date);
    const dayTypes: AuspiciousDayType[] = [];

    // Check monthly 1st/15th
    if (lunar.lunarDay === 1) {
      dayTypes.push("MONTHLY_FIRST");
    } else if (lunar.lunarDay === 15) {
      dayTypes.push("MONTHLY_FIFTEENTH");
    }

    // Check Buddhist festivals
    const festival = lookupFestival(lunar.lunarMonth, lunar.lunarDay);
    if (festival) {
      dayTypes.push(festival.dayType);
    }

    // Check Luc Trai days
    if (this.isLucTraiDay(lunar.lunarDay)) {
      dayTypes.push("LUC_TRAI_DAY");
    }

    return dayTypes;
  }

  /**
   * Check if a date is auspicious
   * Auspicious if it's lunar 1st/15th, a Buddhist festival, or a Luc Trai day
   */
  isAuspiciousDay(date: Date): boolean {
    const lunar = gregorianToLunar(date);

    // Monthly 1st or 15th
    if (lunar.lunarDay === 1 || lunar.lunarDay === 15) {
      return true;
    }

    // Buddhist festival
    const festival = lookupFestival(lunar.lunarMonth, lunar.lunarDay);
    if (festival) {
      return true;
    }

    // Luc Trai day
    if (this.isLucTraiDay(lunar.lunarDay)) {
      return true;
    }

    return false;
  }

  /**
   * Get full auspicious day information for a given Gregorian date
   */
  getAuspiciousDayInfo(date: Date): AuspiciousDayInfo {
    const lunar = gregorianToLunar(date);
    const dayTypes = this.detectDayTypes(date);
    const isAuspicious = dayTypes.length > 0;

    // Generate Vietnamese label
    let labelVi = formatLunarDateVi(lunar);
    const festival = lookupFestival(lunar.lunarMonth, lunar.lunarDay);
    if (festival) {
      labelVi = festival.labelVi;
    }

    // Determine merit multiplier
    let meritMultiplier: "standard" | "high" | "highest" = "standard";
    if (festival?.meritMultiplier) {
      meritMultiplier = festival.meritMultiplier;
    } else if (isAuspicious) {
      // Monthly 1st/15th and Luc Trai days are "high"
      meritMultiplier = dayTypes.includes("MONTHLY_FIRST") ||
        dayTypes.includes("MONTHLY_FIFTEENTH") ||
        dayTypes.includes("LUC_TRAI_DAY")
        ? "high"
        : "standard";
    }

    return {
      date: date.toISOString().split("T")[0],
      lunarMonth: lunar.lunarMonth,
      lunarDay: lunar.lunarDay,
      isAuspicious,
      dayTypes,
      labelVi,
      meritMultiplier,
    };
  }

  /**
   * Get auspicious days within a date range
   */
  getAuspiciousDaysInRange(
    fromDate: Date,
    toDate: Date,
  ): AuspiciousDayInfo[] {
    const lunarDates = getLunarDatesInRange(fromDate, toDate);
    return lunarDates
      .map(({ gregorianDate }) => this.getAuspiciousDayInfo(gregorianDate))
      .filter((info) => info.isAuspicious);
  }

  /**
   * Get all auspicious days in a lunar month (across all years in a range)
   * Useful for showing "all Guanyin birthday dates in 2026"
   */
  getAuspiciousDaysInMonth(lunarMonth: number): AuspiciousDayInfo[] {
    const currentYear = new Date().getFullYear();
    const result: AuspiciousDayInfo[] = [];

    // Check current year and next year
    for (let yearOffset = 0; yearOffset < 2; yearOffset++) {
      const year = currentYear + yearOffset;

      // Get festival for this month
      const festivals = BUDDHIST_FESTIVAL_CALENDAR.filter(
        (f) => f.lunarMonth === lunarMonth,
      );

      for (const festival of festivals) {
        try {
          const { gregorianDate } = getLunarDayDate(
            festival.lunarMonth,
            festival.lunarDay,
          );

          // Only include if it's for the target year
          if (gregorianDate.getFullYear() === year) {
            result.push(this.getAuspiciousDayInfo(gregorianDate));
          }
        } catch {
          // Skip if date is invalid (e.g., leap month not in this year)
        }
      }

      // Also include monthly 1st and 15th
      try {
        const { gregorianDate: firstDay } = getLunarDayDate(
          lunarMonth,
          1,
        );
        if (firstDay.getFullYear() === year) {
          result.push(this.getAuspiciousDayInfo(firstDay));
        }
      } catch {
        // Skip
      }

      try {
        const { gregorianDate: fifteenthDay } = getLunarDayDate(
          lunarMonth,
          15,
        );
        if (fifteenthDay.getFullYear() === year) {
          result.push(this.getAuspiciousDayInfo(fifteenthDay));
        }
      } catch {
        // Skip
      }
    }

    // Remove duplicates (by gregorianDate) and sort
    const unique = Array.from(
      new Map(result.map((info) => [info.date, info])).values(),
    ).sort((a, b) => a.date.localeCompare(b.date));

    return unique;
  }

  /**
   * Get recitation cap for a specific auspicious day type
   * Used by advisory compose service to set recitation count recommendations
   */
  getRecitationCap(dayType: AuspiciousDayType): number {
    return getRecitationCapForDayType(dayType);
  }

  /**
   * Get the highest recitation cap for a date (if multiple day types exist)
   */
  getHighestRecitationCap(date: Date): number {
    const dayTypes = this.detectDayTypes(date);
    if (dayTypes.length === 0) {
      return 21; // Default for regular days
    }

    const caps = dayTypes.map((type) => this.getRecitationCap(type));
    return Math.max(...caps);
  }

  /**
   * Check if today is lunar 1st or 15th
   * Convenience method for UI prompts
   */
  isTodayLunarFirstOrFifteenth(): boolean {
    return this.isLunarFirstOrFifteenth(new Date());
  }

  /**
   * Get Vietnamese text for a lunar date
   */
  formatLunarDateVi(date: Date): string {
    const lunar = gregorianToLunar(date);
    return formatLunarDateVi(lunar);
  }

  /**
   * Get Vietnamese text with year for a lunar date
   */
  formatLunarDateViWithYear(date: Date): string {
    const lunar = gregorianToLunar(date);
    return lunar.fullLabelVi;
  }
}

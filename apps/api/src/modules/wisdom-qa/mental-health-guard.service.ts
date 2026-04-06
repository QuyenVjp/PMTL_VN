/**
 * Phase 12 Logic 4: Mental Health Da Bei Zhou Daily Limit Guard
 * 
 * Enforces strict 21 Da Bei Zhou daily limit for mental health patients
 * to prevent energy overload and psychotic episodes.
 */

import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";

const MENTAL_ILLNESS_DBZ_MAX = 21;

export interface DaBeiZhouValidationResult {
  allowed: boolean;
  currentLimit: number;
  requestedCount: number;
  reason?: string;
  warning?: string;
}

@Injectable()
export class MentalHealthGuardService {
  private readonly logger = new Logger(MentalHealthGuardService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validate Da Bei Zhou count for a user based on their mental health profile
   */
  async validateDaBeiZhouCount(userId: string, requestedCount: number): Promise<DaBeiZhouValidationResult> {
    // Get user's practice profile
    const profile = await this.prisma.practiceProfile.findUnique({
      where: { userId },
      select: {
        mentalHealthCondition: true,
        daBeiZhouDailyLimit: true,
      },
    });

    // If no profile or no mental health condition, allow
    if (
      !profile ||
      !profile.mentalHealthCondition ||
      profile.mentalHealthCondition === "NONE"
    ) {
      return {
        allowed: true,
        currentLimit: -1, // No limit
        requestedCount,
      };
    }

    // Check if user has mental illness condition
    const hasMentalIllness = [
      "DEPRESSION",
      "SCHIZOPHRENIA",
      "BIPOLAR",
      "OTHER_MENTAL_ILLNESS",
    ].includes(profile.mentalHealthCondition);

    if (!hasMentalIllness) {
      return {
        allowed: true,
        currentLimit: -1,
        requestedCount,
      };
    }

    // Apply strict limit
    const effectiveLimit = profile.daBeiZhouDailyLimit || MENTAL_ILLNESS_DBZ_MAX;

    if (requestedCount > effectiveLimit) {
      return {
        allowed: false,
        currentLimit: effectiveLimit,
        requestedCount,
        reason: `CẢNH BÁO AN TOÀN TÂM LINH: Bệnh lý tâm thần không được phép niệm Chú Đại Bi quá ${effectiveLimit} lần/ngày.`,
        warning: "Hãy giảm Chú Đại Bi và tăng Tâm Kinh lên để cân bằng năng lượng.",
      };
    }

    // Allowed but with warning
    return {
      allowed: true,
      currentLimit: effectiveLimit,
      requestedCount,
      warning:
        requestedCount > 14
          ? `Lưu ý: Bạn đang niệm ${requestedCount} biến Đại Bi, gần giới hạn ${effectiveLimit}. Hãy cân nhắc tăng Tâm Kinh.`
          : undefined,
    };
  }

  /**
   * Update user's mental health profile and auto-set DBZ limit
   */
  async updateMentalHealthProfile(userId: string, condition: string) {
    const hasMentalIllness = [
      "DEPRESSION",
      "SCHIZOPHRENIA",
      "BIPOLAR",
      "OTHER_MENTAL_ILLNESS",
    ].includes(condition);

    const daBeiZhouDailyLimit = hasMentalIllness ? MENTAL_ILLNESS_DBZ_MAX : null;

    await this.prisma.practiceProfile.upsert({
      where: { userId },
      create: {
        userId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        mentalHealthCondition: condition as any,
        daBeiZhouDailyLimit,
      },
      update: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        mentalHealthCondition: condition as any,
        daBeiZhouDailyLimit,
      },
    });

    this.logger.log({
      msg: "mental_health_profile_updated",
      userId,
      condition,
      daBeiZhouDailyLimit,
    });

    return { condition, daBeiZhouDailyLimit };
  }

  /**
   * Middleware-style validator that throws on violation
   */
  async enforceDaBeiZhouLimit(userId: string, count: number): Promise<void> {
    const result = await this.validateDaBeiZhouCount(userId, count);

    if (!result.allowed) {
      throw new BadRequestException({
        message: result.reason,
        warning: result.warning,
        currentLimit: result.currentLimit,
        requestedCount: result.requestedCount,
      });
    }

    // Log warning if present
    if (result.warning) {
      this.logger.warn({
        msg: "da_bei_zhou_warning",
        userId,
        requestedCount: count,
        currentLimit: result.currentLimit,
        warning: result.warning,
      });
    }
  }
}

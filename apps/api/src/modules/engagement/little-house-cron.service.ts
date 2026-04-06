/**
 * Phase 12 Logic 1: Little House 7-Day Stale Warning Cron Job
 *
 * Scans all in-progress Little Houses (DRAFT / SIGNED) and creates a
 * LittleHouseWarning record if the record has been open for > 7 days
 * without progressing to CHANTED or BURNED.
 *
 * Design: design/03-domains/engagement/USE_CASES/
 *   (7-day energy dissipation rule is referenced across multiple specs)
 */

import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";

@Injectable()
export class LittleHouseCronService {
  private readonly logger = new Logger(LittleHouseCronService.name);
  private readonly STALE_THRESHOLD_DAYS = 7;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Runs daily at 9 AM to check for stale Little Houses.
   * Uses Prisma ORM throughout — no raw SQL.
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkStaleLittleHouses(): Promise<void> {
    this.logger.log("Starting 7-day stale Little House check...");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - this.STALE_THRESHOLD_DAYS);

    // Find all in-progress Little Houses older than 7 days
    const staleLittleHouses = await this.prisma.littleHouse.findMany({
      where: {
        status: { in: ["DRAFT", "SIGNED"] },
        startedAt: { lte: sevenDaysAgo },
      },
      select: {
        id: true,
        publicId: true,
        userId: true,
        startedAt: true,
      },
    });

    this.logger.log(`Found ${staleLittleHouses.length} stale Little Houses`);

    const warningCutoff = new Date();
    warningCutoff.setDate(warningCutoff.getDate() - this.STALE_THRESHOLD_DAYS);

    for (const lh of staleLittleHouses) {
      const daysElapsed = lh.startedAt
        ? Math.floor((Date.now() - lh.startedAt.getTime()) / (1000 * 60 * 60 * 24))
        : this.STALE_THRESHOLD_DAYS;

      // Check if a warning was already sent for this LH in the last 7 days
      const existingWarning = await this.prisma.littleHouseWarning.findFirst({
        where: {
          littleHouseId: lh.id,
          warningType: "SEVEN_DAY_STALE",
          sentAt: { gte: warningCutoff },
        },
        select: { id: true },
      });

      if (existingWarning) {
        this.logger.debug(`Warning already sent for LH ${lh.publicId}, skipping`);
        continue;
      }

      // Create warning record via Prisma ORM
      await this.prisma.littleHouseWarning.create({
        data: {
          publicId: nanoid(21),
          littleHouseId: lh.id,
          userId: lh.userId,
          warningType: "SEVEN_DAY_STALE",
          daysElapsed,
          acknowledged: false,
        },
      });

      // TODO: Send push notification via notification module
      this.logger.warn({
        msg: "little_house.stale_warning_triggered",
        userId: lh.userId,
        publicId: lh.publicId,
        daysElapsed,
        message: `CẢNH BÁO: Tấm Ngôi Nhà Nhỏ của bạn đã kéo dài quá ${daysElapsed} ngày. Năng lượng đang bị thất thoát, hãy nhanh chóng hoàn thành ngay!`,
      });
    }

    this.logger.log("7-day stale check completed");
  }
}

/**
 * Phase 12 Logic 1: Little House 7-Day Stale Warning Cron Job
 * 
 * Scans all IN_PROGRESS Little Houses and warns users if they exceed 7 days
 * to prevent energy dissipation.
 */

import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { nanoid } from "nanoid";

@Injectable()
export class LittleHouseCronService {
  private readonly logger = new Logger(LittleHouseCronService.name);
  private readonly STALE_THRESHOLD_DAYS = 7;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Runs daily at 9 AM to check for stale Little Houses
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkStaleLittleHouses() {
    this.logger.log("Starting 7-day stale Little House check...");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - this.STALE_THRESHOLD_DAYS);

    // Find all IN_PROGRESS Little Houses older than 7 days
    const staleLittleHouses = await this.prisma.littleHouse.findMany({
      where: {
        status: { in: ["DRAFT", "SIGNED"] }, // Not yet CHANTED or BURNED
        startedAt: {
          lte: sevenDaysAgo,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            publicId: true,
            displayName: true,
            email: true,
          },
        },
      },
    });

    this.logger.log(`Found ${staleLittleHouses.length} stale Little Houses`);

    for (const lh of staleLittleHouses) {
      const daysElapsed = Math.floor(
        (Date.now() - (lh.startedAt?.getTime() || Date.now())) / (1000 * 60 * 60 * 24),
      );

      // Check if warning already sent for this LH
      const existingWarning = await this.prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM little_house_warnings
        WHERE little_house_id = ${lh.id}
        AND warning_type = 'SEVEN_DAY_STALE'
        AND sent_at > NOW() - INTERVAL '7 days'
        LIMIT 1
      `;

      if (existingWarning.length > 0) {
        this.logger.debug(`Warning already sent for LH ${lh.publicId}, skipping`);
        continue;
      }

      // Create warning record
      await this.prisma.$executeRaw`
        INSERT INTO little_house_warnings (
          id, public_id, little_house_id, user_id, warning_type, 
          days_elapsed, sent_at, acknowledged, created_at
        ) VALUES (
          ${nanoid()}, ${nanoid(21)}, ${lh.id}, ${lh.userId}, 'SEVEN_DAY_STALE',
          ${daysElapsed}, NOW(), false, NOW()
        )
      `;

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

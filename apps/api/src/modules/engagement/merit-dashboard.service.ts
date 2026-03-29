import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";

// Module 8 — PersonalMeritDashboard
// Computed read model tổng hợp private từ 5 pháp bảo lanes.
// Không phải materialized table — recompute mỗi request (Phase 1).
// Không có leaderboard, không so sánh với người khác.

@Injectable()
export class MeritDashboardService {
  private readonly logger = new Logger(MeritDashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Chạy song song tất cả 5 lanes
    const [
      gongkeSummary,
      repentanceSummary,
      vowsSummary,
      littleHouseSummary,
      altarSummary,
    ] = await Promise.all([
      // Lane 1: Công khóa (30 ngày gần nhất)
      this.prisma.dailyGongkeLog.aggregate({
        where: { userId, date: { gte: thirtyDaysAgo } },
        _count: { id: true },
      }),

      // Lane 2: Sám hối (30 ngày gần nhất)
      this.prisma.repentanceLog.aggregate({
        where: { userId, date: { gte: thirtyDaysAgo } },
        _count: { id: true },
        _sum: { count: true },
      }),

      // Lane 3: Nguyện lực
      this.prisma.vow.groupBy({
        by: ["status"],
        where: { userId },
        _count: { id: true },
      }),

      // Lane 4: Ngôi nhà nhỏ (tất cả trạng thái)
      this.prisma.littleHouse.groupBy({
        by: ["status"],
        where: { userId },
        _count: { id: true },
      }),

      // Lane 5: Bảo dưỡng bàn thờ (30 ngày)
      this.prisma.altarLog.aggregate({
        where: { userId, date: { gte: thirtyDaysAgo } },
        _count: { id: true },
      }),
    ]);

    // Normalize vow counts
    const vowCounts = Object.fromEntries(vowsSummary.map((g) => [g.status, g._count.id]));
    const littleHouseCounts = Object.fromEntries(littleHouseSummary.map((g) => [g.status, g._count.id]));

    const summary = {
      generatedAt: now.toISOString(),
      windowDays: 30,
      lanes: {
        congKhoa: {
          label: "Công khóa",
          daysLoggedLast30: gongkeSummary._count.id,
        },
        samHoi: {
          label: "Sám hối",
          daysLoggedLast30: repentanceSummary._count.id,
          totalCountLast30: repentanceSummary._sum.count ?? 0,
        },
        nguyen: {
          label: "Nguyện lực",
          active: vowCounts["ACTIVE"] ?? 0,
          completed: vowCounts["COMPLETED"] ?? 0,
          voided: vowCounts["VOIDED"] ?? 0,
        },
        nhacho: {
          label: "Ngôi nhà nhỏ",
          draft: littleHouseCounts["DRAFT"] ?? 0,
          signed: littleHouseCounts["SIGNED"] ?? 0,
          chanted: littleHouseCounts["CHANTED"] ?? 0,
          burned: littleHouseCounts["BURNED"] ?? 0,
        },
        altar: {
          label: "Bảo dưỡng bàn thờ",
          actionsLast30: altarSummary._count.id,
        },
      },
    };

    this.logger.log({ msg: "merit_dashboard.fetched", userId });
    return summary;
  }
}

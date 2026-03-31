import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { ReportStatus } from "../../generated/prisma/client.js";
import type { ModerationReportListQuery } from "./moderation.schemas.js";

@Injectable()
export class ModerationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: ModerationReportListQuery) {
    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.targetType) {
      where.targetType = query.targetType;
    }

    const [reports, total] = await Promise.all([
      this.prisma.moderationReport.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.moderationReport.count({ where }),
    ]);

    return { reports, total };
  }

  async findByPublicId(publicId: string) {
    return this.prisma.moderationReport.findUnique({
      where: { publicId },
    });
  }

  async updateDecision(
    publicId: string,
    status: ReportStatus,
    decisionBy: string,
    decisionNote?: string,
  ) {
    return this.prisma.moderationReport.update({
      where: { publicId },
      data: {
        status,
        decisionBy,
        decisionAt: new Date(),
        decisionNote: decisionNote ?? null,
      },
    });
  }

  async createReport(data: {
    publicId: string;
    reporterUserId: string;
    targetType: string;
    targetId: string;
    reasonCode: string;
    description?: string;
  }) {
    return this.prisma.moderationReport.create({ data });
  }

  async findDuplicatePendingReport(reporterUserId: string, targetType: string, targetId: string) {
    return this.prisma.moderationReport.findFirst({
      where: {
        reporterUserId,
        targetType,
        targetId,
        status: "PENDING",
      },
    });
  }

}

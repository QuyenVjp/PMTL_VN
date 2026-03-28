import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { AdminPushJobQuery } from "./notification.schemas.js";

const CREATOR_SELECT = {
  select: { publicId: true, displayName: true, email: true },
} as const;

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyPushJobs(query: AdminPushJobQuery) {
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.pushJob.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: query.offset,
        take: query.limit,
        include: { createdBy: CREATOR_SELECT },
      }),
      this.prisma.pushJob.count({ where }),
    ]);

    return { data, total };
  }

  async findPushJobByPublicId(publicId: string) {
    return this.prisma.pushJob.findUnique({
      where: { publicId },
      include: { createdBy: CREATOR_SELECT },
    });
  }

  async createPushJob(input: {
    publicId: string;
    title: string;
    body: string;
    targetAudience?: string;
    createdById: string;
  }) {
    return this.prisma.pushJob.create({
      data: {
        publicId: input.publicId,
        title: input.title,
        body: input.body,
        targetAudience: input.targetAudience,
        status: "PENDING",
        createdById: input.createdById,
      },
      include: { createdBy: CREATOR_SELECT },
    });
  }

  async redriveJob(publicId: string) {
    return this.prisma.pushJob.update({
      where: { publicId },
      data: { status: "PENDING", processedAt: null, completedAt: null, failedCount: 0 },
      include: { createdBy: CREATOR_SELECT },
    });
  }

  async countJobsByStatus() {
    const [total, pending, completed, failed] = await Promise.all([
      this.prisma.pushJob.count(),
      this.prisma.pushJob.count({ where: { status: "PENDING" } }),
      this.prisma.pushJob.count({ where: { status: "COMPLETED" } }),
      this.prisma.pushJob.count({ where: { status: "FAILED" } }),
    ]);
    return { total, pending, completed, failed };
  }

  async countSubscriptions() {
    const [active, inactive] = await Promise.all([
      this.prisma.pushSubscription.count({ where: { isActive: true } }),
      this.prisma.pushSubscription.count({ where: { isActive: false } }),
    ]);
    return { active, inactive, total: active + inactive };
  }
}

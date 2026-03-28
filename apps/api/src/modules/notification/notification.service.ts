import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import type { AdminPushJobQuery, AdminCreatePushJobInput } from "./notification.schemas.js";

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async adminListPushJobs(query: AdminPushJobQuery) {
    const where: Record<string, unknown> = {};
    if (query.status) {
      where.status = query.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.pushJob.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: query.offset,
        take: query.limit,
        include: {
          createdBy: {
            select: { publicId: true, displayName: true, email: true },
          },
        },
      }),
      this.prisma.pushJob.count({ where }),
    ]);

    return {
      data,
      meta: {
        pagination: {
          total,
          limit: query.limit,
          offset: query.offset,
          hasMore: query.offset + query.limit < total,
        },
      },
    };
  }

  async adminGetPushJob(publicId: string) {
    const job = await this.prisma.pushJob.findUnique({
      where: { publicId },
      include: {
        createdBy: {
          select: { publicId: true, displayName: true, email: true },
        },
      },
    });
    if (!job) {
      throw new NotFoundException("Push job không tồn tại");
    }
    return job;
  }

  async adminCreatePushJob(input: AdminCreatePushJobInput, userId: string, auditCtx: AuditContext) {
    const job = await this.prisma.pushJob.create({
      data: {
        publicId: nanoid(),
        title: input.title,
        body: input.body,
        targetAudience: input.targetAudience,
        status: "PENDING",
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { publicId: true, displayName: true, email: true },
        },
      },
    });

    await this.audit.append(auditCtx, "admin.push_job.create", "push_job", job.publicId, {
      title: input.title,
      targetAudience: input.targetAudience,
    });

    return job;
  }

  async adminRedrivePushJob(publicId: string, auditCtx: AuditContext) {
    const job = await this.prisma.pushJob.findUnique({ where: { publicId } });
    if (!job) {
      throw new NotFoundException("Push job không tồn tại");
    }
    if (job.status !== "FAILED") {
      throw new BadRequestException("Chỉ có thể redrive push job đã thất bại");
    }

    const updated = await this.prisma.pushJob.update({
      where: { publicId },
      data: {
        status: "PENDING",
        processedAt: null,
        completedAt: null,
        failedCount: 0,
      },
      include: {
        createdBy: {
          select: { publicId: true, displayName: true, email: true },
        },
      },
    });

    await this.audit.append(auditCtx, "admin.push_job.redrive", "push_job", publicId, {
      action: "redrive",
    });

    return updated;
  }

  async adminGetPushStatus() {
    const [total, pending, completed, failed] = await Promise.all([
      this.prisma.pushJob.count(),
      this.prisma.pushJob.count({ where: { status: "PENDING" } }),
      this.prisma.pushJob.count({ where: { status: "COMPLETED" } }),
      this.prisma.pushJob.count({ where: { status: "FAILED" } }),
    ]);

    return { total, pending, completed, failed };
  }

  async adminGetSubscriptionStats() {
    const [active, inactive] = await Promise.all([
      this.prisma.pushSubscription.count({ where: { isActive: true } }),
      this.prisma.pushSubscription.count({ where: { isActive: false } }),
    ]);

    return { active, inactive, total: active + inactive };
  }
}

import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { NotificationRepository } from "./notification.repository.js";
import { mapPushJobToAdminItem } from "./notification.mapper.js";
import type { AdminPushJobQuery, AdminCreatePushJobInput } from "./notification.schemas.js";

@Injectable()
export class NotificationService {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly audit: AuditService,
  ) {}

  async adminListPushJobs(query: AdminPushJobQuery) {
    const { data, total } = await this.repository.findManyPushJobs(query);

    return {
      data: data.map(mapPushJobToAdminItem),
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
    const job = await this.repository.findPushJobByPublicId(publicId);
    if (!job) {
      throw new NotFoundException("Push job không tồn tại");
    }
    return mapPushJobToAdminItem(job);
  }

  async adminCreatePushJob(
    input: AdminCreatePushJobInput,
    userId: string,
    auditCtx: AuditContext,
  ) {
    const job = await this.repository.createPushJob({
      publicId: nanoid(),
      title: input.title,
      body: input.body,
      targetAudience: input.targetAudience,
      createdById: userId,
    });

    await this.audit.append(auditCtx, "admin.push_job.create", "push_job", job.publicId, {
      title: input.title,
      targetAudience: input.targetAudience,
    });

    return mapPushJobToAdminItem(job);
  }

  async adminRedrivePushJob(publicId: string, auditCtx: AuditContext) {
    const job = await this.repository.findPushJobByPublicId(publicId);
    if (!job) {
      throw new NotFoundException("Push job không tồn tại");
    }
    if (job.status !== "FAILED") {
      throw new BadRequestException("Chỉ có thể redrive push job đã thất bại");
    }

    const updated = await this.repository.redriveJob(publicId);

    await this.audit.append(auditCtx, "admin.push_job.redrive", "push_job", publicId, {
      action: "redrive",
    });

    return mapPushJobToAdminItem(updated);
  }

  async adminDeletePushJob(publicId: string, auditCtx: AuditContext) {
    const job = await this.repository.findPushJobByPublicId(publicId);
    if (!job) {
      throw new NotFoundException("Push job không tồn tại");
    }

    await this.repository.deletePushJob(publicId);

    await this.audit.append(auditCtx, "admin.push_job.delete", "push_job", publicId, {
      status: job.status,
      title: job.title,
    });
  }

  async adminGetPushStatus() {
    return this.repository.countJobsByStatus();
  }

  async adminGetSubscriptionStats() {
    return this.repository.countSubscriptions();
  }
}

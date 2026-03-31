import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { NotificationRepository } from "./notification.repository.js";
import { mapPushJobToAdminItem } from "./notification.mapper.js";
import type {
  AdminPushJobQuery,
  AdminCreatePushJobInput,
  UpdatePreferencesInput,
  PushSubscribeInput,
  PushUnsubscribeInput,
} from "./notification.schemas.js";

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

  // ─── Member: Notification Preferences ───────────────────────────────────────

  async getPreferences(userId: string) {
    return this.repository.findPreferencesByUserId(userId);
  }

  async updatePreferences(
    userId: string,
    input: UpdatePreferencesInput,
    auditCtx: AuditContext,
  ) {
    const result = await this.repository.upsertPreferences(userId, input);

    await this.audit.append(auditCtx, "member.preferences.update", "notification_preference", userId, {
      ...input,
    });

    return {
      userId: result.userId,
      practiceReminders: result.practiceReminders,
      eventReminders: result.eventReminders,
      communityUpdates: result.communityUpdates,
      quietHoursStart: result.quietHoursStart,
      quietHoursEnd: result.quietHoursEnd,
    };
  }

  // ─── Member: Push Subscriptions ─────────────────────────────────────────────

  async subscribe(
    userId: string,
    input: PushSubscribeInput,
    auditCtx: AuditContext,
  ) {
    const existing = await this.repository.findSubscriptionByEndpoint(userId, input.endpoint);

    if (existing && existing.isActive) {
      throw new ConflictException("Thiết bị đã đăng ký nhận thông báo");
    }

    let subscription;
    if (existing) {
      // Reactivate an inactive subscription with fresh keys
      subscription = await this.repository.reactivateSubscription(
        existing.id,
        input.keys.p256dh,
        input.keys.auth,
      );
    } else {
      subscription = await this.repository.createSubscription({
        publicId: nanoid(),
        userId,
        endpoint: input.endpoint,
        keyP256dh: input.keys.p256dh,
        keyAuth: input.keys.auth,
      });
    }

    await this.audit.append(auditCtx, "member.push.subscribe", "push_subscription", subscription.publicId, {
      endpoint: input.endpoint,
      reactivated: !!existing,
    });

    return {
      publicId: subscription.publicId,
      endpoint: subscription.endpoint,
      isActive: subscription.isActive,
      subscribedAt: subscription.subscribedAt.toISOString(),
    };
  }

  async unsubscribe(
    userId: string,
    input: PushUnsubscribeInput,
    auditCtx: AuditContext,
  ) {
    const result = await this.repository.deactivateSubscriptionByEndpoint(userId, input.endpoint);

    if (!result) {
      throw new NotFoundException("Không tìm thấy đăng ký thông báo cho thiết bị này");
    }

    await this.audit.append(auditCtx, "member.push.unsubscribe", "push_subscription", result.publicId, {
      endpoint: input.endpoint,
    });

    return { success: true };
  }
}

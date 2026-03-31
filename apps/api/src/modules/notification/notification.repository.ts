import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type {
  AdminPushJobQuery,
  UpdatePreferencesInput,
} from "./notification.schemas.js";

const CREATOR_SELECT = {
  select: { publicId: true, displayName: true, email: true },
} as const;

/** Default preferences returned when no persisted row exists yet. */
const DEFAULT_PREFERENCES = {
  practiceReminders: true,
  eventReminders: true,
  communityUpdates: true,
  quietHoursStart: null,
  quietHoursEnd: null,
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

  async deletePushJob(publicId: string) {
    return this.prisma.pushJob.delete({
      where: { publicId },
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

  // ─── Member: Notification Preferences ───────────────────────────────────────

  async findPreferencesByUserId(userId: string) {
    const row = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });
    if (!row) {
      return { userId, persisted: false as const, ...DEFAULT_PREFERENCES };
    }
    return {
      userId: row.userId,
      persisted: true as const,
      practiceReminders: row.practiceReminders,
      eventReminders: row.eventReminders,
      communityUpdates: row.communityUpdates,
      quietHoursStart: row.quietHoursStart,
      quietHoursEnd: row.quietHoursEnd,
    };
  }

  async upsertPreferences(userId: string, input: UpdatePreferencesInput) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        practiceReminders: input.practiceReminders ?? true,
        eventReminders: input.eventReminders ?? true,
        communityUpdates: input.communityUpdates ?? true,
        quietHoursStart: input.quietHoursStart ?? null,
        quietHoursEnd: input.quietHoursEnd ?? null,
      },
      update: {
        ...(input.practiceReminders !== undefined && { practiceReminders: input.practiceReminders }),
        ...(input.eventReminders !== undefined && { eventReminders: input.eventReminders }),
        ...(input.communityUpdates !== undefined && { communityUpdates: input.communityUpdates }),
        ...(input.quietHoursStart !== undefined && { quietHoursStart: input.quietHoursStart }),
        ...(input.quietHoursEnd !== undefined && { quietHoursEnd: input.quietHoursEnd }),
      },
    });
  }

  // ─── Member: Push Subscriptions ─────────────────────────────────────────────

  async findSubscriptionByEndpoint(userId: string, endpoint: string) {
    return this.prisma.pushSubscription.findFirst({
      where: { userId, endpoint },
    });
  }

  async createSubscription(input: {
    publicId: string;
    userId: string;
    endpoint: string;
    keyP256dh: string;
    keyAuth: string;
  }) {
    return this.prisma.pushSubscription.create({
      data: {
        publicId: input.publicId,
        userId: input.userId,
        endpoint: input.endpoint,
        keyP256dh: input.keyP256dh,
        keyAuth: input.keyAuth,
        isActive: true,
      },
    });
  }

  async reactivateSubscription(id: string, keyP256dh: string, keyAuth: string) {
    return this.prisma.pushSubscription.update({
      where: { id },
      data: { isActive: true, keyP256dh, keyAuth, subscribedAt: new Date() },
    });
  }

  async deactivateSubscriptionByEndpoint(userId: string, endpoint: string) {
    const sub = await this.prisma.pushSubscription.findFirst({
      where: { userId, endpoint, isActive: true },
    });
    if (!sub) return null;

    return this.prisma.pushSubscription.update({
      where: { id: sub.id },
      data: { isActive: false },
    });
  }
}

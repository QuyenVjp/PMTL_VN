import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { CacheService } from "../../common/cache/cache.service.js";
import { HealthService } from "../health/health.service.js";
import type { HealthStatus } from "../health/health.schemas.js";

export interface ComponentHealth {
  name: string;
  status: HealthStatus;
  latencyMs: number;
  detail: string;
}

export interface DashboardStats {
  totalUsers: number;
  publishedPosts: number;
  pendingReports: number;
  activeSessions: number;
  recentPosts: Array<{
    publicId: string;
    title: string;
    status: string;
    authorName: string;
    updatedAt: string;
  }>;
  pendingReportsList: Array<{
    publicId: string;
    targetType: string;
    targetId: string;
    reasonCode: string;
    reporterUserId: string;
    createdAt: string;
  }>;
  recentAuditLogs: Array<{
    id: string;
    actorId: string | null;
    action: string;
    resource: string | null;
    resourceId: string | null;
    createdAt: string;
  }>;
  postStatusStats: Array<{
    status: string;
    count: number;
  }>;
  pendingReportTargetStats: Array<{
    targetType: string;
    count: number;
  }>;
  auditActionStats: Array<{
    action: string;
    count: number;
  }>;
  activitySeries7d: Array<{
    date: string;
    posts: number;
    reports: number;
    audits: number;
  }>;
  periodSummary: {
    newUsers7d: number;
    newPublishedPosts7d: number;
    newPendingReports7d: number;
    activeSessions24h: number;
  };
}

type DashboardWidgetKey =
  | "systemSummary"
  | "pendingModeration"
  | "contentOpsSummary"
  | "searchOpsSummary"
  | "recentAuditEvents";

export interface HealthExtended {
  overall: HealthStatus;
  components: ComponentHealth[];
  systemStats: {
    errorRate24h: number;
    activeAdmins: number;
    totalAdmins: number;
  };
  timestamp: string;
}

@Injectable()
export class AdminSystemService {
  private readonly logger = new Logger(AdminSystemService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly healthService: HealthService,
  ) {}

  async getDashboardStats(widget?: string, limit?: string): Promise<DashboardStats | unknown> {
    if (this.isDashboardWidgetKey(widget)) {
      return this.getDashboardWidget(widget, limit);
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      publishedPosts,
      pendingReports,
      activeSessions,
      recentPosts,
      pendingReportsList,
      recentAuditLogs,
      postStatusGrouped,
      pendingTargetGrouped,
      auditActionGrouped,
      posts7dRows,
      reports7dRows,
      audits7dRows,
      newUsers7d,
      newPublishedPosts7d,
      newPendingReports7d,
      activeSessions24h,
    ] = await Promise.all([
      // Total non-suspended users
      this.prisma.user.count({
        where: { status: { not: "DELETED" } },
      }),

      // Published posts
      this.prisma.post.count({
        where: { status: "PUBLISHED" },
      }),

      // Pending moderation reports
      this.prisma.moderationReport.count({
        where: { status: "PENDING" },
      }),

      // Active (non-revoked, non-expired) sessions
      this.prisma.session.count({
        where: {
          revokedAt: null,
          expiresAt: { gt: now },
        },
      }),

      // Recent posts (last 5)
      this.prisma.post.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        select: {
          publicId: true,
          title: true,
          status: true,
          updatedAt: true,
          author: { select: { displayName: true } },
        },
      }),

      // Pending reports (top 5)
      this.prisma.moderationReport.findMany({
        where: { status: "PENDING" },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          publicId: true,
          targetType: true,
          targetId: true,
          reasonCode: true,
          reporterUserId: true,
          createdAt: true,
        },
      }),

      // Recent audit logs (last 10)
      this.prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          actorId: true,
          action: true,
          resource: true,
          resourceId: true,
          createdAt: true,
        },
      }),
      this.prisma.post.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      this.prisma.moderationReport.groupBy({
        by: ["targetType"],
        where: { status: "PENDING" },
        _count: { _all: true },
      }),
      this.prisma.auditLog.groupBy({
        by: ["action"],
        where: { createdAt: { gte: sevenDaysAgo } },
        _count: { _all: true },
        orderBy: { _count: { action: "desc" } },
        take: 8,
      }),
      this.prisma.post.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
      this.prisma.moderationReport.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
      this.prisma.auditLog.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      this.prisma.post.count({
        where: {
          status: "PUBLISHED",
          publishedAt: { gte: sevenDaysAgo },
        },
      }),
      this.prisma.moderationReport.count({
        where: {
          status: "PENDING",
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      this.prisma.session.count({
        where: {
          revokedAt: null,
          expiresAt: { gt: now },
          createdAt: { gte: twentyFourHoursAgo },
        },
      }),
    ]);

    const activitySeries7d = this.buildActivitySeries7d({
      posts: posts7dRows.map((row) => row.createdAt),
      reports: reports7dRows.map((row) => row.createdAt),
      audits: audits7dRows.map((row) => row.createdAt),
    });

    return {
      totalUsers,
      publishedPosts,
      pendingReports,
      activeSessions,
      recentPosts: recentPosts.map((p) => ({
        publicId: p.publicId,
        title: p.title,
        status: p.status,
        authorName: p.author.displayName,
        updatedAt: p.updatedAt.toISOString(),
      })),
      pendingReportsList: pendingReportsList.map((r) => ({
        publicId: r.publicId,
        targetType: r.targetType,
        targetId: r.targetId,
        reasonCode: r.reasonCode,
        reporterUserId: r.reporterUserId,
        createdAt: r.createdAt.toISOString(),
      })),
      recentAuditLogs: recentAuditLogs.map((l) => ({
        id: l.id,
        actorId: l.actorId,
        action: l.action,
        resource: l.resource,
        resourceId: l.resourceId,
        createdAt: l.createdAt.toISOString(),
      })),
      postStatusStats: postStatusGrouped.map((group) => ({
        status: group.status,
        count: group._count._all,
      })),
      pendingReportTargetStats: pendingTargetGrouped.map((group) => ({
        targetType: group.targetType,
        count: group._count._all,
      })),
      auditActionStats: auditActionGrouped.map((group) => ({
        action: group.action,
        count: group._count._all,
      })),
      activitySeries7d,
      periodSummary: {
        newUsers7d,
        newPublishedPosts7d,
        newPendingReports7d,
        activeSessions24h,
      },
    };
  }

  private isDashboardWidgetKey(widget: string | undefined): widget is DashboardWidgetKey {
    return (
      widget === "systemSummary" ||
      widget === "pendingModeration" ||
      widget === "contentOpsSummary" ||
      widget === "searchOpsSummary" ||
      widget === "recentAuditEvents"
    );
  }

  private async getDashboardWidget(widget: DashboardWidgetKey, limit?: string) {
    const parsedLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

    if (widget === "systemSummary") {
      const [activeFeatureFlags, lastFlag] = await Promise.all([
        this.prisma.featureFlag.count({ where: { enabled: true } }),
        this.prisma.featureFlag.findFirst({
          orderBy: { updatedAt: "desc" },
          select: { updatedAt: true },
        }),
      ]);
      return {
        activeFeatureFlags,
        lastUpdated: lastFlag?.updatedAt.toISOString() ?? new Date(0).toISOString(),
      };
    }

    if (widget === "pendingModeration") {
      const [reportCount, commentCount] = await Promise.all([
        this.prisma.moderationReport.count({ where: { status: "PENDING" } }),
        this.prisma.moderationReport.count({ where: { status: "PENDING", targetType: "comment" } }),
      ]);
      return { reportCount, commentCount };
    }

    if (widget === "contentOpsSummary") {
      const [draftCount, publishedCount, lastPublished] = await Promise.all([
        this.prisma.post.count({ where: { status: "DRAFT" } }),
        this.prisma.post.count({ where: { status: "PUBLISHED" } }),
        this.prisma.post.findFirst({
          where: { status: "PUBLISHED", publishedAt: { not: null } },
          orderBy: { publishedAt: "desc" },
          select: { publishedAt: true },
        }),
      ]);
      return {
        draftCount,
        publishedCount,
        lastPublished: lastPublished?.publishedAt?.toISOString() ?? new Date(0).toISOString(),
      };
    }

    if (widget === "searchOpsSummary") {
      const indexedContentCount = await this.prisma.post.count({ where: { status: "PUBLISHED" } });
      return {
        status: "available",
        lastIndexed: new Date().toISOString(),
        indexCount: indexedContentCount,
      };
    }

    const logs = await this.prisma.auditLog.findMany({
      take: parsedLimit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        action: true,
        actorId: true,
        createdAt: true,
      },
    });

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      actor: log.actorId ?? "system",
      timestamp: log.createdAt.toISOString(),
    }));
  }

  async getHealthExtended(): Promise<HealthExtended> {
    const components: ComponentHealth[] = [];

    // 1. Database check
    const dbCheck = await this.timedCheck("PostgreSQL", () =>
      this.prisma.$queryRaw`SELECT 1`,
    );
    components.push(dbCheck);

    // 2. Redis/Valkey check
    const redisCheck = await this.timedCheck("Redis Cache", () =>
      this.cache.setJson("health:probe", { t: Date.now() }, 10),
    );
    components.push(redisCheck);

    // 3. Use existing health service readiness
    const readiness = await this.healthService.getReadinessStatus();
    if (readiness.checks.featureFlags) {
      components.push({
        name: "Feature Flags",
        status: readiness.checks.featureFlags.status,
        latencyMs: readiness.checks.featureFlags.latencyMs ?? 0,
        detail: readiness.checks.featureFlags.message ?? "Hoạt động bình thường",
      });
    }

    // System stats
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalAdmins, activeAdmins, totalWebhookDeliveries24h, failedWebhookDeliveries24h] = await Promise.all([
      this.prisma.user.count({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      }),
      this.prisma.session.count({
        where: {
          revokedAt: null,
          expiresAt: { gt: now },
          user: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
        },
      }),
      this.prisma.webhookDelivery.count({
        where: { processedAt: { gte: twentyFourHoursAgo } },
      }),
      this.prisma.webhookDelivery.count({
        where: { processedAt: { gte: twentyFourHoursAgo }, status: "FAILED" },
      }),
    ]);

    // Overall status
    const statuses = components.map((c) => c.status);
    let overall: HealthStatus = "healthy";
    if (statuses.includes("unhealthy")) {
      overall = "unhealthy";
    } else if (statuses.includes("degraded")) {
      overall = "degraded";
    }

    return {
      overall,
      components,
      systemStats: {
        errorRate24h:
          totalWebhookDeliveries24h > 0
            ? Number(((failedWebhookDeliveries24h / totalWebhookDeliveries24h) * 100).toFixed(2))
            : 0,
        activeAdmins,
        totalAdmins,
      },
      timestamp: now.toISOString(),
    };
  }

  private async timedCheck(
    name: string,
    fn: () => Promise<unknown>,
  ): Promise<ComponentHealth> {
    const start = Date.now();
    try {
      await fn();
      const latencyMs = Date.now() - start;
      return {
        name,
        status: latencyMs > 500 ? "degraded" : "healthy",
        latencyMs,
        detail: "Hoạt động bình thường",
      };
    } catch (error) {
      return {
        name,
        status: "unhealthy",
        latencyMs: Date.now() - start,
        detail: error instanceof Error ? error.message : "Không thể kết nối",
      };
    }
  }

  private buildActivitySeries7d(input: {
    posts: Date[];
    reports: Date[];
    audits: Date[];
  }): Array<{
    date: string;
    posts: number;
    reports: number;
    audits: number;
  }> {
    const now = new Date();
    const labels = Array.from({ length: 7 }, (_, offset) => {
      const day = new Date(now);
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - (6 - offset));
      return day.toISOString().slice(0, 10);
    });

    const seed = labels.reduce<Record<string, { posts: number; reports: number; audits: number }>>(
      (acc, key) => {
        acc[key] = { posts: 0, reports: 0, audits: 0 };
        return acc;
      },
      {},
    );

    const countInto = (dates: Date[], field: "posts" | "reports" | "audits") => {
      for (const date of dates) {
        const key = date.toISOString().slice(0, 10);
        if (seed[key]) {
          seed[key][field] += 1;
        }
      }
    };

    countInto(input.posts, "posts");
    countInto(input.reports, "reports");
    countInto(input.audits, "audits");

    return labels.map((key) => ({
      date: key,
      posts: seed[key].posts,
      reports: seed[key].reports,
      audits: seed[key].audits,
    }));
  }
}

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
}

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

  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();

    const [
      totalUsers,
      publishedPosts,
      pendingReports,
      activeSessions,
      recentPosts,
      pendingReportsList,
      recentAuditLogs,
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
    ]);

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
    };
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
}

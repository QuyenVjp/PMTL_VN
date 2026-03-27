import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { FeatureFlagsService } from "../feature-flags/feature-flags.service.js";
import type { HealthStatus, HealthCheckResult } from "./health.schemas.js";

interface CheckResult {
  status: HealthStatus;
  latencyMs?: number;
  message?: string;
}

@Injectable()
export class HealthService {
  private startupComplete = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly featureFlags: FeatureFlagsService,
  ) {}

  markStartupComplete() {
    this.startupComplete = true;
  }

  getLivenessStatus(): { status: HealthStatus } {
    return { status: "healthy" };
  }

  async getReadinessStatus(): Promise<HealthCheckResult> {
    const checks: Record<string, CheckResult> = {};

    // Check database
    checks.database = await this.checkDatabase();

    // Check feature flags readability
    checks.featureFlags = await this.checkFeatureFlags();

    // Determine overall status
    const statuses = Object.values(checks).map((c) => c.status);
    let overallStatus: HealthStatus = "healthy";
    
    if (statuses.includes("unhealthy")) {
      overallStatus = "unhealthy";
    } else if (statuses.includes("degraded")) {
      overallStatus = "degraded";
    }

    return {
      status: overallStatus,
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  async getStartupStatus(): Promise<HealthCheckResult> {
    const checks: Record<string, CheckResult> = {};

    if (!this.startupComplete) {
      checks.startup = { status: "unhealthy", message: "Startup not complete" };
    } else {
      checks.startup = { status: "healthy" };
      
      // Also check database on startup
      checks.database = await this.checkDatabase();
    }

    const statuses = Object.values(checks).map((c) => c.status);
    const overallStatus: HealthStatus = statuses.includes("unhealthy") ? "unhealthy" : "healthy";

    return {
      status: overallStatus,
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<CheckResult> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: "healthy",
        latencyMs: Date.now() - start,
      };
    } catch {
      return {
        status: "unhealthy",
        latencyMs: Date.now() - start,
        message: "Database connection failed",
      };
    }
  }

  private async checkFeatureFlags(): Promise<CheckResult> {
    const start = Date.now();
    try {
      await this.featureFlags.getAll();
      return {
        status: "healthy",
        latencyMs: Date.now() - start,
      };
    } catch {
      return {
        status: "degraded",
        latencyMs: Date.now() - start,
        message: "Feature flags unavailable",
      };
    }
  }
}

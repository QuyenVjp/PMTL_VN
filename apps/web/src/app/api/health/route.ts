import { NextResponse } from "next/server";

import { ensureRedisConnected } from "@/lib/cache/redis";
import { isShuttingDown } from "@/lib/runtime/shutdown";

const CMS_URL = process.env.CMS_PUBLIC_URL?.trim() || "";
const CMS_HEALTH_REQUIRED = process.env.CMS_HEALTH_REQUIRED === "true";
const MEILI_URL = process.env.MEILI_HOST ?? "http://meilisearch:7700";

async function checkCms() {
  if (!CMS_URL) {
    return { status: "disabled" as const };
  }

  try {
    const response = await fetch(`${CMS_URL}/api/health`, { cache: "no-store" });
    const body: unknown = await response.json().catch(() => null);
    return {
      status: response.ok ? "ok" as const : "error" as const,
      details: body,
    };
  } catch (error) {
    if (!CMS_HEALTH_REQUIRED) {
      return { status: "disabled" as const, note: error instanceof Error ? error.message : "cms check skipped" };
    }

    return { status: "error" as const, error: error instanceof Error ? error.message : "cms check failed" };
  }
}

async function checkRedis() {
  try {
    const redis = await ensureRedisConnected();
    if (!redis) {
      return { status: "disabled" as const };
    }

    const pong = await redis.ping();
    return { status: pong === "PONG" ? "ok" as const : "error" as const };
  } catch (error) {
    return { status: "error" as const, error: error instanceof Error ? error.message : "redis check failed" };
  }
}

async function checkMeilisearch() {
  try {
    const response = await fetch(`${MEILI_URL}/health`, { cache: "no-store" });
    return { status: response.ok ? "ok" as const : "error" as const };
  } catch (error) {
    return { status: "error" as const, error: error instanceof Error ? error.message : "meilisearch check failed" };
  }
}

export async function GET() {
  const checks = {
    cms: await checkCms(),
    redis: await checkRedis(),
    meilisearch: await checkMeilisearch(),
  };
  const degraded = isShuttingDown() || Object.values(checks).some((check) => check.status === "error");

  return NextResponse.json(
    {
      checks,
      now: new Date().toISOString(),
      service: "web",
      shuttingDown: isShuttingDown(),
      status: degraded ? "degraded" : "ok",
    },
    { status: degraded ? 503 : 200 },
  );
}

import { getCmsPayload } from "@/routes/public";
import { getRedisClient } from "@/services/redis.service";
import { isShuttingDown } from "@/services/runtime-shutdown.service";

const MEILI_URL = process.env.MEILI_HOST ?? "http://meilisearch:7700";

async function checkDatabase() {
  try {
    const payload = await getCmsPayload();
    await payload.count({
      collection: "requestGuards",
      overrideAccess: true,
    });
    return { status: "ok" as const };
  } catch (error) {
    return { status: "error" as const, error: error instanceof Error ? error.message : "database check failed" };
  }
}

async function checkRedis() {
  try {
    const redis = getRedisClient();
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
    if (!response.ok) {
      return { status: "error" as const, error: `meilisearch ${response.status}` };
    }

    return { status: "ok" as const };
  } catch (error) {
    return { status: "error" as const, error: error instanceof Error ? error.message : "meilisearch check failed" };
  }
}

export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    meilisearch: await checkMeilisearch(),
  };
  const degraded = isShuttingDown() || Object.values(checks).some((check) => check.status === "error");

  return Response.json(
    {
      checks,
      now: new Date().toISOString(),
      service: "cms",
      shuttingDown: isShuttingDown(),
      status: degraded ? "degraded" : "ok",
    },
    { status: degraded ? 503 : 200 },
  );
}

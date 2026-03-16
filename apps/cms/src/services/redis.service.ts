import Redis from "ioredis";
import { getLogger, withError } from "@/services/logger.service";
import { normalizeDockerHostnameUrl } from "@/services/local-service-url.service";

let redisClient: Redis | null | undefined;
const logger = getLogger("services:redis");

export function getRedisUrl(): string | null {
  const redisUrl = normalizeDockerHostnameUrl(process.env.REDIS_URL, "redis", "127.0.0.1");

  return redisUrl ? redisUrl : null;
}

export function isRedisEnabled(): boolean {
  return Boolean(getRedisUrl());
}

export function getRedisClient(): Redis | null {
  if (redisClient !== undefined) {
    return redisClient;
  }

  const redisUrl = getRedisUrl();

  if (!redisUrl) {
    redisClient = null;
    return redisClient;
  }

  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });

  redisClient.on("error", (error) => {
    logger.error(withError({ redisUrl }, error), "Redis client error");
  });

  return redisClient;
}

export function getBullMqConnection() {
  const redisUrl = getRedisUrl();

  if (!redisUrl) {
    return null;
  }

  const parsed = new URL(redisUrl);

  return {
    host: parsed.hostname,
    port: Number(parsed.port || "6379"),
    ...(parsed.username ? { username: parsed.username } : {}),
    ...(parsed.password ? { password: parsed.password } : {}),
    ...(parsed.pathname && parsed.pathname !== "/" ? { db: Number(parsed.pathname.slice(1)) } : {}),
  };
}

export async function closeRedisClient(): Promise<void> {
  if (!redisClient) {
    return;
  }

  await redisClient.quit();
  redisClient = null;
}

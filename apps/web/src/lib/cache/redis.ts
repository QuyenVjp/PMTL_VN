import "server-only";

import Redis from "ioredis";

import { logger } from "@/lib/logger";

let redisClient: Redis | null | undefined;

function normalizeRedisUrl(value: string | undefined): string | null {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return null;
  }

  if (process.platform !== "win32") {
    return trimmedValue;
  }

  try {
    const parsed = new URL(trimmedValue);
    if (parsed.hostname === "redis") {
      parsed.hostname = "127.0.0.1";
      return parsed.toString();
    }
  } catch {
    return trimmedValue;
  }

  return trimmedValue;
}

export function getRedisUrl(): string | null {
  return normalizeRedisUrl(process.env.REDIS_URL);
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
    enableReadyCheck: true,
    lazyConnect: true,
    maxRetriesPerRequest: null,
  });

  redisClient.on("error", (error) => {
    logger.error("Web Redis client error", { error, redisUrl });
  });

  return redisClient;
}

export async function ensureRedisConnected(): Promise<Redis | null> {
  const client = getRedisClient();
  if (!client) {
    return null;
  }

  if (client.status === "wait") {
    await client.connect();
  }

  return client;
}

export async function closeRedisClient(): Promise<void> {
  if (!redisClient) {
    return;
  }

  try {
    await redisClient.quit();
  } catch (error) {
    logger.warn("Failed to close web Redis client cleanly", { error });
  } finally {
    redisClient = null;
  }
}

import Redis from "ioredis";

let redisClient: Redis | null | undefined;

export function getRedisUrl(): string | null {
  const redisUrl = process.env.REDIS_URL?.trim();

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
    console.error("[redis]", error);
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

import Redis from "ioredis";
import { RateLimiterMemory, RateLimiterRedis, type IRateLimiterRes } from "rate-limiter-flexible";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { getLogger, withError } from "@/services/logger.service";

const logger = getLogger("security:rate-limit");

const rateLimitEnvSchema = z.object({
  store: z.enum(["auto", "memory", "redis"]).default("auto"),
  redisUrl: z.string().trim().optional(),
  defaultLimit: z.coerce.number().int().positive().default(180),
  defaultWindowMs: z.coerce.number().int().positive().default(60_000),
  authLimit: z.coerce.number().int().positive().default(20),
  authWindowMs: z.coerce.number().int().positive().default(60_000),
});

const env = rateLimitEnvSchema.parse({
  store: process.env.SECURITY_RATE_LIMIT_STORE ?? "auto",
  redisUrl: process.env.REDIS_URL,
  defaultLimit: process.env.SECURITY_RATE_LIMIT_MAX,
  defaultWindowMs: process.env.SECURITY_RATE_LIMIT_WINDOW_MS,
  authLimit: process.env.SECURITY_RATE_LIMIT_AUTH_MAX,
  authWindowMs: process.env.SECURITY_RATE_LIMIT_AUTH_WINDOW_MS,
});

const rateLimitRuleSchema = z.object({
  key: z.string().min(1),
  points: z.number().int().positive(),
  durationMs: z.number().int().positive(),
  blockDurationMs: z.number().int().nonnegative().default(0),
});

type RateLimitRule = z.infer<typeof rateLimitRuleSchema>;

type RateLimitResult = {
  allowed: boolean;
  key: string;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter: number;
  store: "memory" | "redis";
};

type RateLimiterLike = {
  consume: (key: string) => Promise<IRateLimiterRes>;
};

const limiterCache = new Map<string, { limiter: RateLimiterLike; store: "memory" | "redis" }>();
let redisClient: Redis | null = null;

function resolveClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(",");
    if (firstIp) {
      return firstIp.trim();
    }
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function resolveRule(pathname: string): RateLimitRule {
  if (pathname.startsWith("/api/auth/")) {
    return rateLimitRuleSchema.parse({
      key: "auth",
      points: env.authLimit,
      durationMs: env.authWindowMs,
      blockDurationMs: env.authWindowMs,
    });
  }

  return rateLimitRuleSchema.parse({
    key: "api",
    points: env.defaultLimit,
    durationMs: env.defaultWindowMs,
    blockDurationMs: env.defaultWindowMs,
  });
}

function shouldUseRedisStore(): boolean {
  if (env.store === "memory") {
    return false;
  }

  if (env.store === "redis") {
    return Boolean(env.redisUrl);
  }

  return Boolean(env.redisUrl) && process.env.NODE_ENV === "production";
}

function getRedisClient(): Redis | null {
  if (!shouldUseRedisStore() || !env.redisUrl) {
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  redisClient = new Redis(env.redisUrl, {
    enableReadyCheck: true,
    maxRetriesPerRequest: null,
    lazyConnect: true,
  });

  redisClient.on("error", (error) => {
    logger.error(withError({ redisUrl: env.redisUrl }, error), "CMS rate limit Redis client error");
  });

  return redisClient;
}

function buildMemoryLimiter(rule: RateLimitRule): RateLimiterMemory {
  return new RateLimiterMemory({
    keyPrefix: `cms:${rule.key}`,
    points: rule.points,
    duration: Math.ceil(rule.durationMs / 1000),
    blockDuration: Math.ceil(rule.blockDurationMs / 1000),
  });
}

function buildRedisLimiter(rule: RateLimitRule, client: Redis): RateLimiterRedis {
  return new RateLimiterRedis({
    keyPrefix: `cms:${rule.key}`,
    points: rule.points,
    duration: Math.ceil(rule.durationMs / 1000),
    blockDuration: Math.ceil(rule.blockDurationMs / 1000),
    storeClient: client,
    insuranceLimiter: buildMemoryLimiter(rule),
  });
}

async function getLimiter(rule: RateLimitRule): Promise<{ limiter: RateLimiterLike; store: "memory" | "redis" }> {
  const cached = limiterCache.get(rule.key);
  if (cached) {
    return cached;
  }

  const client = getRedisClient();
  if (client) {
    try {
      if (client.status === "wait") {
        await client.connect();
      }

      const nextLimiter = {
        limiter: buildRedisLimiter(rule, client),
        store: "redis" as const,
      };
      limiterCache.set(rule.key, nextLimiter);
      return nextLimiter;
    } catch (error) {
      logger.warn(withError({ rule: rule.key }, error), "Falling back to in-memory CMS rate limiting");
    }
  }

  const fallbackLimiter = {
    limiter: buildMemoryLimiter(rule),
    store: "memory" as const,
  };
  limiterCache.set(rule.key, fallbackLimiter);
  return fallbackLimiter;
}

function isRateLimiterRes(value: unknown): value is IRateLimiterRes {
  return typeof value === "object" && value !== null && "remainingPoints" in value && "msBeforeNext" in value;
}

function formatResult(
  rule: RateLimitRule,
  key: string,
  limiterRes: IRateLimiterRes,
  store: "memory" | "redis",
  allowed: boolean,
): RateLimitResult {
  const msBeforeNext = Math.max(limiterRes.msBeforeNext ?? 0, 1);
  const consumedPoints = limiterRes.consumedPoints ?? 0;
  const remaining = Math.max(0, allowed ? rule.points - consumedPoints : limiterRes.remainingPoints ?? 0);

  return {
    allowed,
    key,
    limit: rule.points,
    remaining,
    resetAt: Date.now() + msBeforeNext,
    retryAfter: Math.max(1, Math.ceil(msBeforeNext / 1000)),
    store,
  };
}

export async function checkRateLimit(request: NextRequest): Promise<RateLimitResult> {
  const rule = resolveRule(request.nextUrl.pathname);
  const key = `${rule.key}:${resolveClientIp(request)}`;
  const { limiter, store } = await getLimiter(rule);

  try {
    const limiterRes = await limiter.consume(key);
    return formatResult(rule, key, limiterRes, store, true);
  } catch (error) {
    if (isRateLimiterRes(error)) {
      return formatResult(rule, key, error, store, false);
    }

    logger.error(withError({ key, store }, error), "CMS rate limiter failed unexpectedly; allowing request");
    return {
      allowed: true,
      key,
      limit: rule.points,
      remaining: rule.points,
      resetAt: Date.now() + rule.durationMs,
      retryAfter: Math.ceil(rule.durationMs / 1000),
      store: "memory",
    };
  }
}

import "server-only";

import { RateLimiterMemory, RateLimiterRedis, type IRateLimiterRes } from "rate-limiter-flexible";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { ensureRedisConnected } from "@/lib/cache/redis";
import { logger } from "@/lib/logger";
import { getClientIp } from "@/lib/security/request-context";

const envSchema = z.object({
  defaultMax: z.coerce.number().int().positive().default(180),
  defaultWindowMs: z.coerce.number().int().positive().default(60_000),
  authMax: z.coerce.number().int().positive().default(15),
  authWindowMs: z.coerce.number().int().positive().default(60_000),
  uploadMax: z.coerce.number().int().positive().default(20),
  uploadWindowMs: z.coerce.number().int().positive().default(300_000),
});

const env = envSchema.parse({
  defaultMax: process.env.SECURITY_RATE_LIMIT_MAX,
  defaultWindowMs: process.env.SECURITY_RATE_LIMIT_WINDOW_MS,
  authMax: process.env.SECURITY_RATE_LIMIT_AUTH_MAX,
  authWindowMs: process.env.SECURITY_RATE_LIMIT_AUTH_WINDOW_MS,
  uploadMax: process.env.SECURITY_RATE_LIMIT_UPLOAD_MAX,
  uploadWindowMs: process.env.SECURITY_RATE_LIMIT_UPLOAD_WINDOW_MS,
});

const profileSchema = z.object({
  name: z.string().min(1),
  points: z.number().int().positive(),
  durationMs: z.number().int().positive(),
  blockDurationMs: z.number().int().nonnegative().default(0),
});

type RateLimitProfile = z.infer<typeof profileSchema>;

type RateLimiterLike = {
  consume: (key: string) => Promise<IRateLimiterRes>;
};

export type RateLimitResult = {
  allowed: boolean;
  key: string;
  limit: number;
  remaining: number;
  retryAfter: number;
  reason: "limited" | "service-unavailable";
  resetAt: number;
  store: "memory" | "redis";
};

const limiterCache = new Map<string, { limiter: RateLimiterLike; store: "memory" | "redis" }>();

function getMemoryLimiter(profile: RateLimitProfile) {
  return new RateLimiterMemory({
    blockDuration: Math.ceil(profile.blockDurationMs / 1000),
    duration: Math.ceil(profile.durationMs / 1000),
    keyPrefix: `web:${profile.name}`,
    points: profile.points,
  });
}

function shouldUseRedisStore(): boolean {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (!redisUrl) {
    return false;
  }

  return process.env.NODE_ENV === "production";
}

async function getLimiter(profile: RateLimitProfile): Promise<{ limiter: RateLimiterLike; store: "memory" | "redis" }> {
  const cached = limiterCache.get(profile.name);
  if (cached) {
    return cached;
  }

  const client = await ensureRedisConnected().catch((error: unknown) => {
    if (shouldUseRedisStore()) {
      throw error;
    }

    logger.warn("Web rate-limit Redis connect failed, using memory fallback", { error, profile: profile.name });
    return null;
  });

  if (client) {
    const limiter = new RateLimiterRedis({
      blockDuration: Math.ceil(profile.blockDurationMs / 1000),
      duration: Math.ceil(profile.durationMs / 1000),
      keyPrefix: `web:${profile.name}`,
      points: profile.points,
      storeClient: client,
    });
    const next = { limiter, store: "redis" as const };
    limiterCache.set(profile.name, next);
    return next;
  }

  const fallback = { limiter: getMemoryLimiter(profile), store: "memory" as const };
  limiterCache.set(profile.name, fallback);
  return fallback;
}

function isRateLimiterRes(value: unknown): value is IRateLimiterRes {
  return typeof value === "object" && value !== null && "remainingPoints" in value && "msBeforeNext" in value;
}

function formatResult(
  profile: RateLimitProfile,
  key: string,
  limiterRes: IRateLimiterRes,
  store: "memory" | "redis",
  allowed: boolean,
): RateLimitResult {
  const msBeforeNext = Math.max(limiterRes.msBeforeNext ?? 0, 1);
  const consumedPoints = limiterRes.consumedPoints ?? 0;
  const remaining = Math.max(0, allowed ? profile.points - consumedPoints : limiterRes.remainingPoints ?? 0);

  return {
    allowed,
    key,
    limit: profile.points,
    remaining,
    reason: allowed ? "limited" : "limited",
    resetAt: Date.now() + msBeforeNext,
    retryAfter: Math.max(1, Math.ceil(msBeforeNext / 1000)),
    store,
  };
}

export function resolveRateLimitProfile(pathname: string): RateLimitProfile {
  if (pathname.startsWith("/api/auth/login")) {
    return profileSchema.parse({
      name: "auth-login",
      points: 5,
      durationMs: 60_000,
      blockDurationMs: 5 * 60_000,
    });
  }

  if (pathname.startsWith("/api/auth/register") || pathname.startsWith("/api/auth/forgot-password") || pathname.startsWith("/api/auth/reset-password")) {
    return profileSchema.parse({
      name: "auth-mutation",
      points: env.authMax,
      durationMs: env.authWindowMs,
      blockDurationMs: env.authWindowMs,
    });
  }

  if (pathname.startsWith("/api/upload")) {
    return profileSchema.parse({
      name: "upload",
      points: env.uploadMax,
      durationMs: env.uploadWindowMs,
      blockDurationMs: env.uploadWindowMs,
    });
  }

  if (pathname.startsWith("/api/guestbook/submit")) {
    return profileSchema.parse({
      name: "guestbook-submit",
      points: 3,
      durationMs: 60 * 60_000,
      blockDurationMs: 60 * 60_000,
    });
  }

  if (pathname.startsWith("/api/community-comments/submit")) {
    return profileSchema.parse({
      name: "community-comment-submit",
      points: 8,
      durationMs: 10 * 60_000,
      blockDurationMs: 10 * 60_000,
    });
  }

  if (pathname.startsWith("/api/community-posts/submit")) {
    return profileSchema.parse({
      name: "community-post-submit",
      points: 2,
      durationMs: 60 * 60_000,
      blockDurationMs: 60 * 60_000,
    });
  }

  return profileSchema.parse({
    name: "api-default",
    points: env.defaultMax,
    durationMs: env.defaultWindowMs,
    blockDurationMs: env.defaultWindowMs,
  });
}

export async function checkRateLimit(request: NextRequest, profile = resolveRateLimitProfile(request.nextUrl.pathname)): Promise<RateLimitResult> {
  const key = `${profile.name}:${getClientIp(request)}`;

  try {
    const { limiter, store } = await getLimiter(profile);
    const limiterRes = await limiter.consume(key);
    return formatResult(profile, key, limiterRes, store, true);
  } catch (error) {
    if (isRateLimiterRes(error)) {
      const { store } = (await getLimiter(profile).catch(() => ({ store: shouldUseRedisStore() ? "redis" as const : "memory" as const }))) as {
        store: "memory" | "redis";
      };
      return formatResult(profile, key, error, store, false);
    }

    logger.error("Web rate limiter failed unexpectedly; blocking request", {
      error,
      key,
      profile: profile.name,
      store: shouldUseRedisStore() ? "redis" : "memory",
    });

    return {
      allowed: false,
      key,
      limit: profile.points,
      remaining: 0,
      reason: "service-unavailable",
      resetAt: Date.now() + profile.durationMs,
      retryAfter: Math.ceil(profile.durationMs / 1000),
      store: shouldUseRedisStore() ? "redis" : "memory",
    };
  }
}

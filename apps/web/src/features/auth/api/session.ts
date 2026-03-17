import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { AuthSession, AuthUser } from "@pmtl/shared";

import { ensureRedisConnected } from "@/lib/cache/redis";
import { logger } from "@/lib/logger";

import { AUTH_COOKIE_NAME } from "../utils/auth-cookie";
import { getCurrentSessionFromCMS } from "./cms-auth-client";

const SESSION_CACHE_PREFIX = "auth-session";
const inMemorySessionCache = new Map<string, { expiresAt: number; session: AuthSession | null }>();

function getSessionCacheKey(token: string): string {
  return `${SESSION_CACHE_PREFIX}:${token}`;
}

function getTokenTtlSeconds(token: string): number {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return 60;
    }

    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
    if (!parsed.exp || !Number.isFinite(parsed.exp)) {
      return 60;
    }

    return Math.max(5, Math.floor(parsed.exp - Date.now() / 1000));
  } catch {
    return 60;
  }
}

async function readCachedSession(token: string): Promise<AuthSession | null | undefined> {
  const cached = inMemorySessionCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.session;
  }

  if (cached) {
    inMemorySessionCache.delete(token);
  }

  const redis = await ensureRedisConnected().catch(() => null);
  if (!redis) {
    return undefined;
  }

  try {
    const value = await redis.get(getSessionCacheKey(token));
    if (!value) {
      return undefined;
    }

    const parsed = JSON.parse(value) as AuthSession | null;
    inMemorySessionCache.set(token, {
      expiresAt: Date.now() + 30_000,
      session: parsed,
    });
    return parsed;
  } catch (error) {
    logger.warn("Failed to read cached auth session", { error });
    return undefined;
  }
}

async function writeCachedSession(token: string, session: AuthSession | null): Promise<void> {
  const ttlSeconds = getTokenTtlSeconds(token);
  inMemorySessionCache.set(token, {
    expiresAt: Date.now() + Math.min(ttlSeconds, 30) * 1000,
    session,
  });

  const redis = await ensureRedisConnected().catch(() => null);
  if (!redis) {
    return;
  }

  try {
    await redis.set(getSessionCacheKey(token), JSON.stringify(session), "EX", ttlSeconds);
  } catch (error) {
    logger.warn("Failed to write cached auth session", { error });
  }
}

export async function invalidateAuthSessionCache(token?: string | null): Promise<void> {
  if (!token) {
    return;
  }

  inMemorySessionCache.delete(token);

  const redis = await ensureRedisConnected().catch(() => null);
  if (!redis) {
    return;
  }

  try {
    await redis.del(getSessionCacheKey(token));
  } catch (error) {
    logger.warn("Failed to invalidate cached auth session", { error });
  }
}

const getCachedSessionByToken = cache(async (token: string): Promise<AuthSession | null> => {
  const cached = await readCachedSession(token);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const response = await getCurrentSessionFromCMS(token);
    await writeCachedSession(token, response.session);
    return response.session;
  } catch (error) {
    await writeCachedSession(token, null);
    logger.warn("Auth session lookup failed", { error });
    return null;
  }
});

export async function getOptionalAuthSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return getCachedSessionByToken(token);
}

export async function requireAuthSession(): Promise<AuthSession> {
  const session = await getOptionalAuthSession();

  if (!session) {
    redirect("/login?redirect=/profile");
  }

  return session;
}

export function hasAnyRole(user: AuthUser, roles: AuthUser["role"][]): boolean {
  return roles.includes(user.role);
}

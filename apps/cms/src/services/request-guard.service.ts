import type { Payload } from "payload";
import { getRedisClient } from "./redis.service";

type GuardScope = "view" | "comment-submit" | "community-submit" | "search" | "auth" | "report";

type ConsumeGuardInput = {
  payload: Payload;
  guardKey: string;
  scope: GuardScope;
  ttlSeconds: number;
  maxHits: number;
  notes?: string | null;
};

export async function peekGuard(payload: Payload, guardKey: string) {
  const redis = getRedisClient();

  if (redis) {
    const key = `guard:${guardKey}`;
    const [hits, ttlSeconds] = await Promise.all([redis.get(key), redis.ttl(key)]);

    if (!hits) {
      return null;
    }

    return {
      id: key,
      guardKey,
      hits: Number(hits),
      expiresAt:
        ttlSeconds > 0 ? new Date(Date.now() + ttlSeconds * 1000).toISOString() : new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
  }

  const result = await payload.find({
    collection: "requestGuards",
    overrideAccess: true,
    limit: 1,
    where: {
      guardKey: {
        equals: guardKey,
      },
    },
  });

  return result.docs[0] ?? null;
}

export async function consumeGuard(input: ConsumeGuardInput) {
  const redis = getRedisClient();

  if (redis) {
    const key = `guard:${input.guardKey}`;
    const nextHits = await redis.incr(key);

    if (nextHits === 1) {
      await redis.expire(key, input.ttlSeconds);
    }

    const ttlSeconds = await redis.ttl(key);

    return {
      allowed: nextHits <= input.maxHits,
      document: {
        id: key,
        guardKey: input.guardKey,
        hits: nextHits,
        expiresAt:
          ttlSeconds > 0 ? new Date(Date.now() + ttlSeconds * 1000).toISOString() : new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
        notes: input.notes ?? "",
      },
      remaining: Math.max(input.maxHits - nextHits, 0),
    };
  }

  const existing = await peekGuard(input.payload, input.guardKey);
  const expiresAt = new Date(Date.now() + input.ttlSeconds * 1000).toISOString();

  if (
    existing?.expiresAt &&
    typeof existing.expiresAt === "string" &&
    new Date(existing.expiresAt).getTime() <= Date.now()
  ) {
    await input.payload.delete({
      collection: "requestGuards",
      id: existing.id,
      overrideAccess: true,
    });

    const created = await input.payload.create({
      collection: "requestGuards",
      data: {
        guardKey: input.guardKey,
        scope: input.scope,
        expiresAt,
        hits: 1,
        lastSeenAt: new Date().toISOString(),
        notes: input.notes ?? "",
      },
      overrideAccess: true,
    });

    return {
      allowed: true,
      document: created,
      remaining: Math.max(input.maxHits - 1, 0),
    };
  }

  if (!existing) {
    const created = await input.payload.create({
      collection: "requestGuards",
      data: {
        guardKey: input.guardKey,
        scope: input.scope,
        expiresAt,
        hits: 1,
        lastSeenAt: new Date().toISOString(),
        notes: input.notes ?? "",
      },
      overrideAccess: true,
    });

    return {
      allowed: true,
      document: created,
      remaining: Math.max(input.maxHits - 1, 0),
    };
  }

  const nextHits = typeof existing.hits === "number" ? existing.hits + 1 : 1;
  const updated = await input.payload.update({
    collection: "requestGuards",
    id: existing.id,
    data: {
      hits: nextHits,
      lastSeenAt: new Date().toISOString(),
      expiresAt,
      ...(input.notes !== undefined ? { notes: input.notes ?? "" } : {}),
    },
    overrideAccess: true,
  });

  return {
    allowed: nextHits <= input.maxHits,
    document: updated,
    remaining: Math.max(input.maxHits - nextHits, 0),
  };
}

export async function resetGuard(payload: Payload, guardKey: string) {
  const redis = getRedisClient();

  if (redis) {
    const key = `guard:${guardKey}`;
    const existing = await peekGuard(payload, guardKey);

    await redis.del(key);

    return existing;
  }

  const existing = await peekGuard(payload, guardKey);

  if (!existing) {
    return null;
  }

  await payload.delete({
    collection: "requestGuards",
    id: existing.id,
    overrideAccess: true,
  });

  return existing;
}

export async function cleanupExpiredGuards(payload: Payload) {
  const redis = getRedisClient();

  if (redis) {
    return 0;
  }

  const expired = await payload.find({
    collection: "requestGuards",
    overrideAccess: true,
    limit: 200,
    where: {
      expiresAt: {
        less_than: new Date().toISOString(),
      },
    },
  });

  await Promise.all(
    expired.docs.map((document) =>
      payload.delete({
        collection: "requestGuards",
        id: document.id,
        overrideAccess: true,
      }),
    ),
  );

  return expired.docs.length;
}

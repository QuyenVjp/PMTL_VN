import type { Payload } from "payload";

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
  const existing = await peekGuard(input.payload, input.guardKey);
  const expiresAt = new Date(Date.now() + input.ttlSeconds * 1000).toISOString();

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

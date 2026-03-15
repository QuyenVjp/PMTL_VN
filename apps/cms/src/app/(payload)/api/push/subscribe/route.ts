import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { upsertPushSubscription } from "@/services/push.service";

type PushSubscriptionInput = {
  publicId?: string;
  user?: number | null;
  endpoint: string;
  keys?: {
    p256dh?: string | null;
    auth?: string | null;
  };
  timezone?: string | null;
  isActive?: boolean | null;
  failedCount?: number | null;
  notificationPrefs?: {
    posts?: boolean | null;
    events?: boolean | null;
    community?: boolean | null;
  };
  quietHours?: {
    from?: string | null;
    to?: string | null;
  };
  lastError?: string | null;
};

function parsePushSubscriptionBody(body: unknown): PushSubscriptionInput {
  const source = body && typeof body === "object" ? body : {};
  const record = source as Record<string, unknown>;
  const rawKeys =
    record.keys && typeof record.keys === "object"
      ? (record.keys as Record<string, unknown>)
      : undefined;
  const rawPrefs =
    record.notificationPrefs && typeof record.notificationPrefs === "object"
      ? (record.notificationPrefs as Record<string, unknown>)
      : undefined;
  const rawQuietHours =
    record.quietHours && typeof record.quietHours === "object"
      ? (record.quietHours as Record<string, unknown>)
      : undefined;

  const parsed: PushSubscriptionInput = {
    endpoint: typeof record.endpoint === "string" ? record.endpoint : "",
  };

  if (typeof record.publicId === "string") {
    parsed.publicId = record.publicId;
  }

  if (typeof record.user === "number") {
    parsed.user = record.user;
  }

  if (rawKeys) {
    parsed.keys = {
      ...(typeof rawKeys.p256dh === "string" ? { p256dh: rawKeys.p256dh } : {}),
      ...(typeof rawKeys.auth === "string" ? { auth: rawKeys.auth } : {}),
    };
  }

  if (typeof record.timezone === "string") {
    parsed.timezone = record.timezone;
  }

  if (typeof record.isActive === "boolean") {
    parsed.isActive = record.isActive;
  }

  if (typeof record.failedCount === "number") {
    parsed.failedCount = record.failedCount;
  }

  if (rawPrefs) {
    parsed.notificationPrefs = {
      ...(typeof rawPrefs.posts === "boolean" ? { posts: rawPrefs.posts } : {}),
      ...(typeof rawPrefs.events === "boolean" ? { events: rawPrefs.events } : {}),
      ...(typeof rawPrefs.community === "boolean" ? { community: rawPrefs.community } : {}),
    };
  }

  if (rawQuietHours) {
    parsed.quietHours = {
      ...(typeof rawQuietHours.from === "string" ? { from: rawQuietHours.from } : {}),
      ...(typeof rawQuietHours.to === "string" ? { to: rawQuietHours.to } : {}),
    };
  }

  if (typeof record.lastError === "string") {
    parsed.lastError = record.lastError;
  }

  return parsed;
}

export async function POST(request: Request) {
  try {
    const payload = await getCmsPayload();
    const body: unknown = await request.json();
    const prepared = upsertPushSubscription(parsePushSubscriptionBody(body));
    const endpoint = prepared.endpoint.trim();
    const createData = {
      ...prepared,
      publicId: prepared.publicId ?? "",
    };

    if (!endpoint) {
      return jsonResponse(400, { error: { message: "Endpoint is required." } });
    }

    const existing = await payload.find({
      collection: "pushSubscriptions",
      depth: 0,
      limit: 1,
      where: {
        endpoint: {
          equals: endpoint,
        },
      },
    });

    const document =
      existing.docs[0]
        ? await payload.update({
            collection: "pushSubscriptions",
            id: existing.docs[0].id,
            data: createData,
            overrideAccess: true,
          })
        : await payload.create({
            collection: "pushSubscriptions",
            data: createData,
            draft: false,
            overrideAccess: true,
          });

    return jsonResponse(200, document);
  } catch (error) {
    return mapRouteError(error);
  }
}

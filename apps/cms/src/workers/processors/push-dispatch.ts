import type { Job } from "bullmq";
import type { PushDispatchJob } from "@pmtl/shared";
import webpush from "web-push";

import {
  completePushJob,
  failPushJob,
  markPushJobProcessing,
  updatePushJobProgress,
} from "@/services/push.service";
import { getWorkerPayload } from "@/workers/payload";

type PushJobPayload = {
  title?: string;
  body?: string;
  channel?: "posts" | "events" | "community";
  recipientRoles?: string[];
  includeUserIds?: string[];
  excludeUserIds?: string[];
  metadata?: Record<string, unknown>;
};

type SubscriptionDocument = {
  id: string | number;
  endpoint: string;
  keys?: {
    p256dh?: string | null;
    auth?: string | null;
  } | null;
  user?: { id?: string | number | null; role?: string | null } | string | number | null;
  isActive?: boolean | null;
  failedCount?: number | null;
  notificationPrefs?: {
    posts?: boolean | null;
    events?: boolean | null;
    community?: boolean | null;
  } | null;
};

function resolveUserId(subscription: SubscriptionDocument): string | null {
  if (typeof subscription.user === "string" || typeof subscription.user === "number") {
    return String(subscription.user);
  }

  if (subscription.user && typeof subscription.user === "object" && subscription.user.id) {
    return String(subscription.user.id);
  }

  return null;
}

function resolveUserRole(subscription: SubscriptionDocument): string | null {
  if (subscription.user && typeof subscription.user === "object" && typeof subscription.user.role === "string") {
    return subscription.user.role;
  }

  return null;
}

function resolvePreferenceKey(kind: string, payload: PushJobPayload): "posts" | "events" | "community" {
  if (payload.channel) {
    return payload.channel;
  }

  if (kind.includes("event")) {
    return "events";
  }

  if (kind.includes("community") || kind.includes("moderation") || kind.includes("guestbook") || kind.includes("report")) {
    return "community";
  }

  return "posts";
}

function shouldSendToSubscription(
  subscription: SubscriptionDocument,
  options: {
    channel: "posts" | "events" | "community";
    includeUserIds: Set<string>;
    excludeUserIds: Set<string>;
    recipientRoles: Set<string>;
  },
) {
  if (!subscription.isActive || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    return false;
  }

  const userId = resolveUserId(subscription);
  const role = resolveUserRole(subscription);

  if (userId && options.excludeUserIds.has(userId)) {
    return false;
  }

  if (options.includeUserIds.size > 0) {
    return userId ? options.includeUserIds.has(userId) : false;
  }

  if (options.recipientRoles.size > 0 && role && !options.recipientRoles.has(role)) {
    return false;
  }

  if (options.recipientRoles.size > 0 && !role) {
    return false;
  }

  return subscription.notificationPrefs?.[options.channel] ?? true;
}

function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const email = process.env.VAPID_EMAIL?.trim();

  if (!publicKey || !privateKey || !email) {
    throw new Error("Thiếu cấu hình VAPID cho worker push.");
  }

  webpush.setVapidDetails(`mailto:${email}`, publicKey, privateKey);
}

export async function processPushDispatchJob(job: Job<PushDispatchJob>) {
  configureWebPush();

  const payload = await getWorkerPayload();
  const pushJob = await payload.findByID({
    collection: "pushJobs",
    id: job.data.pushJobId,
    depth: 0,
    overrideAccess: true,
  });

  if (!pushJob) {
    return { skipped: true, reason: "push-job-not-found" };
  }

  await markPushJobProcessing(payload, pushJob.id);

  const jobPayload =
    pushJob.payload && typeof pushJob.payload === "object" ? (pushJob.payload as PushJobPayload) : {};
  const channel = resolvePreferenceKey(pushJob.kind ?? "broadcast", jobPayload);
  const includeUserIds = new Set((jobPayload.includeUserIds ?? []).map(String));
  const excludeUserIds = new Set((jobPayload.excludeUserIds ?? []).map(String));
  const recipientRoles = new Set((jobPayload.recipientRoles ?? []).map((value) => value.trim()).filter(Boolean));
  const chunkSize = typeof pushJob.chunkSize === "number" && pushJob.chunkSize > 0 ? pushJob.chunkSize : 100;

  let page = 1;
  let sentCount = 0;
  let failedCount = 0;
  let lastError = "";
  let hasNextPage = true;

  while (hasNextPage) {
    const subscriptions = await payload.find({
      collection: "pushSubscriptions",
      depth: 1,
      limit: chunkSize,
      page,
      overrideAccess: true,
      where: {
        isActive: {
          equals: true,
        },
      },
    });

    for (const rawSubscription of subscriptions.docs as SubscriptionDocument[]) {
      if (
        !shouldSendToSubscription(rawSubscription, {
          channel,
          includeUserIds,
          excludeUserIds,
          recipientRoles,
        })
      ) {
        continue;
      }

      try {
        await webpush.sendNotification(
          {
            endpoint: rawSubscription.endpoint,
            keys: {
              p256dh: rawSubscription.keys?.p256dh ?? "",
              auth: rawSubscription.keys?.auth ?? "",
            },
          },
          JSON.stringify({
            title: jobPayload.title ?? "PMTL_VN",
            body: jobPayload.body ?? pushJob.message ?? "",
            url: pushJob.url ?? "/",
            tag: pushJob.tag ?? pushJob.kind ?? "pmtl",
            kind: pushJob.kind ?? "broadcast",
            metadata: jobPayload.metadata ?? {},
          }),
        );

        sentCount += 1;

        await payload.update({
          collection: "pushSubscriptions",
          id: rawSubscription.id,
          data: {
            lastSentAt: new Date().toISOString(),
            lastError: "",
            failedCount: 0,
          },
          overrideAccess: true,
        });
      } catch (error) {
        failedCount += 1;
        lastError = error instanceof Error ? error.message : "Push send failed";
        const statusCode =
          error && typeof error === "object" && "statusCode" in error ? Number(error.statusCode) : null;

        await payload.update({
          collection: "pushSubscriptions",
          id: rawSubscription.id,
          data: {
            lastError,
            failedCount: (rawSubscription.failedCount ?? 0) + 1,
            ...(statusCode === 404 || statusCode === 410 ? { isActive: false } : {}),
          },
          overrideAccess: true,
        });
      }
    }

    await updatePushJobProgress(payload, pushJob.id, {
      cursor: Math.min(page * chunkSize, subscriptions.totalDocs),
      sentCount,
      failedCount,
      ...(lastError ? { errorSummary: lastError } : {}),
    });

    page += 1;
    hasNextPage = subscriptions.hasNextPage;
  }

  if (lastError && sentCount === 0) {
    await failPushJob(payload, pushJob.id, lastError);
    return { sentCount, failedCount, status: "failed" };
  }

  await completePushJob(payload, pushJob.id);

  return { sentCount, failedCount, status: "completed" };
}

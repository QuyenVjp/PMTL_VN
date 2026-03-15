import type { Payload } from "payload";

import { buildModerationEmail } from "@/services/email-template.service";
import { enqueueEmailNotificationJob } from "@/services/queue.service";

type NotificationActor = {
  actorUserId?: string | number | null;
  actorDisplayName?: string | null;
};

type CreateInternalPushJobInput = {
  payload: Payload;
  kind: string;
  message: string;
  url?: string;
  tag?: string;
  recipientRoles: string[];
  includeUserIds?: Array<string | number>;
  excludeUserIds?: Array<string | number>;
  metadata?: Record<string, unknown>;
};

type ModerationAlertInput = NotificationActor & {
  payload: Payload;
  kind: "community-post" | "community-comment" | "guestbook" | "report";
  subject: string;
  message: string;
  url?: string;
  metadata?: Record<string, unknown>;
};

function uniqueStringArray(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))));
}

function uniqueUserIds(values: Array<string | number | null | undefined>) {
  return Array.from(
    new Set(
      values
        .filter((value): value is string | number => value !== null && value !== undefined)
        .map((value) => String(value)),
    ),
  );
}

export async function createInternalPushJob(input: CreateInternalPushJobInput) {
  const includeUserIds = uniqueUserIds(input.includeUserIds ?? []);
  const excludeUserIds = uniqueUserIds(input.excludeUserIds ?? []);
  const pushPayload = {
    title: "PMTL_VN CMS",
    body: input.message,
    recipientRoles: input.recipientRoles,
    includeUserIds,
    excludeUserIds,
    ...(input.metadata ? { metadata: input.metadata } : {}),
  };

  return input.payload.create({
    collection: "pushJobs",
    draft: false,
    data: {
      publicId: "",
      kind: input.kind,
      status: "queued",
      message: input.message,
      url: input.url ?? "",
      tag: input.tag ?? input.kind,
      payload: pushPayload,
    },
    overrideAccess: true,
  });
}

export async function notifyModerators(input: ModerationAlertInput) {
  const recipientRoles = ["moderator", "admin", "super-admin"];
  const excludeUserIds = uniqueUserIds([input.actorUserId]);

  await Promise.all([
    createInternalPushJob({
      payload: input.payload,
      kind: `moderation-${input.kind}`,
      message: input.message,
      ...(input.url ? { url: input.url } : {}),
      tag: `moderation-${input.kind}`,
      recipientRoles,
      excludeUserIds,
      ...(input.metadata ? { metadata: input.metadata } : {}),
    }),
    enqueueEmailNotificationJob(input.payload, {
      recipientRoles,
      excludeUserIds,
      subject: input.subject,
      text: input.message,
      html: buildModerationEmail({
        subject: input.subject,
        message: input.message,
        actionUrl: input.url ?? null,
      }),
    }),
  ]);
}

export async function notifyUserModerationDecision(input: {
  payload: Payload;
  targetUserId?: string | number | null;
  excludeUserIds?: Array<string | number>;
  subject: string;
  message: string;
  url?: string;
}) {
  const targetUserId = input.targetUserId ? String(input.targetUserId) : null;

  if (!targetUserId) {
    return null;
  }

  const resolvedExcludeUserIds = uniqueUserIds([...(input.excludeUserIds ?? []), targetUserId]).filter(
    (value) => value !== targetUserId,
  );

  const user = await input.payload.findByID({
    collection: "users",
    id: targetUserId,
    depth: 0,
    overrideAccess: true,
  }).catch(() => null);

  await createInternalPushJob({
    payload: input.payload,
    kind: "moderation-decision",
    message: input.message,
    ...(input.url ? { url: input.url } : {}),
    tag: "moderation-decision",
    recipientRoles: [],
    includeUserIds: [targetUserId],
    excludeUserIds: resolvedExcludeUserIds,
  });

  const email = typeof user?.email === "string" ? user.email.trim() : "";

  if (email) {
    await enqueueEmailNotificationJob(input.payload, {
      to: uniqueStringArray([email]),
      subject: input.subject,
      text: input.message,
      html: buildModerationEmail({
        subject: input.subject,
        message: input.message,
        actionUrl: input.url ?? null,
      }),
    });
  }

  return user;
}

import "server-only";

import { buildCMSUrl } from "@/lib/cms/client";

export const PUSH_NOTIFICATION_TYPES = [
  { value: "daily_chant", label: "Tu học hằng ngày" },
  { value: "content_update", label: "Kho nội dung" },
  { value: "event_reminder", label: "Sự kiện & lịch tu" },
  { value: "community", label: "Diễn đàn & phản hồi" },
] as const;

export type PushNotificationType = (typeof PUSH_NOTIFICATION_TYPES)[number]["value"];

export interface PushSubscriptionRecord {
  id?: number;
  documentId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  reminderHour?: number | null;
  reminderMinute?: number | null;
  timezone?: string | null;
  isActive?: boolean | null;
  failedCount?: number | null;
  lastError?: string | null;
  lastSentAt?: string | null;
  notificationTypes?: string[] | null;
  quietHoursStart?: number | null;
  quietHoursEnd?: number | null;
  user?: { id?: number; documentId?: string } | null;
}

export interface PushJobRecord {
  id?: number;
  documentId: string;
  kind: string;
  status: "pending" | "queued" | "processing" | "completed" | "failed";
  title: string;
  body: string;
  url?: string | null;
  tag?: string | null;
  payload?: Record<string, unknown> | null;
  cursor?: number | null;
  chunkSize?: number | null;
  targetedCount?: number | null;
  processedCount?: number | null;
  successCount?: number | null;
  failedCount?: number | null;
  invalidCount?: number | null;
  lastError?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}

type PayloadListResponse<T> = {
  docs: T[];
  totalDocs?: number;
};

type RawPushSubscription = {
  id?: number;
  publicId?: string | null;
  endpoint?: string | null;
  keys?: {
    p256dh?: string | null;
    auth?: string | null;
  } | null;
  timezone?: string | null;
  isActive?: boolean | null;
  failedCount?: number | null;
  lastError?: string | null;
  lastSentAt?: string | null;
  notificationPrefs?: {
    posts?: boolean | null;
    events?: boolean | null;
    community?: boolean | null;
  } | null;
  quietHours?: {
    from?: string | null;
    to?: string | null;
  } | null;
  user?:
    | {
        id?: number | null;
        publicId?: string | null;
      }
    | number
    | null;
};

type RawPushJob = {
  id?: number;
  publicId?: string | null;
  kind?: string | null;
  status?: PushJobRecord["status"] | null;
  message?: string | null;
  url?: string | null;
  tag?: string | null;
  payload?: Record<string, unknown> | null;
  cursor?: number | null;
  chunkSize?: number | null;
  sentCount?: number | null;
  failedCount?: number | null;
  errorSummary?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

const CMS_API_URL =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? "http://localhost:3001";
const CMS_TOKEN = (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN)?.trim() ?? "";

function buildHeaders(extra?: HeadersInit): HeadersInit {
  return {
    ...(CMS_TOKEN ? { Authorization: `Bearer ${CMS_TOKEN}` } : {}),
    "Content-Type": "application/json",
    ...(extra ?? {}),
  };
}

async function cmsAdminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(buildCMSUrl(path), {
    ...init,
    headers: buildHeaders(init.headers),
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : (payload as { error?: { message?: string } } | null)?.error?.message ??
          `CMS admin request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

function parseHour(value?: string | null): number | null {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) {
    return null;
  }

  return Number.parseInt(value.slice(0, 2), 10);
}

function parseMinute(value?: string | null): number | null {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) {
    return null;
  }

  return Number.parseInt(value.slice(3, 5), 10);
}

function mapPrefsToTypes(
  prefs?: RawPushSubscription["notificationPrefs"],
): PushSubscriptionRecord["notificationTypes"] {
  if (!prefs) {
    return ["community"];
  }

  const types: string[] = [];
  if (prefs.posts) {
    types.push("content_update");
  }
  if (prefs.events) {
    types.push("event_reminder");
  }
  if (prefs.community) {
    types.push("community");
  }

  return types.length > 0 ? types : ["community"];
}

function mapPushSubscription(record: RawPushSubscription): PushSubscriptionRecord {
  const user =
    record.user && typeof record.user === "object"
      ? {
          ...(typeof record.user.id === "number" ? { id: record.user.id } : {}),
          ...(typeof record.user.publicId === "string" ? { documentId: record.user.publicId } : {}),
        }
      : null;

  return {
    ...(typeof record.id === "number" ? { id: record.id } : {}),
    documentId: record.publicId ?? String(record.id ?? ""),
    endpoint: record.endpoint ?? "",
    p256dh: record.keys?.p256dh ?? "",
    auth: record.keys?.auth ?? "",
    timezone: record.timezone ?? null,
    isActive: record.isActive ?? true,
    failedCount: record.failedCount ?? 0,
    lastError: record.lastError ?? null,
    lastSentAt: record.lastSentAt ?? null,
    notificationTypes: mapPrefsToTypes(record.notificationPrefs),
    quietHoursStart: parseHour(record.quietHours?.from),
    quietHoursEnd: parseHour(record.quietHours?.to),
    reminderHour: null,
    reminderMinute: parseMinute(record.quietHours?.from),
    user,
  };
}

function mapPushJob(record: RawPushJob): PushJobRecord {
  const payload = record.payload ?? {};
  const title =
    typeof payload.title === "string" && payload.title.trim()
      ? payload.title.trim()
      : typeof record.kind === "string" && record.kind.trim()
        ? record.kind.trim()
        : "Thông báo";

  return {
    ...(typeof record.id === "number" ? { id: record.id } : {}),
    documentId: record.publicId ?? String(record.id ?? ""),
    kind: record.kind ?? "broadcast",
    status: record.status ?? "pending",
    title,
    body: record.message ?? "",
    url: record.url ?? null,
    tag: record.tag ?? null,
    payload,
    cursor: record.cursor ?? 0,
    chunkSize: record.chunkSize ?? 100,
    targetedCount: null,
    processedCount: record.sentCount ?? 0,
    successCount: record.sentCount ?? 0,
    failedCount: record.failedCount ?? 0,
    invalidCount: null,
    lastError: record.errorSummary ?? null,
    startedAt: record.startedAt ?? null,
    finishedAt: record.finishedAt ?? null,
    updatedAt: record.updatedAt ?? null,
    createdAt: record.createdAt ?? null,
  };
}

export async function fetchSubscriptionByEndpoint(endpoint: string): Promise<PushSubscriptionRecord | null> {
  const query = `/api/pushSubscriptions?where[endpoint][equals]=${encodeURIComponent(endpoint)}&limit=1&depth=0`;
  const result = await cmsAdminFetch<PayloadListResponse<RawPushSubscription>>(query, {
    method: "GET",
  });

  return result.docs?.[0] ? mapPushSubscription(result.docs[0]) : null;
}

export async function fetchPushStats() {
  return cmsAdminFetch<{ data: unknown }>(`/api/push/stats`, { method: "GET" });
}

export async function createPushJob(data: Record<string, unknown>) {
  const response = await cmsAdminFetch<RawPushJob>(`/api/pushJobs`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return { data: mapPushJob(response) };
}

export async function fetchPushJobByDocumentId(documentId: string): Promise<PushJobRecord | null> {
  const response = await cmsAdminFetch<PayloadListResponse<RawPushJob>>(
    `/api/pushJobs?where[publicId][equals]=${encodeURIComponent(documentId)}&limit=1&depth=0`,
    { method: "GET" },
  );

  return response.docs?.[0] ? mapPushJob(response.docs[0]) : null;
}

export async function fetchRecentNotifications(limit = 24) {
  try {
    const response = await cmsAdminFetch<PayloadListResponse<RawPushJob>>(
      `/api/pushJobs?where[status][equals]=completed&sort=-createdAt&limit=${Math.max(1, Math.min(100, limit))}&depth=0`,
      { method: "GET" },
    );

    return {
      data: (response.docs ?? []).map(mapPushJob),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[Push] fetchRecentNotifications fallback to empty list: ${message}`);
    return { data: [] };
  }
}

export async function fetchPushSubscriptionsPage(start: number, limit: number) {
  const page = Math.floor(start / limit) + 1;
  const response = await cmsAdminFetch<PayloadListResponse<RawPushSubscription>>(
    `/api/pushSubscriptions?where[isActive][equals]=true&sort=updatedAt&limit=${limit}&page=${page}&depth=0`,
    { method: "GET" },
  );

  return {
    data: (response.docs ?? []).map(mapPushSubscription),
    meta: {
      pagination: {
        total: response.totalDocs ?? 0,
      },
    },
  };
}

export function getLocalTimeInTimezone(timezone: string, now = new Date()): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");

  return {
    hour: Number.isFinite(hour) ? hour : 0,
    minute: Number.isFinite(minute) ? minute : 0,
  };
}

export function isNotificationTypeEnabled(subscription: PushSubscriptionRecord, kind: string): boolean {
  const types = subscription.notificationTypes ?? [];
  return Array.isArray(types) && types.includes(kind);
}

export async function queuePushJob(input: {
  kind: string;
  title: string;
  body: string;
  url?: string;
  tag?: string;
  payload?: Record<string, unknown>;
  chunkSize?: number;
}) {
  const response = await cmsAdminFetch<RawPushJob>(`/api/pushJobs`, {
    method: "POST",
    body: JSON.stringify({
      publicId: "",
      kind: input.kind,
      status: "pending",
      message: input.body,
      url: input.url ?? "/",
      tag: input.tag ?? input.kind,
      chunkSize: Math.max(1, Math.min(500, Number(input.chunkSize) || 100)),
      payload: {
        title: input.title,
        body: input.body,
        ...(input.payload ?? {}),
      },
    }),
  });

  return mapPushJob(response);
}

export { CMS_API_URL, cmsAdminFetch };

export const PUSH_NOTIFICATION_TYPES = [
  { value: 'daily_chant', label: 'Tu học hằng ngày' },
  { value: 'content_update', label: 'Kho nội dung' },
  { value: 'event_reminder', label: 'Sự kiện & lịch tu' },
  { value: 'community', label: 'Diễn đàn & phản hồi' },
] as const

export type PushNotificationType = (typeof PUSH_NOTIFICATION_TYPES)[number]['value']

export interface PushSubscriptionRecord {
  id?: number
  documentId: string
  endpoint: string
  p256dh: string
  auth: string
  reminderHour?: number | null
  reminderMinute?: number | null
  timezone?: string | null
  isActive?: boolean | null
  failedCount?: number | null
  lastError?: string | null
  lastSentAt?: string | null
  notificationTypes?: string[] | null
  quietHoursStart?: number | null
  quietHoursEnd?: number | null
  user?: { id?: number; documentId?: string } | null
}

export interface PushJobRecord {
  id?: number
  documentId: string
  kind: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  title: string
  body: string
  url?: string | null
  tag?: string | null
  payload?: Record<string, unknown> | null
  cursor?: number | null
  chunkSize?: number | null
  targetedCount?: number | null
  processedCount?: number | null
  successCount?: number | null
  failedCount?: number | null
  invalidCount?: number | null
  lastError?: string | null
  startedAt?: string | null
  finishedAt?: string | null
  updatedAt?: string | null
  createdAt?: string | null
}

const STRAPI_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')
const STRAPI_TOKEN = (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN) || ''

function buildHeaders(extra?: HeadersInit): HeadersInit {
  return {
    Authorization: `Bearer ${STRAPI_TOKEN}`,
    'Content-Type': 'application/json',
    ...(extra || {}),
  }
}

function buildUrl(path: string, query?: string): string {
  return `${STRAPI_URL}/api${path}${query ? `?${query}` : ''}`
}

export async function strapiAdminFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(buildUrl(path), {
    ...options,
    headers: buildHeaders(options.headers),
    cache: 'no-store',
  })

  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text().catch(() => '')

  if (!res.ok) {
    const message =
      typeof data === 'string'
        ? data
        : (data as Record<string, unknown> | null)?.error?.toString?.() ||
          (data as Record<string, unknown> | null)?.message?.toString?.() ||
          `Strapi admin request failed: ${res.status}`
    throw new Error(message)
  }

  return data as T
}

export async function fetchSubscriptionByEndpoint(endpoint: string): Promise<PushSubscriptionRecord | null> {
  const query =
    `filters[endpoint][$eq]=${encodeURIComponent(endpoint)}&pagination[limit]=1`
  const data = await strapiAdminFetch<{ data: PushSubscriptionRecord[] }>(`/push-subscriptions?${query}`, {
    method: 'GET',
  })

  return data.data?.[0] ?? null
}

export async function fetchPushStats() {
  return strapiAdminFetch<{ data: unknown }>('/push-subscriptions/stats', { method: 'GET' })
}

export async function createPushJob(data: Record<string, unknown>) {
  return strapiAdminFetch<{ data: PushJobRecord }>('/push-jobs', {
    method: 'POST',
    body: JSON.stringify({ data }),
  })
}

export async function updatePushJob(documentId: string, data: Record<string, unknown>) {
  return strapiAdminFetch<{ data: PushJobRecord }>(`/push-jobs/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  })
}

export async function fetchPushJobByDocumentId(documentId: string): Promise<PushJobRecord | null> {
  const data = await strapiAdminFetch<{ data: PushJobRecord }>(`/push-jobs/${documentId}`, {
    method: 'GET',
  })

  return data.data ?? null
}

export async function fetchNextPushJob(): Promise<PushJobRecord | null> {
  const query = [
    'filters[status][$in][0]=pending',
    'filters[status][$in][1]=processing',
    'sort[0]=createdAt:asc',
    'pagination[limit]=1',
  ].join('&')

  const data = await strapiAdminFetch<{ data: PushJobRecord[] }>(`/push-jobs?${query}`, {
    method: 'GET',
  })

  return data.data?.[0] ?? null
}

export async function fetchPushSubscriptionsPage(start: number, limit: number) {
  const query = [
    'filters[isActive][$eq]=true',
    `pagination[start]=${start}`,
    `pagination[limit]=${limit}`,
    'sort[0]=updatedAt:asc',
    'populate[user][fields][0]=id',
    'populate[user][fields][1]=documentId',
  ].join('&')

  return strapiAdminFetch<{ data: PushSubscriptionRecord[]; meta?: { pagination?: { total?: number } } }>(
    `/push-subscriptions?${query}`,
    { method: 'GET' }
  )
}

export async function fetchRecentNotifications(limit = 24) {
  const query = [
    'filters[status][$eq]=completed',
    'sort[0]=createdAt:desc',
    `pagination[limit]=${Math.max(1, Math.min(100, limit))}`,
  ].join('&')

  try {
    return await strapiAdminFetch<{ data: PushJobRecord[] }>(`/push-jobs?${query}`, { method: 'GET' })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn(`[Push] fetchRecentNotifications fallback to empty list: ${message}`)
    return { data: [] }
  }
}

export async function markSubscriptionDelivery(documentId: string, data: Record<string, unknown>) {
  return strapiAdminFetch(`/push-subscriptions/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  })
}

export function getLocalTimeInTimezone(timezone: string, now = new Date()): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now)

  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0')
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0')

  return {
    hour: Number.isFinite(hour) ? hour : 0,
    minute: Number.isFinite(minute) ? minute : 0,
  }
}

export function isNotificationTypeEnabled(subscription: PushSubscriptionRecord, kind: string): boolean {
  const types = subscription.notificationTypes ?? []
  return Array.isArray(types) && types.includes(kind)
}

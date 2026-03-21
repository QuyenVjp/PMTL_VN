# PUSH_NOTIFICATION_ARCHITECTURE — Web Push (VAPID) Design

File này chốt kiến trúc đầy đủ cho Web Push notifications ở Phase 2+.
Phase 1: endpoint tồn tại nhưng bị guard bởi feature flag `notification.push.enabled=false`.

> **Module map**: `08-notification/module-map.md`
> **Contracts**: `08-notification/contracts.md`
> **Outbox taxonomy**: `tracking/outbox-event-taxonomy.md`
> **Feature flag**: `coding-readiness.md` Phần 4

---

## Quyết định: Web Push (VAPID) — không dùng Firebase SDK trực tiếp

**Provider**: Web Push Protocol (W3C standard) via VAPID keys
**Library**: `web-push` npm package
**Rationale**:
- Không vendor lock-in (hoạt động với Chrome, Firefox, Edge, Safari 16.4+)
- Không cần Firebase account/billing
- Vietnamese users chủ yếu dùng Chrome/Firefox trên Android
- FCM (Firebase Cloud Messaging) là delivery backend phía sau Web Push API trên Android — transparent
- iOS Safari 16.4+: hỗ trợ Web Push (PWA, không cần App Store)

**Rejected alternative**: React Native push → không có native app, không áp dụng
**Rejected alternative**: Direct FCM SDK → vendor lock-in, phức tạp hơn cần thiết

---

## Phase trigger

Kích hoạt khi:
1. PWA được implement (Service Worker active)
2. Feature flag `notification.push.enabled=true`
3. VAPID keys đã được generate và set trong env
4. BullMQ + worker đã active (push delivery cần queue)

---

## Architecture

```
Member browser (PWA + Service Worker)
  → Subscribe to push: POST /api/notifications/push/subscribe
  → Store: push_subscriptions table (endpoint, keys)

Trigger (Calendar event published / Vow reminder due):
  → apps/api creates push_jobs record
  → Appends to outbox_events (notification.push_job.dispatched)
  → Dispatcher → pmtl:notification-push queue
  → Worker picks up job
  → web-push library sends to each subscription endpoint
  → Browser receives push → Service Worker shows notification
```

---

## VAPID key setup

```bash
# Generate VAPID keys (one-time, never rotate without user re-subscription)
npx web-push generate-vapid-keys

# Output:
# Public Key: <base64url>
# Private Key: <base64url>
```

Env vars:
```env
VAPID_PUBLIC_KEY=<base64url_public>
VAPID_PRIVATE_KEY=<base64url_private>
VAPID_SUBJECT=mailto:admin@pmtl.vn
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<base64url_public>  # Same public key, safe to expose
```

---

## Database schema

```prisma
model PushSubscription {
  id           Int      @id @default(autoincrement())
  publicId     String   @unique @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId       String   @db.Uuid
  endpoint     String   @unique  // Browser push endpoint URL
  p256dhKey    String            // Browser public key for encryption
  authKey      String            // Browser auth secret
  userAgent    String?           // Browser identification
  isActive     Boolean  @default(true)
  failureCount Int      @default(0)
  lastUsedAt   DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([userId])
  @@index([isActive])
}

model PushJob {
  id              Int        @id @default(autoincrement())
  publicId        String     @unique @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  jobType         String     // calendar.event.reminder | vow.reminder | moderation.alert
  title           String
  body            String
  url             String?    // Deep link on click
  icon            String?    // Notification icon URL
  targetScope     PushScope  // ALL | USER | ROLE
  targetUserId    String?    @db.Uuid  // When scope=USER
  targetRole      String?    // When scope=ROLE
  scheduledAt     DateTime
  status          PushJobStatus @default(PENDING)
  recipientCount  Int        @default(0)
  sentCount       Int        @default(0)
  failedCount     Int        @default(0)
  processedAt     DateTime?
  createdAt       DateTime   @default(now())
  createdBy       String     @db.Uuid

  @@index([status])
  @@index([scheduledAt])
}

enum PushScope { ALL USER ROLE }
enum PushJobStatus { PENDING PROCESSING COMPLETE FAILED CANCELLED }
```

---

## Service Worker requirements (apps/web)

```typescript
// apps/web/public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      data: { url: data.url },
      requireInteraction: false,
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
```

**IMPORTANT**: Service Worker scope must be `/` (root) to receive push events.

---

## Push delivery worker handler

```typescript
// apps/worker/src/handlers/push-delivery.handler.ts
// Handles pmtl:notification-push queue jobs

async handle(job: Job<PushJobPayload>) {
  const { pushJobPublicId } = job.data;
  const pushJob = await db.pushJob.findUnique({ where: { publicId: pushJobPublicId } });
  const subscriptions = await getTargetSubscriptions(pushJob);

  const results = await Promise.allSettled(
    subscriptions.map(sub => sendWebPush(sub, pushJob))
  );

  // Handle subscription expiry (410 Gone = unsubscribe)
  for (const [i, result] of results.entries()) {
    if (result.status === 'rejected' && result.reason?.statusCode === 410) {
      await deactivateSubscription(subscriptions[i].endpoint);
    }
  }

  await updatePushJobCounts(pushJobPublicId, results);
}
```

---

## Subscription lifecycle

| Event | Action |
|---|---|
| User subscribes | Create push_subscription record, audit log |
| User unsubscribes | Set isActive=false, audit log |
| Push returns 410 Gone | Auto-deactivate subscription (browser unsubscribed) |
| Push returns 429 | Back off, retry via BullMQ |
| failureCount > 5 | Auto-deactivate subscription |
| VAPID key rotation | Deactivate all subscriptions, users must re-subscribe |

---

## Notification types

| Type | Trigger | Recipient | Requires auth |
|---|---|---|---|
| `calendar.event.reminder` | 24h before event | All subscribers | Feature flag: `calendar.reminder.enabled` |
| `vow.reminder` | Vow milestone due date | Vow owner | Feature flag: `notification.push.enabled` |
| `moderation.alert` | New report submitted | Moderators | Always enabled when module active |
| `wisdom.bundle.ready` | Offline bundle rebuilt | Opted-in users | Feature flag: `wisdom.offline.enabled` |

---

## Admin push ops

Admin route: `/he-thong/thong-bao`

**List view**:
- DataTable: all push jobs with status, recipient count, sent/failed counts
- Filter: by status, type, date range
- Sort: by scheduledAt, status

**Detail view** (`$jobId`):
- Job metadata: type, title, body, target scope
- Delivery stats: sent, failed, pending
- Actions: Cancel (if PENDING), Redrive failed deliveries

**Create push job** (admin manual):
- Form: type, title, body, url, target scope, scheduled time
- Preview notification appearance

**Subscription stats**:
- Total active subscriptions
- Chart: new subscriptions per day (last 30 days)
- Breakdown by userAgent/browser

---

## Delivery observability

| Metric | Type | Alert |
|---|---|---|
| `pmtl_push_sent_total` | Counter | — |
| `pmtl_push_failed_total` | Counter | > 10% failure rate → warn |
| `pmtl_push_subscription_active_count` | Gauge | — |
| `pmtl_push_subscription_deactivated_total` | Counter | Spike → check VAPID key |
| `pmtl_push_job_processing_duration_seconds` | Histogram | p95 > 30s → warn |

---

## Search sync monitoring

> Note: search sync monitoring lives here as notification delivery is analogous.

| Metric | Type | Alert |
|---|---|---|
| `pmtl_search_sync_queue_depth` | Gauge | > 100 items stale > 5 min → warn |
| `pmtl_search_sync_failed_total` | Counter | > 5 failures → alert |
| `pmtl_search_index_last_updated` | Gauge | Stale > 1 hour → warn |
| `pmtl_search_fallback_active` | Gauge | 1 = SQL fallback active |

---

## Code locations

| Artifact | Location |
|---|---|
| Push service | `apps/api/src/modules/notification/push.service.ts` |
| Push controller | `apps/api/src/modules/notification/notification.controller.ts` |
| Push job delivery handler | `apps/worker/src/handlers/push-delivery.handler.ts` |
| Service Worker | `apps/web/public/sw.js` |
| Push subscription hook | `apps/web/src/hooks/use-push-subscription.ts` |
| PWA manifest | `apps/web/public/manifest.json` |

---

## Implementation proof criteria

| Check | Proof |
|---|---|
| Feature flag guards | `notification.push.enabled=false` → subscribe endpoint returns 403 |
| VAPID keys valid | `web-push` library validates keys on startup |
| Subscribe flow | Member subscribes → push_subscription record created |
| Test push delivery | Admin creates job → browser receives notification within 30s |
| 410 auto-deactivate | Simulate expired endpoint → subscription marked inactive |
| Unsubscribe flow | Member unsubscribes → subscription inactive, no more pushes |
| Stats visible in admin | Push job list shows correct sent/failed counts |

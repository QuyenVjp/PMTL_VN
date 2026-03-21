# OUTBOX_DISPATCHER_MODEL — Transactional Outbox + Dispatcher + Dead-letter

File này chốt thiết kế đầy đủ cho outbox pattern: schema, dispatcher cron, retry, dead-letter, redrive.
Phase 2+. Requires BullMQ + Valkey to be active first.

> **Event taxonomy**: `tracking/outbox-event-taxonomy.md` — which events go to outbox
> **BullMQ**: `baseline/bullmq-worker-architecture.md` — queue consumer design
> **Env vars**: `tracking/env-inventory.md` — OUTBOX_* group
> **Audit**: audit event `queue.job.dead_lettered` per `tracking/audit-policy.md`

---

## Phase trigger

Same as BullMQ — activate when side effect failure cost > complexity cost.
**Prerequisite**: BullMQ + Valkey both active.

---

## Transactional write pattern (MANDATORY)

Outbox event MUST be written in the **same Prisma `$transaction`** as canonical write:

```typescript
// CORRECT — outbox in same transaction
await prisma.$transaction(async (tx) => {
  const post = await tx.post.update({
    where: { publicId },
    data: { status: 'published', publishedAt: new Date() },
  });

  await tx.auditLog.create({ data: { /* ... */ } });

  await tx.outboxEvent.create({
    data: {
      eventId: crypto.randomUUID(),
      eventType: 'content.post.published',
      aggregateId: post.publicId,
      aggregateType: 'post',
      occurredAt: new Date(),
      actorUserId,
      correlationId: requestContext.requestId,
      payload: { postPublicId: post.publicId, title: post.title },
      status: 'PENDING',
    },
  });
});

// WRONG — outbox outside transaction (can be lost if transaction rolls back)
const post = await prisma.post.update({ ... });
await outboxService.append({ ... }); // ← not transactional
```

---

## outbox_events table schema

```prisma
model OutboxEvent {
  id            BigInt           @id @default(autoincrement())
  eventId       String           @unique @db.Uuid
  eventType     String           // e.g. 'content.post.published'
  aggregateId   String           // publicId of the entity
  aggregateType String           // e.g. 'post', 'vow', 'user'
  occurredAt    DateTime
  actorUserId   String?          @db.Uuid
  correlationId String?          @db.Uuid
  payload       Json
  status        OutboxEventStatus @default(PENDING)
  attempts      Int              @default(0)
  lastError     String?
  processedAt   DateTime?
  createdAt     DateTime         @default(now())

  @@index([status, createdAt])  // dispatcher query index
  @@index([eventType])
  @@index([aggregateId])
}

enum OutboxEventStatus {
  PENDING      // Awaiting dispatch
  DISPATCHED   // Enqueued to BullMQ
  FAILED       // Dispatch failed (< 3 attempts)
  DEAD         // Dead-lettered after 3 failed dispatch attempts
}
```

---

## Dispatcher design

The dispatcher is a **NestJS cron job** in `apps/api` (not in worker).
It bridges: Postgres `outbox_events` → BullMQ queues.

```typescript
// apps/api/src/platform/outbox/outbox-dispatcher.cron.ts

@Injectable()
export class OutboxDispatcherCron {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: QueueService,
    private readonly logger: PinoLogger,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS) // configurable via OUTBOX_POLL_INTERVAL_MS
  async dispatch(): Promise<void> {
    const events = await this.prisma.outboxEvent.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: parseInt(process.env.OUTBOX_BATCH_SIZE ?? '50'),
    });

    for (const event of events) {
      await this.dispatchOne(event);
    }
  }

  private async dispatchOne(event: OutboxEvent): Promise<void> {
    const queueName = this.resolveQueue(event.eventType);
    if (!queueName) {
      this.logger.warn({ action: 'outbox.dispatch.no_queue', eventType: event.eventType });
      return;
    }

    try {
      await this.queue.add(queueName, {
        outboxEventId: event.eventId,
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        payload: event.payload,
      });

      await this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: { status: 'DISPATCHED', processedAt: new Date() },
      });
    } catch (err) {
      const newAttempts = event.attempts + 1;
      const newStatus = newAttempts >= 3 ? 'DEAD' : 'FAILED';

      await this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: { status: newStatus, attempts: newAttempts, lastError: err.message },
      });

      if (newStatus === 'DEAD') {
        this.logger.error({ action: 'outbox.event.dead_lettered', eventId: event.eventId });
        await this.auditService.appendAsync({
          action: 'queue.job.dead_lettered',
          metadata: { eventId: event.eventId, eventType: event.eventType },
        });
      }
    }
  }
}
```

---

## Queue routing map

```typescript
// apps/api/src/platform/outbox/outbox-queue-router.ts
const OUTBOX_QUEUE_MAP: Record<string, string> = {
  'content.post.published':       'pmtl:search-sync',
  'content.post.unpublished':     'pmtl:search-sync',
  'content.post.deleted':         'pmtl:search-sync',
  'content.chant_item.published': 'pmtl:search-sync',
  'community.post.submitted':     'pmtl:outbox-dispatch',  // → moderation intake
  'community.guestbook.submitted':'pmtl:outbox-dispatch',  // → moderation queue
  'moderation.report.resolved':   'pmtl:outbox-dispatch',  // → notify author/reporter
  'moderation.content.hidden':    'pmtl:outbox-dispatch',
  'calendar.event.published':     'pmtl:notification-push',
  'calendar.event.updated':       'pmtl:calendar-advisory',
  'notification.push_job.dispatched': 'pmtl:notification-push',
  'vow.created':                  'pmtl:calendar-advisory',
  'vow.milestone.fulfilled':      'pmtl:notification-push',
  'wisdom.entry.published':       'pmtl:search-sync',
  'identity.user.blocked':        'pmtl:outbox-dispatch',  // → revoke all sessions
};
```

Events not in this map → `warn` log, no dispatch, status stays PENDING.

---

## Retry model

| Attempt | Action | Status after |
|---|---|---|
| 1 | Dispatch to BullMQ | `DISPATCHED` on success, `FAILED` on error |
| 2 (next cron) | Retry dispatch | `DISPATCHED` or `FAILED` |
| 3 | Final retry | `DISPATCHED` or `DEAD` |
| > 3 | No more retries | Stays `DEAD` |

**FAILED events** are retried by the next cron execution automatically (status = PENDING → picked up again).
Wait — actually FAILED status events are NOT PENDING. Let me fix this:

```typescript
// Dispatcher queries PENDING and FAILED events:
const events = await prisma.outboxEvent.findMany({
  where: {
    status: { in: ['PENDING', 'FAILED'] },
    attempts: { lt: 3 },
  },
  orderBy: { createdAt: 'asc' },
  take: batchSize,
});
```

---

## Dead-letter model

Dead events (`status = 'DEAD'`):
- Visible in admin: `GET /api/admin/outbox/dead-events`
- Admin can **redrive**: `POST /api/admin/outbox/dead-events/:eventId/redrive`
  - Resets status to PENDING, attempts to 0
  - Requires `admin+` role
  - Audit: `outbox.event.redriven`
- Admin can **discard**: `DELETE /api/admin/outbox/dead-events/:eventId`
  - Soft-delete: update status to cancelled
  - Requires `super-admin` role
  - Audit: `outbox.event.discarded`

---

## Phase 1 fallback behavior

When outbox is NOT enabled, events marked "outbox required" in taxonomy must use:

| Approach | When | Implementation |
|---|---|---|
| **Inline sync** | Fast side effect (< 200ms), single subscriber | Direct service call in same request |
| **Fire-and-forget with log** | Slow side effect, non-critical | `setImmediate(() => sideEffect().catch(logger.warn))` |

**NEVER** silently ignore "outbox required" events.
**NEVER** create empty outbox table just to "have it" — deferred means not activated.

---

## Monitoring

| Metric | Alert |
|---|---|
| `pmtl_outbox_pending_count` | > 500 for > 5 min → warn |
| `pmtl_outbox_dead_count` | > 0 → warn (events need attention) |
| `pmtl_outbox_dispatched_total` | — |
| `pmtl_outbox_dispatch_duration_seconds` | p95 > 1s → warn |

---

## Env vars

| Env | Default | Purpose |
|---|---|---|
| `OUTBOX_POLL_INTERVAL_MS` | `5000` | Dispatcher cron interval |
| `OUTBOX_BATCH_SIZE` | `50` | Max events per cron execution |

---

## Code locations

| Artifact | Location |
|---|---|
| Outbox module | `apps/api/src/platform/outbox/outbox.module.ts` |
| Outbox service | `apps/api/src/platform/outbox/outbox.service.ts` |
| Dispatcher cron | `apps/api/src/platform/outbox/outbox-dispatcher.cron.ts` |
| Queue router | `apps/api/src/platform/outbox/outbox-queue-router.ts` |
| Admin controller | `apps/api/src/platform/outbox/outbox-admin.controller.ts` |
| Prisma schema | `prisma/schema.prisma` — OutboxEvent model |

---

## Implementation proof criteria

| Check | Proof |
|---|---|
| Transactional write | Post publish → outbox_events row created in same transaction |
| Dispatcher picks up | PENDING event dispatched to BullMQ within 10s |
| Status transitions | PENDING → DISPATCHED confirmed in DB |
| Retry on failure | Forced failure → status=FAILED → retried on next cron |
| Dead-letter | 3 failures → status=DEAD, audit log entry |
| Redrive | Admin redrive → status=PENDING again, event dispatched |
| Phase 1 fallback | outbox disabled → inline sync runs and logs fire-and-forget |

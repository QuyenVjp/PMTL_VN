# BULLMQ_WORKER_ARCHITECTURE — Async Job Queue & Worker Design

File này chốt thiết kế đầy đủ cho BullMQ queue system và apps/worker process.
Requires Valkey to be enabled first. Phase 2+ only.

> **Valkey dependency**: `baseline/valkey-architecture.md`
> **Outbox dispatcher**: `baseline/outbox-dispatcher-model.md`
> **Env vars**: `tracking/env-inventory.md` — BULLMQ_*, WORKER_* groups
> **Phase trigger**: `baseline/infra.md`

---

## Phase trigger (exact)

Bật BullMQ + worker khi **ít nhất 1** điều kiện:

| Trigger | Measurement |
|---|---|
| Background work makes request > 2s | Pino logs showing route duration > 2000ms due to side effects |
| Manual retry not acceptable | Operator tired of manually re-triggering failed side effects |
| Fan-out to > 50 push recipients | Push delivery blocks request thread |
| Meilisearch reindex causing request timeout | Post-publish reindex slows publish API call |

**Prerequisite**: Valkey must be active (`VALKEY_URL` set and healthy).
Queue storage phải dùng split đúng theo `baseline/valkey-architecture.md`: cache/rate-limit ở DB 0, BullMQ ở DB 1. Không dùng chung DB mặc định cho queue và rate-limit nếu chưa chứng minh eviction policy an toàn.

---

## Architecture

```
apps/api (producer)
  → BullMQ Queue.add(jobName, data)
  → Valkey (queue storage, DB 1)

apps/worker (consumer — separate process, same codebase)
  → BullMQ Worker.process(jobName, handler)
  → Valkey (queue storage, DB 1)
  → Postgres (job result persistence, audit logs)
```

`apps/worker` is a **separate NestJS process** — not a separate package.
Entrypoint: `apps/worker/src/main.ts` (distinct from `apps/api/src/main.ts`)
Same monorepo, shares `packages/shared` schemas.

---

## Queue definitions

| Queue name (full) | Alias | Producer | Consumer handler | Concurrency |
|---|---|---|---|---|
| `pmtl:search-sync` | search-sync | Content/Wisdom publish events | `SearchSyncHandler` | 5 |
| `pmtl:notification-push` | notification-push | PushJobService | `PushDeliveryHandler` | 10 |
| `pmtl:outbox-dispatch` | outbox-dispatch | OutboxDispatcherCron | `OutboxDispatchHandler` | 5 |
| `pmtl:media-scan` | media-scan | StorageService (Phase 3) | `MediaScanHandler` | 3 |
| `pmtl:calendar-advisory` | calendar-advisory | Calendar event updates | `CalendarAdvisoryHandler` | 2 |
| `pmtl:dead-letter` | dead-letter | All failed jobs (auto) | Manual inspection only | 0 |

**Queue name convention**: `{BULLMQ_PREFIX}:{queue-slug}` — prefix from env.

---

## Job data schemas (Zod — in packages/shared)

```typescript
// packages/shared/src/schemas/queue-jobs.schema.ts

export const SearchSyncJobSchema = z.object({
  eventId: z.string().uuid(),
  eventType: z.string(),          // e.g. 'content.post.published'
  aggregateId: z.string(),        // publicId of the entity
  aggregateType: z.string(),      // e.g. 'post', 'wisdom_entry'
  occurredAt: z.string().datetime(),
});

export const NotificationPushJobSchema = z.object({
  pushJobPublicId: z.string().uuid(),
  jobType: z.string(),
  title: z.string(),
  body: z.string(),
  url: z.string().optional(),
  targetScope: z.enum(['ALL', 'USER', 'ROLE']),
  targetUserId: z.string().uuid().optional(),
  targetRole: z.string().optional(),
});

export const OutboxDispatchJobSchema = z.object({
  outboxEventId: z.string().uuid(),
  eventType: z.string(),
  aggregateId: z.string(),
  payload: z.record(z.unknown()),
});

export const CalendarAdvisoryJobSchema = z.object({
  triggerType: z.enum(['event_published', 'event_updated', 'lunar_override']),
  affectedDate: z.string().date().optional(),
  affectedUserIds: z.array(z.string().uuid()).optional(),
});
```

---

## Retry policy

```typescript
// Default job options applied to all queues
const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,  // 1s → 5s → 25s
  },
  removeOnComplete: { count: 100 },   // keep last 100 successful jobs
  removeOnFail: false,                 // keep failed jobs for inspection
};
```

**After 3 failures**: Job moves to dead-letter queue `pmtl:dead-letter`.
Dead-letter jobs are visible in admin (`/he-thong/queue-ops` — see below).

---

## Idempotency contract (required for all handlers)

Every job handler MUST implement idempotency:

```typescript
// Pattern: check-then-process with ON CONFLICT DO NOTHING
async handle(job: Job<SearchSyncJobData>) {
  const { eventId } = job.data;

  // Step 1: Check if already processed
  const alreadyProcessed = await prisma.processedJobLog.findUnique({
    where: { jobKey: `search-sync:${eventId}` }
  });
  if (alreadyProcessed) {
    logger.info({ action: 'queue.job.duplicate_skipped', eventId });
    return; // idempotent — safe to return success
  }

  // Step 2: Process job
  await performSearchSync(job.data);

  // Step 3: Mark as processed (ON CONFLICT DO NOTHING)
  await prisma.processedJobLog.upsert({
    where: { jobKey: `search-sync:${eventId}` },
    create: { jobKey: `search-sync:${eventId}`, processedAt: new Date() },
    update: {},
  });
}
```

**`processed_job_logs` table**:
```prisma
model ProcessedJobLog {
  id          Int      @id @default(autoincrement())
  jobKey      String   @unique   // "{queue}:{eventId}"
  processedAt DateTime @default(now())
  @@index([processedAt])
}
```

Cleanup: delete `processed_job_logs` older than 7 days (nightly cron).

---

## apps/worker entrypoint

```typescript
// apps/worker/src/main.ts
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();

  // Worker does NOT start HTTP server — processes queue only
  // Exception: health endpoint on separate port
  const health = app.get(WorkerHealthService);
  await health.startHttpServer(process.env.WORKER_PORT ?? 3002);
}
bootstrap();
```

**WorkerModule** imports:
- `ConfigModule` — env validation
- `LoggingModule` — Pino logger
- `ValkeyModule` — queue connection
- `PrismaModule` — DB access
- `SearchSyncWorkerModule`
- `PushDeliveryWorkerModule`
- `OutboxDispatchWorkerModule`
- `CalendarAdvisoryWorkerModule`

---

## Dead-letter queue handling

Failed jobs after 3 attempts land in `pmtl:dead-letter`.

Admin route (new): `GET /admin/he-thong/queue-ops`
- Lists dead-letter jobs with: queue, job data preview, failure reason, attempt count, last failed at
- Actions: **Redrive** (re-enqueue to original queue), **Discard** (remove permanently)
- Requires `admin+` role

Admin sidebar entry:
```typescript
{ title: 'Queue ops', url: '/he-thong/queue-ops', icon: GitBranch }
// Add to 'Hệ thống' nav group in ADMIN_ARCHITECTURE.md
```

Audit on redrive: `queue.job.redriven` with jobId, queue, actor.

---

## Worker Docker Compose

```yaml
# infra/docker/docker-compose.worker.yml (override file)
services:
  worker:
    build:
      context: .
      dockerfile: apps/worker/Dockerfile
    env_file: /etc/pmtl/secrets/.env.production
    depends_on:
      db:
        condition: service_healthy
      valkey:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3002/health/live"]
      interval: 30s
      timeout: 5s
      retries: 3
    restart: unless-stopped
```

---

## Graceful shutdown

Worker must drain in-progress jobs before shutdown:

```typescript
// BullMQ Worker graceful shutdown
const worker = new Worker(queueName, handler, { connection });

process.on('SIGTERM', async () => {
  logger.info('Worker received SIGTERM — draining active jobs');
  await worker.close(); // BullMQ waits for active jobs to complete
  await app.close();
  process.exit(0);
});
```

**Shutdown timeout**: 30s — if jobs don't complete, force-exit with warning.

---

## Monitoring

| Metric | Type | Alert |
|---|---|---|
| `pmtl_queue_depth{queue="search-sync"}` | Gauge | > 100 stale > 5 min |
| `pmtl_queue_processed_total{queue}` | Counter | — |
| `pmtl_queue_failed_total{queue}` | Counter | > 5 failures/10 min |
| `pmtl_queue_dead_letter_count` | Gauge | > 0 → warn |
| `pmtl_worker_active_jobs{queue}` | Gauge | — |

Worker exposes `/metrics` on port 3002 (separate from API port 3001).

---

## Rollback

```bash
# Disable BullMQ: stop worker process
docker compose stop worker

# Drain existing jobs (allow in-flight to complete)
# Then set feature flags to disable features that produce jobs

# App falls back to inline sync paths automatically
# No data loss for canonical DB writes
# Side effects (reindex, push) will need manual trigger or wait for next publish
```

---

## Code locations

| Artifact | Location |
|---|---|
| Worker entrypoint | `apps/worker/src/main.ts` |
| Worker module | `apps/worker/src/worker.module.ts` |
| Job schemas | `packages/shared/src/schemas/queue-jobs.schema.ts` |
| Queue producer service | `apps/api/src/platform/queue/queue.service.ts` |
| SearchSync handler | `apps/worker/src/handlers/search-sync.handler.ts` |
| PushDelivery handler | `apps/worker/src/handlers/push-delivery.handler.ts` |
| OutboxDispatch handler | `apps/worker/src/handlers/outbox-dispatch.handler.ts` |
| ProcessedJobLog model | `prisma/schema.prisma` — ProcessedJobLog |
| Docker Compose | `infra/docker/docker-compose.worker.yml` |

---

## Implementation proof criteria

| Check | Proof |
|---|---|
| Worker starts | `docker compose logs worker` shows all handlers registered |
| Job enqueued | `LLEN bull:pmtl:search-sync:wait` > 0 after content publish |
| Job processed | Handler log shows `queue.job.processed` within SLA |
| Idempotency | Send same job twice → second job skipped, log shows `duplicate_skipped` |
| Dead-letter | Force 3 failures → job appears in `pmtl:dead-letter` |
| Redrive works | Admin redrive → job re-processed successfully |
| Graceful shutdown | `docker stop worker` → in-flight jobs complete before exit |

# BULLMQ_WORKER_ARCHITECTURE — Async Job Queue & Worker Design

File này chốt thiết kế đầy đủ cho BullMQ queue system và apps/worker process.
Requires Valkey to be enabled first. Phase 2+ only.

> **Valkey dependency**: `design/02-platform-baseline/optional-scale/VALKEY_ARCHITECTURE.md`
> **Outbox dispatcher**: `design/02-platform-baseline/optional-scale/OUTBOX_DISPATCHER_MODEL.md`
> **Env vars**: `design/04-execution-overlay/repo/ENV_INVENTORY.md` — BULLMQ_*, WORKER_* groups
> **Phase trigger**: `design/02-platform-baseline/edge-delivery/INFRA_BASELINE.md`
> **Activation shortlist**: `design/04-execution-overlay/repo/BULLMQ_ACTIVATION_SHORTLIST.md`

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
Queue storage phải dùng split đúng theo `design/02-platform-baseline/optional-scale/VALKEY_ARCHITECTURE.md`: cache/rate-limit ở DB 0, BullMQ ở DB 1. Không dùng chung DB mặc định cho queue và rate-limit nếu chưa chứng minh eviction policy an toàn.

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

## Nest integration stance

- producers là Nest providers/services; không enqueue job trực tiếp từ controller như baseline.
- queue injection canon:
  - `@InjectQueue('<queue-alias>')` cho queue producer
  - `@InjectFlowProducer('<flow-name>')` cho flow producer
- queue/flow identity phải bám registration owner:
  - `BullModule.registerQueue(...)`
  - `BullModule.registerFlowProducer(...)`
- queue name trong code phải đi qua constants/owner registry; không hardcode lặp string ở nhiều service.
- `FlowProducer` chỉ dùng cho parent/child dependency graph thật sự; không lấy flow làm default cho mọi fan-out đơn giản.
- `QueueEvents` listener lane là hợp lệ cho cross-worker observability/admin status, nhưng không thay canonical job result state trong Postgres/audit tables.

### Producer anti-patterns

- controller gọi `queue.add()` trực tiếp
- service hardcode raw queue name string khắp codebase
- dùng `FlowProducer` cho job đơn lẻ không có dependency graph
- enqueue job mà không có job name/data schema/idempotency story rõ
- controller hoặc UI flow chờ queue events như source-of-truth thay cho handler result owner

## Connections stance

- BullMQ vẫn bám Redis-compatible backend qua connection owner của PMTL; queue path không tự tạo connection semantics riêng ngoài `VALKEY_ARCHITECTURE.md`.
- `Queue` và `Worker` được phép reuse connection owner khi phù hợp lifecycle, nhưng `QueueEvents` phải dùng blocking connection riêng; không cố reuse cùng kiểu producer connection cho event listener.
- producer-side connection phải fail nhanh hơn worker-side connection:
  - producer/add-job path không được treo vô thời hạn khi Valkey down
  - worker/consumer path được phép giữ persistent reconnect posture
- `maxRetriesPerRequest` policy:
  - producer-side queue client: finite/fast-fail budget
  - worker-side reused ioredis connection: `maxRetriesPerRequest = null` khi docs BullMQ yêu cầu cho background processing
- cấm dùng `ioredis keyPrefix`; BullMQ phải dùng prefix của chính nó (`BULLMQ_PREFIX` / queue prefix owner).
- queue backend bắt buộc giữ `noeviction`; nếu runtime không chứng minh được policy này ở queue DB/instance thì không được activate BullMQ.

### Connection anti-patterns

- dùng cùng blocking connection strategy cho `QueueEvents` và producer HTTP path
- để producer add-job request treo lâu vì retry policy kiểu worker
- bật BullMQ trên DB/instance chưa chứng minh `noeviction`
- dùng `keyPrefix` của ioredis chồng lên BullMQ prefix

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

## Queue pressure doctrine

- queue depth tự nó chưa đủ để kết luận incident
- queue pressure chỉ được coi là bất thường khi:
  - depth cao **và**
  - tuổi job lớn nhất (`queue age max`) vượt ngưỡng cho queue đó
- warmup grace:
  - bỏ qua spike ngắn trong `30 giây` đầu sau worker start
  - bỏ qua spike ngắn trong `60 giây` đầu sau bulk publish/reindex trigger hợp lệ

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

**Retry classification guidance**:
- network/transient downstream error → retry bình thường
- validation/business invariant error → đừng retry vô hạn; đi dead-letter sớm nếu handler xác định là non-retryable
- idempotency conflict do duplicate replay → log `duplicate_skipped`, không coi là failure
- retry/backoff/concurrency/rate-limit là queue-owner policy; producer không tự override ngẫu hứng nếu chưa có owner exception.

## Deduplication stance

- PMTL ưu tiên idempotency owner ở handler + `ProcessedJobLog`.
- BullMQ deduplication key là optional accelerator cho burst protection ở producer edge; không thay thế idempotent handler semantics.
- nếu dùng deduplication:
  - owner phải ghi rõ dedupe window/key
  - worker phải remove dedupe key theo đúng lifecycle khi docs yêu cầu
  - duplicated event chỉ là signal observability, không phải business success

## Scheduler / repeat stance

- repeatable APIs cũ không là baseline mới; nếu cần scheduled/repeat queue jobs, ưu tiên `Job Schedulers` line của BullMQ hiện tại.
- phase 2 của PMTL chưa mở broad recurring jobs qua BullMQ chỉ vì framework hỗ trợ; cron/scheduler phải bám `TASK_SCHEDULING_POLICY.md`.
- queue scheduler templates không được tự mang deduplication semantics mơ hồ làm hỏng cadence.

## Concurrency and limiter stance

- concurrency mặc định owner theo bảng queue definitions; không tăng chỉ vì queue depth cao mà chưa nhìn downstream budget.
- nếu downstream API có hard rate limit, queue owner được phép dùng limiter/rate-limit policy ở worker level, nhưng phải document rõ ngay trong queue owner section.
- attempts/backoff phải đi cùng classification retryable/non-retryable; không retry business invariant errors như transient network errors.
- `Global Concurrency` và `Global Rate Limit` không là baseline mặc định; chỉ mở khi nhiều worker instances cùng queue cần một shared cap thực sự.
- local worker concurrency là knob ưu tiên trước; global controls chỉ bật khi local scaling không còn đủ an toàn.

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

## Events and listeners

- local worker events (`completed`, `failed`, `progress`, `error`) phải được hook vào logger/metrics owner của worker.
- mọi worker phải có `error` listener; không để EventEmitter error làm worker chết im lặng.
- `QueueEvents` listener phù hợp cho:
  - global completed/failed/progress signals
  - admin queue ops surface
  - queue metrics aggregation
- `QueueEvents` không thay thế durable audit/job result persistence.
- event retention/trim phải có owner; nếu dùng `trimEvents`, đây là maintenance action có chủ đích, không chạy bừa.

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

Sau `30s`:
- log `error` kèm queue/job ids còn active
- process exit code `1`
- không tự mark completed giả
- BullMQ sẽ re-deliver/retry các job chưa hoàn tất khi worker khởi động lại

---

## Monitoring

| Metric | Type | Alert |
|---|---|---|
| `pmtl_queue_depth{queue="search-sync"}` | Gauge | > 100 **và** `pmtl_queue_age_max_seconds > 300` |
| `pmtl_queue_processed_total{queue}` | Counter | — |
| `pmtl_queue_failed_total{queue}` | Counter | > 5 failures/10 min |
| `pmtl_queue_dead_letter_count` | Gauge | > 0 → warn, > 500 → escalate |
| `pmtl_worker_active_jobs{queue}` | Gauge | — |
| `pmtl_queue_event_lag_seconds{queue}` | Gauge | > 30s on active queue → investigate |
| `pmtl_queue_deduplicated_total{queue}` | Counter | sudden spike → investigate duplicate producer behavior |

### Scaling guidance

- nếu queue depth > `500` trong `2` poll liên tiếp và queue age max tiếp tục tăng:
  - tăng concurrency qua env trước nếu handler còn IO-bound và DB/downstream budget cho phép
  - nếu concurrency đã gần ngưỡng an toàn thì scale thêm worker instance
- không tăng concurrency mù khi bottleneck là downstream API/DB; phải nhìn cùng lúc:
  - `pmtl_worker_active_jobs`
  - downstream latency
  - DB connection pressure

Worker exposes `/metrics` on port 3002 (separate from API port 3001).

## Production hardening stance

- activation chỉ hợp lệ khi queue DB/instance đã xác nhận:
  - `noeviction`
  - health/readiness green
  - metrics scrape path hoạt động
  - dead-letter/admin redrive path đứng được
- producer path phải có explicit failure contract khi Redis down; không giả vờ enqueue thành công.
- worker rollout phải ưu tiên graceful drain trước restart/stop.
- backlog lớn, dead-letter tăng, hay dedupe spike phải được coi là operational signal có owner; không để queue thành black box.

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

Dead-letter backlog không block canonical writes, nhưng backlog lớn phải được coi là operational debt có owner rõ; không được để queue-ops thành chỗ “để đó sau”.

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

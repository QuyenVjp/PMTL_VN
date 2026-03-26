# BULLMQ_IMPLEMENTATION_CANON

File này chốt `implementation canon` cho lane `BullMQ + apps/worker`.
Nó tồn tại để khi PMTL mở async lane, AI không tự bịa placement, connection policy, hay queue naming.

> Queue architecture owner: `design/02-platform-baseline/optional-scale/BULLMQ_WORKER_ARCHITECTURE.md`
> Activation shortlist: `design/04-execution-overlay/repo/BULLMQ_ACTIVATION_SHORTLIST.md`
> Valkey owner: `design/02-platform-baseline/optional-scale/VALKEY_ARCHITECTURE.md`
> Repo mapping: `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md`

---

## Placement canon

```txt
apps/api/src/platform/queue/
  queue.module.ts
  queue.constants.ts
  queue.service.ts
  queue.options.ts

apps/worker/src/
  main.ts
  worker.module.ts
  handlers/
  listeners/
  health/

packages/shared/src/schemas/
  queue-jobs.schema.ts
```

Rules:

- producer facade sống ở `apps/api/src/platform/queue/`
- consumer handlers sống ở `apps/worker/src/handlers/`
- queue/global listeners sống ở `apps/worker/src/listeners/`
- job schemas sống ở `packages/shared`

## Producer canon

Expected artifacts:

```txt
apps/api/src/platform/queue/queue.service.ts
apps/api/src/platform/queue/queue.constants.ts
apps/api/src/platform/queue/queue.options.ts
```

Rules:

- controller không gọi `queue.add()` trực tiếp
- producer service/facade là enqueue owner
- queue names + job names đi qua constants
- `@InjectQueue(...)` và `@InjectFlowProducer(...)` phải bám registration owner

## Worker canon

Expected artifacts:

```txt
apps/worker/src/main.ts
apps/worker/src/worker.module.ts
apps/worker/src/handlers/<job>.handler.ts
apps/worker/src/listeners/<queue>.events.ts
apps/worker/src/health/worker-health.service.ts
```

Rules:

- worker là Nest application context riêng
- có graceful shutdown owner rõ
- có health endpoint/metrics endpoint riêng khi active
- mọi worker phải có `error` listener

## Connection canon

- queue backend bám Valkey queue DB/instance riêng đã chứng minh `noeviction`
- producer connection phải fail-fast
- worker connection được phép persistent reconnect
- `QueueEvents` phải dùng blocking connection riêng
- cấm `ioredis keyPrefix`

## Handler canon

Expected shape per handler:

```txt
handlers/
  search-sync.handler.ts
  push-delivery.handler.ts
  outbox-dispatch.handler.ts
```

Rules:

- input validate bằng Zod schema trước khi xử lý
- handler phải idempotent
- duplicate replay phải log `duplicate_skipped`
- retryable vs non-retryable error classification phải rõ

## Persistence canon

Expected artifact:

```txt
prisma/schema.prisma  # ProcessedJobLog
```

Rules:

- `ProcessedJobLog` là idempotency proof baseline
- deduplication key của BullMQ chỉ là accelerator, không thay processed-log authority

## Events canon

Expected artifacts:

```txt
apps/worker/src/listeners/<queue>.events.ts
```

Rules:

- `QueueEvents` dùng cho observability/admin/global signals
- không dùng event stream làm business source-of-truth
- event trimming phải có owner, không trim bừa

## Scheduler canon

- scheduled/repeat jobs mới ưu tiên `Job Schedulers`
- không scaffold repeatable API cũ làm baseline mới
- cron/scheduling phải bám repo scheduling policy

## Naming canon

- queue full name: `{BULLMQ_PREFIX}:{queue-slug}`
- job name phải mô tả intent thật
- log actions:
  - `queue.job.enqueued`
  - `queue.job.started`
  - `queue.job.completed`
  - `queue.job.failed`
  - `queue.job.duplicate_skipped`
  - `queue.job.redriven`

## Must-exist artifacts before activation

- queue facade
- worker bootstrap
- Zod job schemas
- `ProcessedJobLog`
- dead-letter handling
- admin redrive path
- metrics/health evidence

## Must-not-do list

- controller gọi `queue.add()` trực tiếp
- hardcode queue names ở nhiều file
- `FlowProducer` cho job đơn lẻ
- activate BullMQ khi queue backend chưa `noeviction`
- dùng dedupe như thay thế cho idempotency
- worker không có graceful shutdown

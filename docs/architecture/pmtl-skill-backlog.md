# PMTL Skill Backlog Owner

File này là owner backlog cho các PMTL-native skills còn thiếu nhưng đã đủ tín hiệu để coi là `implementation-risk`.

Mục tiêu:

- chốt skill nào đáng tạo trước
- chốt boundary của từng skill để không bị trùng nhau
- chốt source-of-truth docs mà skill mới phải bám
- chặn việc mỗi task backend/runtime/security lại fallback ngẫu hứng

## Priority order

1. `pmtl-be-implementation`
2. `pmtl-api-contracts`
3. `pmtl-jobs-and-events`
4. `pmtl-observability-runtime`

## Why these four

- Repo đã đủ mạnh ở frontend/UI nhưng backend/runtime/security vẫn phải mượn skill ngoài.
- `design/` đã có đủ canon về NestJS boundary, API inventory, outbox/search/cache/health/deploy để làm base cho skill mới.
- Những lane này đang lặp lại thường xuyên trong task thực tế, nên tiếp tục dùng fallback thuần túy sẽ tạo drift.

## Skill specs backlog

### `pmtl-be-implementation`

**Purpose**
- Canonical PMTL skill cho NestJS service/controller/module/use-case delivery theo design-first direction.

**Owns**
- module placement trong `apps/api`
- controller vs service vs platform boundary
- DTO/Zod boundary usage
- write-path implementation shape từ `design/*/use-cases`
- auth/role guard placement ở API layer

**Does not own**
- deep API envelope canon riêng
- queue/outbox/worker orchestration sâu
- observability/runbook operations

**Primary source docs**
- `AGENTS.md`
- `design/DECISIONS.md`
- `design/baseline/nest-baseline.md`
- `design/baseline/platform-modules.md`
- `design/tracking/api-route-inventory.md`
- module-local `contracts.md`, `module-map.md`, `use-cases/*.md`

**Acceptance criteria**
- có section chuẩn PMTL skill
- có file-placement rules cho `apps/api`
- có anti-pattern list rõ
- có verification pairing với `pmtl-verify-quality-gate` và skill chuyên biệt khác khi cần

### `pmtl-api-contracts`

**Purpose**
- Canonical PMTL skill cho route groups, DTO shapes, error envelopes, status-code semantics, OpenAPI-facing consistency.

**Owns**
- route-level contract shaping
- error-envelope discipline
- list/single/created/accepted/empty profile usage
- auth scope semantics
- contract drift checks giữa `contracts.md`, route inventory, admin mapping, search/admin ops

**Does not own**
- NestJS module placement
- DB schema ownership
- worker/retry semantics

**Primary source docs**
- `design/baseline/nest-baseline.md`
- `design/tracking/api-route-inventory.md`
- `design/tracking/error-code-registry.md`
- module-local `contracts.md`
- `design/tracking/admin-page-api-mapping.md`

**Acceptance criteria**
- có route contract checklist
- có drift matrix giữa page/API/admin/search
- có fallback guidance cho generic API auditor tools

### `pmtl-jobs-and-events`

**Purpose**
- Canonical PMTL skill cho outbox, dispatcher, queue, worker, cron, idempotency, retry, dead-letter, replay.

**Owns**
- when to introduce async lane
- outbox vs inline sync decision
- idempotency key rules
- replay/redrive semantics
- worker payload validation
- queue/dead-letter boundaries

**Does not own**
- canonical business data schema
- frontend invalidation behavior
- observability dashboards beyond job/runtime essentials

**Primary source docs**
- `design/DECISIONS.md`
- `design/tracking/outbox-event-taxonomy.md`
- `design/baseline/outbox-dispatcher-model.md`
- `design/baseline/bullmq-worker-architecture.md`
- `design/06-search/meilisearch-architecture.md`
- module-local use-cases that mention outbox/retry/idempotency

**Acceptance criteria**
- có decision tree rõ: sync vs fire-and-forget vs outbox+queue
- có retry/dead-letter/idempotency checklist
- có worker contract examples đủ gần repo

### `pmtl-observability-runtime`

**Purpose**
- Canonical PMTL skill cho health, metrics, structured logs, deploy gates, rollback posture, incident-first runtime checks.

**Owns**
- `/health/*` contract usage
- metrics/log expectations
- deploy/rollback sanity checks
- scaling/load-balancer/runtime readiness checks
- incident-oriented runtime verification path

**Does not own**
- feature-level business logic
- DTO contracts
- queue business taxonomy

**Primary source docs**
- `design/ops/health-contract.md`
- `design/ops/deploy-runbook.md`
- `design/baseline/infra.md`
- `design/baseline/cache-topology.md`
- `design/baseline/security.md`
- `design/baseline/cicd-deploy-gates.md`

**Acceptance criteria**
- có incident triage path ngắn
- có explicit non-HA stance vs HA requirements
- có verification pairing với smoke/monitoring commands

## Current blockers and notes

### `pmtl-be-implementation`
- chưa có owner skill riêng, nhưng `design/` canon đã đủ để viết ngay

### `pmtl-api-contracts`
- nhiều module contracts vẫn còn depth không đồng đều; skill này nên ship cùng một batch route-profile examples

### `pmtl-jobs-and-events`
- repo runtime còn deferred ở nhiều lane; skill phải viết theo `activation by measured pain`, không được biến queue thành default

### `pmtl-observability-runtime`
- một phần runbook/runtime knowledge đang nằm rải giữa design docs và generic external skills; skill mới cần gom lại nhưng không duplicate full runbooks

## Implementation order

### Batch 1
- `pmtl-be-implementation`
- `pmtl-api-contracts`

### Batch 2
- `pmtl-jobs-and-events`
- `pmtl-observability-runtime`

## Rule

- Không tạo cả bốn skill trong một pass nếu chưa có enough examples/reference folders.
- Mỗi skill mới phải bám repo docs trước, rồi mới gọi generic fallback tools.
- Khi một skill mới được tạo, phải cập nhật cùng lúc:
  - `AGENTS.md`
  - `docs/architecture/skills-taxonomy.md`
  - `docs/agent-cheatsheet.md`

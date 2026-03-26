# Phase Activation Matrix

File này gom trigger của các component deferred để team không đọc rải rác nhiều root docs.
Không thay thế `DECISIONS.md`, `design/02-platform-baseline/edge-delivery/INFRA_BASELINE.md`, hay `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md`.
Nó chỉ bao phủ `deferred/planned/excluded activations`; full Phase 1 baseline vẫn do `DECISIONS.md` section 2 sở hữu.

> **Decision baseline**: `design/01-repo-constitution/DECISIONS.md`
> **Infra owner**: `design/02-platform-baseline/edge-delivery/INFRA_BASELINE.md`
> **Implementation mapping**: `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md`

| Tech | Default phase | Trigger | Dependency | Rollback cost | Owner |
|---|---|---|---|---|---|
| `Valkey` | Deferred | rate-limit Postgres path lock contention OR cache miss pain measured | Postgres baseline stable | medium | `design/02-platform-baseline/edge-delivery/INFRA_BASELINE.md` |
| `BullMQ` + `apps/worker` | Deferred | background work pushes request > 2s OR manual retry unacceptable | Valkey active + idempotency policy | high | `design/02-platform-baseline/optional-scale/BULLMQ_WORKER_ARCHITECTURE.md` |
| `outbox_events` + dispatcher | Deferred | side effect failure cost > complexity cost | BullMQ + Valkey active | high | `design/02-platform-baseline/optional-scale/OUTBOX_DISPATCHER_MODEL.md` |
| `Meilisearch` | Deferred by default | SQL search p95 vượt SLO public search trong `design/02-platform-baseline/deploy-ops/SLA_SLO.md`, multi-type search becomes core feature, hoặc project explicit chọn `Search-first launch` | BullMQ + Valkey active if using async sync path; không cần chúng nếu dùng launch profile direct-sync + SQL fallback | medium | `design/02-platform-baseline/optional-scale/MEILISEARCH_ARCHITECTURE.md` |
| `PgBouncer` | Deferred | db connections > 80% max_connections sustained | Postgres runtime evidence | medium | `design/02-platform-baseline/optional-scale/PGBOUNCER_STRATEGY.md` |
| Cloudflare R2 | Deferred | local disk > 70% OR restore drift > 5% OR multi-instance media needed | storage abstraction already live | high | `design/02-platform-baseline/optional-scale/R2_MIGRATION_PLAN.md` |
| Prometheus + Grafana + Alertmanager | Deferred | concrete metric/alert owner exists | health + logs + runbook already useful | low-medium | `design/02-platform-baseline/deploy-ops/OBSERVABILITY_ARCHITECTURE.md` |
| OpenTelemetry | Deferred | cross-service latency diagnosis needed | stable service boundaries + metric discipline | medium | `design/02-platform-baseline/deploy-ops/OBSERVABILITY_ARCHITECTURE.md` |
| `pgvector` | Explicit exclusion | only reconsider after Meilisearch stable 3+ months AND semantic use case measured | Meilisearch mature + use case proof | very high | `design/02-platform-baseline/optional-scale/PGVECTOR_DECISION.md` |

## Reading rule

- Trigger không có measurement thật thì chưa được bật.
- “Trông enterprise hơn” không phải trigger hợp lệ.
- Nếu rollback cost cao mà owner chưa rõ, feature đó chưa được activate.

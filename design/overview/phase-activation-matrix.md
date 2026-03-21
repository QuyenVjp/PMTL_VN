# Phase Activation Matrix

File này gom trigger của các component deferred để team không đọc rải rác nhiều root docs.
Không thay thế `DECISIONS.md`, `baseline/infra.md`, hay `tracking/implementation-mapping.md`.

> **Decision baseline**: `../DECISIONS.md`
> **Infra owner**: `../baseline/infra.md`
> **Implementation mapping**: `../tracking/implementation-mapping.md`

| Tech | Default phase | Trigger | Dependency | Rollback cost | Owner |
|---|---|---|---|---|---|
| `Valkey` | Deferred | rate-limit Postgres path lock contention OR cache miss pain measured | Postgres baseline stable | medium | `baseline/infra.md` |
| `BullMQ` + `apps/worker` | Deferred | background work pushes request > 2s OR manual retry unacceptable | Valkey active + idempotency policy | high | `baseline/bullmq-worker-architecture.md` |
| `outbox_events` + dispatcher | Deferred | side effect failure cost > complexity cost | BullMQ + Valkey active | high | `baseline/outbox-dispatcher-model.md` |
| `Meilisearch` | Deferred | SQL search p95 > 500ms OR multi-type search becomes core feature | BullMQ + Valkey active if using async sync path | medium | `06-search/meilisearch-architecture.md` |
| `PgBouncer` | Deferred | db connections > 80% max_connections sustained | Postgres runtime evidence | medium | `baseline/pgbouncer-strategy.md` |
| Cloudflare R2 | Deferred | local disk > 70% OR restore drift > 5% OR multi-instance media needed | storage abstraction already live | high | `baseline/r2-migration-plan.md` |
| Prometheus + Grafana + Alertmanager | Deferred | concrete metric/alert owner exists | health + logs + runbook already useful | low-medium | `baseline/observability-architecture.md` |
| OpenTelemetry | Deferred | cross-service latency diagnosis needed | stable service boundaries + metric discipline | medium | `baseline/observability-architecture.md` |
| `pgvector` | Explicit exclusion | only reconsider after Meilisearch stable 3+ months AND semantic use case measured | Meilisearch mature + use case proof | very high | `baseline/pgvector-decision.md` |

## Reading rule

- Trigger không có measurement thật thì chưa được bật.
- “Trông enterprise hơn” không phải trigger hợp lệ.
- Nếu rollback cost cao mà owner chưa rõ, feature đó chưa được activate.

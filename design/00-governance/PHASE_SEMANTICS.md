# Phase Semantics

File này chốt ngôn ngữ phase để tránh lẫn giữa `planned`, `deferred`, `phase_2 ready`, và `forbidden`.

## Phase Meanings

### `phase_1`

Là baseline bắt buộc cho first launch.

### `phase_2`

Là phần được phép kích hoạt khi có trigger rõ hoặc khi phase_1 đã ổn định.

### `phase_3`

Là lớp scale và quan sát nâng cao, không được mặc định kéo vào scaffold sớm.

### `all`

Áp dụng xuyên phase, thường là rule nền tảng.

## PMTL Practical Mapping

### Phase 1

- `apps/web`
- `apps/api`
- `apps/admin`
- Postgres
- storage abstraction + local disk adapter
- auth/session
- audit logs
- feature flags
- app-layer rate limit
- `/health/*`
- `/metrics`
- backup + restore discipline

### Phase 2

- Valkey
- BullMQ
- outbox dispatcher
- push notifications
- Meilisearch when guardrails are satisfied
- R2 migration path

### Phase 3

- OTEL
- Prometheus/Grafana/Alertmanager
- PgBouncer

## Guardrail

Không file phase_2 hoặc phase_3 nào được dùng để ngầm hợp thức hóa dependency trong phase_1 nếu chưa có trigger doc rõ và overlay tương ứng.

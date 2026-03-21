# Architecture At A Glance

File này là bản tóm tắt một trang cho người mới vào `design/`.
Nó không override root docs. Nó chỉ gom các quyết định đủ quan trọng để tránh đọc lệch phase.

> **Canonical decisions**: `../DECISIONS.md`
> **Implementation truth**: `../tracking/implementation-mapping.md`
> **Root ownership**: `../ROOT_DOC_OWNERSHIP.md`

---

## Current direction

- Product direction: `design-first rebuild`
- Runtime target:
  - `apps/web` — Next.js 16
  - `apps/api` — NestJS backend authority
  - `apps/admin` — Vite + React admin
- Source of truth:
  - `Postgres` for business data
  - `apps/api` for auth, write-paths, orchestration

---

## Phase 1 baseline

- `apps/web`
- `apps/api`
- `apps/admin`
- `Postgres`
- `Caddy`
- local storage abstraction + local disk adapter
- auth/session hardening
- upload hardening
- `audit_logs`
- `feature_flags`
- app-layer rate limit
- `/health/*`
- `/metrics`
- backup + restore discipline

---

## Deferred until measured pain

- `Valkey`
- `BullMQ`
- `apps/worker`
- `outbox_events`
- `Meilisearch`
- `PgBouncer`
- Prometheus / Grafana / Alertmanager
- tracing / OpenTelemetry

---

## Explicit exclusion

- `pgvector`

Không được coi `pgvector` là deferred thông thường. Chỉ xem xét lại khi trigger ở `baseline/pgvector-decision.md` được đáp ứng.

---

## Readiness semantics

| Label | Meaning | Owner doc |
|---|---|---|
| `design-ready` | design đủ rõ để bắt đầu implementation planning | `tracking/coding-readiness.md` |
| `implementation-ready` | artifact runtime cụ thể đã được map đủ để bắt đầu code module đó | `tracking/implementation-mapping.md` |
| `launch-ready` | launch blockers thật đã pass, gồm runtime evidence như restore drill | `README.md` + `tracking/implementation-mapping.md` |

**Rule**: không dùng `design-ready` để ám chỉ runtime đã tồn tại.

---

## Search and async contract

- Phase 1:
  - search mặc định là `Postgres-first`
  - side effects quan trọng dùng sync hoặc fire-and-forget có log
- Phase 2+:
  - nếu trigger đủ mạnh, search chuyển sang `Meilisearch`
  - nếu async reliability đủ đau, bật `outbox_events -> dispatcher -> queue -> worker`

**Không được** đọc doc Phase 2+ rồi suy ra Phase 1 đã mặc định queue/outbox-driven.

---

## Known operational risk

- Điểm yếu lớn nhất của Phase 1 là `local disk media`
- Các failure mode đã biết:
  - disk đầy
  - volume mount sai
  - DB/file drift sau restore

Muốn gọi là production-safe thì restore drill phải pass, không chỉ có docs.

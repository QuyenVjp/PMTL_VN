# PMTL Infrastructure Baseline (Nền tảng hạ tầng)

File này chốt infra baseline + phase triggers cho PMTL_VN.
Chỉ chứa những gì UNIQUE so với các file owner khác.

> **Security chi tiết**: `baseline/security.md`
> **Failure matrix**: `baseline/failure-modes.md`
> **Launch gate**: `README.md`
> **Decisions tổng**: `DECISIONS.md`
> **Startup order**: `baseline/startup-dependency-order.md`

---

## 6 Core Groups (Tóm tắt)

### 1. Business Layer

| Component | Chức năng | Phase |
|---|---|---|
| `apps/web` (Next.js 16) | Public + member frontend | Phase 1 |
| `apps/api` (NestJS) | Backend authority, auth, API | Phase 1 |
| `apps/admin` (Vite + React) | Admin UI (shadcn-admin) | Phase 1 |
| `apps/worker` | Background execution | Deferred |
| Caddy | Reverse proxy, SSL | Phase 1 |

### 2. Data Layer

| Component | Chức năng | Phase |
|---|---|---|
| Postgres | Source of truth, ACID | Phase 1 |
| Local disk + storage abstraction | Media/file current runtime | Phase 1 |
| Cloudflare R2 | Target media storage | Phase 2+ |
| Valkey | Cache + rate-limit + queue | Deferred |
| Meilisearch | Public search engine | Deferred |
| PgBouncer | Connection pooling | Deferred |
| pgvector | Semantic retrieval | Deferred |

**Local storage warning**: disk đầy, volume mount sai, restore lệch DB/file đều là failure mode thật. Phải coi là điểm yếu đã biết.

### 3. Boundary Validation

- Zod at boundaries (request, params, env, webhook, queue payload)
- Env contracts validate lúc boot
- Ref: `baseline/nest-baseline.md` cho pipeline chi tiết
- Ref: `DECISIONS.md` section 6 cho boundary rules

### 4. Observability

| Phase | Stack |
|---|---|
| Phase 1 | Pino structured logs + `/health/*` + `/metrics` + runbook + restore drills |
| Phase 2 | + Prometheus + Grafana + Alertmanager (khi có metric use case rõ) |
| Phase 3 | + OpenTelemetry + Tempo (khi cần trace cross-service) |

**Nguyên tắc**: alert không có người xử lý thì chưa bật. Dashboard không có câu hỏi cụ thể thì chưa làm.

### 5. Async Reliability

**Phase 1**: Sync hoặc fire-and-forget có log. Không cần outbox/queue.
**Phase 2+**: Outbox + dispatcher + BullMQ + worker khi side effect đủ quan trọng.

```
Phase 2 flow:
Canonical write → append outbox_events (same tx) → dispatcher → execution queue → worker (idempotent)
```

Ref: `tracking/outbox-event-taxonomy.md` cho taxonomy đầy đủ.

### 6. External Services

| Service | Chức năng | Phase |
|---|---|---|
| SendGrid / SMTP | Email delivery | Phase 1 |
| Firebase / Web Push | Push notifications | Phase 2+ |
| Cloudflare (free) | DNS + CDN + edge SSL | Phase 1 |
| Off-site backup | Snapshot ngoài VPS | Phase 1 |

---

## Current Production Fit

Single VPS baseline:

```
Caddy → apps/web + apps/api + apps/admin
         ↓
       Postgres (source of truth)
       Local disk (media via storage abstraction)
       Pino logs + /health/* + /metrics
```

Cloudflare đứng trước Caddy cho CDN/SSL/edge protection.

---

## Request Flows (Unique — chỉ ở đây)

### Homepage Load
```
User → Caddy → apps/web → server-side fetch → apps/api → Postgres → render
```

### Search Query
```
User → apps/web → /api/proxy/search → apps/api
  Phase 1: Postgres SQL/tsvector query
  Phase 2+: Meilisearch (fallback SQL nếu down)
→ Unified SearchDocumentDto → render results
```

### Editor Publish Post
```
Editor → apps/admin → POST /api/content/posts/:id/publish → apps/api
  → Prisma $transaction: update status + audit log
  Phase 1: sync revalidate
  Phase 2+: outbox → dispatcher → reindex + notify + revalidate
→ Success response
```

### Slow Request Diagnosis
```
1. Pino logs (requestId, route, duration)
2. /health/* endpoints
3. Disk/RAM/DB status
4. Phase 2+: Prometheus → Grafana dashboards
5. Phase 3+: OpenTelemetry traces
```

---

## Production Minimum Commands

```bash
# Health
curl https://api.pmtl.vn/health/live
curl https://api.pmtl.vn/health/ready
curl https://api.pmtl.vn/health/startup

# Logs (Docker Compose)
docker compose logs -f api --tail 100
docker compose logs -f web --tail 100

# Backup
./scripts/backup-db.sh        # pg_dump → compressed → off-site
./scripts/verify-backup.sh     # Check backup exists + integrity

# Restore
./scripts/restore-db.sh <backup_file>    # Restore to isolated env
./scripts/verify-restore.sh              # Boot app + smoke test
```

---

## Phase Triggers (Khi nào bật component optional)

| Component | Trigger condition | Ref |
|---|---|---|
| Valkey | Cache miss rate > threshold HOẶC rate-limit Postgres table too slow | `DECISIONS.md` section 3 |
| BullMQ + Worker | Side effect làm request chậm > 2s HOẶC retry manual không chấp nhận được | `tracking/outbox-event-taxonomy.md` |
| Outbox | Business event failure cost > complexity cost | `tracking/outbox-event-taxonomy.md` |
| Meilisearch | Search là core feature + SQL performance không đủ | `06-search/unified-index-mapping.md` |
| PgBouncer | Connection exhaustion measured | `baseline/failure-modes.md` |
| Prometheus stack | Có metric + alert use case cụ thể | N/A |
| pgvector | Related-content / recommendation feature cần | N/A |

---

## Dependency Hygiene

- Package mới phải có lý do tồn tại
- Audit dependency định kỳ + CVE review
- Ref: `DECISIONS.md` section 14 cho library choices đã chốt

---

## TL;DR

**Phase 1**: Postgres + NestJS + Caddy + local storage abstraction + Pino logs + security baseline + backup/restore = hệ sống được.

Mọi thứ khác chỉ bật khi có pain thật. `operational simplicity > technical elegance`.

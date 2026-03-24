# HEALTH_CONTRACT — Health Endpoint Specification

File này chốt contract cụ thể cho từng health endpoint.
Đây là nguồn sự thật cho Docker healthcheck, load balancer probe, và deploy gate.

> **Full observability design**: `baseline/observability-architecture.md`
> **Startup order**: `baseline/startup-dependency-order.md`
> **Deploy runbook**: `ops/deploy-runbook.md`

---

## Endpoint summary

| Endpoint | Purpose | Auth | Docker healthcheck |
|---|---|---|---|
| `GET /health/live` | Process alive? | None | Primary healthcheck |
| `GET /health/ready` | Ready for traffic? | None | Readiness probe |
| `GET /health/startup` | Startup complete? | None | Startup probe |

**Port**: Same as API port (default 3001).
**Exposure rule**:
- canonical deploy gate inside host/container network = direct `http://localhost:3001/health/*`
- external HTTPS probing via `https://api.pmtl.vn/health/*` is allowed for deploy gate and uptime monitoring when Caddy explicitly proxies these endpoints
- health endpoints are read-only operational probes, not admin diagnostics; extended system detail stays behind admin auth via `/api/admin/system/health-extended`
**Caddy rule**:
- `@health path /health/*` → `reverse_proxy api:3001`
- if exposed publicly, only `/health/live`, `/health/ready`, `/health/startup` are allowed
- do not expose queue internals, disk paths, migration SQL, or other sensitive diagnostics on these public probe routes

---

## `GET /health/live`

**Purpose**: Is the Node.js process alive and not in a fatal error state?

**Checks**:
- Node.js event loop responsive (implicit — if this endpoint responds, process is alive)
- No unhandled fatal exceptions in last boot cycle
- NestJS application initialized (not mid-startup)

**Does NOT check**: Database, external services, migrations

**Response 200 (pass)**:
```json
{
  "status": "ok",
  "uptime": 3621.4,
  "timestamp": "2026-03-21T10:00:00.000Z"
}
```

**Response 503 (fail)**:
```json
{
  "status": "error",
  "reason": "Application not initialized",
  "timestamp": "2026-03-21T10:00:00.000Z"
}
```

**Docker healthcheck config**:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/health/live"]
  interval: 30s
  timeout: 5s
  retries: 3
  start_period: 15s
```

---

## `GET /health/ready`

**Purpose**: Is the app ready to accept and correctly process requests?

**Activation rule**:
- baseline checks luôn chạy cho phase 1
- optional dependency chỉ được coi là `required` khi feature path chính đã activate thật sự
- nếu env/config của optional dependency không hiện diện và feature chưa activate, check phải hiện `skipped` hoặc không xuất hiện; đây là `not activated`, không phải incident
- nếu feature đã route qua dependency đó nhưng env/config bắt buộc thiếu hoặc dependency unhealthy, `/health/ready` phải trả `503`

**Operational definition of activated**:
- `Valkey` = `VALKEY_URL` hiện diện **và** ít nhất một path chính đang route qua Valkey (`RATE_LIMIT_STORE=valkey`, cache path đã bật thật, hoặc BullMQ active)
- `Meilisearch` = `SEARCH_ENGINE=meilisearch` **và** `MEILISEARCH_URL` hiện diện
- chỉ có env var mà chưa route traffic/feature sang dependency đó thì chưa tính là `activated`

**Checks (always)**:
1. **Postgres connectivity**: `SELECT 1` within 2s timeout
2. **Pending migrations**: `prisma migrate status` — must be 0 pending migrations
3. **Feature flags table**: `SELECT COUNT(*) FROM feature_flags` — table must be readable
4. **Audit log write path**: append-safe probe hoặc equivalent writeability check for `audit_logs`
5. **Storage adapter readiness**:
   - `local`: `LOCAL_STORAGE_ROOT` exists and write probe succeeds
   - `r2`: credentials present and lightweight provider health check succeeds

**Checks (when activated)**:
6. **Valkey connectivity** (when `VALKEY_URL` set and rate-limit/cache/queue path is routed to Valkey): `PING` → `PONG` within 500ms
7. **Meilisearch health** (when `SEARCH_ENGINE=meilisearch` and `MEILISEARCH_URL` set): `GET /health` → `{"status":"available"}`

**Ready decision rule**:
- `/health/ready` chỉ trả `200` khi:
  - mọi baseline check đều `ok`
  - và mọi optional dependency đã `activated` đều `ok`
- `audit` và `storage` là baseline launch-blocker checks; fail ở đây cũng làm readiness fail
- bất kỳ dependency optional nào ở trạng thái `not_activated` hoặc `skipped` không làm fail readiness
- bất kỳ dependency optional nào đã `activated` nhưng `error` hoặc `timeout` đều làm `/health/ready` trả `503`
- không có khái niệm `partially ready for traffic` ở public readiness probe phase 1; partial state chỉ được phản ánh ở payload/admin health page

**Response 200 (all checks pass)**:
```json
{
  "status": "ok",
  "checks": {
    "postgres": { "status": "ok", "latencyMs": 4 },
    "migrations": { "status": "ok", "pendingCount": 0 },
    "featureFlags": { "status": "ok", "count": 9 },
    "audit": { "status": "ok", "latencyMs": 3 },
    "storage": { "status": "ok", "adapter": "local", "latencyMs": 2 },
    "valkey": { "status": "ok", "latencyMs": 1 },
    "meilisearch": { "status": "ok", "latencyMs": 12 }
  },
  "timestamp": "2026-03-21T10:00:00.000Z"
}
```

**Response 503 (any check fails)**:
```json
{
  "status": "error",
  "checks": {
    "postgres": { "status": "error", "reason": "Connection timeout after 2000ms" },
    "migrations": { "status": "ok", "pendingCount": 0 },
    "featureFlags": { "status": "skipped" },
    "audit": { "status": "ok", "latencyMs": 4 },
    "storage": { "status": "error", "reason": "LOCAL_STORAGE_ROOT not writable" }
  },
  "timestamp": "2026-03-21T10:00:00.000Z"
}
```

**Timeout policy**: Each individual check has 2s timeout. Total endpoint timeout: 5s.
**On timeout**: Return 503 with check that timed out marked as `"status": "timeout"`.

**Startup/readiness timing note**:
- `start_period=15s` chỉ là baseline cho phase 1 khi chỉ cần Postgres + platform modules
- nếu activation path đã kéo thêm dependency nặng lúc boot, deploy owner phải tăng startup grace period tương ứng thay vì giữ mặc định một cách mù quáng

**Deploy gate usage**:
```bash
curl -f http://localhost:3001/health/ready || exit 1
curl -f https://api.pmtl.vn/health/ready || exit 1
```

---

## `GET /health/startup`

**Purpose**: Have all platform modules completed their initialization sequence?

`/health/startup` chỉ track **11 baseline platform modules** từ `baseline/startup-dependency-order.md`.
Optional phase-2+ services như `Valkey`, `Meilisearch`, `BullMQ`, `apps/worker` không chen vào danh sách này; nếu đã activate thì report ở phần riêng như `optionalServices`.

**Checks**:
Verifies all platform modules initialized (in startup order):
1. `ConfigModule` — env validated
2. `LoggingModule` — Pino configured
3. `ErrorsModule` — global exception filter registered
4. `ValidationModule` — ZodValidationPipe registered globally
5. `SessionsModule` — session table accessible
6. `FeatureFlagsModule` — flags loaded and evaluated
7. `RateLimitModule` — rate_limit_records table accessible
8. `StorageModule` — storage adapter initialized, root path accessible
9. `AuditModule` — audit_logs table writable
10. `HealthModule` — this module (self)
11. `MetricsModule` — counters initialized

**Response 200 (startup complete)**:
```json
{
  "status": "ok",
  "modules": {
    "config": "initialized",
    "logging": "initialized",
    "errors": "initialized",
    "validation": "initialized",
    "sessions": "initialized",
    "featureFlags": "initialized",
    "rateLimit": "initialized",
    "storage": "initialized",
    "audit": "initialized",
    "health": "initialized",
    "metrics": "initialized"
  },
  "optionalServices": {
    "valkey": "not_activated",
    "meilisearch": "not_activated"
  },
  "startupDurationMs": 1243,
  "timestamp": "2026-03-21T10:00:00.000Z"
}
```

**Response 503** (startup in progress or failed):
```json
{
  "status": "starting",
  "modules": {
    "config": "initialized",
    "logging": "initialized",
    "sessions": "pending"
  },
  "optionalServices": {},
  "timestamp": "2026-03-21T10:00:00.000Z"
}
```

**Startup timeout**: If startup not complete within 30s → mark `StorageModule` or blocking module as `failed`.

**State mapping**:
- critical baseline module `failed` hoặc `pending` sau timeout → `/health/startup` trả `503`
- critical baseline module `failed` → `/health/ready` cũng phải trả `503`
- optional service `not_activated` không làm fail startup
- optional service `activated` nhưng unhealthy làm `/health/ready` fail khi traffic thực sự đang route qua nó

---

## Internal admin health dashboard (`/he-thong/health`)

## Admin dashboard aggregate (`GET /api/admin/system/dashboard-stats`)

`GET /api/admin/system/dashboard-stats` là admin home aggregate route cho `/admin/dashboard`.
Nó không phải generic metrics dump và không được devolve thành 4 query fan-out ở page bootstrap.

Response owner là `AdminDashboardPageDto` với shape tối thiểu:

```json
{
  "systemSummary": {
    "healthStatus": "ok",
    "pendingAlertsCount": 0,
    "openIncidentsCount": 0
  },
  "pendingModeration": {
    "pendingReportsCount": 3,
    "recentReports": []
  },
  "recentAuditEvents": [
    {
      "occurredAt": "2026-03-21T10:00:00.000Z",
      "action": "content.publish",
      "resourceType": "post",
      "actorSummary": {
        "publicId": "usr_123",
        "displayNameMasked": "P***",
        "role": "admin"
      }
    }
  ],
  "contentOpsSummary": {
    "publishedPostsCount": 120,
    "draftPostsCount": 8,
    "recentlyUpdatedCount": 5
  },
  "searchOpsSummary": {
    "requestedEngine": "meilisearch",
    "actualEngine": "sql-fallback",
    "pendingJobs": 0,
    "bootstrapFallbackActive": true
  }
}
```

Rules:

- route này là admin page aggregate, không thay detail/list route của từng module owner.
- `recentAuditEvents[]` chỉ dùng safe mini projection; full detail vẫn ở `/api/admin/audit-logs`.
- `pendingModeration` là summary card/mini-list, không phải full report table.
- `contentOpsSummary` và `searchOpsSummary?` là operational summaries ổn định cho dashboard card/panel.
- dashboard page không được bootstrap bằng cách gọi trực tiếp posts list, moderation reports list, và audit log list rồi tự ghép nếu aggregate route này đã tồn tại.
- nếu một widget cần chi tiết sâu hơn dashboard aggregate, nó phải mở workspace owner route riêng sau khi user điều hướng, không ép home page thành cross-module explorer.

Admin page shows:
- Live health status (polls `/health/ready` every 30s)
- System metrics summary:
  - Uptime
  - Memory usage (`process.memoryUsage()`)
  - CPU usage (sampled)
  - Disk usage (via `df` system call)
  - Active DB connections
  - Pending outbox events count
  - Queue depths (when BullMQ active)

**Implementation**: Admin SPA calls `GET /api/admin/system/health-extended` (admin-only route):
```typescript
// Extended health info not exposed publicly
{
  "uptime": 86400,
  "memoryUsageMb": 245,
  "cpuUsagePercent": 12,
  "diskUsagePercent": 34,
  "dbConnectionCount": 8,
  "pendingOutboxCount": 0,
  "featureFlagsCount": 9,
  "recentErrors": [
    {
      "occurredAt": "2026-03-21T10:00:00.000Z",
      "module": "identity",
      "action": "auth.refresh",
      "errorCode": "auth.refresh_reused",
      "requestId": "req_123"
    }
  ]  // Max 5 entries, safe projection only
}
```

`recentErrors` projection rules:

- không trả raw message text, stack trace, token, cookie, Authorization header, hoặc internal metadata chưa sanitize
- chỉ trả field đủ để admin biết lane nào đang lỗi và tra cứu tiếp bằng requestId
- full raw logs chỉ xem qua ops path hoặc log tail, không expose qua endpoint admin này

---

## Health check failure runbook

### `/health/live` returns 503
```
1. Check Docker container status: docker compose ps
2. Check startup logs: docker compose logs api --tail 50
3. Look for: env validation failure, DB connection at boot, port conflict
4. Action: docker compose restart api
5. If persists: check VPS resources (OOM, disk full)
```

### `/health/ready` returns 503 — postgres check failing
```
1. Check DB container: docker compose ps db
2. Check DB logs: docker compose logs db --tail 20
3. Test connection: docker compose exec db pg_isready -U pmtl
4. Action: docker compose restart db
5. If data loss suspected: DO NOT restart — follow backup-restore.md
```

### `/health/ready` returns 503 — pending migrations
```
1. Run: docker compose exec api npx prisma migrate status
2. Review pending migration files
3. Run manually if safe: docker compose exec api npx prisma migrate deploy
4. If migration destructive and uncertain: revert to previous deploy
```

### `/health/ready` returns 503 — Valkey check failing
```
1. Check Valkey container: docker compose ps valkey
2. Test: docker compose exec valkey redis-cli PING
3. Action: docker compose restart valkey
4. Fallback: app auto-falls back to Postgres rate-limit table
```

---

## Code locations

| Artifact | Location |
|---|---|
| Dashboard aggregate | `apps/api/src/platform/health/controllers/dashboard.controller.ts` hoặc platform controller tương đương |
| Health module | `apps/api/src/platform/health/health.module.ts` |
| Live controller | `apps/api/src/platform/health/controllers/live.controller.ts` |
| Ready controller | `apps/api/src/platform/health/controllers/ready.controller.ts` |
| Startup controller | `apps/api/src/platform/health/controllers/startup.controller.ts` |
| Extended health | `apps/api/src/platform/health/controllers/extended.controller.ts` |
| Admin health page | `apps/admin/src/routes/_authenticated/he-thong/health/index.tsx` |

---

## Implementation proof criteria

| Check | Proof |
|---|---|
| `/health/live` responds | `curl http://localhost:3001/health/live` returns 200 + JSON |
| `/health/ready` checks DB | Stop DB → /health/ready returns 503 with postgres check failing |
| `/health/startup` tracks modules | Log shows all 11 modules initialized before startup endpoint returns ok |
| Docker healthcheck works | `docker inspect <container>` shows `healthy` status |
| Deploy gate uses ready | CD pipeline script exits if ready check fails |
| Admin health page loads | `/he-thong/health` shows live data |

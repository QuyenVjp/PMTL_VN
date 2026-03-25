# OBSERVABILITY_ARCHITECTURE (Kiến trúc giám sát)

File này chốt thiết kế đầy đủ cho observability stack từ Phase 1 đến Phase 3.
Mọi quyết định ở đây là binding — không được tự ý bật layer nặng trước khi đạt phase trigger.

> **Infra ref**: `baseline/infra.md`
> **Failure modes**: `baseline/failure-modes.md`
> **SLO targets**: `baseline/sla-slo.md`

---

## Phase 1 — Logging + Health + Metrics endpoint (REQUIRED BEFORE LAUNCH)

### Phase 1 external monitors (required before public production launch)

- external uptime monitor như `Uptime Kuma` hoặc equivalent phải check:
  - public site
  - admin URL
  - `GET /health/live`
  - `GET /health/ready`
  - SSL expiry
- error tracking như `Sentry` hoặc equivalent nên bật sớm cho web/api/admin nếu team cần thấy production exceptions nhanh hơn log tail
- các tool này không thay `/health/*` và structured logs; chúng chỉ thêm visibility ngoài host

### Pino structured logging

Owner: `apps/api` — mọi log phải qua `nestjs-pino`.

**Bắt buộc per request:**
```json
{
  "level": "info",
  "requestId": "req_abc123",
  "route": "POST /api/auth/login",
  "method": "POST",
  "statusCode": 200,
  "durationMs": 45,
  "actorUserId": "usr_xyz",
  "module": "identity",
  "action": "auth.login"
}
```

**Log level policy:**
| Level | Khi nào dùng |
|---|---|
| `fatal` | App không thể boot, unrecoverable crash |
| `error` | Exception được xử lý nhưng request thất bại, DB down |
| `warn` | Recoverable issue: fallback activated, missing file, rate-limit hit |
| `info` | Normal request lifecycle, business event milestones |
| `debug` | Disabled trên production |
| `trace` | Disabled hoàn toàn |

**KHÔNG bao giờ log:**
- Passwords, raw tokens, refresh tokens
- Secret env values
- Raw client IP nếu policy dùng hash
- CSRF tokens

**Pino hardening bắt buộc:**
- Bật `redact` cho các path nhạy cảm như `req.headers.authorization`, `req.headers.cookie`, `*.password`, `*.token`, `*.refreshToken`
- Dùng custom serializers cho `req`, `res`, và `err` — không log raw object nguyên khối
- Mọi logger factory phải fail-closed với redact list mặc định; không để từng module tự chọn có redact hay không

**Nest binding rules:**
- Nest system logs và request logs phải hội tụ về cùng `nestjs-pino` pipeline
- bootstrap chỉ được dùng logger fallback ngắn trước khi DI logger sẵn sàng; steady-state authority vẫn là injected logger path
- health/Terminus/custom infra logger nếu tồn tại vẫn phải bám chung redact/context policy này
- không tạo logger thứ hai với format/schema khác chỉ cho một module “cho tiện grep”

**Request context rules:**
- mỗi request phải giữ ổn định:
  - `requestId`
  - `module`
  - `action`
  - `route`
- async handoff hoặc background follow-up phải carry `correlationId` nếu còn liên hệ với request gốc
- nếu không xác định được actor hợp lệ, log `actorUserId = null`; không tự bịa actor từ raw cookie/session object

**Log file rotation** (Docker + JSON):
- Stdout/stderr → Docker logging driver
- Rotation: `max-size=100m, max-file=5` trong docker-compose
- Aggregation: tail with `docker compose logs -f api | grep "requestId"` hoặc tool ngoài (Phase 2)

### Managed-surface observability rule

Bài học nên lấy là: observability phải bám `product primitives`, không chỉ bám infra.

PMTL phải nhìn thấy ít nhất các surface sau như first-class observability objects:

- auth/session lifecycle
- storage/upload lifecycle
- webhook deliveries + callback verification
- search engine mode + fallback
- background job / outbox retries khi Phase 2+ bật
- admin operations có side-effect

Rules:

- request log không đủ để coi một primitive là observable
- mỗi primitive quan trọng phải có `structured business-event log` + `metric` + `degraded state` hoặc `admin status surface`
- nếu một managed dependency nằm sau `apps/api`, observability vẫn phải bám boundary của PMTL thay vì coi dependency đó là hộp đen

### AI-friendly log schema reference

Khi agent hoặc dev thêm log, tối thiểu phải map được về shape này:

```json
{
  "level": "info|warn|error|fatal",
  "timestamp": "ISO8601",
  "requestId": "req_*|job_*",
  "module": "identity|content|search|platform|...",
  "action": "domain.action",
  "statusCode": 200,
  "durationMs": 45,
  "actorUserId": "usr_*|null",
  "correlationId": "corr_*|null"
}
```

Notes:

- public route vẫn phải có `requestId`
- async job/outbox flow phải có `job_*` hoặc `correlationId` để nối với request khởi phát khi có
- không log raw `authorization`, `cookie`, `password`, `token`, `refreshToken`, hay secret env values

---

### Health endpoints — contract đầy đủ

Owner: `apps/api/src/platform/health/`

#### `GET /health/live`
- **Mục đích**: Container còn sống? (Kubernetes liveness probe equivalent)
- **Check**: App process còn chạy + không có fatal startup error
- **Không check**: DB, external services
- **Response (pass)**:
```json
{ "status": "ok", "timestamp": "2026-03-21T10:00:00Z" }
```
- **Response (fail)**: HTTP 503 nếu app không bootstrap xong
- **Auth**: public (không cần auth — Docker healthcheck gọi)
- **Caddy rule**: chỉ expose nội bộ, không expose public nếu không cần

#### `GET /health/ready`
- **Mục đích**: App sẵn sàng nhận traffic?
- **Nguồn sự thật chi tiết**: `design/ops/health-contract.md`
- **Checks baseline bắt buộc**:
  - Postgres connection: `SELECT 1` phải thành công
  - Migration state: pending migrations = 0
  - Feature flags table: readable
  - audit log write path writable
  - storage adapter readiness pass
- **Checks khi dependency đã activate thật sự**:
  - Valkey ping
  - Meilisearch `/health`
- **Response (pass)**:
```json
{
  "status": "ok",
  "checks": {
    "postgres": { "status": "ok" },
    "migrations": { "status": "ok", "pendingCount": 0 },
    "featureFlags": { "status": "ok" },
    "audit": { "status": "ok" },
    "storage": { "status": "ok" },
    "valkey": { "status": "ok" }
  },
  "timestamp": "2026-03-21T10:00:00Z"
}
```
- **Response (fail)**: HTTP 503 với failed check list
- **Auth**: public (load balancer/orchestrator gọi)

#### `GET /health/startup`
- **Mục đích**: App đã startup xong chưa? (Kubernetes startup probe equivalent)
- **Nguồn sự thật chi tiết**: `design/ops/health-contract.md`
- **Check**: All 11 baseline platform modules initialized theo `baseline/startup-dependency-order.md`; optional services report riêng ở `optionalServices`
- **Response**: không dùng lại shape tối giản của `/health/live`; phải trả module-by-module startup state
- **Auth**: public

---

### `/metrics` endpoint — Phase 1 minimum

Owner: `apps/api/src/platform/metrics/`
Format: Prometheus text exposition format (even without Prometheus — scrape-ready)
Auth: **Internal only** — Caddy không expose ra internet

**Required counters/gauges (Phase 1):**

| Metric name | Type | Labels | Description |
|---|---|---|---|
| `http_requests_total` | Counter | `method, route, status_code` | Total HTTP requests |
| `http_request_duration_seconds` | Histogram | `method, route` | Request latency |
| `http_errors_total` | Counter | `route, error_code` | HTTP 4xx/5xx |
| `auth_login_attempts_total` | Counter | `result: success/fail` | Login attempts |
| `auth_rate_limit_hits_total` | Counter | `endpoint` | Rate limit activations |
| `upload_attempts_total` | Counter | `result: success/fail/rejected` | Upload attempts |
| `upload_bytes_total` | Counter | `file_type` | Bytes uploaded |
| `db_query_duration_seconds` | Histogram | `operation` | DB query latency |
| `feature_flag_evaluations_total` | Counter | `flag_key, result` | Flag checks |
| `search_requests_total` | Counter | `endpoint, engine, user_agent_class, status_code` | Search/crawl pressure visibility |
| `search_request_duration_seconds` | Histogram | `endpoint, engine, user_agent_class` | Distinguish human vs crawler pressure |
| `search_fallback_total` | Counter | `reason, from_engine, to_engine, route` | Visibility for bootstrap/timeout/health fallback |
| `search_query_rejected_total` | Counter | `reason, route, user_agent_class` | Query guard pressure |
| `search_engine_mode` | Gauge | `requested_engine, actual_engine` | Current runtime mode |
| `search_index_freshness_seconds` | Gauge | `source` | Staleness / sync lag |
| `search_reindex_jobs_total` | Counter | `source, status, trigger_type` | Reindex volume and outcome |
| `search_reindex_job_duration_seconds` | Histogram | `source, status` | Reindex duration |

**Impl**: `prom-client` npm package (Prometheus compatible). NestJS custom metrics provider.

### Search fallback logging contract

Contract này chỉ áp dụng khi `Meilisearch` được bật:
- Phase 2+ bình thường
- hoặc `Search-first launch` ở Phase 1

Nếu launch đang ở chế độ SQL-only search, có thể bỏ qua fallback logging này vì không có engine fallback thực sự.

Khi search route không chạy đúng engine được yêu cầu, log tối thiểu:

```json
{
  "level": "warn",
  "requestId": "req_abc123",
  "module": "search",
  "action": "search.fallback_to_sql",
  "route": "GET /api/search",
  "requestedEngine": "meilisearch",
  "actualEngine": "sql-fallback",
  "reason": "bootstrap|timeout|health|manual-disable|index-stale",
  "durationMs": 1820,
  "queryHash": "sha256:...",
  "userAgentClass": "verified_crawler|anonymous_browser|authenticated_member|unknown_bot"
}
```

**Rule**:
- không log raw query text
- mọi fallback event phải có `requestedEngine`, `actualEngine`, `reason`
- bootstrap fallback và runtime fallback phải dùng cùng field names để admin/search ops đọc cùng một ngôn ngữ

---

## Phase 2 — Prometheus + Grafana + Alertmanager

### Phase trigger
- Có specific metric use case cần dashboard
- Manual log tail không còn đủ để diagnose incidents trong < 10 min
- Team size > 1 người cần shared visibility

### Architecture

```
apps/api /metrics → Prometheus (scrape every 15s)
                    → Grafana (dashboards)
                    → Alertmanager (alerts → on-call)
```

### Prometheus config
```yaml
# infra/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'pmtl-api'
    static_configs:
      - targets: ['api:3001']
    metrics_path: '/metrics'

  - job_name: 'pmtl-worker'
    static_configs:
      - targets: ['worker:3002']
    metrics_path: '/metrics'
```

### Grafana dashboards (required at phase 2)
1. **API Overview**: request rate, error rate, latency p50/p95/p99
2. **Auth Dashboard**: login attempts, rate-limit hits, session count
3. **Upload Dashboard**: upload count, file types, rejection rate
4. **DB Dashboard**: query latency, connection count, slow queries
5. **Search Dashboard**: search query count, latency, fallback rate
6. **Queue Dashboard** (when BullMQ enabled): queue depth, processed, failed, dead-letter

### Alertmanager rules (required at phase 2)
```yaml
# infra/alertmanager/alerts.yml
groups:
  - name: pmtl-critical
    rules:
      - alert: APIDown
        expr: up{job="pmtl-api"} == 0
        for: 1m
        severity: critical
        message: "apps/api is down"

      - alert: HighErrorRate
        expr: rate(http_errors_total{status_code=~"5.."}[5m]) > 1
        for: 2m
        severity: warning
        message: "Error rate above threshold"

      - alert: DBConnectionHigh
        expr: db_connection_count > 80
        for: 5m
        severity: warning
        message: "DB connections high — consider PgBouncer"

      - alert: OutboxPendingHigh
        expr: outbox_pending_count > 500
        for: 5m
        severity: warning
        message: "Outbox has > 500 pending events"

      - alert: SearchFallbackActive
        expr: increase(search_fallback_total[10m]) > 10
        severity: warning
        message: "Meilisearch fallback active — check search service"
```

> Dùng `search_fallback_total` để khớp đúng metric Phase 1 ở trên. `search_fallback_used_count` không có owner canon.

**Alert delivery**: Email (SMTP already configured) + Telegram/Zalo webhook (optional)

### Infra components
- Docker Compose service: `prometheus`, `grafana`, `alertmanager`
- File: `infra/docker/docker-compose.monitoring.yml` (separate override)
- Port exposure: all internal only; Caddy proxies `/grafana/*` for admin access
- Data persistence: named volumes `prometheus_data`, `grafana_data`

### Env vars (Phase 2)
| Env | Required | Purpose |
|---|---|---|
| `PROMETHEUS_ENABLED` | no | Enable Prometheus scrape endpoint |
| `GRAFANA_ADMIN_PASSWORD` | yes (when enabled) | Grafana admin password |
| `ALERTMANAGER_WEBHOOK_URL` | no | Alert delivery webhook |
| `ALERTMANAGER_EMAIL_FROM` | yes (when enabled) | Alert sender email |
| `ALERTMANAGER_EMAIL_TO` | yes (when enabled) | Alert recipient(s) |

---

## Phase 3 — OpenTelemetry + Distributed Tracing

### Phase trigger
- Cross-service latency issue that logs alone cannot diagnose
- Worker + API latency correlation needed
- Team needs trace-level visibility for incident investigation

### Architecture

```
apps/api + apps/worker
  → OpenTelemetry SDK (auto-instrument NestJS)
  → OTEL Collector
  → Tempo (trace storage)
  → Grafana (trace UI via Tempo datasource)
```

### Trace instrumentation requirements
- Auto-instrument: HTTP requests, DB queries (Prisma), BullMQ jobs
- Manual spans: audit writes, outbox dispatch, search sync
- Correlation: `traceId` must flow into Pino log context (structured field)
- Propagation: W3C TraceContext headers between API → Worker

### Required spans per trace
| Span | When |
|---|---|
| `http.server` | Every request |
| `db.query` | Every Prisma query |
| `queue.produce` | Every BullMQ enqueue |
| `queue.consume` | Every job execution |
| `outbox.dispatch` | Every outbox event dispatch |
| `search.query` | Every search request |
| `storage.upload` | Every file upload |

### Env vars (Phase 3)
| Env | Required | Purpose |
|---|---|---|
| `OTEL_ENABLED` | no | Enable OTEL SDK |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | yes (when enabled) | OTEL Collector endpoint |
| `OTEL_SERVICE_NAME` | yes (when enabled) | Service name in traces |

### Rollback Phase 3
- Set `OTEL_ENABLED=false` — SDK disables itself, no traces sent
- No runtime impact when disabled

---

## Metric naming convention

All custom metrics follow: `pmtl_{module}_{noun}_{unit_or_type}`

Examples:
- `pmtl_auth_login_attempts_total`
- `pmtl_search_query_duration_seconds`
- `pmtl_upload_bytes_total`
- `pmtl_outbox_pending_count`
- `pmtl_queue_depth_count{queue="search-sync"}`

## Product-primitives dashboard minimum

Khi bật dashboard thực sự, không dừng ở infra-only charts.
Tối thiểu phải có panel riêng cho:

- auth: login success/fail, refresh failures, revoke/logout-all spikes
- storage/media: signed upload issued, upload rejects, delete auth rejects, storage lifecycle cleanup
- search: request volume, fallback, rejected query, engine mode
- webhook/platform callbacks: accepted, rejected signature, replay block, retry count
- admin operations: publish, moderation decision, reindex trigger, feature-flag changes

---

## Code locations

| Component | Location |
|---|---|
| Health module | `apps/api/src/platform/health/health.module.ts` |
| Metrics module | `apps/api/src/platform/metrics/metrics.module.ts` |
| Prometheus config | `infra/prometheus/prometheus.yml` |
| Grafana dashboards | `infra/grafana/dashboards/*.json` |
| Alertmanager rules | `infra/alertmanager/alerts.yml` |
| OTEL bootstrap | `apps/api/src/platform/telemetry/otel.ts` |

---

## Implementation proof criteria

| Component | Proof |
|---|---|
| Phase 1 health | All 3 endpoints return 200 and correct shape |
| Phase 1 metrics | `curl /metrics` returns Prometheus text with required counters |
| Phase 2 Prometheus | Prometheus UI shows `pmtl-api` job healthy, metrics scraped |
| Phase 2 Grafana | API Overview dashboard shows live data |
| Phase 2 Alertmanager | Test alert fires and delivery confirmed |
| Phase 3 OTEL | Grafana Explore shows traces with DB spans correlated to request logs |

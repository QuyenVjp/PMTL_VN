# OBSERVABILITY_ARCHITECTURE (Kiến trúc giám sát)

File này chốt thiết kế đầy đủ cho observability stack từ Phase 1 đến Phase 3.
Mọi quyết định ở đây là binding — không được tự ý bật layer nặng trước khi đạt phase trigger.

> **Infra ref**: `baseline/infra.md`
> **Failure modes**: `baseline/failure-modes.md`
> **SLO targets**: `baseline/sla-slo.md`

---

## Phase 1 — Logging + Health + Metrics endpoint (REQUIRED BEFORE LAUNCH)

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

**Log file rotation** (Docker + JSON):
- Stdout/stderr → Docker logging driver
- Rotation: `max-size=100m, max-file=5` trong docker-compose
- Aggregation: tail with `docker compose logs -f api | grep "requestId"` hoặc tool ngoài (Phase 2)

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
- **Checks bắt buộc**:
  - Postgres connection: `SELECT 1` phải thành công
  - Migration state: pending migrations = 0
  - Feature flags table: readable
- **Checks khi enabled**:
  - Valkey ping (khi VALKEY_URL set)
  - Meilisearch `/health` (khi MEILI_HOST set)
- **Response (pass)**:
```json
{
  "status": "ok",
  "checks": {
    "postgres": "ok",
    "migrations": "up-to-date",
    "featureFlags": "ok",
    "valkey": "ok"
  },
  "timestamp": "2026-03-21T10:00:00Z"
}
```
- **Response (fail)**: HTTP 503 với failed check list
- **Auth**: public (load balancer/orchestrator gọi)

#### `GET /health/startup`
- **Mục đích**: App đã startup xong chưa? (Kubernetes startup probe equivalent)
- **Check**: All platform modules initialized (config, logger, DB, feature-flags, rate-limit, storage, audit, sessions)
- **Response**: Same shape as /health/live
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

**Impl**: `prom-client` npm package (Prometheus compatible). NestJS custom metrics provider.

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
        expr: increase(search_fallback_used_count[10m]) > 10
        severity: warning
        message: "Meilisearch fallback active — check search service"
```

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

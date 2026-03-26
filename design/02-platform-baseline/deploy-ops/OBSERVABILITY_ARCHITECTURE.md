# OBSERVABILITY_ARCHITECTURE (Kiến trúc giám sát)

> **Valkey runtime drill**: `design/02-platform-baseline/deploy-ops/VALKEY_RUNTIME_DRILL.md`

File này chốt thiết kế đầy đủ cho observability stack từ Phase 1 đến Phase 3.
Mọi quyết định ở đây là binding — không được tự ý bật layer nặng trước khi đạt phase trigger.

> **Infra ref**: `design/02-platform-baseline/edge-delivery/INFRA_BASELINE.md`
> **Failure modes**: `design/02-platform-baseline/security-runtime/FAILURE_MODES.md`
> **SLO targets**: `design/02-platform-baseline/deploy-ops/SLA_SLO.md`

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

### Sentry stance (recommended, not baseline authority)

- nếu bật `Sentry`, DSN phải tách theo boundary:
  - web
  - api
  - admin
- SDK init phải chạy sớm nhất có thể ở bootstrap path của từng app, trước route/middleware chính của app đó.
- `sendDefaultPii` không là baseline mặc định của PMTL; nếu bật thì phải có scrubbing policy owner-reviewed.
- source map upload chỉ là requirement khi build/minification path cần stack trace readable; không biến thành nghi thức bắt buộc cho mọi runtime không minified.
- release tagging phải đi qua `SENTRY_RELEASE` hoặc init option tương đương từ build metadata trong CI/deploy artifact path; không để manual upload/tagging thành quy trình chính.
- performance tracing/replay của Sentry không là baseline authority; logs + health + metrics vẫn là ưu tiên trước.

Rules:

- không dùng một DSN chung cho cả web/api/admin.
- chỉ init Sentry ở bootstrap/config path; không import SDK tùy tiện trong route/module business code để “bắt lỗi cho nhanh”.
- không coi Sentry là thay thế cho pino logs, `/health/*`, hay `/metrics`.
- không bật tracing/replay lane mặc định chỉ vì SDK hỗ trợ.

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

**`nestjs-pino` bootstrap canon:**
- `LoggerModule.forRoot()` hoặc `forRootAsync()` là logger module authority
- `main.ts` phải dùng:
  - `NestFactory.create(AppModule, { bufferLogs: true })`
  - `app.useLogger(app.get(Logger))`
- không được để Nest system logs đi một đường và app logs đi một đường khác
- `ConsoleLogger({ json: true })` không phải thay thế hợp lệ cho `nestjs-pino`

**Request/response auto-log stance:**
- auto request/response log của `pino-http` là baseline hợp lệ cho API shell
- route nào cần giảm noise có thể dùng `exclude` hoặc `forRoutes` có chủ đích
- không tắt auto logs toàn cục rồi kỳ vọng từng controller tự log thủ công để thay thế
- nếu có route siêu ồn như health/readiness probes, phải loại trừ bằng config owner thay vì ad hoc middleware

**Request id canon:**
- ưu tiên nhận `X-Request-ID` nếu upstream/proxy đã cấp
- nếu thiếu thì generate tại boundary đầu tiên bằng `genReqId` logic có owner
- mọi request log, error envelope, và fallback event phải dùng cùng `requestId`
- không để module tự phát minh thêm `traceId`/`request_id`/`reqId` song song khi chưa có owner doc riêng

**Logger API stance:**
- trong phần lớn codebase, ưu tiên Nest `Logger` API để giữ parameter order chuẩn của Nest
- `PinoLogger` chỉ dùng khi thật sự cần native Pino semantics:
  - child logger
  - assign extra fields cho nhiều log liên tiếp
  - helper/wrapper logging hẹp
- nếu dùng `PinoLogger` trực tiếp, vẫn phải bám chung redact/serializer/context policy

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
- **Nguồn sự thật chi tiết**: `design/02-platform-baseline/api-runtime/HEALTH_CONTRACT.md`
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
- **Nguồn sự thật chi tiết**: `design/02-platform-baseline/api-runtime/HEALTH_CONTRACT.md`
- **Check**: All 11 baseline platform modules initialized theo `design/02-platform-baseline/api-runtime/STARTUP_DEPENDENCY_ORDER.md`; optional services report riêng ở `optionalServices`
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

### BullMQ observability addendum

Khi BullMQ active, queue lane phải bổ sung tối thiểu:

- structured events:
  - `queue.job.enqueued`
  - `queue.job.started`
  - `queue.job.completed`
  - `queue.job.failed`
  - `queue.job.duplicate_skipped`
  - `queue.job.redriven`
- metrics:
  - queue depth
  - oldest job age
  - active jobs
  - failed jobs
  - dead-letter count
  - deduplicated jobs
  - queue event lag nếu có `QueueEvents` listener
- admin/runtime surfaces:
  - dead-letter inspection
  - retry/redrive action
  - per-queue health snapshot

Rules:

- QueueEvents là observability signal hữu ích, nhưng không là business source-of-truth.
- backlog lớn hoặc dead-letter tăng không được xem là “infra noise”; đó là product-operational debt phải có owner rõ.

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

### Authority split

- Prometheus là authority cho:
  - scrape config
  - recording rules
  - alerting rules evaluation
- Alertmanager là authority cho:
  - grouping
  - routing
  - inhibition
  - notification delivery
- Grafana là authority cho:
  - dashboards
  - internal operator UI
  - datasource visualization

Rules:

- PMTL không dùng Grafana làm source-of-truth cho alert conditions.
- alert conditions phải nằm trong Prometheus rule files; Alertmanager chỉ route/notify.
- Grafana alerting UI không là baseline authority của PMTL ở lane dormant này.

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

Rules:

- `scrape_timeout` nếu set phải luôn `<= scrape_interval`.
- config reload chỉ được làm qua:
  - `SIGHUP`
  - `POST /-/reload` khi Prometheus/Alertmanager được bật lifecycle endpoint một cách có chủ đích
- invalid config không được phép hot-reload mù; phải validate trước khi rollout.

### Prometheus rule discipline

- rule files là alert-condition authority.
- `for` dùng để giữ alert ở trạng thái pending cho đến khi condition tồn tại đủ lâu; không được giả định mọi spike ngắn đều nên fire ngay.
- `keep_firing_for` là knob hợp lệ khi cần giữ alert firing thêm một khoảng sau khi condition vừa clear; chỉ dùng có chủ đích để giảm flap hoặc giữ notification semantics ổn định.
- alert phải bám symptom ở user/service level trước, không alert thuần trên cause nội bộ nếu chưa có symptom panel hỗ trợ.
- metamonitoring là rule set đầu tiên:
  - Prometheus down / scrape failure lớn
  - Alertmanager down
  - config reload failed
  - rule evaluation failure

### Alertmanager routing discipline

- route tree phải có root route rõ ràng; child routes chỉ override phần thật sự cần override.
- grouping phải đi qua `group_by` labels có chủ đích; không dùng `...` để tắt grouping trừ khi owner biết rõ blast radius notification.
- `group_interval` và `repeat_interval` là timing knobs của grouping/renotify semantics; phải owner-review nếu paging volume hoặc escalation behavior đổi.
- `continue` chỉ dùng khi một alert cần match nhiều nhánh downstream một cách có chủ đích.
- `inhibit_rules` là path hợp lệ để mute alert cấp thấp hơn khi source alert cấp cao hơn đang active.

### Grafana provisioning and security stance

- Grafana production path phải dùng file provisioning hoặc artifact đã commit; không edit dashboard/rule thủ công trong UI rồi coi đó là authority.
- anonymous access tắt mặc định.
- nếu Grafana proxy dữ liệu qua backend, `data_source_proxy_whitelist` phải được owner-review.
- `GF_SERVER_ROOT_URL` phải khớp reverse-proxy/public path thật nếu có subpath exposure.

Rules:

- Grafana chỉ internal-only qua Caddy/admin boundary.
- không expose Grafana public internet.
- dashboard JSON/provisioning files phải là artifact reviewable trong repo.

### Prometheus and OTLP coexistence stance

- Prometheus có thể ingest OTLP metrics khi OTLP receiver được bật rõ ràng; đây không phải baseline mặc định của PMTL.
- OTLP ingest lane không làm thay đổi authority split:
  - Prometheus vẫn là authority cho metric storage/query/alerting
  - OTEL Collector vẫn là telemetry proxy/processor
- OTLP receiver phải được coi là opt-in feature, không tự bật theo quán tính khi có OTEL lane.

Rules:

- không promote toàn bộ resource attributes vào metric labels theo kiểu blanket.
- tránh high-cardinality labels từ trace/resource metadata nếu chưa có owner-reviewed mapping.
- alerting không được dựa trên trace-derived high-cardinality metrics chỉ vì Prometheus ingest được OTLP.

### Grafana dashboards (required at phase 2)
1. **API Overview**: request rate, error rate, latency p50/p95/p99
2. **Auth Dashboard**: login attempts, rate-limit hits, session count
3. **Upload Dashboard**: upload count, file types, rejection rate
4. **DB Dashboard**: query latency, connection count, slow queries
5. **Search Dashboard**: search query count, latency, fallback rate
6. **Queue Dashboard** (when BullMQ enabled): queue depth, processed, failed, dead-letter
7. **Valkey Dashboard** (when Valkey enabled): connected state, memory usage, evictions, keyspace hit/miss, reconnect/error rate, fallback activations

### Valkey / Redis-compatible observability minimum

Khi `VALKEY_URL` da activate that, phase 2 dashboard va alert lane phai bo sung:

- connection state / ping latency
- memory used / memory fragmentation ratio
- evicted keys
- expired keys
- keyspace hits / misses
- reconnect count
- command error count theo class:
  - transport/recoverable
  - wrongtype/schema misuse
- app-level fallback count:
  - `rate-limit.valkey.fallback`
  - cache fallback to DB

Redis Insight duoc phep dung nhu operator inspection tool, nhung khong thay the:

- Prometheus metrics
- Grafana dashboard
- Pino business-event logs

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
- containers phải có healthcheck và resource limits owner-reviewed trước khi lane này được activate

### Env vars (Phase 2)
| Env | Required | Purpose |
|---|---|---|
| `PROMETHEUS_ENABLED` | no | Enable Prometheus scrape endpoint |
| `GF_SECURITY_ADMIN_USER` | no | Grafana admin username override |
| `GRAFANA_ADMIN_PASSWORD` | yes (when enabled) | Grafana admin password |
| `GF_SERVER_ROOT_URL` | yes (when Grafana enabled behind proxy/subpath) | Canonical Grafana root URL |
| `GF_AUTH_ANONYMOUS_ENABLED` | no | Must stay `false` unless explicit owner exception |
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
  → OpenTelemetry SDK (Node SDK + auto-instrument selected boundaries)
  → OTEL Collector
  → Tempo (trace storage)
  → Grafana (trace UI via Tempo datasource)
```

Rules:

- OpenTelemetry không phải observability backend.
- OTEL chỉ là instrumentation + export/collection layer.
- Pino structured logs vẫn là log authority; OTEL trace lane chỉ bổ sung correlation và distributed-causality.

### Trace instrumentation requirements
- Auto-instrument: HTTP requests, DB queries (Prisma), BullMQ jobs
- Manual spans: audit writes, outbox dispatch, search sync
- Correlation: `traceId` must flow into Pino log context (structured field)
- Propagation: W3C TraceContext headers between API → Worker
- queue/job correlation metadata phải carry đủ `traceparent` hoặc owner-approved equivalent từ producer sang consumer

### SDK and instrumentation stance

- Node runtime authority: `@opentelemetry/sdk-node`
- app bootstrap authority: dedicated `otel.bootstrap.ts` helper, không nhét cả lane vào `main.ts`
- default span processor: `BatchSpanProcessor`
- SDK bootstrap phải chạy trước khi app bắt đầu nhận request/job
- `OTEL_ENABLED=false` phải no-op sạch, không giữ side effect runtime

Rules:

- không tạo nhiều tracer provider theo module
- không coi auto-instrumentation là lý do đủ để bỏ manual span ở owner boundaries quan trọng
- không span hóa mọi hàm service nhỏ; manual spans chỉ thêm ở boundary thật sự có giá trị chẩn đoán

### Resource and service identity

- `service.name` là bắt buộc; không chấp nhận `unknown_service`
- resource baseline tối thiểu:
  - `service.name`
  - `service.version`
  - `service.namespace=pmtl`
  - `deployment.environment.name`
- `OTEL_RESOURCE_ATTRIBUTES` được phép dùng để thêm resource attributes owner-reviewed

Rules:

- `apps/api` và `apps/worker` phải có `service.name` khác nhau
- mặc định bắt đầu từ detector set tối thiểu; chỉ cộng thêm host/container/k8s/cloud detector khi deployment context thật sự cần

### Sampling stance

- activation mặc định của PMTL dùng `head sampling 100%`
- nếu chưa có pressure thực, không cần set sampler riêng
- giảm volume bằng `TraceIdRatioBasedSampler` chỉ khi measured cost/volume buộc phải làm
- tail sampling là collector concern, không phải application concern

Rules:

- app SDK không tự phát minh sampling rule theo route/module
- nếu collector bật tail sampling thì phải có:
  - dashboard cho sampling pressure
  - alert khi collector không theo kịp
  - runbook rollback về simpler sampling

### Propagation and baggage stance

- default propagator bám W3C TraceContext
- OTEL baggage không là baseline feature của PMTL
- nội bộ trust boundary có thể propagate trace headers/correlation metadata
- outbound tới external/public services phải cân nhắc strip hoặc sanitize context

Rules:

- không cho PII, credentials, API keys, doctrinal/private practice notes vào baggage
- không coi baggage là metadata bus chung giữa modules

### Logs relationship stance

- OpenTelemetry JavaScript logs lane hiện còn development-level; PMTL không dùng nó làm log authority
- pino/nestjs-pino structured logs vẫn là baseline
- mục tiêu của OTEL trong PMTL là correlate logs với traces bằng `traceId`/`spanId`, không thay cả log stack

### Collector pipeline stance

Collector baseline shape:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:

processors:
  memory_limiter:
  batch:
  # optional:
  # filter:
  # redaction:
  # tailsampling:

exporters:
  otlp:

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlp]
```

Rules:

- collector chỉ include receivers/processors/exporters thật sự cần
- collector config phải dùng env expansion cho secret/header endpoint nếu có
- collector không bind public rộng; ưu tiên localhost hoặc Docker-internal service address
- dev-local collector trên localhost hoặc Docker-internal network được phép dùng plaintext OTLP để giảm friction; không copy stance đó sang shared/prod environments
- nếu collector nằm ngoài trusted local network, transport phải dùng TLS/mTLS
- internal telemetry của collector phải được bật đủ để thấy CPU/memory/throughput pressure

### Sensitive-data handling

- principle: data minimization trước, redaction sau
- không collect từ app side:
  - password
  - refresh/access token
  - API keys
  - CSRF token
  - raw email nếu owner policy yêu cầu hash
  - doctrinal/private notes
  - member progress tu tập riêng tư
- collector processor có thể filter/redact thêm, nhưng không phải nơi sửa app instrumentation cẩu thả

### Activation guard

Chỉ được bật OTEL khi:

- phase 1 logs + `/health/*` + `/metrics` đã ổn định
- requestId/correlation policy đã rõ
- restore/runbook/ops owner đã có evidence thật
- service boundaries đủ ổn để trace có ý nghĩa chẩn đoán

Không được bật OTEL chỉ vì:

- muốn “enterprise”
- muốn có tracing dashboard đẹp
- framework support sẵn

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
| `OTEL_RESOURCE_ATTRIBUTES` | no | Extra owner-reviewed resource attributes |
| `OTEL_TRACES_SAMPLER` | no | Head sampler mode when volume forces tuning |
| `OTEL_TRACES_SAMPLER_ARG` | no | Sampler argument such as trace ratio |
| `OTEL_EXPORTER_OTLP_HEADERS` | no | Exporter auth headers when collector/backend requires them |

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
| OTEL bootstrap (api) | `apps/api/src/platform/telemetry/otel.bootstrap.ts` |
| OTEL bootstrap (worker) | `apps/worker/src/platform/telemetry/otel.bootstrap.ts` |
| OTEL collector config | `infra/otel/otelcol.config.yaml` |
| OTEL implementation canon | `design/04-execution-overlay/repo/OTEL_IMPLEMENTATION_CANON.md` |

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

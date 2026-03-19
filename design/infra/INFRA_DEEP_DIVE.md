# PMTL Infrastructure: The Why & What

Giải thích **tại sao cần**, **nó giúp gì**, **công nghệ nào**. Không dài dòng.

---

## 🎯 Nhóm Thành Phần (Group Overview)

```
┌───────────────────────────────────────────────────────┐
│  BUSINESS LOGIC LAYER (App Layer)                     │
│  - pmtl-web (Frontend)                                │
│  - pmtl-cms (Backend/API)                             │
│  - pmtl-worker (Background Jobs)                      │
└───────────────────────────────────────────────────────┘
                        |
         ┌──────────────┴──────────────┐
         |                             |
┌────────v────────┐        ┌──────────v──────────┐
│ DATA LAYER      │        │ queue (hàng đợi xử lý) LAYER         │
│ - Postgres      │        │ - Redis queue (hàng đợi xử lý)       │
│ - Redis         │        │ (Bull/BullMQ)       │
│ - Meilisearch   │        │                     │
│ - PgBouncer     │        │ (via worker (tiến trình xử lý nền))        │
└─────────────────┘        └─────────────────────┘
          |
┌─────────v────────────────────────────────────┐
│ POOL & CONNECTION MGMT                        │
│ - PgBouncer (Postgres pooling)                │
└───────────────────────────────────────────────┘
         |
┌────────v──────────────────────────────────┐
│ REVERSE PROXY & INGRESS                   │
│ - Caddy (HTTPS, rate limit, routing)      │
└───────────────────────────────────────────┘
         |
    INTERNET

         |
┌────────v──────────────────────────────────────┐
│ MONITORING & OBSERVABILITY                    │
│                                               │
│ Metrics Collection:                           │
│ - Prometheus (time-series DB)                 │
│ - Node Exporter (host metrics)                │
│ - Redis Exporter (redis metrics)              │
│ - Postgres Exporter (db metrics)              │
│ - Blackbox Exporter (health probes)           │
│ - App metrics (/metrics endpoint)             │
│                                               │
│ Logging:                                      │
│ - Pino (structured JSON logs)                 │
│                                               │
│ Visualization & Alerting:                     │
│ - Grafana (dashboards)                        │
│ - Alertmanager (alert routing)                │
│ - Alert Sink (custom handlers)                │
└───────────────────────────────────────────────┘
```

---

## 📊 Chi Tiết Từng Component

### 1. **pmtl-postgres** — Database (source of truth (nguồn dữ liệu gốc đáng tin cậy nhất))

**Chức năng chính**:

- Lưu trữ dữ liệu kinh doanh: users, posts, comments, bookmarks, etc.
- Lưu trữ config, metadata, audit logs
- Single source of truth (nguồn dữ liệu gốc đáng tin cậy nhất) cho hệ thống

**Cách hoạt động**:

```
App (CMS/worker (tiến trình xử lý nền))
    ↓
PgBouncer (connection pool)
    ↓
PostgreSQL (read/write query)
    ↓
Data persisted on disk
```

**Thông số**:

- Version: PostgreSQL 17
- Instance: Managed (PaaS) hoặc Docker container
- Backup: Daily snapshots to S3
- Replication: Read replica (optional, for analytics)

**Nếu tắt**: App gần như chết, không thể read/write data

---

### 2. **pmtl-redis** — Cache + queue (hàng đợi xử lý) + Pub/Sub

**3 chức năng chính**:

#### a) Cache

- Lưu tạm: session đăng nhập, recent posts, featured content, config
- TTL tự động hết hạn (không phải manual xóa)
- Cache hit tránh query Postgres

Ví dụ:

```
User loads homepage
→ check Redis recent_posts (hit)
→ return data (fast)

vs

→ check Redis recent_posts (miss)
→ query Postgres
→ store in Redis with TTL 1 hour
→ return data
```

#### b) Queue (Bull/BullMQ)

- Lưu danh sách job chờ xử lý
- worker (tiến trình xử lý nền) nhấc job ra xử lý async (bất đồng bộ)

Ví dụ:

```
User publish post
→ save to Postgres
→ push job to Redis queue (hàng đợi xử lý): {type: 'index_post', postId: 123}
→ return immediately (200)

Worker (tách biệt)
    ↓
Poll Redis queue (hàng đợi xử lý)
    ↓
Get job {type: 'index_post', postId: 123}
    ↓
Reindex to Meilisearch
    ↓
Pop job from queue (hàng đợi xử lý)
```

#### c) Pub/Sub

- CMS emit event: "post published"
- worker (tiến trình xử lý nền) subscribe event
- trigger (điểm kích hoạt) action async (bất đồng bộ)

**Nếu tắt**:

- Cache lỗi → app phải query DB mọi lần (chậm)
- queue (hàng đợi xử lý) lỗi → async (bất đồng bộ) job không được xử lý (worker (tiến trình xử lý nền) đợi)
- Session lỗi → user phải re-login

---

### 3. **pmtl-pgbouncer** — Connection Pooling

**Chức năng**: Đứng giữa app và Postgres, quản lý pool kết nối

**Vì sao cần**:
Postgres mặc định mở 1 connection = 1 request.
Nếu nhiều app instance + cron job chạy cùng lúc → connection vượt giới hạn → DB reject.

**Cách hoạt động**:

```
App instance 1 ─┐
App instance 2 ├──> PgBouncer ──> Postgres (max 100 connection)
App instance 3 ─┘

PgBouncer:
- Keep pool ready: 20 connection
- App mượn connection: giảm từ 20 → 19
- App xong: return connection → tăng về 20
- Postgres: luôn thấy tối đa ~20 connection
```

**Thông số**:

```
pgbouncer.ini:
max_db_connections = 100  # max connection to Postgres
default_pool_size = 20    # keep 20 ready
min_pool_size = 10        # at least 10 always
pool_mode = transaction   # return connection after each transaction
```

**Nếu tắt**:

- App kết nối trực tiếp Postgres
- Mỗi request new connection
- Postgres connection > limit → crash
- (hoặc app phải reduce connection từng instance)

---

### 4. **pmtl-meilisearch** — Search Engine

**Chức năng**: Full-text search, typo tolerance, autocomplete, faceted filter

**Vì sao không dùng Postgres full-text**:
Postgres search OK cho 10K records, nhưng:

- 100K+ records: query chậm
- Faceted search (filter by category + tag + date): complex
- Typo tolerance: không built-in

Meilisearch chuyên:

- Fast ranking
- Typo tolerance
- Rich facets
- Lightweight

**Cách hoạt động**:

```
User publish post (Postgres)
    ↓
trigger (điểm kích hoạt) job → Redis queue (hàng đợi xử lý): {type: 'index_post', data: {...}}
    ↓
worker (tiến trình xử lý nền) pick job
    ↓
Fetch post từ Postgres
    ↓
Transform thành Meilisearch document format
    ↓
POST /indexes/posts/documents
    ↓
Meilisearch store index on disk + memory
    ↓
User search
    ↓
Query Meilisearch (fast, facet support)
    ↓
Return doc IDs + snippets
```

**Index cần sync**:

- All published posts (not drafts)
- All comments
- All community threads
- All searchable content

**Clean index**:

- Nightly: rebuild từ scratch để ensure freshness

**Nếu tắt**:

- Search feature không hoạt động
- fallback (đường dự phòng): can query Postgres full-text (chậm hơn)

---

### 5. **pmtl-prometheus** — Metrics Collection

**Chức năng**: Đi "hỏi" metrics từ các service (lớp xử lý nghiệp vụ), lưu lịch sử theo thời gian

**Hoạt động kiểu PULL** (không push):

```
Prometheus (every 15s)
    ↓
Request to target /metrics endpoint:
  - app:3000/metrics
  - redis-exporter:9121/metrics
  - postgres-exporter:9187/metrics
  - node-exporter:9100/metrics
  - blackbox-exporter:9115/metrics
    ↓
Collect + parse Prometheus format
    ↓
Store time-series in local TSDB
```

**Metrics collected**:

- HTTP request count, latency, error rate
- CPU, RAM, disk (từ node-exporter)
- Redis: key count, memory, hit/miss (từ redis-exporter)
- Postgres: connection count, query rate, slow queries (từ postgres-exporter)
- Endpoint health: HTTP 200? SSL valid? (từ blackbox)
- App custom: queue (hàng đợi xử lý) length, job duration, cache age

**Example metric**:

```
http_requests_total{method="GET", path="/api/posts", status="200"} 15234
redis_keys_total{db="0"} 42568
postgres_connections{state="active"} 12
cpu_usage_percent{host="prod-01"} 45.2
```

**Retention**: Default 15 days (tunable)

**Nếu tắt**:

- Grafana có data lịch sử, nhưng mới metrics không update
- Alert rule không chạy
- Ops team mù: không biết system đang khỏe hay suy yếu

---

### 6. **pmtl-grafana** — Dashboard Visualization

**Chức năng**: Vẽ biểu đồ dán kết quả từ Prometheus

**Không tự scrape**:
Grafana chỉ "hiển thị", không tự đi lấy metric. Nó query Prometheus.

**Ví dụ dashboard**:

| Dashboard Name  | Metrics shown                                        |
| --------------- | ---------------------------------------------------- |
| System Health   | CPU%, RAM%, disk free, load average                  |
| Database        | connection count, query rate, slow queries, deadlock |
| Cache (Redis)   | key count, memory, hit rate, eviction                |
| API Performance | request/sec, latency p50/p99, error rate             |
| queue (hàng đợi xử lý)           | job queue (hàng đợi xử lý) length, job duration, failed count         |
| Search          | index size, query latency, reindex progress          |
| Security        | failed login count, rate limit triggers, blocked IPs |

**Access**: `http://grafana.example.com:3000`

**Alert Integration**:

- Rules defined in Prometheus
- Triggered alerting → visualized in Grafana + sent to Alertmanager

**Nếu tắt**:

- App vẫn chạy
- Metric vẫn collected
- Nhưng ops team không thấy gì (mù)

---

### 7. **pmtl-prometheus-alertmanager** — Alert Routing

**Chức năng**: Nhận alert từ Prometheus, xử lý, gửi đúng địa chỉ

**Flow**:

```
Prometheus rule (every minute):
  - IF redis_memory > 1GB
  - THEN fire alert: AlertMemoryHigh

Prometheus send alert:
  - http://alertmanager:9093/api/v1/alerts
  - payload: {alertname: 'AlertMemoryHigh', severity: 'warning'}

Alertmanager:
  - Check routing rule:
    - if severity=warning → send to #alerts-warnings Slack
    - if severity=critical → send to #alerts-critical + page oncall
  - Group: wait 1 minute, group by: {alertname, instance}
  - Prevent duplicate: if same alert in 5 min → inhibit
  - Send to receiver (webhook, email, Slack, Pagerduty, etc.)
```

**Config example**:

```yaml
# prometheus.yml rules
- alert: RedisMemoryHigh
  expr: redis_memory_bytes > 1e9  # 1GB
  for: 5m
  annotations:
    summary: "Redis memory {{ $value }}"

# alertmanager.yml routing
global:
  resolve_timeout: 5m
route:
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'critical'
    - match:
        severity: warning
      receiver: 'warning'

receivers:
  - name: 'critical'
    webhook_configs:
      - url: 'http://alert-sink:3001/alerts'
  - name: 'warning'
    email_configs:
      - to: 'team@example.com'
```

**Nếu tắt**:

- Prometheus fire alert → nowhere
- Team không biết system lỗi
- Incident chỉ notice khi customer report

---

### 8. **pmtl-alert-sink** — Custom Alert Handler

**Chức năng**: Nhận webhook từ Alertmanager, xử lý, gửi Telegram/Slack/Discord

**Vì sao cần**:
Alertmanager có thể gửi email/Slack trực tiếp.
Nhưng team thường muốn:

- Custom format alert
- Add context (recent logs, metrics snapshot)
- Route dễ dàng (team 1 → Telegram, team 2 → Slack)
- Log all alert history
- trigger (điểm kích hoạt) auto-remediation (restart service (lớp xử lý nghiệp vụ), scale up)

**Flow**:

```
Alertmanager webhook
    ↓
POST http://alert-sink:3001/alerts
    ↓
alert-sink parse payload
    ↓
Format message:
  - Alert name
  - Severity (critical/warning/info)
  - Instance (which server)
  - Score/metrics
  - Runbook link
  - Dashboard link
    ↓
Check routing rule:
  - if severity=critical → send to Telegram ops-critical
  - if host=database → send to Telegram db-team
    ↓
Send Telegram message
    ↓
Log to alert history DB
    ↓
Optionally trigger (điểm kích hoạt) action:
  - restart service (lớp xử lý nghiệp vụ) via webhook
  - scale up load balancer
  - create incident in PagerDuty
```

**Example Telegram message**:

```
🚨 CRITICAL: RedisMemoryHigh

Instance: prod-redis-01
Severity: critical
Fired: 2026-03-18 14:32 UTC

Value: 1.2 GB / 1 GB
Duration: 5 minutes

Dashboard: [Grafana Redis](link)
Runbook: [wiki/redis-memory](link)
```

**Nếu tắt**:

- Alert không được gửi chat
- Team chỉ biết qua email (chậm)

---

### 9. **pmtl-node-exporter** — Host Metrics

**Chức năng**: Expose metric của host/server (CPU, RAM, disk, network)

**Metric exported**:

```
node_cpu_seconds_total{cpu="0", mode="user"}     # CPU time per core
node_memory_MemTotal_bytes                        # Total RAM
node_memory_MemFree_bytes                         # Free RAM
node_memory_MemAvailable_bytes                    # Avail RAM
node_filesystem_avail_bytes{device="/dev/sda1"}  # Disk free per mount
node_network_receive_bytes_total{device="eth0"}  # Network RX bytes
node_load1, node_load5, node_load15               # Load average
node_network_tcp_established                      # TCP connection count
```

**Hoạt động**:

```
Prometheus (every 15s)
    ↓
GET http://node-exporter:9100/metrics
    ↓
node-exporter read from /proc, /sys (Linux kernel)
    ↓
Format Prometheus text format
    ↓
Return
```

**Installation topologies**:

- Daemonset: 1 pod per node (Kubernetes)
- systemd service (lớp xử lý nghiệp vụ): 1 process per host (Docker Compose)
- Binary: run on each VPS/instance

**Nếu tắt**:

- Prometheus missing host metric
- Grafana cannot show CPU/RAM/disk dashboard
- Cannot alert on low disk space

---

### 10. **pmtl-redis-exporter** — Redis Metrics

**Chức năng**: Query Redis `INFO` command, convert to Prometheus format

**Metric exported**:

```
redis_connected_clients              # How many client connected
redis_used_memory_bytes               # Memory consumed
redis_used_memory_rss_bytes           # RSS memory (OS view)
redis_keyspace_keys_total{db="0"}     # Total key in DB 0
redis_keyspace_expires_total{db="0"}  # Expired keys waiting cleanup
redis_keyspace_avg_ttl_seconds        # Avg TTL of keys
redis_commands_processed_total         # Total command count
redis_connections_received_total       # Total connection ever
redis_connections_rejected_total       # Rejected (max client limit)
```

**Hoạt động**:

```
Prometheus (every 15s)
    ↓
GET http://redis-exporter:9121/metrics
    ↓
redis-exporter send "INFO" to Redis
    ↓
Parse response
    ↓
Convert to Prometheus format
    ↓
Return
```

**Install**:

```
# Docker Compose
redis-exporter:
  image: oliver006/redis_exporter:latest
  ports:
    - "9121:9121"
  environment:
    REDIS_ADDR: "redis:6379"
```

**Nếu tắt**:

- Prometheus missing Redis metric
- Cannot monitor cache hit rate, memory usage

---

### 11. **pmtl-postgres-exporter** — Database Metrics

**Chức năng**: Query Postgres system tables, expose metric

**Metric exported**:

```
pg_stat_database_tup_returned{datname="pmtl"}     # Row fetched
pg_stat_database_tup_inserted{datname="pmtl"}     # Row inserted
pg_stat_database_tup_updated{datname="pmtl"}      # Row updated
pg_stat_database_tup_deleted{datname="pmtl"}      # Row deleted
pg_stat_database_xact_commit{datname="pmtl"}      # Commit count
pg_stat_database_xact_rollback{datname="pmtl"}    # Rollback count
pg_stat_activity_count{state="active"}            # Active query
pg_stat_activity_max_tx_duration_seconds          # Longest tx duration
pg_database_size_bytes{datname="pmtl"}            # DB size
pg_table_total_size_bytes{schemaname="public", relname="posts"}  # Table size
pg_index_size_bytes                               # Index size
pg_replication_slot_retained_bytes                # Replication bytes
pg_up                                              # Postgres is up (1) or down (0)
```

**Hoạt động**:

```
Prometheus (every 15s)
    ↓
GET http://postgres-exporter:9187/metrics
    ↓
postgres-exporter query:
  - SELECT * FROM pg_stat_database
  - SELECT * FROM pg_stat_activity
  - SELECT pg_database_size(datname)
    ↓
Parse + convert to Prometheus format
    ↓
Return
```

**Install**:

```
postgres-exporter:
  image: prometheuscommunity/postgres-exporter:latest
  ports:
    - "9187:9187"
  environment:
    DATA_SOURCE_NAME: "postgresql://user:pass@postgres:5432/pmtl?sslmode=disable"
```

**Nếu tắt**:

- Prometheus missing DB metric
- Cannot alert on slow queries, high connection count

---

### 12. **pmtl-blackbox-exporter** — External Health Probe

**Chức năng**: Probe endpoint từ bên ngoài, check health từ user perspective

**Không like internal metric**:

- Internal exporter: app tự report metric (có thể nói dối)
- Blackbox: app không biết, exporter tự check (thực tế)

**Check types**:

```
HTTP/HTTPS:
  - GET https://example.com/health
  - Expect: 200 status
  - Measure: response time
  - Check: SSL certificate valid? expires when?

TCP:
  - Connect to port 5432 (Postgres)
  - Just check: port open?

DNS:
  - Resolve example.com
  - Check: return correct IP?

ICMP (ping):
  - Ping host
  - Check: alive?
```

**Config example**:

```yaml
# prometheus.yml
- job_name: "blackbox-http"
  metrics_path: /probe
  params:
    module: [http_2xx] # or http_post_2xx, tcp_connect, etc.
  static_configs:
    - targets:
        - https://example.com
        - https://example.com/health
        - https://api.example.com/api
  relabel_configs:
    - source_labels: [__address__]
      target_label: __param_target
    - source_labels: [__param_target]
      target_label: instance
    - target_label: __address__
      replacement: blackbox:9115
```

**Metric returned**:

```
probe_success{instance="https://example.com"}                1     # success
probe_duration_seconds{instance="https://example.com"}       0.234
probe_http_status_code{instance="https://example.com"}       200
probe_ssl_earliest_cert_expiry{instance="https://example.com"} 1609459200 (timestamp)
```

**Nếu tắt**:

- Cannot detect:
  - Reverse proxy routing broken
  - Caddy crashed
  - SSL cert expired
  - DNS broken

---

### 13. **pmtl-caddy** — Reverse Proxy / Ingress

**Chức năng**:

- Lắng nghe port 80/443
- Auto HTTPS + SSL renew
- Route traffic → backend service (lớp xử lý nghiệp vụ)
- Rate limit per IP
- Request logging

**Routing example**:

```caddy
example.com {
  # Route / to frontend
  route / {
    reverse_proxy localhost:3000
  }

  # Route /api to CMS
  route /api* {
    reverse_proxy localhost:3001
  }

  # Static file
  route /robots.txt {
    file_server {
      root /var/www
    }
  }

  # Rate limit
  rate_limit {
    zone default {
      key {http.request.remote}
      rate 100r/s
    }
  }

  # Logging
  log {
    output file /var/log/caddy/access.log {
      format json
    }
  }
}
```

**Auto HTTPS**:

- Caddy tự xin cert Let's Encrypt
- Auto renew trước expiry
- Không cần manual setup

**Nếu tắt**:

- Ports 80/443 exposed but not listen
- User cannot access from internet
- или cần manual reverse proxy (Nginx)

---

## 📈 Metric & Alert Strategy

### Critical Metrics (Alert immediately)

| Metric                   | Threshold          | Action                                       |
| ------------------------ | ------------------ | -------------------------------------------- |
| Redis memory             | > 90%              | Increase Redis, check for memory leak        |
| Postgres connection      | > 80 (nếu max=100) | Add PgBouncer pool size, or check slow query |
| API error rate           | > 5%               | Check logs, rollback deploy                  |
| Disk free                | < 10%              | Emergency cleanup, add disk                  |
| Postgres replication lag | > 10s              | Check network, replication status            |
| Queue (Bull) length      | > 1000             | Add worker (tiến trình xử lý nền) instance                          |
| Meilisearch index stale  | > 1 hour           | Check worker (tiến trình xử lý nền), re-trigger (điểm kích hoạt) reindex             |

### Warning Metrics (Alert but not emergency)

| Metric                | Threshold | Action                     |
| --------------------- | --------- | -------------------------- |
| API latency p99       | > 1s      | Optimize slow query, cache |
| Database connection   | > 50      | Monitor, consider scaling  |
| Redis eviction rate   | > 100/s   | Increase TTL, reduce cache |
| Grafana query latency | > 500ms   | Check Prometheus scrape    |

### Info Metrics (Track for insights)

| Metric               | Purpose                 |
| -------------------- | ----------------------- |
| API request/sec      | Capacity planning       |
| Cache hit rate       | Optimize cache strategy |
| worker (tiến trình xử lý nền) job duration  | Identify slow job type  |
| User active sessions | Growth tracking         |

---

## 🔄 Failure Modes & Recovery

| Component     | If Down                  | Impact                                  | Recovery Time                                          |
| ------------- | ------------------------ | --------------------------------------- | ------------------------------------------------------ |
| Postgres      | App DB query fail        | Users cannot read/write                 | Restart or failover (1-10 min)                         |
| Redis         | Cache/queue (hàng đợi xử lý) lỗi          | Slow API, async (bất đồng bộ) job backlog             | Restart (< 1 min)                                      |
| Meilisearch   | Search feature down      | Search unavailable                      | Rebuild index (5-30 min)                               |
| PgBouncer     | DB connection pool fail  | App cannot connect if direct needed     | Restart or bypass (< 1 min)                            |
| Caddy         | Reverse proxy down       | User cannot access from internet        | Restart, or direct IP (< 1 min)                        |
| Prometheus    | Metric not collected     | Grafana blind, alert not fired          | Restart, historical data remain (~1 min)               |
| Grafana       | Dashboard unavailable    | Ops team cannot see status              | Restart (~1 min)                                       |
| Alertmanager  | Alert not routed         | Team doesn't know alert                 | Restart, Prometheus queue (hàng đợi xử lý) alert timeout 5 min (~6 min) |
| Alert-sink    | Can't send Telegram      | Alert reaches Alertmanager but not team | Restart (~1 min)                                       |
| Node Exporter | Host metric not exported | Prometheus missing host metric          | Restart or reinstall (~1 min)                          |

---

## 🚀 Deployment Topology

### Development (Docker Compose)

```
docker-compose up -d
- apps/web
- apps/cms
- worker (tiến trình xử lý nền)
- Postgres
- Redis
- Meilisearch
- Caddy (optional, can use localhost:3000)
- Prometheus (optional)
- Grafana (optional)
```

### Production (Single VPS)

```
Hệ thống quản lý:
- Docker Compose hoặc systemd services
- PostgreSQL managed service (lớp xử lý nghiệp vụ) hoặc self-hosted
- Redis managed service (lớp xử lý nghiệp vụ) hoặc self-hosted
- Backup: cron script upload S3

Monitoring:
- Prometheus + Grafana trên 1 VPS nhỏ
- Alertmanager + alert-sink trên 1 service (lớp xử lý nghiệp vụ)
- exporters cài trên các host
```

### Production (Kubernetes)

```
- apps/web → Deployment (scale replicas)
- apps/cms → Deployment (scale replicas)
- worker (tiến trình xử lý nền) → Deployment (Keda auto-scale by queue (hàng đợi xử lý) length)
- Postgres → StatefulSet hoặc managed service (lớp xử lý nghiệp vụ)
- Redis → Deployment + PVC
- Meilisearch → Deployment + PVC
- Prometheus → StatefulSet + PVC
- Grafana → Deployment
- Alertmanager → Deployment
- Exporters → DaemonSet (1 per node)
- Caddy → Ingress hoặc bare metal load balancer
```

---

## 📝 Configuration Checklist

Before production launch:

- [ ] Postgres backup strategy (daily snapshot → S3)
- [ ] Redis backup strategy (RDB export nightly)
- [ ] PgBouncer pool size tuned (load test to find sweet spot)
- [ ] Meilisearch index reindex schedule (cron, or after bulk write)
- [ ] Prometheus scrape interval (default 15s, ok cho most cases)
- [ ] Prometheus retention (15 days default, or extend for 3 months?)
- [ ] Prometheus alert rules (define critical threshold)
- [ ] Alertmanager routing rules (who get alert when?)
- [ ] Alert-sink configured (Telegram token, Slack webhook)
- [ ] Grafana dashboard created (custom per team need)
- [ ] SSL certificate auto-renew (Caddy handles, just check log)
- [ ] Rate limit configured (in Caddy or app middleware)
- [ ] Logging pipeline (Pino → file → ELK/CloudWatch?, or just file)
- [ ] Disaster recovery plan (how to restore Postgres?)
- [ ] Load test (find bottleneck before production)


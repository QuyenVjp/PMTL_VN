## PHASE 2A - Observability & Monitoring (8.3 → 9.0)

**Mục tiêu:** Ship production với full visibility vào tất cả services.
**Effort:** 12-15 hours
**Impact:** CRITICAL - Không deploy prod mà không có monitoring!
**Status:** 🟡 Ready for implementation by AI/Copilot

---

## 1. Log Aggregation (Loki + Promtail)

### Tại Sao Loki?
- ✅ Lightweight (100MB RAM vs ELK 2GB)
- ✅ Designed for Kubernetes/Docker
- ✅ LogQL query language (like Prometheus)
- ✅ Works with pino JSON logs (already using)
- ✅ Free & open-source
- ✅ Grafana integration (same dashboard)

### 1.1 Create: `infra/docker/compose.monitoring.yml`

**File structure:**
```yaml
version: '3.8'

services:
  loki:
    image: grafana/loki:latest
    container_name: pmtl-loki
    ports:
      - "3100:3100"
    volumes:
      - loki_storage:/loki
      - ./loki-config.yml:/etc/loki/local-config.yml
    command: -config.file=/etc/loki/local-config.yml
    networks:
      - backend
    healthcheck:
      test: ["CMD", "wget", "-O-", "-q", "http://localhost:3100/ready"]
      interval: 10s
      timeout: 5s
      retries: 3
    restart: unless-stopped

  promtail:
    image: grafana/promtail:latest
    container_name: pmtl-promtail
    volumes:
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
    networks:
      - backend
    depends_on:
      - loki
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:latest
    container_name: pmtl-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_storage:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    networks:
      - backend
    healthcheck:
      test: ["CMD", "wget", "-O-", "-q", "http://localhost:9090/-/healthy"]
      interval: 10s
      timeout: 5s
      retries: 3
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: pmtl-grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-changeme}
      - GF_INSTALL_PLUGINS=grafana-clock-panel
      - GF_PATHS_PROVISIONING=/etc/grafana/provisioning
    volumes:
      - grafana_storage:/var/lib/grafana
      - ./grafana-provisioning/datasources:/etc/grafana/provisioning/datasources
      - ./grafana-provisioning/dashboards:/etc/grafana/provisioning/dashboards
    networks:
      - backend
    depends_on:
      - loki
      - prometheus
    healthcheck:
      test: ["CMD", "wget", "-O-", "-q", "http://localhost:3000/api/health"]
      interval: 10s
      timeout: 5s
      retries: 3
    restart: unless-stopped

  node-exporter:
    image: prom/node-exporter:latest
    container_name: pmtl-node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - backend
    restart: unless-stopped

volumes:
  loki_storage:
    driver: local
  prometheus_storage:
    driver: local
  grafana_storage:
    driver: local

networks:
  backend:
    external: true
```

### 1.2 Create: `infra/loki/loki-config.yml`

```yaml
auth_enabled: false

ingester:
  chunk_idle_period: 3m
  max_chunk_age: 1h
  max_streams_per_user: 10000
  chunk_retain_period: 1m

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h

schema_config:
  configs:
    - from: 2024-01-01
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/boltdb-shipper-active
    cache_location: /loki/boltdb-shipper-cache
    shared_store: filesystem
  filesystem:
    directory: /loki/chunks

retention_deletes_enabled: true
retention_period: 168h  # 7 days

server:
  http_listen_port: 3100
  log_level: info
  log_format: json
```

### 1.3 Create: `infra/loki/promtail-config.yml`

```yaml
server:
  http_listen_port: 9080
  log_level: info
  log_format: json

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  # Docker container logs
  - job_name: docker
    docker:
      host: unix:///var/run/docker.sock
      use_hostname: true
    relabel_configs:
      # Add container name as label
      - source_labels: ['__meta_docker_container_name']
        target_label: container_name
      
      # Add image name as label
      - source_labels: ['__meta_docker_container_image_name']
        target_label: image_name
      
      # Only scrape pmtl containers
      - source_labels: ['container_name']
        regex: 'pmtl-.+'
        action: keep
      
      # Add job label based on container name
      - source_labels: ['container_name']
        regex: 'pmtl-(.*)'
        target_label: job
        replacement: '$1'

  # System logs (optional)
  - job_name: syslog
    syslog:
      listen_address: 0.0.0.0:1514
      labels:
        job: syslog
```

### 1.4 Create: `infra/prometheus/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'pmtl-prod'
    environment: 'production'

# Alertmanager configuration (optional for now)
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - localhost:9093

scrape_configs:
  # Prometheus self-monitoring
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node Exporter (OS metrics)
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance

  # Docker metrics via cAdvisor (optional)
  # - job_name: 'cadvisor'
  #   static_configs:
  #     - targets: ['cadvisor:8080']

  # Caddy metrics (need to enable metrics in Caddy)
  # - job_name: 'caddy'
  #   static_configs:
  #     - targets: ['caddy:2019']
  #   metrics_path: '/metrics'

  # PostgreSQL metrics (need postgres_exporter running)
  # - job_name: 'postgres'
  #   static_configs:
  #     - targets: ['postgres-exporter:9187']

  # Redis metrics (need redis_exporter running)
  # - job_name: 'redis'
  #   static_configs:
  #     - targets: ['redis-exporter:9121']
```

---

## 2. Metrics Collection

### 2.1 Exporters to Add

**In compose.monitoring.yml, add:**

```yaml
  postgres-exporter:
    image: prometheuscommunity/postgres-exporter:latest
    container_name: pmtl-postgres-exporter
    ports:
      - "9187:9187"
    environment:
      DATA_SOURCE_NAME: "postgresql://postgres:${POSTGRES_PASSWORD}@pmtl-postgres:5432/pmtl?sslmode=disable"
    networks:
      - backend
    depends_on:
      - pgpostgres_exporter:9187
    restart: unless-stopped

  redis-exporter:
    image: oliver006/redis_exporter:latest
    container_name: pmtl-redis-exporter
    ports:
      - "9121:9121"
    environment:
      REDIS_ADDR: "redis://pmtl-redis:6379"
    networks:
      - backend
    depends_on:
      - pmtl-redis
    restart: unless-stopped

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: pmtl-cadvisor
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    networks:
      - backend
    restart: unless-stopped
    privileged: true
```

### 2.2 Update prometheus.yml with all exporters

See section 1.4 above - uncomment the exporter scrape configs

### 2.3 App-Level Metrics (Optional but Good)

For worker + API to export custom metrics:

```typescript
// apps/cms/src/services/metrics.service.ts (create new file)

import { register, Counter, Gauge, Histogram } from 'prom-client';

// Job queue metrics
export const jobQueueSize = new Gauge({
  name: 'pmtl_job_queue_size',
  help: 'Current job queue size',
  labelNames: ['job_type'],
});

export const jobProcessingTime = new Histogram({
  name: 'pmtl_job_processing_seconds',
  help: 'Job processing time',
  labelNames: ['job_type', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

// API metrics
export const httpRequestDuration = new Histogram({
  name: 'pmtl_http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
});

export const httpRequestTotal = new Counter({
  name: 'pmtl_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

// Search metrics
export const searchLatency = new Histogram({
  name: 'pmtl_search_latency_seconds',
  help: 'Search query latency',
  labelNames: ['query_type'],
  buckets: [0.05, 0.1, 0.2, 0.5, 1],
});

// Export metrics endpoint
export const getMetrics = async () => {
  return {
    metrics: register.metrics(),
    contentType: register.contentType,
  };
};
```

---

## 3. Visualization (Grafana Dashboards)

### 3.1 Create: Dashboard 1 - System Overview

**File: `infra/grafana/provisioning/dashboards/01-system-overview.json`**

Key panels to include:
```json
{
  "dashboard": {
    "title": "PMTL - System Overview",
    "panels": [
      {
        "title": "Service Status",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=~'pmtl-web|pmtl-cms|pmtl-postgres|pmtl-redis|pmtl-meilisearch|pmtl-caddy|pmtl-worker'}"
          }
        ]
      },
      {
        "title": "CPU Usage (%)",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(container_cpu_usage_seconds_total{container_label_com_docker_compose_service=~'web|cms|postgres|redis|meilisearch|caddy|worker'}[5m]) * 100"
          }
        ]
      },
      {
        "title": "Memory Usage (MB)",
        "type": "graph",
        "targets": [
          {
            "expr": "container_memory_usage_bytes{container_label_com_docker_compose_service=~'web|cms|postgres|redis|meilisearch|caddy|worker'} / 1024 / 1024"
          }
        ]
      },
      {
        "title": "Disk Usage (%)",
        "type": "stat",
        "targets": [
          {
            "expr": "(node_filesystem_avail_bytes{fstype!~'tmpfs|fuse.lowerfs|squashfs|vfat'} / node_filesystem_size_bytes{fstype!~'tmpfs|fuse.lowerfs|squashfs|vfat'}) * 100"
          }
        ]
      },
      {
        "title": "Network I/O (MB/s)",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(container_network_transmit_bytes_total[5m]) / 1024 / 1024"
          }
        ]
      }
    ]
  }
}
```

### 3.2 Create: Dashboard 2 - Application Performance

```json
{
  "dashboard": {
    "title": "PMTL - Application Performance",
    "panels": [
      {
        "title": "Requests Per Second (RPS)",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time (p50, p95, p99)",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "p50"
          },
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "p95"
          },
          {
            "expr": "histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "p99"
          }
        ]
      },
      {
        "title": "Error Rate (%)",
        "targets": [
          {
            "expr": "(sum(rate(http_requests_total{status=~'5..'}[5m])) / sum(rate(http_requests_total[5m]))) * 100"
          }
        ]
      },
      {
        "title": "Worker Job Queue Size",
        "targets": [
          {
            "expr": "pmtl_job_queue_size"
          }
        ]
      },
      {
        "title": "Job Processing Time (avg)",
        "targets": [
          {
            "expr": "rate(pmtl_job_processing_seconds_sum[5m]) / rate(pmtl_job_processing_seconds_count[5m])"
          }
        ]
      },
      {
        "title": "Search Latency (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(pmtl_search_latency_seconds_bucket[5m]))"
          }
        ]
      }
    ]
  }
}
```

### 3.3 Create: Dashboard 3 - Database Health

```json
{
  "dashboard": {
    "title": "PMTL - Database Health",
    "panels": [
      {
        "title": "Active Connections",
        "targets": [
          {
            "expr": "pg_stat_activity_count"
          }
        ]
      },
      {
        "title": "Slow Queries (>1s)",
        "targets": [
          {
            "expr": "pg_slow_queries"
          }
        ]
      },
      {
        "title": "Cache Hit Ratio (%)",
        "targets": [
          {
            "expr": "(1 - (sum(pg_stat_database_blks_read) / (sum(pg_stat_database_blks_read) + sum(pg_stat_database_blks_hit)))) * 100"
          }
        ]
      },
      {
        "title": "Transaction Rate",
        "targets": [
          {
            "expr": "rate(pg_stat_database_xact_commit[5m])"
          }
        ]
      },
      {
        "title": "Backup Status",
        "targets": [
          {
            "expr": "time() - pmtl_backup_last_successful_timestamp"
          }
        ]
      }
    ]
  }
}
```

### 3.4 Create: Dashboard 4 - Security Events

```json
{
  "dashboard": {
    "title": "PMTL - Security Events",
    "panels": [
      {
        "title": "Rate Limit Triggers (per hour)",
        "targets": [
          {
            "expr": "increase(rate_limit_triggers_total[1h])"
          }
        ]
      },
      {
        "title": "Failed Auth Attempts (per hour)",
        "targets": [
          {
            "expr": "increase(auth_failed_total[1h])"
          }
        ]
      },
      {
        "title": "Unusual Traffic (Requests > baseline)",
        "targets": [
          {
            "expr": "http_requests_total - avg_over_time(http_requests_total[24h])"
          }
        ]
      },
      {
        "title": "API Errors by Endpoint",
        "targets": [
          {
            "expr": "sum by (route) (rate(http_requests_total{status=~'5..'}[5m]))"
          }
        ]
      }
    ]
  }
}
```

---

## 4. Alerting (Grafana Alerts)

### 4.1 Create: `infra/grafana/provisioning/alert_provisioning.yml`

```yaml
# Alert notification channels
apiVersion: 1
groups:
  - orgId: 1
    name: PMTL Alerts
    folder: Alerts
    interval: 1m
    rules:
      # CRITICAL: Service Down
      - uid: alert-service-down
        title: Service Down
        condition: C
        data:
          - refId: A
            queryType: classic_conditions
            model:
              conditions:
                - evaluator:
                    params: [1]
                    type: lt
                  operator:
                    type: and
                  query:
                    params: ['A', '5m', 'now']
                  reducer:
                    params: []
                    type: last
                  type: query
              datasourceUid: prometheus-uid
              expression: up{job=~'pmtl-web|pmtl-cms|pmtl-postgres|pmtl-redis'}

      # WARNING: High CPU
      - uid: alert-high-cpu
        title: High CPU Usage
        condition: C
        data:
          - refId: A
            expr: 'rate(container_cpu_usage_seconds_total[5m]) * 100'
            datasourceUid: prometheus-uid
        noDataState: NoData
        execErrState: Alerting
        for: 5m
        annotations:
          description: 'CPU usage is {{ $values.A }} %'
          summary: 'High CPU on {{ $labels.container_name }}'

      # WARNING: High Memory
      - uid: alert-high-memory
        title: High Memory Usage
        for: 5m
        data:
          - refId: A
            expr: '(container_memory_usage_bytes / container_spec_memory_limit_bytes) * 100'
            datasourceUid: prometheus-uid
        noDataState: NoData
        execErrState: Alerting
        annotations:
          description: 'Memory usage is {{ $values.A }} %'

      # CRITICAL: Error Rate > 1%
      - uid: alert-high-error-rate
        title: High Error Rate
        for: 5m
        data:
          - refId: A
            expr: '(sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))) * 100'
            datasourceUid: prometheus-uid
        noDataState: NoData
        execErrState: Alerting
        annotations:
          description: 'Error rate is {{ $values.A }} %'

      # CRITICAL: Worker Stuck
      - uid: alert-worker-stuck
        title: Worker Job Processing Stuck
        for: 5m
        data:
          - refId: A
            expr: 'rate(pmtl_job_processing_seconds_count[5m]) < 0.1'
            datasourceUid: prometheus-uid
        annotations:
          description: 'Worker is not processing jobs'

      # WARNING: Disk Low
      - uid: alert-disk-low
        title: Low Disk Space
        for: 5m
        data:
          - refId: A
            expr: '(node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 10'
            datasourceUid: prometheus-uid
        annotations:
          description: 'Disk space is {{ $values.A }} %'

      # WARNING: Backup Failed
      - uid: alert-backup-failed
        title: Backup Failed or Overdue
        for: 1h
        data:
          - refId: A
            expr: 'time() - pmtl_backup_last_successful_timestamp > 86400'
            datasourceUid: prometheus-uid
        annotations:
          description: 'No successful backup within 24h'

      # CRITICAL: Response Time High
      - uid: alert-response-time
        title: High Response Time (p95 > 1s)
        for: 5m
        data:
          - refId: A
            expr: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1'
            datasourceUid: prometheus-uid
        annotations:
          description: 'p95 response time is {{ $values.A }} seconds'
```

### 4.2 Notification Channels

Add to Grafana environment or UI:
- **Slack Channel:** `#alerts-pmtl`
- **Discord Server:** PMTL alerts channel
- **Email:** devops@company.com
- **PagerDuty:** Critical incidents only

---

## 5. Deployment Instructions

### 5.1 Step 1: Start Monitoring Stack

```bash
# Create monitoring directory structure
mkdir -p infra/loki
mkdir -p infra/prometheus
mkdir -p infra/grafana/provisioning/{datasources,dashboards}

# Copy config files (created above)
# Then run:
docker-compose -f infra/docker/compose.monitoring.yml up -d

# Verify all services running
docker-compose -f infra/docker/compose.monitoring.yml ps

# Access Grafana
# URL: http://localhost:3000
# Username: admin
# Password: (from GRAFANA_PASSWORD env var)
```

### 5.2 Step 2: Configure Grafana Datasources

Add datasources in Grafana UI:
1. **Loki:** `http://loki:3100`
2. **Prometheus:** `http://prometheus:9090`

Or in `infra/grafana/provisioning/datasources/datasources.yml`:

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    
  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
```

### 5.3 Step 3: Import Dashboards

1. Go to Grafana → Import Dashboard
2. Upload the JSON files from `infra/grafana/provisioning/dashboards/`
3. Select Prometheus/Loki as datasource

Or use provisioning YAML (automatic on startup).

### 5.4 Step 4: Test Logging

```bash
# Generate some logs in all services
# Then check Loki:
curl -s 'http://localhost:3100/loki/api/v1/query' \
  --data-urlencode 'query={job="cms"}' | jq .

# Should return recent logs from cms container
```

### 5.5 Step 5: Test Metrics

```bash
# Check Prometheus scraped targets
curl -s 'http://localhost:9090/api/v1/targets' | jq .

# Should show all exporters (prometheus, node, postgres, redis, etc.)

# Query a metric
curl -s 'http://localhost:9090/api/v1/query' \
  --data-urlencode 'query=up' | jq .
```

---

## 6. Integration with Production Compose

### 6.1 Update: `infra/docker/compose.prod.yml`

Add monitoring network + link services:

```yaml
# At top - add monitoring compose file
override:
  include:
    - compose.monitoring.yml  # Load monitoring stack

# For each service, add:
services:
  pmtl-web:
    networks:
      - frontend
      - backend
      - monitoring  # Add this

  pmtl-cms:
    networks:
      - frontend
      - backend
      - monitoring  # Add this

networks:
  monitoring:
    driver: bridge
```

### 6.2 Environment Variables

Add to `.env.prod`:

```bash
# Grafana
GRAFANA_PASSWORD=your-secure-password

# Prometheus retention
PROMETHEUS_RETENTION=30d

# Loki retention
LOKI_RETENTION=7d

# Alert channels (examples)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/YOUR/WEBHOOK/URL
```

---

## 7. Monitoring Success Criteria

✅ **Phase 2A is complete when:**

- [ ] All 7 services show up in Prometheus targets (up status)
- [ ] Loki receives logs from all containers
- [ ] Grafana dashboards show real-time metrics
- [ ] Alerts trigger when services go down
- [ ] Can query logs: `{job="cms"} | json | status=200`
- [ ] Can query metrics: response time p95 < 500ms
- [ ] Backup status shows last successful timestamp
- [ ] Worker queue size visible in metrics

✅ **After Phase 2A:**
- 🟢 Know EXACTLY what's happening in production
- 🟢 Alerts fire BEFORE users notice issues
- 🟢 Debug production problems in minutes, not hours
- 🟢 Trending data for capacity planning
- 🟢 Ready for Phase 2B (Performance optimization)

---

**Next Phase:** PHASE_2B_PERFORMANCE.md

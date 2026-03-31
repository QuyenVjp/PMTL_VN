# SLA_SLO (Thỏa thuận và Mục tiêu mức độ dịch vụ)

File này định nghĩa `design targets (các mục tiêu thiết kế)`, không phải bằng chứng đã đạt SLO (Mục tiêu mức độ dịch vụ).
Nếu chưa có metric (chỉ số đo lường), probe (bộ dò sức khỏe), load check (kiểm tra tải), hoặc incident evidence (bằng chứng sự cố) thì trạng thái đúng là:

- `targeted (đang đặt mục tiêu)`
- chưa được `certified (chứng nhận)`

## Cách đọc file này (Reading guide)

- phase 1 (giai đoạn 1) chỉ giữ các target (mục tiêu) thật sự cần cho first launch (ra mắt lần đầu)
- mọi con số phải đi kèm:
  - áp dụng cho flow (luồng) nào
  - đo bằng gì
  - hiện đã đo hay chưa

## Certification rule (Quy tắc chứng nhận)

- Không target (mục tiêu) nào trong file này được coi là `đã đạt` nếu chưa có ít nhất một trong các evidence (bằng chứng) sau:
  - app metric (chỉ số ứng dụng)
  - health/readiness probe (bộ dò sức khỏe/sẵn sàng) tương ứng
  - structured timing log (nhật ký thời gian có cấu trúc)
  - load test (kiểm tra tải) hoặc smoke timing record (nhật ký thời gian kiểm thử khói)

---

## Service Level Objectives (SLOs) 2026

### Availability SLO

| Service | Target | Measurement | Error Budget (30 ngày) |
|---------|--------|-------------|------------------------|
| **API (public endpoints)** | 99.9% | Uptime Kuma + `/health/live` | 43.2 phút downtime |
| **Web (public pages)** | 99.9% | Uptime Kuma + homepage probe | 43.2 phút |
| **Search (Meilisearch)** | 99.5% | Search health endpoint | 3.6 giờ (có SQL fallback) |
| **Auth/Session** | 99.95% | Auth endpoint success rate | 21.6 phút |

### Latency SLOs

## Phase 1 targets (Các mục tiêu giai đoạn 1)

| Flow (Luồng xử lý) | Target (Mục tiêu) | Measure from (Đo lường từ) | Status today (Trạng thái) | Notes (Ghi chú) |
|---|---|---|---|---|
| public content read (đọc nội dung công khai) | p95 `< 500ms` | app timing log hoặc `/metrics` latency bucket | targeted | ưu tiên hơn dashboard (bảng điều khiển) nội bộ |
| auth login/register/profile update (đăng nhập/đăng ký/cập nhật hồ sơ) | p95 `< 800ms` | auth route timing log + `/metrics` | targeted | không tính external email delivery (gửi email ra bên ngoài) |
| upload metadata accept path (luồng chấp nhận siêu dữ liệu tải lên) | p95 `< 1000ms` | upload route timing log | targeted | chỉ cho canonical accept path (luồng chấp nhận chuẩn), không bao gồm scan (quét) dài |
| community submit (gửi bài cộng đồng) | p95 `< 800ms` | submit route timing log | targeted | canonical write (ghi dữ liệu chuẩn) phải xong nhanh |
| calendar public query (truy vấn lịch công khai) | p95 `< 500ms` | route timing log | targeted | không phụ thuộc async downstream (luồng bất đồng bộ phía dưới) |
| restore DB to clean machine (phục hồi cơ sở dữ liệu sang máy sạch) | `<= 30 phút` | restore drill log (nhật ký diễn tập phục hồi) | targeted | đây là ops SLO (mục tiêu vận hành) quan trọng hơn nhiều con số đẹp khác |

## Deferred targets (Các mục tiêu tạm hoãn)

Các target (mục tiêu) dưới đây chỉ có nghĩa khi component (thành phần) tương ứng thật sự được bật.

| Flow (Luồng xử lý) | Target (Mục tiêu) | Applies only when (Chỉ áp dụng khi) | Measure from (Đo lường từ) |
|---|---|---|---|
| search API (API tìm kiếm) | p95 `< 1200ms` | phase 1 SQL/API fallback (đường dự phòng SQL giai đoạn 1) | route timing log |
| search API (API tìm kiếm) | p95 `< 250ms` | Meilisearch đã bật | route timing log + search health |
| search freshness (độ tươi mới của tìm kiếm) | `< 10 giây` | Meilisearch + sync path (đường đồng bộ) đã bật | index sync lag metric (chỉ số trễ đồng bộ chỉ mục) |
| notification dispatch start (bắt đầu phân phát thông báo) | `< 30 giây` | queue/worker (hàng đợi/xử lý nền) đã bật | queue lag metric (chỉ số trễ hàng đợi) |
| member notification preference update | p95 `< 500ms` | `/thong-bao` preference/reminder routes active | route timing log |
| push job delivery success rate | `>= 95%` non-expired subscriptions | push delivery active | push job metrics + deactivated subscription audit |
| async side-effect enqueue/handoff (đưa vào hàng đợi/bàn giao tác động phụ bất đồng bộ) | `< 2 giây` | outbox/queue đã bật | outbox lag / dispatch metric (chỉ số trễ/phân phát) |

## Error-budget stance (Quan điểm về ngân sách lỗi)

- eventual consistency (tính nhất quán sau cùng) chấp nhận được với:
  - search projection (phản chiếu tìm kiếm)
  - notification dispatch (phân phát thông báo)
  - revalidation (xác thực lại)
- eventual consistency (tính nhất quán sau cùng) không chấp nhận được với:
  - auth authority (quyền lực xác thực)
  - canonical publish state (trạng thái xuất bản chuẩn)
  - moderation source record (bản ghi nguồn kiểm duyệt)
  - self-owned practice log (nhật ký tu tập cá nhân) sau khi request đã trả thành công

## Review rule (Quy tắc rà soát)

Mỗi khi thêm target (mục tiêu) mới, phải thêm cùng lúc:

- measurement source (nguồn đo lường)
- phase (giai đoạn) áp dụng
- điều kiện để coi là certified (đã chứng nhận)

Nếu không thêm 3 ý đó, target mới chỉ là wish list (danh sách mong muốn).

---

## Error Budgets & Alerting

### Error Budget Calculation

```
Error Budget = 100% - SLO Target
Monthly Error Budget (minutes) = 30 * 24 * 60 * Error Budget %

Example:
- SLO: 99.9% availability
- Error Budget: 0.1%
- Monthly Budget: 43.2 minutes of downtime
```

### Error Budget Policy

| Budget consumed | Action |
|-----------------|--------|
| 0-50% | Normal development, feature work |
| 50-75% | Prioritize reliability work, reduce risky deploys |
| 75-90% | Feature freeze, focus on stability |
| 90-100% | Incident mode, all hands on reliability |
| >100% | Post-mortem required, management escalation |

### Alerting Thresholds

```yaml
# infra/monitoring/alerts.yml
groups:
  - name: slo_alerts
    rules:
      # Availability alerts
      - alert: APIAvailabilityBudgetBurn
        expr: |
          (
            1 - (
              sum(rate(http_requests_total{status=~"2..|3.."}[5m]))
              /
              sum(rate(http_requests_total[5m]))
            )
          ) > 0.001  # 0.1% error rate = burning budget
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API error rate exceeding SLO budget"
          description: "Error rate {{ $value | humanizePercentage }} is burning error budget"

      - alert: APIAvailabilityCritical
        expr: |
          (
            1 - (
              sum(rate(http_requests_total{status=~"2..|3.."}[1m]))
              /
              sum(rate(http_requests_total[1m]))
            )
          ) > 0.01  # 1% error rate
        for: 1m
        labels:
          severity: critical
          pagerduty: true
        annotations:
          summary: "API experiencing significant errors"
          description: "Error rate {{ $value | humanizePercentage }} - immediate attention required"

      # Latency alerts
      - alert: APILatencyP95High
        expr: |
          histogram_quantile(0.95, 
            sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route)
          ) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API p95 latency exceeding 500ms"
          description: "Route {{ $labels.route }} p95 latency: {{ $value | humanizeDuration }}"

      - alert: APILatencyP99Critical
        expr: |
          histogram_quantile(0.99,
            sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route)
          ) > 2.0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "API p99 latency exceeding 2 seconds"

      # Search fallback alert
      - alert: SearchFallbackActive
        expr: search_engine_mode{mode="sql-fallback"} == 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Search running in SQL fallback mode"
          description: "Meilisearch may be unavailable"

      # Error budget consumption
      - alert: ErrorBudget75Consumed
        expr: |
          (
            sum(increase(http_requests_total{status=~"5.."}[30d]))
            /
            (sum(increase(http_requests_total[30d])) * 0.001)
          ) > 0.75
        labels:
          severity: warning
        annotations:
          summary: "75% of monthly error budget consumed"

      - alert: ErrorBudget90Consumed
        expr: |
          (
            sum(increase(http_requests_total{status=~"5.."}[30d]))
            /
            (sum(increase(http_requests_total[30d])) * 0.001)
          ) > 0.90
        labels:
          severity: critical
        annotations:
          summary: "90% of monthly error budget consumed - feature freeze recommended"
```

### SLI Metrics Implementation

```typescript
// apps/api/src/platform/metrics/sli.metrics.ts
import { Injectable } from "@nestjs/common";
import { Counter, Histogram, Gauge } from "prom-client";

@Injectable()
export class SliMetrics {
  // Availability SLI
  private readonly requestsTotal = new Counter({
    name: "http_requests_total",
    help: "Total HTTP requests",
    labelNames: ["method", "route", "status"],
  });

  // Latency SLI
  private readonly requestDuration = new Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route"],
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  });

  // Error budget gauge
  private readonly errorBudgetRemaining = new Gauge({
    name: "slo_error_budget_remaining",
    help: "Remaining error budget percentage",
    labelNames: ["service"],
  });

  // Search SLI
  private readonly searchEngineMode = new Gauge({
    name: "search_engine_mode",
    help: "Current search engine (1=meilisearch, 0=sql-fallback)",
    labelNames: ["mode"],
  });

  recordRequest(method: string, route: string, status: number, durationMs: number) {
    this.requestsTotal.inc({ method, route, status: String(status) });
    this.requestDuration.observe({ method, route }, durationMs / 1000);
  }

  setSearchMode(mode: "meilisearch" | "sql-fallback") {
    this.searchEngineMode.set({ mode: "meilisearch" }, mode === "meilisearch" ? 1 : 0);
    this.searchEngineMode.set({ mode: "sql-fallback" }, mode === "sql-fallback" ? 1 : 0);
  }

  updateErrorBudget(service: string, remainingPercent: number) {
    this.errorBudgetRemaining.set({ service }, remainingPercent);
  }
}
```

### Grafana Dashboard Panels

```json
{
  "title": "PMTL SLO Dashboard",
  "panels": [
    {
      "title": "API Availability (30 days)",
      "type": "stat",
      "targets": [{
        "expr": "sum(rate(http_requests_total{status=~\"2..|3..\"}[30d])) / sum(rate(http_requests_total[30d])) * 100"
      }],
      "thresholds": {
        "steps": [
          { "value": 99.0, "color": "red" },
          { "value": 99.9, "color": "yellow" },
          { "value": 99.95, "color": "green" }
        ]
      }
    },
    {
      "title": "Error Budget Remaining",
      "type": "gauge",
      "targets": [{
        "expr": "100 - (sum(increase(http_requests_total{status=~\"5..\"}[30d])) / (sum(increase(http_requests_total[30d])) * 0.001) * 100)"
      }],
      "thresholds": {
        "steps": [
          { "value": 0, "color": "red" },
          { "value": 25, "color": "orange" },
          { "value": 50, "color": "yellow" },
          { "value": 75, "color": "green" }
        ]
      }
    },
    {
      "title": "P95 Latency by Route",
      "type": "timeseries",
      "targets": [{
        "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))",
        "legendFormat": "{{ route }}"
      }]
    },
    {
      "title": "Search Engine Status",
      "type": "stat",
      "targets": [{
        "expr": "search_engine_mode{mode=\"meilisearch\"}"
      }],
      "mappings": [
        { "value": 1, "text": "Meilisearch ✓", "color": "green" },
        { "value": 0, "text": "SQL Fallback ⚠", "color": "yellow" }
      ]
    }
  ]
}
```

---

## Incident Response SLAs

| Severity | Response Time | Resolution Target | Escalation |
|----------|---------------|-------------------|------------|
| **P1 - Critical** | 15 phút | 4 giờ | Immediate: Owner + On-call |
| **P2 - High** | 1 giờ | 24 giờ | Within 2h: Team lead |
| **P3 - Medium** | 4 giờ | 72 giờ | Next business day |
| **P4 - Low** | 24 giờ | 1 tuần | Scheduled maintenance |

### Severity Definitions

- **P1 Critical**: Complete outage, auth broken, data loss risk, security breach
- **P2 High**: Major feature broken, significant degradation, >10% users affected
- **P3 Medium**: Minor feature broken, workaround exists, <10% users affected
- **P4 Low**: Cosmetic issues, minor bugs, enhancement requests

---

## SRE Runbook Quick Reference

### On-call Checklist

1. Check Uptime Kuma dashboard
2. Check Prometheus alerts
3. Check Grafana SLO dashboard
4. Check error logs: `docker logs pmtl-api --tail 100`
5. Check resource usage: `docker stats`

### Common Remediation

| Issue | Quick Fix |
|-------|-----------|
| API 5xx spike | `docker restart pmtl-api` |
| Search slow | Check Meilisearch: `docker logs pmtl-meilisearch` |
| DB connections exhausted | `docker restart pmtl-pgbouncer` |
| Memory pressure | Scale or restart: `docker-compose up -d --scale api=2` |
| SSL cert expiry | Caddy auto-renews; check: `docker exec pmtl-caddy caddy list-certificates` |

---

*Owner: `design/02-platform-baseline/deploy-ops/` · Last updated: 2026-03-31*

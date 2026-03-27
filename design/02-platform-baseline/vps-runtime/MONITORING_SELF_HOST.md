# Monitoring Self-Host Canon

Stack monitoring self-host cho VPS solo sinh viên. Không dùng Datadog, New Relic, hay paid SaaS.

---

## Stack tối thiểu (RAM < 512MB thêm)

| Tool | Vai trò | Image |
|---|---|---|
| **Uptime Kuma** | Uptime monitor + Telegram alert | `louislam/uptime-kuma:1` |
| **Prometheus** | Metrics scraping | `prom/prometheus:latest` |
| **Grafana** | Dashboard metrics | `grafana/grafana:latest` |
| **Loki** | Log aggregation | `grafana/loki:latest` |
| **Promtail** | Log shipping → Loki | `grafana/promtail:latest` |

Nếu RAM chỉ có 1 GB: chạy **Uptime Kuma** trước, defer Prometheus/Grafana/Loki đến khi có RAM 2 GB.

---

## Uptime Kuma — setup nhanh

Uptime Kuma đã có trong `docker-compose.prod.yml`. Sau khi chạy:

1. Truy cập `http://localhost:3003` (qua SSH tunnel: `ssh -L 3003:localhost:3003 pmtl@vps`)
2. Tạo account admin lần đầu
3. Thêm monitors:

| Monitor | URL | Interval |
|---|---|---|
| Web | `https://pmtl.vn` | 60s |
| API health | `https://api.pmtl.vn/health/live` | 30s |
| API ready | `https://api.pmtl.vn/health/ready` | 60s |
| Admin | `https://admin.pmtl.vn` | 60s |

4. Cài Telegram alert:
   - Tạo Telegram bot qua `@BotFather`
   - Lấy `bot_token` và `chat_id`
   - Trong Uptime Kuma: Settings → Notifications → Telegram

---

## Prometheus + Grafana + Loki (Phase 2 monitoring)

Thêm vào `docker-compose.prod.yml` khi có RAM 2 GB:

```yaml
  prometheus:
    image: prom/prometheus:latest
    restart: unless-stopped
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prom_data:/prometheus
    networks: [pmtl]
    # KHÔNG expose ra ngoài

  grafana:
    image: grafana/grafana:latest
    restart: unless-stopped
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
      GF_USERS_ALLOW_SIGN_UP: "false"
    volumes:
      - grafana_data:/var/lib/grafana
    networks: [pmtl]
    ports:
      - "127.0.0.1:3004:3000"  # chỉ localhost

  loki:
    image: grafana/loki:latest
    restart: unless-stopped
    volumes:
      - loki_data:/loki
    networks: [pmtl]

  promtail:
    image: grafana/promtail:latest
    restart: unless-stopped
    volumes:
      - /var/log:/var/log:ro
      - ./promtail/promtail.yml:/etc/promtail/config.yml:ro
    networks: [pmtl]
```

---

## prometheus.yml tối thiểu

```yaml
# infra/docker/prometheus/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: pmtl-api
    static_configs:
      - targets: ['api:3002']
    metrics_path: /metrics

  - job_name: caddy
    static_configs:
      - targets: ['caddy:2019']
    metrics_path: /metrics

  - job_name: node-exporter
    static_configs:
      - targets: ['node-exporter:9100']
```

---

## Grafana dashboards khuyến nghị (import JSON)

| Dashboard | ID | Dùng cho |
|---|---|---|
| Node Exporter Full | `1860` | VPS CPU/RAM/Disk |
| NestJS API | custom | Request rate, error rate, latency |
| Postgres | `9628` | DB connections, query time |
| Caddy | `20802` | Request rate, response time |

---

## Telegram alert script (backup nếu không dùng Uptime Kuma)

```bash
#!/bin/bash
# /opt/pmtl/scripts/alert.sh
BOT_TOKEN="${TELEGRAM_BOT_TOKEN}"
CHAT_ID="${TELEGRAM_CHAT_ID}"
MSG="$1"

curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  -d chat_id="${CHAT_ID}" \
  -d text="🚨 PMTL Alert: ${MSG}" \
  -d parse_mode="HTML"
```

```bash
# Dùng trong cron hoặc healthcheck script:
if ! curl -sf http://localhost:3002/health/live; then
  /opt/pmtl/scripts/alert.sh "API health check FAILED"
fi
```

---

## Cron healthcheck trên VPS

```cron
# /etc/cron.d/pmtl-health
*/5 * * * * pmtl /opt/pmtl/scripts/healthcheck.sh >> /var/log/pmtl-health.log 2>&1
```

```bash
#!/bin/bash
# /opt/pmtl/scripts/healthcheck.sh
API_URL="http://localhost:3002"

check() {
  local name=$1 url=$2
  if ! curl -sf --max-time 5 "$url" > /dev/null; then
    /opt/pmtl/scripts/alert.sh "❌ ${name} DOWN: ${url}"
    echo "$(date): FAIL ${name}"
  fi
}

check "API live"  "${API_URL}/health/live"
check "API ready" "${API_URL}/health/ready"
```

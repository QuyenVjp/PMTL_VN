# Monitoring Self-Host Canon (2026)

Stack monitoring chuẩn cho PMTL_VN trên VPS self-host, không phụ thuộc SaaS trả phí.

## Mục tiêu vận hành

- Có alert sớm khi API/web lỗi.
- Có metric để debug hiệu năng (CPU, RAM, DB, cache, HTTP).
- Có dashboard nhanh cho on-call.
- Dễ chạy bằng `docker compose` profile mà không tách hạ tầng riêng.

## Stack khuyến nghị

| Layer | Service | Vai trò |
|---|---|---|
| Node/system metrics | `node-exporter` | Export metric hệ điều hành |
| Real-time host observability | `netdata` | Live view CPU/RAM/disk/network/process |
| Metrics TSDB | `prometheus` | Scrape + rule alert |
| Alert routing | `alertmanager` | Route Telegram/email alert |
| Dashboard | `grafana` | Query + visualize metric |
| Endpoint probing | `blackbox-exporter` | Health probe HTTP/TCP |
| DB/cache exporters | `postgres-exporter`, `redis-exporter` | Metric chi tiết DB/Redis |

## Compose profiles

`infra/docker/compose.prod.yml` đã định nghĩa:

- `monitoring`: bật toàn bộ monitoring stack, bao gồm **Netdata**
- `monitoring-test`: alert sink dùng cho drill

Chạy:

```bash
pnpm docker:prod:monitoring
```

Hoặc:

```bash
docker compose --env-file infra/docker/.env.prod -f infra/docker/compose.prod.yml --profile monitoring up -d
```

## Netdata (new default lane)

Netdata chạy trong profile `monitoring`:

- image: `netdata/netdata:v2.6.0`
- bind localhost: `127.0.0.1:${NETDATA_PORT:-19999}`
- dùng để xem nhanh:
  - per-process CPU/RAM
  - load spikes
  - network/disk saturation
  - anomaly drill trong sự cố runtime

Truy cập local qua SSH tunnel:

```bash
ssh -L 19999:localhost:19999 pmtl@<vps-host>
```

## Alert baseline

- Bắt buộc alert:
  - API `/api/health/live` down
  - API `/api/health/ready` fail
  - Postgres unhealthy
  - Redis unhealthy
  - Disk > 80%
  - Memory pressure kéo dài
- Kênh:
  - Telegram qua Alertmanager hoặc monitoring drill scripts

## Hardening notes

- Monitoring ports bind localhost (`127.0.0.1`) trừ khi có reverse proxy + auth rõ.
- Không expose credentials trong dashboard JSON hoặc compose log.
- Grafana admin password bắt buộc lấy từ env secret.

## Drill checklist

1. `pnpm monitoring:test` pass.
2. Simulate API down -> alert tới Telegram.
3. Verify Grafana datasource healthy.
4. Verify Netdata accessible qua tunnel.
5. Verify Prometheus scrape targets green.

## Operational policy

- Monitoring stack là control-plane hỗ trợ runtime, không được làm tăng rủi ro bảo mật của data-plane.
- Khi VPS RAM hạn chế, ưu tiên giữ `prometheus + alertmanager + netdata`; Grafana có thể bật theo nhu cầu.

# Deployment

## Production topology

- `example.com` -> `web`
- `cms.example.com` -> `cms`
- `postgres`, `meilisearch`, `redis` chỉ nằm mạng nội bộ Docker
- `caddy` là public entrypoint duy nhất

## Quy trình deploy

1. Merge vào `main`.
2. CI build image `web` và `cms`.
3. Push image lên GHCR hoặc Docker Hub.
4. VPS chạy:

```bash
docker compose --env-file infra/docker/.env.prod -f infra/docker/compose.prod.yml pull web cms worker caddy postgres pgbouncer meilisearch redis
docker compose --env-file infra/docker/.env.prod -f infra/docker/compose.prod.yml up -d web cms worker caddy postgres pgbouncer meilisearch redis
```

Production notes:
- pin `WEB_IMAGE` và `CMS_IMAGE` theo release tag cụ thể, không dùng `:latest`
- Redis production dùng `volatile-lru` để request guard và rate-limit keys có TTL không làm runtime fail-write khi memory đầy
- Meilisearch production bật snapshot scheduling qua `MEILI_SCHEDULE_SNAPSHOT`
- worker có heartbeat file healthcheck trong container để Docker phát hiện tiến trình nền bị treo
- `web`, `cms`, `worker` dùng `stop_grace_period` dài hơn mặc định để tránh cắt request/job dang chay khi deploy
- Postgres production set `statement_timeout`, `lock_timeout`, `idle_in_transaction_session_timeout` o level service de fail fast khi query treo
- monitoring service bind localhost only; truy cap Grafana/Prometheus/Alertmanager qua SSH tunnel, khong mo public port
- build image truoc roi moi deploy len VPS; standalone build tren Windows co the canh bao trace `node:inspector`, nhung deploy Linux khong gap gioi han path nay
- CMS uploads/media phai nam tren volume persistent rieng, khong nam trong image layer
- monitoring stack nen chay bang `--profile monitoring`; tren VPS 4GB, khong nen coi no la phan bat buoc cua deploy chinh

## Runtime responsibilities

- `web`: SSR/ISR và UI.
- `cms`: Next.js app host Payload admin UI, REST API, GraphQL và content workflows.
- `worker`: tiến trình nền dùng cùng codebase CMS để xử lý Payload Jobs cho search sync, push dispatch, email notification và cleanup.
- `postgres`: source of truth.
- `meilisearch`: index tìm kiếm.
- `redis`: shared rate-limit store va request guard adapter cho production multi-instance khi can.
- `caddy`: reverse proxy, TLS, compression.
- `prometheus`: scrape health va exporter metrics.
- `alertmanager`: route alert sang Telegram.
- `grafana`: dashboard quan sát production.

## Queue runtime

- `cms` chỉ enqueue job, không xử lý long-running work trong request path.
- `worker` dùng Payload Jobs để xử lý:
  - post search sync
  - push dispatch
  - email notification
  - expired request guard cleanup
- Production compose cần `VAPID_*` và `SMTP_*` nếu muốn bật đầy đủ push/email; `REDIS_URL` chỉ cần cho runtime coordination features khác.
- Production compose cũng nên có:
  - `MEILI_MASTER_KEY`
  - `MEILI_SCHEDULE_SNAPSHOT=true`
  - `WORKER_HEARTBEAT_PATH`
  - image tags release-specific cho `WEB_IMAGE`, `CMS_IMAGE`
  - `GRAFANA_ADMIN_PASSWORD`
  - `ALERT_TELEGRAM_BOT_TOKEN`
  - `ALERT_TELEGRAM_CHAT_ID`
  - `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`
  - `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` neu can upload sourcemaps
  - `MONITORING_TEST_SECRET`

## Runtime hardening baseline

- `web` va `cms` health route tra `503` khi app dang shutdown de load balancer ngung gui request moi.
- Rate limiting phai fail closed neu Redis duoc ky vong trong production.
- Query timeout nen duoc dat o Postgres service va connection timeout o app pool.
- Image allowlist cua web phai explicit cho CMS media/CDN duoc chap nhan, khong mo wildcard.

## Monitoring topology

- `prometheus` scrape:
  - `caddy` admin metrics cho traffic, latency, 5xx theo host
  - `blackbox-exporter` cho `web`, `cms`, `worker`, `meilisearch`, `caddy`
  - `postgres-exporter`
  - `redis-exporter`
  - `node-exporter` cho RAM, disk, CPU host
  - `cms:/api/metrics/worker`
- `grafana` bind localhost only (`127.0.0.1:${GRAFANA_PORT}`)
- `prometheus` va `alertmanager` cung bind localhost only
- public Caddy block `api/metrics/*`, `api/worker/health`, va `api/internal/monitoring/*` tren domain public; monitoring scrape di thang qua network noi bo Docker
- error tracking dung Sentry Cloud thay vi Loki de tiet kiem RAM cho VPS 4GB

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
docker compose -f infra/docker/compose.prod.yml pull
docker compose -f infra/docker/compose.prod.yml up -d
```

Production notes:
- pin `WEB_IMAGE` và `CMS_IMAGE` theo release tag cụ thể, không dùng `:latest`
- Redis production dùng `volatile-lru` để request guard và rate-limit keys có TTL không làm runtime fail-write khi memory đầy
- Meilisearch production bật snapshot scheduling qua `MEILI_SCHEDULE_SNAPSHOT`
- worker có heartbeat file healthcheck trong container để Docker phát hiện tiến trình nền bị treo

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

## Monitoring topology

- `prometheus` scrape:
  - `blackbox-exporter` cho `web`, `cms`, `worker`, `meilisearch`, `caddy`
  - `postgres-exporter`
  - `redis-exporter`
  - `cms:/api/metrics/worker`
- `grafana` bind localhost only (`127.0.0.1:${GRAFANA_PORT}`)
- `prometheus` va `alertmanager` cung bind localhost only
- public Caddy block `api/metrics/*` va `api/worker/health` tren domain public; monitoring scrape di thang qua network noi bo Docker

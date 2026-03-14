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

## Runtime responsibilities

- `web`: SSR/ISR và UI.
- `cms`: Next.js app host Payload admin UI, REST API, GraphQL và content workflows.
- `postgres`: source of truth.
- `meilisearch`: index tìm kiếm.
- `caddy`: reverse proxy, TLS, compression.

## Stage 2

- Thêm `redis` cho cache/queue.
- Thêm `worker` cho indexing, notification, email, backup jobs.
- Thêm monitoring, alerting, scheduled backup.

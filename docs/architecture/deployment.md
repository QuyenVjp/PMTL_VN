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
- `worker`: tiến trình nền dùng cùng codebase CMS để xử lý BullMQ jobs cho search sync, push dispatch, email notification và cleanup.
- `postgres`: source of truth.
- `meilisearch`: index tìm kiếm.
- `redis`: queue backend, shared rate-limit store và request guard adapter cho production multi-instance.
- `caddy`: reverse proxy, TLS, compression.

## Queue runtime

- `cms` chỉ enqueue job, không xử lý long-running work trong request path.
- `worker` dùng Redis + BullMQ để xử lý:
  - post search sync
  - push dispatch
  - email notification
  - expired request guard cleanup
- Production compose cần `REDIS_URL`, `VAPID_*` và `SMTP_*` nếu muốn bật đầy đủ push/email.

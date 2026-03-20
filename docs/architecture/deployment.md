# Deployment

File này mô tả `deployment baseline (nền tảng triển khai)` cho hướng kiến trúc mới.
Canonical rule gốc sống ở:

- [design/baseline/infra.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/infra.md)
- [design/DECISIONS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/DECISIONS.md)

## Production topology baseline

- `example.com` -> `apps/web`
- `admin.example.com` -> `apps/admin`
- `api.example.com` hoặc internal route qua `Caddy` -> `apps/api`
- `postgres` chỉ nằm mạng nội bộ
- `caddy` là public entrypoint duy nhất

Optional phase 2+:

- `apps/worker`
- `valkey`
- `meilisearch`
- `pgbouncer`
- monitoring stack

## Runtime responsibilities

- `web`: public SSR/ISR/RSC UI
- `admin`: management UI
- `api`: NestJS backend authority, auth, OpenAPI, domain modules, storage/search orchestration
- `worker`: optional async execution runtime
- `postgres`: source of truth
- `caddy`: reverse proxy, TLS, compression, ingress

Optional:

- `valkey`: cache/rate-limit/queue coordination
- `meilisearch`: public search projection
- `pgbouncer`: DB pooling

## Deploy sequence

1. Build and publish images for `web`, `api`, `admin`
2. Pull images on VPS
3. Run database migrations
4. Start `api`
5. Verify `/health/live`, `/health/ready`, `/health/startup`
6. Start `web` and `admin`
7. Run smoke checks

## Phase 1 rule

Không cộng thêm service chỉ vì “trông production hơn”.
Phase 1 baseline đủ là:

- `web`
- `api`
- `admin`
- `postgres`
- `caddy`
- local storage abstraction
- logs
- health
- metrics
- backup/restore discipline

## Storage deployment note

- current phase dùng `local disk adapter`
- nhưng business logic phải đi qua `storage abstraction`
- target phase ưu tiên `S3-compatible object storage`, đặc biệt `Cloudflare R2`

## Security and ops baseline

- production secrets không commit repo
- health endpoints phải dùng được thật
- `/metrics` phải có contract ổn định
- phải có backup command và restore drill evidence
- auth/upload/audit/rate-limit phải được coi là launch blocker, không phải nice-to-have

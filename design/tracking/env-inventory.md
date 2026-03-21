# ENV_INVENTORY (Danh mục biến môi trường)

File này chốt `env contract inventory (danh mục hợp đồng biến môi trường)` ở mức kiến trúc.
Nó không thay file `.env.example`, nhưng giúp tránh quên nhóm env khi scaffold app.

> **Secret rotation**: `baseline/secret-management.md`
> **Email provider**: `baseline/email-provider-decision.md`
> **Cache topology**: `baseline/cache-topology.md`
> **Valkey**: `baseline/valkey-architecture.md`

---

## Rule

- `apps/api` validate env bằng `Zod` ngay lúc boot — missing required env → app refuses to start.
- `apps/web` và `apps/admin` chỉ đọc env public/client-safe ở boundary phù hợp.
- Không thêm env vô danh nghĩa; mỗi env phải có owner.
- Khi thêm env mới: cập nhật file này + `.env.example` + `config.schemas.ts` owner module.

---

## Phase 1 — Required before launch

### Shared / Infra

| Env | Owner | Required | Purpose |
|---|---|---|---|
| `NODE_ENV` | all | yes | runtime mode (`development` / `production` / `test`) |
| `PMTL_APP_ENV` | infra | yes | env label: `dev` / `staging` / `prod` |
| `LOG_LEVEL` | api | yes | pino log level (`info` in prod, `debug` in dev) |
| `REQUEST_ID_HEADER` | api | no | correlation header override (default: `x-request-id`) |

### API Core

| Env | Owner | Required | Purpose |
|---|---|---|---|
| `API_PORT` | api | yes | NestJS HTTP port (default: 3001) |
| `API_BASE_URL` | api | yes | canonical API URL (e.g., `https://api.pmtl.vn`) |
| `API_INTERNAL_URL` | api | yes | internal URL for server-to-server calls (e.g., `http://api:3001`) |
| `WEB_ORIGIN` | api | yes | allowlisted web origin for CORS |
| `ADMIN_ORIGIN` | api | yes | allowlisted admin origin for CORS |
| `DATABASE_URL` | api | yes | Postgres connection string |

### Identity / Auth

| Env | Owner | Required | Purpose |
|---|---|---|---|
| `JWT_ACCESS_SECRET` | identity | yes | access token signing key (min 512-bit entropy) |
| `JWT_REFRESH_SECRET` | identity | yes | refresh token signing key (min 512-bit entropy) |
| `ACCESS_TOKEN_TTL_MINUTES` | identity | yes | access token TTL (default: 15) |
| `REFRESH_TOKEN_TTL_DAYS` | identity | yes | refresh token TTL (default: 30) |

### Security

| Env | Owner | Required | Purpose |
|---|---|---|---|
| `CSRF_SECRET` | security | yes | CSRF token signing key |
| `COOKIE_DOMAIN` | security | yes | cookie domain scope (e.g., `.pmtl.vn`) |
| `COOKIE_SECURE` | security | yes | `true` in production, `false` in dev |

### Storage

| Env | Owner | Required | Purpose |
|---|---|---|---|
| `STORAGE_ADAPTER` | storage | yes | `local` (Phase 1) or `r2` (Phase 2+) |
| `LOCAL_STORAGE_ROOT` | storage | yes when local | absolute path on disk for media files |
| `PUBLIC_MEDIA_BASE_URL` | storage | yes | public base URL for media assets |
| `MAX_AVATAR_MB` | storage | yes | avatar upload size limit in MB (default: 5) |
| `MAX_IMAGE_MB` | storage | yes | image upload size limit in MB (default: 10) |
| `MAX_DOCUMENT_MB` | storage | yes | document/audio upload size limit in MB (default: 25) |
| `MAX_VIDEO_MB` | storage | no | video upload size limit in MB (default: 100) |

### Email (required for auth flows)

| Env | Owner | Required | Purpose |
|---|---|---|---|
| `SMTP_HOST` | platform/notification | yes | SMTP server hostname (e.g., `smtp-relay.brevo.com`) |
| `SMTP_PORT` | platform/notification | yes | SMTP port (587 for STARTTLS, 465 for TLS) |
| `SMTP_SECURE` | platform/notification | no | `true` for port 465, `false` for 587 (default) |
| `SMTP_USER` | platform/notification | yes | SMTP auth username |
| `SMTP_PASS` | platform/notification | yes | SMTP auth password / API key |
| `SMTP_FROM_NAME` | platform/notification | yes | Sender display name (e.g., `PMTL_VN`) |
| `SMTP_FROM_EMAIL` | platform/notification | yes | Sender email address (e.g., `noreply@pmtl.vn`) |
| `EMAIL_HASH_SALT` | platform/notification | yes | Salt for hashing emails in audit logs — **never rotate** |

### Web (apps/web)

| Env | Owner | Required | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | web | yes | canonical public site URL |
| `NEXT_PUBLIC_API_BASE_URL` | web | yes | API origin visible to browser (proxy target) |
| `NEXT_PUBLIC_MEDIA_BASE_URL` | web | yes | media CDN base URL |
| `REVALIDATE_SECRET` | web + api | yes | shared secret for on-demand ISR revalidation |
| `NEXT_REVALIDATE_URL` | api | yes | web app revalidation webhook URL |

### Admin (apps/admin)

| Env | Owner | Required | Purpose |
|---|---|---|---|
| `VITE_API_BASE_URL` | admin | yes | API origin for admin SPA |
| `VITE_ADMIN_URL` | admin | yes | canonical admin URL |

---

## Phase 2+ — Required when component enabled

### Valkey (cache / rate-limit / queue)
> Design: `baseline/valkey-architecture.md`

| Env | Owner | Required when | Purpose |
|---|---|---|---|
| `VALKEY_URL` | platform | yes | Valkey connection string (`redis://valkey:6379`) |
| `VALKEY_TLS` | platform | no | `true` if Valkey requires TLS |
| `VALKEY_MAX_RETRIES` | platform | no | connection retry count (default: 3) |

### BullMQ / Worker
> Design: `baseline/bullmq-worker-architecture.md`

| Env | Owner | Required when | Purpose |
|---|---|---|---|
| `BULLMQ_PREFIX` | queue | yes | queue namespace prefix (default: `pmtl`) |
| `WORKER_PORT` | worker | yes | worker health endpoint port (default: 3002) |
| `WORKER_CONCURRENCY_SEARCH_SYNC` | worker | no | search sync worker concurrency (default: 5) |
| `WORKER_CONCURRENCY_NOTIFICATION_PUSH` | worker | no | push delivery concurrency (default: 10) |
| `WORKER_CONCURRENCY_OUTBOX` | worker | no | outbox dispatch concurrency (default: 5) |

### Outbox dispatcher
> Design: `baseline/outbox-dispatcher-model.md`

| Env | Owner | Required when | Purpose |
|---|---|---|---|
| `OUTBOX_POLL_INTERVAL_MS` | outbox | no | dispatcher poll interval (default: 5000) |
| `OUTBOX_BATCH_SIZE` | outbox | no | events per dispatcher batch (default: 50) |

### Meilisearch
> Design: `06-search/meilisearch-architecture.md`

| Env | Owner | Required when | Purpose |
|---|---|---|---|
| `MEILI_HOST` | search | yes | Meilisearch host URL |
| `MEILI_MASTER_KEY` | search | yes | Meilisearch master key |
| `MEILI_INDEX_NAME` | search | no | index name (default: `pmtl_content`) |

### Cloudflare R2 (object storage)
> Design: `baseline/r2-migration-plan.md`

| Env | Owner | Required when | Purpose |
|---|---|---|---|
| `S3_ENDPOINT` | storage | yes | R2 endpoint (`https://<accountid>.r2.cloudflarestorage.com`) |
| `S3_BUCKET` | storage | yes | R2 bucket name |
| `S3_ACCESS_KEY_ID` | storage | yes | R2 API token key ID |
| `S3_SECRET_ACCESS_KEY` | storage | yes | R2 API token secret |
| `S3_REGION` | storage | no | `auto` for R2 |

### Web Push (VAPID)
> Design: `08-notification/push-notification-architecture.md`

| Env | Owner | Required when | Purpose |
|---|---|---|---|
| `VAPID_PUBLIC_KEY` | notification | yes | VAPID public key for push signing |
| `VAPID_PRIVATE_KEY` | notification | yes | VAPID private key for push signing |
| `VAPID_SUBJECT` | notification | yes | VAPID identity email (`mailto:admin@pmtl.vn`) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | web | yes | same public key exposed to browser for subscribe |

### Cloudflare cache purge
> Design: `baseline/cache-topology.md`

| Env | Owner | Required when | Purpose |
|---|---|---|---|
| `CLOUDFLARE_ZONE_ID` | api | yes | Cloudflare zone ID for pmtl.vn |
| `CLOUDFLARE_API_TOKEN` | api | yes | scoped cache purge API token |

### Turnstile anti-bot (Phase 2+)
> Design: `baseline/waf-antibot-strategy.md`

| Env | Owner | Required when | Purpose |
|---|---|---|---|
| `TURNSTILE_SITE_KEY` | web | yes | Cloudflare Turnstile public site key |
| `TURNSTILE_SECRET_KEY` | api | yes | Cloudflare Turnstile server-side secret |

### Observability — Prometheus / Grafana / Alertmanager (Phase 2)
> Design: `baseline/observability-architecture.md`

| Env | Owner | Required when | Purpose |
|---|---|---|---|
| `PROMETHEUS_ENABLED` | api | no | enable Prometheus metrics endpoint |
| `GRAFANA_ADMIN_PASSWORD` | infra | yes | Grafana admin UI password |
| `ALERTMANAGER_WEBHOOK_URL` | infra | no | webhook for alert delivery |
| `ALERTMANAGER_EMAIL_FROM` | infra | yes | alert sender email |
| `ALERTMANAGER_EMAIL_TO` | infra | yes | alert recipient email(s) |

### PgBouncer (Phase 2+)
> Design: `baseline/pgbouncer-strategy.md`

| Env | Owner | Required when | Purpose |
|---|---|---|---|
| `PGBOUNCER_DATABASE_URL` | api | yes | connection string via PgBouncer |

Note: When PgBouncer enabled, `DATABASE_URL` changes to point to PgBouncer, not Postgres directly.

---

## Phase 3 — OpenTelemetry / pgvector

### OpenTelemetry
> Design: `baseline/observability-architecture.md`

| Env | Owner | Required when | Purpose |
|---|---|---|---|
| `OTEL_ENABLED` | api + worker | no | enable OTEL SDK |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | api + worker | yes | OTEL Collector endpoint |
| `OTEL_SERVICE_NAME` | api + worker | yes | service identifier in traces |

### pgvector (if trigger met — see pgvector-decision.md)

| Env | Owner | Required when | Purpose |
|---|---|---|---|
| `EMBEDDING_MODEL_URL` | api | yes | embedding inference endpoint |
| `EMBEDDING_API_KEY` | api | yes | embedding API auth key |
| `VECTOR_DIMENSIONS` | api | yes | vector dimension (1536 or 768 — set once, immutable) |

---

## CI/CD secrets (GitHub Actions, not app env)
> Design: `baseline/cicd-deploy-gates.md`

| Secret | Purpose |
|---|---|
| `VPS_SSH_KEY` | SSH key for deploy user |
| `VPS_HOST` | VPS hostname or IP |
| `VPS_DEPLOY_USER` | SSH deploy username |

---

## Env completeness checklist

When scaffolding a new environment, verify:
- [ ] All Phase 1 required vars set
- [ ] `STORAGE_ADAPTER=local` for Phase 1
- [ ] `SMTP_*` all 8 vars set
- [ ] `REVALIDATE_SECRET` matches between api and web envs
- [ ] `API_INTERNAL_URL` points to internal Docker network (not public URL)
- [ ] `COOKIE_SECURE=true` in production
- [ ] No secrets committed to repo
- [ ] `apps/api` boots without env validation errors

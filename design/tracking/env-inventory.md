# ENV_INVENTORY (Danh mục biến môi trường)

File này chốt `env contract inventory (danh mục hợp đồng biến môi trường)` ở mức kiến trúc.
Nó không thay file `.env.example`, nhưng giúp tránh quên nhóm env khi scaffold app.

## Rule

- `apps/api` validate env bằng `Zod` ngay lúc boot.
- `apps/web` và `apps/admin` chỉ đọc env public/client-safe ở boundary phù hợp.
- Không thêm env vô danh nghĩa; mỗi env phải có owner.

## Shared / Infra

| Env | Owner | Required | Purpose |
|---|---|---|---|
| `NODE_ENV` | all | yes | runtime mode |
| `PMTL_APP_ENV` | infra | yes | env label như dev/staging/prod |
| `LOG_LEVEL` | api | yes | pino log level |
| `REQUEST_ID_HEADER` | api | no | correlation header override |

## API

| Env | Owner | Required | Purpose |
|---|---|---|---|
| `API_PORT` | api | yes | NestJS port |
| `API_BASE_URL` | api | yes | canonical API URL |
| `WEB_ORIGIN` | api | yes | allowlisted web origin |
| `ADMIN_ORIGIN` | api | yes | allowlisted admin origin |
| `DATABASE_URL` | api | yes | Postgres connection |
| `JWT_ACCESS_SECRET` | identity | yes | access token signing |
| `JWT_REFRESH_SECRET` | identity | yes | refresh token signing |
| `ACCESS_TOKEN_TTL_MINUTES` | identity | yes | access TTL |
| `REFRESH_TOKEN_TTL_DAYS` | identity | yes | refresh TTL |
| `CSRF_SECRET` | security | yes | CSRF token signing |
| `COOKIE_DOMAIN` | security | yes | cookie scope |
| `COOKIE_SECURE` | security | yes | secure cookie toggle |
| `LOCAL_STORAGE_ROOT` | storage | yes | local disk root |
| `PUBLIC_MEDIA_BASE_URL` | storage | yes | public media URL base |
| `MAX_AVATAR_MB` | storage | yes | avatar size limit |
| `MAX_IMAGE_MB` | storage | yes | image size limit |
| `MAX_DOCUMENT_MB` | storage | yes | document size limit |
| `MAX_VIDEO_MB` | storage | no | video size limit |
| `SMTP_HOST` | notification | no | email delivery |
| `SMTP_PORT` | notification | no | email delivery |
| `SMTP_USER` | notification | no | email delivery |
| `SMTP_PASS` | notification | no | email delivery |
| `VAPID_PUBLIC_KEY` | notification | no | web push |
| `VAPID_PRIVATE_KEY` | notification | no | web push |
| `VAPID_SUBJECT` | notification | no | web push identity |

## Optional phase 2+

| Env | Owner | Required when enabled | Purpose |
|---|---|---|---|
| `VALKEY_URL` | rate-limit/queue/cache | yes | shared state store |
| `BULLMQ_PREFIX` | queue | yes | queue namespace |
| `MEILI_HOST` | search | yes | Meilisearch host |
| `MEILI_MASTER_KEY` | search | yes | Meilisearch auth |
| `S3_ENDPOINT` | storage | yes | object storage endpoint |
| `S3_BUCKET` | storage | yes | object storage bucket |
| `S3_ACCESS_KEY_ID` | storage | yes | object storage auth |
| `S3_SECRET_ACCESS_KEY` | storage | yes | object storage auth |

## Web

| Env | Owner | Required | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | web | yes | canonical public site URL |
| `NEXT_PUBLIC_API_BASE_URL` | web | yes | API origin for browser/server fetch |
| `NEXT_PUBLIC_MEDIA_BASE_URL` | web | yes | media origin |

## Admin

| Env | Owner | Required | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_ADMIN_URL` | admin | yes | canonical admin URL |
| `NEXT_PUBLIC_API_BASE_URL` | admin | yes | API origin |

## Notes

- Khi thêm env mới, phải cập nhật:
  - file này
  - `.env.example` hoặc env example liên quan
  - `config.schemas.ts` owner module

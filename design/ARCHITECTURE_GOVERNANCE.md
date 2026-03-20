# ARCHITECTURE_GOVERNANCE

File này là checklist gộp để đọc nhanh khi chuẩn hóa hoặc review toàn bộ `design/`.
Mục tiêu là giảm việc phải nhảy qua quá nhiều file chỉ để trả lời:

- kiến trúc nào đã chốt
- hạ tầng nào là baseline cho current phase
- pattern nào AI/dev không được bẻ lệch

## Baseline hiện tại đã chốt

- Mô hình triển khai ưu tiên: `single VPS, low-cost, production-minded`.
- Core runtime giữ nguyên:
  - `Postgres`
  - `PgBouncer`
  - `Valkey` (`Redis-compatible`)
  - `execution queue`
  - `Meilisearch`
  - `Caddy`
- Không thêm:
  - Kubernetes
  - Kafka
  - microservices

## Canonical rules

- PostgreSQL là source of truth duy nhất cho dữ liệu ứng dụng.
- `Valkey` (`Redis-compatible`) chỉ giữ cache, execution queue, rate-limit counters, coordination state.
- Meilisearch chỉ là search projection.
- Business event quan trọng phải đi qua:
  - `canonical write`
  - `outbox_events`
  - `dispatcher`
  - `execution queue`
  - `worker`

## Boundary rules

- Mọi boundary quan trọng phải có schema runtime rõ:
  - request body
  - route params
  - query
  - queue payload
  - webhook payload
  - search document
  - env contract
- `Zod` là lựa chọn mặc định.

## Storage rules

### Current phase
- Current production fit cho PMTL_VN là:
  - `storage abstraction` bắt buộc
  - `local disk storage adapter` là implementation đầu tiên
  - file/media vẫn có thể nằm trên VPS nếu current infra chưa có object storage

### Target phase
- Hướng nâng cấp tiếp theo là `S3-compatible object storage`.
- Business logic không được phụ thuộc trực tiếp local filesystem path.
- Adapter storage tối thiểu phải có:
  - `uploadFile(...)`
  - `deleteFile(...)`
  - `getPublicUrl(...)`
  - `getSignedUrl(...)` có thể stub nếu local chưa cần

### File metadata canonical
- Metadata file phải nằm trong Postgres và đủ tối thiểu:
  - `id`
  - `storage_provider`
  - `object_key`
  - `original_filename`
  - `content_type`
  - `size_bytes`
  - `checksum`
  - `owner_id`
  - `created_at`
- Object key phải an toàn, không dùng trực tiếp raw filename từ user.
- Local storage phải tách thư mục rõ:
  - `uploads/avatars/`
  - `uploads/posts/`
  - `uploads/attachments/`

## Upload pipeline rules

- Upload phải validate:
  - mime/type
  - extension allowlist
  - size
- Nếu là ảnh, nên có thumbnail/variant strategy rõ.
- File mới không hợp lệ phải `fail closed`.
- Design phải chừa chỗ cho scan/quarantine nếu sau này bật.

## Cross-cutting tables cần có

- `outbox_events`
- `audit_logs`
- `feature_flags`
- `media_assets`

## Preferred tooling choices

### Queue / background jobs
- Giữ baseline `Valkey` (`Redis-compatible`) + execution queue.
- Preferred implementation là `BullMQ` thay vì hand-rolled queue semantics.
- `Temporal` không phải baseline cho current phase:
  - quá nặng cho `single VPS`
  - chỉ cân nhắc nếu sau này cần workflow dài, nhiều bước, và durability rất cao
- `QStash` chỉ là optional candidate cho webhook hoặc external callback fan-out, không phải primary queue của current architecture

### Search
- Giữ `Meilisearch` làm search engine chính.
- Không đổi sang `Typesense` hoặc `Algolia` ở current phase chỉ vì “tool xịn hơn”.
- Chỉ cân nhắc `Algolia` nếu mục tiêu là giảm gánh vận hành search bằng SaaS và chấp nhận external dependency rõ ràng.

### Storage
- Current phase:
  - `local disk storage adapter`
- Target phase ưu tiên:
  - `Cloudflare R2` như lựa chọn `S3-compatible` đầu tiên
- `MinIO` chỉ hợp khi muốn self-host object storage và chấp nhận tăng tải vận hành.

### Edge / proxy / CDN
- Giữ `Caddy` là reverse proxy origin hiện tại.
- Có thể đặt `Cloudflare` free plan phía trước `Caddy` cho:
  - CDN
  - SSL edge
  - DNS
  - một phần rate limit / bot filtering
- Không coi Cloudflare là lý do để bỏ app-layer rate limit hoặc bỏ Caddy trong current phase.

### Observability
- Current 1 VPS baseline nên lean:
  - `Prometheus`
  - `Grafana`
  - `Pino`
  - app `/metrics`
  - health endpoints
- `OTEL + Tempo` không nên là mặc định phải tự host ngay trên 1 VPS.
- Nếu thực sự cần traces sớm, ưu tiên cân nhắc managed option như `Grafana Cloud` free tier trước khi tự host full tracing stack.

### Auth
- Giữ `Payload auth` là authority duy nhất.
- Không chuyển sang `Clerk`, `Supabase Auth`, `Auth.js` trong current architecture baseline.

### Database
- Giữ `Postgres + PgBouncer`.
- Managed Postgres là khả năng vận hành sau này, không phải lý do để đổi current design sang `Supabase` hoặc `Neon` ngay lúc này.

## Tooling status

### Accepted

| Tool / option | Status | Ghi chú ngắn |
|---|---|---|
| `Valkey` | accepted | In-memory store ưu tiên cho cache, rate-limit, execution queue; giữ compatibility với hệ Redis |
| `BullMQ` | accepted | Queue implementation ưu tiên trên nền `Valkey`/`Redis-compatible execution queue` hiện tại |
| `Meilisearch` | accepted | Giữ làm public search engine chính |
| `Payload auth` | accepted | Auth authority duy nhất |
| `Cloudflare` trước `Caddy` | accepted | Edge option tốt cho CDN, SSL, DNS, basic protection |
| `Cloudflare R2` | accepted | Target object storage ưu tiên sau local adapter |
| `Prometheus + Grafana + Alertmanager + Pino` | accepted | Observability baseline cho current phase |

### Deferred

| Tool / option | Status | Ghi chú ngắn |
|---|---|---|
| `Redis OSS/managed Redis` | deferred | Vẫn tương thích, nhưng current preference nghiêng về `Valkey` cho OSS posture |
| `OpenTelemetry + Tempo` | deferred | Chỉ bật khi thật sự cần traces; ưu tiên managed backend nếu cần sớm |
| `Grafana Cloud` | deferred | Hợp nếu muốn giảm tự host observability stack |
| `pgvector` | deferred | Chỉ thêm khi related-content / recommendation đã chốt |
| `MinIO` | deferred | Chỉ cân nhắc nếu muốn self-host object storage |
| `QStash` | deferred | Chỉ hợp cho webhook/external callback fan-out, không phải primary queue |
| `Supabase` / `Neon` | deferred | Chỉ cân nhắc khi có áp lực vận hành DB thật sự |

### Rejected for current phase

| Tool / option | Status | Ghi chú ngắn |
|---|---|---|
| Hand-rolled Redis/Valkey queue semantics | rejected | Không ưu tiên tự build khi `BullMQ` đã giải bài toán tốt hơn |
| `Temporal` | rejected | Quá nặng cho `single VPS` current phase |
| `Typesense` / `Algolia` thay `Meilisearch` ngay | rejected | Chưa có lý do đủ mạnh để đổi search stack hiện tại |
| `Clerk` / `Supabase Auth` / `Auth.js` thay `Payload auth` | rejected | Phá auth authority đã chốt |

## App-layer runtime controls

### Rate limit
- Rate limit phải có ở app layer và dùng `Valkey` hoặc store `Redis-compatible`.
- Tối thiểu cho:
  - login
  - register
  - forgot password
  - create post
  - create comment
  - search
  - upload file

### Health endpoints
- Tối thiểu phải có:
  - `/health/live`
  - `/health/ready`
  - `/health/startup`
- `ready` phải check tối thiểu:
  - Postgres
  - `Valkey` / `Redis-compatible store`
  - Meilisearch

### Metrics
- Phải expose `/metrics`.
- Tối thiểu nên có:
  - request count
  - request latency
  - error count
  - queue length
  - job success/fail count
  - job duration
  - outbox pending count
  - upload success/fail count
  - rate limit hit count

## Recovery rules

- Recovery path phải được ghi rõ là một trong:
  - `replay outbox`
  - `redrive execution jobs`
  - `recompute projection`
  - `rebuild index/bundle/read model`

## Feature rollout rules

- Feature mới có rủi ro nên đi sau `feature_flags`.
- Helper tối thiểu:
  - `isFeatureEnabled(key)`

## Khi review một use-case mới

1. owner module là ai?
2. canonical record ghi ở đâu trước?
3. boundary schema đã chốt chưa?
4. side effect nào phải đi qua `outbox_events`?
5. queue payload có version và idempotency key chưa?
6. file/media có đi qua storage abstraction không?
7. action này có cần audit log không?
8. flow này có cần rate limit hoặc request guard không?
9. readiness/metrics có cần cập nhật không?
10. recovery path là replay, recompute, hay rebuild?

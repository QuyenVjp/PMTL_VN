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
  - `Redis`
  - `execution queue`
  - `Meilisearch`
  - `Caddy`
- Không thêm:
  - Kubernetes
  - Kafka
  - microservices

## Canonical rules

- PostgreSQL là source of truth duy nhất cho dữ liệu ứng dụng.
- Redis chỉ giữ cache, execution queue, rate-limit counters, coordination state.
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

## App-layer runtime controls

### Rate limit
- Rate limit phải có ở app layer và dùng Redis.
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
  - Redis
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

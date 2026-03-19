# PMTL Infrastructure: Why & What (Lý do & Mục đích)

Tài liệu này giải thích kiến trúc hạ tầng chuẩn của PMTL_VN theo hướng production-minded.
Đây là bản đọc nhanh để chốt:

- thành phần nào là bắt buộc
- business event quan trọng đi theo flow nào
- media/file nên sống ở đâu trong current phase và target phase
- observability chuẩn phải nhìn đủ metrics, logs, traces

Nếu cần topology vận hành và exporters chi tiết hơn, đọc thêm:
- `design/infra/INFRA_DEEP_DIVE.md`

---

## 6 Core Groups (6 Nhóm Chính)

### 1. **Business Layer** (Lớp ứng dụng chính)

| Component | Chức năng | Lợi ích mang lại |
|-----------|----------|---------|
| **apps/web** (Next.js) | Frontend / UI | Phục vụ người dùng cuối |
| **apps/cms** (Payload) | Backend / API / Admin | Cung cấp API, auth authority và admin surface |
| **worker (tiến trình xử lý nền)** | Background execution | Xử lý reindex, notify, email, webhook, replay |
| **Caddy** (Reverse Proxy) | Ingress / SSL | Định tuyến và quản lý HTTPS |

**Request Flow**: User → Caddy → web/cms → database → return response

---

### 2. **Data Layer** (Lớp dữ liệu & Lưu trữ)

| Technology | Chức năng | Tại sao cần? | Lợi ích |
|---|---|---|---|
| **Postgres** | source of truth (nguồn dữ liệu gốc đáng tin cậy nhất) | Lưu dữ liệu canonical | Reliable, ACID, backup rõ |
| **`outbox_events` trong Postgres** | Transactional event log | Đảm bảo side effect quan trọng không bị rơi sau canonical write | Reliable handoff, replay, auditability |
| **Redis** | Cache + execution queue (hàng đợi thực thi) | Tăng tốc read và chạy workload nền | Fast reads, async execution |
| **Meilisearch** | Public search engine | Full-text, typo tolerance, facets | Search nhanh và thân thiện |
| **Storage abstraction + Local Disk adapter** | Current media/file runtime cho 1 VPS | Khớp hạ tầng hiện tại nhưng không khóa logic vào local path | Rẻ, dễ chạy, dễ nâng cấp |
| **S3-compatible Object Storage** (target phase) | Binary asset storage nâng cấp | Tách file/media khỏi app runtime khi cần scale/backup tốt hơn | Backup dễ, scan/quarantine rõ |
| **pgvector** (optional) | Semantic retrieval trong Postgres | Chỉ dùng khi cần related-content / recommendation | Bổ sung cho Meilisearch, không thay Meilisearch |
| **PgBouncer** | Connection Pooling | Giảm tải connection trực tiếp vào Postgres | Ổn định DB tốt hơn |

**Architecture Diagram**:
```txt
Apps (web/cms/worker)
     ↓
PgBouncer
     ↓
Postgres

Apps cũng truy vấn thêm:
  - Redis (cache + execution queue)
  - Meilisearch (public search)
  - Storage adapter (current local disk, target S3-compatible)
```

---

### 3. **Boundary Validation & Env Contracts** (Chuẩn hóa boundary và hợp đồng môi trường)

| Thành phần | Chức năng | Tại sao cần? | Lợi ích |
|------|----------|--------|---------|
| **Zod at boundaries** | Validate request, route params, queue payload, webhook payload, search document | TypeScript không thay được runtime validation | Fail fast, debug dễ hơn |
| **Env contracts** | Validate env từ lúc boot | Tránh chết muộn vì env sai/thiếu | Startup rõ lỗi hơn |
| **Event versioning** | Chuẩn hóa payload outbox/queue | Tránh producer/consumer lệch nhau | Replay và migration rõ ràng |

**Boundary Flow**:
```txt
Client / admin action / cron / webhook
     ↓
Schema validation tại boundary
     ↓
Canonical write transaction
     ↓
Append outbox event nếu có side effect quan trọng
     ↓
Dispatcher / worker tiêu thụ payload đã chuẩn hóa
```

**Storage Boundary Flow**:
```txt
Upload request
     ↓
Schema + mime/size validation
     ↓
Storage abstraction
     ↓
Local adapter (current) hoặc S3 adapter (target)
     ↓
Metadata canonical lưu trong Postgres
```

---

### 4. **Observability** (Khả năng quan sát & Giám sát)

**Stack theo pha**:
- Baseline: Prometheus + Grafana + Alertmanager + Pino
- Optional upgrade: OpenTelemetry + Tempo hoặc managed equivalent như Grafana Cloud

| Tool | Chức năng | Tại sao chọn? | Lợi ích |
|------|----------|--------|---------|
| **Prometheus** | TSDB cho metrics | Giám sát host/service/runtime | Query và alert mạnh |
| **Grafana** | Dashboard | Xem metrics và dashboard vận hành | Giao diện tổng hợp |
| **Alertmanager** | Alert routing | Gửi cảnh báo tới Telegram/Slack/Email | Điều hướng cảnh báo |
| **Pino** | Structured logs | Ghi log theo context nhất quán | Debug và audit tốt hơn |
| **OpenTelemetry** (optional) | Distributed tracing instrumentation | Theo dõi request và job xuyên nhiều service | Thấy rõ bottleneck theo span |
| **Tempo** hoặc managed trace backend (optional) | Trace storage backend | Lưu trace tập trung | Correlate metrics + logs + traces |

**Observability Flow**:
```txt
Services expose metrics
     ↓
Prometheus
     ↓
Grafana / Alertmanager

Services emit traces qua OpenTelemetry
     ↓
Tempo hoặc managed backend
     ↓
Grafana

Services emit structured logs qua Pino
     ↓
Log sink / console / future log pipeline
```

---

### 5. **Async Reliability** (Độ tin cậy cho side effects bất đồng bộ)

| Thành phần | Chức năng | Lợi ích |
|---------|----------|---|
| **`outbox_events`** | Ghi business event trong cùng transaction với canonical write | Không mất event quan trọng |
| **Outbox dispatcher** | Poll event chưa xử lý, phát sang execution queue hoặc handle trực tiếp | Retry, backoff, replay rõ |
| **Execution queue** (`BullMQ` preferred) | Chạy workload nền như reindex, notify, email, webhook | Tách execution khỏi request path |
| **Reconciliation / replay jobs** | Soát drift giữa Postgres và downstream systems | Có recovery path chuẩn |

**Chuẩn flow cần nhớ**:
```txt
Canonical write vào Postgres
  + append `outbox_events` trong cùng transaction
     ↓
Dispatcher đọc outbox chưa xử lý
     ↓
Phát sang execution queue hoặc xử lý idempotent trực tiếp
     ↓
Mark processed / failed / retryable
```

**Áp dụng bắt buộc cho business event quan trọng**:
- publish/update content để reindex
- notification fan-out
- email delivery request
- webhook/revalidation

**Không nên dùng trực tiếp cho business event quan trọng**:
- Redis pub/sub thuần
- fire-and-forget webhook từ request path
- chỉ enqueue queue mà không có transactional handoff

---

### 6. **External Services** (Các dịch vụ bên thứ ba)

| Service | Chức năng | Lợi ích |
|---------|----------|---|
| Email (SMTP/SendGrid) | Email Delivery | Gửi password reset và downstream notifications |
| Push (Firebase / Web Push) | Web Push | Gửi thông báo tới trình duyệt |
| Cloudflare (free plan) | DNS + CDN + edge SSL + basic protection | Giảm tải origin, tăng tốc asset/public pages |
| Local Disk Storage (current phase) | Media/File Storage trên 1 VPS | Đủ dùng trước mắt nếu có storage abstraction và backup rõ |
| Cloudflare R2 (preferred target) | Media/File Storage target phase | `S3-compatible`, zero-egress oriented, hợp bài toán binary assets |
| MinIO (optional self-host) | Media/File Storage target phase | Chỉ dùng khi muốn tự giữ object storage trong hạ tầng riêng |
| Embedding Provider | Embedding generation | Dùng khi semantic retrieval / related-content được bật |
| Off-site Backup | Snapshot/backup ngoài máy chủ app | Giảm rủi ro mất dữ liệu VPS |

**Media/File note**:
- current production fit có thể dùng local disk trên VPS
- nhưng phải có storage abstraction và metadata canonical rõ
- target phase ưu tiên `Cloudflare R2`; `MinIO` chỉ là self-host fallback
- upload mới nên đi qua allowlist + size/mime validation + scan/quarantine
- binary asset không nên là phần sống còn trong container filesystem

---

## Current Production Fit (Phù hợp production hiện tại)

Cho current phase của PMTL_VN, baseline thực dụng là:

- `single VPS`
- `Postgres + PgBouncer + Redis + execution queue + Meilisearch + Caddy`
- `BullMQ` là lựa chọn nên ưu tiên cho execution queue implementation
- media/file dùng `local disk storage adapter`
- binary metadata nằm trong Postgres
- `Cloudflare` có thể đứng trước `Caddy` để lấy CDN/SSL/edge protection
- `Cloudflare R2` là hướng nâng cấp storage kế tiếp, không phải blocker để chạy production sớm

Những thứ nên làm ngay thay vì over-engineer:

- storage abstraction
- outbox pattern hoàn chỉnh
- Zod boundary validation
- Redis rate limit ở app layer
- audit logs
- `/health/*` + `/metrics`
- feature flags đơn giản
- ưu tiên tool có sẵn thay vì tự build thêm control-plane nếu `BullMQ` hoặc managed free-tier đã giải được bài toán

---

## Real-world Request Flows (Luồng yêu cầu thực tế)

### Case 1: User Loads Homepage
```txt
User truy cập domain
  ↓
Caddy
  ↓
Route / → apps/web
  ↓
Web gọi CMS/BFF để lấy dữ liệu
  ↓
Kiểm tra Redis cache
  ✓ Hit: trả về nhanh
  ✗ Miss: query Postgres → ghi Redis → trả về
```

**Lợi ích của caching**: giảm tải read-path và giữ UX mượt hơn.

---

### Case 2: User Searches "Phật pháp"
```txt
User gõ từ khóa vào ô search
  ↓
Web gọi public search API
  ↓
CMS query Meilisearch
  ✓ Result: nhanh, typo tolerance, facets
  ✗ Nếu Meilisearch lỗi: fallback về Payload/Postgres theo contract
  ↓
Web hiển thị kết quả
```

**Ghi chú semantic**:
- ô search chính vẫn ưu tiên Meilisearch
- `pgvector` chỉ bật khi cần related-content / recommendation / semantic retrieval
- không thay Meilisearch bằng `pgvector`

---

### Case 3: Editor Publishes New Post
```txt
Editor nhấn Publish
  ↓
CMS mở transaction canonical
  ↓
Ghi Postgres:
  ✓ status = published
  ✓ publishedAt = now()
  ✓ append `outbox_events` cho `post.published`
  ↓
Commit transaction
  ↓
UI trả về thành công ngay

Phía sau:
  ↓
Dispatcher poll `outbox_events`
  ↓
Phát execution jobs:
  - reindex_post
  - notify_subscribers
  - revalidate_web
  ↓
Worker xử lý idempotent
  ↓
Mark processed / retryable / failed
```

**Lợi ích của Outbox + Queue**: canonical write và downstream side effect được tách rời nhưng vẫn handoff chắc tay.

---

### Case 4: Slow Request Diagnosis
```txt
User mở trang chậm
  ↓
Trace cho thấy:
  - web render
  - CMS API
  - Postgres query
  - Meilisearch query
  - queue handoff hoặc worker call
  ↓
Grafana xem trace trong Tempo
  ↓
Đối chiếu với metrics và logs
  ↓
Xác định bottleneck thật
```

**Lợi ích của tracing**: biết request chậm do DB, search, queue hay worker thay vì đoán.

---

## Failure Scenarios & Recovery (Các tình huống lỗi & Phục hồi)

| Component | Impact (Ảnh hưởng) | Recovery Action | Estimated Time |
|-----------|-------------------|-----------------|----------------|
| Postgres | Down toàn hệ thống | Restart hoặc restore backup | 5-30 phút |
| Redis | Cache chậm, execution queue bị nghén | Restart; outbox giữ pending events để replay | < 1 phút |
| Meilisearch | Search degrade / fallback | Rebuild index, replay sync, batch reindex | 5-30 phút |
| Local Storage | Upload mới fail, asset serve có thể degrade | Khôi phục volume/path, retry upload/serve | 5-30 phút |
| Object Storage (target) | Upload mới fail, asset serve có thể degrade | Retry upload/serve, fail closed cho upload mới | 5-30 phút |
| Tempo / OTEL | Mất trace nhưng app vẫn chạy | Restore collector/backend | < 5 phút |
| PgBouncer | App mất kết nối tới DB | Restart hoặc kết nối trực tiếp DB tạm thời | < 1 phút |
| Caddy | Người dùng không thể truy cập | Restart ingress | < 1 phút |
| worker | Tác vụ ngầm bị trì trệ | Restart worker; replay từ outbox nếu cần | < 1 phút |

**Critical Path**: Postgres → PgBouncer → CMS → Web  
**Critical Async Path**: Postgres transaction → outbox_events → dispatcher → execution queue → worker

---

## Pre-launch Checklist (Danh sách kiểm tra trước khi ra mắt)

- [ ] Cấu hình backup Postgres ngoài máy chủ app.
- [ ] Chốt schema `outbox_events`, retry policy, replay policy, dead-letter policy.
- [ ] Chốt `BullMQ` làm execution queue implementation mặc định nếu stack vẫn là Redis-based jobs.
- [ ] Chốt storage abstraction, local adapter config, và metadata schema cho `media_assets`.
- [ ] Chốt Zod boundary schemas và env contracts cho web/cms/worker.
- [ ] Chốt Redis app-layer rate limit cho auth/search/write/upload.
- [ ] Chốt `audit_logs` và `feature_flags` schema/helper.
- [ ] Chốt `/health/live`, `/health/ready`, `/health/startup`, `/metrics`.
- [ ] Thiết lập Prometheus + Grafana + Alertmanager.
- [ ] Chỉ bật OTEL/tracing khi thực sự cần; nếu cần sớm, cân nhắc Grafana Cloud trước khi tự host Tempo.
- [ ] Chuẩn bị migration path từ local storage sang `Cloudflare R2` hoặc `S3-compatible` object storage.
- [ ] Chốt Cloudflare edge usage phía trước Caddy nếu team muốn lấy CDN/SSL/basic protection.
- [ ] Chỉ bật `pgvector` nếu use case recommendation / related-content đã rõ.
- [ ] Định nghĩa alert rules cho DB, queue, outbox lag, search health, object storage health.
- [ ] Thực hiện load test và failure drill.
- [ ] Viết runbook recovery cơ bản cho team.

---

## TL;DR

**Postgres + Outbox + Execution Queue + Search + Local-first Storage Abstraction + Tracing = Fast, Reliable, Observable System**

- **Caching**: phản hồi nhanh hơn cho read-path.
- **Outbox + Queue**: side effect quan trọng không bị rơi.
- **Advanced Search**: Meilisearch lo search box công khai.
- **Semantic Optionality**: `pgvector` chỉ bật khi thực sự cần.
- **Boundary Validation**: fail fast ở request, env, queue payload, webhook, search document.
- **Storage Abstraction**: chạy local trước nhưng không khóa đường nâng cấp lên `S3`.
- **Observability**: metrics + logs + traces, không nhìn từng mảnh rời rạc.

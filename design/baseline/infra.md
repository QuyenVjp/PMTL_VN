# PMTL Infrastructure: Why & What (Lý do & Mục đích)

Tài liệu này chỉ chốt `infra baseline + phase triggers` cho PMTL_VN.
Nó không phải nơi lặp lại toàn bộ security, failure matrix, hay governance policy.
Đây là bản đọc nhanh để chốt:

- thành phần nào là baseline thật sự phải có
- thành phần nào chỉ nên bật khi đã có pain thật
- media/file nên sống ở đâu trong current phase và target phase
- observability, search, queue nên lên theo phase nào

Nếu cần topology vận hành và exporters chi tiết hơn, đọc thêm:

- `docs/ops/infra-deep-dive.md`
- `docs/learning/STUDENT_VPS_PRODUCTION_ROADMAP.md` nếu anh đang học production từ góc nhìn một người mới vận hành VPS bằng Docker Compose
- `design/tracking/implementation-mapping.md` để biết decision nào đã map sang code/runtime thật
- `design/ops/restore-drill-log.md` để lưu evidence restore drill thay vì chỉ nói bằng policy
- `design/DECISIONS.md` nếu cần cross-cutting rules tổng

---

## Scope of this file

File này trả lời 4 câu:

- phase 1 baseline là gì
- cái gì deferred
- điều kiện nào mới được bật component optional
- hạ tầng phase hiện tại cần command/rule tối thiểu gì

Những thứ không định nghĩa ở đây:

- auth/session contract chi tiết
- CSP/CSRF/CORS policy chi tiết
- failure matrix theo user-facing behavior
- module write-path specifics

## 6 Core Groups (6 Nhóm Chính)

## Phase mindset cần nhớ trước

- Phase 1 ưu tiên: ship được, debug được, backup được, restore được, secure được.
- Phase 2 mới thêm reliability stack cho async và search nếu feature thật sự đòi hỏi.
- Phase 3 mới nghĩ đến tuning và observability sâu hơn.
- Không cộng service chỉ vì "trông giống production"; chỉ cộng khi đổi lại được lợi ích vận hành rõ ràng.
- `operational simplicity > technical elegance`.

### 1. **Business Layer** (Lớp ứng dụng chính)

| Component                     | Chức năng                      | Lợi ích mang lại                                             |
| ----------------------------- | ------------------------------ | ------------------------------------------------------------ |
| **apps/web** (Next.js)        | Frontend / UI                  | Phục vụ người dùng cuối                                      |
| **apps/api** (NestJS)         | Backend / API / Auth / OpenAPI | Cung cấp domain API, auth authority và orchestration         |
| **apps/admin** (Custom Admin) | Management UI                  | Giao diện quản trị riêng theo template/admin design đã chốt  |
| **apps/worker** (optional)    | Background execution           | Chỉ bật khi async workload đủ đáng để tách khỏi request path |
| **Caddy** (Reverse Proxy)     | Ingress / SSL                  | Định tuyến và quản lý HTTPS                                  |

**Request Flow**: User/Admin → Caddy → web/admin/api → database → return response

---

### 2. **Data Layer** (Lớp dữ liệu & Lưu trữ)

| Technology                                      | Chức năng                                             | Tại sao cần?                                                  | Lợi ích                                         |
| ----------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------- |
| **Postgres**                                    | source of truth (nguồn dữ liệu gốc đáng tin cậy nhất) | Lưu dữ liệu canonical                                         | Reliable, ACID, backup rõ                       |
| **`outbox_events` trong Postgres** (optional)   | Transactional event log                               | Chỉ bật khi side effect quan trọng đã đủ cần reliability      | Reliable handoff, replay, auditability          |
| **Valkey** (`Redis-compatible`) (optional)      | Cache + rate limit + execution queue                  | Chỉ bật khi cache/rate-limit/async workload có pain thật      | Fast reads, async execution                     |
| **Meilisearch** (optional)                      | Public search engine                                  | Chỉ bật khi search đủ core để xứng đáng với sync burden       | Search nhanh và thân thiện                      |
| **Storage abstraction + Local Disk adapter**    | Current media/file runtime cho 1 VPS                  | Khớp hạ tầng hiện tại nhưng không khóa logic vào local path   | Rẻ, dễ chạy, dễ nâng cấp                        |
| **S3-compatible Object Storage** (target phase) | Binary asset storage nâng cấp                         | Tách file/media khỏi app runtime khi cần scale/backup tốt hơn | Backup dễ, scan/quarantine rõ                   |
| **pgvector** (optional)                         | Semantic retrieval trong Postgres                     | Chỉ dùng khi cần related-content / recommendation             | Bổ sung cho Meilisearch, không thay Meilisearch |
| **PgBouncer** (optional)                        | Connection Pooling                                    | Chỉ bật khi connection pressure là vấn đề thật                | Ổn định DB tốt hơn                              |

**Architecture Diagram**:

```txt
Apps (web/api/admin/worker)
     ↓
Postgres

Apps cũng truy vấn thêm:
  - Valkey / Redis-compatible store (khi phase cần cache/rate-limit/queue)
  - Meilisearch (khi phase cần public search engine riêng)
  - Storage adapter (current local disk, target S3-compatible)
```

**Cảnh báo current phase**:

- local storage là giải pháp thực dụng, không phải giải pháp đẹp
- disk đầy, volume mount sai, hoặc restore lệch DB/file đều là failure mode thật
- phải coi local storage là điểm yếu đã biết, không được tô hồng

---

### 3. **Boundary Validation & Env Contracts** (Chuẩn hóa boundary và hợp đồng môi trường)

| Thành phần            | Chức năng                                                                       | Tại sao cần?                                  | Lợi ích                     |
| --------------------- | ------------------------------------------------------------------------------- | --------------------------------------------- | --------------------------- |
| **Zod at boundaries** | Validate request, route params, queue payload, webhook payload, search document | TypeScript không thay được runtime validation | Fail fast, debug dễ hơn     |
| **Env contracts**     | Validate env từ lúc boot                                                        | Tránh chết muộn vì env sai/thiếu              | Startup rõ lỗi hơn          |
| **Event versioning**  | Chuẩn hóa payload outbox/queue                                                  | Tránh producer/consumer lệch nhau             | Replay và migration rõ ràng |

**Boundary Flow phase 1**:

```txt
Client / admin action / cron / webhook
     ↓
Schema validation tại boundary
     ↓
Canonical write transaction
     ↓
Trả response hoặc chạy side effect đồng bộ nếu vẫn còn đơn giản và đủ an toàn
```

**Giới hạn cần nhớ**:

- validation không thay cho authorization
- validation không thay cho anti-abuse
- validation không thay cho business invariant
- validation không thay cho upload security hoặc webhook verification

**Boundary Flow phase 2 khi async reliability cần thiết**:

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

- Baseline phase 1: Pino + `/health/*` + `/metrics` + runbook + restore drills
- Phase 2: Prometheus + Grafana + Alertmanager nếu đã có metric/alert use case rõ
- Optional upgrade: OpenTelemetry + Tempo hoặc managed equivalent như Grafana Cloud

| Tool                                            | Chức năng                           | Tại sao chọn?                               | Lợi ích                           |
| ----------------------------------------------- | ----------------------------------- | ------------------------------------------- | --------------------------------- |
| **Pino**                                        | Structured logs                     | Ghi log theo context nhất quán              | Debug và audit tốt hơn            |
| **Prometheus** (optional)                       | TSDB cho metrics                    | Khi đã cần lịch sử metrics và alert rule    | Query và alert mạnh               |
| **Grafana** (optional)                          | Dashboard                           | Xem metrics và dashboard vận hành           | Giao diện tổng hợp                |
| **Alertmanager** (optional)                     | Alert routing                       | Gửi cảnh báo tới Telegram/Slack/Email       | Điều hướng cảnh báo               |
| **OpenTelemetry** (optional)                    | Distributed tracing instrumentation | Theo dõi request và job xuyên nhiều service | Thấy rõ bottleneck theo span      |
| **Tempo** hoặc managed trace backend (optional) | Trace storage backend               | Lưu trace tập trung                         | Correlate metrics + logs + traces |

**Observability Flow phase 1**:

```txt
Request / job chạy
     ↓
Pino logs + app metrics + health checks
     ↓
Con người đọc logs / metric đơn giản / incident note
```

**Nguyên tắc**:

- nếu alert không có người xử lý thì chưa nên bật
- nếu dashboard không có câu hỏi vận hành cụ thể để trả lời thì chưa nên làm

**Observability Flow phase 2**:

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

Không phải mọi dự án phase đầu đều cần cụm này.
Nó chỉ đáng bật khi side effect đã vừa quan trọng vừa dễ rơi, hoặc đủ chậm để làm request path xấu đi.

**Ngưỡng cân nhắc thực dụng**:

- queue/worker: khi side effect làm request path chậm rõ hoặc retry thủ công không còn chấp nhận được
- outbox: khi failure cost của side effect cao hơn complexity tax của transactional handoff

| Thành phần                               | Chức năng                                                                                        | Lợi ích                                                             |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| **`outbox_events`**                      | Ghi business event trong cùng transaction với canonical write                                    | Không mất event quan trọng khi đã quyết định dùng async reliability |
| **Outbox dispatcher**                    | Poll event chưa xử lý, phát sang execution queue hoặc handle trực tiếp                           | Retry, backoff, replay rõ                                           |
| **Execution queue** (`BullMQ` preferred) | Chạy workload nền như reindex, notify, email, webhook trên nền `Valkey` / Redis-compatible store | Tách execution khỏi request path                                    |
| **Reconciliation / replay jobs**         | Soát drift giữa Postgres và downstream systems                                                   | Có recovery path chuẩn                                              |

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

**Chỉ áp dụng khi business event đã đủ quan trọng**:

- publish/update content để reindex
- notification fan-out
- email delivery request
- webhook/revalidation

**Khi đã bật async reliability, không nên dùng trực tiếp cho business event quan trọng**:

- Redis/Valkey pub/sub thuần
- fire-and-forget webhook từ request path
- chỉ enqueue queue mà không có transactional handoff

---

### 6. **External Services** (Các dịch vụ bên thứ ba)

| Service                            | Chức năng                               | Lợi ích                                                           |
| ---------------------------------- | --------------------------------------- | ----------------------------------------------------------------- |
| Email (SMTP/SendGrid)              | Email Delivery                          | Gửi password reset và downstream notifications                    |
| Push (Firebase / Web Push)         | Web Push                                | Gửi thông báo tới trình duyệt                                     |
| Cloudflare (free plan)             | DNS + CDN + edge SSL + basic protection | Giảm tải origin, tăng tốc asset/public pages                      |
| Local Disk Storage (current phase) | Media/File Storage trên 1 VPS           | Đủ dùng trước mắt nếu có storage abstraction và backup rõ         |
| Cloudflare R2 (preferred target)   | Media/File Storage target phase         | `S3-compatible`, zero-egress oriented, hợp bài toán binary assets |
| MinIO (optional self-host)         | Media/File Storage target phase         | Chỉ dùng khi muốn tự giữ object storage trong hạ tầng riêng       |
| Embedding Provider                 | Embedding generation                    | Dùng khi semantic retrieval / related-content được bật            |
| Off-site Backup                    | Snapshot/backup ngoài máy chủ app       | Giảm rủi ro mất dữ liệu VPS                                       |

**Media/File note**:

- current production fit có thể dùng local disk trên VPS
- nhưng phải có storage abstraction và metadata canonical rõ
- target phase ưu tiên `Cloudflare R2`; `MinIO` chỉ là self-host fallback
- upload mới nên đi qua allowlist + size/mime validation + scan/quarantine
- binary asset không nên là phần sống còn trong container filesystem
- nếu chưa có persistence volume rõ ràng, không được tự tin coi upload là production-safe

---

## Current Production Fit (Phù hợp production hiện tại)

Cho current phase của PMTL_VN, baseline thực dụng là:

- `single VPS`
- `apps/web + apps/api (NestJS) + apps/admin + Caddy`
- `Postgres`
- `Prisma` là ORM ưu tiên cho current phase
- `Swagger/OpenAPI` là contract layer ưu tiên cho backend
- `apps/admin` dùng custom admin UI theo `shadcn-admin` style/template
- media/file dùng `local disk storage adapter`
- binary metadata nằm trong Postgres
- structured logs bằng `Pino`
- `/health/*` + `/metrics`
- auth/session hardening
- upload hardening
- backup + restore drills
- app-layer rate limit
- `Cloudflare` có thể đứng trước `Caddy` để lấy CDN/SSL/edge protection
- `Cloudflare R2` là hướng nâng cấp storage kế tiếp, không phải blocker để chạy production sớm

Những thứ nên làm ngay thay vì over-engineer:

- storage abstraction
- Zod boundary validation
- security baseline
- restore drill thật sự
- runbook lỗi cơ bản
- audit logs
- feature flags đơn giản
- dependency hygiene
- data correctness cho write path chính

Những thứ nên để phase sau khi đã có pain thật:

- `Valkey`
- `BullMQ`
- `apps/worker`
- `outbox_events`
- `Meilisearch`
- `PgBouncer`
- `Prometheus + Grafana + Alertmanager`
- tracing

## Production minimum commands

Các lệnh dưới đây không thay thế runbook chi tiết, nhưng phải có đường tương đương để người vận hành kiểm tra nhanh:

- health check:
  - `curl /health/live`
  - `curl /health/ready`
  - `curl /health/startup`
- metrics:
  - `/metrics` chỉ là exposure point
  - không được coi là bằng chứng đã có monitoring stack đầy đủ
  - nếu chưa có scraper thì route này chỉ phục vụ debug nội bộ và future scrape
- logs:
  - xem app logs theo service chính
  - grep theo request id / user id / route nếu có
- backup:
  - phải có command/script tạo backup DB
  - phải có command/script kiểm tra backup file tồn tại
- restore:
  - phải có command/script restore vào môi trường cô lập
  - phải có command/script verify app boot sau restore

Nếu chưa chỉ ra được command hoặc script tương đương cho 4 nhóm trên, runbook vẫn chưa đủ thực dụng.

## Thi công lại với NestJS

- Tài liệu này giả định current direction là `apps/api` dùng `NestJS`.
- Không dùng lại tư duy `apps/cms` hay `Payload runtime` làm backend authority.
- Mỗi phần infra chỉ được coi là "đã có" khi đã được map trong:
  - `design/tracking/implementation-mapping.md`

## Security posture tối thiểu cho phase hiện tại

- Auth/session:
  - access token ngắn hạn
  - refresh token rotation nếu dùng refresh flow
  - logout/revoke semantics rõ
  - brute-force guard theo IP và account/email cho auth surfaces
- Browser security:
  - cookie flags rõ
  - CSRF strategy rõ
  - CORS allowlist rõ
  - CSP và security headers rõ
- Upload security:
  - allowlist loại file
  - max size
  - server-side sniffing
  - ownership và delete authorization
- Secrets:
  - production secrets không commit repo
  - nơi lưu secret phải được chốt rõ
- Audit:
  - phải ghi các event auth, admin action, delete/update quan trọng, upload/delete file

## Backup / restore acceptance criteria

- Restore phải được chứng minh, không chỉ được hứa.
- Tối thiểu cần ghi lại:
  - thời gian restore từ bản gần nhất
  - app có boot được sau restore không
  - migration state có khớp không
  - media metadata có khớp file binary còn tồn tại không
  - bước kiểm tra sau restore

## Dependency hygiene

- Mỗi package mới phải có lý do tồn tại.
- Không lấy thêm package chỉ vì tiện một tính năng nhỏ.
- Phải có lịch audit dependency định kỳ và review CVE.

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
Web gọi API/BFF để lấy dữ liệu
  ↓
Kiểm tra cache `Valkey` / Redis-compatible
  ✓ Hit: trả về nhanh
  ✗ Miss: query Postgres → ghi cache → trả về
```

**Lợi ích của caching**: giảm tải read-path và giữ UX mượt hơn.

---

### Case 2: User Searches "Phật pháp"

```txt
User gõ từ khóa vào ô search
  ↓
Web gọi public search API
  ↓
API query Postgres / SQL canonical read path ở phase 1
  ↓
Nếu search đã được nâng cấp ở phase 2:
  API query Meilisearch
    ✓ Result: nhanh, typo tolerance, facets
    ✗ Nếu Meilisearch lỗi: fallback về SQL/API canonical query theo contract
  ↓
Web hiển thị kết quả
```

**Ghi chú semantic**:

- phase 1 không bắt buộc có Meilisearch
- khi search đã là feature core, ô search chính mới ưu tiên Meilisearch
- `pgvector` chỉ bật khi cần related-content / recommendation / semantic retrieval
- không thay Meilisearch bằng `pgvector`

---

### Case 3: Editor Publishes New Post

```txt
Editor nhấn Publish
  ↓
API mở transaction canonical
  ↓
Ghi Postgres:
  ✓ status = published
  ✓ publishedAt = now()
  ↓
Commit transaction
  ↓
UI trả về thành công ngay

Phase 1:
  ↓
revalidate hoặc side effect nhẹ có thể chạy sync nếu còn đơn giản

Phase 2 nếu publish side effects đã quan trọng:
  ↓
append `outbox_events` cho `post.published`
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

**Lợi ích của phase approach**: lúc nhỏ thì flow dễ hiểu và dễ debug; lúc lớn hơn vẫn có đường nâng cấp sang outbox + queue đúng bài.

---

### Case 4: Slow Request Diagnosis

```txt
User mở trang chậm
  ↓
Xem:
  - Pino logs
  - thời gian response
  - disk / RAM / DB status
  - health endpoints
  ↓
Nếu hệ đã đủ lớn để có metrics stack:
  xem Prometheus / Grafana
  ↓
Nếu hệ đã đủ lớn để có traces:
  xem Tempo hoặc managed traces
```

**Lợi ích của phase approach**: bắt đầu bằng thứ anh thật sự đọc được; traces chỉ thêm khi đã biết dùng để làm gì.

---

## Failure Scenarios & Recovery (Các tình huống lỗi & Phục hồi)

| Component                       | Impact (Ảnh hưởng)                          | Recovery Action                                       | Estimated Time |
| ------------------------------- | ------------------------------------------- | ----------------------------------------------------- | -------------- |
| Postgres                        | Down toàn hệ thống                          | Restart hoặc restore backup                           | 5-30 phút      |
| Valkey / Redis-compatible store | Cache chậm, rate limit/queue bị ảnh hưởng   | Restart; nếu chưa có queue thì app vẫn còn đường sống | < 1 phút       |
| Meilisearch                     | Search degrade / fallback                   | Rebuild index, replay sync, batch reindex             | 5-30 phút      |
| Local Storage                   | Upload mới fail, asset serve có thể degrade | Khôi phục volume/path, retry upload/serve             | 5-30 phút      |
| Object Storage (target)         | Upload mới fail, asset serve có thể degrade | Retry upload/serve, fail closed cho upload mới        | 5-30 phút      |
| Tempo / OTEL                    | Mất trace nhưng app vẫn chạy                | Restore collector/backend                             | < 5 phút       |
| PgBouncer                       | App mất kết nối tới DB                      | Restart hoặc kết nối trực tiếp DB tạm thời            | < 1 phút       |
| Caddy                           | Người dùng không thể truy cập               | Restart ingress                                       | < 1 phút       |
| worker                          | Tác vụ ngầm bị trì trệ                      | Restart worker; replay từ outbox nếu cần              | < 1 phút       |

**Critical Path phase 1**: Caddy → API → Postgres → Web/Admin  
**Critical Async Path phase 2**: Postgres transaction → outbox_events → dispatcher → execution queue → worker

**Runbook principle**:

- stop doing damage first
- giảm write mới trước khi sửa
- backup hiện trạng trước khi đụng tay nếu còn làm được
- sau recovery phải có checklist verify

---

## Pre-launch Checklist (Danh sách kiểm tra trước khi ra mắt)

- [ ] Cấu hình backup Postgres ngoài máy chủ app.
- [ ] Chốt storage abstraction, local adapter config, và metadata schema cho `media_assets`.
- [ ] Chốt Zod boundary schemas và env contracts cho web/api/admin.
- [ ] Chốt auth/session hardening: cookie flags, CSRF, CORS, RBAC, secrets.
- [ ] Chốt upload hardening: type/size validation, path safety, ownership, delete policy.
- [ ] Chốt app-layer rate limit cho auth/search/write/upload.
- [ ] Chốt `audit_logs` và `feature_flags` schema/helper.
- [ ] Chốt dependency hygiene policy và lịch review định kỳ.
- [ ] Chốt data correctness cho write path chính: unique constraints, transaction boundaries, confirm step với destructive admin action.
- [ ] Chốt `/health/live`, `/health/ready`, `/health/startup`, `/metrics`.
- [ ] Viết runbook recovery cơ bản cho DB down, disk full, migration fail, upload fail.
- [ ] Chạy restore drill thành công ít nhất 1 lần.
- [ ] Chuẩn bị migration path từ local storage sang `Cloudflare R2` hoặc `S3-compatible` object storage.
- [ ] Chốt Cloudflare edge usage phía trước Caddy nếu team muốn lấy CDN/SSL/basic protection.
- [ ] Chỉ bật `Valkey`, `BullMQ`, `apps/worker`, `outbox_events` khi side effect đã đủ chậm hoặc đủ quan trọng.
- [ ] Chỉ bật `Meilisearch` khi search đã đủ core để xứng đáng với sync/index burden.
- [ ] Chỉ bật `PgBouncer` khi đã có signal connection pressure thật.
- [ ] Chỉ bật Prometheus/Grafana/Alertmanager khi đã xác định được metric và alert thật sự dùng.
- [ ] Chỉ bật `pgvector` nếu use case recommendation / related-content đã rõ.
- [ ] Thực hiện failure drill thực tế cho baseline phase hiện tại.

---

## TL;DR

**Giai đoạn này: Postgres + NestJS + Caddy + local-first storage abstraction + logs + security + backup/restore discipline = hệ sống được.**

- **Security baseline**: quan trọng hơn thêm service mới.
- **Backup + restore**: đáng tiền hơn dashboard đẹp.
- **Logs + health**: là baseline debug bắt buộc.
- **Boundary Validation**: fail fast ở request, env, queue payload, webhook, search document, nhưng không thay security architecture.
- **Storage Abstraction**: chạy local trước nhưng không khóa đường nâng cấp lên `S3`.
- **Phase upgrade**: queue, outbox, search engine, pooling, metrics stack chỉ bật khi pain thật xuất hiện.

# ARCHITECTURE_GOVERNANCE (Quản trị kiến trúc)

File này là `single source of truth (nguồn sự thật duy nhất)` cho cross-cutting rules (các quy tắc cắt ngang) của toàn bộ `design/`.
Mục tiêu là giảm việc phải nhảy qua quá nhiều file chỉ để trả lời:

- kiến trúc nào đã chốt (decided architecture)
- hạ tầng nào là baseline (nền tảng) cho current phase (giai đoạn hiện tại)
- pattern (mô thức) nào AI/dev không được bẻ lệch

Các file khác như `README`, `INFRA`, `FAILURE_MODE_MATRIX`, `SLA_SLO` chỉ nên:

- tóm tắt
- giải thích cách đọc
- hoặc áp dụng rule (quy tắc) này vào ngữ cảnh riêng

chứ không được tự tạo một version (phiên bản) khác của cùng một policy (chính sách).

Đọc kèm bắt buộc khi chuẩn bị thi công lại bằng `NestJS`:

- `design/NEST_APPLICATION_BASELINE.md`
- `design/IMPLEMENTATION_MAPPING.md`
- `design/RESTORE_DRILL_LOG.md`

## Baseline hiện tại đã chốt (Nền tảng hiện tại)

- Mô hình triển khai ưu tiên: `single VPS, low-cost, student/solo-dev survivable (một máy chủ ảo đơn lẻ, chi phí thấp, sinh viên hoặc nhà phát triển độc lập có thể duy trì được)`.
- Baseline phase 1 (Nền tảng giai đoạn 1) chỉ giữ những thứ phải có để ship (phát hành), debug (gỡ lỗi) và restore (phục hồi) nổi:
  - `apps/web` cho public frontend (giao diện công khai)
  - `apps/api` dùng `NestJS`
  - `apps/admin` là custom admin frontend (giao diện quản trị tùy chỉnh)
  - `Postgres`
  - `Caddy`
  - structured logs (nhật ký có cấu trúc)
  - health endpoints (điểm cuối kiểm tra sức khỏe)
  - backup + restore discipline (kỷ luật sao lưu và phục hồi)
  - storage abstraction (lớp trừu tượng lưu trữ) + local disk adapter (bộ chuyển đổi đĩa nội bộ)
  - auth/session hardening (thắt chặt bảo mật xác thực/phiên)
  - boundary validation (kiểm tra tính hợp lệ tại ranh giới)
  - upload hardening (thắt chặt bảo mật tải lên)
  - app-layer rate limit (giới hạn tần suất ở tầng ứng dụng)
- Các thành phần sau không còn là baseline (nền tảng) mặc định, chỉ bật khi có nhu cầu thật:
  - `Valkey` (`Redis-compatible`)
  - `BullMQ` / execution queue (hàng đợi thực thi)
  - `apps/worker` (tiến trình xử lý nền)
  - `outbox_events` (sự kiện chờ phát đi)
  - `Meilisearch`
  - `PgBouncer`
  - `Prometheus` / `Grafana` / `Alertmanager` (bộ công cụ giám sát)
  - tracing backend (hệ thống truy vết phía sau)
- Không thêm (No-go):
  - Kubernetes
  - Kafka
  - microservices (kiến trúc siêu dịch vụ)

## Phase 1 final decisions (Các quyết định cuối cùng cho giai đoạn 1)

| Chủ đề | Dùng ngay | Chưa dùng ngay | Điều kiện bật tiếp | Anti-goal (Mục tiêu chống lại) |
|---|---|---|---|---|
| Core runtime (Môi trường core) | `apps/web`, `apps/api`, `apps/admin`, `Postgres`, `Caddy` | `apps/worker` | có background workload (khối lượng việc chạy nền) rõ ràng | không tách process (tiến trình) chỉ để "trông enterprise" (chuyên nghiệp giả tạo) |
| Storage (Lưu trữ) | local storage abstraction | object storage (lưu trữ đối tượng) thật | khi backup/restore (sao lưu/phục hồi) truyền thông hoặc scale traffic (mở rộng lưu lượng) bắt đầu "đau" | không để business logic (nghiệp vụ) phụ thuộc vào local path (đường dẫn nội bộ) |
| Search (Tìm kiếm) | `Postgres / SQL` | `Meilisearch` | search p95 (tốc độ tìm kiếm), volume (dung lượng), UX filter/typo (lọc/lỗi đánh máy) đủ "đau" | không bật search engine (công cụ tìm kiếm) riêng chỉ vì thích |
| Async (Bất đồng bộ) | sync (đồng bộ) hoặc simple background path (luồng chạy nền đơn giản) | `outbox + BullMQ + worker` | side effect (tác động phụ) chậm hoặc failure cost (chi phí thất bại) cao | không bật queue (hàng đợi) khi chưa có idempotency (tính bất biến)/retry policy (chính sách thử lại) |
| DB pooling (Nhóm kết nối DB) | kết nối trực tiếp DB | `PgBouncer` | connection pressure (áp lực kết nối) có số liệu đo được | không thêm pooling chỉ vì checklist production (danh sách chuẩn bị ra mắt) |
| Observability (Khả năng giám sát) | `Pino`, `/health/*`, `/metrics`, runbook, restore drill | Prometheus/Grafana/Alertmanager/tracing | đã có metric/alert owner (người sở hữu chỉ số/cảnh báo) và câu hỏi vận hành rõ ràng | không tự host full stack (cả bộ công cụ) nếu chưa từng restore/runbook tử tế |
| Security (Bảo mật) | auth/session hardening, upload hardening, rate limit, audit | WAF/tracing/security tooling nặng hơn | khi baseline policy (chính sách nền tảng) đã chốt xong | không dùng edge tool (công cụ ranh giới) để giả vờ đã an toàn (secure) |

## Implementation status semantics (Ý nghĩa các trạng thái triển khai)

- `implemented`: đã triển khai
  - đã có trong mã nguồn (code) hoặc runtime (môi trường thực thi) hiện tại
- `required before launch`: yêu cầu trước khi ra mắt
  - chưa nhất thiết làm ngay hôm nay, nhưng thiếu thì không được gọi là production-safe (an toàn vận hành)
- `planned`: đã lập kế hoạch
  - hướng đi đã chốt, chưa phải baseline (nền tảng) của giai đoạn hiện tại
- `forbidden for now`: hiện đang bị cấm
  - không được tự ý kích hoạt vì tò mò công nghệ

## Thi công lại từ đầu (Rebuild from scratch)

- Current direction (Hướng đi hiện tại) là `rebuild backend với NestJS`, không phải tiếp tục mở rộng backend cũ theo hướng CMS platform (nền tảng CMS).
- Không được đọc các file design cũ rồi suy diễn rằng runtime hiện tại vẫn còn `Payload auth` hoặc `apps/cms`.
- Khi bắt đầu implementation (triển khai) mới, phải map (ánh xạ) mỗi quyết định quan trọng qua:
  - `design/IMPLEMENTATION_MAPPING.md`
  - module/service/route/schema/migration (mô-đun/nghiệp vụ/đường dẫn/lược đồ/di cư) tương ứng

## Canonical rules (Các quy tắc chuẩn gốc)

- PostgreSQL là source of truth (nguồn dữ liệu gốc đáng tin cậy nhất) duy nhất cho dữ liệu ứng dụng.
- Nếu có `Valkey` (`Redis-compatible`) thì nó chỉ giữ cache (bộ nhớ đệm), execution queue (hàng đợi thực thi), rate-limit counters (bộ đếm giới hạn tần suất), coordination state (trạng thái phối hợp).
- Nếu có `Meilisearch` thì nó chỉ là search projection (phản chiếu tìm kiếm).
- `NestJS API` là backend authority (quyền lực phía sau) cho business logic (nghiệp vụ), auth (xác thực), module contracts (hợp đồng mô-đun), và worker orchestration (điều phối tiến trình chạy nền).
- `apps/admin` không phải nơi giữ business logic; nó chỉ là management UI (giao diện quản trị) gọi API từ backend.
- Mọi side effect (tác động phụ) quan trọng luôn bắt đầu từ `canonical write (lệnh ghi chuẩn gốc)`.
- Chỉ khi side effect (tác động phụ) đủ chậm, đủ quan trọng, hoặc đủ dễ rơi (thất bại) mới nâng cấp lên:
  - `outbox_events` (sự kiện chờ phát)
  - `dispatcher` (bộ phân phát)
  - `execution queue` (hàng đợi thực thi)
  - `worker` (tiến trình chạy nền)

## Boundary rules (Các quy tắc ranh giới)

- Mọi boundary (ranh giới) quan trọng phải có schema runtime (lược đồ kiểm tra lúc thực thi) rõ ràng:
  - request body (thân yêu cầu)
  - route params (tham số đường dẫn)
  - query (tham số truy vấn)
  - queue payload (dữ liệu hàng đợi)
  - webhook payload (dữ liệu phản hồi ngược)
  - search document (tài liệu tìm kiếm)
  - env contract (hợp đồng môi trường)
- `Zod` là lựa chọn mặc định.
- `Zod` không thay thế cho:
  - authn/authz policy (chính sách xác thực/ủy quyền)
  - business invariants (các bất biến nghiệp vụ)
  - idempotency (tính bất biến khi gọi lại)
  - replay protection (bảo vệ chống phát lại)
  - upload security (bảo mật tải lên)
  - expensive query guard (canh phòng truy vấn đắt đỏ)
  - webhook signature verification (xác thực chữ ký webhook)

## Storage rules (Các quy tắc lưu trữ)

### Giai đoạn hiện tại (Current phase)
- Việc triển khai sản xuất phù hợp (current production fit) cho PMTL_VN là:
  - `storage abstraction (lớp trừu tượng lưu trữ)` bắt buộc
  - `local disk storage adapter (bộ chuyển đổi đĩa nội bộ)` là bản triển khai đầu tiên
  - file/media (tập tin/truyền thông) vẫn có thể nằm trên VPS nếu hạ tầng hiện tại chưa có object storage (lưu trữ đối tượng)

### Giai đoạn mục tiêu (Target phase)
- Hướng nâng cấp tiếp theo là `S3-compatible object storage (lưu trữ đối tượng tương thích S3)`.
- Business logic (nghiệp vụ) không được phụ thuộc trực tiếp vào local filesystem path (đường dẫn hệ thống tập tin cục bộ).
- Adapter storage (bộ chuyển đổi lưu trữ) tối thiểu phải có:
  - `uploadFile(...)` (tải lên)
  - `deleteFile(...)` (xóa)
  - `getPublicUrl(...)` (lấy địa chỉ công khai)
  - `getSignedUrl(...)` (lấy địa chỉ có chữ ký - có thể giả lập (stub) nếu chưa cần)

### Canonical file metadata (Siêu dữ liệu tập tin chuẩn gốc)
- Metadata file (siêu dữ liệu tập tin) phải nằm trong Postgres và có đủ tối thiểu:
  - `id`
  - `storage_provider` (nhà cung cấp lưu trữ)
  - `object_key` (mã định danh đối tượng)
  - `original_filename` (tên tệp gốc)
  - `content_type` (loại nội dung)
  - `size_bytes` (dung lượng tính bằng byte)
  - `checksum` (mã kiểm tra toàn vẹn)
  - `owner_id` (mã người sở hữu)
  - `created_at` (thời điểm tạo)
- Object key phải an toàn, không dùng trực tiếp raw filename (tên tệp thô) từ người dùng.
- Local storage (lưu trữ nội bộ) phải tách thư mục rõ ràng:
  - `uploads/avatars/`
  - `uploads/posts/`
  - `uploads/attachments/`

## Upload pipeline rules (Quy tắc quy trình tải lên)

- Luồng tải lên (upload) phải validate (kiểm tra):
  - mime/type (kiểu nội dung)
  - extension allowlist (danh sách phần mở rộng cho phép)
  - size (dung lượng)
- Không được chỉ tin vào `Content-Type` từ client (khách hàng); phải có server-side sniffing (kiểm tra loại tệp phía máy chủ) phù hợp.
- Nếu là ảnh, nên có thumbnail/variant strategy (chiến lược ảnh thu nhỏ/biến thể) rõ ràng.
- File mới không hợp lệ phải `fail closed (thất bại đóng)`.
- Thiết kế (design) phải chừa chỗ cho scan/quarantine (quét/cách ly) nếu sau này kích hoạt.
- Mỗi file phải có owner (chủ sở hữu) và delete policy (chính sách xóa) rõ ràng.

## Security contract bắt buộc (Hợp đồng bảo mật bắt buộc)

- Security (bảo mật) phải được viết như policy vận hành (operational policy), không chỉ như một danh sách khái niệm (checklist).
- Giai đoạn hiện tại (current phase) tối thiểu phải chốt bằng tài liệu và triển khai:
  - session model (mô hình phiên làm việc):
    - access token TTL (thời gian sống token truy cập)
    - refresh token rotation policy (chính sách xoay vòng token làm mới)
    - revoke semantics (ý nghĩa việc thu hồi)
    - logout-all semantics (ý nghĩa việc đăng xuất tất cả)
  - cookie policy (chính sách cookie):
    - `HttpOnly` (chỉ máy chủ đọc)
    - `Secure` (chỉ gửi qua HTTPS)
    - `SameSite` (quy tắc nguồn gốc giống nhau)
    - cookie scope/path (phạm vi/đường dẫn cookie) rõ ràng
  - auth abuse controls (kiểm soát lạm dụng xác thực):
    - brute-force guard (bản phòng thủ dò mật khẩu) theo IP
    - brute-force guard theo account/email
    - giới hạn tần suất (rate limit) riêng cho reset password và email verification
  - password policy (chính sách mật khẩu):
    - độ dài tối thiểu (min length)
    - hash algorithm (thuật toán mã băm)
    - quy tắc reset/invalidate (hủy giá trị)
  - CORS policy (chính sách chia sẻ nguồn gốc tài nguyên):
    - danh sách cho phép rõ ràng (explicit allowlist), không dùng wildcard cho các nguồn yêu cầu xác thực
  - CSP + security headers (chính sách bảo mật nội dung và tiêu đề bảo mật):
    - chính sách tối thiểu phải ghi rõ thay vì ghi "sẽ thêm sau"
  - upload policy (chính sách tải lên):
    - danh sách loại tệp cho phép
    - dung lượng tối đa (max size)
    - quy tắc sniffing (kiểm tra loại tệp)
    - quy tắc phục vụ công khai/nội bộ (public/private serving rule)
    - ủy quyền xóa (delete authorization)
  - rich text / HTML policy (chính sách văn bản giàu nội dung/HTML):
    - làm sạch (sanitize) ở đâu
    - ai được phép nhập HTML thô (raw HTML)
  - inbound webhook policy (chính sách phản hồi ngược đầu vào):
    - xác thực chữ ký (signature verification)
    - cửa sổ chống phát lại (replay window)
  - secret policy (chính sách bí mật):
    - bí mật nằm ở đâu
    - xoay vòng (rotation) khi nào
    - cấm commit tệp `.env` production lên kho mã nguồn
- Không được tự nhận là "an toàn vừa đủ (secure enough)" nếu chưa chốt xong các chính sách trên.

## Cross-cutting tables cần có theo phase (Các bảng cắt ngang theo giai đoạn)

- Phase 1 (Giai đoạn 1):
  - `sessions` (phiên làm việc)
  - `audit_logs` (nhật ký kiểm tra)
  - `feature_flags` (cờ tính năng)
  - `media_assets` (tài sản truyền thông)
  - `rate_limit_records` (dữ liệu giới hạn tần suất)
- Phase 2 (Giai đoạn 2) khi tính tin cậy bất đồng bộ (async reliability) đã có nhu cầu thật:
  - `outbox_events` (sự kiện chờ phát đi)

## Preferred tooling choices (Các lựa chọn công cụ ưu tiên)

### Backend platform (Nền tảng hệ thống xử lý)
- `NestJS` là backend framework chuẩn cho hướng đi hiện tại.
- Không dùng nền tảng CMS làm backend authority (quyền lực phía sau) nữa.
- `Swagger / OpenAPI` là lớp hợp đồng (contract layer) ưu tiên cho API nội bộ, quản trị, và tự động hóa.
- ORM (Lớp ánh xạ đối tượng-quan hệ) ưu tiên là `Prisma` cho giai đoạn hiện tại:
  - dễ đọc (readable)
  - tiến trình di cư (migration) rõ ràng
  - phù hợp với solo dev + workflow có sự hỗ trợ của AI
- `Drizzle` chỉ là ứng cử viên sau này nếu cần kiểm soát SQL chặt chẽ hơn.
- Nền tảng kiểm tra đầu vào (Validation baseline):
  - `Zod` + custom `ZodValidationPipe`
  - không dùng `class-validator` làm source of truth mặc định
- Nền tảng nhật ký (Logging baseline):
  - `Pino` thông qua tích hợp Nest
- Nền tảng xử lý lỗi (Error baseline):
  - bộ lọc ngoại lệ toàn cục (global exception filter)
  - vỏ bọc lỗi (error envelope) thống nhất có `code`, `message`, `status`, `requestId`
- Nền tảng chuỗi canh phòng (Guard pipeline baseline):
  - bộ canh phòng xác thực (auth guard)
  - bộ canh phòng quyền/vai trò (role/permission guard)
  - bộ canh phòng giới hạn tần suất (rate-limit guard)
  - đường ống kiểm tra (validation pipe) trước logic xử lý (controller logic)

### Admin frontend (Giao diện quản trị)
- `apps/admin` là ứng dụng quản trị tùy chỉnh riêng.
- Nền tảng giao diện (UI baseline) chốt theo phong cách/mẫu của `shadcn-admin`.
- Không dùng giao diện quản trị tự sinh (generated admin panel) làm bề mặt quản lý chính.

### Queue / background jobs (Hàng đợi / Công việc chạy nền)
- Không coi hàng đợi (queue) là baseline mặc định.
- Chỉ kích hoạt `Valkey` (`Redis-compatible`) + execution queue (hàng đợi thực thi) khi thật sự đã có:
  - tác động phụ (side effect) đủ chậm để không nên chạy trong luồng yêu cầu (request path)
  - quy tắc thử lại/lùi bước (retry/backoff) rõ ràng
  - khối lượng việc nền lặp lại có lợi khi tách riêng
- Bản triển khai ưu tiên là `BullMQ` thay vì tự xây dựng các cơ chế hàng đợi.
- `Temporal` không phải baseline cho giai đoạn hiện tại:
  - quá nặng cho một `single VPS`
  - chỉ cân nhắc nếu sau này cần quy trình (workflow) dài, nhiều bước, và độ bền vững (durability) cực cao
- `QStash` chỉ là ứng cử viên tùy chọn cho webhook hoặc phân phát lại các phản hồi ngược bên ngoài, không phải hàng đợi chính của kiến trúc hiện tại

### Search (Tìm kiếm)
- Baseline giai đoạn 1 ưu tiên `Postgres search / SQL query` nếu dung lượng còn nhỏ và tìm kiếm chưa phải là giá trị cốt lõi.
- `Meilisearch` chỉ bật khi tìm kiếm công khai đã đủ quan trọng để xứng đáng với chi phí đồng bộ chỉ mục (index sync), sao lưu, đánh chỉ mục lại, và xử lý sai lệch (drift handling).
- Không đổi sang `Typesense` hoặc `Algolia` ở giai đoạn hiện tại chỉ vì “công cụ tốt hơn”.
- Chỉ cân nhắc `Algolia` nếu mục tiêu là giảm gánh nặng vận hành tìm kiếm bằng SaaS (phần mềm dịch vụ) và chấp nhận phụ thuộc bên ngoài rõ ràng.

### Storage (Lưu trữ)
- Giai đoạn hiện tại (current phase):
  - `local disk storage adapter (bộ chuyển đổi đĩa cục bộ)`
- Giai đoạn mục tiêu (target phase) ưu tiên:
  - `Cloudflare R2` như lựa chọn tương thích S3 (`S3-compatible`) đầu tiên

### Edge / proxy / CDN (Ranh giới / Đại diện / Mạng phân phối nội dung)
- Giữ `Caddy` làm bộ đại diện ngược (reverse proxy) hiện tại.
- Có thể đặt gói miễn phí của `Cloudflare` phía trước `Caddy` để tận dụng:
  - CDN
  - bảo mật SSL tại ranh giới
  - DNS
  - một phần giới hạn tần suất / lọc robot (bot filtering)
- Không coi Cloudflare là lý do để bỏ giới hạn tần suất ở tầng ứng dụng (app-layer rate limit) hoặc bỏ Caddy trong giai đoạn hiện tại.

### Observability (Khả năng giám sát)
- Baseline giai đoạn 1:
  - `Pino`
  - kiểm tra sức khỏe ứng dụng `/health/*` (app health)
  - chỉ số ứng dụng `/metrics` (app metrics)
  - ghi chú sự cố (incident note) / tài liệu vận hành (runbook) / diễn tập phục hồi (restore drill)
- `Prometheus + Grafana + Alertmanager` chỉ bật khi bạn đã biết rõ:
  - chỉ số (metric) nào thật sự cần xem
  - cảnh báo (alert) nào có người xử lý
  - máy chủ còn đủ RAM/CPU
- `OTEL + Tempo` không nên là mặc định phải tự host (tự vận hành) ngay trên một máy chủ ảo (VPS).
- Nếu thực sự cần truy vết (traces) sớm, ưu tiên cân nhắc các lựa chọn được quản lý (managed option) như tầng miễn phí của `Grafana Cloud` trước khi tự vận hành cả bộ công cụ truy vết.

### Auth (Xác thực)
- Quyền lực xác thực (Auth authority) nằm ở `NestJS`.
- Nền tảng hiện tại (current baseline) nên dùng:
  - `NestJS guards` (Bộ canh phòng NestJS)
  - `JWT access token` (Token truy cập JWT)
  - `refresh token rotation` (Xoay vòng token làm mới)
  - HTTP-only cookies nếu web/admin cần phiên làm việc trên trình duyệt an toàn
- Không đưa quyền lực xác thực ra các dịch vụ SaaS bên ngoài trong nền tảng kiến trúc hiện tại.

### Database (Cơ sở dữ liệu)
- Baseline giai đoạn 1 giữ `Postgres`.
- `PgBouncer` chỉ thêm khi đã có dấu hiệu của áp lực kết nối (connection pressure), tranh chấp đa tiến trình (multi-process contention), hoặc mô hình triển khai chứng minh cần nhóm kết nối riêng.

## Security-first rules (Các quy tắc ưu tiên bảo mật)

- Nền tảng bảo mật (Security baseline) quan trọng hơn hạ tầng phong cách (fancy infra).
- Phải chốt và triển khai (implement) trước:
  - cờ cookie (cookie flags)
  - chiến lược chống giả mạo yêu cầu (CSRF strategy)
  - chính sách chia sẻ nguồn nguồn (CORS policy)
  - CSP và các tiêu đề bảo mật (security headers)
  - Phân quyền theo vai trò (RBAC) rõ ràng ở backend
  - quản lý bí mật (secret management)
  - kiểm tra tải lên (upload validation) và an toàn đường dẫn (path safety)
  - chính sách cập nhật phụ thuộc (dependency update policy)
  - xác thực webhook nếu có webhook đầu vào
- Không thêm dịch vụ mới nếu câu chuyện bảo mật (security story) của dịch vụ cũ còn mập mờ.

## Dependency hygiene rules (Các quy tắc vệ sinh phụ thuộc)

- Không thêm package (gói phần mềm) chỉ vì AI gợi ý hoặc bài blog sử dụng.
- Mỗi phụ thuộc mới phải trả lời được:
  - giải quyết bài toán gì?
  - tại sao không tự viết phần nhỏ đó?
  - tư thế bảo trì (maintenance posture) ra sao?
  - giấy phép (license) có chấp nhận được không?
- Chiến lược phiên bản (Version strategy):
  - các phụ thuộc sản xuất phải được ghim (pin) theo lockfile (tệp khóa)
  - không thả nổi phiên bản lớn (major version) trong luồng sản xuất
- Phải có rà soát định kỳ (review):
  - kiểm tra phụ thuộc (audit dependency) hàng tháng
  - rà soát các gói cũ/bị bỏ rơi (stale/abandoned)
  - rà soát các lỗ hổng (CVE/high severity)
- Ưu tiên ít package hơn là có "đủ framework cho oai".

## Operational discipline rules (Các quy tắc kỷ luật vận hành)

- `sao lưu (backup) có thử nghiệm phục hồi` quan trọng hơn `sao lưu có tự động (cron)`.
- Mọi giai đoạn phải có:
  - lịch sao lưu (backup schedule)
  - diễn tập phục hồi (restore drill)
  - theo dõi dung lượng đĩa (disk usage watch)
  - ghi chú sự cố (incident note) đơn giản
  - danh sách thất bại (failure checklist) cho các trường hợp: DB chết, đĩa đầy, di cư lỗi, rò rỉ IP, tải lên lỗi
- Thiếu tài liệu vận hành (runbook) và diễn tập phục hồi thì không được tự coi là sẵn sàng cho sản xuất (production-ready).
- Sự đơn giản trong vận hành (Operational simplicity) được ưu tiên hơn sự thanh lịch về mặt kỹ thuật (technical elegance).
- Một luồng đơn giản nhưng hiểu rõ sẽ tốt hơn một sơ đồ đẹp nhưng không ai gỡ lỗi nổi.

## Backup / restore acceptance criteria (Tiêu chí chấp nhận sao lưu và phục hồi)

- Sao lưu (Backup) chỉ được coi là "có giá trị" nếu việc phục hồi (restore) đã được thử nghiệm thành công.
- Tiêu chí chấp nhận tối thiểu:
  - phục hồi bản sao lưu gần nhất lên máy sạch trong thời gian mục tiêu đã ghi rõ
  - ứng dụng khởi động (boot) thành công sau khi phục hồi
  - trạng thái di cư (migration state) khớp với phiên bản ứng dụng cần chạy
  - siêu dữ liệu tệp (metadata file) trong Postgres khớp với các đối tượng nhị phân hiện có trong kho lưu trữ
  - lần chạy phục hồi phải có người ghi lại thời gian, lỗi gặp phải, và cách sửa
- Với giai đoạn hiện tại dùng lưu trữ nội bộ (local storage):
  - phải chấp nhận rõ đây không phải là mô hình nhất quán đẹp (consistency model)
  - việc phục hồi DB và phục hồi tập tin có thể bị lệch nhau nếu việc sao lưu không đồng bộ
  - phải có chính sách phát hiện tập tin truyền thông mồ côi hoặc bị thiếu (orphan/missing media) sau khi phục hồi

## Local storage guardrails (Rào chắn an toàn cho lưu trữ nội bộ)

- `lưu trữ trên đĩa nội bộ (local disk storage)` là chấp nhận được cho giai đoạn đầu, nhưng bị coi là một điểm yếu đã biết.
- Khi còn dùng lưu trữ nội bộ, phải chốt rõ:
  - thư mục nào được phép chứa dữ liệu nhị phân (binary)
  - phân vùng (volume) nào là bền vững (persistent)
  - ngưỡng dung lượng đĩa cần cảnh báo (disk usage threshold)
  - cách phát hiện tập tin mồ côi (orphan file)
  - cách phát hiện siêu dữ liệu (metadata) trỏ tới tệp nhị phân đã mất
  - ai được phép xóa tập tin
  - cách sao lưu và thời điểm sao lưu
- Nếu không giữ được tính bền vững của phân vùng (volume persistence), không được triển khai tính năng tải lên như thể nó an toàn (production-safe).

## Phase trigger thresholds (Các ngưỡng kích hoạt giai đoạn)

- Thẩm phần tùy chọn (Optional component) chỉ được bật khi có tín hiệu định lượng hoặc nỗi đau (pain) đủ rõ ràng, không bật theo cảm hứng.
- `PgBouncer`:
  - cân nhắc khi kết nối DB duy trì trên khoảng `70%` giới hạn an toàn trong nhiều đợt tải
  - hoặc khi đa tiến trình/môi trường thực thi tạo ra sự biến động kết nối (connection churn) rõ rệt
- `Meilisearch`:
  - cân nhắc khi tốc độ tìm kiếm Postgres (p95) không còn chấp nhận được
  - hoặc trải nghiệm tìm kiếm thực sự cần khả năng chịu lỗi đánh máy (typo tolerance), bộ lọc (facets), phân hạng riêng
  - hoặc dung lượng nội dung đã làm cho việc tìm kiếm chuẩn gốc trở nên tốn kém rõ rệt
- `Valkey`:
  - cân nhắc khi việc chia sẻ trạng thái giới hạn tần suất, bộ nhớ đệm, hoặc việc bất đồng bộ đã có nhu cầu thật trên nhiều tiến trình
- `BullMQ` + worker:
  - cân nhắc khi tác động phụ (side effect) làm luồng yêu cầu chậm lại rõ rệt
  - hoặc chi phí thất bại của tác động phụ đủ cao để cần các cơ chế thử lại/lùi bước/bất biến (retry/backoff/idempotent) riêng
- `Prometheus/Grafana/Alertmanager`:
  - chỉ bật khi bạn đã có một vài chỉ số và cảnh báo mà bạn thực sự sẽ xem hoặc xử lý
- Các ngưỡng số cụ thể có thể tinh chỉnh sau khi kiểm tra tải (load test), nhưng tài liệu phải giữ nguyên nguyên tắc: `đo lường nỗi đau trước (measured pain first)`.

## Cloudflare / proxy guardrails (Rào chắn an toàn cho Cloudflare và Proxy)

- `Cloudflare` là một sự tiện lợi ở ranh giới (edge convenience), không phải là viên đạn bạc cho bảo mật.
- Khi đặt Cloudflare trước `Caddy`, phải chốt rõ:
  - cấu hình đại diện tin cậy (trusted proxy config)
  - ghi nhật ký IP khách hàng chính xác
  - chính sách truy cập trực tiếp đến nguồn (direct-to-origin access policy)
  - TLS tại ranh giới và TLS tại nguồn phải hiểu đúng, không nhầm là một
  - giới hạn tần suất tại ranh giới không thay thế cho bảo mật xác thực/luồng ghi ở ứng dụng
  - WAF (Tường lửa ứng dụng web) không thay thế cho việc bảo vệ chống lại lỗi xác thực (broken auth)

## Tooling status (Trạng thái công cụ)

### Accepted (Đã chấp nhận)

| Tool / option (Công cụ / Tùy chọn) | Status (Trạng thái) | Ghi chú ngắn |
|---|---|---|
| `NestJS` | accepted | Quyền lực phía sau cho API, xác thực, điều phối tiến trình chạy nền, OpenAPI |
| `Prisma` | accepted | ORM ưu tiên cho giai đoạn hiện tại |
| `Postgres` | accepted | Cơ sở dữ liệu chuẩn gốc bắt buộc |
| `Caddy` | accepted | Bộ đại diện ngược đơn giản, hợp với một VPS |
| Phong cách/mẫu `shadcn-admin` | accepted | Nền tảng giao diện cho phần quản trị tùy chỉnh |
| `Pino` | accepted | Nhật ký có cấu trúc là nền tảng gỡ lỗi bắt buộc |
| `Cloudflare` trước `Caddy` | accepted | Lựa chọn ranh giới tốt cho CDN, SSL, DNS, bảo vệ cơ bản |
| `Cloudflare R2` | accepted | Lưu trữ đối tượng mục tiêu ưu tiên sau bộ chuyển đổi nội bộ |
| `backup + restore drills` | accepted | Kỷ luật vận hành sống còn |
| `audit_logs` | accepted | Cần để biết ai vừa thay đổi hay phá gì |
| `feature_flags` | accepted | Cần để rút lại hành vi mà không phải triển khai lại ngay |

### Deferred (Tạm hoãn)

| Tool / option (Công cụ / Tùy chọn) | Status (Trạng thái) | Ghi chú ngắn |
|---|---|---|
| `Valkey` | deferred | Bật khi có nhu cầu thật về giới hạn tần suất, bộ nhớ đệm, hoặc hàng đợi |
| `BullMQ` | deferred | Chỉ bật khi việc bất đồng bộ đủ đáng để tách khỏi luồng yêu cầu |
| `apps/worker` | deferred | Chỉ cần khi đã có hàng đợi thực thi hoặc khối lượng việc chạy nền rõ ràng |
| `outbox_events` | deferred | Chỉ thêm khi tác động phụ quan trọng cần bàn giao có tính giao dịch |
| `Meilisearch` | deferred | Bật khi tìm kiếm đã là tính năng lõi và dữ liệu đủ lớn |
| `PgBouncer` | deferred | Chỉ cần khi áp lực kết nối là vấn đề thật sự |
| `Redis OSS/managed Redis` | deferred | Vẫn tương thích, nhưng hiện tại ưu tiên `Valkey` cho phong thái mã nguồn mở |
| `Drizzle` | deferred | Chỉ cân nhắc nếu muốn ưu tiên SQL hơn `Prisma` |
| `Prometheus + Grafana + Alertmanager` | deferred | Chỉ bật khi đã biết chỉ số/cảnh báo nào thật sự có ích |
| `OpenTelemetry + Tempo` | deferred | Chỉ bật khi thật sự cần truy vết; ưu tiên dịch vụ được quản lý nến cần sớm |
| `Grafana Cloud` | deferred | Phù hợp nếu muốn giảm bớt việc tự vận hành hệ thống giám sát |
| `pgvector` | deferred | Chỉ thêm khi tính năng nội dung liên quan / gợi ý đã chốt |
| `MinIO` | deferred | Chỉ cân nhắc nếu muốn tự vận hành lưu trữ đối tượng |
| `QStash` | deferred | Chỉ phù hợp cho phản hồi ngược bên ngoài, không phải hàng đợi chính |
| `Supabase` / `Neon` | deferred | Chỉ cân nhắc khi có áp lực vận hành DB thật sự |

### Rejected for current phase (Bị từ chối trong giai đoạn hiện tại)

| Tool / option (Công cụ / Tùy chọn) | Status (Trạng thái) | Ghi chú ngắn |
|---|---|---|
| Tự xây dựng cơ chế hàng đợi bằng Redis/Valkey | rejected | Không ưu tiên tự xây dựng khi `BullMQ` đã giải quyết bài toán tốt hơn |
| `Temporal` | rejected | Quá nặng cho một máy chủ ảo (`single VPS`) ở giai đoạn hiện tại |
| `Typesense` / `Algolia` thay cho `Meilisearch` | rejected | Chưa có lý do đủ mạnh khi tìm kiếm có thể giải bằng SQL/Postgres |
| Nền tảng CMS làm backend authority | rejected | Không hợp hướng đi hiện tại ưu tiên backend + quản trị tùy chỉnh |
| `Clerk` / `Supabase Auth` / `Auth.js` làm authority chính | rejected | Tăng sự phụ thuộc bên ngoài và không cần thiết lúc này |

## Implementation status snapshot (Ảnh chụp trạng thái triển khai)

| Hạng mục | Status (Trạng thái) | Ghi chú |
|---|---|---|
| Hướng đi `NestJS + Prisma + Postgres + Caddy` | planned | Đã chốt làm nền tảng kiến trúc |
| `sessions` (phiên làm việc) | required before launch | Việc thu hồi/xoay vòng Auth không thể thiếu lưu trữ thật |
| local storage abstraction | required before launch | Không được để nghiệp vụ bám trực tiếp vào đường dẫn nội bộ |
| auth/session hardening policy | required before launch | Phải cụ thể hơn mức danh sách khái niệm (checklist) |
| auth/session write-path spec | required before launch | Không được ra mắt nếu các luồng đăng nhập/làm mới... còn mơ hồ |
| upload hardening policy | required before launch | Kiểm tra loại tệp, quyền sở hữu, ủy quyền xóa là bắt buộc |
| media upload write-path spec | required before launch | Không được ra mắt nếu ranh giới tệp (file boundary) còn chưa rõ |
| backup + restore drill | required before launch | Chưa có diễn tập thành công thì chưa an toàn vận hành |
| backup/restore runbook | required before launch | Không có tài liệu thao tác được thì diễn tập không đủ giá trị |
| `audit_logs` | required before launch | Bắt buộc cho lớp điều phối (control-plane) |
| `feature_flags` | required before launch | Cần để rút lại hành vi kịp thời |
| `rate_limit_records` | required before launch | Các luồng quan trọng phải có đường đi của giới hạn tần suất rõ ràng |
| `Valkey` / `BullMQ` / worker | planned | Chỉ bật khi có nỗi đau (pain) thật |
| `Meilisearch` | planned | Chỉ bật khi tìm kiếm đã trở thành tính năng lõi |
| `PgBouncer` | planned | Chỉ bật khi có áp lực kết nối thực sự |
| Prometheus/Grafana/Alertmanager | planned | Không phải nền tảng cho giai đoạn 1 |
| tracing backend | forbidden for now | Không bật trước khi metrics/logs/runbook đã dùng được |

## App-layer runtime controls (Kiểm soát thực thi ở tầng ứng dụng)

### Giới hạn tần suất (Rate limit)
- Rate limit phải có ở tầng ứng dụng (app layer).
- Nếu chưa có `Valkey`, vẫn phải có chiến lược giới hạn tần suất tối thiểu phù hợp với cách triển khai hiện tại.
- Khi rate limit đã là chốt chặn quan trọng, ưu tiên dùng `Valkey` hoặc kho lưu trữ tương thích Redis.
- Tối thiểu cho:
  - đăng nhập (login)
  - đăng ký (register)
  - quên mật khẩu (forgot password)
  - tạo bài viết (create post)
  - tạo bình luận (create comment)
  - tìm kiếm (search)
  - tải tệp (upload file)

### Health endpoints (Các điểm cuối kiểm tra sức khỏe)
- Tối thiểu phải có:
  - `/health/live` (kiểm tra sự sống)
  - `/health/ready` (kiểm tra sự sẵn sàng)
  - `/health/startup` (kiểm tra việc khởi động)
- `ready` phải kiểm tra tối thiểu:
  - Postgres
  - thư mục gốc lưu trữ nội bộ (local storage base dir) ở mức độ nhẹ
- Nếu `Valkey` / `Meilisearch` đã kích hoạt thì `ready` mới cần kiểm tra thêm các phụ thuộc đó.

### Metrics (Các chỉ số đo lường)
- Phải để lộ điểm truy cập `/metrics`.
- Tối thiểu nên có ở giai đoạn 1 (phase 1):
  - tổng số yêu cầu (request count)
  - độ trễ yêu cầu (request latency)
  - số lượng lỗi (error count)
  - số lượng tải lên thành công/thất bại (upload success/fail count)
  - số lượng chạm ngưỡng giới hạn (rate limit hit count)
- Nếu hàng đợi/tìm kiếm đã kích hoạt thì mới thêm các chỉ số liên quan.

## Recovery rules (Các quy tắc phục hồi)

- Đường phục hồi (Recovery path) phải được ghi rõ là một trong các cách:
  - `replay outbox` (phát lại sự kiện chờ phát)
  - `redrive execution jobs` (đẩy lại các công việc thực thi)
  - `recompute projection` (tính toán lại phản chiếu dữ liệu)
  - `rebuild index/bundle/read model` (xây dựng lại chỉ mục/gói/mô hình đọc)
- Nếu giai đoạn hiện tại chưa có các cơ chế trên, phục hồi mặc định là:
  - `restore backup` (phục hồi bản sao lưu)
  - `rerun migration` (chạy lại tiến trình di cư)
  - `recreate cache` (tạo lại bộ nhớ đệm)
  - `re-upload / relink media metadata (tải lên lại / liên kết lại siêu dữ liệu)` theo tài liệu vận hành

## Data correctness rules (Các quy tắc tính chính xác của dữ liệu)

- Hệ thống chết vì dữ liệu sai còn nhanh hơn chết vì thiếu bảng điều khiển (dashboard).
- Mọi mô-đun phải chốt rõ:
  - các ràng buộc duy nhất tối thiểu (unique constraints)
  - ranh giới giao dịch (transaction boundary) cho các luồng ghi quan trọng
  - chính sách xóa mềm (soft delete policy) nếu có
  - việc thử lại tác động phụ có gây ra nhân đôi dữ liệu hay không
  - hành động phá hủy của quản trị viên có cần bước xác nhận hay không
  - các giả định về múi giờ / ngôn ngữ / bảng mã (timezone / locale / collation)

## Feature rollout rules (Các quy tắc triển khai tính năng)

- Tính năng mới có rủi ro nên được đặt sau `feature_flags (cờ tính năng)`.
- Hàm hỗ trợ tối thiểu (helper):
  - `isFeatureEnabled(key)`

## Khi review (rà soát) một kịch bản sử dụng (use-case) mới

1. Mô-đun sở hữu (owner module) là ai?
2. Bản ghi chuẩn (canonical record) ghi ở đâu trước?
3. Lược đồ ranh giới (boundary schema) đã chốt chưa?
4. Tác động phụ (side effect) nào phải đi qua `outbox_events`?
5. Dữ liệu hàng đợi (queue payload) có phiên bản và mã bất biến (idempotency key) chưa?
6. Tập tin/truyền thông (file/media) có đi qua lớp trừu tượng lưu trữ (storage abstraction) không?
7. Hành động này có cần nhật ký kiểm tra (audit log) không?
8. Luồng này có cần giới hạn tần suất hoặc bộ canh phòng yêu cầu không?
9. Trạng thái sẵn sàng/chỉ số (readiness/metrics) có cần cập nhật không?
10. Đường phục hồi (recovery path) là phát lại (replay), tính lại (recompute), hay xây dựng lại (rebuild)?

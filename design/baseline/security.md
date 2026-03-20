# SECURITY_BASELINE (Nền tảng bảo mật)

File này chốt `security contract (hợp đồng bảo mật)` cho phase 1 (giai đoạn 1) của PMTL_VN.
Nó không phải wish list (danh sách mong muốn). Nếu một mục trong đây chưa được implement (triển khai), trạng thái đúng phải là `required before launch (yêu cầu trước khi ra mắt)`.

## 1 truth phải giữ (Một sự thật phải tuân thủ)

- `apps/api` là security authority (quyền lực bảo mật).
- Browser (trình duyệt) không được tự giữ session authority (quyền quản lý phiên) ở local storage (bộ nhớ nội bộ trình duyệt).
- Validation (kiểm tra tính hợp lệ) giúp lọc input bẩn (dữ liệu đầu vào không sạch), nhưng không thay thế cho:
  - authn/authz (xác thực và ủy quyền)
  - CSRF protection (bảo vệ chống giả mạo yêu cầu từ phía trang khác)
  - replay protection (bảo vệ chống phát lại yêu cầu)
  - upload hardening (thắt chặt bảo mật tải lên)
  - query cost control (kiểm soát chi phí truy vấn)

## Auth model (Mô hình xác thực)

### Session model mặc định (Mô hình phiên đăng nhập)

- Browser flows (luồng trình duyệt) dùng:
  - access token ngắn hạn trong `HttpOnly` cookie
  - refresh token rotation (xoay vòng token làm mới) trong `HttpOnly` cookie riêng
- Non-browser automation/internal API (tự động hóa ngoài trình duyệt hoặc API nội bộ):
  - chỉ dùng bearer token (token mang theo) khi route (đường dẫn) đó được thiết kế riêng
  - không reuse (tái sử dụng) browser cookie contract (hợp đồng cookie trình duyệt) cho webhook/automation

### Token contract (Hợp đồng Token)

- access token TTL (thời gian sống của token truy cập): `15 phút`
- refresh token TTL (thời gian sống của token làm mới): `30 ngày`
- refresh rotation (xoay vòng làm mới): `bắt buộc`
- revoke semantics (ý nghĩa của việc thu hồi):
  - `logout`: revoke (thu hồi) phiên hiện tại
  - `logout-all`: revoke (thu hồi) toàn bộ phiên của người dùng
- refresh token store (kho lưu trữ token làm mới):
  - lưu server-side (phía máy chủ) bằng token hash (mã băm token) hoặc session record (bản ghi phiên) tương đương
  - không coi refresh token stateless (không lưu trạng thái) là baseline phase 1 (nền tảng giai đoạn 1)

### Admin session (Phiên quản trị)

- idle timeout (thời gian chờ khi không hoạt động): `30 phút`
- absolute max session age (tuổi thọ tối đa tuyệt đối của phiên): `12 giờ`
- admin route (đường dẫn quản trị) phải có guard (bộ canh phòng) riêng, không dùng chung assumption (giả định) với member route (đường dẫn thành viên)

## Password / reset / verification (Mật khẩu / Thiết lập lại / Xác minh)

- password min length (độ dài mật khẩu tối thiểu): `12`
- hash algorithm (thuật toán mã băm): `Argon2id`
- reset token TTL (thời gian sống của token thiết lập lại): `15 phút`
- reset token: `one-time use (sử dụng một lần)`
- reset success (khi thiết lập lại thành công):
  - revoke (thu hồi) các session (phiên) cũ
  - ghi audit event (sự kiện kiểm tra)
- email verification token TTL (thời gian sống của token xác minh email): `24 giờ`
- verification resend cooldown (thời gian chờ gửi lại xác minh): `60 giây`
- anti-enumeration (chống dò quét thông tin):
  - login (đăng nhập), reset request (yêu cầu thiết lập lại), verification resend (gửi lại xác minh) đều trả response (phản hồi) trung tính
  - không tiết lộ email/account (tài khoản) có tồn tại hay không

## Rate limit / abuse control (Giới hạn tần suất / Kiểm soát lạm dụng)

- brute-force guard (bảo vệ chống dò mật khẩu) theo `IP`
- brute-force guard (bảo vệ chống dò mật khẩu) theo `account/email`
- bắt buộc cho các hành động:
  - login (đăng nhập)
  - register (đăng ký)
  - forgot password (quên mật khẩu)
  - **refresh token** (làm mới token) — ⚠️ endpoint này dễ bị miss, attacker brute-force refresh tokens nếu không có guard
  - reset password (đặt lại mật khẩu)
  - email verification / resend (xác minh / gửi lại xác minh)
  - upload (tải lên)
  - create post (tạo bài viết)
  - create comment (tạo bình luận)
  - search (tìm kiếm)
  - guestbook submit (gửi sổ lưu niệm)
  - vow create (tạo nguyện)

> **Bug fix note**: `/api/auth/refresh` PHẢI có rate-limit guard. Nếu thiếu, attacker có thể brute-force refresh tokens.
> Limit: 30 requests / 15 phút / per-IP.
> Xem `tracking/coding-readiness.md` Phần 5 cho exact values từng endpoint.

## Cookie / CSRF / CORS

### Cookie policy (Chính sách Cookie)

- production cookies (cookie trên môi trường chạy thật) bắt buộc có:
  - `HttpOnly` (chỉ máy chủ đọc được)
  - `Secure` (chỉ gửi qua HTTPS)
  - `SameSite=Lax` mặc định
- cookie path (đường dẫn cookie):
  - access token cookie: `/`
  - refresh token cookie: `/api/auth/refresh`
- cookie domain (tên miền cookie):
  - chỉ đặt ở domain (tên miền) thật dùng cho web/admin, không dùng wildcard (ký tự đại diện) tùy tiện

### CSRF strategy (Chiến lược chống giả mạo yêu cầu)

- Với browser mutation (các thay đổi từ trình duyệt) dùng cookie auth:
  - dùng `double-submit CSRF token (token CSRF gửi hai lần)`
  - token phải được kiểm tra ở `apps/api` cho các state-changing routes (đường dẫn thay đổi trạng thái)
- `SameSite` chỉ là lớp giảm thiểu rủi ro, không được coi là CSRF defense (phòng thủ CSRF) duy nhất
- Bearer-only endpoints (các điểm cuối chỉ dùng token bearer) có thể được miễn (exempt) CSRF, nhưng phải tách route contract (hợp đồng đường dẫn) rõ ràng

### CORS policy (Chính sách chia sẻ tài nguyên giữa các nguồn)

- chỉ cho phép (allow) các explicit origins (nguồn gốc rõ ràng) từ môi trường (env):
  - `WEB_ORIGIN`
  - `ADMIN_ORIGIN`
- không dùng `*` cho authenticated routes (đường dẫn yêu cầu xác thực)
- chỉ cho phép credentials (thông tin xác thực) cho origin (nguồn) thật sự cần cookie auth (xác thực bằng cookie)

## CSP / security headers (Chính sách bảo mật nội dung / Tiêu đề bảo mật)

### Baseline CSP (Chính sách bảo mật nội dung nền tảng)

- `default-src 'self'`
- `base-uri 'self'`
- `object-src 'none'`
- `frame-ancestors 'none'`
- `img-src 'self' https: data:`
- `media-src 'self' https:`
- `connect-src 'self'` cộng thêm origin (nguồn) API/search/edge thật sự cần thiết
- `script-src 'self'` và chỉ nới lỏng bằng nonce/hash (mã dùng một lần/mã băm) nếu framework (khung phần mềm) bắt buộc
- `style-src 'self' 'unsafe-inline'` chỉ khi chưa thoát khỏi các hạn chế của framework; nếu thoát được thì bỏ `unsafe-inline`

### Other headers (Các tiêu đề khác)

- `X-Content-Type-Options: nosniff` (ngăn trình duyệt đoán kiểu nội dung)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`: deny (từ chối) mặc định các capability (khả năng phần cứng/phần mềm) không sử dụng

## Rich text / HTML policy (Chính sách văn bản giàu nội dung / HTML)

- raw HTML (HTML thô) không được tin tưởng mặc định
- current phase (giai đoạn hiện tại):
  - member input (đầu vào của thành viên) không được phép lưu raw HTML
  - admin/editor HTML nếu có phải được sanitize (làm sạch) phía server (server-side) trước khi render (hiển thị)
- `SVG` hiển thị công cộng bị cấm ở giai đoạn hiện tại nếu chưa có sanitize pipeline (quy trình làm sạch) riêng

## Upload / media contract (Hợp đồng tải lên / truyền thông)

### Allowed file types (Các loại tệp được phép)

- avatar (ảnh đại diện): `jpg`, `jpeg`, `png`, `webp`
- post image (ảnh bài viết): `jpg`, `jpeg`, `png`, `webp`
- document (tài liệu): `pdf`
- audio (âm thanh): `mp3`, `m4a`
- video (phim): `mp4` chỉ ở route được kích hoạt thật

### Max size (Dung lượng tối đa)

- avatar: `5 MB`
- image nội dung: `10 MB`
- document/audio: `25 MB`
- video: `100 MB`

### Hardening rules (Các quy tắc thắt chặt)

- không chỉ tin vào `Content-Type` từ phía khách hàng (client)
- **phải có server-side MIME sniffing** bằng magic bytes, không phải extension check:
  - Library bắt buộc: **`file-type`** (npm `file-type`) — detect MIME từ buffer magic bytes
  - Flow: upload → `file-type.fromBuffer(buffer)` → so sánh với allowlist → reject nếu không match
  - **SAI**: `if (filename.endsWith('.jpg'))` — attacker đổi tên `.exe` thành `.jpg`
  - **ĐÚNG**: `const type = await fileTypeFromBuffer(buffer); if (!ALLOWED_MIMES.includes(type.mime)) reject()`
- object key (tên tệp lưu trữ) không dùng tên tệp gốc (raw filename) — generate UUID + extension
- checksum (mã kiểm tra toàn vẹn) nên được tính toán (`sha256`) và lưu trữ khi khả thi
- cấm trong giai đoạn hiện tại:
  - executable files (tệp thực thi)
  - script files (tệp kịch bản)
  - raw HTML upload public (tải HTML thô công khai)
  - SVG public render (hiển thị SVG công khai)

### Public/private asset rule (Quy tắc tài sản công khai/nội bộ)

- avatar và ảnh nội dung đã được approved (phê duyệt) có thể công khai (public)
- tài sản ở trạng thái `pending_scan (đang quét)`, `quarantined (bị cách ly)`, `rejected (bị từ chối)`, hoặc private attachment (tệp đính kèm riêng tư) không được phục vụ công khai trực tiếp
- signed URL (địa chỉ có chữ ký) chỉ dùng cho private asset (tài sản riêng tư) hoặc địa chỉ có thời hạn
- missing file (tệp bị thiếu) phải được hạ cấp (degrade) rõ ràng, không làm hỏng toàn bộ luồng yêu cầu

### Delete authorization (Ủy quyền xóa)

- owner (chủ sở hữu) chỉ xóa tài sản do chính mình sở hữu
- admin xóa theo chính sách hành động của quản trị viên (admin action policy)
- nondestructive delete (xóa không phá hủy) phải:
  - ghi nhật ký kiểm tra (audit log)
  - đi qua bước xác nhận (confirm step) ở giao diện quản trị

## Webhook contract (Hợp đồng Webhook)

- chỉ các đường dẫn (route) khai báo rõ ràng mới được nhận webhook
- bắt buộc phải có:
  - schema validation (kiểm tra lược đồ dữ liệu)
  - signature verification (xác thực chữ ký)
  - replay window (cửa sổ chống phát lại) `5 phút`
- nonce/event id store (kho lưu trữ mã dùng một lần/mã sự kiện):
  - giai đoạn 1 có thể dùng bảng Postgres hoặc lưu trữ vĩnh viễn tương đương
  - khi `Valkey` được kích hoạt thì có thể chuyển sang kho dùng chung (shared store)
- invalid signature (chữ ký không hợp lệ):
  - log structured event (ghi nhật ký sự kiện có cấu trúc)
  - trả về phản hồi trung tính
  - không tạo ra tác động phụ nghiệp vụ (business side effect)

## Secret handling (Quản lý bí mật)

- production secrets (bí mật môi trường chạy thật) không được commit vào kho mã nguồn (repo)
- local/dev (môi trường nội bộ/phát triển) có thể dùng tệp env
- production (môi trường thật) phải dùng đường dẫn tiêm bí mật (secret injection path) đã chốt
- rotation trigger (điểm kích hoạt xoay vòng) tối thiểu:
  - nghi ngờ lộ bí mật
  - người giữ bí mật rời bỏ vai trò
  - thay đổi nhà cung cấp / môi trường
- bí mật cần có quy trình (procedure) xoay vòng:
  - JWT/access secret
  - refresh secret
  - webhook secret
  - SMTP/API credentials (thông tin đăng ký dịch vụ)

## Audit events bắt buộc (Các sự kiện kiểm tra bắt buộc)

- login success (đăng nhập thành công)
- login fail (đăng nhập thất bại)
- logout (đăng xuất)
- logout-all (đăng xuất tất cả)
- password reset requested (yêu cầu thiết lập lại mật khẩu)
- password reset completed (hoàn tất thiết lập lại mật khẩu)
- email verification sent (gửi xác minh email)
- email verification completed (hoàn tất xác minh email)
- role changed (thay đổi quyền hạn)
- admin destructive action (hành động phá hủy của quản trị viên)
- file upload (tải tệp lên)
- file delete (xóa tệp)
- webhook signature fail (xác thực chữ ký webhook thất bại)

## Implementation note (Ghi chú triển khai)

Những quyết định trên phải được ánh xạ (map) tiếp vào:

- [manage-auth-session.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/01-identity/use-cases/manage-auth-session.md)
- [upload-media-asset.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-content/use-cases/upload-media-asset.md)
- [implementation-mapping.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/implementation-mapping.md)

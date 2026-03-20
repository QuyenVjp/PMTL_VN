# IMPLEMENTATION_MAPPING (Ánh xạ triển khai)

File này tồn tại để chặn ảo giác `design = runtime (thiết kế tức là đã chạy thật)`.
Nó không dùng để khoe roadmap (lộ trình). Nó dùng để trả lời một câu duy nhất:

`quyết định nào đã map sang artifact (sản phẩm mã nguồn) thật của NestJS rebuild?`

## Current truth (Thực trạng hiện tại)

- Current direction (Hướng đi hiện tại) là `rebuild backend (xây dựng lại hệ thống phía sau)` với NestJS.
- Runtime (môi trường thực thi) cũ trong repo không được tính là implementation (triển khai) hợp lệ cho direction (hướng đi) mới chỉ vì nó đang tồn tại.
- Ở thời điểm docs (tài liệu) này được viết, baseline rebuild (nền tảng xây dựng lại) chưa có artifact runtime (môi trường thực thi thực tế) thật để đánh dấu là `implemented (đã triển khai)`.
- Vì vậy bảng dưới đây chủ yếu liệt kê các `launch blockers (vật cản ngăn chặn ra mắt)` và `planned targets (mục tiêu đã lập kế hoạch)`, nhưng từng dòng đều chỉ rõ artifact (thành phần mã nguồn) sẽ phải xuất hiện ở đâu.

## Status semantics (Ý nghĩa các trạng thái)

- `implemented`: đã triển khai
  - đã có artifact (thành phần mã nguồn) thật và có thể chỉ ra đường dẫn hoặc runtime surface (bề mặt thực thi) cụ thể
- `required before launch`: yêu cầu trước khi ra mắt
  - launch blocker (vật cản ngăn chặn ra mắt) của quá trình rebuild
- `planned`: đã lập kế hoạch
  - hướng đi đã chốt nhưng chưa phải là baseline phase 1 (nền tảng giai đoạn 1)
- `forbidden for now`: hiện đang bị cấm
  - không được tự ý kích hoạt

## Không được đánh dấu implemented (đã triển khai) nếu thiếu:

- route/controller (đường dẫn/bộ điều hướng) hoặc HTTP surface (bề mặt HTTP) tương ứng
- service/module (lớp nghiệp vụ/mô-đun) tương ứng
- schema/migration (lược đồ/di cư dữ liệu) hoặc persistence artifact (thành phần lưu trữ vĩnh viễn) tương ứng
- runtime behavior (hành vi thực thi) kiểm chứng được

## Phase 1 launch blockers (Các vật cản ra mắt giai đoạn 1)

| Decision / requirement (Quyết định / Yêu cầu) | Expected artifact in rebuild (Thành phần dự kiến) | Status (Trạng thái) | What counts as implemented (Tiêu chuẩn hoàn thành) |
|---|---|---|---|
| `NestJS auth` là auth authority (quyền lực xác thực) duy nhất | `apps/api/src/modules/identity/*` + `apps/api/src/platform/sessions/*` | required before launch | login/refresh/logout/reset routes (đường dẫn đăng nhập/làm mới/đăng xuất/thiết lập lại) + guards (bộ canh phòng) + token/session persistence (lưu trữ token/phiên) |
| NestJS application baseline (Nền tảng ứng dụng NestJS) | app bootstrap (khởi động ứng dụng), global pipes/filters (bộ lọc/đường ống toàn cục), logger module (mô-đun nhật ký), guard chain (chuỗi canh phòng) | required before launch | Prisma + Zod pipe + Pino + global exception filter (bộ lọc ngoại lệ toàn cục) + error envelope (vỏ bọc lỗi chuẩn) phải hiện diện |
| access token + refresh rotation (xoay vòng token làm mới) | auth service (lớp nghiệp vụ xác thực) + token/session schema (lược đồ token/phiên) | required before launch | refresh (làm mới) xoay vòng được, token cũ bị revoke (thu hồi), logout-all (đăng xuất tất cả) hoạt động |
| `audit_logs` (nhật ký kiểm tra) | migration/schema (di cư/lược đồ) + append helper (hàm ghi nhật ký) + first audited routes (các đường dẫn được kiểm tra đầu tiên) | required before launch | ít nhất auth/admin/upload actions (các hành động xác thực/quản trị/tải lên) đã được append audit (ghi nhật ký kiểm tra) thật |
| `feature_flags` (cờ tính năng) | migration/schema (di cư/lược đồ) + evaluation service (lớp đánh giá tính năng) + first flag consumer (thành phần sử dụng cờ đầu tiên) | required before launch | có ít nhất 1 feature (tính năng) thật đi qua flag (cờ) |
| `sessions` (phiên đăng nhập) | migration/schema (di cư/lược đồ) + session persistence service (lớp lưu trữ phiên) | required before launch | logout/logout-all/revoke (đăng xuất/đăng xuất hết/thu hồi) không được là giả lập |
| `rate_limit_records` hoặc shared limiter equivalent (giới hạn tần suất) | migration/schema hoặc shared limiter store (kho giới hạn dùng chung) + guard | required before launch | auth/search/write/upload phải có limiter path (đường dẫn giới hạn) rõ ràng |
| local storage abstraction (lớp trừu tượng lưu trữ nội bộ) | storage interface (giao diện lưu trữ) + local adapter (bộ chuyển đổi nội bộ) + media metadata schema (lược đồ dữ liệu truyền thông) | required before launch | upload/delete/url logic (lý thuyết tải/xóa/địa chỉ) không phụ thuộc trực tiếp vào đường dẫn nội bộ (local path) |
| upload hardening (thắt chặt bảo mật tải lên) | upload controller/service + MIME sniffing (kiểm tra loại tệp) + allowlist (danh sách cho phép) + delete auth (ủy quyền xóa) | required before launch | từ chối (reject) file sai loại/dung lượng, ủy quyền xóa (delete auth) rõ ràng, nhật ký (audit) có ghi lại |
| `/health/live`, `/health/ready`, `/health/startup` (kiểm tra sức khỏe hệ thống) | health module/routes | required before launch | các đường dẫn live/ready/startup trả đúng contract (hợp đồng nghiệp vụ) giai đoạn 1 |
| `/metrics` tối thiểu | metrics endpoint (điểm truy cập chỉ số) + counters (bộ đếm) cơ bản | required before launch | các chỉ số request/error/upload/rate-limit có thể được scrape (thu thập) nội bộ |
| backup + restore drill (sao lưu + diễn tập phục hồi) | runbook (tài liệu vận hành) + restore drill record (nhật ký diễn tập phục hồi) | required before launch | [RESTORE_DRILL_LOG.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/RESTORE_DRILL_LOG.md) có evidence (bằng chứng) thật |

## First risky write-paths (Các luồng ghi dữ liệu rủi ro đầu tiên)

| Write-path doc (Tài liệu luồng ghi) | Expected rebuild artifact (Thành phần dự kiến) | Status (Trạng thái) | Launch note (Ghi chú ra mắt) |
|---|---|---|---|
| [manage-auth-session.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/00-identity/use-cases/manage-auth-session.md) | auth controller + auth service + session/token tables + audit append + rate limit | required before launch | Lỗi bảo mật (Auth bug) là vật cản ra mắt (launch blocker) |
| [upload-media-asset.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/01-content/use-cases/upload-media-asset.md) | upload controller + media service + storage adapter + media_assets table + asset status handling | required before launch | Ranh giới tải lên (Upload boundary) là vật cản ra mắt (launch blocker) |

## Deferred components (Các thành phần tạm hoãn)

| Decision / requirement (Quyết định / Yêu cầu) | Expected artifact in rebuild (Thành phần dự kiến) | Status (Trạng thái) | Trigger (Điểm kích hoạt) |
|---|---|---|---|
| `Valkey` | cache/rate-limit/queue infra module (mô-đun hạ tầng bộ nhớ đệm/giới hạn/hàng đợi) | planned | trạng thái dùng chung (shared state) hoặc nỗi đau bộ nhớ đệm (cache pain) đo lường được |
| `BullMQ` + worker (tiến trình nền) | queue module (mô-đun hàng đợi) + worker process (tiến trình xử lý nền) | planned | công việc chạy nền (background work) đủ chậm hoặc đủ quan trọng |
| `outbox_events` (sự kiện chờ phát) | migration (di cư) + dispatcher (lớp phân phát) + replay flow (luồng phát lại) | planned | các tác động phụ (side effect) quan trọng cần bàn giao có tính giao dịch (transactional handoff) |
| `Meilisearch` | index schema (lược đồ chỉ mục) + sync path (đường đồng bộ) + fallback route (đường dự phòng) | planned | tìm kiếm bằng SQL (search SQL) không còn đủ đáp ứng |
| `PgBouncer` | deploy config (cấu hình triển khai) + DB connection settings (cấu hình kết nối cơ sở dữ liệu) | planned | áp lực kết nối (connection pressure) có số liệu chứng minh |

## Forbidden for current phase (Bị cấm trong giai đoạn hiện tại)

| Decision / requirement (Quyết định / Yêu cầu) | Status (Trạng thái) | Why (Tại sao) |
|---|---|---|
| tracing backend (hệ thống truy vết phía sau) | forbidden for now | chưa vượt qua các tiêu chuẩn về logs/restore/runbook |
| queue (hàng đợi) trước khi có idempotency policy (chính sách bất biến) | forbidden for now | tránh tự tạo ra các tác động phụ bị trùng lặp (duplicate side effects) |
| public upload (tải lên công khai) thiếu sniffing/delete auth (kiểm tra/ủy quyền xóa) | forbidden for now | vi phạm ranh giới bảo mật (security boundary) |

## Review rule (Quy tắc rà soát)

Mỗi khi một decision (quyết định) đổi trạng thái sang `implemented (đã triển khai)`, phải cập nhật đồng thời:

- file này
- doc owner (tài liệu sở hữu) liên quan
- code reference (tham chiếu mã nguồn) cụ thể
- nếu là ops/runtime feature (tính năng vận hành/thực thi), thêm evidence (bằng chứng) hoặc command (lệnh) vào runbook (tài liệu vận hành) tương ứng

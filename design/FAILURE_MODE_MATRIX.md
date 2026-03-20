# FAILURE_MODE_MATRIX (Ma trận chế độ thất bại)

File này chỉ chốt `failure behavior (hành vi khi thất bại)` cho current phase (giai đoạn hiện tại) và optional future phase (giai đoạn tương lai tùy chọn).
Không coi dependency (phụ thuộc) chưa bật là baseline incident (sự cố nền tảng).

## Current-phase dependencies (Các phụ thuộc giai đoạn hiện tại)

- `Postgres`
- local media storage (lưu trữ truyền thông nội bộ)
- `Caddy`
- `apps/api`

## Optional future dependencies (Các phụ thuộc tương lai tùy chọn)

- `Valkey`
- `BullMQ`
- `apps/worker` (tiến trình xử lý nền)
- `Meilisearch`
- object storage (lưu trữ đối tượng) / scan pipeline (quy trình quét tệp)

## Operator contract tối thiểu (Hợp đồng vận hành tối thiểu)

Mỗi incident type (loại sự cố) phải trả lời được:

- user thấy gì (user visibility)
- API trả lớp lỗi nào (API error class)
- log level (mức độ nhật ký) nào tối thiểu phải có
- bước manual (thủ công) đầu tiên là gì
- điều kiện nào được coi là `healthy again (khỏe mạnh trở lại)`

## Phase 1 matrix (Ma trận giai đoạn 1)

| Dependency failure (Thất bại phụ thuộc) | User-facing behavior (Hành vi phía người dùng) | API behavior (Hành vi API) | Log level (Mức nhật ký) | First manual step (Bước thủ công đầu tiên) | Healthy again when (Khỏe lại khi nào) |
|---|---|---|---|---|---|
| `Postgres down` | trang công khai (public shell) có thể hiện degraded/maintenance (xuống cấp/bảo trì); không bịa dữ liệu mới | các luồng đọc/ghi chuẩn (canonical read/write) thất bại lỗi server; bộ dò sẵn sàng (readiness) thất bại | `error` (lỗi) | dừng thay đổi gây hại thêm, kiểm tra sức khỏe DB, xác định khởi động lại (restart) hay phục hồi (restore) | truy vấn DB vượt qua + bộ dò sẵn sàng (readiness) vượt qua + trạng thái di cư (migration) đúng |
| local media storage down (lưu trữ nội bộ hỏng) | các bề mặt ưu tiên văn bản (text-first surfaces) vẫn sống; tài sản lỗi thì hiện placeholder (hình giữ chỗ)/xuống cấp | việc tải lên (upload) mới thất bại đóng (fail closed); việc đọc siêu dữ liệu (metadata read) có thể còn sống | `warn` (cảnh báo) cho tệp thiếu, `error` (lỗi) cho luồng tải lên thất bại | kiểm tra phân vùng (volume)/đường dẫn (path)/lưu trữ vĩnh viễn (persistence) trước, tránh xóa bừa | phục vụ tệp nhị phân (binary serve) vượt qua hoặc tỉ lệ thiếu (missing rate) về ngưỡng chấp nhận |
| `Caddy down` | người dùng không vào được web/admin/api | các dịch vụ phía sau có thể vẫn sống nhưng không thể truy cập (reachable) từ ngoài | `error` (lỗi) | xác định tiến trình proxy (proxy process)/cấu hình (config)/xung đột cổng (port collision) | luồng đi vào (ingress route) vượt qua trở lại |
| `apps/api` unhealthy (không khỏe) | web/admin không làm được luồng động (dynamic flow) | bộ dò sống (live) có thể còn vượt qua, bộ dò sẵn sàng (ready) thất bại; luồng xác thực/ghi (auth/write path) thất bại | `error` (lỗi) | kiểm tra nhật ký (logs) theo mã yêu cầu (request id) / lỗi khởi động (startup error) / sai lệch môi trường (env mismatch) | khởi động thành công + kiểm tra sức khỏe (health) vượt qua |

## Phase 1 module stance (Quan điểm mô-đun giai đoạn 1)

| Module (Mô-đun) | `Postgres down` | local media storage down |
|---|---|---|
| Identity | `fail closed` (thất bại đóng) | `degrade` (xuống cấp) với avatar (ảnh đại diện) |
| Content | `fail closed` (thất bại đóng) cho đọc/ghi chuẩn | `degrade` (xuống cấp) nếu bài có media; văn bản vẫn sống |
| Community | `fail closed` (thất bại đóng) | `continue` (tiếp tục) với chỉ văn bản, `degrade` (xuống cấp) nếu có tài sản (asset) |
| Engagement | `fail closed` (thất bại đóng) | `continue` (tiếp tục) trừ các luồng phụ thuộc vào tài sản (asset) |
| Moderation | `fail closed` (thất bại đóng) | `continue` (tiếp tục) |
| Calendar | `fail closed` (thất bại đóng) | `degrade` (xuống cấp) nếu sự kiện cần media |
| Notification | `fail closed` (thất bại đóng) cho việc xác định mục tiêu chuẩn | `continue` (tiếp tục) nếu thông điệp không cần tài sản (asset) |
| Vows & Merit | `fail closed` (thất bại đóng) | `continue` (tiếp tục) |
| Wisdom & QA | `fail closed` (thất bại đóng) | `degrade` (xuống cấp) mạnh với audio/video |

## Optional future matrix (Ma trận tương lai tùy chọn)

Chỉ dùng phần này nếu dependency (phụ thuộc) tương ứng đã được kích hoạt thật sự.

| Dependency failure (Thất bại phụ thuộc) | Expected stance (Quan điểm dự kiến) | Recovery path (Đường phục hồi) |
|---|---|---|
| `Meilisearch down` | `degrade` (xuống cấp) về đường dự phòng SQL/API | khởi động lại + xây dựng lại/đánh chỉ mục lại (rebuild/reindex) khi cần |
| `Valkey` / worker down | ghi dữ liệu chuẩn vẫn ưu tiên sống; các tác động phụ bất đồng bộ (async side effects) bị trễ | khởi động lại + phát lại/thử lại (replay/retry) theo hàng đợi/sự kiện chờ phát (queue/outbox) |
| object storage (lưu trữ đối tượng) / scan fail (quét lỗi) | việc tải lên (upload) mới thất bại đóng (fail closed); tài sản (asset) cũ có thể còn phục vụ | thử lại việc tải lên, chạy lại quy trình quét, giải quyết trạng thái cách ly (quarantine) |

## Special rules (Các quy tắc đặc biệt)

### `Postgres down`

- không có chế độ chỉ đọc giả (fake read-only mode) từ bộ nhớ đệm (cache)/tìm kiếm (search)
- không dùng projection (phản chiếu) để giả làm canonical data (dữ liệu chuẩn gốc)
- nếu phải bảo trì (maintenance), hãy nói rõ là đang xuống cấp (degraded), không giả vờ khỏe mạnh

### local media storage down (Lưu trữ nội bộ hỏng)

- các trang ưu tiên văn bản (text-first pages) không được hỏng toàn bộ trang
- tài sản bị thiếu (missing asset) phải có hình giữ chỗ (placeholder) hoặc trạng thái rõ ràng
- việc tải lên (upload) mới phải thất bại đóng (fail closed), không ghi dữ liệu nửa vời

### Optional future search failure (Lỗi tìm kiếm tương lai tùy chọn)

- nếu `Meilisearch` đã được bật và bị chết:
  - tìm kiếm công khai (public search) được chuyển sang đường dự phòng (fallback) về SQL/API nếu chính sách hiển thị (visibility policy) vẫn được đảm bảo
  - sự xuống cấp của tìm kiếm (search degrade) không được kéo sập việc đọc nội dung/công khai

### Optional future async failure (Lỗi bất đồng bộ tương lai tùy chọn)

- nếu hàng đợi/sự kiện chờ phát (queue/outbox) đã được bật:
  - việc ghi dữ liệu chuẩn (canonical write) vẫn là bước ưu tiên hàng đầu
  - tác động phụ (side effect) chưa được coi là đã phân phát (delivered) khi hàng đợi/xử lý nền (queue/worker) hỏng
  - đường phục hồi (recovery path) là phát lại/thử lại (replay/retry) chuẩn, không đánh dấu đã xong (done) thủ công cho có lệ

## Asset-state expectation (Kỳ vọng trạng thái tài sản) nếu sau này bật scan/quarantine (quét/cách ly)

- `uploaded` (đã tải lên)
- `pending_scan` (chờ quét)
- `quarantined` (bị cách ly)
- `approved` (đã phê duyệt)
- `rejected` (bị từ chối)
- `published` (đã xuất bản)

Không được nối tắt trực tiếp từ upload (tải lên) sang public (công khai) nếu chính sách quét/cách ly (scan/quarantine policy) đã được kích hoạt.

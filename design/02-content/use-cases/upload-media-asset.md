# Upload Media Asset (Tải lên Tập tin Phương tiện)

## Mục đích (Purpose)
Chốt đường dẫn ghi dữ liệu (write-path) an toàn cho việc tải lên (upload) và quản lý phương tiện (`media`) trong giai đoạn hiện tại. Tài liệu này áp dụng cho:
- Ảnh đại diện (avatar).
- Ảnh bài viết (post image).
- Tệp đính kèm/tài liệu (attachment/document).
- Âm thanh/Video (nếu các tuyến đường này được kích hoạt).

## Thiết lập mặc định hiện tại (Current Defaults)
- Môi trường lưu trữ: Trình điều phối đĩa cục bộ (local disk adapter).
- Dữ liệu chuẩn gốc (metadata canonical): Lưu tại PostgreSQL.
- Khóa đối tượng (object key): Được tự động tạo, không sử dụng tên tệp thô từ người dùng.

## Các bản ghi chuẩn gốc (Canonical Records)
- `media_assets` (Tài sản phương tiện).
- `audit_logs` (Nhật ký kiểm toán).
- `rate_limit_records` (Hồ sơ giới hạn tốc độ) hoặc kho lưu trữ giới hạn dùng chung tương đương.

## Các định dạng được phép và giới hạn (Allowed Types & Limits)

- **Ảnh đại diện (avatar):**
  - Định dạng: `jpg`, `jpeg`, `png`, `webp`.
  - Tối đa: 5 MB.
- **Ảnh bài viết (post image):**
  - Định dạng: `jpg`, `jpeg`, `png`, `webp`.
  - Tối đa: 10 MB.
- **Tài liệu (document):**
  - Định dạng: `pdf`.
  - Tối đa: 25 MB.
- **Âm thanh (audio):**
  - Định dạng: `mp3`, `m4a`.
  - Tối đa: 25 MB.
- **Video (video):**
  - Định dạng: `mp4`.
  - Tối đa: 100 MB (Chỉ kích hoạt khi kịch bản sử dụng thực sự nằm trong phạm vi).

## Các định dạng bị cấm trong giai đoạn này (Forbidden)
- Các tệp thực thi (executable files).
- Các tệp kịch bản (script files).
- Tệp HTML thô công khai.
- Tệp SVG công khai (cho đến khi có quy trình khử độc - sanitize pipeline riêng).

## Quy trình tải lên (Upload Flow)

### Các lớp bảo vệ (Guards)
- Phân quyền (Authz) theo chủ sở hữu hoặc quản trị viên.
- Giới hạn tốc độ tải lên (Rate limit).
- Kiểm tra cấu trúc dữ liệu (Schema validation).

### Thứ tự ghi dữ liệu chuẩn (Canonical Write Path)
1. Xác thực cấu trúc yêu cầu (Validate request schema).
2. Xác thực danh sách định dạng cho phép (Extension allowlist).
3. Xác thực loại nội dung (MIME) được kiểm tra từ phía máy chủ.
4. Xác thực giới hạn kích thước tệp.
5. Tạo khóa đối tượng (object key) an toàn.
6. Ghi dữ liệu nhị phân (binary) thông qua trình điều phối lưu trữ.
7. Tính toán và lưu mã băm (checksum) nếu hệ thống hỗ trợ.
8. Ghi dữ liệu đặc tả chuẩn gốc (metadata canonical) vào PostgreSQL:
   - Bên cung cấp lưu trữ (storage provider).
   - Khóa đối tượng (object key).
   - Tên tệp gốc.
   - Loại nội dung (content type).
   - Kích thước, mã băm, người sở hữu và trạng thái tài sản.
9. Ghi nhật ký kiểm toán hành động `file.uploaded`.

## Mô hình trạng thái tài sản (Asset Status Model)
- `uploaded` (Đã tải lên).
- `pending_scan` (Chờ quét mã độc).
- `approved` (Đã phê duyệt).
- `quarantined` (Bị cách ly).
- `rejected` (Bị từ chối).
- `published` (Đã xuất bản).
Nếu giai đoạn hiện tại chưa có dịch vụ quét mã độc thật sự, tài liệu vẫn phải duy trì mô hình trạng thái này để chuẩn bị cho tương lai.

## Quy tắc phân phối công khai/riêng tư (Serve Rules)
- Chỉ những tệp đã "được phê duyệt/xuất bản" mới được phép phân phối công khai.
- Các tệp riêng tư hoặc đang chờ quét không được phép truy cập trực tiếp.
- Nếu tệp nhị phân bị thiếu, hệ thống phải giảm cấp hiển thị (degrade) rõ ràng, không làm hỏng toàn bộ trang.

## Quy trình xóa (Delete Flow)
- **Người có quyền xóa:**
  - Chủ sở hữu: Chỉ xóa tài sản do chính mình sở hữu theo quy định.
  - Quản trị viên: Xóa qua các tuyến đường quản trị và có nhật ký kiểm toán.
- **Tính chất hành động xóa:**
  - Phải đi qua bước kiểm tra quyền hạn.
  - Phải có nhật ký kiểm toán rõ ràng.
  - Nếu giai đoạn hiện tại chưa có tính năng xóa mềm (soft-delete), việc xóa vĩnh viễn phải được cân nhắc kỹ lưỡng.

## Hành vi khi gặp lỗi (Failure Behavior)
- Lỗi kiểm tra MIME/Kích thước: Ngắt quy trình ngay lập tức (fail closed).
- Lỗi ghi vào bộ lưu trữ: Không được tạo dữ liệu đặc tả trong cơ sở dữ liệu như thể đã thành công.
- Lỗi ghi dữ liệu đặc tả sau khi đã ghi tệp nhị phân: Phải có quy trình dọn dẹp hoặc đối soát (reconciliation path).
- Thiếu tệp nhị phân nhưng dữ liệu đặc tả vẫn còn: Giao diện người dùng phải hiển thị trạng thái lỗi rõ ràng; Quản trị viên phải thấy cảnh báo sai lệch tài sản (asset mismatch).

## Các sự kiện kiểm toán bắt buộc (Required Audit Events)
- `file.uploaded` (Đã tải lên).
- `file.deleted` (Đã xóa).
- `file.publish_blocked` (Bị chặn xuất bản).
- `file.scan_failed` (Quét thất bại).
- `file.missing_detected` (Phát hiện tệp bị thiếu).

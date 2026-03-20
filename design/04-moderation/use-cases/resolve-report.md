# Resolve Moderation Report (Giải quyết Báo cáo Kiểm duyệt)

## Mục đích (Purpose)
Cho phép quản trị viên hoặc quản trị viên cấp cao đưa ra quyết định xử lý một báo cáo vi phạm đã được tạo, đồng thời đồng bộ hóa quyết định đó lên thực thể mục tiêu.

## Mô-đun sở hữu (Owner module)
- `moderation` (Kiểm duyệt)

## Các đối tượng thực hiện (Actors)
- Quản trị viên (`admin`).
- Quản trị viên cấp cao (`super-admin`).

## Điểm kích hoạt (Trigger)
Quản trị viên gửi yêu cầu đến `POST /api/moderation/reports/:publicId/decision`.

## Điều kiện tiên quyết (Preconditions)
- Đối tượng thực hiện có vai trò (role) phù hợp.
- Báo cáo tồn tại và chưa ở trạng thái cuối (terminal status) không cho phép chỉnh sửa theo chính sách.
- Thực thể đích của báo cáo vẫn còn tồn tại để truy xuất.
- Nếu thực thể hoặc quyết định hiện tại thuộc phạm vi bảo vệ của Quản trị viên cấp cao (`super-admin protected scope`), chỉ Quản trị viên cấp cao mới có quyền tiếp tục xử lý.

## Hợp đồng dữ liệu đầu vào (Input Contract)
- Các quyết định cụ thể tại máy chủ:
  - `approved` (Đã phê duyệt).
  - `rejected` (Đã bác bỏ).
  - `flagged` (Đã đánh dấu theo dõi).
  - `hidden` (Đã ẩn thực thể).
- Nếu có tín hiệu hạ nguồn, gói dữ liệu outbox phải bao gồm loại sự kiện, phiên bản sự kiện và mã tính không đổi (idempotency key).

## Tập hợp dữ liệu đọc (Read Set)
- Bộ sưu tập các báo cáo kiểm duyệt (`moderationReports`).
- Bộ sưu tập thực thể đích (target entity).
- Thông tin định danh của người thực hiện (actor/admin).
- Người giải quyết trước đó (nếu báo cáo đã từng được xử lý).
- Dữ liệu đặc tả phạm vi bảo vệ (nếu mục tiêu gắn liền với Quản trị viên cấp cao).

## Thứ tự ghi dữ liệu chuẩn (Write Path)
1. Xác định báo cáo bằng ID công khai (`publicId`).
2. Xác thực nội dung dữ liệu quyết định (payload).
3. Kiểm tra các trường hợp ngoại lệ về quyền hạn:
   - Quản trị viên được quyền giải quyết lại các quyết định do người khác tạo (nếu chính sách cho phép).
   - Quản trị viên không được quyền ghi đè hoặc thao tác trong phạm vi bảo vệ của Quản trị viên cấp cao.
   - Quản trị viên cấp cao có thể quyền ghi đè xử lý khi cần thiết.
4. Cập nhật bản ghi báo cáo chuẩn gốc vào bộ sưu tập `moderationReports`.
5. Đồng bộ hóa các trường tóm tắt kiểm duyệt lên thực thể đích:
   - Trạng thái kiểm duyệt (`moderationStatus`).
   - Trạng thái phê duyệt (`approvalStatus`).
   - Trạng thái ẩn (`isHidden`).
6. Thêm sự kiện nhật ký kiểm toán hành động `moderation.report.resolve`.
7. Nạp sự kiện outbox hạ nguồn tương ứng (nếu có thông báo hoặc ghi vết nội bộ).

## Tác động phụ bất đồng bộ (Async Side-effects)
- Thông báo cho người dùng bị ảnh hưởng.
- Ghi vết quản trị nội bộ nếu chính sách yêu cầu.

## Kết quả thành công (Success Result)
- Báo cáo cập nhật trạng thái quyết định mới.
- Thực thể đích phản ánh chính xác tóm tắt kiểm duyệt để các bộ lọc nội dung công khai hoạt động đúng.

## Các lỗi có thể xảy ra (Errors)
- `400`: Quyết định xử lý không hợp lệ.
- `401`: Chưa đăng nhập.
- `403`: Vai trò không đủ quyền hoặc xâm phạm phạm vi bảo vệ của Quản trị viên cấp cao.
- `404`: Báo cáo vi phạm hoặc mục tiêu không tồn tại.
- `409`: Báo cáo đã ở trạng thái không cho phép giải quyết lại.
- `500`: Lỗi đồng bộ hóa tóm tắt hoặc lỗi thông báo hạ nguồn.

## Kiểm toán (Audit)
- Ghi nhật ký hành động `moderation.report.resolve`.
- Dữ liệu đặc tả bao gồm: ID báo cáo, loại mục tiêu, ID công khai mục tiêu, người thực hiện, người giải quyết trước (nếu có) và nội dung quyết định.

## Tính không đổi / Chống thư rác (Idempotency / Anti-spam)
- Việc giải quyết lại với cùng một quyết định không được tạo ra bản ghi báo cáo mới.
- Giải quyết lại hợp lệ vẫn phải để lại dấu vết kiểm toán riêng, không được ghi đè lên lịch sử cũ như thể chưa từng xảy ra.
- Nếu tóm tắt tại mục tiêu bị sai lệch, quy trình khôi phục là tính toán lại từ `moderationReports`, không suy diễn ngược từ các trường tóm tắt có sẵn.

## Mục tiêu hiệu năng (Performance Target)
- Đường dẫn ra quyết định không phải chờ quy trình thông báo người dùng hoàn tất.

## Ghi chú cho AI/sinh mã (Notes for AI/codegen)
- Quyết định kiểm duyệt phải được ghi vào nguồn báo cáo trước tiên, sau đó mới đồng bộ tóm tắt lên đích.
- Phê duyệt sổ lưu niệm là một trạng thái biến thể riêng, nhưng vẫn phải tôn trọng chủ sở hữu của thực thể đích.
- Quản trị viên thông thường có thể giải quyết lại quyết định của quản trị viên khác.
- Tuy nhiên, quản trị viên không được phép ghi đè hay thao tác trong các phạm vi được bảo vệ bởi Quản trị viên cấp cao.

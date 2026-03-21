# Report Comment (Báo cáo Vi phạm Bình luận)

## Mục đích (Purpose)
Cho phép người dùng báo cáo một bình luận không phù hợp, đồng thời duy trì nguồn dữ liệu chuẩn gốc (source of truth) tập trung tại mô-đun kiểm duyệt.

## Mô-đun sở hữu (Owner module)
- `moderation` (Kiểm duyệt)

## Các đối tượng thực hiện (Actors)
- Thành viên (`member`).
- Khách (`guest`) nếu chính sách tuyến đường (route policy) hiện tại cho phép.

## Điểm kích hoạt (Trigger)
Trang web gọi yêu cầu đến `POST /api/comments/:publicId/report` hoặc tuyến đường báo cáo bình luận tương đương.

## Điều kiện tiên quyết (Preconditions)
- Bình luận mục tiêu (target comment) tồn tại trong hệ thống.
- Lý do báo cáo (`reason`) hợp lệ theo cấu trúc `commentReportSchema`.
- Đối tượng thực hiện chưa bị các hệ thống chống thư rác (anti-spam) hoặc chốt chặn yêu cầu (request guard) chặn lại.

## Hợp đồng dữ liệu đầu vào (Input Contract)
- `commentReportSchema` (Cấu trúc báo cáo bình luận).
- Tham số tuyến đường (route param) sử dụng ID công khai (`publicId`).
- Nếu phase 2+ bật cảnh báo hạ nguồn qua outbox, payload phải có loại sự kiện, phiên bản sự kiện và mã tính không đổi (idempotency key).

## Tập hợp dữ liệu đọc (Read Set)
- Bộ sưu tập bình luận bài viết (`postComments`) hoặc bộ sưu tập bình luận mục tiêu tương ứng.
- Bộ sưu tập các báo cáo kiểm duyệt (`moderationReports`).
- Phiên làm việc định danh (identity session) nếu có.
- Chốt chặn yêu cầu (request guard) nếu chính sách có sử dụng.

## Thứ tự ghi dữ liệu chuẩn (Write Path)
1. Xác định bình luận mục tiêu bằng ID công khai (`publicId`).
2. Xác thực nội dung báo cáo (payload).
3. Kiểm tra các báo cáo trùng lặp chưa giải quyết theo chính sách.
4. Ghi bản ghi chuẩn gốc (canonical record) vào bộ sưu tập `moderationReports`.
5. Đồng bộ hóa các trường tóm tắt (summary fields) lên thực thể đích:
   - Số lượng báo cáo (`reportCount`).
   - Lý do báo cáo gần nhất (`lastReportReason`).
   - Trạng thái kiểm duyệt hoặc trạng thái ẩn (nếu chính sách tự động kích hoạt).
6. Thêm sự kiện nhật ký kiểm toán hành động `moderation.report.submit`.
7. **Phase 1**: cảnh báo quản trị có thể đi theo sync hoặc best-effort path có log intent + log outcome + manual recovery rõ.
8. **Phase 2+**: nếu alert reliability đã bật, append `outbox_events` để tạo cảnh báo cho quản trị viên.

## Tác động phụ bất đồng bộ (Async Side-effects)
- **Phase 1**: admin alert là optional sync/best-effort side-effect.
- **Phase 2+**: admin alert quan trọng đi qua outbox/dispatcher.

## Kết quả thành công (Success Result)
- Bản ghi báo cáo chuẩn gốc được tạo thành công.
- Thực thể đích cập nhật các trường tóm tắt mới phục vụ cho việc lọc nội dung của quản trị viên hoặc công chúng.

## Các lỗi có thể xảy ra (Errors)
- `400`: Lý do báo cáo không hợp lệ.
- `404`: Bình luận mục tiêu không tồn tại.
- `409`: Báo cáo chưa giải quyết bị trùng lặp hoặc xung đột trạng thái.
- `429`: Bị hệ thống chống thư rác chặn.
- `500`: Lỗi đồng bộ hóa tóm tắt, lỗi alert sync ở phase 1, hoặc lỗi hạ nguồn/outbox ở phase 2+.

## Kiểm toán (Audit)
- Ghi nhật ký hành động `moderation.report.submit`.
- Dữ liệu đặc tả nên bao gồm: ID báo cáo, ID công khai của mục tiêu, loại đối tượng thực hiện và lý do báo cáo.

## Tính không đổi / Chống thư rác (Idempotency / Anti-spam)
- Không cho phép cùng một đối tượng thực hiện gửi báo cáo liên tục cho cùng một mục tiêu trong khoảng thời gian ngắn.
- Việc gửi lại yêu cầu do lỗi mạng không được tạo ra nhiều báo cáo chưa giải quyết giống hệt nhau.
- Việc phát lại hàng đợi outbox không được tạo cảnh báo trùng lặp cho cùng một báo cáo chuẩn gốc khi phase 2+ đã bật.

## Mục tiêu hiệu năng (Performance Target)
- Việc tạo báo cáo chuẩn gốc và trigger downstream tối thiểu nên hoàn tất trong vòng dưới 800ms.

## Ghi chú cho AI/sinh mã (Notes for AI/codegen)
- `moderationReports` là nguồn dữ liệu chuẩn gốc; tuyệt đối không nhét toàn bộ vòng đời báo cáo vào bộ sưu tập `postComments`.
- Các trường tóm tắt trên mục tiêu chỉ là mô hình dữ liệu đọc (read model).

# Submit Community Post (Gửi Bài đăng Cộng đồng)

## Mục đích (Purpose)
Cho phép thành viên gửi bài viết lên không gian thảo luận cộng đồng trong khi vẫn đảm bảo các rào chắn chống thư rác (anti-spam) và phân định ranh giới trách nhiệm kiểm duyệt (moderation boundary) rõ ràng.

## Mô-đun sở hữu (Owner module)
- `community` (Cộng đồng)

## Các đối tượng thực hiện (Actors)
- Thành viên (`member`).
- Có thể hỗ trợ khách (`guest`) nếu chính sách sau này cho phép, nhưng luồng hiện tại ưu tiên người dùng có phiên làm việc (session).

## Điểm kích hoạt (Trigger)
Trang web gửi yêu cầu đến `POST /api/community/posts/submit`.

## Điều kiện tiên quyết (Preconditions)
- Đối tượng thực hiện có phiên làm việc hợp lệ hoặc luồng cho phép khách.
- Thân yêu cầu (request body) tuân thủ cấu trúc `communityPostSubmitSchema`.
- Chốt chặn yêu cầu (request guard) không chặn hành động này.

## Hợp đồng dữ liệu đầu vào (Input Contract)
- `communityPostSubmitSchema` (Cấu trúc gửi bài đăng cộng đồng).
- Nếu có tín hiệu hạ nguồn, gói dữ liệu outbox phải bao gồm loại sự kiện (event type), phiên bản sự kiện (event version) và mã tính không đổi (idempotency key).

## Tập hợp dữ liệu đọc (Read Set)
- Phiên làm việc định danh (identity session).
- Tài liệu bài đăng cộng đồng (`communityPosts`).
- Trạng thái chốt chặn yêu cầu / chống thư rác.

## Thứ tự ghi dữ liệu chuẩn (Write Path)
1. Phân tích thân yêu cầu theo cấu trúc dữ liệu (schema).
2. Xác thực đối tượng thực hiện và kiểm tra chốt chặn yêu cầu.
3. Ghi bản ghi chuẩn gốc (canonical record) vào bộ sưu tập `communityPosts`.
4. Khởi tạo các trường tóm tắt đọc nhanh nếu bộ sưu tập yêu cầu.
5. Thêm sự kiện nhật ký kiểm toán hành động `community.post.submit`.
6. Nếu chính sách yêu cầu sự chú ý nội bộ, nạp thêm sự kiện outbox để tạo thông báo cho quản trị viên hoặc tín hiệu đánh giá kiểm duyệt.

## Tác động phụ bất đồng bộ (Async Side-effects)
- Gửi thông báo nội bộ.
- Tín hiệu yêu cầu sự chú ý kiểm duyệt nếu chính sách quy định.

## Kết quả thành công (Success Result)
- Bài đăng cộng đồng được tạo thành công tại mô-đun sở hữu.
- Dòng tin tức cộng đồng (community feed) có thể hiển thị bài đăng theo chính sách phê duyệt hiện hành.

## Các lỗi có thể xảy ra (Errors)
- `400`: Thân yêu cầu không hợp lệ.
- `401`: Thiếu phiên làm việc khi luồng xử lý yêu cầu đăng nhập.
- `403`: Đối tượng thực hiện bị chặn.
- `429`: Bị chặn bởi hệ thống chống thư rác.
- `500`: Lỗi hệ thống.

## Kiểm toán (Audit)
- Ghi nhật ký hành động `community.post.submit`.

## Tính không đổi / Chống thư rác (Idempotency / Anti-spam)
- Chốt chặn yêu cầu là lớp bảo vệ chính chống lại việc gửi tin hàng loạt (flood).
- Không sử dụng tiến trình thông báo làm dấu hiệu chuẩn gốc cho việc bài đăng đã được tạo.
- Việc phát lại hàng đợi outbox không được tạo ra các cảnh báo trùng lặp rõ ràng.

## Mục tiêu hiệu năng (Performance Target)
- Luồng gửi bài chỉ ghi bản ghi chuẩn gốc và nạp sự kiện outbox cho các công việc hạ nguồn.

## Ghi chú cho AI/sinh mã (Notes for AI/codegen)
- `communityPosts` là bản ghi chuẩn gốc (canonical record); quy trình kiểm duyệt và thông báo chỉ là các tác vụ hạ nguồn.

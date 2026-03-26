# Submit Post Comment (Gửi Bình luận Bài viết)

## Mục đích (Purpose)
Cho phép thành viên gửi bình luận vào một bài viết công khai, theo fast-path visible policy khi an toàn, rồi quy trình kiểm duyệt và thông báo xử lý tác vụ hạ nguồn.

## Mô-đun sở hữu (Owner module)
- `community` (Cộng đồng)

## Các đối tượng thực hiện (Actors)
- Thành viên (`member`)

## Điểm kích hoạt (Trigger)
Trang web gọi tuyến đường (route) gửi bình luận cho bài viết: `POST /api/community/posts/:publicId/comments`.

## Điều kiện tiên quyết (Preconditions)
- Bài viết mục tiêu tồn tại trong hệ thống và vẫn cho phép nhận bình luận.
- Thân yêu cầu (request body) tuân thủ cấu trúc dữ liệu hợp lệ.
- Đối tượng thực hiện không bị hệ thống chốt chặn yêu cầu (request guard) hoặc chống thư rác (anti-spam) chặn lại.

## Hợp đồng dữ liệu đầu vào (Input Contract)
- `legacyCommentSubmitSchema` hoặc hợp đồng gửi bình luận tương ứng.

## Tập hợp dữ liệu đọc (Read Set)
- Tài liệu bài viết (`posts`).
- Tài liệu bình luận (`postComments`).
- Trạng thái chốt chặn yêu cầu / chống thư rác (nếu có).
- Phiên làm việc định danh (identity session) của thành viên đang đăng nhập.

## Thứ tự ghi dữ liệu chuẩn (Write Path)
1. Xác thực bài viết mục tiêu bằng cách sử dụng ID công khai (`publicId`) hoặc bối cảnh tuyến đường.
2. Xác thực nội dung yêu cầu và chính sách chống thư rác.
3. Ghi bản ghi bình luận chuẩn gốc (canonical comment record) vào bộ sưu tập `postComments`.
4. Nếu actor hoặc payload rủi ro, gán comment về `pending/manual review`; nếu an toàn thì cho đi theo fast-path visible policy.
5. Cập nhật mô hình dữ liệu đọc tóm tắt nếu cần thiết (ví dụ: `commentCount` trên bài viết).
6. Thêm sự kiện nhật ký kiểm toán hành động `community.comment.submit`.
7. Nếu chính sách kích hoạt yêu cầu xem xét, nạp sự kiện outbox hoặc dispatch best-effort để tạo cảnh báo kiểm duyệt hoặc thông báo nội bộ.
8. Nếu comment là reply vào comment của người khác, có thể phát notification request cho owner của comment cha theo category `community`.

## Tác động phụ bất đồng bộ (Async Side-effects)
- Gửi thông báo cho quản trị viên.
- Cảnh báo kiểm duyệt nếu cần rà soát lại nội dung.

## Kết quả thành công (Success Result)
- Bản ghi chuẩn gốc của bình luận được tạo thành công.
- Luồng đọc của bài viết có thể trả về bình luận mới tùy theo chính sách hiển thị hiện tại.
- Comment đủ điều kiện hiển thị có thể nhận `tim` và `report`, nhưng hai flow này không thay đổi canonical owner của comment.

## Các lỗi có thể xảy ra (Errors)
- `400`: Thân yêu cầu không hợp lệ hoặc nội dung bình luận quá ngắn/dài.
- `404`: Bài viết mục tiêu không tồn tại.
- `409`: Gửi trùng lặp rõ ràng hoặc bình luận cha không hợp lệ.
- `429`: Bị chặn bởi chốt chặn yêu cầu.
- `500`: Lỗi dịch vụ nghiệp vụ hoặc hệ thống hạ nguồn.

## Kiểm toán (Audit)
- Ghi nhật ký hành động `community.comment.submit`.
- Dữ liệu đặc tả (metadata) nên bao gồm ID công khai của bài viết, loại đối tượng thực hiện và mã tương quan (`correlationId`).

## Tính không đổi / Chống thư rác (Idempotency / Anti-spam)
- Chốt chặn yêu cầu chịu trách nhiệm chống lại hành động gửi tin hàng loạt (flood).
- Nếu máy khách gửi lại yêu cầu do hết thời gian (timeout), máy chủ nên tránh tạo ra các bản ghi trùng lặp khi có dấu hiệu nhận diện (fingerprint) phù hợp.
- Việc phát lại hàng đợi outbox không được phép tạo ra các cảnh báo trùng lặp cho cùng một bình luận chuẩn gốc.

## Mục tiêu hiệu năng (Performance Target)
- Việc ghi bình luận chuẩn gốc và nạp sự kiện outbox nên hoàn tất trong vòng dưới 800ms.

## Ghi chú cho AI/sinh mã (Notes for AI/codegen)
- Bộ sưu tập `postComments` là chủ sở hữu của bình luận, không phải mô-đun nội dung.
- Báo cáo kiểm duyệt là một luồng xử lý khác; việc gửi bình luận không được tự động tạo bản ghi trong `moderationReports` trừ khi chính sách quy định rõ ràng.

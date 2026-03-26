# Submit Community Comment (Gửi Bình luận vào Bài Cộng đồng)

## Mục đích (Purpose)
Cho phép thành viên tham gia thảo luận dưới bài cộng đồng bằng comment hoặc reply nông, với fast-path visible policy khi an toàn.

## Mô-đun sở hữu (Owner module)
- `community` (Cộng đồng)

## Các đối tượng thực hiện (Actors)
- Thành viên (`member`)

## Điểm kích hoạt (Trigger)
Trang web gọi `POST /api/community/posts/:publicId/comments`.

## Điều kiện tiên quyết (Preconditions)
- Bài cộng đồng mục tiêu tồn tại.
- Bài mục tiêu cho phép nhận bình luận.
- Actor có session hợp lệ và không bị block.
- Payload tuân thủ `communityCommentSubmitSchema` hoặc schema owner tương đương.

## Tập hợp dữ liệu đọc (Read Set)
- identity session
- `communityPosts`
- `communityComments`
- request guard / anti-spam state

## Thứ tự ghi dữ liệu chuẩn (Write Path)
1. Xác thực target community post.
2. Validate payload và parent comment nếu là reply.
3. Đánh giá risk policy cho actor/payload.
4. Ghi canonical comment vào `communityComments`.
5. Nếu risk thấp, cho comment đi theo fast-path visible; nếu risk cao, ép về pending/manual review.
6. Cập nhật `commentCount` summary cho bài cộng đồng nếu policy dùng denormalized read model.
7. Phát notification request cho owner của comment cha hoặc owner bài khi policy cho phép.
8. Ghi audit action `community.comment.submit`.

## Kết quả thành công (Success Result)
- Comment được tạo thành công.
- Bài cộng đồng phản ánh comment mới theo visibility policy hiện hành.

## Các lỗi có thể xảy ra (Errors)
- `400`: payload không hợp lệ.
- `401`: chưa đăng nhập.
- `403`: actor bị block hoặc target đóng comment.
- `404`: target post/comment không tồn tại.
- `409`: parent comment conflict hoặc duplicate rõ ràng.
- `429`: anti-spam / rate-limit chặn.

## Ghi chú cho AI/sinh mã (Notes for AI/codegen)
- `communityComments` là owner canonical của comment trong thread cộng đồng.
- Report và auto-hide là luồng hạ nguồn, không thay owner của comment.
- Thread depth phải giữ nông và render predictable.

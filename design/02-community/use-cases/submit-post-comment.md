# Submit Post Comment

## Purpose
- Cho người dùng hoặc khách gửi bình luận vào bài viết public, sau đó để moderation/notification xử lý downstream.

## owner module (module sở hữu)
- `community`

## Actors
- `member`
- `guest`

## trigger (điểm kích hoạt)
- Web gọi route submit comment cho `posts/:publicId/comments`.

## preconditions (điều kiện tiên quyết)
- Post mục tiêu tồn tại và còn cho phép bình luận.
- Payload body qua schema (lược đồ dữ liệu) hợp lệ.
- Actor không bị request guard hoặc anti-spam chặn.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)
- `legacyCommentSubmitSchema` hoặc contract (hợp đồng dữ liệu/nghiệp vụ) comment submit tương ứng.
- Nếu chưa đăng nhập, phải có author snapshot hợp lệ theo policy hiện tại.

## Read set
- `posts`
- `postComments`
- request guard / anti-spam state khi có
- identity session nếu user đã đăng nhập

## write path (thứ tự ghi dữ liệu chuẩn)
1. Xác thực post target bằng `publicId` hoặc route context.
2. Validate body và policy anti-spam.
3. Ghi canonical comment record vào `postComments`.
4. Cập nhật summary read model (mô hình dữ liệu đọc) nếu cần như `commentCount` trên post.
5. Append audit event `community.comment.submit`.
6. Nếu policy bật attention/review, append outbox event cho moderation alert hoặc internal notification.

## async (bất đồng bộ) side-effects
- notification cho admin/super-admin
- moderation alert nếu cần review

## success result (kết quả thành công)
- Comment canonical record (bản ghi chuẩn gốc) được tạo.
- Read path của thread có thể trả comment mới theo policy hiển thị.

## Errors
- `400`: body không hợp lệ hoặc comment quá ngắn/dài.
- `404`: post không tồn tại.
- `409`: duplicate submit rõ ràng hoặc parent comment invalid.
- `429`: request guard chặn.
- `500`: lỗi service (lớp xử lý nghiệp vụ) hoặc downstream.

## Audit
- log `community.comment.submit`
- metadata nên có post publicId, actor type, correlationId

## Idempotency / anti-spam
- request guard chịu trách nhiệm chống spam burst.
- Nếu retry từ client do timeout, server nên tránh tạo duplicate rõ ràng khi có fingerprint phù hợp.
- replay outbox không được tạo duplicate alert cho cùng canonical comment.

## Performance target
- Ghi canonical comment + enqueue alert nên hoàn tất trong `< 800ms`.

## Notes for AI/codegen
- `postComments` là owner của comment, không phải content module.
- Moderation report là flow khác; submit comment không được tự tạo `moderationReports` trừ khi policy nói rõ.


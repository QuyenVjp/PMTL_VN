# Submit Community Post

## Purpose
- Cho thành viên gửi bài cộng đồng để hiển thị trên không gian thảo luận mà vẫn giữ anti-spam và moderation boundary (ranh giới trách nhiệm) rõ ràng.

## owner module (module sở hữu)
- `community`

## Actors
- `member`
- có thể hỗ trợ `guest` nếu policy sau này mở, nhưng current flow nên ưu tiên user có session

## trigger (điểm kích hoạt)
- Web gọi `POST /api/community/posts/submit`.

## preconditions (điều kiện tiên quyết)
- Actor có session hợp lệ hoặc flow cho phép guest rõ ràng.
- Payload qua `communityPostSubmitSchema`.
- Request guard không chặn.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)
- `communityPostSubmitSchema`

## Read set
- identity session
- `communityPosts`
- request guard / anti-spam state

## write path (thứ tự ghi dữ liệu chuẩn)
1. Parse body theo schema (lược đồ dữ liệu).
2. Xác thực actor và request guard.
3. Ghi canonical record (bản ghi chuẩn gốc) vào `communityPosts`.
4. Khởi tạo summary fields đọc nhanh nếu collection dùng.
5. Append audit `community.post.submit`.
6. Enqueue notification nội bộ cho admin/super-admin nếu policy yêu cầu.

## async (bất đồng bộ) side-effects
- internal notification
- moderation attention signal nếu policy cần

## success result (kết quả thành công)
- Community post được tạo ở module owner.
- Public/community feed có thể hiển thị theo policy duyệt hiện tại.

## Errors
- `400`: body không hợp lệ.
- `401`: thiếu session khi flow yêu cầu login.
- `403`: actor bị block.
- `429`: anti-spam chặn.
- `500`: lỗi hệ thống.

## Audit
- log `community.post.submit`

## Idempotency / anti-spam
- request guard là lớp chống flood chính.
- không dùng notification job làm dấu hiệu canonical rằng bài đã được tạo.

## Performance target
- submit path chỉ ghi record và enqueue downstream work.

## Notes for AI/codegen
- `communityPosts` là canonical record (bản ghi chuẩn gốc); moderation và notification chỉ là downstream.


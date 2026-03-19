# Submit Community Post

## Purpose
- Cho thành viên gửi bài cộng đồng để hiển thị trên không gian thảo luận mà vẫn giữ anti-spam và moderation boundary rõ ràng.

## Owner module
- `community`

## Actors
- `member`
- có thể hỗ trợ `guest` nếu policy sau này mở, nhưng current flow nên ưu tiên user có session

## Trigger
- Web gọi `POST /api/community/posts/submit`.

## Preconditions
- Actor có session hợp lệ hoặc flow cho phép guest rõ ràng.
- Payload qua `communityPostSubmitSchema`.
- Request guard không chặn.

## Input contract
- `communityPostSubmitSchema`

## Read set
- identity session
- `communityPosts`
- request guard / anti-spam state

## Write path
1. Parse body theo schema.
2. Xác thực actor và request guard.
3. Ghi canonical record vào `communityPosts`.
4. Khởi tạo summary fields đọc nhanh nếu collection dùng.
5. Append audit `community.post.submit`.
6. Enqueue notification nội bộ cho admin/super-admin nếu policy yêu cầu.

## Async side-effects
- internal notification
- moderation attention signal nếu policy cần

## Success result
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
- `communityPosts` là canonical record; moderation và notification chỉ là downstream.

# Publish Post

## Purpose
- Xuất bản một bài viết editorial để web public có thể đọc, cache được invalidation đúng, và search được cập nhật theo luồng async.

## Owner module
- `content`

## Actors
- `admin`
- `super-admin`

## Trigger
- Admin chuyển `_status` của `posts` sang `published` trong CMS.

## Preconditions
- Actor có role biên tập hợp lệ.
- `posts` document tồn tại.
- Document có đủ field bắt buộc để publish.
- Các field public identity như `publicId` và `slug` có thể resolve hợp lệ.

## Input contract
- Payload collection write cho `posts`.
- Validation/business rules đi qua `preparePostData()` và `ensurePostCanPublish()` trong post service.

## Read set
- `posts`
- taxonomy relations nếu bài có category/tag
- media relation nếu có cover/gallery
- event relation nếu có `relatedEvent`

## Write path
1. Chuẩn hóa `slug`, `excerptComputed`, `contentPlainText`, `normalizedSearchText`.
2. Xác thực document đủ điều kiện publish.
3. Ghi canonical record vào `posts` với `_status = published`.
4. Thiết lập `publishedAt` nếu chưa có.
5. Append audit event cho `post.publish`.
6. Enqueue search sync job cho search module.
7. Gọi revalidation/invalidation downstream cho web cache.

## Async side-effects
- search sync
- revalidation webhook
- notification announcement nếu sau này flow bật

## Success result
- Document trở thành public content hợp lệ.
- Web route có thể map document sang public DTO.
- Search index sẽ được cập nhật theo eventual consistency.

## Errors
- `400`: thiếu field bắt buộc hoặc dữ liệu không hợp lệ để publish.
- `401`: actor chưa đăng nhập.
- `403`: actor không có quyền biên tập.
- `404`: document hoặc relation quan trọng không tồn tại.
- `409`: conflict ở slug/publicId hoặc state publish không hợp lệ.
- `500`: lỗi hook/service hoặc enqueue downstream work.

## Audit
- bắt buộc log `post.publish`
- tối thiểu gồm: actor, post id, publicId, slug, changedFields, correlationId

## Idempotency / anti-spam
- Publish lặp lại trên document đã publish không được tạo duplicate canonical record.
- Search sync downstream phải chấp nhận retry theo document hiện tại.

## Performance target
- Request publish không chờ search indexing xong.
- Response nên xong trong `< 800ms` cho nhánh canonical write + enqueue.

## Notes for AI/codegen
- `posts` mới là canonical owner; search index không phải nguồn dữ liệu gốc.
- `publishedAt` là timestamp public delivery chuẩn.
- Đừng nhét gửi push/email đồng bộ vào publish path.

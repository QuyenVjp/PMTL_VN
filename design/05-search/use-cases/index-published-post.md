# Index Published Post

## Purpose
- Đồng bộ một bài viết đã publish từ content owner sang search index theo queue-first flow.

## Owner module
- `search`

## Actors
- system hook
- worker

## Trigger
- Content publish/update enqueue search sync job.

## Preconditions
- Source post tồn tại.
- Post đang ở trạng thái `published`.
- Search source fields đã được chuẩn hóa ở content module.

## Input contract
- job payload chứa tối thiểu document identity cần resolve.

## Read set
- `posts`
- queue/job state
- search index status

## Write path
1. Worker nhận job search sync.
2. Resolve canonical source document từ `posts`.
3. Nếu document không còn publish, xóa hoặc bỏ document khỏi index.
4. Nếu document còn publish, build search projection từ source fields.
5. Upsert document vào Meilisearch index.
6. Log job/audit theo policy khi batch hoặc failure quan trọng xảy ra.

## Async side-effects
- chỉ có search engine write; đây đã là downstream flow

## Success result
- Search index phản ánh phiên bản public mới của post.

## Errors
- `404`: source document không còn tồn tại.
- `500`: engine lỗi hoặc worker xử lý lỗi.

## Audit
- bắt buộc log khi batch reindex hoặc sync failure đáng kể

## Idempotency / anti-spam
- Upsert nhiều lần cùng một document phải an toàn.
- Retry queue không được tạo duplicate canonical business data vì search không phải source of truth.

## Performance target
- Sau publish, index nên cập nhật trong `< 10 giây`.

## Notes for AI/codegen
- Search chỉ đọc source fields từ content owner.
- Không cập nhật ngược canonical post body từ search module.

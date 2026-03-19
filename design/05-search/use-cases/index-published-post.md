# Index Published Post

## Purpose
- Đồng bộ một bài viết đã publish từ content owner sang search index theo flow `canonical write → outbox → dispatcher → execution queue → worker`.

## owner module (module sở hữu)
- `search`

## Actors
- system hook
- worker (tiến trình xử lý nền)

## trigger (điểm kích hoạt)
- Content publish/update append search outbox event.

## preconditions (điều kiện tiên quyết)
- Source post tồn tại.
- Post đang ở trạng thái `published`.
- Search source fields đã được chuẩn hóa ở content module.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)
- outbox payload chứa tối thiểu document identity, event type, event version và idempotency key cần resolve.

## Read set
- `posts`
- queue (hàng đợi xử lý)/job state
- search index status

## write path (thứ tự ghi dữ liệu chuẩn)
1. Content owner ghi canonical record publish/update vào Postgres.
2. Trong cùng transaction, append outbox event cho search sync.
3. Dispatcher đọc outbox event chưa xử lý và phát search-sync execution job.
4. worker (tiến trình xử lý nền) nhận job search sync.
5. Resolve canonical source document từ `posts`.
6. Nếu document không còn publish, xóa hoặc bỏ document khỏi index.
7. Nếu document còn publish, build search projection từ source fields.
8. Upsert document vào Meilisearch index.
9. Mark outbox/job state và log theo policy khi batch hoặc failure quan trọng xảy ra.

## async (bất đồng bộ) side-effects
- chỉ có search engine write; đây đã là downstream flow

## success result (kết quả thành công)
- Search index phản ánh phiên bản public mới của post.

## Errors
- `404`: source document không còn tồn tại.
- `500`: engine lỗi hoặc worker (tiến trình xử lý nền) xử lý lỗi.

## Audit
- bắt buộc log khi batch reindex hoặc sync failure đáng kể

## Idempotency / anti-spam
- Upsert nhiều lần cùng một document phải an toàn.
- Retry queue (hàng đợi xử lý) không được tạo duplicate canonical business data vì search không phải source of truth (nguồn dữ liệu gốc đáng tin cậy nhất).
- Retry dispatcher hoặc replay outbox không được tạo duplicate side effect.

## Performance target
- Sau publish, index nên cập nhật trong `< 10 giây`.

## Notes for AI/codegen
- Search chỉ đọc source fields từ content owner.
- Không cập nhật ngược canonical post body từ search module.
- Nếu sau này bật `pgvector`, đó là pipeline bổ sung cho recommendation/related-content chứ không thay flow này.


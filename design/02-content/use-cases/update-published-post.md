# Update Published Post

## Purpose
- Cập nhật một bài viết đã public mà vẫn giữ đúng canonical data, cache invalidation, và search projection.

## owner module (module sở hữu)
- `content`

## Actors
- `admin`
- `super-admin`

## trigger (điểm kích hoạt)
- Admin lưu thay đổi cho một `posts` document đang ở trạng thái `published`.

## preconditions (điều kiện tiên quyết)
- Actor có quyền sửa bài.
- Document tồn tại và đang public.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)
- Backend owner write cho `posts`.
- service (lớp xử lý nghiệp vụ) chuẩn hóa lại plain text, excerpt và normalized search fields.

## Read set
- `posts`
- relation taxonomy/media/event liên quan

## write path (thứ tự ghi dữ liệu chuẩn)
1. Đọc document hiện tại.
2. Recompute derived source fields.
3. Ghi canonical update vào `posts`.
4. Append audit event `post.update.published`.
5. **Phase 1**: chạy search sync/revalidation theo đường sync hoặc best-effort có log + recovery path rõ, nhưng không được biến downstream failure thành mất canonical update nếu policy của route không yêu cầu fail-closed.
6. **Phase 2+**: append signal tương ứng qua `outbox_events` rồi để dispatcher/worker xử lý search sync và revalidation.

## async (bất đồng bộ) side-effects
- **Phase 1**: search sync update/remove và cache invalidation qua sync hoặc best-effort path.
- **Phase 2+**: search sync/revalidation quan trọng đi qua outbox/dispatcher path.

## success result (kết quả thành công)
- Bài public hiển thị phiên bản mới.
- Search result eventual consistency theo phiên bản mới.

## Errors
- `400`: dữ liệu biên soạn không hợp lệ.
- `401`: chưa đăng nhập.
- `403`: không có quyền.
- `404`: post không tồn tại.
- `500`: lỗi service, sync/revalidation phase 1, hoặc downstream/outbox phase 2+.

## Audit
- log `post.update.published`
- lưu `before`, `after`, `changedFields` cho các field public quan trọng

## Idempotency / anti-spam
- Lưu lại cùng payload nhiều lần chỉ cập nhật canonical document, không tạo record mới.

## Performance target
- Không block response vì search/revalidation nặng; phase 1 chỉ giữ minimal correctness path, phase 2+ mới giao dispatcher xử lý bền vững hơn.

## Notes for AI/codegen
- Document đã publish vẫn có write-path ở content owner.
- Derived fields phải cập nhật cùng canonical write để search module đọc nguồn đúng.
- `platform/cache` là owner của revalidation chain; content service chỉ phát canonical event + aggregate metadata cần invalidate.

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
- Payload collection write cho `posts`.
- service (lớp xử lý nghiệp vụ) chuẩn hóa lại plain text, excerpt và normalized search fields.

## Read set
- `posts`
- relation taxonomy/media/event liên quan

## write path (thứ tự ghi dữ liệu chuẩn)
1. Đọc document hiện tại.
2. Recompute derived source fields.
3. Ghi canonical update vào `posts`.
4. Append audit event `post.update.published`.
5. Enqueue search sync update.
6. trigger (điểm kích hoạt) revalidation cho route/tag liên quan.

## async (bất đồng bộ) side-effects
- search sync update hoặc remove nếu bài không còn public
- cache invalidation

## success result (kết quả thành công)
- Bài public hiển thị phiên bản mới.
- Search result eventual consistency theo phiên bản mới.

## Errors
- `400`: dữ liệu biên soạn không hợp lệ.
- `401`: chưa đăng nhập.
- `403`: không có quyền.
- `404`: post không tồn tại.
- `500`: lỗi service (lớp xử lý nghiệp vụ) hoặc downstream.

## Audit
- log `post.update.published`
- lưu `before`, `after`, `changedFields` cho các field public quan trọng

## Idempotency / anti-spam
- Lưu lại cùng payload nhiều lần chỉ cập nhật canonical document, không tạo record mới.

## Performance target
- Không block response vì search hoặc revalidation.

## Notes for AI/codegen
- Document đã publish vẫn có write-path ở content owner.
- Derived fields phải cập nhật cùng canonical write để search module đọc nguồn đúng.


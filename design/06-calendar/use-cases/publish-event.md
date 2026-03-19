# Publish Event

## Purpose
- Tạo hoặc cập nhật một sự kiện công khai để các module khác có thể tham chiếu, nhưng ownership vẫn nằm ở calendar.

## owner module (module sở hữu)
- `calendar`

## Actors
- `admin`
- `super-admin`

## trigger (điểm kích hoạt)
- Admin lưu event ở CMS và chuyển sang trạng thái public theo collection policy.

## preconditions (điều kiện tiên quyết)
- Actor có quyền phù hợp.
- Event data hợp lệ về ngày, tiêu đề, slug/publicId và location nếu bắt buộc.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)
- Payload write cho `events`.

## Read set
- `events`
- `lunarEvents` hoặc override refs nếu liên quan
- content refs chỉ để tham chiếu, không phải owner

## write path (thứ tự ghi dữ liệu chuẩn)
1. Validate event data.
2. Ghi canonical record (bản ghi chuẩn gốc) vào `events`.
3. Append audit `event.publish`.
4. Nếu event được content tham chiếu hoặc notification dùng, emit downstream signal phù hợp.

## async (bất đồng bộ) side-effects
- notification producer có thể enqueue job nếu flow nhắc sự kiện bật

## success result (kết quả thành công)
- Event public read route có thể trả DTO chính xác.

## Errors
- `400`: dữ liệu lịch không hợp lệ.
- `403`: không đủ quyền.
- `404`: relation target không tồn tại.
- `409`: conflict slug/publicId hoặc override.
- `500`: lỗi service (lớp xử lý nghiệp vụ).

## Audit
- log `event.publish`

## Idempotency / anti-spam
- Save lại event hiện có chỉ update canonical record (bản ghi chuẩn gốc).

## Performance target
- Route write không đợi notification dispatch.

## Notes for AI/codegen
- Calendar sở hữu event record; content chỉ giữ relation `relatedEvent`.


# Publish Event

## Purpose
- Tạo hoặc cập nhật một sự kiện công khai để các module khác có thể tham chiếu, nhưng ownership vẫn nằm ở calendar.

## Owner module
- `calendar`

## Actors
- `admin`
- `super-admin`

## Trigger
- Admin lưu event ở CMS và chuyển sang trạng thái public theo collection policy.

## Preconditions
- Actor có quyền phù hợp.
- Event data hợp lệ về ngày, tiêu đề, slug/publicId và location nếu bắt buộc.

## Input contract
- Payload write cho `events`.

## Read set
- `events`
- `lunarEvents` hoặc override refs nếu liên quan
- content refs chỉ để tham chiếu, không phải owner

## Write path
1. Validate event data.
2. Ghi canonical record vào `events`.
3. Append audit `event.publish`.
4. Nếu event được content tham chiếu hoặc notification dùng, emit downstream signal phù hợp.

## Async side-effects
- notification producer có thể enqueue job nếu flow nhắc sự kiện bật

## Success result
- Event public read route có thể trả DTO chính xác.

## Errors
- `400`: dữ liệu lịch không hợp lệ.
- `403`: không đủ quyền.
- `404`: relation target không tồn tại.
- `409`: conflict slug/publicId hoặc override.
- `500`: lỗi service.

## Audit
- log `event.publish`

## Idempotency / anti-spam
- Save lại event hiện có chỉ update canonical record.

## Performance target
- Route write không đợi notification dispatch.

## Notes for AI/codegen
- Calendar sở hữu event record; content chỉ giữ relation `relatedEvent`.

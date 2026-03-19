# Apply Lunar Override

## Purpose
- Ghi ngoại lệ lịch âm hoặc rule hiển thị đặc biệt mà không làm mất canonical event/lunar owner boundary.

## Owner module
- `calendar`

## Actors
- `admin`
- `super-admin`

## Trigger
- Admin tạo hoặc cập nhật `lunarEventOverrides`.

## Preconditions
- Override target tồn tại.
- Rule override hợp lệ và không conflict hiển nhiên.

## Input contract
- Payload write cho `lunarEventOverrides`.

## Read set
- `lunarEvents`
- `lunarEventOverrides`
- event refs nếu override áp vào event cụ thể

## Write path
1. Resolve target lunar event/rule hiện tại.
2. Validate override payload.
3. Ghi canonical override vào `lunarEventOverrides`.
4. Append audit `event.override.apply`.

## Async side-effects
- downstream notification chỉ nếu có producer đọc thay đổi lịch

## Success result
- Read model lịch âm giải được rule override mới.

## Errors
- `400`: rule override không hợp lệ.
- `404`: target không tồn tại.
- `409`: override conflict.
- `500`: lỗi service.

## Audit
- log `event.override.apply`

## Idempotency / anti-spam
- cùng target + cùng rule update thì chỉ sửa canonical override hiện có.

## Performance target
- write path đơn giản, không phụ thuộc search/notification.

## Notes for AI/codegen
- Override là canonical của module calendar, không đẩy logic này sang content hay engagement.

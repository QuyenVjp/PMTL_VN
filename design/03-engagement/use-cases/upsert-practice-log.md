# Upsert Practice Log

## Purpose
- Lưu lại trạng thái buổi công phu theo user, ngày thực hành và plan tham chiếu mà không làm bẩn content canonical data.

## Owner module
- `engagement`

## Actors
- `member`

## Trigger
- Web gọi `PUT /api/practice-log`.

## Preconditions
- User có auth token/session hợp lệ.
- `date` và payload body hợp lệ.
- `planSlug` hoặc plan target tham chiếu được resolve nếu có gửi lên.

## Input contract
- BFF route `/api/practice-log`
- CMS route `practice-logs/my`
- semantics upsert theo `user + practiceDate + plan`

## Read set
- auth session
- `practiceLogs`
- `chantPlans`
- `chantItems`

## Write path
1. Resolve user từ Payload auth session.
2. Validate target date và plan/item refs.
3. Tìm practice log hiện có theo khóa self-owned.
4. Nếu có thì update canonical record trong `practiceLogs`; nếu chưa có thì create mới.
5. Nếu buổi tu hoàn tất, đánh dấu completion fields phù hợp.
6. Append audit `practice-log.upsert`.

## Async side-effects
- mặc định không có downstream nặng
- có thể thêm analytics/notification về sau nhưng không thuộc canonical path hiện tại

## Success result
- User nhìn thấy đúng trạng thái buổi tu của chính mình.

## Errors
- `400`: thiếu `date` hoặc payload không hợp lệ.
- `401`: thiếu session.
- `404`: plan/item tham chiếu không tồn tại.
- `500`: lỗi proxy/CMS/service.

## Audit
- log `practice-log.upsert`

## Idempotency / anti-spam
- Upsert theo khóa self-owned để tránh duplicate record cùng ngày/plan.

## Performance target
- self-state update nên trong `< 500ms`.

## Notes for AI/codegen
- Practice log là canonical self-state trong engagement.
- Không ghi completion ngược vào `chantPlans` hoặc `chantItems`.

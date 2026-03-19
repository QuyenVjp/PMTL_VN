# Upsert Practice Log

## Purpose
- Lưu lại trạng thái buổi công phu theo user, ngày thực hành và plan tham chiếu mà không làm bẩn content canonical data.

## owner module (module sở hữu)
- `engagement`

## Actors
- `member`

## trigger (điểm kích hoạt)
- Web gọi `PUT /api/practice-log`.

## preconditions (điều kiện tiên quyết)
- User có auth token/session hợp lệ.
- `date` và payload body hợp lệ.
- `planSlug` hoặc plan target tham chiếu được resolve nếu có gửi lên.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)
- BFF route `/api/practice-log`
- CMS route `practice-logs/my`
- semantics upsert theo `user + practiceDate + plan`

## Read set
- auth session
- `practiceLogs`
- `chantPlans`
- `chantItems`

## write path (thứ tự ghi dữ liệu chuẩn)
1. Resolve user từ Payload auth session.
2. Validate target date và plan/item refs.
3. Tìm practice log hiện có theo khóa self-owned.
4. Nếu có thì update canonical record (bản ghi chuẩn gốc) trong `practiceLogs`; nếu chưa có thì create mới.
5. Nếu buổi tu hoàn tất, đánh dấu completion fields phù hợp.
6. Append audit `practice-log.upsert`.

## async (bất đồng bộ) side-effects
- mặc định không có downstream nặng
- có thể thêm analytics/notification về sau nhưng không thuộc canonical path hiện tại

## success result (kết quả thành công)
- User nhìn thấy đúng trạng thái buổi tu của chính mình.

## Errors
- `400`: thiếu `date` hoặc payload không hợp lệ.
- `401`: thiếu session.
- `404`: plan/item tham chiếu không tồn tại.
- `500`: lỗi proxy/CMS/service (lớp xử lý nghiệp vụ).

## Audit
- log `practice-log.upsert`

## Idempotency / anti-spam
- Upsert theo khóa self-owned để tránh duplicate record cùng ngày/plan.

## Performance target
- self-state update nên trong `< 500ms`.

## Notes for AI/codegen
- Practice log là canonical self-state trong engagement.
- Không ghi completion ngược vào `chantPlans` hoặc `chantItems`.


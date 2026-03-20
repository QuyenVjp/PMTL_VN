# Upsert Practice Log (Ghi đè / Tạo nhật ký công phu)

## Purpose (Mục đích)

- lưu trạng thái buổi công phu theo user, ngày thực hành, và plan tham chiếu
- không làm bẩn content canonical data

## owner module (module sở hữu)

- `engagement`

## Actors (Tác nhân)

- `member`

## trigger (điểm kích hoạt)

- web calls `PUT /api/practice-log`

## preconditions (điều kiện tiên quyết)

- user có auth token/session hợp lệ
- `date` và body hợp lệ
- `planSlug` hoặc plan target tham chiếu resolve được nếu có gửi lên

## Input contract (Hợp đồng đầu vào)

- BFF route `/api/practice-log`
- API route `practice-logs/my`
- semantics upsert theo `user + practiceDate + plan`

## Read set (Tập dữ liệu đọc)

- `sessions`
- `practiceLogs`
- `chantPlans`
- `chantItems`

## write path (thứ tự ghi dữ liệu chuẩn)

1. Resolve user từ NestJS auth session.
2. Validate target date và plan/item references.
3. Tìm `practiceLogs` hiện có theo khóa self-owned.
4. Nếu có thì update canonical record; nếu chưa có thì create mới.
5. Nếu buổi tu hoàn tất, cập nhật completion fields phù hợp.
6. Append audit `practice-log.upsert`.

## async (bất đồng bộ) side-effects

- mặc định không có downstream nặng
- analytics/notification về sau không thuộc canonical path hiện tại

## success result (kết quả thành công)

- user nhìn thấy đúng trạng thái buổi tu của chính mình

## Errors (Lỗi dự kiến)

- `400`: thiếu `date` hoặc payload không hợp lệ
- `401`: thiếu session
- `404`: plan/item reference không tồn tại
- `500`: proxy/API/service lỗi

## Audit (Kiểm toán)

- action: `practice-log.upsert`

## Idempotency / anti-spam (Tính không đổi / chống thư rác)

- upsert theo khóa self-owned để tránh duplicate record cùng ngày/plan

## Performance target (Mục tiêu hiệu năng)

- self-state update nên trong `< 500ms`

## Notes for AI/codegen (Ghi chú cho AI và sinh mã)

- `practiceLogs` là canonical self-state trong Engagement
- không được ghi completion ngược vào `chantPlans` hoặc `chantItems`

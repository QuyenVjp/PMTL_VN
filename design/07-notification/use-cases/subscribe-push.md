# Subscribe Push

## Purpose
- Lưu thông tin đăng ký push của thiết bị/người dùng để các notification job sau này có thể target đúng.

## owner module (module sở hữu)
- `notification`

## Actors
- `member`
- `guest` nếu policy cho phép subscription không cần login

## trigger (điểm kích hoạt)
- Web gọi `POST /api/push/subscribe`.

## preconditions (điều kiện tiên quyết)
- Browser subscription payload có `endpoint`, `p256dh`, `auth`.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)
- body subscription của route push subscribe

## Read set
- auth session nếu có
- `pushSubscriptions`

## write path (thứ tự ghi dữ liệu chuẩn)
1. Validate payload subscription.
2. Resolve user target nếu request có session hoặc token hợp lệ.
3. Upsert canonical record (bản ghi chuẩn gốc) trong `pushSubscriptions`.
4. Đặt `isActive = true`, timezone, và notification preferences.
5. Append audit `push.subscription.create`.

## async (bất đồng bộ) side-effects
- không có bắt buộc

## success result (kết quả thành công)
- Thiết bị được lưu như một subscription active hợp lệ.

## Errors
- `400`: payload subscription không hợp lệ.
- `401`: flow yêu cầu auth nhưng không có session.
- `409`: state conflict không merge được.
- `500`: lỗi service (lớp xử lý nghiệp vụ)/proxy.

## Audit
- log `push.subscription.create` hoặc `push.subscription.update`

## Idempotency / anti-spam
- Upsert theo `endpoint` để tránh duplicate subscription.

## Performance target
- subscribe path `< 500ms`.

## Notes for AI/codegen
- `pushSubscriptions` là canonical subscription state.
- Đừng tạo `pushJobs` trong flow subscribe.


# Subscribe Push

## Purpose
- Lưu thông tin đăng ký push của thiết bị/người dùng để các notification job sau này có thể target đúng.

## Owner module
- `notification`

## Actors
- `member`
- `guest` nếu policy cho phép subscription không cần login

## Trigger
- Web gọi `POST /api/push/subscribe`.

## Preconditions
- Browser subscription payload có `endpoint`, `p256dh`, `auth`.

## Input contract
- body subscription của route push subscribe

## Read set
- auth session nếu có
- `pushSubscriptions`

## Write path
1. Validate payload subscription.
2. Resolve user target nếu request có session hoặc token hợp lệ.
3. Upsert canonical record trong `pushSubscriptions`.
4. Đặt `isActive = true`, timezone, và notification preferences.
5. Append audit `push.subscription.create`.

## Async side-effects
- không có bắt buộc

## Success result
- Thiết bị được lưu như một subscription active hợp lệ.

## Errors
- `400`: payload subscription không hợp lệ.
- `401`: flow yêu cầu auth nhưng không có session.
- `409`: state conflict không merge được.
- `500`: lỗi service/proxy.

## Audit
- log `push.subscription.create` hoặc `push.subscription.update`

## Idempotency / anti-spam
- Upsert theo `endpoint` để tránh duplicate subscription.

## Performance target
- subscribe path `< 500ms`.

## Notes for AI/codegen
- `pushSubscriptions` là canonical subscription state.
- Đừng tạo `pushJobs` trong flow subscribe.

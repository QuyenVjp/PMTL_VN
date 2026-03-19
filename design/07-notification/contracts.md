# Notification Contracts

## Owner data

- `pushSubscriptions`
- `pushJobs`

## Routes chính

- `POST /api/push/subscribe`
- `POST /api/push/unsubscribe`
- `GET /api/push/stats`
- `GET /api/push/status`
- `POST /api/push/send`
- `POST /api/push/process`

## Canonical rules

- subscription canonical record nằm ở `pushSubscriptions`
- dispatch control-plane canonical record nằm ở `pushJobs`
- gửi push/email thật là async worker concern

## Permission baseline

- `member`
  - subscribe / unsubscribe device của chính mình
- `admin`
  - được quản trị manual send/process/stats theo policy
- `super-admin`
  - giữ quyền override vận hành khi cần

## Input expectations

Subscribe payload phải có:
- `endpoint`
- `keys.p256dh`
- `keys.auth`
- `timezone`
- `notificationPrefs`

## Error expectations

- `400`
  - payload subscription không hợp lệ
- `401`
  - route yêu cầu auth mà thiếu session/token
- `403`
  - role không đủ cho manual send/process
- `404`
  - job/subscription không tồn tại
- `409`
  - duplicate subscription hoặc state conflict
- `500`
  - create job hoặc worker dispatch fail

## Notes for AI/codegen

- `pushJobs` không phải inbox canonical của người dùng.
- Notification là async-only; request path nên tạo/sửa job rồi trả sớm.
- Self-send prevention nên xử lý ở job payload/rule, không hack ở UI.

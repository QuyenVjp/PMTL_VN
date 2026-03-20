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

- subscription canonical record (bản ghi chuẩn gốc) nằm ở `pushSubscriptions`
- dispatch control-plane (lớp điều phối hệ thống) canonical record (bản ghi chuẩn gốc) nằm ở `pushJobs`
- **Phase 2+**: gửi push/email thật là async worker concern — cần `notification.push.enabled` feature flag bật
- **Phase 1**: subscription và job records được ghi nhận nhưng delivery chưa tự động thực thi

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
  - create job hoặc worker (tiến trình xử lý nền) dispatch fail

## Notes for AI/codegen

- `pushJobs` không phải inbox canonical của người dùng.
- Notification là async-only (chỉ chạy ngầm, bất đồng bộ); request path nên tạo hoặc sửa job rồi trả sớm.
- Self-send prevention nên xử lý ở job payload/rule, không hack ở UI.

- `timezone`: Local device offset for quiet-hours calculation.
- `notificationPrefs`: Granular category opt-ins.

---

## Expected Errors (Kỳ vọng về Lỗi)

- `400`: Malformed subscription data or missing keys.
- `401`: Unauthorized (Missing session or invalid token).
- `403`: Forbidden (Insufficient role for broadcast operations).
- `404`: Subscription or Job record not found.
- `409`: Conflict (Duplicate subscription or invalid job state transition).
- `500`: Dispatcher failure or background worker crash.

---

## Notes for AI/codegen (Ghi chú cho AI & Sinh mã)

- **Control Plane Status**: Status fields in `pushJobs` track the delivery process, not the "Read/Unread" status of a message.
- **Strict Async**: Always return a success response immediately after a job is queued; do not wait for the worker to finish the delivery.
- **Self-Filtering**: Logic to exclude the event initiator (e.g., the user who wrote a comment) must be handled at the Job level in the backend.

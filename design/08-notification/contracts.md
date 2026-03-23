# Notification Contracts

## Owner data

- `pushSubscriptions`
- `pushJobs`

## Routes chính

- `GET /api/notifications/preferences`
- `PATCH /api/notifications/preferences`
- `GET /api/notifications/reminders/practice`
- `PATCH /api/notifications/reminders/practice`
- `GET /api/notifications/reminders/events`
- `PATCH /api/notifications/reminders/events`
- `POST /api/notifications/push/subscribe`
- `POST /api/notifications/push/unsubscribe`
- `GET /api/notifications/push/stats`

## Admin management routes

- `GET /api/admin/notifications/push/jobs`
- `GET /api/admin/notifications/push/jobs/:publicId`
- `POST /api/admin/notifications/push/jobs`
- `POST /api/admin/notifications/push/jobs/:publicId/process`
- `POST /api/admin/notifications/push/jobs/:publicId/redrive`
- `GET /api/admin/notifications/push/status`
- `GET /api/admin/notifications/push/subscription-stats`

## Canonical rules

- subscription canonical record (bản ghi chuẩn gốc) nằm ở `pushSubscriptions`
- dispatch control-plane (lớp điều phối hệ thống) canonical record (bản ghi chuẩn gốc) nằm ở `pushJobs`
- **Phase 2+**: gửi push/email thật là async worker concern — cần `notification.push.enabled` feature flag bật
- **Phase 1**: subscription và job records được ghi nhận nhưng delivery chưa tự động thực thi
- `/thong-bao` là member preferences + capability surface, **không** là inbox canonical
- member-facing delivery scope hiện gồm:
  - practice reminders
  - event reminders
  - community/admin informational push khi được opt-in
- nếu sau này có inbox/message-center, đó phải là owner surface khác, không reuse `pushJobs`

## Member preference projection contract

`GET /api/notifications/preferences` phải trả được aggregate đủ cho page `/thong-bao`, không chỉ raw category rows.
Không có `POST create preferences` riêng cho member.
Nếu user chưa có row persisted:

- `GET /api/notifications/preferences` trả default-projected state
- `PATCH /api/notifications/preferences` hoặc reminder patch đầu tiên được phép materialize canonical record theo kiểu upsert

`NotificationPreferencesPageDto` tối thiểu phải gồm:

- `capability`
  - `pushSupported`
  - `permissionState`
  - `serviceWorkerReady`
  - `deliveryHealth`
- `subscriptionState`
  - `isSubscribed`
  - `subscriptionPublicId?`
  - `subscribedAt?`
  - `lastConfirmedAt?`
- `categoryPreferences[]`
  - `categoryKey`
  - `label`
  - `enabled`
  - `channel`
  - `lockedReason?`
- `practiceReminder`
  - `enabled`
  - `scheduleSummary`
  - `timezone`
  - `degradedReason?`
- `eventReminder`
  - `enabled`
  - `scheduleSummary`
  - `timezone`
  - `degradedReason?`
- `conflicts[]`
- `lastEvaluatedAt`

`conflicts[]` chỉ được trả projected conflict codes:

- `push_flag_disabled`
- `worker_inactive`
- `permission_denied`
- `subscription_missing`
- `delivery_degraded`

Không trả raw worker error, endpoint URL, auth key, hoặc per-job delivery history trong page aggregate.

## Permission baseline

- `member`
  - subscribe / unsubscribe device của chính mình
- `admin`
  - được quản trị manual send/process/stats theo policy
  - được xem delivery status, job history, redrive controls qua admin workspace
- `super-admin`
  - giữ quyền override vận hành khi cần

## Input expectations

Subscribe payload phải có:

- `endpoint`
- `keys.p256dh`
- `keys.auth`
- `timezone`
- `notificationPrefs`

Patch payload cho preferences/reminders không được cho client tự gửi raw subscription state.
Subscription truth vẫn do browser capability + backend subscription record compose ra.

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

## Admin management expectations

- admin page `/admin/he-thong/thong-bao` phải nhìn được:
  - queue health
  - pending / processing / failed job counts
  - recent jobs
  - subscription aggregate stats
  - error summary ngắn
  - redrive action có audit
- admin page này là push-ops surface, không dùng member route `/notifications/preferences` hay `/notifications/reminders/practice`
- segmentation hay quiet-hours override nếu có phải là explicit admin action, không để UI tự sửa payload raw ngoài rule

## Notes for AI/codegen

- `pushJobs` không phải inbox canonical của người dùng.
- Notification là async-only (chỉ chạy ngầm, bất đồng bộ); request path nên tạo hoặc sửa job rồi trả sớm.
- Self-send prevention nên xử lý ở job payload/rule, không hack ở UI.
- `admin push jobs` là control-plane management surface, không phải inbox message center của người dùng.
- `/thong-bao` không được render lịch sử `pushJobs`; chỉ render:
  - capability
  - subscription state
  - per-category preferences
  - reminder settings

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

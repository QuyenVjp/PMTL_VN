# Notification Module Decisions

> Ghi chú cho sinh viên:
> `pushJobs` nhìn giống bảng notification, nhưng thực ra nó là bảng điều phối gửi, không phải hộp thư người dùng.

## Decision 1. Notification là async-only (chỉ chạy ngầm, bất đồng bộ) trong current scope

### Context
Push dispatch và email notification đều có queue (hàng đợi xử lý)/worker (tiến trình xử lý nền) path.

### Decision
- Notification delivery không chạy đồng bộ trong request path.
- Request path chỉ append outbox event hoặc tạo job điều phối.

### Rationale
- Giảm latency.
- Hợp với stack outbox + execution queue + worker đã chốt.

### Trade-off
- Delivery có eventual consistency.

## Decision 2. pushJobs là control-plane (lớp điều phối hệ thống) record, không phải inbox source-of-truth

### Context
Repo đã có `pushJobs` với status, cursor, sentCount, failedCount.

### Decision
- `pushJobs` dùng để điều phối và quan sát push dispatch.
- Không coi `pushJobs` là notification inbox data model cho người dùng.

### Rationale
- Phản ánh đúng implementation hiện tại.
- Tránh AI generate inbox feature nhầm từ control-plane (lớp điều phối hệ thống) table.

### Trade-off
- Nếu sau này cần in-app inbox, phải có module/schema (lược đồ dữ liệu) riêng.

## Decision 3. Subscription preferences nằm trên pushSubscriptions

### Context
Repo hiện lưu category prefs và quiet hours ngay trên `pushSubscriptions`.

### Decision
- Giữ browser subscription state + preference state trên `pushSubscriptions`.
- Chưa tách bảng `notificationPreferences` riêng ở current scope.

### Rationale
- Đơn giản và khớp schema (lược đồ dữ liệu) hiện tại.
- Đủ cho use case push hiện tại.

### Trade-off
- Nếu preference mở rộng nhiều channel hoặc nhiều policy, sau này có thể cần tách model.

## Decision 4. Role-targeting và include/exclude user ids là contract (hợp đồng dữ liệu/nghiệp vụ) dispatch chính

### Context
Notification hiện tạo internal push jobs với recipient roles và include/exclude user ids.

### Decision
- Delivery targeting hiện dùng:
  - `recipientRoles`
  - `includeUserIds`
  - `excludeUserIds`
- Self-send prevention nằm ở tầng job payload.

### Rationale
- Phù hợp với notify admin/super-admin và notify affected user flows.
- Đủ rõ mà chưa cần orchestration engine phức tạp.

### Trade-off
- Policy targeting còn giới hạn.
- Muốn segment phức tạp hơn sẽ cần decision mới.

## Decision 5. Email notification là async (bất đồng bộ) side path, chưa có canonical history table

### Context
Repo hiện enqueue email notification jobs nhưng chưa có email history collection current scope.

### Decision
- Email notification là downstream side effect.
- Current design không tạo thêm bảng email history riêng nếu repo chưa có owner rõ.

### Rationale
- Tránh over-engineer.
- Giữ focus vào control-plane (lớp điều phối hệ thống) hiện có.

### Trade-off
- Audit email delivery sâu hơn sẽ cần log/job sink hoặc model riêng trong tương lai.

## Decision 6. Delivery request quan trọng phải đi qua outbox trước khi dispatch

### Context
Notify user/admin, push fan-out, email delivery request và webhook/revalidation đều là downstream side effect dễ rơi nếu request path chỉ fire-and-forget.

### Decision
- Notification module nhận business event quan trọng qua `outbox_events`.
- Dispatcher mới phát push/email/webhook execution jobs.
- Consumer phải idempotent theo event key hoặc dispatch key.

### Rationale
- Tăng độ chắc cho delivery request.
- Dễ replay và điều tra hơn khi downstream lỗi.

### Trade-off
- Tăng độ phức tạp vận hành cho outbox/dispatcher/replay.


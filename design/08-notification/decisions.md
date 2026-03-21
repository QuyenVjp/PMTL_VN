# Notification Module Decisions

> Ghi chú cho sinh viên:
> `pushJobs` nhìn giống bảng notification, nhưng thực ra nó là bảng điều phối gửi, không phải hộp thư người dùng.

## Decision 1. Notification delivery là async-first; Phase 1 có thể chỉ ghi record điều phối

### Context

Push dispatch và email notification đều có queue (hàng đợi xử lý)/worker (tiến trình xử lý nền) path ở phase đầy đủ.

### Decision

- Notification delivery không chạy đồng bộ trong request path.
- Phase 1 có thể mới dừng ở mức ghi subscription / push job / delivery request record mà chưa bật auto-dispatch đầy đủ.
- Khi Phase 2+ delivery active, request path chỉ append outbox event cho delivery request quan trọng; dispatcher mới tạo execution job điều phối.
- readiness cho delivery activation phải đi qua feature-flag / phase gate rõ, không suy ngầm từ việc đã có control-plane records.

### Rationale

- Giảm latency.
- Hợp với stack outbox + execution queue + worker khi feature đã được activate.

### Trade-off

- Delivery có eventual consistency khi dispatch active.
- Phase 1 có thể có control-plane records mà chưa có full async delivery execution.

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

Repo hiện có email notification execution path nhưng chưa có email history collection current scope.

### Decision

- Email notification là downstream side effect.
- Current design không tạo thêm bảng email history riêng nếu repo chưa có owner rõ.
- Idempotency của email dispatch phải dựa trên event key / dispatch key ở outbox + job payload, không dựa vào email history table.

### Rationale

- Tránh over-engineer.
- Giữ focus vào control-plane (lớp điều phối hệ thống) hiện có.

### Trade-off

- Audit email delivery sâu hơn sẽ cần log/job sink hoặc model riêng trong tương lai.
- Nếu duplicate email trở thành risk thực tế, phải thêm owner model hoặc sink reviewed rõ ràng, không vá tạm ở consumer.

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

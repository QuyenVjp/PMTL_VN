# Notification Module (Mô-đun Thông báo)

> Ghi chú cho sinh viên:
> Notification là async-only module (mô-đun chỉ chạy bất đồng bộ). Request path thông thường không tự gửi push/email trực tiếp nếu side-effect đó cần reliability (độ tin cậy) cao.

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Notification Module (Mô-đun Thông báo)

## Objectives (Mục tiêu)
- mô tả control-plane notification hiện có
- giữ notification đúng vai trò async-only
- tránh biến mô-đun này thành orchestration platform quá nặng

## Current scope (Phạm vi hiện tại)

### Subscription state (Trạng thái đăng ký)
- `pushSubscriptions`

### Job control plane (Lớp điều phối công việc)
- `pushJobs`
- `outbox_events` cho delivery request quan trọng

### Async delivery paths (Đường gửi bất đồng bộ)
- dispatcher phát push/email/webhook job từ outbox
- worker xử lý push dispatch
- email notification jobs đi qua queue/worker khi phase đó được bật

## Current responsibilities (Trách nhiệm hiện tại)

### Subscription management (Quản lý đăng ký)
- subscribe
- unsubscribe
- mark active/inactive
- lưu quiet hours
- lưu category preferences cho push

### Internal notification fan-out (Phát tán thông báo nội bộ)
- notify admin/super-admin
- notify affected user
- tạo push job record ở lớp dispatcher/execution

### Delivery tracking (Theo dõi quá trình gửi)
- `status`
- `cursor`
- `sentCount`
- `failedCount`
- `errorSummary`

## External references (Tham chiếu ngoài mô-đun)

### Identity
- user target
- recipient role resolution
- email address resolution

### Content / Community / Moderation / Calendar
- context cho message, URL, metadata
- owner data vẫn nằm ở mô-đun gốc

## Current rules (Quy tắc hiện tại)
- notification gửi bất đồng bộ
- `pushJobs` là control-plane record, không phải inbox canonical
- self-send prevention có thể dùng include/exclude user ids
- delivery request quan trọng không phát thẳng từ request path nếu cần reliability cao
- recovery path chuẩn là replay outbox hoặc redrive execution job từ control-plane state

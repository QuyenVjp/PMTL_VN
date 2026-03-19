# Notification Module

> Ghi chú cho sinh viên:
> Notification ở repo này là async-only (chỉ chạy ngầm, bất đồng bộ).
> Tức là request thường chỉ append outbox event cho delivery request quan trọng, còn dispatcher/worker (tiến trình xử lý nền) sẽ tạo và xử lý execution job phía sau.

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Notification Module

## Mục tiêu
- mô tả control-plane (lớp điều phối hệ thống) notification hiện có
- giữ notification là async-only (chỉ chạy ngầm, bất đồng bộ)
- tránh biến module này thành orchestration platform

## Current scope

### Subscription state
- `pushSubscriptions`

### Job control plane
- `pushJobs`
- `outbox_events` cho delivery request quan trọng

### async (bất đồng bộ) delivery paths
- dispatcher phát push/email/webhook jobs từ outbox
- push dispatch qua worker (tiến trình xử lý nền)
- email notification jobs qua worker (tiến trình xử lý nền)/queue (hàng đợi xử lý)

## Current responsibilities

### Subscription management
- subscribe
- unsubscribe
- mark active/inactive
- lưu quiet hours
- lưu category preferences cho push

### Internal notification fan-out
- notify admin/super-admin
- notify affected user
- create push job record ở lớp dispatcher/execution

### Delivery tracking
- `status`
- `cursor`
- `sentCount`
- `failedCount`
- `errorSummary`

## References ra ngoài module

### Identity
- user target
- recipient role resolution
- email address resolution

### Content / Community / Moderation / Calendar
- context cho message, URL, metadata
- owner data vẫn nằm ở module gốc

## Current rules
- notification gửi bất đồng bộ
- pushJobs là control-plane (lớp điều phối hệ thống) record, không phải inbox canonical
- self-send prevention có thể dùng include/exclude user ids
- delivery request quan trọng không phát thẳng từ request path nếu cần reliability cao
- recovery path chuẩn là replay outbox hoặc redrive execution jobs từ control-plane state


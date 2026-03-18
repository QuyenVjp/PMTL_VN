# Notification Module

> Ghi chú cho sinh viên:
> Notification ở repo này là async-only.
> Tức là request thường chỉ tạo job, còn gửi thật sẽ do worker làm sau.

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Notification Module

## Mục tiêu
- mô tả control-plane notification hiện có
- giữ notification là async-only
- tránh biến module này thành orchestration platform

## Current scope

### Subscription state
- `pushSubscriptions`

### Job control plane
- `pushJobs`

### Async delivery paths
- push dispatch qua worker
- email notification jobs qua worker/queue

## Current responsibilities

### Subscription management
- subscribe
- unsubscribe
- mark active/inactive
- lưu quiet hours
- lưu category preferences cho push

### Internal notification fan-out
- notify moderator/admin
- notify affected user
- create push job record

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
- pushJobs là control-plane record, không phải inbox canonical
- self-send prevention có thể dùng include/exclude user ids

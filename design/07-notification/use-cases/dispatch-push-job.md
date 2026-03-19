# Dispatch Push Job

## Purpose
- Fan-out một notification đã được tạo tới các subscription phù hợp qua worker/process flow.

## Owner module
- `notification`

## Actors
- system worker
- admin/manual trigger nếu có route nội bộ

## Trigger
- Có `pushJobs` record ở trạng thái chờ xử lý hoặc route process nội bộ được gọi.

## Preconditions
- Push job tồn tại.
- Targeting context resolve được.
- Subscription active có sẵn.

## Input contract
- `pushJobs` control-plane record + delivery payload

## Read set
- `pushJobs`
- `pushSubscriptions`
- identity resolver khi cần target role/user

## Write path
1. Resolve job record.
2. Load recipient subscriptions hợp lệ.
3. Dispatch theo chunk qua worker.
4. Update control-plane fields trên `pushJobs`:
   - `status`
   - `cursor`
   - `sentCount`
   - `failedCount`
   - `errorSummary`
5. Ghi audit/log cho `push.job.complete` hoặc `push.job.fail` khi phù hợp.

## Async side-effects
- chính flow này là async downstream processing

## Success result
- Job hoàn tất hoặc thất bại có trạng thái rõ ràng trong control-plane.

## Errors
- `404`: job không tồn tại.
- `500`: dispatch engine hoặc worker lỗi.

## Audit
- log `push.job.create`, `push.job.complete`, `push.job.fail` cho các mốc chính

## Idempotency / anti-spam
- Job processing phải chịu được retry chunk.
- Self-send prevention và recipient filtering xử lý ở rule/job payload.

## Performance target
- Tạo job riêng `< 500ms`; dispatch có thể bắt đầu trong `< 30 giây`.

## Notes for AI/codegen
- `pushJobs` là control-plane record, không phải inbox canonical của user.
- Đừng block request gốc để chờ dispatch từng recipient.

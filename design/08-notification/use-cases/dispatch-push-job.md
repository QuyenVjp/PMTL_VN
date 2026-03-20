# Dispatch Push Job

## Purpose

- Fan-out một notification đã được tạo tới các subscription phù hợp qua worker/process flow.
  - **Phase 2+**: dùng outbox → dispatcher → worker pipeline.
  - **Phase 1**: notification delivery chưa thực thi tự động — admin có thể manual trigger qua route `/api/push/process` nếu cần.

## owner module (module sở hữu)

- `notification`

## Actors

- system worker (tiến trình xử lý nền)
- admin/manual trigger (điểm kích hoạt) nếu có route nội bộ

## trigger (điểm kích hoạt)

- Có `pushJobs` record ở trạng thái chờ xử lý hoặc route process nội bộ được gọi.

## preconditions (điều kiện tiên quyết)

- Push job tồn tại.
- Targeting context resolve được.
- Subscription active có sẵn.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)

- `pushJobs` control-plane (lớp điều phối hệ thống) record + delivery payload

## Read set

- `pushJobs`
- `pushSubscriptions`
- identity resolver khi cần target role/user

## write path (thứ tự ghi dữ liệu chuẩn)

1. Resolve job record.
2. Load recipient subscriptions hợp lệ.
3. Dispatch theo chunk qua worker (tiến trình xử lý nền).
4. Update control-plane (lớp điều phối hệ thống) fields trên `pushJobs`:
   - `status`
   - `cursor`
   - `sentCount`
   - `failedCount`
   - `errorSummary`
5. Ghi audit/log cho `push.job.complete` hoặc `push.job.fail` khi phù hợp.

## async (bất đồng bộ) side-effects

- chính flow này là async (bất đồng bộ) downstream processing

## success result (kết quả thành công)

- Job hoàn tất hoặc thất bại có trạng thái rõ ràng trong control-plane (lớp điều phối hệ thống).

## Errors

- `404`: job không tồn tại.
- `500`: dispatch engine hoặc worker (tiến trình xử lý nền) lỗi.

## Audit

- log `push.job.create`, `push.job.complete`, `push.job.fail` cho các mốc chính

## Idempotency / anti-spam

- Job processing phải chịu được retry chunk.
- Self-send prevention và recipient filtering xử lý ở rule/job payload.

## Performance target

- Tạo job riêng `< 500ms`; dispatch có thể bắt đầu trong `< 30 giây`.

## Notes for AI/codegen

- `pushJobs` là control-plane (lớp điều phối hệ thống) record, không phải inbox canonical của user.
- Đừng block request gốc để chờ dispatch từng recipient.

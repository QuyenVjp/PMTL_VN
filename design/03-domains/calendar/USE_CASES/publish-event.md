# Publish Event

## Purpose

- Tạo hoặc cập nhật một sự kiện công khai để các module khác có thể tham chiếu, nhưng ownership vẫn nằm ở calendar.

## owner module (module sở hữu)

- `calendar`

## Actors

- `admin`
- `super-admin`

## trigger (điểm kích hoạt)

- Admin lưu event qua API và chuyển sang trạng thái public theo policy hiện tại.

## preconditions (điều kiện tiên quyết)

- Actor có quyền phù hợp.
- Event data hợp lệ về ngày, tiêu đề, slug/publicId và location nếu bắt buộc.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)

- Backend owner write cho `events`.
- Phase 1 không yêu cầu outbox payload cho event publish.
- nếu phase 2+ bật downstream signal qua outbox thì payload phải có `eventType`, `eventVersion`, và `idempotencyKey`

## Read set

- `events`
- `lunarEvents` hoặc override refs nếu liên quan
- content refs chỉ để tham chiếu, không phải owner

## write path (thứ tự ghi dữ liệu chuẩn)

1. Validate event data.
2. Ghi canonical record (bản ghi chuẩn gốc) vào `events`.
3. Append audit `event.publish`.
4. **Phase 1**: nếu content/read-model cần refresh, chạy sync hoặc best-effort signal có log + recovery path rõ.
5. **Phase 2+**: nếu notification hoặc projection reliability đã bật, append downstream outbox event phù hợp.

## async (bất đồng bộ) side-effects

- **Phase 1**: refresh signal cho read model có thể chạy sync/manual trigger.
- **Phase 2+**: notification producer hoặc calendar refresh pipeline nhận outbox signal rồi dispatch execution job.

## success result (kết quả thành công)

- Event public read route có thể trả DTO chính xác.

## Errors

- `400`: dữ liệu lịch không hợp lệ.
- `403`: không đủ quyền.
- `404`: relation target không tồn tại.
- `409`: conflict slug/publicId hoặc override.
- `500`: lỗi service (lớp xử lý nghiệp vụ).

## Audit

- log `event.publish`

## Idempotency / anti-spam

- Save lại event hiện có chỉ update canonical record (bản ghi chuẩn gốc).

## Performance target

- Route write không đợi notification dispatch.

## Notes for AI/codegen

- Calendar sở hữu event record; content chỉ giữ relation `relatedEvent`.
- Nếu signal downstream bị rơi:
  - **Phase 1**: recompute window hoặc manual refresh.
  - **Phase 2+**: replay outbox hoặc recompute window.

# Schedule Practice Reminder

## Purpose

- Tạo reminder cho bài tập hằng ngày, phát nguyện hoặc phóng sanh dựa trên lịch tu học cá nhân.

## owner module (module sở hữu)

- `notification`

## Actors

- system
- `member` khi cấu hình reminder

## trigger (điểm kích hoạt)

- User bật reminder hoặc hệ thống recompute lịch nhắc từ calendar/vow context.

## preconditions (điều kiện tiên quyết)

- Có reminder preferences hợp lệ.
- Có target context từ calendar, engagement hoặc vows-merit.
- Boundary schema cho preference payload, target scope, quiet hours, và downstream reminder event đã được chốt.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)

- reminder preference payload phải có schema runtime rõ.
- nếu reminder được tạo từ downstream signal, outbox payload phải có event type, event version và idempotency key.

## Read set

- `pushSubscriptions`
- calendar reminder candidates
- engagement preference summary
- vow/life-release reminder candidates

## write path (thứ tự ghi dữ liệu chuẩn)

1. Resolve target user và reminder preference scope.
2. Validate reminder payload hoặc downstream signal payload.
3. Tạo hoặc cập nhật canonical control-plane state trên `pushJobs` hoặc reminder scheduling record tương ứng.
4. **Phase 2+** (khi `outbox.enabled` bật): Nếu cần delivery request quan trọng cho lần gửi tiếp theo, append `outbox_events` sau khi control-plane state đã ổn định.
5. **Phase 2+**: Dispatcher phát execution job cho push/email reminder theo quiet-hours và targeting policy.
6. **Phase 1**: reminder state được ghi nhưng delivery chưa thực thi cho đến khi notification feature flag bật. Admin có thể manual trigger nếu cần.

## async (bất đồng bộ) side-effects

- **Phase 2+**: push reminder dispatch
- **Phase 2+**: email reminder dispatch nếu channel bật
- recovery path chuẩn là replay outbox hoặc redrive reminder jobs từ control-plane state
- **Phase 1**: side effects deferred — chỉ ghi reminder state, delivery chưa thực thi

## success result (kết quả thành công)

- Reminder job được tạo đúng ngữ cảnh tu học.

## Errors

- `400`: preference payload hoặc target scope không hợp lệ.
- `401`: thiếu session ở flow người dùng tự cấu hình.
- `404`: target context hoặc subscription không resolve được.
- `409`: reminder state conflict hoặc duplicate schedule key.
- `500`: lỗi control-plane persistence, append outbox, hoặc downstream dispatch contract.

## Audit

- log nhẹ khi user đổi reminder preference hoặc admin/system chạy replay đáng chú ý.

## Idempotency / anti-spam

- replay outbox không được tạo duplicate reminder job cho cùng schedule key.
- redrive execution job không được tạo duplicate delivery nếu dispatch key đã consume.

## Notes for AI/codegen

- notification chỉ điều phối; không sở hữu vow hay practice canonical data.
- quiet hours và targeting policy là boundary của notification; canonical practice/vow/calendar data vẫn nằm ở module owner.

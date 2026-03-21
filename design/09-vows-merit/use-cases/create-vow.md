# Create Vow

## Purpose

- Tạo một record `Phát nguyện` rõ ràng, có target, thời hạn, và trạng thái để user giữ lời nguyện một cách nghiêm túc.

## Owner module

- `vows-merit`

## Actors

- `member`

## Trigger

- User bấm tạo phát nguyện mới trong màn hình `Phát nguyện`.

## Preconditions

- Có session hợp lệ.
- Nội dung nguyện đủ rõ và có thể thực hiện.
- Nếu là nguyện có target số lượng hoặc thời hạn, giá trị phải hợp lệ.

## Input contract

- body nên gồm:
  - `vowType`
  - `title`
  - `description`
  - `startDate`
  - `dueDate` nếu có
  - `targetMetricType` nếu có
  - `targetValue` nếu có
  - `notes` nếu có
- Phase 1 không cần outbox payload contract cho create-vow write path.
- nếu phase 2+ bật reminder signal qua outbox thì payload phải có `eventType`, `eventVersion`, và `idempotencyKey`

## Read set

- auth session
- các `vows` đang active của user
- policy hiện hành cho loại vow đó

## Write path

1. Resolve user từ session.
2. Validate payload theo contract hiện tại.
3. Kiểm tra conflict với vow đang active cùng loại nếu policy yêu cầu.
4. Tạo canonical record vào `vows`.
5. Nếu payload có mốc tiến độ ban đầu, append một `vowProgressEntry` khởi tạo.
6. Append audit `vow.create`.
7. **Phase 1**: nếu reminder feature đang active cho loại vow này, chỉ cập nhật reminder candidate/read-model theo sync hoặc manual refresh path; không giả định outbox.
8. **Phase 2+**: nếu reminder delivery/rebuild đã bật reliability path, append outbox event cho notification/reminder candidate layer.

## Async side-effects

- **Phase 1**: reminder candidate generation chỉ là sync/manual refresh concern nếu feature đã mở.
- **Phase 2+**: push/email setup hoặc reminder candidate rebuild đi qua outbox/downstream path.

## Success result

- User có một lời nguyện active rõ ràng trong hồ sơ thực hành.
- Lời nguyện này có thể được `Calendar` và `Notification` đọc xuống để gợi ý và nhắc việc.

## Errors

- `400`: payload không hợp lệ hoặc target không hợp lý.
- `401`: chưa đăng nhập.
- `409`: conflict với vow active cùng loại theo policy.
- `500`: lỗi service.

## Audit

- bắt buộc append `vow.create`
- audit tối thiểu nên giữ:
  - actor
  - vow type
  - target metric
  - target value
  - due date

## Idempotency / anti-spam

- không cần idempotency key phức tạp ở phase đầu
- nhưng UI nên chặn double-submit
- service nên chống tạo trùng rõ ràng khi cùng user gửi payload gần như giống hệt trong cửa sổ thời gian ngắn
- replay outbox không được tạo duplicate reminder candidate cho cùng vow mới khi phase 2+ đã bật.

## Performance target

- create vow nên hoàn tất `< 500ms`
- canonical create path không được kéo dài vì reminder logic; phase 1 dùng minimal sync/manual path, phase 2+ mới giao downstream async path

## Notes

- `vows` là canonical record; không nhét vow vào `practiceLogs` hay note chung chung.
- Nếu lời nguyện sau này cần moderation hoặc review nội bộ, phải mở flow riêng; không tự suy từ file này.

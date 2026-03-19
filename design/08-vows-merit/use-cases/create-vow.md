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
7. Nếu user bật nhắc việc, phát signal cho notification layer để chuẩn bị reminder candidates.

## Async side-effects
- reminder candidate generation
- optional push/email setup nếu feature reminder bật

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

## Performance target
- create vow nên hoàn tất `< 500ms`
- reminder candidate generation phải ở downstream async path, không kéo dài request chính

## Notes
- `vows` là canonical record; không nhét vow vào `practiceLogs` hay note chung chung.
- Nếu lời nguyện sau này cần moderation hoặc review nội bộ, phải mở flow riêng; không tự suy từ file này.

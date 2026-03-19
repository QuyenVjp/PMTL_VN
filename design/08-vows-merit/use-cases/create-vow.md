# Create Vow

## Purpose
- Tạo một record `phát nguyện` rõ ràng, có target, thời hạn và trạng thái để user giữ lời nguyện một cách nghiêm túc.

## Owner module
- `vows-merit`

## Actors
- `member`

## Trigger
- User bấm tạo phát nguyện mới.

## Preconditions
- Có session hợp lệ.
- Nội dung nguyện đủ rõ và có thể thực hiện.

## Input contract
- body nên gồm:
  - vowType
  - title hoặc summary
  - description
  - startDate
  - dueDate nếu có
  - targetValue nếu có

## Read set
- auth session
- các vow active hiện có của user

## Write path
1. Resolve user từ session.
2. Validate payload.
3. Kiểm tra conflict với vow đang active cùng loại nếu policy cần.
4. Tạo canonical `vow` record.
5. Append audit `vow.create`.
6. Schedule reminder milestones nếu user bật nhắc.

## Async side-effects
- notification schedule

## Success result
- User có một lời nguyện active rõ ràng trong hồ sơ thực hành.

## Errors
- `400`: payload không hợp lệ.
- `401`: chưa đăng nhập.
- `409`: conflict với vow active khác.
- `500`: lỗi service.

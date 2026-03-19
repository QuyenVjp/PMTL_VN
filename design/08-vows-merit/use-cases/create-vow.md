# Create Vow

## Purpose
- Tạo một record `phát nguyện` rõ ràng, có target, thời hạn và trạng thái để user giữ lời nguyện một cách nghiêm túc.

## owner module (module sở hữu)
- `vows-merit`

## Actors
- `member`

## trigger (điểm kích hoạt)
- User bấm tạo phát nguyện mới.

## preconditions (điều kiện tiên quyết)
- Có session hợp lệ.
- Nội dung nguyện đủ rõ và có thể thực hiện.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)
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

## write path (thứ tự ghi dữ liệu chuẩn)
1. Resolve user từ session.
2. Validate payload.
3. Kiểm tra conflict với vow đang active cùng loại nếu policy cần.
4. Tạo canonical `vow` record.
5. Append audit `vow.create`.
6. Schedule reminder milestones nếu user bật nhắc.

## async (bất đồng bộ) side-effects
- notification schedule

## success result (kết quả thành công)
- User có một lời nguyện active rõ ràng trong hồ sơ thực hành.

## Errors
- `400`: payload không hợp lệ.
- `401`: chưa đăng nhập.
- `409`: conflict với vow active khác.
- `500`: lỗi service (lớp xử lý nghiệp vụ).


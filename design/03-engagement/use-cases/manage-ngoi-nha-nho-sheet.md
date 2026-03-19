# Manage Ngoi Nha Nho Sheet

## Purpose
- Hỗ trợ người tu quản lý một tờ `Ngôi Nhà Nhỏ` theo cách gần với thao tác trên giấy thật, nhưng vẫn giữ record rõ ràng và dễ theo dõi.

## Owner module
- `engagement`

## Actors
- `member`

## Trigger
- User mở màn hình `Ngôi Nhà Nhỏ` và bắt đầu tạo hoặc cập nhật một tờ đang làm.

## Preconditions
- User có session hợp lệ.
- Template `Ngôi Nhà Nhỏ` chuẩn và 4 loại kinh được lấy từ content/reference chuẩn.

## Input contract
- payload phải chứa:
  - template loại tờ
  - 4 counters tương ứng 4 loại kinh
  - trạng thái tờ

## Read set
- auth session
- content references cho bài đọc chuẩn
- self-owned `Ngôi Nhà Nhỏ` records của user

## Write path
1. Resolve user từ session.
2. Nếu chưa có tờ đang làm, tạo canonical record mới cho `Ngôi Nhà Nhỏ`.
3. Khi user "chấm" thêm một vòng, cập nhật counter đúng loại kinh.
4. Khi đủ điều kiện hoàn thành, chuyển trạng thái sang `completed`.
5. Nếu user đánh dấu tự tồn hoặc đã hóa, cập nhật state tương ứng.
6. Append audit nhẹ cho các mốc lớn:
   - tạo tờ
   - hoàn thành tờ
   - chuyển sang đã hóa

## Async side-effects
- có thể enqueue reminder hoặc backup sync nhẹ về sau

## Success result
- User thấy đúng tiến độ từng tờ `Ngôi Nhà Nhỏ`.

## Errors
- `400`: payload không hợp lệ hoặc counter vượt rule template.
- `401`: chưa đăng nhập.
- `404`: template tham chiếu không tồn tại.
- `409`: state conflict, ví dụ đã hóa rồi mà vẫn tiếp tục chấm.
- `500`: lỗi service.

## Audit
- log các mốc lớn, không cần audit từng một lần chấm nhỏ nếu quá dày.

## Idempotency / anti-spam
- thao tác chấm phải tránh double-submit nếu user bấm liên tiếp do lag.

## Performance target
- thao tác chấm phải phản hồi gần như tức thời.

## Notes for AI/codegen
- UI nên mô phỏng giấy thật, nhưng canonical record vẫn là structured data.
- Không biến flow này thành game tích điểm.

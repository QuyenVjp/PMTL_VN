# Vows & Merit Contracts

## Owner data dự kiến

- `vows`
- `vowProgressEntries`
- `lifeReleaseJournal`

## Permission baseline

- `member`
  - tạo và cập nhật record của chính mình
- `admin`
  - xem hoặc hỗ trợ khi có workflow support rõ ràng
- `super-admin`
  - chỉ dùng cho audit/support sâu khi thật sự cần

## Contract rules

- phát nguyện phải có:
  - loại nguyện
  - nội dung rõ
  - thời điểm bắt đầu
  - target hoặc điều kiện hoàn thành nếu là nguyện đo được
- phóng sanh journal phải có:
  - ngày
  - loại vật
  - số lượng hoặc quy mô
  - địa điểm hoặc ghi chú địa điểm

## Public/private boundary

- đây chủ yếu là self-owned state
- chỉ chia sẻ ra community khi user chủ động tạo post riêng

## Error expectations

- `400`: lời nguyện hoặc journal không hợp lệ
- `401`: chưa đăng nhập
- `409`: conflict ở active vow cùng loại nếu policy không cho duplicate
- `500`: lỗi service/notification scheduling

## Notes for AI/codegen

- Đừng biến vow tracking thành todo list thường.
- Đừng biến life release journal thành social feed canonical.
- Admin scope ở đây nghĩa là `Phụng sự viên`, không tách thêm role vận hành riêng ở current scope.

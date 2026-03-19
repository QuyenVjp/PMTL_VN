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

## contract (hợp đồng dữ liệu/nghiệp vụ) rules

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
  - source-linked ritual note nếu app gợi ý bài niệm hoặc khai thị liên quan
- với các rule thực hành cụ thể như:
  - sau khi phóng sanh niệm `Thánh Vô Lượng Thọ Quyết Định Quang Minh Vương Đà La Ni` `37` biến trong ngày hôm đó
  - app nên lưu ở dạng:
    - `practice rule`
    - `source URL`
    - `source quote original`
    - `bản dịch tiếng Việt`
    - `review status (trạng thái kiểm duyệt)`
  - không hardcode mù nếu chưa có source mapping rõ

## Public/private boundary (ranh giới trách nhiệm)

- đây chủ yếu là self-owned state
- chỉ chia sẻ ra community khi user chủ động tạo post riêng

## Error expectations

- `400`: lời nguyện hoặc journal không hợp lệ
- `401`: chưa đăng nhập
- `409`: conflict ở active vow cùng loại nếu policy không cho duplicate
- `500`: lỗi service (lớp xử lý nghiệp vụ)/notification scheduling

## Notes for AI/codegen

- Đừng biến vow tracking thành todo list thường.
- Đừng biến life release journal thành social feed canonical.
- Admin scope ở đây nghĩa là `Phụng sự viên`, không tách thêm role vận hành riêng ở current scope.


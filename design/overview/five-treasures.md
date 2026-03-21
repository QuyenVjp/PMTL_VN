# Five Treasures Model

File này gom toàn bộ logic hỗ trợ `5 đại pháp bảo` vào một khung nhìn duy nhất.
Mục tiêu là tránh tình trạng mỗi phần rơi rác ở một module mà không có mô hình tổng.

## 5 đại pháp bảo trong phạm vi app hỗ trợ

### 1. Niệm kinh
- bài tập hằng ngày
- `Ngôi Nhà Nhỏ`
- bài đọc chuẩn
- audio/video hỗ trợ đọc đúng

Owner modules:
- `02-content`
- `04-engagement`

### 2. Phát nguyện
- tạo nguyện
- theo dõi tiến độ
- hoàn nguyện
- nhắc hạn và milestone

owner module (module sở hữu):
- `09-vows-merit`

### 3. Phóng sanh
- sổ tay phóng sanh
- checklist bài đọc, lời khấn, hướng dẫn
- gắn với ngày tu học quan trọng

Owner modules:
- `09-vows-merit`
- `02-content`
- `07-calendar`

### 4. Bạch thoại Phật pháp
- đọc
- nghe
- tải offline
- học theo chủ đề

Owner modules:
- `10-wisdom-qa`
- `02-content`

### 5. Hỏi đáp / khai thị / tra cứu
- `Huyền học vấn đáp`
- `Phật học vấn đáp`
- `khai thị`
- retrieval theo vấn đề

Owner modules:
- `10-wisdom-qa`
- `06-search`

## Những gì app nên hỗ trợ

- hỗ trợ đúng bài
- hỗ trợ đúng tiến độ
- hỗ trợ đúng ngày
- hỗ trợ đúng tài liệu
- hỗ trợ người lớn tuổi đọc, nghe, tra cứu

## Những gì app không nên giả vờ làm

- thay thầy trả lời
- phán đoán nghiệp lực bằng AI
- gamify công đức
- biến tu tập thành social performance

## Quan hệ giữa 5 đại pháp bảo và module hiện tại

| Pháp bảo | Module owner chính | Module phụ trợ |
|---|---|---|
| Niệm kinh | `02-content` (editorial), `04-engagement` (user-state) | `08-notification` |
| Phát nguyện | `09-vows-merit` | `07-calendar`, `08-notification` |
| Phóng sanh | `09-vows-merit` | `02-content`, `07-calendar`, `08-notification`, `03-community` |
| Bạch thoại Phật pháp | `10-wisdom-qa` | `02-content`, `06-search` |
| Hỏi đáp / khai thị | `10-wisdom-qa` | `06-search`, `02-content` |

## Notes for AI/codegen

- Nếu một feature mới không map được vào bảng trên, phải xem lại owner module (module sở hữu) trước khi code.
- Không để `03-community` nuốt mất các self-owned thực hành cốt lõi.


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
- `01-content`
- `03-engagement`

### 2. Phát nguyện
- tạo nguyện
- theo dõi tiến độ
- hoàn nguyện
- nhắc hạn và milestone

owner module (module sở hữu):
- `08-vows-merit`

### 3. Phóng sanh
- sổ tay phóng sanh
- checklist bài đọc, lời khấn, hướng dẫn
- gắn với ngày tu học quan trọng

Owner modules:
- `08-vows-merit`
- `01-content`
- `06-calendar`

### 4. Bạch thoại Phật pháp
- đọc
- nghe
- tải offline
- học theo chủ đề

Owner modules:
- `09-wisdom-qa`
- `01-content`

### 5. Hỏi đáp / khai thị / tra cứu
- `Huyền học vấn đáp`
- `Phật học vấn đáp`
- `khai thị`
- retrieval theo vấn đề

Owner modules:
- `09-wisdom-qa`
- `05-search`

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
| Niệm kinh | `03-engagement` | `01-content`, `07-notification` |
| Phát nguyện | `08-vows-merit` | `06-calendar`, `07-notification` |
| Phóng sanh | `08-vows-merit` | `01-content`, `06-calendar`, `07-notification`, `02-community` |
| Bạch thoại Phật pháp | `09-wisdom-qa` | `01-content`, `05-search` |
| Hỏi đáp / khai thị | `09-wisdom-qa` | `05-search`, `01-content` |

## Notes for AI/codegen

- Nếu một feature mới không map được vào bảng trên, phải xem lại owner module (module sở hữu) trước khi code.
- Không để `02-community` nuốt mất các self-owned thực hành cốt lõi.


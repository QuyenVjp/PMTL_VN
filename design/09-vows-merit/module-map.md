# Vows & Merit Module

> Ghi chú:
> Module này được thêm để tách rõ phần `Nguyện lực & Công đức` ra khỏi self-state công phu thông thường.

---

markmap:
colorFreezeLevel: 2
initialExpandLevel: 3

---

# Vows & Merit Module

## Mục tiêu

- quản lý `phát nguyện`
- quản lý `hoàn nguyện`
- quản lý sổ tay `phóng sanh`
- giữ các record công đức/thực hành có mục tiêu, thời hạn và cam kết rõ

## Tại sao phải tách module này

- `practiceLogs` chỉ ghi việc đã làm
- `phát nguyện` là lời cam kết kéo dài theo thời hạn, target và trạng thái riêng
- `phóng sanh` là thực hành cần thời điểm, mục tiêu và bài đọc hỗ trợ

## Dữ liệu module nên sở hữu

### Vow records

- loại nguyện
- nội dung nguyện
- ngày phát nguyện
- thời hạn
- target lượng hóa nếu có
- trạng thái:
  - active
  - fulfilled
  - paused
  - broken

### Merit-support records

- tiến độ hoàn thành theo từng nguyện
- mốc hoàn thành một phần
- nhật ký hoàn nguyện

### Life release journal

- ngày phóng sanh
- địa điểm
- loại vật
- số lượng
- mục đích hồi hướng nếu policy cho phép lưu
- checklist bài đọc và nghi thức hỗ trợ

## References ra ngoài module

### Identity

- owner user

### Content

- bài đọc, lời khấn, hướng dẫn phóng sanh
- bài dạy về phát nguyện

### Calendar

- ngày trai giới
- ngày vía
- ngày thích hợp cho phóng sanh hoặc tăng cường tu tập

### Notification

- nhắc nguyện
- nhắc mốc thời hạn
- nhắc các ngày phù hợp để hoàn thành thực hành
- signal quan trọng nên phát qua `outbox_events`

## Current direction

- tách `vow tracking` khỏi `practiceLogs`
- biến `phóng sanh` thành sổ tay thực hành, không phải feed xã hội
- canonical record đi trước; reminder/progress signal đi sau qua outbox
- progress summary phải replay/recompute được từ source records

# Vows & Merit Decisions

## Decision 1. Phát nguyện là record riêng, không gộp vào practiceLogs

### Context
`practiceLogs` chỉ mô tả một phiên thực hành hoặc một lần ghi self-state.
Phát nguyện là cam kết kéo dài theo thời hạn, target và trạng thái riêng.

### Decision
- tạo owner model riêng cho `phát nguyện`
- không encode phát nguyện thành text note bên trong practice log

## Decision 2. Phóng sanh là sổ tay thực hành, không phải social post

### Context
Phóng sanh là thực hành có chuẩn bị và nghi thức hỗ trợ.

### Decision
- tạo `life release journal` thuộc owner module (module sở hữu) này
- community chỉ tham gia khi user chủ động chia sẻ testimony hoặc hình ảnh

## Decision 3. Record công đức chỉ là hỗ trợ quán chiếu, không chấm điểm tu hành

### Decision
- không dùng điểm, rank, streak để đại diện công đức
- chỉ lưu mốc, tiến độ, hoàn thành và hồi hướng theo nguyện nếu thật sự cần

## Decision 4. Nhắc nguyện và nhắc phóng sanh dựa vào lịch tu học cá nhân

### Decision
- calendar cung cấp ngày quan trọng
- notification chỉ gửi nhắc trên dữ liệu owner của module này


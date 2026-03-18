# Calendar Module

> Ghi chú cho sinh viên:
> Calendar ở đây là dữ liệu lịch và sự kiện.
> Nó không tự gửi notification, mà chỉ cung cấp dữ liệu cho module khác dùng.

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Calendar Module

## Mục tiêu
- mô tả dữ liệu lịch và sự kiện đang có trong repo
- giữ ownership riêng cho event/lunar schedule data
- không nhét notification orchestration vào module này

## Collections thuộc module
- `events`
- `lunarEvents`
- `lunarEventOverrides`

## Current responsibilities

### Events
- đăng sự kiện public
- giữ thời gian, địa điểm, media, external links
- giữ `eventStatus` phục vụ public read model

### Lunar schedule
- định nghĩa recurrence dữ liệu âm lịch cơ sở
- liên kết bài viết liên quan nếu có

### Overrides
- gắn chant item cho lunar event
- đặt target / max / priority / note cho event cụ thể

## References ra ngoài module

### Content
- `lunarEvents.relatedPosts`
- `posts.eventContext.relatedEvent`

### Engagement / practice refs
- `lunarEventOverrides.chantItem`
- chant item definition gốc vẫn nằm ở content-side practice support data

### Notification
- calendar không sở hữu delivery
- module khác có thể đọc event/lunar data để tạo notification job

## Current rules
- event ownership nằm ở calendar dù content có thể tham chiếu event
- lunar recurrence base và override là hai lớp dữ liệu khác nhau
- reminder logic không nằm trong current scope của calendar module
- calendar chỉ map ngày/sự kiện với bài niệm hoặc guide; không sao chép script nghi thức từ tài liệu PDF vào event record

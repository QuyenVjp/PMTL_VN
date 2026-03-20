# Calendar Module Decisions

> Ghi chú cho sinh viên:
> Điểm khó của module này là phân biệt `lunarEvents` với `lunarEventOverrides`.
> Một cái là lịch gốc, một cái là lớp điều chỉnh.

## Decision 1. Events thuộc calendar module, không thuộc content module

### Context

Repo có collection `events`, trong khi content chỉ tham chiếu event ở một vài field context.

### Decision

- `events` là calendar-owned data.
- Content chỉ tham chiếu `relatedEvent` khi cần liên kết.

### Rationale

- boundary (ranh giới trách nhiệm) rõ.
- Tránh content module phình ra thêm một lifecycle riêng.

### Trade-off

- Một số màn hình content cần resolve relation sang calendar.

## Decision 2. Lunar recurrence base tách khỏi override

### Context

Repo có `lunarEvents` và `lunarEventOverrides` là hai collection riêng.

### Decision

- `lunarEvents` giữ recurrence cơ sở.
- `lunarEventOverrides` giữ điều chỉnh hoặc practice mapping cụ thể.

### Rationale

- Giữ dữ liệu lịch cơ sở sạch.
- Cho phép điều chỉnh mà không phá recurrence gốc.

### Trade-off

- Read path cần merge hai lớp dữ liệu.

## Decision 3. Override chỉ tham chiếu practice refs, không sở hữu practice state

### Context

`lunarEventOverrides` có relation tới `chantItem`.

### Decision

- Calendar chỉ giữ mapping và rule override.
- User preference hoặc practice history vẫn thuộc engagement module.

### Rationale

- Tránh calendar ôm user-state.
- Khớp boundary (ranh giới trách nhiệm) tổng thể.

### Trade-off

- Một số feature cần phối hợp calendar + engagement service (lớp xử lý nghiệp vụ) để render trải nghiệm hoàn chỉnh.

## Decision 4. Notification logic không nằm trong calendar current scope

### Context

Calendar data thường kéo theo reminder, nhưng repo chưa mô hình hóa reminder ownership ngay tại đây.

### Decision

- Calendar không sở hữu push/email orchestration.
- Nếu có event/lunar reminder, calendar chỉ là source data cho notification module đọc.

### Rationale

- Giảm coupling.
- Tránh module lịch thành workflow engine.

### Trade-off

- Cần producer service (lớp xử lý nghiệp vụ) riêng khi bật reminder feature.

## Decision 5. Event status là read model (mô hình dữ liệu đọc) phục vụ public delivery

### Context

`events` có `eventStatus` dạng `upcoming | live | past`.

### Decision

- Giữ `eventStatus` như trạng thái hiển thị/read model (mô hình dữ liệu đọc).
- Event canonical data vẫn là ngày, time string, location, type, links, media.

### Rationale

- Dễ render public event UI.
- Không cần người dùng cuối tự suy luận trạng thái từ raw date ở mọi nơi.

### Trade-off

- Cần cập nhật `eventStatus` nhất quán khi event thay đổi hoặc khi thời gian trôi qua.

## Decision 6. Calendar projection và reminder signal quan trọng đi qua outbox/recompute path

### Context

Event publish/update, lunar override đổi logic, và refresh `personalPracticeCalendarReadModel` đều có thể kéo theo downstream notify/rebuild.

### Decision

- Canonical event/lunar write phải commit trước.
- Signal quan trọng cho refresh hoặc notification đi qua `outbox_events`.
- Với `personalPracticeCalendarReadModel`, recovery path chuẩn là recompute window hoặc replay signal, không vá từng row mơ hồ.

### Rationale

- Giữ read model và downstream reminder cùng ngôn ngữ reliability với phần còn lại của hệ thống.
- Dễ điều tra hơn khi advisory hoặc reminder bị lệch.

### Trade-off

- Tăng thêm số path cần quan sát: outbox lag, refresh lag, stale window count.

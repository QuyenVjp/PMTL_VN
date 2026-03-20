# Vows & Merit Decisions

## Decision 1. Phát nguyện là record riêng, không gộp vào practiceLogs

### Context

`practiceLogs` chỉ mô tả một phiên thực hành hoặc một lần ghi self-state.
Phát nguyện là cam kết kéo dài theo thời hạn, target và trạng thái riêng.

### Decision

- tạo owner model riêng cho `phát nguyện`
- không encode phát nguyện thành text note bên trong practice log

### Rationale

- Giữ ranh giới rõ giữa `việc đã làm` và `cam kết đang theo đuổi`.
- Dễ xây lifecycle state, milestone, reminder và reconciliation hơn.
- Tránh để một flow nhiều tháng bị ép vào record vốn chỉ hợp cho write ngắn hạn.

### Trade-off

- Tăng thêm model và summary cần quản lý.
- Một số màn hình tu tập phải compose dữ liệu từ cả `practiceLogs` và `vows`.

## Decision 2. Phóng sanh là sổ tay thực hành, không phải social post

### Context

Phóng sanh là thực hành có chuẩn bị và nghi thức hỗ trợ.

### Decision

- tạo `life release journal` thuộc owner module (module sở hữu) này
- community chỉ tham gia khi user chủ động chia sẻ testimony hoặc hình ảnh

### Rationale

- Giữ quyền riêng tư và sắc thái thực hành cá nhân.
- Tránh kéo `phóng sanh` thành nội dung tương tác xã hội mặc định.
- Dễ gắn checklist nghi thức, hồi hướng, và context ngày tu học hơn.

### Trade-off

- Nếu sau này muốn chia sẻ ra community, phải có explicit export/share flow riêng.

## Decision 3. Record công đức chỉ là hỗ trợ quán chiếu, không chấm điểm tu hành

### Context

Module này dễ bị hiểu sai thành hệ thống gamification nếu chỉ nhìn vào progress, target và milestone.

### Decision

- không dùng điểm, rank, streak để đại diện công đức
- chỉ lưu mốc, tiến độ, hoàn thành và hồi hướng theo nguyện nếu thật sự cần

### Rationale

- Khớp tinh thần sản phẩm và tránh incentive lệch.
- Giữ UI và data model phục vụ thực hành thay vì thi đua.

### Trade-off

- Mất đi một số cơ chế kích hoạt tương tác kiểu game.
- Cần diễn đạt progress bằng ngôn ngữ nhẹ và tôn trọng hơn.

## Decision 4. Nhắc nguyện và nhắc phóng sanh dựa vào lịch tu học cá nhân

### Context

Lời nguyện và thực hành phóng sanh không nên chạy reminder tách rời hoàn toàn khỏi ngữ cảnh ngày tu học, ngày vía, hoặc lịch cá nhân.

### Decision

- calendar cung cấp ngày quan trọng
- notification chỉ gửi nhắc trên dữ liệu owner của module này

### Rationale

- Giảm trùng nhắc và giữ reminder có ngữ cảnh hơn.
- Cho phép merge với advisory hoặc cửa sổ lịch cá nhân thay vì bắn signal rời rạc.

### Trade-off

- Tăng coupling ở read-model/recommendation layer với calendar context.
- Cần recovery path rõ khi calendar projection bị trễ hoặc recompute.

## Decision 5. Vow/life-release signal quan trọng đi qua outbox và progress phải replay được

### Context

Reminder, progress recompute, calendar refresh, và downstream notify đều là side effect dễ lệch nếu canonical write thành công nhưng async handoff thất bại.

### Decision

- Canonical write của `vows`, `vowProgressEntries`, `lifeReleaseJournal` commit trước.
- Reminder signal, recompute summary signal, và downstream notification quan trọng đi qua `outbox_events`.
- Progress summary phải recompute hoặc replay được từ source records khi cần recovery.

### Rationale

- Giữ source record sạch và chắc hơn.
- Cho phép rebuild progress hoặc reminder candidate khi worker/queue bị trễ.
- Hợp với baseline outbox chung của toàn hệ thống.

### Trade-off

- Tăng độ phức tạp vận hành cho dispatcher, replay, và summary recompute path.

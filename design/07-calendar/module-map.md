# Calendar Module (Mô-đun Lịch)

> Ghi chú cho sinh viên:
> Calendar ở đây là dữ liệu lịch và sự kiện. Nó không tự gửi notification; nó chỉ cung cấp canonical calendar data (dữ liệu lịch chuẩn gốc) và read model (mô hình dữ liệu đọc) cho mô-đun khác sử dụng.

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Calendar Module (Mô-đun Lịch)

## Objectives (Mục tiêu)
- mô tả ownership của dữ liệu lịch, sự kiện, và recurrence âm lịch
- giữ notification orchestration ở ngoài calendar
- chốt rõ `personalPracticeCalendarReadModel` là derived read model (mô hình đọc được tính ra)
- mở rộng event model đủ sâu cho `sự kiện tổ chức` có agenda, speakers, CTA, poster, gallery

## Module collections (Các collection thuộc mô-đun)
- `events`
- `eventAgendaItems`
- `eventSpeakers`
- `eventCtas`
- `lunarEvents`
- `lunarEventOverrides`
- `personalPracticeCalendarReadModel`

## Current responsibilities (Trách nhiệm hiện tại)

### Events (Sự kiện)
- đăng sự kiện public
- giữ thời gian, địa điểm, media ref, external link
- giữ `eventStatus` cho public read model
- hỗ trợ `organizational events` có timeline, speakers, CTA, poster, gallery, file chương trình

### Organizational event details (Chi tiết sự kiện tổ chức)
- giữ agenda theo khung giờ
- giữ danh sách diễn giả/người thực hiện
- giữ CTA như đăng ký, bản đồ, livestream, download chương trình
- giữ poster, gallery, file đính kèm theo event

### Lunar schedule (Lịch âm)
- định nghĩa recurrence base (lớp lặp lại cơ sở)
- liên kết bài viết hoặc practice reference nếu có

### Overrides (Lớp ghi đè)
- gắn chant item hoặc note đặc biệt cho ngày/sự kiện cụ thể
- đặt target/priority/max/note cho trường hợp đặc biệt

### Personal practice calendar read model (Mô hình đọc lịch tu học cá nhân)
- ghép ngày âm, ngày vía, ngày trai giới, event public
- ghép practice support references
- ghép vow/life-release hooks
- compose `daily practice advisory` dạng card ngắn
- luôn là dữ liệu fully derived (được tính ra hoàn toàn), không thay ownership của event/lunar data gốc

## Step-by-step build cho personal practice calendar (Các bước dựng lịch tu học cá nhân)

### Step 1. Xác định calculation window (cửa sổ tính toán)
- input tối thiểu:
  - `userId`
  - `dateFrom`
  - `dateTo`
  - `timezone`
- chuẩn hóa về một window ngày rõ ràng

### Step 2. Lấy base calendar layer (lớp lịch nền)
- load `events` trong cửa sổ ngày
- load `lunarEvents` có thể áp vào cửa sổ đó
- resolve ngày âm tương ứng cho từng ngày dương
- tạo skeleton day record

### Step 3. Áp recurrence âm lịch và ngày đặc biệt
- xác định ngày vía, ngày trai giới, ngày thực hành đặc biệt
- gắn `dayTags` gốc từ `lunarEvents`

### Step 4. Áp `lunarEventOverrides`
- override thắng base event về cách diễn giải hiển thị
- override không được cướp ownership của record gốc

### Step 5. Ghép practice/content references
- lấy chant item, plan, guide ref từ content nếu có
- chỉ copy metadata cần cho màn hình lịch, không copy nguyên script dài

### Step 6. Ghép user context (ngữ cảnh cá nhân)
- đọc summary từ:
  - `chantPreferences`
  - `practiceSheets`
  - `vows`
  - `lifeReleaseJournal`
- chỉ dùng để cá nhân hóa gợi ý, không sửa lịch gốc

### Step 7. Tính recommended practice windows (khung giờ gợi ý)
- dựa trên rule của ngày, event time, và preference của user
- output là danh sách khung giờ dễ hiểu

### Step 8. Materialize day records (ghi ra các bản ghi ngày)
- mỗi record nên có tối thiểu:
  - `date`
  - `lunarLabel`
  - `dayTags`
  - `recommendedItems`
  - `recommendedWindows`
  - `eventRefs`
  - `vowHooks`
  - `lifeReleaseHooks`
  - `advisoryCards`
  - `sourceRefs`

### Step 9. Trả kết quả hoặc replace read-model snapshot
- nếu đọc tức thời thì trả thẳng ra API
- nếu materialized read model thì replace snapshot trong cửa sổ tương ứng
- khi refresh, row cũ ngoài logic hiện tại phải prune/remove

## Rule precedence (Thứ tự ưu tiên của quy tắc)
- `events` và `lunarEvents` là lớp dữ liệu gốc
- `lunarEventOverrides` ghi đè cách diễn giải
- `content references` chỉ bổ sung tài liệu gợi ý
- `user context` chỉ cá nhân hóa phần hiển thị/gợi ý
- `notification` là downstream consumer (mô-đun tiêu thụ hạ nguồn), không phải owner

## Những gì calendar service không được làm
- không tự tạo push job trực tiếp
- không ghi đè event/lunar canonical record
- không copy nguyên script kinh/chú vào calendar record
- không biến `personalPracticeCalendarReadModel` thành social feed

## External references (Tham chiếu ngoài mô-đun)

### Content
- `lunarEvents.relatedPosts`
- `posts.eventContext.relatedEvent`
- `organizational-events-architecture.md` mô tả event program sâu, nhưng ownership vẫn ở calendar

### Engagement / practice refs
- `lunarEventOverrides.chantItem`
- practice support definition gốc vẫn ở content-side

### Notification
- calendar không sở hữu delivery
- mô-đun khác có thể đọc calendar output để tạo reminder signal
- signal quan trọng nên đi qua `outbox_events`

## Current rules (Quy tắc hiện tại)
- event ownership nằm ở calendar
- `organizational event` vẫn là event calendar-owned, không tách module mới
- lunar recurrence base và override là hai lớp dữ liệu khác nhau
- reminder logic không nằm trong current scope của calendar
- `personalPracticeCalendarReadModel` là read model do calendar compose, không phải owner data mới
- refresh/rebuild quan trọng phải có replay/recompute path rõ

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
- bổ sung read model (mô hình dữ liệu đọc) cho `Lịch tu học cá nhân`

## Collections thuộc module
- `events`
- `lunarEvents`
- `lunarEventOverrides`
- `personalPracticeCalendarReadModel` (read model do service sở hữu và xây dựng)

## Current responsibilities

### Events
- đăng sự kiện public
- giữ thời gian, địa điểm, media, external links
- giữ `eventStatus` phục vụ public read model (mô hình dữ liệu đọc)

### Lunar schedule
- định nghĩa recurrence dữ liệu âm lịch cơ sở
- liên kết bài viết liên quan nếu có

### Overrides
- gắn chant item cho lunar event
- đặt target / max / priority / note cho event cụ thể

### Personal practice calendar read model (mô hình dữ liệu đọc)
- ghép ngày âm lịch, ngày vía, ngày trai giới, giờ gợi ý, vow/life-release hooks
- ghép `daily practice advisory (thông báo hoặc gói hướng dẫn)` dạng card ngắn cho người dùng
- trả về lịch đọc được ngay cho user
- không thay ownership của event/lunar canonical data

### `personalPracticeCalendarService`
- service (lớp xử lý nghiệp vụ) này không phải owner của event canonical data
- nhiệm vụ của nó là tính `Lịch tu học cá nhân` từ nhiều nguồn đã có sẵn
- nó phải trả ra một read model (mô hình dữ liệu đọc) ổn định, để web/notification đọc mà không phải tự ghép logic lại lần nữa
- nó cũng là nơi compose `daily practice advisory (thông báo hoặc gói hướng dẫn)`, nhưng không sở hữu bài gốc hay bản dịch gốc

## Step-by-step tính `Lịch tu học cá nhân`

### Step 1. Xác định cửa sổ ngày cần tính
- nhận input:
  - `userId`
  - `dateFrom`
  - `dateTo`
  - `timezone`
- chuẩn hóa về một cửa sổ ngày rõ ràng
- ví dụ:
  - 7 ngày tới
  - tháng hiện tại
  - cửa sổ tùy chọn do UI yêu cầu

### Step 2. Lấy lớp dữ liệu nền của lịch
- load `events` trong cửa sổ ngày
- load `lunarEvents` có khả năng áp vào cửa sổ đó
- resolve ngày âm tương ứng cho từng ngày dương trong cửa sổ
- tạo skeleton `day record` cho từng ngày:
  - `solarDate`
  - `lunarLabel`
  - `baseEvents`
  - `baseLunarTags`

### Step 3. Áp recurrence âm lịch và ngày kỷ niệm
- với mỗi ngày trong cửa sổ:
  - kiểm tra có rơi vào `ngày vía`, `ngày trai giới`, hoặc ngày thực hành đặc biệt không
  - gắn `dayTags` gốc từ `lunarEvents`
- lớp này mới chỉ là `base spiritual calendar`
- chưa cá nhân hóa theo người dùng

### Step 4. Áp `lunarEventOverrides`
- nếu có `override` cho ngày hoặc sự kiện cụ thể:
  - thay đổi nhãn hiển thị
  - thêm/bớt chant item gợi ý
  - thêm priority, note, target count
- rule precedence:
  - `override` thắng `lunar event base`
  - nhưng `override` không được thay ownership của event/lunar record

### Step 5. Ghép practice support references
- đọc `chantItems`, `chantPlans`, guide refs từ content nếu event/lunar rule có tham chiếu
- chỉ lấy:
  - tiêu đề
  - slug/publicId
  - loại bài
  - audio/text/guide refs cần cho màn hình lịch
- không copy script đầy đủ vào calendar record

### Step 5b. Ghép source-backed advisory rules (các quy tắc advisory có nguồn đối chiếu)
- đọc source-backed rule refs từ `09-wisdom-qa`
- chỉ lấy những thứ cần để compose advisory (thông báo hoặc gói hướng dẫn):
  - source code / timestamp
  - rule summary
  - bản dịch Việt đã duyệt hoặc draft
  - source URL
  - review status (trạng thái kiểm duyệt)
- không copy toàn bộ transcript dài vào calendar record

### Step 6. Ghép ngữ cảnh cá nhân của user
- load summary từ:
  - `chantPreferences`
  - `practiceSheets`
  - `vows`
  - `lifeReleaseJournal`
- dùng lớp này để cá nhân hóa:
  - hôm nay user đang theo plan nào
  - có mốc nguyện nào sắp tới không
  - có ngày nào phù hợp để nhắc phóng sanh không
  - có `Practice Sheet` đang dang dở cần hiện lại không

### Step 7. Tính `recommendedPracticeWindows`
- lấy từ:
  - rule cố định của ngày
  - event time nếu có
  - preference của user nếu có
- kết quả phải là danh sách khung giờ dễ hiểu:
  - `start`
  - `end`
  - `label`
- đây là gợi ý thực hành, không phải scheduling job

### Step 8. Tạo read model (mô hình dữ liệu đọc) cuối cùng cho từng ngày
- mỗi `day record` nên có tối thiểu:
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
  - `practiceSheetSummary`
  - `notesVi`
  - `notesEn`

### Step 9. Trả ra hoặc materialize
- nếu là read tức thời:
  - trả danh sách `day record` ngay cho web
- nếu là read model (mô hình dữ liệu đọc) materialized:
  - upsert vào `personalPracticeCalendarReadModel`
- notification module chỉ đọc output này, không tự tính lại logic lịch

## Rule precedence cần chốt rõ
- `events` và `lunarEvents` là lớp gốc
- `lunarEventOverrides` ghi đè cách diễn giải lịch
- `content references` chỉ bổ sung tài liệu/bài gợi ý
- `source-backed advisory rules` chỉ bổ sung khai thị hoặc rule đã duyệt
- `user context` chỉ cá nhân hóa phần gợi ý, không sửa lịch gốc
- `notification` là downstream consumer, không phải owner

## Những gì service (lớp xử lý nghiệp vụ) này không được làm
- không tự tạo push job
- không ghi đè `events` hay `lunarEvents`
- không copy nguyên script kinh/chú từ content sang calendar
- không biến một bài cộng đồng thành source of truth (nguồn dữ liệu gốc đáng tin cậy nhất) cho rule ngày đặc biệt
- không biến `Lịch tu học cá nhân` thành social feed

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
- calendar được phép sở hữu `read model (mô hình dữ liệu đọc)` cho lịch tu học cá nhân, nhưng không sở hữu push delivery
- calendar chỉ map ngày/sự kiện với bài niệm hoặc guide; không sao chép script nghi thức từ tài liệu PDF vào event record
- `daily practice advisory (thông báo hoặc gói hướng dẫn)` là output compose, không phải owner data mới


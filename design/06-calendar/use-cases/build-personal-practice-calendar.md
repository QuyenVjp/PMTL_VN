# Build Personal Practice Calendar

## Purpose
- Tạo read model (mô hình dữ liệu đọc) lịch tu học cá nhân từ lịch âm gốc, ngày đặc biệt và preference/nguyện liên quan.

## owner module (module sở hữu)
- `calendar`

## Actors
- `member`

## trigger (điểm kích hoạt)
- User mở lịch tu học cá nhân.

## preconditions (điều kiện tiên quyết)
- Calendar canonical data tồn tại.
- Có thể resolve preference hoặc vow context nếu user đã bật.

## Read set
- `events`
- `lunarEvents`
- `lunarEventOverrides`
- user practice preferences summary
- vow/life-release reminder hooks nếu cần

## write path (thứ tự ghi dữ liệu chuẩn) / compose path
1. Xác định `dateFrom`, `dateTo`, `timezone`.
2. Load `events` và `lunarEvents` trong cửa sổ ngày.
3. Resolve ngày âm và gắn `dayTags` gốc cho từng ngày.
4. Áp `lunarEventOverrides` để ghi đè hoặc bổ sung cách diễn giải.
5. Ghép practice support references từ content nếu ngày đó có guide hoặc chant item gợi ý.
6. Ghép summary cá nhân từ `chantPreferences`, `practiceSheets`, `vows`, `lifeReleaseJournal`.
7. Tính `recommendedItems`, `recommendedWindows`, `vowHooks`, `lifeReleaseHooks`.
8. Trả read model (mô hình dữ liệu đọc) hoặc materialize vào `personalPracticeCalendarReadModel` theo flow triển khai.

## success result (kết quả thành công)
- User thấy lịch có ý nghĩa thực hành:
  - ngày trai giới
  - ngày vía
  - ngày nên phóng sanh
  - giờ phù hợp để đọc/niệm

## Rule precedence
- `lunarEventOverrides` thắng lớp `lunarEvents` gốc khi cùng một ngày có rule đè.
- `user context` chỉ cá nhân hóa phần gợi ý, không sửa lịch gốc.
- notification nếu có chỉ đọc output cuối, không tự tính lịch lần nữa.


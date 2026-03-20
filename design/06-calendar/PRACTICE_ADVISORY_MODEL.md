# Practice advisory (thông báo hoặc gói hướng dẫn) Model

File này chốt cách biểu diễn một `thông báo tu học / practice advisory (thông báo hoặc gói hướng dẫn)` trong PMTL_VN.

Mục tiêu:

- biến một bài thông báo thực tế thành data model rõ ràng
- không nhét mọi thứ vào một cục text dài
- để `Calendar`, `Notification`, `Wisdom & QA`, và web UI dùng cùng một logic

## Một bài thông báo thực tế thường gồm những lớp gì

Ví dụ bài:

- hôm nay là ngày nào
- mùng 1 / rằm / ngày vía gì
- lời chúc chung
- hôm nay nên niệm gì
- tối đa bao nhiêu biến
- giờ nào không nên niệm
- nếu không có bàn thờ thì làm gì
- phụ nữ mang thai hoặc ở cữ thì giới hạn bao nhiêu
- link bài gốc để đọc thêm
- link phụng sự viên địa phương để hỗ trợ người mới

Đây không phải chỉ là `post`.
Nó là một `advisory (thông báo hoặc gói hướng dẫn) package` được compose từ nhiều lớp dữ liệu.

## advisory (thông báo hoặc gói hướng dẫn) package gồm các phần

### 1. `dayIdentity` | Nhận diện ngày

- `solarDate`
- `weekdayLabel`
- `lunarDateLabel`
- `dayTags`

### 2. `announcementCopy` | Phần lời chúc / lời nhắc mở đầu

- `headlineVi`
- `headlineZh` nếu có
- `introVi`
- `introZh`

### 3. `practiceRecommendations` | Khuyến nghị tu tập

Mỗi recommendation nên là một record riêng:

- `itemType`
- `labelVi`
- `labelZh`
- `actionKind`
- `priority`

### 4. `recitationRules` | Quy tắc số biến / giới hạn

Mỗi rule nên có:

- `chantKey`
- `chantLabelVi`
- `chantLabelZh`
- `maxCount`
- `scope`
- `conditionSummaryVi`
- `sourceRef`

### 5. `timeWindowRules` | Quy tắc thời gian

- `notRecommendedStart`
- `notRecommendedEnd`
- `ruleType`
- `conditionSummaryVi`
- `sourceRef`

### 6. `householdConditions` | Điều kiện theo hoàn cảnh trong nhà

Mỗi condition nên tách riêng:

- `householdType`
- `requiredActionVi`
- `requiredActionZh`
- `sourceRef`

### 7. `exceptionRules` | Ngoại lệ / nhóm người đặc biệt

- `audienceType`
- `ruleSummaryVi`
- `maxCount`
- `sourceRef`

### 8. `sourceRefs` | Liên kết nguồn

Mỗi advisory (thông báo hoặc gói hướng dẫn) package phải có source refs rõ:

- `officialOrigin`
- `officialMirror`
- `communityVolunteerRef`
- `reviewStatus`

### 9. `supportRefs` | Liên kết hỗ trợ thêm

- beginner guide ref
- bài `Hướng dẫn sơ học`
- phụng sự viên / contact địa phương
- video giới thiệu pháp môn

## Module ownership

### `06-calendar`

Sở hữu:

- rule áp ngày
- `dayIdentity`
- compose `advisory (thông báo hoặc gói hướng dẫn) package`
- output cho web/notification

Không sở hữu:

- bài gốc khai thị
- bản dịch gốc của Q&A
- community support directory canonical data

### `09-wisdom-qa`

Sở hữu:

- `sourceRef`
- bài gốc / bài dịch / bài Q&A / bài khai thị
- review status (trạng thái kiểm duyệt)

### `01-content`

Sở hữu:

- beginner guide
- guide hỗ trợ đọc / hành trì
- hub điều hướng

### `07-notification`

Không tự chế advisory (thông báo hoặc gói hướng dẫn).

Chỉ được:

- đọc advisory (thông báo hoặc gói hướng dẫn) package
- chọn phần nào phù hợp để gửi nhắc

## Output shape đề xuất cho read model (mô hình dữ liệu đọc)

Mỗi ngày trong `personalPracticeCalendarReadModel` nên có thêm:

- `advisoryCards`
- `sourceRefs`

## Tại sao không tạo module mới

Vì advisory (thông báo hoặc gói hướng dẫn) không phải owner data mới.
Nó là lớp compose từ:

- ngày âm lịch và special day tags của `Calendar`
- rule gốc được source-backed từ `Wisdom & QA`
- guide nhập môn từ `Content`
- link hỗ trợ địa phương từ lớp community/support ref

## Notes for AI/codegen

- Đừng hard-code text dài vào calendar service (lớp xử lý nghiệp vụ).
- Hãy coi `advisory (thông báo hoặc gói hướng dẫn)` là output được compose từ nhiều record nhỏ.
- Một card hiển thị cho người dùng có thể ngắn, nhưng source-backed data ở dưới phải đầy đủ.

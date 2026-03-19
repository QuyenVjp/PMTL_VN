# Compose Daily Practice advisory (thông báo hoặc gói hướng dẫn)

## Purpose
- Tạo `thông báo tu học trong ngày / daily practice advisory (thông báo hoặc gói hướng dẫn)` từ lịch âm, rule chính thống, bài dịch, và ref hỗ trợ địa phương.

## owner module (module sở hữu)
- `calendar`

## Actors
- `system`
- `admin`

## trigger (điểm kích hoạt)
- user mở `Lịch tu học`
- worker (tiến trình xử lý nền) làm mới `personalPracticeCalendarReadModel`
- admin publish/update một rule special day

## preconditions (điều kiện tiên quyết)
- đã có `lunarEvents` hoặc `dayTags` nền
- đã có source-backed rule refs trong `09-wisdom-qa`
- user timezone hợp lệ nếu advisory (thông báo hoặc gói hướng dẫn) là personal view

## Read set
- `events`
- `lunarEvents`
- `lunarEventOverrides`
- `practice_calendar_rules`
- source-backed rule refs từ `09-wisdom-qa`
- `beginnerGuides` hoặc support refs từ `01-content`
- optional community support refs cho địa phương

## write path (thứ tự ghi dữ liệu chuẩn)
1. Resolve ngày dương và ngày âm cần hiển thị.
2. Tính `dayTags` nền.
3. Chọn bộ `special day rules` phù hợp với ngày đó.
4. Đọc source-backed entries liên quan:
   - bài gốc
   - bài dịch
   - link gốc
   - review status (trạng thái kiểm duyệt)
5. Tách advisory (thông báo hoặc gói hướng dẫn) thành các phần:
   - announcement copy
   - practice recommendations
   - recitation rules
   - time window rules
   - household conditions
   - exception rules
   - support refs
6. Compose `advisoryCards` ngắn gọn cho UI người lớn tuổi.
7. Gắn `sourceRefs` để user mở bài gốc hoặc bài dịch đã duyệt.
8. Ghi vào `personalPracticeCalendarReadModel` hoặc trả về tức thời.

## async (bất đồng bộ) side-effects
- optional:
  - append outbox event cho reminder candidate refresh
  - refresh search/read cache nếu rule vừa được publish

## success result (kết quả thành công)
- user nhìn thấy card ngắn, rõ, đúng ngày
- bên dưới vẫn có source-backed refs để đối chiếu
- notification có thể đọc cùng một output mà không tự tính lại logic

## Errors
- `400`: date window hoặc timezone invalid
- `404`: thiếu source-backed rule bắt buộc cho special day cần compose
- `409`: advisory (thông báo hoặc gói hướng dẫn) rule conflict
- `500`: lỗi compose read model (mô hình dữ liệu đọc)

## Notes
- `community volunteer site` chỉ là support ref hoặc local CTA, không được thay source chính thức.
- card hiển thị phải ngắn, nhưng data model bên dưới phải đủ chi tiết để audit và peer review.
- nếu compose output bị lệch, recovery chuẩn là recompute advisory window từ source data đã duyệt.


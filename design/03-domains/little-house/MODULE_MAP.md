# Little House Module (Mô-đun Ngôi Nhà Nhỏ)

> Ghi chú cho sinh viên:
> Little House (Tiểu Phương Tử / Ngôi Nhà Nhỏ) quản lý toàn bộ lifecycle niệm kinh — từ metadata lock, niệm bài, chấm đỏ, đến hóa (đốt) và kiểm toán.
> Module này không sở hữu nội dung kinh văn — chỉ tracking tiến trình và enforce quy tắc vật lý.

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Little House Module (Mô-đun Ngôi Nhà Nhỏ)

## Objectives (Mục tiêu)
- mô tả ownership của NNN lifecycle: niệm, chấm đỏ, đốt, kiểm toán
- giữ metadata lock và post-completion lock như invariant
- chốt rõ combustion là quy trình kiểm soát chặt, không phải simple confirmation
- giữ fraud detection trong module thay vì ủy quyền cho moderation chung

## Module collections (Các collection thuộc mô-đun)
- `little_houses`
- `little_house_recitations`
- `little_house_completion_records`
- `little_house_dotting_sessions`
- `little_house_combustion_logs`
- `little_house_frauds`

## Current responsibilities (Trách nhiệm hiện tại)

### Little House Core (Ngôi Nhà Nhỏ chính)
- quản lý bản ghi NNN: user, status, ngày bắt đầu, ngày hoàn thành
- enforce pre-recitation metadata lock: `offerTo` và `offeredBy` bắt buộc trước khi niệm
- enforce post-completion date lock: `completion_date` bị khóa sau khi hoàn thành
- hỗ trợ `intended_recipient` cho NNN dâng công đức cho người khác
- status lifecycle: in_progress → recited → ready_to_burn → burnt → completed_audited (hoặc flagged/revoked)

### Recitation Tracking (Theo dõi bài niệm)
- quản lý danh sách bài niệm cho mỗi NNN: Kinh chính, Thần chú Đại Bi, Lời sám hối, Lời khấn dâng, Lời kết lạc
- theo dõi progress: required_count vs current_count
- đánh dấu mandatory vs optional
- metadata lock cho từng bài: khóa trước khi niệm
- recitation status: pending → in_progress → completed → verified

### Completion Records (Bản ghi hoàn thành)
- ghi nhận ngày, giờ hoàn thành chính xác
- xác nhận tất cả bài niệm bắt buộc đã hoàn thành
- giữ reference người ghi nhận

### Red Dot Sessions (Phiên chấm đỏ)
- quản lý phiên tô đỏ theo geometric algorithm (bottom-to-top, ~80%)
- theo dõi dots: expected vs completed
- hỗ trợ multithreaded dotting (nhiều người tô cùng lúc)
- session status: created → in_progress → completed → verified
- giữ supervision notes và người giám sát

### Combustion Logs (Nhật ký hóa/đốt)
- quản lý quy trình đốt NNN với safety checklist bắt buộc
- ghi nhận ash inspection: màu tro, ghi chú kiểm tra, mảnh kim loại
- phát hiện hardware error (lò hỏng)
- combustion status: scheduled → in_progress → ash_inspected → metal_segregated → completed

### Fraud Detection (Phát hiện gian lận)
- phát hiện: niệm chưa đủ, ghi ngày sai, bỏ qua bài bắt buộc, thiêu trước khi niệm xong, tô đỏ giả
- fraud severity: minor → moderate → major → critical
- xác nhận gian lận và revocation (hủy công đức)
- giữ detection method và người xem xét

## Những gì little-house service không được làm
- không sở hữu nội dung kinh văn (script, bản dịch) — thuộc content/wisdom module
- không tự ban account khi phát hiện gian lận — escalate sang moderation
- không sở hữu calendar scheduling cho ngày đốt — thuộc calendar
- không render PDF kinh — chỉ cung cấp metadata cho PDF generator
- không tự tạo push notification — chỉ là source data cho notification module

## External references (Tham chiếu ngoài mô-đun)

### Content / Wisdom
- nội dung kinh văn (Địa Tạng Kinh, Đại Bi, sám hối) thuộc content module
- little-house chỉ tham chiếu metadata: tên bài, required_count

### Sacred Forms
- name change probation timer ảnh hưởng cách viết "Kính Tặng" trong NNN
- trong 100 ngày probation, auto-format: "Người cần kinh của Tên Mới (Tên Cũ)"

### Calendar
- ngày đốt NNN có thể liên quan đến ngày đặc biệt trong calendar
- calendar advisory có thể khuyến nghị thời điểm đốt

### Engagement
- practice history (số NNN đã hoàn thành) thuộc engagement tracking
- streak và milestone tracking tham chiếu NNN completion records

## Current rules (Quy tắc hiện tại)
- metadata lock (`offerTo`, `offeredBy`) bắt buộc trước khi niệm — ngoại trừ Niệm Tích Lũy Dự Phòng
- post-completion date lock không ai có thể override — kể cả admin
- chấm đỏ phải dùng bút lông đỏ, chấm từ dưới lên trên, ~80% vòng tròn
- combustion phải dùng nhíp/đũa, kẹp tại "Kính Tặng", giấy cháy 100%
- fraud revocation là hủy công đức — hành động cuối cùng, cần admin xác nhận
- NNN status lifecycle không cho phép nhảy cóc: phải đi qua từng bước tuần tự

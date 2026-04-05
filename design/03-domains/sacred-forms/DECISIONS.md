# Sacred Forms Module Decisions

> Ghi chú cho sinh viên:
> Module này quản lý hình thức tôn kính — đổi pháp danh, xuất gia, phát nguyện, đơn khuyến đạo.
> Điểm khó là phân biệt `form_disposals` (xử lý hình thức cũ) — có hai loại đơn hoàn toàn ngược chiều:
> Đơn Đổi Tên BẮT BUỘC ĐỐT, Đơn Khuyến Đạo TUYỆT ĐỐI CẤM ĐỐT.

## Decision 1. Form disposal polarity là hard-block enforcement, không phải soft guidance

### Context

Hai loại đơn có quy tắc xử lý hoàn toàn ngược chiều:
- Đơn Thăng Văn Đổi Tên: BẮT BUỘC ĐỐT (burn) vào ngày nắng, lúc 6am/8am/4pm.
- Đơn Khuyến Đạo Người Nhà: TUYỆT ĐỐI CẤM ĐỐT — để trên bàn thờ 1-2 tháng, sau đó bọc phong bì vứt đi.

### Decision

- `form_disposals.disposal_type` phải match với `sacred_forms.form_type` theo polarity rule.
- Đốt đơn Khuyến Đạo → hệ thống hard-block, trả error rõ ràng.
- Không đốt đơn Đổi Tên → hệ thống cảnh báo và block transition sang completed.
- UI hiển thị polarity rõ ràng: icon lửa cho đơn phải đốt, icon cấm lửa cho đơn cấm đốt.

### Rationale

- Sai polarity → hậu quả tâm linh cực kỳ nghiêm trọng (vong linh thoát, tên không được ghi vào Sổ Nam Tào).
- Không thể dựa vào user tự nhớ — hệ thống phải enforce.

### Trade-off

- Cần mapping rõ ràng giữa form_type và allowed disposal_type.
- Nếu thêm form_type mới, phải cập nhật polarity mapping.

## Decision 2. Name change probation timer là 100 ngày, system-managed

### Context

Sau khi đốt đơn đổi tên, cần 100 ngày để tên mới có tính linh động ở linh giới. Trong thời gian này, NNN phải viết dạng "Tên Mới (Tên Cũ)".

### Decision

- `name_change_probations` tạo automatically khi đơn đổi tên được đốt thành công.
- `probation_duration_days = 100` mặc định.
- Hệ thống tự unlock vào ngày 101 qua daily cronjob.
- Trong probation, auto-inject interim alias vào NNN PDF: "Người cần kinh của Tên Mới (Tên Cũ)".

### Rationale

- Timer phải chính xác — không thể dựa vào user đếm ngày.
- Auto-inject đảm bảo NNN luôn đúng format trong probation.

### Trade-off

- Cronjob cần chạy đáng tin cậy — nếu miss, user bị delay unlock.
- Auto-inject vào NNN PDF cần integration với little-house module.

## Decision 3. Family form prerequisite gate là progressive unlock, không phải instant access

### Context

Đơn Khuyến Đạo Người Nhà yêu cầu user đã tụng 7 biến Tâm Kinh mỗi ngày, liên tục >= 30 ngày cho người nhà cụ thể.

### Decision

- Nút "Tạo Đơn Khuyến Đạo" bị khóa mặc định.
- Hệ thống kiểm tra practice history từ engagement module để xác nhận đủ điều kiện.
- `form_prerequisites` giữ danh sách điều kiện cho mỗi loại form.
- `form_prerequisite_validations` ghi nhận kết quả xác nhận cho mỗi applicant.

### Rationale

- Công đức cần tích lũy trước khi có thể "mở cửa" cho người khác.
- Progressive unlock tạo motivation cho user tu tập đủ.

### Trade-off

- Phụ thuộc vào engagement module cung cấp practice history chính xác.
- User có thể không hiểu tại sao bị khóa nếu không đọc hướng dẫn.

## Decision 4. Burn conditions (thời tiết + thời gian) là advisory gate, không phải absolute block

### Context

Đơn Đổi Tên phải đốt vào ngày nắng, lúc 6am/8am/4pm. Nhưng thời tiết không thể dự đoán chính xác.

### Decision

- Hệ thống kiểm tra thời gian (time gate): chỉ cho phép 06:00-07:00, 08:00-09:00, 16:00-17:00.
- Thời tiết (weather gate): hiển thị advisory mạnh, nhưng cho phép user override với confirmation.
- Time gate là hard-block. Weather gate là soft-block với override.

### Rationale

- Thời gian có thể enforce chính xác.
- Thời tiết phụ thuộc vào vị trí, API, và user judgment — hard-block có thể gây frustration sai.

### Trade-off

- Weather override cần user xác nhận bằng checkbox: "Tôi xác nhận trời đang nắng tại vị trí của tôi".
- Nếu weather API không khả dụng, fallback sang user self-report.

## Decision 5. Applicant lifecycle là multi-step review, không phải auto-approve

### Context

Đơn xin hình thức tôn kính cần được admin hoặc tu sĩ xem xét trước khi chấp thuận.

### Decision

- `form_applicants.status` lifecycle: submitted → under_review → approved → completed (hoặc rejected/cancelled).
- Admin/monk reviewer xem xét prerequisite validations và evidence.
- Không auto-approve bất kỳ form type nào.

### Rationale

- Hình thức tôn kính là quyết định tâm linh quan trọng — cần human review.
- Giảm rủi ro approve đơn chưa đủ điều kiện.

### Trade-off

- Review time có thể gây delay cho applicant.
- Cần đủ reviewer (admin/monk) để xử lý queue kịp thời.

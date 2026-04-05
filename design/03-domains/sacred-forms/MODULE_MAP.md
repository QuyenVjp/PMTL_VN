# Sacred Forms Module (Mô-đun Hình Thức Tôn Kính)

> Ghi chú cho sinh viên:
> Sacred Forms quản lý hình thức tôn kính — đổi pháp danh, xuất gia, giới tại, phát nguyện đặc biệt, đơn khuyến đạo.
> Module này không sở hữu nội dung lễ — chỉ quản lý application lifecycle, prerequisite gate, và disposal polarity.

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Sacred Forms Module (Mô-đun Hình Thức Tôn Kính)

## Objectives (Mục tiêu)
- mô tả ownership của form definitions, applicant lifecycle, prerequisite validation, và disposal polarity
- giữ disposal polarity enforcement (đốt vs cấm đốt) như invariant tuyệt đối
- chốt rõ name change probation timer là system-managed 100 ngày
- phối hợp với engagement cho prerequisite gate validation và little-house cho interim alias

## Module collections (Các collection thuộc mô-đun)
- `sacred_forms`
- `form_prerequisites`
- `form_applicants`
- `form_prerequisite_validations`
- `form_disposals`
- `name_change_probations`

## Current responsibilities (Trách nhiệm hiện tại)

### Sacred Forms Core (Hình thức tôn kính chính)
- quản lý định nghĩa hình thức: đổi pháp danh, xuất gia/Đại Tràng Đầu, giới tại, phát nguyện đặc biệt
- giữ thông tin: loại hình thức, mô tả, yêu cầu lễ, ceremony template
- quản lý trạng thái active/inactive cho mỗi form type

### Prerequisite Gate (Điều kiện tiên quyết)
- quản lý danh sách điều kiện cho mỗi loại form: đồng ý gia đình, tuổi tối thiểu, thời gian tu tập, sẵn sàng tâm linh
- phân biệt mandatory vs optional prerequisites
- giữ verification method cho mỗi điều kiện (giấy xác nhận, khai báo)
- hỗ trợ waive cho trường hợp đặc biệt

### Applicant Management (Quản lý đơn xin)
- quản lý lifecycle đơn xin: submitted → under_review → approved → completed (hoặc rejected/cancelled)
- giữ thông tin reviewer (admin/monk) và lý do từ chối
- liên kết prerequisite validations cho mỗi applicant

### Prerequisite Validation (Xác nhận điều kiện)
- ghi nhận kết quả xác nhận cho mỗi điều kiện của mỗi applicant
- validation status: not_met → pending → met (hoặc waived)
- giữ evidence note và người xác nhận

### Disposal Polarity (Xử lý hình thức cũ)
- quản lý xử lý hình thức cũ theo polarity rule:
  - Đơn Đổi Tên → BẮT BUỘC ĐỐT (safe_incineration)
  - Đơn Khuyến Đạo → TUYỆT ĐỐI CẤM ĐỐT (archival hoặc sealing_ceremony)
- hỗ trợ disposal types: sealing_ceremony, safe_incineration, donation, archival
- enforce burn conditions: thời tiết (nắng), thời gian (6am/8am/4pm)
- giữ supervision notes và người giám sát

### Name Change Probation (Probation đổi tên)
- tạo 100-day probation timer tự động khi đốt đơn đổi tên thành công
- theo dõi: pháp danh cũ, pháp danh mới, ngày bắt đầu/kết thúc
- auto-unlock qua daily cronjob vào ngày 101
- giữ restriction details trong giai đoạn probation
- liên kết với little-house cho interim alias auto-inject

## Những gì sacred-forms service không được làm
- không sở hữu nội dung lễ (ceremony script, ritual text) — thuộc content/wisdom module
- không sở hữu practice history để validate prerequisites — phải query engagement module
- không tự sửa NNN metadata — chỉ cung cấp probation data cho little-house module đọc
- không tự gửi notification — chỉ là source data cho notification module
- không auto-approve bất kỳ form type nào — luôn cần human review

## External references (Tham chiếu ngoài mô-đun)

### Little House
- name change probation ảnh hưởng cách viết "Kính Tặng" trong NNN
- little-house module đọc probation data để auto-format interim alias
- probation active → NNN PDF format: "Người cần kinh của Tên Mới (Tên Cũ)"

### Engagement
- prerequisite gate query practice history từ engagement
- Đơn Khuyến Đạo yêu cầu 7 biến Tâm Kinh × 30 ngày liên tục → engagement module verify

### Calendar
- burn time gate (6am/8am/4pm) sử dụng timezone từ user profile
- ngày đốt có thể liên quan đến ngày đặc biệt trong calendar

### Vows / Merit
- phát nguyện đặc biệt (special_vow) có thể liên kết với vows-merit module
- giới tại (ordination) tracking vow compliance

## Current rules (Quy tắc hiện tại)
- disposal polarity là hard-block enforcement: đốt nhầm loại = hệ thống chặn
- name change probation = 100 ngày, auto-unlock vào ngày 101
- burn time gate = hard-block: chỉ 06:00-07:00, 08:00-09:00, 16:00-17:00
- burn weather gate = soft-block: advisory + user confirmation override
- prerequisite gate cho Đơn Khuyến Đạo: 7 biến Tâm Kinh × 30 ngày liên tục
- applicant lifecycle = multi-step human review, không auto-approve
- prerequisite validation hỗ trợ waive cho trường hợp đặc biệt (cần admin approval)

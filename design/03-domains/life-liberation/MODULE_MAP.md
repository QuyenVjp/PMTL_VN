# Life Liberation Module (Mô-đun Phóng Sinh)

> Ghi chú cho sinh viên:
> Life Liberation quản lý toàn bộ lifecycle phóng sinh — từ lập kế hoạch, chọn loài, xác nhận habitat, thả, đến kiểm toán tử vong.
> Module này không sở hữu event scheduling — thuộc events hoặc calendar. Life Liberation sở hữu release data và ritual protocol.

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Life Liberation Module (Mô-đun Phóng Sinh)

## Objectives (Mục tiêu)
- mô tả ownership của release data, species validation, proxy mode, và mortality audit
- giữ predatory species ban như hard-block invariant
- chốt rõ proxy silence lock và money transfer protocol là bước bắt buộc
- phối hợp với events cho mass life liberation state machine

## Module collections (Các collection thuộc mô-đun)
- `life_releases`
- `life_release_candidates`
- `proxy_life_releases`
- `life_release_dedications`
- `life_release_audits`

## Current responsibilities (Trách nhiệm hiện tại)

### Life Release Core (Phóng sinh chính)
- quản lý bản ghi phóng sinh: loại sinh vật, số lượng, địa điểm, ngày giờ
- theo dõi trạng thái: planned → in_progress → completed → audited (hoặc failed)
- giữ thông tin người khởi tạo/tài trợ và người giám sát
- hỗ trợ nhiều loại sinh vật: cá, tôm, chim, côn trùng

### Species Candidate Management (Quản lý danh sách sinh vật)
- quản lý danh sách loài cho mỗi lần phóng sinh
- đánh dấu loài ăn thịt bị cấm (cá trê, cá lóc, ba ba hung dữ)
- enforce habitat verification cho loài ăn thịt
- giữ giá/con, chi phí tổng cho mỗi loài

### Proxy Liberation (Phóng sinh thay)
- quản lý phóng sinh thay cho người khác (bệnh nặng, tuổi cao, hoàn cảnh khó khăn)
- enforce silence lock: ẩn tên proxy volunteer, chỉ hiển thị tên beneficiary
- hỗ trợ 3 cấp ẩn danh: full_anonymity, sponsor_anonymous, mutual_known
- hiển thị cảnh báo lớn nhắc nhở không nhắc tên mình tại hồ

### Dedication & Money Transfer (Khấn dâng và chuyển giao tiền)
- quản lý khấn dâng công đức cho người cụ thể
- enforce money transfer protocol khi dùng tiền riêng cho người khác
- theo dõi phương thức chuyển giao (Zalo Pay, bank, tiền mặt)
- ghi nhận altar dedication (khấn tại bàn thờ)

### Mortality Audit (Kiểm toán tử vong)
- ghi nhận tỷ lệ tử vong sau phóng sinh
- theo dõi compensation status: none → minor_loss → acceptable_loss → excessive_loss → compensated
- giữ auditor notes và người kiểm toán
- ghi nhận số lượng và chi phí bù đắp nếu cần

## Những gì life-liberation service không được làm
- không tự schedule event phóng sinh tập thể — thuộc events module
- không sở hữu geofence/GPS logic cho mass liberation — thuộc events
- không sở hữu calendar recurrence cho ngày phóng sinh — thuộc calendar
- không tự ban account khi phát hiện vi phạm species — escalate sang moderation
- không copy giá trị tài chính chi tiết — chỉ giữ audit reference cho money transfer

## External references (Tham chiếu ngoài mô-đun)

### Events
- mass life liberation events thuộc events module
- life-liberation cung cấp release details cho event state machine
- events sở hữu participant management và geofence logic

### Calendar
- ngày phóng sinh đặc biệt (ngày vía, ngày trai giới) thuộc calendar
- calendar advisory có thể khuyến nghị phóng sinh vào ngày cụ thể

### Dharma Compliance
- `user_charity_interactions.interaction_type = 'life_release'` tham chiếu sang life release record
- tổ chức từ thiện hỗ trợ phóng sinh phải nằm trong charity whitelist

### Engagement
- practice history và user preference về phóng sinh thuộc engagement module
- proxy release protocol được engagement theo dõi cho merit tracking

## Current rules (Quy tắc hiện tại)
- predatory species ban là hard-block, không phải soft warning
- proxy silence lock mặc định bật cho mọi proxy release
- money transfer protocol bắt buộc khi dùng tiền riêng cho người khác
- mortality compensation là recommendation từ auditor, không phải auto-triggered
- anonymity mode mặc định là full_anonymity
- follow-up check sau 30 ngày cho phóng sinh loài ăn thịt
- tất cả phóng sinh loài ăn thịt đều ghi audit log đặc biệt với riskLevel: HIGH

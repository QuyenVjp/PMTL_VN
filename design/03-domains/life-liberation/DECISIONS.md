# Life Liberation Module Decisions

> Ghi chú cho sinh viên:
> Module này quản lý phóng sinh — từ lập kế hoạch, chọn loài, thả, đến kiểm toán.
> Điểm khó là phân biệt `proxy_life_releases` (phóng sinh thay người khác) với `life_release_dedications` (khấn dâng công đức).
> Một cái là cơ chế ẩn danh/đại diện, một cái là chuyển giao công đức cho người khác.

## Decision 1. Predatory species ban là hard-block, không phải soft warning

### Context

Thả loài ăn thịt (cá lóc, cá trê) vào hồ có cá nhỏ tạo ra lò sát sinh dưới nước — Bồ Tát không ghi nhận công đức.

### Decision

- `life_release_candidates.is_predatory_banned = true` → hard-block nếu habitat không đủ an toàn.
- User phải xác nhận habitat verification (vùng nước cực lớn, sâu, không có cá nhỏ) trước khi tiếp tục.
- Nếu habitat không phù hợp, nút "Bắt Đầu Phóng Sinh" bị khóa hoàn toàn.

### Rationale

- Hậu quả nghiệp rất nghiêm trọng — không thể để user bỏ qua cảnh báo.
- Hard-block bảo vệ cả user lẫn sinh vật.

### Trade-off

- UX friction cao hơn cho user muốn phóng sinh loài ăn thịt hợp lệ.
- Cần danh sách species predatory chính xác và cập nhật.

## Decision 2. Proxy liberation phải enforce silence lock tuyệt đối

### Context

Khi phóng sinh thay người khác bằng tiền của họ, Phụng sự viên tuyệt đối cấm nhắc tên mình tại hồ. Nếu lỡ nhắc, một phần công đức chạy ngược về phía Phụng sự viên.

### Decision

- `proxy_life_releases.sponsor_silence_lock = true` mặc định cho proxy mode.
- UI phải ẩn tên proxy volunteer và chỉ hiển thị tên beneficiary.
- Cảnh báo nhấp nháy lớn, rõ ràng nhắc nhở không nhắc tên mình.
- Recitation script chỉ chứa tên beneficiary, không chứa tên volunteer.

### Rationale

- Quy tắc tâm linh cốt lõi — nếu sai, hậu quả nghiệp nghiêm trọng.
- Hệ thống phải hỗ trợ tối đa thay vì để user tự nhớ.

### Trade-off

- UI cần trạng thái đặc biệt cho proxy mode.
- Nếu volunteer cần ký tên cho audit (offline), cần cơ chế riêng không hiển thị trên recitation screen.

## Decision 3. Money transfer protocol là bước bắt buộc trước proxy release

### Context

Nếu dùng tiền riêng để mua cá phóng sinh cho người nhà, phải khấn chuyển giao tiền sang cho người nhận trước khi đi.

### Decision

- `life_release_dedications.money_transfer_required = true` khi dùng tiền riêng cho người khác.
- Hệ thống phải hiển thị ritual guide: khấn tại bàn thờ, xin Bồ Tát chuyển tiền.
- Không cho phép bắt đầu phóng sinh nếu money transfer chưa confirmed.

### Rationale

- Quy tắc chuyển giao tiền là tiền đề cho công đức được ghi nhận đúng người.
- Hệ thống enforce thứ tự nghi lễ.

### Trade-off

- Thêm bước trong flow, tăng friction.
- User có thể confirm mà không thực sự thực hiện ritual — hệ thống không thể verify offline action.

## Decision 4. Mortality compensation là audit concern, không phải auto-correction

### Context

Sau phóng sinh, nếu tỷ lệ tử vong > 10%, cần bù đắp bằng cách phóng sinh thêm.

### Decision

- `life_release_audits` ghi nhận mortality observation.
- `mortality_compensation_status` theo dõi: none → minor_loss → acceptable_loss → excessive_loss → compensated.
- Bù đắp là recommendation từ auditor, không phải auto-triggered action.

### Rationale

- Mortality observation cần con người xác nhận — không thể auto-detect.
- Auditor quyết định có cần bù đắp hay không dựa trên context.

### Trade-off

- Phụ thuộc vào auditor input — có thể bị bỏ sót nếu audit không được thực hiện.

## Decision 5. Anonymity mode là ba cấp, không phải binary

### Context

Proxy life release có nhiều mức ẩn danh khác nhau tùy theo mong muốn của sponsor và beneficiary.

### Decision

- `proxy_release_mode_enum`: full_anonymity, sponsor_anonymous, mutual_known.
- `full_anonymity`: không ai biết ai — cả sponsor lẫn beneficiary đều ẩn.
- `sponsor_anonymous`: sponsor ẩn, beneficiary biết ai phóng sinh thay mình.
- `mutual_known`: cả hai đều biết nhau.

### Rationale

- Linh hoạt cho nhiều hoàn cảnh thực tế.
- full_anonymity là mặc định để bảo vệ công đức tối đa.

### Trade-off

- UI cần xử lý 3 trạng thái hiển thị khác nhau.
- beneficiary_contact_allowed phải phối hợp chặt với anonymity mode.

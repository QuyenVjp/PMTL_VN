# Little House Module Decisions

> Ghi chú cho sinh viên:
> Module này quản lý Ngôi Nhà Nhỏ (Tiểu Phương Tử) — lifecycle từ niệm kinh, chấm đỏ, đến hóa (đốt).
> Điểm khó là phân biệt `little_house_recitations` (bài niệm cần hoàn thành) với `little_house_completion_records` (bản ghi hoàn thành tổng thể).
> Một cái là tracking từng bài, một cái là xác nhận toàn bộ Ngôi Nhà Nhỏ đã xong.

## Decision 1. Pre-recitation metadata lock là hard-block, không phải soft reminder

### Context

"Kính Tặng" và "Người Tặng" bắt buộc phải được viết trước khi bắt đầu niệm. Nếu không viết trước, Kinh văn có thể bị linh giới lấy mất.

### Decision

- Trường `offerTo` và `offeredBy` phải có giá trị hợp lệ trước khi cho phép bắt đầu đếm Kinh.
- Backend trả `400 METADATA_REQUIRED_BEFORE_RECITATION` nếu cố bypass frontend.
- Sau khi bắt đầu niệm, hai trường này bị khóa read-only (`is_post_completion_locked`).

### Rationale

- Hậu quả tâm linh nghiêm trọng — không thể để user bỏ qua.
- Lock sau khi bắt đầu ngăn chỉnh sửa retroactive.

### Trade-off

- UX friction cho user mới chưa quen quy trình.
- Ngoại lệ: "Niệm Tích Lũy Dự Phòng" được bypass metadata requirement.

## Decision 2. Red dot (chấm đỏ) tuân thủ geometric algorithm, không phải free-form

### Context

Chấm đỏ lên Ngôi Nhà Nhỏ phải theo quy tắc: bút lông đỏ, chấm từ dưới lên trên, điền ~80% vòng tròn, không tô kín 100%.

### Decision

- `little_house_dotting_sessions` ghi nhận phiên tô đỏ với trạng thái lifecycle.
- UI hiển thị animation hướng dẫn bottom-to-top.
- Hỗ trợ multithreaded dotting (nhiều người tô cùng lúc).
- Session status lifecycle: created → in_progress → completed → verified.

### Rationale

- Cách chấm biểu tượng cho xây dựng công đức — sai cách = mất hiệu quả.
- Animation guide giúp user mới thực hiện đúng.

### Trade-off

- Hệ thống không thể verify offline action — phụ thuộc vào user tự giác.
- Multithreaded dotting tăng phức tạp tracking.

## Decision 3. Combustion (hóa/đốt) là quy trình kiểm soát chặt, không phải simple confirmation

### Context

Hóa Ngôi Nhà Nhỏ có quy tắc vật lý nghiêm ngặt: dùng nhíp/đũa (không tay trần), kẹp tại "Kính Tặng" (không kẹp chấm đỏ), giấy phải cháy 100%.

### Decision

- `little_house_combustion_logs` ghi nhận toàn bộ quy trình đốt.
- Pre-combustion safety checklist bắt buộc (hard-stop checkboxes).
- Ash inspection ghi nhận: màu tro, độ sạch, mảnh kim loại.
- Hardware error detection (lò bị hỏng) được ghi nhận riêng.

### Rationale

- Tay trần, kẹp chấm đỏ, giấy chưa cháy hết → mất công đức.
- Checklist enforce quy tắc trước khi user confirm "Đã Đốt".

### Trade-off

- Nhiều bước xác nhận tăng UX friction.
- Ash inspection là self-reported — hệ thống tin tưởng user input.

## Decision 4. Fraud detection thuộc little-house, không phải moderation chung

### Context

Gian lận Ngôi Nhà Nhỏ (niệm chưa đủ, ghi ngày sai, bỏ qua bài bắt buộc, thiêu trước khi niệm xong) cần phát hiện và xử lý chuyên biệt.

### Decision

- `little_house_frauds` thuộc sở hữu little-house module.
- Fraud severity: minor → moderate → major → critical.
- Fraud detection qua audit, report, system check.
- Revocation (hủy công đức) là hành động cuối cùng khi xác nhận gian lận.

### Rationale

- Gian lận NNN gắn chặt với domain-specific rules (bài niệm, thứ tự, chấm đỏ).
- Moderation chung không có context để đánh giá.

### Trade-off

- Cần phối hợp moderation nếu gian lận dẫn đến hành động tài khoản.

## Decision 5. Post-completion date lock ngăn chỉnh sửa ngày hoàn thành

### Context

Ngày hoàn thành niệm kinh có ý nghĩa tâm linh — ghi sai ngày ảnh hưởng đến hiệu quả.

### Decision

- Sau khi NNN chuyển sang status `recited` hoặc cao hơn, `completion_date` bị khóa.
- `is_post_completion_locked = true` và `locked_at` ghi timestamp khóa.
- Không ai (kể cả admin) có thể sửa completion_date sau khi khóa — chỉ có thể tạo mới.

### Rationale

- Ngăn chỉnh sửa retroactive — bảo vệ tính toàn vẹn công đức.
- Audit trail rõ ràng.

### Trade-off

- Nếu user nhập sai ngày trước khi khóa, phải tạo NNN mới.
- Admin cần cơ chế fraud flag thay vì sửa trực tiếp.

# Dharma Compliance Module Decisions

> Ghi chú cho sinh viên:
> Module này quản lý tính tuân thủ Pháp — whitelist tổ chức từ thiện, phát hiện gian lận, và kiểm soát tương tác quyên góp.
> Điểm khó là phân biệt `charity_whitelist` (danh sách tổ chức hợp lệ) với `fraud_detection_alerts` (cảnh báo gian lận).

## Decision 1. Charity whitelist là canonical owner cho danh sách tổ chức từ thiện hợp lệ

### Context

Hệ thống cần một nguồn dữ liệu duy nhất xác định tổ chức từ thiện nào được phép nhận quyên góp/trợ ấn.

### Decision

- `charity_whitelist` là bảng canonical cho tổ chức từ thiện đã xác minh.
- Mọi kiểm tra hợp lệ quyên góp phải đối chiếu với bảng này.
- Không tạo danh sách song song ở module khác.

### Rationale

- Một nguồn sự thật duy nhất tránh xung đột dữ liệu.
- Admin chỉ cần quản lý tại một nơi.

### Trade-off

- Mọi module cần validate tổ chức từ thiện phải query sang dharma-compliance.

## Decision 2. Phát hiện gian lận là trách nhiệm của dharma-compliance, không phải moderation

### Context

Gian lận từ thiện (kêu gọi quyên góp vào tài khoản cá nhân, lợi dụng cộng đồng) cần cơ chế phát hiện và xử lý chuyên biệt.

### Decision

- `fraud_detection_alerts` thuộc sở hữu dharma-compliance.
- Moderation module chỉ nhận escalation từ dharma-compliance khi cần hành động tài khoản (mute, ban).
- dharma-compliance sở hữu logic phát hiện regex, pattern matching, và whitelisting.

### Rationale

- Tách biệt phát hiện gian lận từ thiện (domain-specific) khỏi moderation chung.
- Logic regex bank account, buzzword detection gắn chặt với nghiệp vụ từ thiện Pháp Môn.

### Trade-off

- Cần coordination giữa dharma-compliance và moderation khi escalate xử lý tài khoản.

## Decision 3. Whitelisting rules là multi-criteria verification, không phải single-flag

### Context

Mỗi tổ chức từ thiện cần được xác minh qua nhiều tiêu chí (đăng ký pháp lý, minh bạch tài chính, xác nhận tu sĩ, v.v.).

### Decision

- `charity_whitelisting_rules` giữ từng tiêu chí riêng biệt cho mỗi tổ chức.
- Trạng thái whitelist được tổng hợp từ tập hợp tiêu chí, không phải từ một flag đơn.
- Mỗi tiêu chí có `is_satisfied`, `evidence_url`, `verified_date`.

### Rationale

- Audit trail rõ ràng cho từng tiêu chí.
- Admin có thể xem chi tiết tổ chức đáp ứng bao nhiêu tiêu chí.

### Trade-off

- Write path phức tạp hơn single boolean.
- Cần aggregation logic để xác định overall whitelist status.

## Decision 4. User-charity interaction log là audit record, không phải engagement state

### Context

`user_charity_interactions` ghi lại lịch sử tương tác (quyên góp, phóng sinh, tình nguyện) giữa user và tổ chức.

### Decision

- dharma-compliance chỉ giữ audit log tương tác.
- Engagement state (preference, history, streak) vẫn thuộc engagement module.
- `reference_id` trong interaction chỉ tham chiếu sang record gốc ở module khác.

### Rationale

- Tránh dharma-compliance ôm user-state.
- Giữ ranh giới trách nhiệm sạch.

### Trade-off

- Một số báo cáo cần join dữ liệu từ cả dharma-compliance và engagement.

## Decision 5. Auto-delete content vi phạm phải đi kèm audit log và notification

### Context

Khi phát hiện kêu gọi quyên góp vào tài khoản cá nhân, hệ thống cần phản ứng tức thì.

### Decision

- Content vi phạm bị auto-delete ngay lập tức.
- Mọi auto-delete phải ghi audit log với `eventType`, `userId`, `detectedAccount`, `content` (truncated).
- User phải nhận notification giải thích lý do và hướng dẫn cách quyên góp hợp lệ.
- Tái phạm 3+ lần trong 30 ngày → escalate sang moderation để hạ quyền.

### Rationale

- Bảo vệ cộng đồng khỏi gian lận từ thiện.
- Giáo dục người dùng thay vì chỉ trừng phạt.
- Audit trail cho mọi hành động enforcement.

### Trade-off

- False positive có thể xóa nhầm nội dung hợp lệ → cần cơ chế appeal.

# Dharma Compliance Module (Mô-đun Tuân Thủ Pháp)

> Ghi chú cho sinh viên:
> Dharma Compliance quản lý tính hợp pháp của tổ chức từ thiện, phát hiện gian lận, và kiểm soát quyên góp.
> Module này không tự xử lý moderation tài khoản — nó chỉ phát hiện và escalate.

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Dharma Compliance Module (Mô-đun Tuân Thủ Pháp)

## Objectives (Mục tiêu)
- mô tả ownership của charity whitelist, fraud detection, và interaction audit
- giữ enforcement logic (regex, pattern matching, buzzword detection) trong module
- chốt rõ `user_charity_interactions` là audit record, không phải engagement state
- phối hợp với moderation cho hành động tài khoản (mute, ban, role downgrade)

## Module collections (Các collection thuộc mô-đun)
- `charity_whitelist`
- `charity_whitelisting_rules`
- `fraud_detection_alerts`
- `user_charity_interactions`

## Current responsibilities (Trách nhiệm hiện tại)

### Charity Whitelist (Danh sách tổ chức từ thiện hợp lệ)
- quản lý danh sách tổ chức từ thiện được chứng thực
- giữ trạng thái whitelist: pending_verification, verified, suspended, revoked
- hỗ trợ nhiều loại tổ chức: chùa Phật giáo, tổ chức bảo vệ động vật, cứu trợ thảm họa, v.v.
- giữ thông tin liên hệ, đăng ký pháp lý, website

### Whitelisting Rules (Tiêu chí xác minh)
- quản lý tiêu chí xác minh cho từng tổ chức
- hỗ trợ nhiều loại tiêu chí: đăng ký pháp lý, minh bạch tài chính, xác nhận tu sĩ, lịch sử hoạt động
- giữ evidence URL, ngày xác minh, người xác minh
- tổng hợp kết quả tiêu chí để cập nhật whitelist status

### Fraud Detection (Phát hiện gian lận)
- phát hiện bank account regex trong nội dung user (bài viết, bình luận, chat)
- đối chiếu tài khoản phát hiện được với whitelist
- phát hiện buzzword fundraising cá nhân (quyên góp, chuyển khoản cá nhân, tài khoản riêng)
- tạo alert với severity: low, medium, high, critical
- hỗ trợ nhiều loại alert: fake_organization, account_anomaly, pattern_mismatch, phishing_attempt

### User Interaction Audit (Kiểm toán tương tác)
- ghi lại lịch sử tương tác user với tổ chức từ thiện
- hỗ trợ nhiều loại tương tác: donation, life_release, volunteering
- giữ reference_id tham chiếu sang record gốc ở module khác
- xác minh tương tác khi cần

## Những gì dharma-compliance service không được làm
- không tự xử lý moderation tài khoản (mute, ban) — phải escalate sang moderation
- không sở hữu engagement state hoặc user preference
- không copy dữ liệu giao dịch tài chính chi tiết — chỉ giữ audit reference
- không override quyết định của moderation module về hành động tài khoản

## External references (Tham chiếu ngoài mô-đun)

### Moderation
- dharma-compliance escalate vi phạm sang moderation queue
- moderation thực hiện hành động tài khoản (mute, ban, role downgrade)

### Community / Content
- dharma-compliance intercept nội dung user (bài viết, bình luận) qua NestJS interceptor
- content module nhận kết quả enforcement (auto-delete, block)

### Life Liberation
- `user_charity_interactions.interaction_type = 'life_release'` tham chiếu phóng sinh record

### Events
- tổ chức từ thiện có thể liên kết với event hoặc donation campaign

## Current rules (Quy tắc hiện tại)
- charity whitelist là nguồn sự thật duy nhất cho tổ chức hợp lệ
- fraud detection nằm trong dharma-compliance, không phải moderation
- auto-delete content vi phạm phải ghi audit log và gửi notification
- tái phạm 3+ lần trong 30 ngày → escalate hạ quyền tài khoản
- mọi khoản trợ ấn Kinh sách chỉ được chuyển vào tài khoản từ thiện chính thức
- không cá nhân nào được kêu gọi quyên góp vào tài khoản riêng

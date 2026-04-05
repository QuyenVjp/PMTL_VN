# Dharma Compliance Contracts

## Owner data

- `charity_whitelist`
- `charity_whitelisting_rules`
- `fraud_detection_alerts`
- `user_charity_interactions`

## Public routes

- `GET /api/dharma-compliance/approved-accounts`
- `GET /api/dharma-compliance/charities`
- `GET /api/dharma-compliance/charities/:publicId`

## Admin routes

- `GET /api/admin/dharma-compliance/charities`
- `GET /api/admin/dharma-compliance/charities/:publicId`
- `POST /api/admin/dharma-compliance/charities`
- `PATCH /api/admin/dharma-compliance/charities/:publicId`
- `POST /api/admin/dharma-compliance/charities/:publicId/verify`
- `POST /api/admin/dharma-compliance/charities/:publicId/suspend`
- `POST /api/admin/dharma-compliance/charities/:publicId/revoke`
- `GET /api/admin/dharma-compliance/charities/:publicId/rules`
- `POST /api/admin/dharma-compliance/charities/:publicId/rules`
- `PATCH /api/admin/dharma-compliance/charities/:publicId/rules/:rulePublicId`
- `GET /api/admin/dharma-compliance/fraud-alerts`
- `GET /api/admin/dharma-compliance/fraud-alerts/:publicId`
- `PATCH /api/admin/dharma-compliance/fraud-alerts/:publicId/resolve`
- `GET /api/admin/dharma-compliance/interactions`
- `GET /api/admin/dharma-compliance/status`

## Canonical rules

- charity whitelist là nguồn sự thật duy nhất cho tổ chức từ thiện hợp lệ; không tạo danh sách song song ở module khác
- mọi khoản trợ ấn Kinh sách, quyên góp chỉ được chuyển vào tài khoản từ thiện chính thức đã verified trong whitelist
- tuyệt đối cấm cá nhân kêu gọi quyên góp vào tài khoản riêng — hệ thống phải auto-detect và auto-delete
- bank account regex detection chạy trên mọi nội dung user-generated (bài viết, bình luận, chat) qua NestJS interceptor
- tài khoản phát hiện phải được đối chiếu với whitelist trước khi quyết định block hay allow
- auto-delete content vi phạm phải đi kèm:
  - audit log với `eventType`, `userId`, `detectedAccount`, `content` (truncated)
  - notification giải thích lý do + hướng dẫn quyên góp chính thức
- tái phạm 3+ lần trong 30 ngày → escalate sang moderation để hạ quyền VOLUNTEER → MEMBER
- fraud alert severity: low (gợi ý cảnh báo), medium (yêu cầu xác minh), high (cần xét duyệt), critical (chặn ngay)
- whitelist status lifecycle: pending_verification → verified → (suspended | revoked)
- suspended có thể quay lại verified sau khi vấn đề được giải quyết
- revoked là trạng thái cuối, cần tạo charity mới nếu muốn đưa lại
- verification score (0-100) được tính từ tổng hợp whitelisting_rules, không phải manual input
- `GET /api/dharma-compliance/approved-accounts` trả danh sách tài khoản chính thức cho public display
- `GET /api/admin/dharma-compliance/status` phải trả tổng quan: số tổ chức verified, pending, suspended; số alert unresolved

## Error expectations

- `400`
  - dữ liệu tổ chức từ thiện không hợp lệ (thiếu tên, loại)
  - tiêu chí xác minh trùng lặp cho cùng tổ chức
- `401`
  - route write cần auth mà thiếu session
- `403`
  - nội dung chứa tài khoản cá nhân không thuộc whitelist → `UNAUTHORIZED_CHARITY_SOLICITATION`
  - role không đủ để quản lý whitelist
- `404`
  - tổ chức hoặc alert target không tồn tại
- `409`
  - duplicate charity publicId hoặc registration number
- `410`
  - nội dung đã bị auto-delete do vi phạm fundraising → `fundraising_content_removed`
- `500`
  - lỗi regex processing, audit log write, hoặc notification delivery

## Notes for AI/codegen

- CharityFirewallInterceptor phải chạy trước khi content được lưu — sử dụng NestJS interceptor pattern.
- Bank account regex patterns cần cập nhật theo quý để đối phó evasion attempts mới.
- Khi detect bank account, luôn normalize (strip spaces/dashes) trước khi đối chiếu whitelist.
- False positive handling: nếu AI block nhầm, user có thể appeal qua Secretariat → thêm flag `appealable: true` trong audit log.
- International accounts: hỗ trợ nhiều currency (AUD, VND, EUR, USD); conversion hints lưu cùng charity record.
- Buzzword detection regex phải case-insensitive và hỗ trợ Vietnamese diacritics.
- audit log content field phải truncate tại 500 ký tự để tránh phình database.

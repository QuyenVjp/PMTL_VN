# Events Contracts

## Owner data

- `events`
- `event_monetization_rules`
- `event_fundraising_blocks`
- `event_access_logs`
- `event_violations`

## Public routes

- `GET /api/events`
- `GET /api/events/:publicId`
- `GET /api/events/upcoming`
- `GET /api/contact/official-donation-accounts`

## Admin routes

- `GET /api/admin/events`
- `GET /api/admin/events/:publicId`
- `POST /api/admin/events`
- `PATCH /api/admin/events/:publicId`
- `POST /api/admin/events/:publicId/publish`
- `POST /api/admin/events/:publicId/unpublish`
- `DELETE /api/admin/events/:publicId`
- `GET /api/admin/events/:publicId/monetization-rules`
- `POST /api/admin/events/:publicId/monetization-rules`
- `PATCH /api/admin/events/:publicId/monetization-rules/:rulePublicId`
- `GET /api/admin/events/:publicId/fundraising-blocks`
- `POST /api/admin/events/:publicId/fundraising-blocks`
- `PATCH /api/admin/events/:publicId/fundraising-blocks/:blockPublicId`
- `GET /api/admin/events/:publicId/access-logs`
- `GET /api/admin/events/:publicId/violations`
- `POST /api/admin/events/:publicId/violations`
- `PATCH /api/admin/events/:publicId/violations/:violationPublicId`
- `POST /api/admin/events/:publicId/violations/:violationPublicId/acknowledge`
- `POST /api/admin/events/:publicId/violations/:violationPublicId/resolve`
- `GET /api/admin/events/violations/summary`
- `GET /api/admin/events/status`
- `POST /api/admin/events/life-liberation/create`

## Canonical rules

- `price = 0` là invariant tuyệt đối cho mọi event — DB-level CHECK constraint
- `dharmaGoods[].pricePerUnit = 0` là invariant tuyệt đối — DB-level CHECK constraint
- nếu input có price > 0, application auto-sanitize về 0 và ghi audit log `event.price.blocked`
- nếu dharma good có price > 0, auto-sanitize về 0 và ghi audit log `dharma-good.price.sanitized`
- volunteer post fundraising link trong event creation → block + audit log `volunteer.fundraising.violation.detected`
- volunteer tái phạm 3+ lần trong 30 ngày → auto-downgrade role VOLUNTEER → MEMBER, audit log `volunteer.role.downgraded`
- event delivery mode:
  - `offline` phải có `location`
  - `online` phải có external link hoặc embed URL
  - `hybrid` phải có cả `location` và external link
- life liberation mass event sử dụng state machine: PLANNING → EN_ROUTE → AT_LOCATION → RELEASING → COMPLETE
- access logs chỉ phục vụ compliance monitoring, không phải analytics
- violation severity escalation: warning → suspension → removal → account_ban
- violation resolution_status lifecycle: pending → in_progress → resolved
- `POST /api/admin/events/life-liberation/create` yêu cầu organizer có memberProfile hợp lệ và địa điểm với tọa độ GPS
- `GET /api/admin/events/status` phải trả tổng quan: số event published, violations unresolved, recent enforcement actions
- `GET /api/contact/official-donation-accounts` trả danh sách tài khoản quyên góp chính thức được Secretariat phê duyệt

## Error expectations

- `400`
  - event price > 0 → `zero_monetization_violation`
  - dharma good price > 0 → `dharma_good_pricing_violation`
  - volunteer post personal fundraising link → `personal_fundraising_prohibited`
  - volunteer message chứa buzzwords → `prohibited_fundraising_language`
  - thiếu location cho offline event, thiếu link cho online event
  - event type hoặc delivery mode không hợp lệ
- `401`
  - route write cần auth mà thiếu session
- `403`
  - role không đủ để tạo/cập nhật event
  - volunteer đã bị hạ quyền do tái phạm → `volunteer_role_downgraded_for_violations`
- `404`
  - event target không tồn tại
- `409`
  - duplicate event slug hoặc publicId
- `410`
  - nội dung fundraising đã bị auto-delete → `fundraising_content_removed`
- `500`
  - lỗi enforcement processing, audit log write, hoặc notification delivery

## Notes for AI/codegen

- ZeroMonetizationEventGate phải validate tại cả DTO level (Zod) và DB level (CHECK constraint).
- Nếu price > 0 được phát hiện, auto-sanitize thay vì reject — ghi audit log cho admin review.
- Fundraising buzzword regex phải case-insensitive, hỗ trợ Vietnamese diacritics.
- Payment platform link regex: `/paypal\.com|stripe\.com|momo\.vn(?!.*official)|gcash/i` — exclude official partners.
- Access log action_details dùng JSONB để linh hoạt ghi thêm context (giá tiền thử, loại quyên góp).
- Mass life liberation state machine cần geofence detection, shared counter, và ritual rule enforcement.
- Violation evidence_urls dùng JSONB array để hỗ trợ nhiều file chứng minh.
- Event slug phải unique và URL-friendly — auto-generate từ title nếu không cung cấp.

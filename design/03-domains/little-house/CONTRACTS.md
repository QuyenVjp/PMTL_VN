# Little House Contracts

## Owner data

- `little_houses`
- `little_house_recitations`
- `little_house_completion_records`
- `little_house_dotting_sessions`
- `little_house_combustion_logs`
- `little_house_frauds`

## Public routes

- `GET /api/little-house/mine`
- `GET /api/little-house/:publicId`
- `POST /api/little-house`
- `POST /api/little-house/:publicId/start-recitation`
- `PATCH /api/little-house/:publicId/recitations/:recitationPublicId`
- `POST /api/little-house/:publicId/complete`
- `POST /api/little-house/:publicId/dotting-sessions`
- `PATCH /api/little-house/:publicId/dotting-sessions/:sessionPublicId`
- `POST /api/little-house/:publicId/confirm-combustion`

## Admin routes

- `GET /api/admin/little-house`
- `GET /api/admin/little-house/:publicId`
- `GET /api/admin/little-house/:publicId/recitations`
- `GET /api/admin/little-house/:publicId/dotting-sessions`
- `GET /api/admin/little-house/:publicId/combustion-logs`
- `GET /api/admin/little-house/frauds`
- `GET /api/admin/little-house/frauds/:publicId`
- `POST /api/admin/little-house/frauds`
- `PATCH /api/admin/little-house/frauds/:publicId`
- `POST /api/admin/little-house/frauds/:publicId/confirm`
- `POST /api/admin/little-house/frauds/:publicId/revoke`
- `GET /api/admin/little-house/status`
- `GET /api/admin/little-house/completion-stats`

## Canonical rules

- `offerTo` và `offeredBy` bắt buộc trước khi bắt đầu niệm — backend validate với Zod, trả `400 METADATA_REQUIRED_BEFORE_RECITATION` nếu thiếu
- ngoại lệ: `isBackupRecitation = true` (Niệm Tích Lũy Dự Phòng) được bypass metadata requirement
- sau khi bắt đầu niệm, `offerTo` và `offeredBy` bị khóa read-only — không ai có thể sửa
- `completion_date` bị khóa vĩnh viễn sau khi NNN chuyển sang status `recited` hoặc cao hơn
- NNN status lifecycle tuần tự: in_progress → recited → ready_to_burn → burnt → completed_audited
  - không cho phép nhảy cóc (ví dụ: từ in_progress thẳng sang burnt)
  - `flagged` có thể xảy ra tại bất kỳ điểm nào khi phát hiện vấn đề
  - `revoked` là trạng thái cuối khi xác nhận gian lận
- recitation tracking:
  - mỗi NNN có danh sách bài niệm (mandatory + optional)
  - mandatory recitations phải completed trước khi NNN chuyển sang `recited`
  - `current_count >= required_count` → recitation status = completed
- chấm đỏ (dotting):
  - geometric algorithm: bottom-to-top, ~80% fill, bút lông đỏ
  - multithreaded dotting: `is_multithreaded = true` khi nhiều người tham gia
  - `total_dots_completed >= total_dots_expected` → session completed
- combustion:
  - pre-combustion safety checklist bắt buộc (hard-stop): nhíp/đũa, kẹp đúng chỗ, giấy cháy 100%
  - ash inspection ghi nhận: màu tro, mảnh kim loại, hardware error
  - `metal_fragments_found = true` → cần ghi chú tách kim loại
- fraud detection:
  - severity: minor (thiếu 1-2 lần niệm), moderate (thiếu 3-5 lần), major (bỏ qua bộ nguyên vẹn), critical (gian lận toàn bộ)
  - `is_confirmed = true` → có thể revoke
  - revocation = hủy công đức, cần admin xác nhận, không auto-triggered
- `POST /api/little-house/:publicId/start-recitation` validate metadata lock trước khi cho phép
- `POST /api/little-house/:publicId/confirm-combustion` yêu cầu safety checklist completed
- `GET /api/admin/little-house/status` phải trả tổng quan: số NNN theo status, số fraud pending review, completion rate
- `GET /api/admin/little-house/completion-stats` trả thống kê hoàn thành theo thời gian

## Error expectations

- `400`
  - metadata chưa điền trước khi bắt đầu niệm → `METADATA_REQUIRED_BEFORE_RECITATION`
  - cố sửa metadata sau khi đã khóa → `METADATA_LOCKED_AFTER_START`
  - cố sửa completion_date sau khi đã khóa → `COMPLETION_DATE_LOCKED`
  - mandatory recitations chưa hoàn thành khi cố complete → `MANDATORY_RECITATIONS_INCOMPLETE`
  - safety checklist chưa hoàn thành khi confirm combustion → `COMBUSTION_CHECKLIST_INCOMPLETE`
  - cố nhảy cóc status (ví dụ: in_progress → burnt) → `INVALID_STATUS_TRANSITION`
- `401`
  - route write cần auth mà thiếu session
- `403`
  - role không đủ để quản lý fraud hoặc revocation
- `404`
  - NNN, recitation, session, hoặc fraud target không tồn tại
- `409`
  - duplicate NNN publicId
  - dotting session đã completed khi cố update
- `500`
  - lỗi audit log write, notification delivery, hoặc status transition

## Notes for AI/codegen

- StartRecitationDto dùng Zod schema với `.refine()` cho backup recitation exemption.
- Metadata lock là application-level (`is_post_completion_locked`) — không cần DB trigger.
- Status transition nên dùng state machine pattern — reject invalid transitions tại service layer.
- Dotting session `is_multithreaded` cần `participants_count` > 1 khi active.
- Combustion confirm route cần pre-validate safety checklist checkboxes — không chấp nhận nếu thiếu checkbox nào.
- Fraud revocation phải ghi audit log chi tiết: fraud_type, severity, evidence, reviewer.
- NNN PDF generation: khi name change probation active, auto-format "Kính Tặng" field → "Người cần kinh của Tên Mới (Tên Cũ)".
- Completion stats dùng cho admin dashboard — aggregate by week/month, không real-time.

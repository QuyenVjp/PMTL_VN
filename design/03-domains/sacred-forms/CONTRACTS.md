# Sacred Forms Contracts

## Owner data

- `sacred_forms`
- `form_prerequisites`
- `form_applicants`
- `form_prerequisite_validations`
- `form_disposals`
- `name_change_probations`

## Public routes

- `GET /api/sacred-forms`
- `GET /api/sacred-forms/:publicId`
- `GET /api/sacred-forms/:publicId/prerequisites`
- `POST /api/sacred-forms/apply`
- `GET /api/sacred-forms/my-applications`
- `GET /api/sacred-forms/my-applications/:publicId`
- `GET /api/sacred-forms/my-probations`

## Admin routes

- `GET /api/admin/sacred-forms`
- `GET /api/admin/sacred-forms/:publicId`
- `POST /api/admin/sacred-forms`
- `PATCH /api/admin/sacred-forms/:publicId`
- `GET /api/admin/sacred-forms/:publicId/prerequisites`
- `POST /api/admin/sacred-forms/:publicId/prerequisites`
- `PATCH /api/admin/sacred-forms/:publicId/prerequisites/:prerequisitePublicId`
- `GET /api/admin/sacred-forms/applicants`
- `GET /api/admin/sacred-forms/applicants/:publicId`
- `POST /api/admin/sacred-forms/applicants/:publicId/review`
- `POST /api/admin/sacred-forms/applicants/:publicId/approve`
- `POST /api/admin/sacred-forms/applicants/:publicId/reject`
- `GET /api/admin/sacred-forms/applicants/:publicId/validations`
- `POST /api/admin/sacred-forms/applicants/:publicId/validations`
- `PATCH /api/admin/sacred-forms/applicants/:publicId/validations/:validationPublicId`
- `POST /api/admin/sacred-forms/applicants/:publicId/validations/:validationPublicId/waive`
- `GET /api/admin/sacred-forms/applicants/:publicId/disposals`
- `POST /api/admin/sacred-forms/applicants/:publicId/disposals`
- `PATCH /api/admin/sacred-forms/applicants/:publicId/disposals/:disposalPublicId`
- `POST /api/admin/sacred-forms/applicants/:publicId/disposals/:disposalPublicId/complete`
- `POST /api/admin/sacred-forms/applicants/:publicId/burn`
- `GET /api/admin/sacred-forms/probations`
- `GET /api/admin/sacred-forms/probations/:publicId`
- `GET /api/admin/sacred-forms/status`

## Canonical rules

- disposal polarity enforcement:
  - `form_type = dharma_name_change` → disposal MUST be `safe_incineration` (BẮT BUỘC ĐỐT)
  - `form_type = special_vow` (dạng Đơn Khuyến Đạo) → disposal MUST NOT be `safe_incineration` (TUYỆT ĐỐI CẤM ĐỐT)
  - hệ thống hard-block nếu polarity mismatch
- burn conditions cho Đơn Đổi Tên:
  - time gate (hard-block): chỉ chấp nhận 06:00-07:00, 08:00-09:00, 16:00-17:00
  - weather gate (soft-block): advisory "phải đốt vào ngày nắng" + user confirmation checkbox override
  - nếu time ngoài gate → `400 INVALID_BURN_CONDITIONS`
- name change probation:
  - tạo automatic khi burn thành công: `probation_duration_days = 100`
  - `is_active = true` trong 100 ngày
  - daily cronjob check `probation_end_date <= now()` → auto-unlock: `is_active = false`, `isNameLingActive = true`
  - trong probation, NNN PDF auto-format "Kính Tặng": "Người cần kinh của [Tên Mới] ([Tên Cũ])"
  - sau probation: cho phép viết tên mới riêng
- applicant lifecycle: submitted → under_review → approved → completed
  - rejected và cancelled là terminal states
  - không auto-approve — luôn cần human review
  - approve cần `reviewer_user_id` (admin hoặc monk)
- prerequisite validation:
  - mandatory prerequisites phải `met` hoặc `waived` trước khi approve applicant
  - waive cần admin approval + evidence_note giải thích trường hợp đặc biệt
  - Đơn Khuyến Đạo Người Nhà yêu cầu: 7 biến Tâm Kinh × 30 ngày liên tục cho người nhà cụ thể
- `POST /api/sacred-forms/apply` validate prerequisites accessibility — nếu mandatory prerequisites chưa met, trả advisory (không block submit, nhưng applicant sẽ pending cho đến khi prerequisites met)
- `POST /api/admin/sacred-forms/applicants/:publicId/burn` validate burn conditions (time + weather) trước khi tạo probation
- `GET /api/admin/sacred-forms/status` phải trả tổng quan: số applicant theo status, số probation active, prerequisites pending review
- `GET /api/sacred-forms/my-probations` trả countdown information: ngày còn lại, format interim alias, ngày dự kiến unlock

## Error expectations

- `400`
  - burn time ngoài gate → `INVALID_BURN_CONDITIONS`
  - disposal polarity mismatch (đốt đơn cấm đốt, không đốt đơn phải đốt) → `DISPOSAL_POLARITY_VIOLATION`
  - mandatory prerequisites chưa met khi cố approve → `PREREQUISITES_NOT_MET`
  - applicant status transition không hợp lệ → `INVALID_APPLICANT_STATUS_TRANSITION`
  - thiếu thông tin bắt buộc khi submit application
- `401`
  - route write cần auth mà thiếu session
- `403`
  - role không đủ để review/approve applicant hoặc waive prerequisite
- `404`
  - form, applicant, prerequisite, disposal, hoặc probation target không tồn tại
- `409`
  - duplicate applicant cho cùng user + form combination khi đơn trước chưa terminal
  - probation đã tồn tại cho cùng form_applicant
- `500`
  - lỗi cronjob probation unlock, weather API lookup, hoặc notification delivery

## Notes for AI/codegen

- Disposal polarity mapping nên define as constant map, không scattered trong code:
  ```
  dharma_name_change → safe_incineration REQUIRED
  initiation_form → sealing_ceremony hoặc archival
  ordination → archival
  special_vow (Khuyến Đạo) → archival, NEVER safe_incineration
  ```
- Burn time gate dùng server timezone comparison — user timezone từ profile.
- Weather gate nên dùng external weather API với fallback sang user self-report checkbox.
- Probation unlock cronjob chạy daily midnight — `@Cron('0 0 * * *')`.
- Probation countdown display: `probation_end_date - now()` tính bằng ngày.
- Interim alias injection: little-house module query `name_change_probations WHERE user_id = X AND is_active = true` trước khi render NNN PDF.
- Prerequisite gate cho Đơn Khuyến Đạo: query engagement module `practiceHistory WHERE userId = X AND practiceType = 'tam_kinh' AND streakDays >= 30`.
- Waive prerequisite cần audit log: reason, approver, timestamp.

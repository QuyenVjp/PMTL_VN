# Life Liberation Contracts

## Owner data

- `life_releases`
- `life_release_candidates`
- `proxy_life_releases`
- `life_release_dedications`
- `life_release_audits`

## Public routes

- `GET /api/life-liberation/releases`
- `GET /api/life-liberation/releases/:publicId`
- `GET /api/life-liberation/species`
- `GET /api/life-liberation/species/:speciesId/habitat-guide`
- `POST /api/life-liberation/releases`
- `PATCH /api/life-liberation/releases/:publicId`
- `POST /api/life-liberation/releases/:publicId/start`
- `POST /api/life-liberation/releases/:publicId/complete`
- `POST /api/life-liberation/releases/:publicId/proxy`
- `POST /api/life-liberation/releases/:publicId/dedications`

## Admin routes

- `GET /api/admin/life-liberation/releases`
- `GET /api/admin/life-liberation/releases/:publicId`
- `GET /api/admin/life-liberation/releases/:publicId/candidates`
- `POST /api/admin/life-liberation/releases/:publicId/candidates`
- `PATCH /api/admin/life-liberation/releases/:publicId/candidates/:candidatePublicId`
- `GET /api/admin/life-liberation/releases/:publicId/proxy`
- `GET /api/admin/life-liberation/releases/:publicId/dedications`
- `GET /api/admin/life-liberation/releases/:publicId/audits`
- `POST /api/admin/life-liberation/releases/:publicId/audits`
- `PATCH /api/admin/life-liberation/releases/:publicId/audits/:auditPublicId`
- `GET /api/admin/life-liberation/species`
- `POST /api/admin/life-liberation/species`
- `PATCH /api/admin/life-liberation/species/:speciesId`
- `GET /api/admin/life-liberation/status`

## Canonical rules

- predatory species (cá lóc, cá trê, ba ba hung dữ) là hard-block: user phải xác nhận habitat verification trước khi tiếp tục
- habitat verification cho loài ăn thịt yêu cầu: vùng nước cực lớn, sâu, không có cá nhỏ
- nếu habitat không phù hợp (hồ nhỏ, ao có cá khác), nút "Bắt Đầu Phóng Sinh" bị khóa hoàn toàn
- proxy silence lock (`sponsor_silence_lock = true`) mặc định cho mọi proxy release
- UI proxy mode phải ẩn tên volunteer, chỉ hiển thị tên beneficiary
- recitation script trong proxy mode chỉ chứa tên beneficiary, không chứa tên volunteer
- money transfer protocol bắt buộc khi `life_release_dedications.money_transfer_required = true`:
  - user phải confirm đã khấn tại bàn thờ xin Bồ Tát chuyển tiền
  - không cho phép bắt đầu phóng sinh nếu chưa confirmed
- anonymity mode mặc định: `full_anonymity`
  - `full_anonymity`: cả sponsor lẫn beneficiary đều ẩn
  - `sponsor_anonymous`: sponsor ẩn, beneficiary biết
  - `mutual_known`: cả hai biết nhau
- life release status lifecycle: planned → in_progress → completed → audited (hoặc failed tại bất kỳ điểm nào)
- mortality audit: tỷ lệ tử vong > 10% → excessive_loss, cần recommendation bù đắp từ auditor
- follow-up check sau 30 ngày cho phóng sinh loài ăn thịt — hệ thống trigger notification tự động
- mọi phóng sinh loài ăn thịt ghi audit log: `LIFE_RELEASE_PREDATORY_SPECIES` với `riskLevel: HIGH`
- `GET /api/admin/life-liberation/status` phải trả tổng quan: số release theo status, số audit cần review, predatory species releases gần đây

## Error expectations

- `400`
  - predatory species habitat verification thiếu → `PREDATORY_HABITAT_VERIFICATION_REQUIRED`
  - habitat không phù hợp cho loài ăn thịt → `UNSAFE_HABITAT_FOR_PREDATORY_SPECIES`
  - money transfer chưa confirmed cho proxy release → `MONEY_TRANSFER_NOT_CONFIRMED`
  - thiếu thông tin bắt buộc (species, quantity, location)
  - proxy release thiếu beneficiary information
- `401`
  - route write cần auth mà thiếu session
- `403`
  - role không đủ để tạo/cập nhật release hoặc audit
- `404`
  - release, candidate, hoặc audit target không tồn tại
  - species không tìm thấy
- `409`
  - duplicate release publicId
  - audit đã tồn tại cho cùng release + date
- `500`
  - lỗi audit log write, notification delivery, hoặc species lookup

## Notes for AI/codegen

- PredatorySpeciesGuard phải chạy trước write path — sử dụng NestJS guard pattern.
- Species predatory database cần Meilisearch auto-complete cho form input.
- Proxy mode cần state đặc biệt trên UI: ẩn tên volunteer, hiển thị cảnh báo nhấp nháy.
- Money transfer confirmation là self-reported (user confirm offline ritual) — hệ thống không verify offline action.
- Mortality rate tính bằng: `mortalities_observed / total_expected * 100`.
- Compensation quantity và cost do auditor nhập thủ công, không auto-calculate.
- Follow-up notification sau 30 ngày dùng scheduled job (cron) — check `release_date + 30 days` cho predatory releases.
- `beneficiary_contact_allowed` phải phối hợp chặt với `anonymity_mode`:
  - `full_anonymity` → `beneficiary_contact_allowed = false`
  - `sponsor_anonymous` → `beneficiary_contact_allowed` tùy chọn
  - `mutual_known` → `beneficiary_contact_allowed = true`

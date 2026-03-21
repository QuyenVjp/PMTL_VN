# Execution Map

File này là bản đồ hành động của lớp tài liệu mới trong `design/`.
Nó trả lời câu hỏi:

- muốn code chức năng mới thì đọc use-case (kịch bản sử dụng) nào trước
- mỗi module có canonical write-path nào quan trọng nhất
- route nào chỉ là BFF/proxy, route nào gắn với business owner

## Cách đọc nhanh

1. Đọc `DECISIONS.md`
2. Đọc `tracking/module-interactions.md`
3. Đọc `overview/terminology.md`
4. Đọc `overview/source-analysis.md`
5. Đọc `10-wisdom-qa/SOURCE_PROVENANCE_MATRIX.md`
6. Đọc `10-wisdom-qa/INGESTION_PLAN.md`
7. Đọc `overview/feature-surface-from-official-sites.md`
8. Đọc `ui/ELDERLY_UX.md`
9. Đọc `tracking/audit-policy.md`
10. Đọc `baseline/sla-slo.md`
11. Đọc `baseline/security.md`
12. Đọc `baseline/failure-modes.md`
13. Đọc `baseline/writing-standards.md`
14. Chọn module owner bên dưới
15. Mở `contracts.md` của module đó
16. Mở file trong `use-cases/` tương ứng

## Theo module

### Content

- contract (hợp đồng dữ liệu/nghiệp vụ): `design/02-content/contracts.md`
- Use-cases:
  - `publish-post.md`
  - `publish-beginner-guide.md`
  - `update-published-post.md`
- State:
  - `publish-state.mmd`

Khi đọc module này, hãy nhớ:

- canonical content nằm ở owner collection
- search sync, notification, webhook/revalidation là downstream
- business event quan trọng nên đi qua outbox trước khi vào execution queue

### Community

- contract (hợp đồng dữ liệu/nghiệp vụ): `design/03-community/contracts.md`
- Use-cases:
  - `submit-post-comment.md`
  - `submit-community-post.md`
  - `submit-guestbook-entry.md`
- boundary (ranh giới trách nhiệm):
  - `PRACTICE_COMMUNITY_BOUNDARY.md`

Khi đọc module này, hãy nhớ:

- submit UGC và report moderation là hai write-path khác nhau
- anti-spam/request guard là policy cắt ngang, không phải owner data

### Engagement

- contract (hợp đồng dữ liệu/nghiệp vụ): `design/04-engagement/contracts.md`
- Use-cases:
  - `upsert-practice-log.md`
  - `save-sutra-progress.md`
  - `manage-practice-sheet.md`
  - `manage-ngoi-nha-nho-sheet.md`
- State:
  - `ngoi-nha-nho-state.mmd`

Khi đọc module này, hãy nhớ:

- đây là self-owned state
- không ghi ngược sang content canonical data
- `practiceSheets` và `ngoiNhaNhoSheets` là canonical self-owned records

### Moderation

- contract (hợp đồng dữ liệu/nghiệp vụ): `design/05-moderation/contracts.md`
- Use-cases:
  - `report-comment.md`
  - `resolve-report.md`
- States:
  - `report-state.mmd`
  - `guestbook-approval-state.mmd`

Khi đọc module này, hãy nhớ:

- `moderationReports` là source of truth (nguồn dữ liệu gốc đáng tin cậy nhất)
- field trên entity đích chỉ là summary
- notify downstream quan trọng nên phát từ outbox event thay vì fire-and-forget

### Search

- contract (hợp đồng dữ liệu/nghiệp vụ): `design/06-search/contracts.md`
- Use-cases:
  - `index-published-post.md`
  - `public-search-query.md`

Khi đọc module này, hãy nhớ:

- phase 1 search là `Postgres-first`, không mặc định queue/outbox-driven
- phase 2+ mới dùng outbox/BullMQ/worker cho search-sync khi trigger được đáp ứng
- fallback (đường dự phòng) là để giữ service (lớp xử lý nghiệp vụ) usable khi engine lỗi
- `pgvector` chỉ là capability bổ sung khi module recommendation / related-content đã được chốt

### Calendar

- contract (hợp đồng dữ liệu/nghiệp vụ): `design/07-calendar/contracts.md`
- Use-cases:
  - `publish-event.md`
  - `apply-lunar-override.md`
  - `build-personal-practice-calendar.md`
  - `refresh-personal-practice-calendar.md`
  - `compose-daily-practice-advisory.md`
- read model (mô hình dữ liệu đọc):
  - `PERSONAL_PRACTICE_CALENDAR_READ_MODEL.md`
  - `PRACTICE_ADVISORY_MODEL.md`

Khi đọc module này, hãy nhớ:

- event ownership nằm ở calendar
- content chỉ tham chiếu
- personal practice calendar là derived read model (mô hình dữ liệu đọc) của calendar

### Notification

- contract (hợp đồng dữ liệu/nghiệp vụ): `design/08-notification/contracts.md`
- Use-cases:
  - `subscribe-push.md`
  - `dispatch-push-job.md`
  - `schedule-practice-reminder.md`
- State:
  - `push-job-state.mmd`

Khi đọc module này, hãy nhớ:

- notification là async-only (chỉ chạy ngầm, bất đồng bộ) control-plane (lớp điều phối hệ thống)
- `pushJobs` không phải inbox canonical
- delivery request quan trọng nên đến notification qua outbox event

### Identity

- contract (hợp đồng dữ liệu/nghiệp vụ): `design/01-identity/contracts.md`
- Use-cases:
  - `register-member.md`
  - `update-profile.md`
- Permission:
  - `PERMISSION_MATRIX.md`

Khi đọc module này, hãy nhớ:

- NestJS auth là auth authority duy nhất
- web route chỉ là BFF/compatibility layer

### Vows & Merit

- contract (hợp đồng dữ liệu/nghiệp vụ): `design/09-vows-merit/contracts.md`
- Use-cases:
  - `create-vow.md`
  - `fulfill-vow-milestone.md`
  - `log-life-release.md`
- schema (lược đồ dữ liệu):
  - `schema.dbml`

Khi đọc module này, hãy nhớ:

- phát nguyện là canonical record (bản ghi chuẩn gốc) riêng
- phóng sanh là sổ tay thực hành, không phải social feed

### Wisdom & QA

- contract (hợp đồng dữ liệu/nghiệp vụ): `design/10-wisdom-qa/contracts.md`
- Use-cases:
  - `publish-wisdom-entry.md`
  - `study-baihua.md`
  - `search-qa-answer.md`
  - `download-offline-bundle.md`
- schema (lược đồ dữ liệu):
  - `schema.dbml`
- Offline:
  - `OFFLINE_BAIHUA_DIRECTION.md`
- provenance (nguồn gốc dữ liệu):
  - `SOURCE_PROVENANCE_MATRIX.md`
- Ingestion:
  - `INGESTION_PLAN.md`

Khi đọc module này, hãy nhớ:

- retrieval-first, không dùng AI bịa lời khai thị
- phù hợp đọc/nghe offline cho người lớn tuổi

## Nếu chuẩn bị thêm chức năng mới

### Hãy tự hỏi theo thứ tự này

1. owner module (module sở hữu) là ai?
2. canonical record (bản ghi chuẩn gốc) phải ghi ở đâu trước?
3. Có summary field nào cần sync không?
4. Có side-effect async (bất đồng bộ) quan trọng nào cần transactional handoff qua `outbox_events` không?
5. Dispatcher/execution queue/worker sẽ thực thi side-effect đó ở lớp nào?
6. Có audit bắt buộc không?
7. Boundary schema và env contract đã được chốt chưa?
8. Route public đang dùng `publicId`, `slug`, hay session owner?
9. Thuật ngữ có đúng `overview/terminology.md` chưa?
10. Có phù hợp `ui/ELDERLY_UX.md` chưa?

### Nếu chưa trả lời được

- đừng code vội
- bổ sung một file mới trong `use-cases/` của module owner trước

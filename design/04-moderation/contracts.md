# Moderation Contracts

## Owner data

- `moderationReports`

## Input schemas chính

- `commentReportSchema` từ `packages/shared/src/schemas/comment.ts`
- các route decision của admin phải validate explicit decision enum ở server

## Routes chính

- `POST /api/comments/:publicId/report`
- `POST /api/community/posts/:publicId/report`
- `POST /api/community/comments/:publicId/report`
- `GET /api/moderation/reports`
- `POST /api/moderation/reports/:publicId/decision`

## Canonical write rules

- report lifecycle chỉ ghi vào `moderationReports`
- target entity chỉ nhận summary fields:
  - `reportCount`
  - `lastReportReason`
  - `moderationStatus`
  - `approvalStatus`
  - `isHidden`
- alert admin hoặc notify affected user quan trọng nên đi qua `outbox_events`
- request payload, decision payload, protected-scope metadata và downstream event payload phải có schema runtime rõ

## Decision contract (hợp đồng dữ liệu/nghiệp vụ)

Actor:
- `admin` (`Phụng sự viên`)
- `super-admin`

Expected decisions:
- `approved`
- `rejected`
- `flagged`
- `hidden`

## Error expectations

- `400`
  - reason hoặc decision không hợp lệ
- `401`
  - chưa có session
- `403`
  - role không đủ
- `404`
  - report hoặc target entity không tồn tại
- `409`
  - duplicate unresolved report hoặc state conflict
- `500`
  - lỗi sync summary, append outbox, hoặc notify downstream

## Notes for AI/codegen

- `moderationReports` mới là source of truth (nguồn dữ liệu gốc đáng tin cậy nhất); summary field không phải lifecycle record.
- Đừng expose full moderation internals cho route public/community.
- Notify admin hoặc affected user là downstream async (bất đồng bộ), không phải canonical decision record.
- Nếu summary drift xảy ra, recovery path chuẩn là recompute summary từ `moderationReports`, không vá tay mơ hồ trên target entity.


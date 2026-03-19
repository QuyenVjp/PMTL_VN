# Report Comment

## Purpose
- Cho phép người dùng báo cáo một bình luận không phù hợp, đồng thời giữ source of truth tập trung ở moderation module.

## Owner module
- `moderation`

## Actors
- `member`
- `guest` nếu route hiện tại cho phép theo policy

## Trigger
- Web gọi `POST /api/comments/:publicId/report` hoặc route report comment tương đương.

## Preconditions
- Target comment tồn tại.
- `reason` hợp lệ theo `commentReportSchema`.
- Actor chưa bị anti-spam/request guard chặn.

## Input contract
- `commentReportSchema`
- route param dùng `publicId`

## Read set
- `postComments` hoặc comment target collection tương ứng
- `moderationReports`
- identity session nếu có
- request guard nếu policy dùng

## Write path
1. Resolve target comment bằng `publicId`.
2. Validate payload report.
3. Kiểm tra duplicate unresolved report theo policy.
4. Ghi canonical record vào `moderationReports`.
5. Sync summary fields lên entity đích:
   - `reportCount`
   - `lastReportReason`
   - `moderationStatus` hoặc `isHidden` nếu policy tự động kích hoạt
6. Append audit `moderation.report.submit`.
7. Enqueue alert cho admin/super-admin.

## Async side-effects
- admin/super-admin notification

## Success result
- Report source record được tạo.
- Target entity có summary fields mới để admin/public filtering dùng.

## Errors
- `400`: reason không hợp lệ.
- `404`: comment không tồn tại.
- `409`: duplicate unresolved report hoặc state conflict.
- `429`: anti-spam chặn.
- `500`: lỗi sync summary hoặc downstream.

## Audit
- log `moderation.report.submit`
- metadata nên có report id, target publicId, actor type, reason

## Idempotency / anti-spam
- Không cho cùng actor spam report cùng một target trong cửa sổ ngắn nếu policy đã xác định.
- Retry do lỗi mạng không được tạo nhiều unresolved report giống hệt nhau.

## Performance target
- Canonical report create + enqueue alert nên `< 800ms`.

## Notes for AI/codegen
- `moderationReports` là source of truth; đừng nhét full report lifecycle vào `postComments`.
- Summary fields trên target chỉ là read model.

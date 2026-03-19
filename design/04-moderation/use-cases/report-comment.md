# Report Comment

## Purpose
- Cho phép người dùng báo cáo một bình luận không phù hợp, đồng thời giữ source of truth (nguồn dữ liệu gốc đáng tin cậy nhất) tập trung ở moderation module.

## owner module (module sở hữu)
- `moderation`

## Actors
- `member`
- `guest` nếu route hiện tại cho phép theo policy

## trigger (điểm kích hoạt)
- Web gọi `POST /api/comments/:publicId/report` hoặc route report comment tương đương.

## preconditions (điều kiện tiên quyết)
- Target comment tồn tại.
- `reason` hợp lệ theo `commentReportSchema`.
- Actor chưa bị anti-spam/request guard chặn.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)
- `commentReportSchema`
- route param dùng `publicId`

## Read set
- `postComments` hoặc comment target collection tương ứng
- `moderationReports`
- identity session nếu có
- request guard nếu policy dùng

## write path (thứ tự ghi dữ liệu chuẩn)
1. Resolve target comment bằng `publicId`.
2. Validate payload report.
3. Kiểm tra duplicate unresolved report theo policy.
4. Ghi canonical record (bản ghi chuẩn gốc) vào `moderationReports`.
5. Sync summary fields lên entity đích:
   - `reportCount`
   - `lastReportReason`
   - `moderationStatus` hoặc `isHidden` nếu policy tự động kích hoạt
6. Append audit `moderation.report.submit`.
7. Enqueue alert cho admin/super-admin.

## async (bất đồng bộ) side-effects
- admin/super-admin notification

## success result (kết quả thành công)
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
- `moderationReports` là source of truth (nguồn dữ liệu gốc đáng tin cậy nhất); đừng nhét full report lifecycle vào `postComments`.
- Summary fields trên target chỉ là read model (mô hình dữ liệu đọc).


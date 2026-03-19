# Resolve Moderation Report

## Purpose
- Cho admin/super-admin ra quyết định trên một report đã được tạo và đồng bộ quyết định đó về entity đích.

## owner module (module sở hữu)
- `moderation`

## Actors
- `admin`
- `super-admin`

## trigger (điểm kích hoạt)
- Admin gọi `POST /api/moderation/reports/:publicId/decision`.

## preconditions (điều kiện tiên quyết)
- Actor có role phù hợp.
- Report tồn tại và chưa ở trạng thái terminal không cho sửa nữa theo policy.
- Target entity của report vẫn resolve được.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)
- decision enum explicit ở server:
  - `approved`
  - `rejected`
  - `flagged`
  - `hidden`

## Read set
- `moderationReports`
- target entity collection
- identity của actor/admin

## write path (thứ tự ghi dữ liệu chuẩn)
1. Resolve report bằng `publicId`.
2. Validate decision payload.
3. Update canonical report record trong `moderationReports`.
4. Sync summary moderation fields lên target entity:
   - `moderationStatus`
   - `approvalStatus`
   - `isHidden`
5. Append audit `moderation.report.resolve`.
6. Enqueue notify affected user nếu flow bật.

## async (bất đồng bộ) side-effects
- notify affected user
- internal admin trail nếu policy cần

## success result (kết quả thành công)
- Report có decision state mới.
- Target entity phản ánh đúng summary moderation để public filtering hoạt động.

## Errors
- `400`: decision không hợp lệ.
- `401`: chưa đăng nhập.
- `403`: role không đủ.
- `404`: report hoặc target không tồn tại.
- `409`: report đã ở trạng thái không được resolve lại theo policy.
- `500`: lỗi sync summary hoặc downstream notify.

## Audit
- log `moderation.report.resolve`
- metadata gồm report id, target type, target publicId, actor, decision

## Idempotency / anti-spam
- Resolve lại cùng một decision không được tạo report record mới.

## Performance target
- Decision path không chờ notify user gửi xong.

## Notes for AI/codegen
- Quyết định moderation ghi vào report source trước, rồi mới sync target summary.
- Guestbook approval là biến thể state riêng, nhưng vẫn phải tôn trọng owner của target entity.


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
- Nếu target hoặc decision hiện tại thuộc `super-admin protected scope`, chỉ `super-admin` mới được tiếp tục.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)
- decision enum explicit ở server:
  - `approved`
  - `rejected`
  - `flagged`
  - `hidden`
- nếu có downstream signal thì outbox payload phải có event type, event version và idempotency key

## Read set
- `moderationReports`
- target entity collection
- identity của actor/admin
- previous resolver nếu report đã từng được resolve
- protected-scope metadata nếu target gắn với `super-admin`

## write path (thứ tự ghi dữ liệu chuẩn)
1. Resolve report bằng `publicId`.
2. Validate decision payload.
3. Kiểm tra permission edge-cases:
   - `admin` được re-resolve decision do admin khác tạo nếu policy cho phép
   - `admin` không được override hoặc operate trong `super-admin protected scope`
   - `super-admin` có thể override khi cần
4. Update canonical report record trong `moderationReports`.
5. Sync summary moderation fields lên target entity:
   - `moderationStatus`
   - `approvalStatus`
   - `isHidden`
6. Append audit `moderation.report.resolve`.
7. Nếu flow bật notify hoặc internal trail, append outbox event downstream tương ứng.

## async (bất đồng bộ) side-effects
- notify affected user
- internal admin trail nếu policy cần

## success result (kết quả thành công)
- Report có decision state mới.
- Target entity phản ánh đúng summary moderation để public filtering hoạt động.

## Errors
- `400`: decision không hợp lệ.
- `401`: chưa đăng nhập.
- `403`: role không đủ hoặc actor chạm vào `super-admin protected scope`.
- `404`: report hoặc target không tồn tại.
- `409`: report đã ở trạng thái không được resolve lại theo policy.
- `500`: lỗi sync summary hoặc downstream notify.

## Audit
- log `moderation.report.resolve`
- metadata gồm report id, target type, target publicId, actor, previous resolver nếu có, decision

## Idempotency / anti-spam
- Resolve lại cùng một decision không được tạo report record mới.
- Re-resolve hợp lệ vẫn phải để lại audit trail riêng, không được ghi đè lịch sử cũ như chưa từng có.
- nếu summary target bị lệch, recovery path là recompute từ `moderationReports`, không suy ngược từ target summary field.

## Performance target
- Decision path không chờ notify user gửi xong.

## Notes for AI/codegen
- Quyết định moderation ghi vào report source trước, rồi mới sync target summary.
- Guestbook approval là biến thể state riêng, nhưng vẫn phải tôn trọng owner của target entity.
- `admin` có thể re-resolve decision của admin khác.
- `admin` không được override hay thao tác trong `super-admin protected scope`.


# Manage Practice Sheet

## Purpose
- Hỗ trợ người dùng quản lý `Practice Sheet / Bảng công phu` hằng ngày theo cách đơn giản, dễ dùng, phù hợp người lớn tuổi.

## Owner module
- `engagement`

## Actors
- `member`

## Trigger
- User mở màn hình bảng công phu, tạo tờ mới hoặc cập nhật tờ đang làm.

## Preconditions
- User có session hợp lệ.
- Reference data cho bài niệm hoặc plan đã tồn tại trong content.

## Input contract
- payload phải chứa:
  - `sheetType`
  - `practiceDate`
  - danh sách item
  - `clientEventId` nếu là sync/offline update

## Read set
- auth session
- chant plan / chant item references
- self-owned `practiceSheets` của user

## Write path
1. Resolve user từ session.
2. Tạo mới hoặc load tờ `practiceSheets` hiện có theo ngữ cảnh ngày/plan.
3. Upsert các item state theo payload.
4. Tính lại `completionPercent`.
5. Nếu đủ điều kiện, chuyển trạng thái sang `completed`.
6. Append audit nhẹ cho create/complete nếu policy yêu cầu.

## Async side-effects
- có thể enqueue reminder sync nhẹ nếu user bật nhắc việc.

## Success result
- User thấy đúng bảng công phu đang làm và tiến độ tổng.

## Errors
- `400`: payload không hợp lệ hoặc item ref sai.
- `401`: chưa đăng nhập.
- `404`: chant item / chant plan không tồn tại.
- `409`: conflict do offline sync hoặc duplicate event.
- `500`: lỗi service.

## Notes for AI/codegen
- Đây là personal practice sheet, không phải social post.
- UI nên ít bước, rõ chữ, và không dùng hiệu ứng rối mắt.

# Fulfill Vow Milestone

## Purpose

- Ghi nhận một mốc hoàn thành của `Phát nguyện` mà không biến record này thành task list thông thường.

## Owner module

- `vows-merit`

## Actors

- `member`

## Trigger

- User đánh dấu đã hoàn thành một phần hoặc toàn bộ mốc nguyện.

## Preconditions

- Vow record tồn tại và thuộc đúng user hiện tại.
- Vow chưa ở trạng thái terminal bị khóa theo policy.
- Giá trị cập nhật không vi phạm quy tắc loại vow đang áp dụng.

## Input contract

- `vowPublicId`
- `completedAmount` hoặc `milestoneValue`
- `entryDate`
- `note` nếu có
- `sourceType` nếu milestone tới từ:
  - manual
  - practice log
  - life release journal

## Read set

- auth session
- `vows`
- `vowProgressEntries`
- optional source ref nếu cập nhật đến từ practice log hoặc life release journal

## Write path

1. Resolve user từ session.
2. Load canonical vow record.
3. Validate milestone update không làm vượt rule bất hợp lý theo policy.
4. Append canonical progress entry vào `vowProgressEntries`.
5. Recompute progress summary trên `vows`.
6. Nếu đạt điều kiện hoàn thành, chuyển vow sang trạng thái `fulfilled` và set `fulfilledAt`.
7. Append audit `vow.fulfill`.
8. Nếu cần nhắc việc/chúc mừng/cập nhật lịch cá nhân, append outbox event downstream tương ứng.

## Async side-effects

- update reminder candidates
- optional notification chúc mừng hoặc nhắc hoàn nguyện nếu feature bật

## Success result

- User thấy tiến độ nguyện được cập nhật đúng và trang nghiêm.
- `Calendar` và `Notification` có thể đọc summary mới mà không cần tự tính lại từ đầu.

## Errors

- `400`: payload không hợp lệ hoặc milestone vượt rule.
- `401`: chưa đăng nhập.
- `404`: vow không tồn tại hoặc không thuộc user.
- `409`: vow đã hoàn thành, đã hủy, hoặc milestone conflict.
- `500`: lỗi service.

## Audit

- bắt buộc append `vow.fulfill`
- audit nên giữ:
  - delta value
  - source type
  - before / after current value
  - before / after status nếu status đổi

## Idempotency / anti-spam

- nếu milestone tới từ source có `sourceRef`, phải dedupe theo `vow + sourceRef`
- nếu là manual submit, UI nên chống bấm lặp
- service nên từ chối append trùng rõ ràng trong cửa sổ ngắn nếu payload giống hệt
- recovery path phải recompute được summary từ `vowProgressEntries` nếu downstream summary bị lệch.

## Performance target

- append progress + recompute summary nên hoàn tất `< 600ms`
- phần thông báo hoặc reminder update phải ở downstream async path

## Notes

- `vowProgressEntries` là append-only source cho tiến độ.
- Summary trên `vows` chỉ là dữ liệu đọc nhanh, không thay thế lịch sử mốc tiến độ.

# Fulfill Vow Milestone

## Purpose
- Ghi nhận một mốc hoàn thành của `Phát nguyện` mà không biến record này thành task list thông thường.

## owner module (module sở hữu)
- `vows-merit`

## Actors
- `member`

## trigger (điểm kích hoạt)
- User đánh dấu đã hoàn thành một phần hoặc toàn bộ mốc nguyện.

## preconditions (điều kiện tiên quyết)
- Vow record tồn tại và thuộc đúng user hiện tại.
- Vow chưa ở trạng thái terminal bị khóa theo policy.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)
- `vowPublicId`
- `milestoneValue` hoặc `completedAmount`
- `note` nếu có

## Read set
- auth session
- `vows`
- `vowProgressEntries`

## write path (thứ tự ghi dữ liệu chuẩn)
1. Resolve user từ session.
2. Load canonical vow record.
3. Validate mốc cập nhật không làm vượt rule bất hợp lý theo policy.
4. Append canonical progress entry vào `vowProgressEntries`.
5. Recompute progress summary trên `vows`.
6. Nếu đạt điều kiện hoàn thành, chuyển vow sang trạng thái `fulfilled`.
7. Append audit `vow.fulfill`.

## async (bất đồng bộ) side-effects
- có thể enqueue reminder update hoặc notification chúc mừng nhẹ nếu feature bật

## success result (kết quả thành công)
- User thấy tiến độ nguyện được cập nhật đúng và trang nghiêm.

## Errors
- `400`: payload không hợp lệ.
- `401`: chưa đăng nhập.
- `404`: vow không tồn tại hoặc không thuộc user.
- `409`: vow đã hoàn thành/đã hủy hoặc milestone conflict.
- `500`: lỗi service (lớp xử lý nghiệp vụ).

## Notes for AI/codegen
- `vowProgressEntries` là append-only source cho tiến độ.
- Summary trên `vows` chỉ là dữ liệu đọc nhanh.


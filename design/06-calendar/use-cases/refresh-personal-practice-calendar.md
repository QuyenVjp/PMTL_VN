# Refresh Personal Practice Calendar

## Purpose

- Làm mới `personalPracticeCalendarReadModel` khi lịch âm, preference, vow, hoặc phóng sanh context thay đổi.

## owner module (module sở hữu)

- `calendar`

## Actors

- `system`
- `admin` khi chạy thủ công

## trigger (điểm kích hoạt)

- event/lunar data thay đổi
- preference summary thay đổi
- vow milestone hoặc life-release summary thay đổi
- replay hoặc recovery khi outbox/worker bị trễ

## preconditions (điều kiện tiên quyết)

- source data đọc được
- read model (mô hình dữ liệu đọc) service (lớp xử lý nghiệp vụ) khả dụng
- window refresh phải được xác định tường minh
- flow này là `full-window replace projection (chiếu lại toàn bộ cửa sổ ngày)`, không phải partial upsert không dọn rác

## Read set

- `events`
- `lunarEvents`
- `lunarEventOverrides`
- preference summaries
- vow summaries
- life release summaries

## write path (thứ tự ghi dữ liệu chuẩn)

1. Xác định cửa sổ ngày cần refresh.
2. Resolve source inputs theo từng ngày.
3. Compose toàn bộ projection mới cho từng ngày trong cửa sổ:
   - `dayTags`
   - `recommendedItems`
   - `recommendedWindows`
   - `vowHooks`
   - `lifeReleaseHooks`
   - `advisoryCards`
4. Nạp toàn bộ snapshot cũ trong cùng cửa sổ refresh.
5. Replace trạng thái cũ bằng trạng thái mới theo nguyên tắc:
   - record còn hợp lệ thì update hoặc replace
   - record không còn xuất hiện trong snapshot mới thì phải prune hoặc delete
   - không được giữ row cũ chỉ vì chúng đã tồn tại trước đó
6. Nếu window mới nhỏ hơn window cũ, toàn bộ rows nằm ngoài window mới nhưng thuộc scope refresh phải bị remove.
7. Append audit `practice-calendar.refresh` nếu là manual/admin run.
8. Nếu downstream reminder hoặc advisory consumer cần biết có refresh, append outbox event sau khi window mới đã ổn định.

## async (bất đồng bộ) side-effects

- nếu flow bật, append outbox event cho reminder candidate rebuild rồi để dispatcher phát execution job
- reminder candidate layer phải bám cùng nguyên tắc replace-window hoặc prune tương ứng, không giữ advice cũ âm thầm

## success result (kết quả thành công)

- read model (mô hình dữ liệu đọc) sẵn sàng cho route `GET /api/practice-calendar`.

## Errors

- `400`: input window không hợp lệ.
- `404`: source context bắt buộc không resolve được.
- `500`: lỗi compose hoặc persistence.

## Notes for AI/codegen

- Đây là derived read model (mô hình dữ liệu đọc) refresh, không được làm thay đổi ownership của event/lunar canonical data.
- Không dùng partial upsert không prune cho flow này.
- Mục tiêu là `fully derived, window-based projection (mô hình chiếu theo cửa sổ ngày, tính lại hoàn toàn)`.
- Recovery path chuẩn là recompute window hoặc replay signal, không patch từng row kiểu best effort.

# Apply Lunar Override

## Purpose

- Ghi ngoại lệ lịch âm hoặc rule hiển thị đặc biệt mà không làm mất canonical event/lunar owner boundary (ranh giới trách nhiệm).

## owner module (module sở hữu)

- `calendar`

## Actors

- `admin`
- `super-admin`

## trigger (điểm kích hoạt)

- Admin tạo hoặc cập nhật `lunarEventOverrides`.
- Admin archive/delete override cũ khi nó không còn nên tác động tới advisory projection.

## preconditions (điều kiện tiên quyết)

- Override target tồn tại.
- Rule override hợp lệ và không conflict hiển nhiên.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)

- Backend owner write cho `lunarEventOverrides`.

## Read set

- `lunarEvents`
- `lunarEventOverrides`
- event refs nếu override áp vào event cụ thể

## write path (thứ tự ghi dữ liệu chuẩn)

1. Resolve target lunar event/rule hiện tại.
2. Validate override payload.
3. Ghi canonical override vào `lunarEventOverrides`.
4. Append audit `event.override.apply`.

## async (bất đồng bộ) side-effects

- downstream notification chỉ nếu có producer đọc thay đổi lịch

## success result (kết quả thành công)

- read model (mô hình dữ liệu đọc) lịch âm giải được rule override mới.
- admin có thể preview lại advisory bị ảnh hưởng qua `POST /api/admin/calendar/advisory/preview`.

## Errors

- `400`: rule override không hợp lệ.
- `404`: target không tồn tại.
- `409`: override conflict.
- `500`: lỗi service (lớp xử lý nghiệp vụ).

## Audit

- log `event.override.apply`

## Idempotency / anti-spam

- cùng target + cùng rule update thì chỉ sửa canonical override hiện có.

## Performance target

- write path (thứ tự ghi dữ liệu chuẩn) đơn giản, không phụ thuộc search/notification.

## Notes for AI/codegen

- Override là canonical của module calendar, không đẩy logic này sang content hay engagement.
- Admin lifecycle canon không dừng ở create:
  - `GET /api/admin/calendar/lunar-overrides`
  - `GET /api/admin/calendar/lunar-overrides/:publicId`
  - `POST /api/admin/calendar/lunar-overrides`
  - `PATCH /api/admin/calendar/lunar-overrides/:publicId`
  - `DELETE /api/admin/calendar/lunar-overrides/:publicId`
- Với rule family như `luc_trai_days`, payload nên giữ field có cấu trúc cho `dayRole`, `recommendedActions`, `warningProfile`, `fallbackSuggestions`, không chỉ 1 đoạn note text.

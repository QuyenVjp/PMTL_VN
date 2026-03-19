# Refresh Personal Practice Calendar

## Purpose
- Làm mới `personalPracticeCalendarReadModel` khi lịch âm, preference, vow, hoặc phóng sanh context thay đổi.

## Owner module
- `calendar`

## Actors
- `system`
- `admin` khi chạy thủ công

## Trigger
- event/lunar data thay đổi
- preference summary thay đổi
- vow milestone hoặc life-release summary thay đổi

## Preconditions
- source data đọc được
- read model service khả dụng

## Read set
- `events`
- `lunarEvents`
- `lunarEventOverrides`
- preference summaries
- vow summaries
- life release summaries

## Write path
1. Xác định cửa sổ ngày cần refresh.
2. Resolve source inputs theo từng ngày.
3. Compose `dayTags`, `recommendedItems`, `recommendedWindows`.
4. Upsert `personalPracticeCalendarReadModel`.
5. Append audit `practice-calendar.refresh` nếu là manual/admin run.

## Async side-effects
- enqueue reminder candidate rebuild nếu flow bật

## Success result
- Read model sẵn sàng cho route `GET /api/practice-calendar`.

## Errors
- `400`: input window không hợp lệ.
- `404`: source context bắt buộc không resolve được.
- `500`: lỗi compose hoặc persistence.

## Notes for AI/codegen
- Đây là derived read model refresh, không được làm thay đổi ownership của event/lunar canonical data.

# Reschedule Or Cancel Event

## Purpose

- đổi thời gian hoặc hủy sự kiện một cách explicit, có reason và audit, để public FE và notification consumer cùng hiểu đúng trạng thái

## Owner module

- `calendar`

## Actors

- `admin`
- `super-admin`

## Trigger

- admin dùng action `Reschedule` hoặc `Cancel` trong event workspace

## Preconditions

- event tồn tại
- event chưa ở trạng thái terminal không cho sửa theo policy
- reason được nhập nếu cancel hoặc reschedule làm thay đổi public commitment

## Input contract

### Reschedule
- `newStartAt`
- `newEndAt`
- `reason`

### Cancel
- `reason`
- `publicNotice?`

## Read set

- `events`
- `event_agenda_items`
- optional notification/reminder refs nếu phase đó đã bật

## Write path

### Reschedule
1. validate new time range
2. update `events.startAt/endAt`
3. mark reminder context changed
4. append audit `calendar.event.reschedule`

### Cancel
1. set lifecycle/status sang canceled theo policy
2. persist cancel reason/public notice
3. append audit `calendar.event.cancel`

## Async side-effects

- refresh public detail/listing cache
- downstream reminder cancellation/resync nếu notification phase đã bật

## Success result

- event listing và detail page hiển thị trạng thái mới rõ ràng
- admin history giữ được lý do thay đổi

## Errors

- `400`: time range sai hoặc thiếu reason
- `401`: chưa đăng nhập
- `403`: role không đủ
- `404`: event không tồn tại
- `409`: invalid transition
- `500`: persist/audit/refresh fail

## Notes for AI/codegen

- không patch mơ hồ `status` trực tiếp từ generic edit form nếu bản chất là reschedule/cancel.
- public FE phải có banner trạng thái rõ khi event đã canceled hoặc rescheduled.

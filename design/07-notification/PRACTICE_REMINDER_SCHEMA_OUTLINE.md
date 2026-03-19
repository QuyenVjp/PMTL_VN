# Practice Reminder schema (lược đồ dữ liệu) Outline

## owner module (module sở hữu)
- `07-notification`

## Không cần collection canonical mới nếu `pushJobs` đủ

Reminder có thể được encode như một `pushJobs` variant với metadata rõ.

## Nếu cần tách riêng

Collection candidate:
- `reminderSchedules`

### Fields
- `id`
- `user`
- `sourceType`
  - `daily_practice`
  - `vow_milestone`
  - `life_release_day`
  - `baihua_night_reading`
- `sourceRef`
- `scheduleKey`
- `timezone`
- `nextRunAt`
- `isActive`
- `dedupeWindowMinutes`

## Khuyến nghị hiện tại

- phase đầu:
  - derive reminder candidates từ calendar/vow/engagement
  - materialize vào `pushJobs`
- phase sau:
  - nếu reminder phức tạp hơn, thêm `reminderSchedules`

## service (lớp xử lý nghiệp vụ) boundary (ranh giới trách nhiệm)

- `practice-reminder.service (lớp xử lý nghiệp vụ).ts`
  - build reminder candidates
  - dedupe same-window reminders
  - create push jobs


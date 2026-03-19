# Practice Calendar schema (lược đồ dữ liệu) Outline

## owner module (module sở hữu)
- `06-calendar`

## Mục tiêu
- bổ sung lớp tag và rule cho `Lịch tu học` mà không phá owner của event/lunar data hiện tại

## Option A. Không thêm collection mới

Giữ:
- `Events`
- `LunarEvents`
- `LunarEventOverrides`

Và build read model (mô hình dữ liệu đọc) ở service (lớp xử lý nghiệp vụ):
- `practiceDayTags`
- `recommendedPracticeWindows`
- `lifeReleaseSuggestion`

Ưu điểm:
- ít migration

## Option B. Thêm `practiceCalendarRules`

### Fields
- `id`
- `ruleType`
  - `monthly_day`
  - `bodhisattva_day`
  - `vegetarian_day`
  - `golden_hour`
- `title`
- `description`
- `lunarMonth`
- `lunarDay`
- `solarFallbackRule`
- `timeWindowStart`
- `timeWindowEnd`
- `priority`
- `isActive`

## Khuyến nghị hiện tại

- phase đầu dùng Option A
- chỉ thêm collection rule khi business rule bắt đầu quá dày và khó maintain bằng code/config

## service (lớp xử lý nghiệp vụ) boundary (ranh giới trách nhiệm)

- `calendar-practice.service (lớp xử lý nghiệp vụ).ts`
  - resolve practice day tags
  - compose personal practice calendar
  - emit reminder candidates


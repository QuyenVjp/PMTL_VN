# Practice Calendar Schema Outline

## Owner module
- `06-calendar`

## Mục tiêu
- bổ sung lớp tag và rule cho `Lịch tu học` mà không phá owner của event/lunar data hiện tại

## Option A. Không thêm collection mới

Giữ:
- `Events`
- `LunarEvents`
- `LunarEventOverrides`

Và build read model ở service:
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

## Service boundary

- `calendar-practice.service.ts`
  - resolve practice day tags
  - compose personal practice calendar
  - emit reminder candidates

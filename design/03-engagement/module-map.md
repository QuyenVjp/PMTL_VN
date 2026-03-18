# Engagement Module

> Ghi chú cho sinh viên:
> Engagement ở đây chủ yếu là dữ liệu cá nhân của người dùng, không phải dữ liệu nội dung công khai.

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Engagement Module

## Mục tiêu
- giữ toàn bộ self-owned user state ngoài content
- mô tả bookmark, reading progress, practice preference, practice log
- tránh để editorial module ôm dữ liệu cá nhân

## Current scope

### Sutra reading state
- `sutraBookmarks`
- `sutraReadingProgress`

### Practice user state
- `chantPreferences`
- `practiceLogs`

## Referenced supporting data

### Scripture references
- `sutras`
- `sutraChapters`

### Practice references
- `chantItems`
- `chantPlans`
- các rule/script/checklist này do content sở hữu, engagement chỉ đọc qua reference

## Current responsibilities

### Bookmark
- lưu điểm đánh dấu trong sutra
- lưu excerpt/note cá nhân

### Reading progress
- lưu chapter/paragraph gần nhất
- lưu scroll percent và last read time

### Practice configuration
- user bật/tắt optional items
- set target hoặc intention theo chant item

### Practice history
- ghi log buổi công phu theo ngày và plan
- lưu item states, thời gian bắt đầu/kết thúc, notes

## Current boundaries

### Engagement owns
- self-owned user state

### Engagement does not own
- canonical sutra content
- editorial content
- moderation reports
- notification delivery

## Assumption
- `chantItems` và `chantPlans` là practice reference data hỗ trợ engagement flows.
- Module này chỉ mô tả phần user-state và quan hệ với các reference đó.
- các tài liệu PDF như niệm hằng ngày, phóng sinh, và Ngôi Nhà Nhỏ được chuẩn hóa trước ở `design/01-content/practice-support-reference.md`

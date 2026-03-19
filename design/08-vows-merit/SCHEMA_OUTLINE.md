# Vows & Merit Schema Outline

## Owner module
- `08-vows-merit`

## Collection candidate 1: `vows`

### Purpose
- record lời nguyện canonical của user

### Core fields
- `id`
- `publicId`
- `user`
- `vowType`
  - `vegetarian`
  - `chanting_target`
  - `ngoi_nha_nho_target`
  - `life_release_target`
  - `custom`
- `title`
- `description`
- `status`
  - `active`
  - `fulfilled`
  - `paused`
  - `broken`
- `startDate`
- `dueDate`
- `targetMetricType`
  - `count`
  - `days`
  - `sessions`
  - `custom`
- `targetValue`
- `currentValue`
- `fulfilledAt`
- `notes`

### Rules
- một user có thể có nhiều vows
- nhưng policy có thể chặn nhiều vow `active` trùng cùng loại

## Collection candidate 2: `vowProgressEntries`

### Purpose
- lưu mốc tiến độ hoặc điều chỉnh có ý nghĩa

### Fields
- `vow`
- `deltaValue`
- `entryDate`
- `sourceType`
  - `manual`
  - `practice_log`
  - `life_release_journal`
  - `system_adjustment`
- `notes`

## Collection candidate 3: `lifeReleaseJournal`

### Purpose
- sổ tay phóng sanh canonical

### Core fields
- `id`
- `publicId`
- `user`
- `releaseDate`
- `locationNote`
- `species`
- `quantity`
- `unit`
- `dedicationNote`
- `notes`
- `linkedVow`
- `linkedPracticeDayTag`
- `status`
  - `planned`
  - `completed`
  - `cancelled`

### Checklist snapshot fields
- `ritualChecklistSnapshot`
- `chantRefs`
- `contentGuideRefs`

## Service boundary

- `vows.service.ts`
  - create vow
  - pause/resume vow
  - fulfill vow
  - append progress
- `life-release.service.ts`
  - create journal
  - attach ritual snapshots
  - derive reminder candidates

## Notes for AI/codegen

- `Vows` và `LifeReleaseJournal` là canonical self-owned records riêng.
- Không nhét vào `practiceLogs` hay `communityPosts`.

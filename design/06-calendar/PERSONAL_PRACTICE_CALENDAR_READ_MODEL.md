# Personal Practice Calendar Read Model

## Mục tiêu
- mô tả read model cho `Lịch tu học cá nhân`
- giúp AI/codegen hiểu rõ canonical data nào nằm ở calendar, data nào chỉ được join tạm

## Canonical owner
- `06-calendar`

## Read model name
- `personalPracticeCalendarReadModel`

## Sources được phép compose
- `events`
- `lunarEvents`
- `lunarEventOverrides`
- `chantPreferences` summary
- `practiceSheets` summary
- `vows` milestone summary
- `lifeReleaseJournal` recency summary

## Output shape gợi ý
- `date`
- `lunarLabel`
- `dayTags`
  - `ngay_via`
  - `trai_gioi`
  - `ngay_phong_sanh_goi_y`
  - `golden_hour`
- `recommendedItems`
- `recommendedWindows`
- `vowHooks`
- `lifeReleaseHooks`
- `notesVi`
- `notesEn`

## Rule quan trọng
- đây là read model tổng hợp, không phải nơi lưu event canonical
- nếu source module khác lỗi, read model được phép degrade nhẹ thay vì fail cứng toàn màn hình
- push reminder đọc từ read model hoặc cùng source inputs, nhưng không sở hữu nó

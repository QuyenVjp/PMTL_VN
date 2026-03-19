# Schedule Practice Reminder

## Purpose
- Tạo reminder cho bài tập hằng ngày, phát nguyện hoặc phóng sanh dựa trên lịch tu học cá nhân.

## Owner module
- `notification`

## Actors
- system
- `member` khi cấu hình reminder

## Trigger
- User bật reminder hoặc hệ thống recompute lịch nhắc từ calendar/vow context.

## Preconditions
- Có reminder preferences hợp lệ.
- Có target context từ calendar, engagement hoặc vows-merit.

## Read set
- `pushSubscriptions`
- calendar reminder candidates
- engagement preference summary
- vow/life-release reminder candidates

## Success result
- Reminder job được tạo đúng ngữ cảnh tu học.

## Notes for AI/codegen
- notification chỉ điều phối; không sở hữu vow hay practice canonical data.

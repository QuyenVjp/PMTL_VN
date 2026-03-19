# Schedule Practice Reminder

## Purpose
- Tạo reminder cho bài tập hằng ngày, phát nguyện hoặc phóng sanh dựa trên lịch tu học cá nhân.

## owner module (module sở hữu)
- `notification`

## Actors
- system
- `member` khi cấu hình reminder

## trigger (điểm kích hoạt)
- User bật reminder hoặc hệ thống recompute lịch nhắc từ calendar/vow context.

## preconditions (điều kiện tiên quyết)
- Có reminder preferences hợp lệ.
- Có target context từ calendar, engagement hoặc vows-merit.

## Read set
- `pushSubscriptions`
- calendar reminder candidates
- engagement preference summary
- vow/life-release reminder candidates

## success result (kết quả thành công)
- Reminder job được tạo đúng ngữ cảnh tu học.

## Notes for AI/codegen
- notification chỉ điều phối; không sở hữu vow hay practice canonical data.


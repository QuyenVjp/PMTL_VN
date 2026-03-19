# Study Bai Thoai Phat Phap

## Purpose
- Hỗ trợ người dùng đọc hoặc nghe `Bạch thoại Phật pháp` theo trải nghiệm tối giản, rõ chữ, phù hợp học ban đêm và người lớn tuổi.

## Owner module
- `wisdom-qa`

## Actors
- `guest`
- `member`

## Trigger
- User mở một bài hoặc một tập `Bạch thoại Phật pháp`.

## Preconditions
- Entry tồn tại trong library/index.

## Read set
- content canonical entry
- wisdom reading model
- offline bundle nếu có

## Success result
- User đọc được text lớn, rõ.
- Nếu có audio/video thì có thể nghe/xem kèm.

## Notes for AI/codegen
- Đây là learning surface, không phải blog feed.
- Ưu tiên chữ to, tương phản cao, ít nhiễu.

# Log Life Release

## Purpose
- Ghi lại một lần `phóng sanh` như một thực hành cá nhân có ngữ cảnh, không chỉ là log rời rạc.

## Owner module
- `vows-merit`

## Actors
- `member`

## Trigger
- User bấm lưu một mục trong `Sổ tay Phóng sanh`.

## Preconditions
- Có session hợp lệ.
- Dữ liệu ngày, loại vật và số lượng hợp lệ.

## Input contract
- body nên gồm:
  - date
  - locationNote
  - species
  - quantity
  - dedicationNote nếu policy cho phép
  - ritualChecklistRefs

## Read set
- auth session
- content references cho bài đọc và nghi thức hỗ trợ
- calendar important days nếu user muốn gắn context

## Write path
1. Resolve user từ session.
2. Validate payload.
3. Tạo canonical `lifeReleaseJournal` record.
4. Gắn refs tới bài đọc/nghi thức hỗ trợ nếu có.
5. Append audit `life-release.log`.

## Async side-effects
- optional reminder follow-up

## Success result
- User có một bản ghi phóng sanh rõ ràng, có thể xem lại và đối chiếu theo ngày quan trọng.

## Errors
- `400`: thiếu date/species/quantity.
- `401`: chưa đăng nhập.
- `500`: lỗi service.

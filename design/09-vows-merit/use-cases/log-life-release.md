# Log Life Release

## Purpose

- Ghi lại một lần `Phóng sanh` như một thực hành cá nhân có ngữ cảnh, không chỉ là log rời rạc.

## Owner module

- `vows-merit`

## Actors

- `member`
- `admin` khi nhập giúp hoặc sửa giúp cho `member`

## Trigger

- User bấm lưu một mục trong `Sổ tay Phóng sanh`.

## Preconditions

- Có session hợp lệ.
- Dữ liệu ngày, loại vật, và số lượng hợp lệ.
- Nếu có source-backed rule refs thì link nguồn phải rõ.
- Nếu là cross-user action thì actor phải có quyền `admin` trở lên và phải chỉ rõ owner record.

## Input contract

- body nên gồm:
  - `releaseDate`
  - `locationNote`
  - `species`
  - `quantity`
  - `unit`
  - `dedicationNote` nếu policy cho phép
  - `ritualChecklistRefs`
  - optional `practiceRuleRefs` cho các khai thị hoặc rule liên quan
  - optional `guideContextRef`
  - optional `ritualVariantRef`
  - optional `advisoryContextRef`
  - optional `linkedVowId`
  - optional `linkedPracticeDayTag`
  - optional `ownerUserId` khi `admin` nhập giúp
  - optional `operation`:
    - `create`
    - `correct`
    - `void`

## Read set

- auth session
- actor role / permission context
- content references cho bài đọc và nghi thức hỗ trợ
- calendar important days nếu user muốn gắn context
- optional `vows` nếu user liên kết record này với một vow
- source-backed entries từ `09-wisdom-qa` nếu user gắn rule refs

## Write path

1. Resolve `actor` từ session và resolve `owner`:
   - mặc định `owner = actor`
   - nếu có `ownerUserId`, chỉ `admin` hoặc `super-admin` mới được phép ghi giúp
2. Validate payload và operation.
3. Nếu là cross-user action, bắt buộc audit đủ:
   - `actorUserId`
   - `ownerUserId`
   - lý do hỗ trợ nếu policy yêu cầu
4. Với `create`, tạo canonical `lifeReleaseJournal` record cho owner.
5. Với `correct`, update record hiện có nhưng giữ nguyên lịch sử audit:
   - không xóa audit cũ
   - không ghi đè làm mất actor/owner chain trước đó
6. Với `void`, đánh dấu record là void hoặc equivalent tombstone theo implementation:
   - không hard delete âm thầm
   - phải xác định deterministic rollback path cho mọi `vowProgressEntry` đã được áp dụng từ record này
7. Gắn refs tới bài đọc hoặc nghi thức hỗ trợ nếu có.
8. Nếu user đi vào từ public guide hoặc advisory, lưu `guideContextRef`, `ritualVariantRef`, `advisoryContextRef` để FE mở lại đúng companion panel.
9. Nếu user chọn rule tham chiếu chính thống, gắn source-linked note vào record:
   - original text
   - Vietnamese translation
   - source URL
   - source code hoặc timestamp nếu có
   - review status
10. Nếu rule có `same-day` guidance thì lưu như `practiceRuleRef`, không hard-code thành logic bất biến của module.
11. Nếu operation là `create` hoặc `correct` và record này đóng góp vào một vow, append hoặc recompute `vowProgressEntry` tương ứng qua owner flow của vows-merit.
12. Nếu operation là `void`, rollback hoặc neutralize toàn bộ vow progress đã phát sinh từ record này theo đường deterministic.
13. Append audit `life-release.log`.
14. Nếu cần reminder follow-up, calendar refresh, hoặc notification downstream, append outbox event tương ứng sau khi canonical state đã ổn định.

## Async side-effects

- optional reminder follow-up
- optional update reminder candidates cho ngày phóng sanh

## Success result

- User có một bản ghi phóng sanh rõ ràng, có thể xem lại và đối chiếu theo ngày quan trọng.
- Nếu có rule đi kèm, user xem lại được cả nguyên văn + bản dịch + link gốc để tự kiểm duyệt.

## Errors

- `400`: thiếu `releaseDate`, `species`, hoặc `quantity`.
- `401`: chưa đăng nhập.
- `404`: linked vow hoặc source ref không tồn tại.
- `409`: duplicate submit rõ ràng do idempotency conflict.
- `403`: cross-user action không đủ quyền hoặc target owner nằm ngoài scope được hỗ trợ.
- `500`: lỗi service.

## Audit

- bắt buộc append `life-release.log`
- audit nên giữ:
  - actor user
  - owner user
  - ngày phóng sanh
  - loại vật
  - số lượng
  - operation (`create` / `correct` / `void`)
  - linked vow nếu có
  - source refs được gắn thêm nếu có

## Idempotency / anti-spam

- nếu UI có `clientEventId`, service nên dedupe theo `user + clientEventId`
- nếu không có `clientEventId`, UI vẫn nên chặn double-submit trong thời gian ngắn
- record phóng sanh không được tự biến thành community post nếu user chưa explicit share
- replay outbox không được tạo duplicate progress/reminder cho cùng canonical journal entry.

## Performance target

- create journal nên hoàn tất `< 700ms`
- phần prepare reminder hoặc sync sang notification phải ở downstream async path

## Notes

- `lifeReleaseJournal` là canonical self-owned record.
- Community share, nếu có, phải là export flow riêng; không dùng record này làm social post mặc định.
- Assisted entry được phép, nhưng luôn phải tách rõ `actor` và `owner`.
- `Void` phải rollback vow progress một cách deterministic, không rollback cảm tính.
- Recovery path chuẩn là replay signal hoặc recompute progress summary từ source records.

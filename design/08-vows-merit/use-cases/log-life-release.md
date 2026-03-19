# Log Life Release

## Purpose
- Ghi lại một lần `Phóng sanh` như một thực hành cá nhân có ngữ cảnh, không chỉ là log rời rạc.

## Owner module
- `vows-merit`

## Actors
- `member`

## Trigger
- User bấm lưu một mục trong `Sổ tay Phóng sanh`.

## Preconditions
- Có session hợp lệ.
- Dữ liệu ngày, loại vật, và số lượng hợp lệ.
- Nếu có source-backed rule refs thì link nguồn phải rõ.

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
  - optional `linkedVowId`
  - optional `linkedPracticeDayTag`

## Read set
- auth session
- content references cho bài đọc và nghi thức hỗ trợ
- calendar important days nếu user muốn gắn context
- optional `vows` nếu user liên kết record này với một vow
- source-backed entries từ `09-wisdom-qa` nếu user gắn rule refs

## Write path
1. Resolve user từ session.
2. Validate payload.
3. Tạo canonical `lifeReleaseJournal` record.
4. Gắn refs tới bài đọc hoặc nghi thức hỗ trợ nếu có.
5. Nếu user chọn rule tham chiếu chính thống, gắn source-linked note vào record:
   - original text
   - Vietnamese translation
   - source URL
   - source code hoặc timestamp nếu có
   - review status
6. Nếu rule có `same-day` guidance thì lưu như `practiceRuleRef`, không hard-code thành logic bất biến của module.
7. Nếu record này đóng góp vào một vow, append `vowProgressEntry` tương ứng qua owner flow của vows-merit.
8. Append audit `life-release.log`.

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
- `500`: lỗi service.

## Audit
- bắt buộc append `life-release.log`
- audit nên giữ:
  - ngày phóng sanh
  - loại vật
  - số lượng
  - linked vow nếu có
  - source refs được gắn thêm nếu có

## Idempotency / anti-spam
- nếu UI có `clientEventId`, service nên dedupe theo `user + clientEventId`
- nếu không có `clientEventId`, UI vẫn nên chặn double-submit trong thời gian ngắn
- record phóng sanh không được tự biến thành community post nếu user chưa explicit share

## Performance target
- create journal nên hoàn tất `< 700ms`
- phần prepare reminder hoặc sync sang notification phải ở downstream async path

## Notes
- `lifeReleaseJournal` là canonical self-owned record.
- Community share, nếu có, phải là export flow riêng; không dùng record này làm social post mặc định.

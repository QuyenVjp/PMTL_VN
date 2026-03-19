# Log Life Release

## Purpose
- Ghi lại một lần `phóng sanh` như một thực hành cá nhân có ngữ cảnh, không chỉ là log rời rạc.

## owner module (module sở hữu)
- `vows-merit`

## Actors
- `member`

## trigger (điểm kích hoạt)
- User bấm lưu một mục trong `Sổ tay Phóng sanh`.

## preconditions (điều kiện tiên quyết)
- Có session hợp lệ.
- Dữ liệu ngày, loại vật và số lượng hợp lệ.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)
- body nên gồm:
  - date
  - locationNote
  - species
  - quantity
  - dedicationNote nếu policy cho phép
  - ritualChecklistRefs
  - optional `practiceRuleRefs` cho các khai thị hoặc rule liên quan

## Read set
- auth session
- content references cho bài đọc và nghi thức hỗ trợ
- calendar important days nếu user muốn gắn context

## write path (thứ tự ghi dữ liệu chuẩn)
1. Resolve user từ session.
2. Validate payload.
3. Tạo canonical `lifeReleaseJournal` record.
4. Gắn refs tới bài đọc/nghi thức hỗ trợ nếu có.
5. Nếu user chọn rule tham chiếu chính thống, gắn source-linked note vào record:
   - original text
   - Vietnamese translation
   - source URL
   - source code / timestamp nếu có
   - review status (trạng thái kiểm duyệt)
6. Nếu rule có `same-day` guidance thì lưu như `practiceRuleRef`, không hard-code thành logic bất biến của module.
7. Append audit `life-release.log`.

## async (bất đồng bộ) side-effects
- optional reminder follow-up

## success result (kết quả thành công)
- User có một bản ghi phóng sanh rõ ràng, có thể xem lại và đối chiếu theo ngày quan trọng.
- Nếu có rule đi kèm, user xem lại được cả nguyên văn + bản dịch + link gốc để tự kiểm duyệt.

## Errors
- `400`: thiếu date/species/quantity.
- `401`: chưa đăng nhập.
- `500`: lỗi service (lớp xử lý nghiệp vụ).


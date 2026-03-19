# Submit Guestbook Entry

## Purpose
- Ghi một lời lưu bút hoặc câu hỏi của cộng đồng vào `guestbookEntries` với boundary (ranh giới trách nhiệm) approval/moderation rõ ràng.

## owner module (module sở hữu)
- `community`

## Actors
- `guest`
- `member`

## trigger (điểm kích hoạt)
- Web gọi `POST /api/guestbook/submit`.

## preconditions (điều kiện tiên quyết)
- Body JSON hợp lệ.
- `guestbookSubmitSchema` pass.
- Request guard và policy nội dung không chặn.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)
- `guestbookSubmitSchema`
- route proxy forward correlation id và IP forwarding metadata theo policy hiện tại

## Read set
- request guard
- `guestbookEntries`

## write path (thứ tự ghi dữ liệu chuẩn)
1. Parse JSON body.
2. Validate schema (lược đồ dữ liệu).
3. Ghi canonical entry vào `guestbookEntries`.
4. Gán approval/moderation summary theo policy hiện tại.
5. Append audit `guestbook.submit`.
6. Enqueue notification cho admin/super-admin nếu cần duyệt.

## async (bất đồng bộ) side-effects
- internal moderation notification

## success result (kết quả thành công)
- Guestbook record được tạo thành công.
- Entry hiển thị ngay hoặc chờ approval tùy policy.

## Errors
- `400`: JSON/body không hợp lệ.
- `429`: request guard chặn.
- `500`: proxy/CMS/service (lớp xử lý nghiệp vụ) lỗi.

## Audit
- log `guestbook.submit`

## Idempotency / anti-spam
- request guard là lớp chặn spam chính.
- hashed IP hoặc fingerprint chỉ là abuse context, không là public contract (hợp đồng dữ liệu/nghiệp vụ).

## Performance target
- submit nên trả nhanh, không đợi notification gửi xong.

## Notes for AI/codegen
- Guestbook approval summary không thay thế moderation source record nếu entry bị report sau này.


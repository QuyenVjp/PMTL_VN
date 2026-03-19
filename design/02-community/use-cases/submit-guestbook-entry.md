# Submit Guestbook Entry

## Purpose
- Ghi một lời lưu bút hoặc câu hỏi của cộng đồng vào `guestbookEntries` với boundary approval/moderation rõ ràng.

## Owner module
- `community`

## Actors
- `guest`
- `member`

## Trigger
- Web gọi `POST /api/guestbook/submit`.

## Preconditions
- Body JSON hợp lệ.
- `guestbookSubmitSchema` pass.
- Request guard và policy nội dung không chặn.

## Input contract
- `guestbookSubmitSchema`
- route proxy forward correlation id và IP forwarding metadata theo policy hiện tại

## Read set
- request guard
- `guestbookEntries`

## Write path
1. Parse JSON body.
2. Validate schema.
3. Ghi canonical entry vào `guestbookEntries`.
4. Gán approval/moderation summary theo policy hiện tại.
5. Append audit `guestbook.submit`.
6. Enqueue notification cho admin/super-admin nếu cần duyệt.

## Async side-effects
- internal moderation notification

## Success result
- Guestbook record được tạo thành công.
- Entry hiển thị ngay hoặc chờ approval tùy policy.

## Errors
- `400`: JSON/body không hợp lệ.
- `429`: request guard chặn.
- `500`: proxy/CMS/service lỗi.

## Audit
- log `guestbook.submit`

## Idempotency / anti-spam
- request guard là lớp chặn spam chính.
- hashed IP hoặc fingerprint chỉ là abuse context, không là public contract.

## Performance target
- submit nên trả nhanh, không đợi notification gửi xong.

## Notes for AI/codegen
- Guestbook approval summary không thay thế moderation source record nếu entry bị report sau này.

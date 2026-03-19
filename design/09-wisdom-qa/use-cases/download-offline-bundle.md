# Download Offline Wisdom Bundle

## Purpose
- Cho phép người dùng tải về một gói `Bạch thoại Phật pháp` hoặc `Huyền học vấn đáp` để đọc hoặc nghe khi không có mạng.

## Owner module
- `wisdom-qa`

## Actors
- `member`

## Trigger
- User bấm tải offline trên một entry hoặc một bundle curated.

## Preconditions
- Bundle hoặc entry đã publish.
- Asset nguồn hợp lệ và có metadata phiên bản.
- Nếu flow lưu state theo user hoặc device thì khóa định danh phải hợp lệ.

## Input contract
- `bundlePublicId` hoặc `entryPublicId`
- `deviceProfile`
- `preferredLanguage`
- optional `deviceKey`
- bundle manifest payload và package job payload phải có schema runtime rõ

## Read set
- `wisdomEntries`
- `qaEntries`
- `offlineBundles`
- media/audio/video refs

## Write path
1. Resolve bundle hoặc tạo derived bundle metadata từ entry được chọn.
2. Validate quyền đọc.
3. Trả manifest tải xuống và version hiện tại.
4. Nếu cần lưu trạng thái cá nhân, append hoặc update `offlineBundles` state cho user hoặc device.
5. Append audit nhẹ `wisdom.bundle.download` nếu policy cần.
6. Nếu package cần build hoặc repair, append outbox event cho bundle prepare/rebuild thay vì làm fire-and-forget không kiểm soát.

## Async side-effects
- prepare asset package
- prefetch audio/text indexes nếu worker flow bật
- cleanup bundle versions cũ nếu policy bật

## Success result
- User có thể mở đúng nội dung offline, chữ to, rõ, và không phụ thuộc mạng.
- Bundle chỉ chứa nội dung đã duyệt từ nguồn chính thống hoặc official mirror hợp lệ.

## Errors
- `400`: yêu cầu bundle không hợp lệ.
- `401`: chưa đăng nhập nếu flow yêu cầu user-scoped download state.
- `404`: bundle hoặc entry không tồn tại hoặc chưa publish.
- `409`: bundle version conflict hoặc device key conflict.
- `500`: lỗi manifest hoặc media packaging.

## Audit
- download thường ngày chỉ cần audit nhẹ nếu policy yêu cầu
- nếu có cleanup hoặc repair bundle quản trị thì phải audit riêng

## Idempotency / anti-spam
- cùng `user + device + bundle version` không nên tạo trùng nhiều record
- nên dedupe theo `bundleType + version + user/device`
- replay outbox không được tạo duplicate package job cho cùng bundle version và cùng target scope.

## Performance target
- trả manifest nên `< 500ms`
- prepare package nên là downstream async path nếu nặng

## Notes
- Không dùng AI tạo thêm tóm tắt hay câu trả lời mới trong offline package.
- Bundle offline phải giữ quan hệ rõ giữa bản gốc, bản dịch, và asset media đi kèm.
- Nếu bundle drift hoặc thiếu asset, recovery chuẩn là rebuild bundle từ source records và asset refs đã duyệt.

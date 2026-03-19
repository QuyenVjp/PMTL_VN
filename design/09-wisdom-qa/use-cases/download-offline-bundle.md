# Download Offline Wisdom Bundle

## Purpose
- Cho phép người dùng tải về một gói `Bạch thoại Phật pháp` hoặc `Huyền học vấn đáp` để đọc/nghe khi không có mạng.

## Owner module
- `wisdom-qa`

## Actors
- `member`

## Trigger
- User bấm tải offline trên một entry hoặc một bundle curated.

## Preconditions
- Bundle hoặc entry đã publish.
- Asset nguồn hợp lệ và có metadata phiên bản.

## Input contract
- `bundlePublicId` hoặc `entryPublicId`
- `deviceProfile`
- `preferredLanguage`

## Read set
- `wisdomEntries`
- `qaEntries`
- `offlineBundles`
- media/audio/video refs

## Write path
1. Resolve bundle hoặc tạo derived bundle metadata từ entry được chọn.
2. Validate quyền đọc.
3. Trả manifest tải xuống và version hiện tại.
4. Nếu cần lưu trạng thái cá nhân, append/update offline bundle state cho user.
5. Append audit nhẹ `wisdom.bundle.download` nếu policy cần.

## Async side-effects
- prepare asset package
- prefetch audio/text indexes nếu worker flow bật

## Success result
- User có thể mở đúng nội dung offline, chữ to, rõ, và không phụ thuộc mạng.

## Errors
- `400`: yêu cầu bundle không hợp lệ.
- `401`: chưa đăng nhập nếu flow yêu cầu user-scoped download state.
- `404`: bundle/entry không tồn tại hoặc chưa publish.
- `500`: lỗi manifest hoặc media packaging.

## Notes for AI/codegen
- Offline bundle chỉ chứa nội dung đã duyệt từ nguồn chính thống.
- Không dùng AI tạo thêm tóm tắt hay câu trả lời mới trong offline package.

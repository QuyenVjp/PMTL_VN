# Download Offline Wisdom Bundle

## Purpose
- Cho phép người dùng tải về một gói `Bạch thoại Phật pháp` hoặc `Huyền học vấn đáp` để đọc/nghe khi không có mạng.

## owner module (module sở hữu)
- `wisdom-qa`

## Actors
- `member`

## trigger (điểm kích hoạt)
- User bấm tải offline trên một entry hoặc một bundle curated.

## preconditions (điều kiện tiên quyết)
- Bundle hoặc entry đã publish.
- Asset nguồn hợp lệ và có metadata phiên bản.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)
- `bundlePublicId` hoặc `entryPublicId`
- `deviceProfile`
- `preferredLanguage`

## Read set
- `wisdomEntries`
- `qaEntries`
- `offlineBundles`
- media/audio/video refs

## write path (thứ tự ghi dữ liệu chuẩn)
1. Resolve bundle hoặc tạo derived bundle metadata từ entry được chọn.
2. Validate quyền đọc.
3. Trả manifest tải xuống và version hiện tại.
4. Nếu cần lưu trạng thái cá nhân, append/update offline bundle (gói tải ngoại tuyến) state cho user.
5. Append audit nhẹ `wisdom.bundle.download` nếu policy cần.

## async (bất đồng bộ) side-effects
- prepare asset package
- prefetch audio/text indexes nếu worker (tiến trình xử lý nền) flow bật

## success result (kết quả thành công)
- User có thể mở đúng nội dung offline, chữ to, rõ, và không phụ thuộc mạng.

## Errors
- `400`: yêu cầu bundle không hợp lệ.
- `401`: chưa đăng nhập nếu flow yêu cầu user-scoped download state.
- `404`: bundle/entry không tồn tại hoặc chưa publish.
- `500`: lỗi manifest hoặc media packaging.

## Notes for AI/codegen
- offline bundle (gói tải ngoại tuyến) chỉ chứa nội dung đã duyệt từ nguồn chính thống.
- Không dùng AI tạo thêm tóm tắt hay câu trả lời mới trong offline package.


# Publish Beginner Guide

## Purpose
- Xuất bản một `Hướng dẫn sơ học` hoặc `Giới thiệu pháp môn` để người mới có thể đọc như một cửa vào chính thức của hệ thống.

## Owner module
- `content`

## Actors
- `admin`
- `super-admin`

## Trigger
- Admin lưu một `beginnerGuides` document và chuyển sang `published`.

## Preconditions
- Guide có tiêu đề, slug/publicId, nội dung chính, và block điều hướng cơ bản.
- Nếu guide đóng vai trò `entry guide`, metadata phải chỉ rõ vị trí điều hướng.

## Read set
- `beginnerGuides`
- relation media/download/hub nếu có

## Write path
1. Validate guide payload.
2. Chuẩn hóa `slug`, excerpt, search fields nếu dùng.
3. Ghi canonical record vào `beginnerGuides`.
4. Thiết lập `_status = published` và `publishedAt`.
5. Append audit `guide.publish`.
6. Enqueue search sync và revalidation nếu cần.

## Async side-effects
- search sync
- revalidation

## Success result
- Người mới có thể mở guide như một bề mặt chính thức để bắt đầu học.

## Errors
- `400`: guide thiếu nội dung hoặc metadata điều hướng cần thiết.
- `401`: chưa đăng nhập.
- `403`: không đủ quyền.
- `404`: relation ref không tồn tại.
- `409`: slug/publicId conflict.
- `500`: lỗi service hoặc downstream.

## Notes for AI/codegen
- `beginnerGuides` không phải blog post thường.
- Với entry guide, ưu tiên clarity hơn SEO/campaign style.

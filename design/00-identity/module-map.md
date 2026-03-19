# Identity Module

> Ghi chú cho sinh viên:
> File này chốt auth authority, user ownership, và role model thật của repo.

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Identity Module

## Mục tiêu
- mô tả auth authority hiện tại của repo
- làm rõ ownership của `users`
- làm rõ role model, block state, profile cơ bản
- chốt rõ Google login chỉ là provider, không phải auth authority thứ hai

## Authority
- Payload auth là auth authority duy nhất
- `apps/cms` sở hữu login/register/logout/reset-password/session flow
- Google login được phép tồn tại nhưng phải map về cùng `users` collection và cùng session authority của Payload
- Web chỉ tiêu thụ auth contract (hợp đồng dữ liệu/nghiệp vụ) từ CMS

## Collection thuộc module
- `users`

## Current responsibilities

### Auth lifecycle
- đăng ký bằng email/password
- đăng nhập bằng email/password
- đăng nhập bằng Google
- đăng xuất
- quên mật khẩu
- đặt lại mật khẩu
- lấy session hiện tại

### Identity data
- email
- full name
- username
- phone
- pháp danh / dharma name
- avatar
- bio
- `publicId` cho public-facing references khi cần
- provider compatibility fields như `googleSub`

### Authorization data
- role
- block state

## Current role model
- `super-admin`
- `admin`
  - business/UI label: `Phụng sự viên`
- `member`

## Current boundaries

### Identity owns
- user account
- auth/session lifecycle
- role assignment
- account block state
- provider linkage vào cùng account nếu có

### Identity does not own
- community content
- bookmarks / progress / practice sheets
- moderation reports
- push subscriptions
- content authorship records ngoài user ref

## References từ module khác
- content tham chiếu user làm author hoặc người phụ trách biên soạn
- community tham chiếu user hoặc snapshot author name
- engagement tham chiếu user làm owner
- moderation tham chiếu reporter, actor xử lý, target user
- notification tham chiếu user để resolve recipient

## Current rules
- không dùng auth framework thứ hai cho session hoặc đăng nhập
- không tạo users store thứ hai ngoài `users`
- role thay đổi bởi `super-admin` hoặc `admin` theo scope quản trị, không bởi public self-service (lớp xử lý nghiệp vụ) flow
- public profile chỉ nên lộ field đã map qua contract (hợp đồng dữ liệu/nghiệp vụ), không trả raw user document


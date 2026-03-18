# Identity Module

> Ghi chú cho sinh viên:
> File này giúp chốt một chuyện rất quan trọng: auth nằm ở Payload, không nằm rải ở web hay service khác.

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

## Authority
- Payload auth là auth authority duy nhất
- `apps/cms` sở hữu login/register/logout/reset-password flow
- Web chỉ tiêu thụ auth contract từ CMS

## Collection thuộc module
- `users`

## Current responsibilities

### Auth lifecycle
- đăng ký
- đăng nhập
- đăng xuất
- quên mật khẩu
- đặt lại mật khẩu
- lấy session hiện tại

### Identity data
- email
- full name
- username
- phone
- dharma name
- avatar
- bio
- publicId cho public-facing references khi cần

### Authorization data
- role
- block state

## Current role model
- `super-admin`
- `admin`
- `editor`
- `moderator`
- `member`

## Current boundaries

### Identity owns
- user account
- auth/session lifecycle
- role assignment
- account block state

### Identity does not own
- community content
- bookmarks / progress
- moderation reports
- push subscriptions
- content authorship records ngoài user ref

## References từ module khác
- content tham chiếu user làm author/editor
- community tham chiếu user hoặc snapshot author name
- engagement tham chiếu user làm owner
- moderation tham chiếu reporter/moderator/target user
- notification tham chiếu user để resolve recipient

## Current rules
- không dùng OAuth trong current design
- không dùng auth framework thứ hai cho session hoặc đăng nhập
- role thay đổi bởi admin scope, không bởi public self-service flow
- public profile chỉ nên lộ field đã map qua contract, không trả raw user document

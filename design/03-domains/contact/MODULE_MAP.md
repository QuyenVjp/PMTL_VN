# Contact Module (Liên hệ & Phụng Sự Viên)

> Ghi chú cho sinh viên:
> Module này rất nhẹ — chỉ giữ thông tin liên hệ chung và danh sách phụng sự viên.
> Không ôm logic phức tạp; chủ yếu là CRUD + public display.

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Contact Module (Liên hệ & Phụng Sự Viên)

## Mục tiêu

- cung cấp trang liên hệ công khai để người dùng biết ai đang phụng sự
- mỗi phụng sự viên (PSV) có avatar, tên, vai trò, link Zalo cá nhân
- admin quản lý danh sách PSV qua admin panel
- liên hệ trực tiếp qua Zalo link của từng PSV (không có form liên hệ)
- thông tin liên hệ chung (email, hotline, fanpage, Zalo OA)

## Collections thuộc module

### Static info
- `contactInfo` — singleton (1 record duy nhất chứa thông tin liên hệ chung)

### PSV directory
- `volunteers` — danh sách phụng sự viên

## Current responsibilities

### Public display
- hiển thị thông tin liên hệ chung
- hiển thị danh sách PSV active theo `sortOrder`
- mỗi PSV card có: avatar, tên, vai trò, nút "Liên hệ qua Zalo"

### Admin management
- CRUD volunteers (tạo / sửa / xóa / toggle active)
- sửa thông tin liên hệ chung

## References ra ngoài module

### Identity
- admin actor refs cho audit

### Content
- không tham chiếu content

### Community
- không tham chiếu community

## Những gì contact không sở hữu
- community content
- blog / bài viết
- user accounts / profiles
- guestbook entries (thuộc community)
- form liên hệ (liên hệ qua Zalo link trực tiếp)

## Key actors
- `guest` — xem trang liên hệ, nhắn Zalo
- `admin` — quản lý PSV
- `super-admin` — sửa thông tin liên hệ chung

## Current rules (Quy tắc hiện tại)
- `contactInfo` là singleton — chỉ update, không delete/create mới
- volunteers chỉ hiển thị khi `isActive = true`
- `sortOrder` quyết định thứ tự hiển thị
- Liên hệ qua Zalo link trực tiếp của từng PSV — không có form liên hệ
- Zalo link là URL format `https://zalo.me/...` — validate khi admin nhập
- avatar có thể upload hoặc dùng URL ngoài

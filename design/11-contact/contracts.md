# Contact Contracts

## Owner data

- `contactInfo` (singleton)
- `volunteers`

## Routes chính

### Public routes

- `GET /api/contact-info` — lấy thông tin liên hệ chung
- `GET /api/volunteers` — lấy danh sách PSV active, sắp xếp theo `sortOrder`

### Admin routes

- `GET /api/admin/contact-info` — lấy thông tin liên hệ chung (full fields)
- `PATCH /api/admin/contact-info` — cập nhật thông tin liên hệ chung
- `GET /api/admin/volunteers` — danh sách toàn bộ PSV (bao gồm inactive)
- `POST /api/admin/volunteers` — tạo PSV mới
- `PATCH /api/admin/volunteers/:publicId` — sửa PSV
- `DELETE /api/admin/volunteers/:publicId` — xóa PSV (soft delete)
- `PATCH /api/admin/volunteers/sort` — cập nhật thứ tự sắp xếp (batch)

## Permission baseline

- `guest`
  - GET contact-info, volunteers
- `admin`
  - full CRUD volunteers
- `super-admin`
  - update contact-info
  - override mọi thao tác admin

## Input expectations

### Volunteer create/update payload

- `displayName` (required, 2-100 chars)
- `role` (optional, default "Phụng sự viên", max 100 chars)
- `avatarUrl` (optional, URL hoặc media upload ref)
- `zaloLink` (optional, URL format `https://zalo.me/...`)
- `phoneNumber` (optional, E.164 format hoặc VN phone format)
- `bio` (optional, max 500 chars)
- `sortOrder` (optional, integer ≥ 0)
- `isActive` (optional, boolean, default true)

## Error expectations

- `400`
  - payload không hợp lệ (validation fail)
- `401`
  - route admin mà thiếu session
- `403`
  - role không đủ (vd: admin sửa contactInfo cần super-admin)
- `404`
  - volunteer không tồn tại
- `409`
  - duplicate volunteer (nếu có unique constraint)
- `500`
  - persistence error

## Notes for AI/codegen

- `contactInfo` là singleton — dùng `upsert` pattern, không tạo mới record.
- `volunteers` public response chỉ trả `displayName`, `role`, `avatarUrl`, `zaloLink`, `bio` — không trả `phoneNumber` hoặc internal fields.
- Zalo link validate bằng regex: `^https?://(zalo\.me|chat\.zalo\.me)/`.
- Liên hệ qua Zalo link của từng PSV thay vì form liên hệ — không cần `contactSubmissions`.

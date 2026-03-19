# Permission Matrix

File này chốt logic phân quyền thực dụng cho PMTL_VN.
Mục tiêu:

- tránh leo thang đặc quyền mơ hồ
- trả lời rõ `admin` được làm gì với dữ liệu của người khác
- giúp AI/codegen không tự bịa permission model

## Vai trò

### `super-admin`
- toàn quyền cross-module
- quản trị role, block state, recovery operation
- được xử lý hard delete nhạy cảm khi policy cho phép

### `admin` (`Phụng sự viên`)
- vai trò vận hành
- ôm editorial, moderation, support, operational actions trong current scope

### `member`
- người dùng thường
- chỉ được self-state và public/community action của chính mình

## Nguyên tắc phân quyền

- `admin` không đồng nghĩa với `owner-only editor`
- current scope không tách `editor` và `moderator` thành role riêng
- vì vậy `admin` được phép xử lý record của người khác trong scope vận hành
- nhưng `admin` không được chạm vào mọi thứ như `super-admin`

## Matrix theo hành động

| Hành động | super-admin | admin | member |
|---|---|---|---|
| Tạo/sửa/publish content | Có | Có | Không |
| Unpublish content | Có | Có | Không |
| Soft delete content | Có | Có nếu policy cho phép | Không |
| Hard delete content protected | Có | Không mặc định | Không |
| Xử lý moderation report | Có | Có | Không |
| Re-resolve decision của admin khác | Có | Có | Không |
| Resolve report trong super-admin protected scope | Có | Không | Không |
| Ẩn comment/post vi phạm | Có | Có | Không |
| Xóa comment/post của user khác theo moderation policy | Có | Có | Không |
| Sửa self-profile | Có | Có | Có |
| Sửa profile người khác | Có | Có theo support scope | Không |
| Đổi role member -> admin | Có | Không mặc định | Không |
| Đổi role admin/super-admin | Có | Không | Không |
| Block / unblock account | Có | Có theo policy | Không |
| Xem audit log nhạy cảm | Có | Có giới hạn | Không |
| trigger (điểm kích hoạt) reindex / worker (tiến trình xử lý nền) recovery | Có | Có | Không |

## Rule sở hữu dữ liệu của người khác

### Với `admin`
- được sửa hoặc ẩn bài/comment/report của người khác trong scope vận hành
- không bị giới hạn kiểu `chỉ sửa bài của mình` ở current scope
- lý do: current role model gộp editorial + moderation + support vào `admin`
- được re-resolve decision của admin khác nếu policy nghiệp vụ cho phép
- không được override action hoặc target nằm trong `super-admin protected scope`

### Với `super-admin`
- được vượt qua các giới hạn support thông thường
- dùng cho recovery, role change, hard delete, và incident response

### Với `member`
- không được sửa record của user khác
- không được gọi moderation/admin routes

## Hard delete rule

- `admin` mặc định không được hard delete record có downstream relations nhạy cảm
- nếu cleanup contract (hợp đồng dữ liệu/nghiệp vụ) chưa an toàn, chỉ `super-admin` mới được chạy hard delete
- flow thường ngày ưu tiên:
  - `soft delete`
  - `archive`
  - `unpublish`

## Notes for AI/codegen

- Đừng tự thêm logic `admin chỉ sửa bài của mình` nếu docs không ghi vậy.
- Đừng cho `admin` đổi hoặc tạo `super-admin`.
- Permission check phải tách:
  - `role gate`
  - `business rule`
  - `delete policy`


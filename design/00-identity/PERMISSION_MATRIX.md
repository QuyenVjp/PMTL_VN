# Permission Matrix (Ma trận Phân quyền)

Tài liệu này chốt practical authorization logic (logic phân quyền thực dụng) cho PMTL_VN.

## Objectives (Mục tiêu)

- prevent ambiguous privilege escalation (ngăn leo quyền mơ hồ)
- define what `admin` can do with third-party data (xác định rõ admin được làm gì với dữ liệu người khác)
- keep AI/codegen inside the established permission model (giữ AI/codegen không bẻ lệch mô hình phân quyền)

## Roles (Các vai trò)

### `super-admin` (Quản trị viên cấp cao)

- full cross-module authority (toàn quyền xuyên mô-đun)
- manages roles, block state, recovery operations (quản lý vai trò, trạng thái khóa, thao tác cứu hộ)
- authorized for hard delete when policy permits (được xóa cứng khi policy cho phép)

### `admin` (Quản trị viên / Phụng sự viên)

- operational role (vai trò vận hành)
- chịu editorial, moderation, support, và system operations trong current scope

### `member` (Thành viên)

- standard user (người dùng chuẩn)
- chỉ quản lý self-state và hành động công khai/cộng đồng của chính mình

## Authorization principles (Nguyên tắc phân quyền)

- `admin` không bị khóa vào logic `edit-own-only`
- current scope chưa tách `editor` và `moderator` thành role riêng
- `admin` được phép xử lý record của người khác khi đó là operational duty
- `super-admin` vẫn có protected scope riêng mà `admin` không được vượt qua

## Action matrix (Ma trận hành động)

| Action (Hành động) | super-admin | admin | member |
|---|---|---|---|
| Create/edit/publish content (Tạo/sửa/xuất bản nội dung) | Yes | Yes | No |
| Unpublish content (Hủy xuất bản nội dung) | Yes | Yes | No |
| Soft delete content (Xóa mềm nội dung) | Yes | Policy-based | No |
| Hard delete protected content (Xóa cứng nội dung nhạy cảm) | Yes | No by default | No |
| Resolve moderation reports (Xử lý báo cáo kiểm duyệt) | Yes | Yes | No |
| Re-resolve other admin decisions (Xử lý lại quyết định admin khác) | Yes | Yes | No |
| Access super-admin protected scope (Vào phạm vi bảo vệ của super-admin) | Yes | No | No |
| Hide violating content (Ẩn nội dung vi phạm) | Yes | Yes | No |
| Delete other's content via moderation (Xóa nội dung người khác qua moderation) | Yes | Yes | No |
| Edit self-profile (Sửa hồ sơ của mình) | Yes | Yes | Yes |
| Edit other's profile (Sửa hồ sơ người khác) | Yes | Support-based | No |
| Promote member to admin (Nâng member thành admin) | Yes | No by default | No |
| Modify admin/super-admin roles (Đổi vai trò admin/super-admin) | Yes | No | No |
| Block / unblock accounts (Khóa / mở khóa tài khoản) | Yes | Policy-based | No |
| View sensitive audit logs (Xem audit log nhạy cảm) | Yes | Limited | No |
| Trigger reindex / worker recovery (Kích hoạt reindex / phục hồi worker) | Yes | Yes | No |

## Rules for third-party data (Quy tắc với dữ liệu người khác)

### For `admin` (Đối với admin)

- được edit hoặc hide post/comment/report của người khác theo operational capacity
- không bị giới hạn bởi `own-content` filter ở current phase
- có thể re-resolve decision của admin khác nếu business policy cho phép
- không được override target nằm trong protected scope của `super-admin`

### For `super-admin` (Đối với super-admin)

- có thể bypass standard support constraints
- dùng cho recovery, role change, hard delete, emergency response

### For `member` (Đối với member)

- không được sửa record của người khác
- không được gọi route hành chính hoặc route kiểm duyệt

## Hard delete rules (Quy tắc xóa cứng)

- `admin` mặc định không được hard-delete record có downstream relation nhạy cảm
- chỉ `super-admin` mới được hard-delete khi cleanup contract chưa fully automated hoặc chưa verified safe
- workflow priority (thứ tự ưu tiên):
  1. soft delete (xóa mềm)
  2. archive (lưu trữ)
  3. unpublish (hủy xuất bản)

## Notes for AI/codegen (Ghi chú cho AI và sinh mã)

- không implement `edit-own-only` cho `admin` nếu design không yêu cầu
- không cho `admin` tạo hoặc sửa `super-admin`
- permission check phải tách rõ:
  1. role gate (cổng vai trò)
  2. business rule (quy tắc nghiệp vụ)
  3. deletion policy (chính sách xóa)

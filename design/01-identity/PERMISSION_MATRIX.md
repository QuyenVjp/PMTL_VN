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

## Per-module permission scope (Phân quyền theo từng module)

Bảng này map role vào các action cụ thể từng module — dùng khi implement guard.

### Content module

| Action | super-admin | admin | member |
|---|---|---|---|
| Read published content | Yes | Yes | Yes (public) |
| Create/edit draft | Yes | Yes | No |
| Publish content | Yes | Yes | No |
| Unpublish content | Yes | Yes | No |
| Soft delete content | Yes | Yes (non-protected) | No |
| Hard delete content | Yes | No | No |
| Upload media | Yes | Yes | No |
| Delete media | Yes | Yes (own upload) | No |

### Community module

| Action | super-admin | admin | member |
|---|---|---|---|
| Submit post/comment | Yes | Yes | Yes |
| Edit own post/comment | Yes | Yes | Yes (own only) |
| Edit other's post/comment | Yes | Yes (operational) | No |
| Delete own post/comment | Yes | Yes | Yes (soft delete own) |
| Delete other's content | Yes | Yes (via moderation) | No |
| Submit guestbook | Yes | Yes | Yes (public) |
| Approve guestbook | Yes | Yes | No |

### Engagement module

| Action | super-admin | admin | member |
|---|---|---|---|
| Read own practice data | Yes | No (privacy) | Yes |
| Write own practice data | Yes | No | Yes |
| Read other's practice data | Yes | No (privacy default) | No |
| Admin-assisted write (with audit) | N/A | Yes (assisted-entry workflow) | No |

> Lưu ý: admin không được đọc practice data của member mà không có lý do support rõ ràng.

### Moderation module

| Action | super-admin | admin | member |
|---|---|---|---|
| Submit report | Yes | Yes | Yes |
| View reports list | Yes | Yes (non-sensitive) | No |
| Resolve report | Yes | Yes | No |
| Re-resolve other admin's decision | Yes | Yes | No |
| View sensitive report details (IP hash, etc.) | Yes | Limited | No |
| Trigger recompute-summary | Yes | Yes | No |
| Full recompute (all=true) | Yes | No | No |

### Calendar module

| Action | super-admin | admin | member |
|---|---|---|---|
| Read public events | Yes | Yes | Yes (public) |
| Read personal calendar | Yes | Yes (own) | Yes (own) |
| Create/edit events | Yes | Yes | No |
| Publish events | Yes | Yes | No |
| Apply lunar override | Yes | Yes | No |

### Vows & Merit module

| Action | super-admin | admin | member |
|---|---|---|---|
| Create own vow | Yes | Yes | Yes |
| View own vows | Yes | Yes (own) | Yes (own) |
| View other's vows | Yes | No (privacy) | No |
| Create assisted entry | N/A | Yes (assisted-entry workflow) | No |
| Void own vow | Yes | Yes (own) | Yes (own) |
| Hard delete vow | Yes | No | No |

### Notification module

| Action | super-admin | admin | member |
|---|---|---|---|
| Subscribe push | Yes | Yes | Yes |
| Unsubscribe own push | Yes | Yes (own) | Yes (own) |
| View delivery stats | Yes | Yes | No |
| Trigger push job | Yes | Yes | No |
| Disable push delivery | Yes | Yes | No |

### Wisdom-QA module

| Action | super-admin | admin | member |
|---|---|---|---|
| Search wisdom entries | Yes | Yes | Yes (public) |
| Read wisdom entry | Yes | Yes | Yes (published only) |
| Create/edit wisdom entry | Yes | Yes | No |
| Publish wisdom entry | Yes | Yes | No |
| Download offline bundle | Yes | Yes | Yes (member+) |
| Manage ingestion / provenance | Yes | Yes | No |

---

## Notes for AI/codegen (Ghi chú cho AI và sinh mã)

- không implement `edit-own-only` cho `admin` nếu design không yêu cầu
- không cho `admin` tạo hoặc sửa `super-admin`
- permission check phải tách rõ:
  1. role gate (cổng vai trò)
  2. business rule (quy tắc nghiệp vụ)
  3. deletion policy (chính sách xóa)
- Engagement và Vows data là **private by default** — admin cần lý do support rõ để access
- per-module scope bảng trên là **implementation target**, không phải aspirational — implement đúng từ đầu

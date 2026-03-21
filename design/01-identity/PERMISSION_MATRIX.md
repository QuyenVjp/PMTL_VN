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
- chịu editorial (biên tập), moderation (kiểm duyệt), support (hỗ trợ), và system operations (vận hành hệ thống) trong current scope (phạm vi hiện tại)

### `member` (Thành viên)

- standard user (người dùng chuẩn)
- chỉ quản lý self-state và hành động công khai/cộng đồng của chính mình

## Authorization principles (Nguyên tắc phân quyền)

- `admin` không bị khóa vào logic `edit-own-only` (chỉ sửa của mình)
- current scope (phạm vi hiện tại) chưa tách `editor` (người biên tập) và `moderator` (người kiểm duyệt) thành role (vai trò) riêng
- `admin` được phép xử lý record (bản ghi) của người khác khi đó là operational duty (nhiệm vụ vận hành)
- `super-admin` vẫn có protected scope (phạm vi bảo vệ) riêng mà `admin` không được vượt qua

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
| View sensitive audit logs (Xem audit log nhạy cảm) | Yes | Limited (Hạn chế) | No |
| Trigger reindex / worker recovery (Kích hoạt reindex / phục hồi worker) | Yes (Có) | Yes (Có) | No |

## Rules for third-party data (Quy tắc với dữ liệu người khác)

### For `admin` (Đối với admin)

- được edit (sửa) hoặc hide (ẩn) post/comment/report (bài viết/bình luận/báo cáo) của người khác theo operational capacity (năng lực vận hành)
- không bị giới hạn bởi `own-content` filter (bộ lọc nội dung chính chủ) ở current phase (giai đoạn hiện tại)
- có thể re-resolve (giải quyết lại) decision (quyết định) của admin khác nếu business policy (chính sách nghiệp vụ) cho phép
- không được override (ghi đè) target nằm trong protected scope (phạm vi bảo vệ) của `super-admin`

### For `super-admin` (Đối với super-admin)

- có thể bypass (bỏ qua) standard support constraints (các hạn chế hỗ trợ tiêu chuẩn)
- dùng cho recovery (phục hồi), role change (đổi vai trò), hard delete (xóa cứng), emergency response (ứng phó khẩn cấp)

### For `member` (Đối với member)

- không được sửa record (bản ghi) của người khác
- không được gọi route hành chính hoặc route kiểm duyệt (moderation route)

## Hard delete rules (Quy tắc xóa cứng)

- `admin` mặc định không được hard-delete (xóa cứng) record (bản ghi) có downstream relation (liên kết hạ nguồn) nhạy cảm
- chỉ `super-admin` mới được hard-delete khi cleanup contract (hợp đồng dọn dẹp) chưa fully automated (tự động hóa hoàn toàn) hoặc chưa verified safe (xác minh an toàn)
- workflow priority (Thứ tự ưu tiên quy trình):
  1. soft delete (xóa mềm)
  2. archive (lưu trữ)
  3. unpublish (hủy xuất bản)

## Per-module permission scope (Phân quyền theo từng module)

Bảng này map role vào các action cụ thể từng module — dùng khi implement guard.

### Content module (Mô-đun Nội dung)

| Action (Hành động) | super-admin | admin | member |
|---|---|---|---|
| Read published content (Đọc nội dung đã xuất bản) | Yes | Yes | Yes (public - công khai) |
| Create/edit draft (Tạo/sửa bản nháp) | Yes | Yes | No |
| Publish content (Xuất bản nội dung) | Yes | Yes | No |
| Unpublish content (Hủy xuất bản) | Yes | Yes | No |
| Soft delete content (Xóa mềm nội dung) | Yes | Yes (non-protected - không được bảo vệ) | No |
| Hard delete content (Xóa cứng nội dung) | Yes | No | No |
| Upload media (Tải lên tệp đa phương tiện) | Yes | Yes | No |
| Delete media (Xóa tệp đa phương tiện) | Yes | Yes (own upload - tệp tự tải) | No |

### Community module (Mô-đun Cộng đồng)

| Action (Hành động) | super-admin | admin | member |
|---|---|---|---|
| Submit post/comment (Gửi bài viết/bình luận) | Yes | Yes | Yes |
| Edit own post/comment (Sửa bài viết/bình luận của mình) | Yes | Yes | Yes (own only - chỉ của mình) |
| Edit other's post/comment (Sửa bài viết/bình luận người khác) | Yes | Yes (operational - vận hành) | No |
| Delete own post/comment (Xóa bài viết/bình luận của mình) | Yes | Yes | Yes (soft delete own - tự xóa mềm) |
| Delete other's content (Xóa nội dung người khác) | Yes | Yes (via moderation - qua kiểm duyệt) | No |
| Submit guestbook (Gửi lưu bút) | Yes | Yes | Yes (public - công khai) |
| Approve guestbook (Duyệt lưu bút) | Yes | Yes | No |

### Engagement module (Mô-đun Tu tập)

| Action (Hành động) | super-admin | admin | member |
|---|---|---|---|
| Read own practice data (Xem dữ liệu tu tập của mình) | Yes | No (privacy - riêng tư) | Yes |
| Write own practice data (Ghi dữ liệu tu tập của mình) | Yes | No | Yes |
| Read other's practice data (Xem dữ liệu tu tập người khác) | Yes | No (privacy default - riêng tư mặc định) | No |
| Admin-assisted write (Ghi hộ bởi Admin - có nhật ký) | N/A | Yes (assisted-entry workflow - quy trình nhập hộ) | No |

> Lưu ý: admin không được đọc practice data của member mà không có lý do support rõ ràng.

### Moderation module (Mô-đun Kiểm duyệt)

| Action (Hành động) | super-admin | admin | member |
|---|---|---|---|
| Submit report (Gửi báo cáo vi phạm) | Yes | Yes | Yes |
| View reports list (Xem danh sách báo cáo) | Yes | Yes (non-sensitive - không nhạy cảm) | No |
| Resolve report (Xử lý báo cáo) | Yes | Yes | No |
| Re-resolve other admin's decision (Giải quyết lại quyết định của Admin khác) | Yes | Yes | No |
| View sensitive report details (Xem chi tiết báo cáo nhạy cảm) | Yes | Limited (Hạn chế) | No |
| Trigger recompute-summary (Kích hoạt tính toán lại tổng hợp) | Yes | Yes | No |
| Full recompute (all=true) (Tính toán lại toàn bộ) | Yes | No | No |

### Calendar module (Mô-đun Lịch)

| Action (Hành động) | super-admin | admin | member |
|---|---|---|---|
| Read public events (Xem sự kiện công khai) | Yes | Yes | Yes (public - công khai) |
| Read personal calendar (Xem lịch cá nhân) | Yes | Yes (own - của mình) | Yes (own - của mình) |
| Create/edit events (Tạo/sửa sự kiện) | Yes | Yes | No |
| Publish events (Xuất bản sự kiện) | Yes | Yes | No |
| Apply lunar override (Áp dụng đè âm lịch) | Yes | Yes | No |

### Vows & Merit module (Mô-đun Phát nguyện & Công đức)

| Action (Hành động) | super-admin | admin | member |
|---|---|---|---|
| Create own vow (Tạo phát nguyện của mình) | Yes | Yes | Yes |
| View own vows (Xem phát nguyện của mình) | Yes | Yes (own - của mình) | Yes (own - của mình) |
| View other's vows (Xem phát nguyện của người khác) | Yes | No (privacy - riêng tư) | No |
| Create assisted entry (Tạo mục nhập hộ) | N/A | Yes (assisted-entry workflow - quy trình nhập hộ) | No |
| Void own vow (Hủy phát nguyện của mình) | Yes | Yes (own - của mình) | Yes (own - của mình) |
| Hard delete vow (Xóa cứng phát nguyện) | Yes | No | No |

### Notification module (Mô-đun Thông báo)

| Action (Hành động) | super-admin | admin | member |
|---|---|---|---|
| Subscribe push (Đăng ký nhận thông báo) | Yes | Yes | Yes |
| Unsubscribe own push (Hủy đăng ký nhận thông báo của mình) | Yes | Yes (own - của mình) | Yes (own - của mình) |
| View delivery stats (Xem thống kê gửi tin) | Yes | Yes | No |
| Trigger push job (Kích hoạt lệnh gửi tin) | Yes | Yes | No |
| Disable push delivery (Vô hiệu hóa gửi tin) | Yes | Yes | No |

### Wisdom-QA module (Mô-đun Trí huệ - Hỏi đáp)

| Action (Hành động) | super-admin | admin | member |
|---|---|---|---|
| Search wisdom entries (Tìm kiếm mục trí huệ) | Yes | Yes | Yes (public - công khai) |
| Read wisdom entry (Đọc mục trí huệ) | Yes | Yes | Yes (published only - chỉ mục đã xuất bản) |
| Create/edit wisdom entry (Tạo/sửa mục trí huệ) | Yes | Yes | No |
| Publish wisdom entry (Xuất bản mục trí huệ) | Yes | Yes | No |
| Download offline bundle (Tải gói dữ liệu ngoại tuyến) | Yes | Yes | Yes (member+ - từ thành viên trở lên) |
| Manage ingestion / provenance (Quản lý nạp dữ liệu / Nguồn gốc) | Yes | Yes | No |

---

## Notes for AI/codegen (Ghi chú cho AI và sinh mã)

- không implement (triển khai) `edit-own-only` (chỉ sửa của mình) cho `admin` nếu design (thiết kế) không yêu cầu
- không cho `admin` tạo hoặc sửa `super-admin`
- permission check (kiểm tra quyền) phải tách rõ:
  1. role gate (cổng vai trò)
  2. business rule (quy tắc nghiệp vụ)
  3. deletion policy (chính sách xóa)
- Engagement (Tu tập) và Vows (Phát nguyện) data là **private by default (riêng tư mặc định)** — admin cần lý do support (hỗ trợ) rõ để access (truy cập)
- per-module scope (phạm vi theo từng mô-đun) bảng trên là **implementation target (mục tiêu triển khai)**, không phải aspirational — implement (triển khai) đúng từ đầu

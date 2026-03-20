# Identity Module Decisions (Quyết định Mô-đun Định danh)

> Note for students (Ghi chú cho sinh viên):
> Đọc `Decision 1` và `Decision 3` trước nếu anh muốn nắm nhanh auth authority (quyền lực xác thực) và role model (mô hình vai trò).

## Decision 1. NestJS is the sole authentication authority (NestJS là quyền lực xác thực duy nhất)

### Context (Bối cảnh)

Current direction (hướng hiện tại) đã chốt `NestJS` làm backend authority (quyền lực backend).
Vì vậy tài liệu không được gợi ý bất kỳ secondary auth layer (lớp xác thực thứ hai) nào.

### Decision (Quyết định)

- Registration, login, logout, password reset, và session lifecycle (vòng đời phiên) đều thuộc `NestJS auth`.
- Web/Admin chỉ consume auth contract (tiêu thụ hợp đồng xác thực), không giữ auth database hoặc session authority riêng.
- Google login được phép tồn tại như provider flow (luồng nhà cung cấp), nhưng phải map về cùng `users` table và cùng session authority.

### Rationale (Lý do)

- Keeps auth boundary simple (giữ ranh giới xác thực đơn giản).
- Makes auditability clearer (giúp kiểm toán rõ hơn).
- Prevents AI from inventing a second auth system (ngăn AI bịa ra hệ xác thực thứ hai).

### Trade-off (Đánh đổi)

- Auth availability phụ thuộc hoàn toàn vào backend runtime.
- Provider callback cần mapping rõ để tránh duplicate account (trùng tài khoản).

## Decision 2. One users table for account and basic profile (Một bảng users cho tài khoản và hồ sơ cơ bản)

### Context (Bối cảnh)

Current scope (phạm vi hiện tại) chưa cần tách profile thành module riêng.

### Decision (Quyết định)

- `users` là canonical owner (bảng sở hữu chuẩn gốc) cho account và basic profile.
- Không tạo `profiles` table riêng ở current phase.

### Rationale (Lý do)

- Enough for current feature scope (đủ cho phạm vi tính năng hiện tại).
- Giảm joins và giảm drift giữa auth data với profile data.

### Trade-off (Đánh đổi)

- Nếu public profile sau này phức tạp hơn nhiều, có thể phải tách sub-model hoặc module riêng.

## Decision 3. Fixed role model on the user record (Mô hình vai trò cố định trên bản ghi user)

### Context (Bối cảnh)

PMTL_VN cần role model (mô hình vai trò) đủ rõ cho admin, nhưng không nên overbuild như enterprise IAM.

### Decision (Quyết định)

- Role set (tập vai trò) chuẩn hiện tại:
  - `super_admin`
  - `admin`
  - `member`
- `role` là explicit field (trường tường minh) trên `users`.
- `is_blocked` và `blocked_at` là explicit fields cho account suspension (treo tài khoản).

### Rationale (Lý do)

- Access control (kiểm soát truy cập) rõ và dễ code.
- Hợp với current project size (quy mô dự án hiện tại).

### Trade-off (Đánh đổi)

- `admin` đang phải ôm nhiều nhiệm vụ hơn mô hình phân quyền cực chi tiết.
- Fine-grained permission (quyền chi tiết hơn) chỉ thêm khi thật sự cần.

## Decision 4. public_id is the public-safe identifier (public_id là định danh an toàn để lộ ra ngoài)

### Context (Bối cảnh)

Public contract (hợp đồng công khai) không nên để lộ raw internal id (ID nội bộ thô).

### Decision (Quyết định)

- `users.public_id` là public-facing identifier (định danh đối ngoại).
- Internal relation (quan hệ nội bộ) vẫn có thể dùng internal uuid ở service layer.

### Rationale (Lý do)

- Giữ API contract nhất quán.
- Tách persistence id khỏi public-facing identity.

### Trade-off (Đánh đổi)

- Cần mapping rõ giữa internal id và `public_id`.

## Decision 5. Provider login does not create a second authority (Đăng nhập qua provider không tạo authority thứ hai)

### Context (Bối cảnh)

Repo có provider flow như Google login, nhưng direction hiện tại không cho phép secondary authority.

### Decision (Quyết định)

- Provider login là input flow (luồng đầu vào), không phải auth authority riêng.
- Provider identity chỉ dùng để resolve hoặc create user trong cùng authority hiện có.
- Không thêm framework xác thực thứ hai cho session lifecycle.

### Rationale (Lý do)

- Phản ánh đúng direction của backend.
- Tránh docs vô tình mô tả OAuth như một hệ riêng.

### Trade-off (Đánh đổi)

- Cần account merge policy (chính sách gộp tài khoản) rõ, ví dụ qua email.

## Decision 6. Auth side-effects follow outbox when needed (Tác động phụ của auth đi qua outbox khi thật sự cần)

### Context (Bối cảnh)

Registration, reset password, verification email là auth flows có downstream side-effects (tác động phụ phía sau), nhưng side-effects đó không phải source of truth.

### Decision (Quyết định)

- Canonical auth write-path (luồng ghi xác thực chuẩn gốc) phải commit vào `users` và `sessions` trước.
- Email hoặc downstream auth signal quan trọng đi qua `outbox_events` khi async reliability được bật.
- Client cookie hay local state không bao giờ là source of truth cho auth recovery.

### Rationale (Lý do)

- Giữ auth reliability nhất quán với toàn hệ.
- Tách session authority khỏi side-effect delivery.

### Trade-off (Đánh đổi)

- Nếu bật outbox thật, phải theo dõi backlog và replay path.

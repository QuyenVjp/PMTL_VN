# Identity Module (Mô-đun Định danh)

> Note for students (Ghi chú cho sinh viên):
> File này chốt auth authority (quyền lực xác thực), user ownership (quyền sở hữu user), và role model (mô hình vai trò) của hệ.

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Identity Module (Mô-đun Định danh)

## Objectives (Mục tiêu)

- Define auth authority (xác định quyền lực xác thực).
- Clarify ownership of `users` and `sessions` (làm rõ quyền sở hữu bảng users và sessions).
- Define role model and account block state (xác định mô hình vai trò và trạng thái chặn tài khoản).
- Keep provider login inside the same auth authority (giữ đăng nhập qua provider trong cùng authority).

## Authentication authority (Quyền lực xác thực)

- `NestJS auth` là sole authentication authority (quyền lực xác thực duy nhất).
- `apps/api` sở hữu login, register, logout, password reset, refresh, và session flows.
- Google login được phép, nhưng phải map về cùng `users` table và cùng session authority.
- Web/Admin chỉ consume auth contract từ API.

## Module data (Dữ liệu mô-đun)

- `users`
- `sessions`
- `media_assets` cho avatar reference
- cross-cutting references:
  - `audit_logs`
  - `feature_flags`
  - `rate_limit_records`

## Current responsibilities (Trách nhiệm hiện tại)

### Authentication lifecycle (Vòng đời xác thực)

- Registration via email/password (đăng ký qua email/mật khẩu)
- Login via email/password (đăng nhập qua email/mật khẩu)
- Login via Google provider flow (đăng nhập qua provider Google)
- Logout và logout-all
- Forgot password và reset password
- Current-session retrieval (lấy phiên hiện tại)

### Identity data (Dữ liệu định danh)

- email
- full name / username
- phone / dharma name
- avatar / bio
- `public_id`
- provider linkage fields như `google_sub`

### Authorization data (Dữ liệu phân quyền)

- `role`
- `is_blocked`
- `blocked_at`
- `blocked_reason`

## Identity owns (Định danh sở hữu)

- user accounts
- auth/session lifecycle
- role assignments
- account block state
- provider linkages vào cùng account

## Identity does not own (Định danh không sở hữu)

- editorial content
- community content
- engagement progress
- moderation reports
- push delivery records

## References from other modules (Tham chiếu từ mô-đun khác)

- Content tham chiếu user làm author/editor.
- Community tham chiếu user làm actor hoặc author snapshot.
- Engagement tham chiếu user làm owner của self-state.
- Moderation tham chiếu reporter/admin/target user.
- Notification tham chiếu user để resolve recipient.

## Current rules (Quy tắc hiện tại)

- No secondary auth framework (không có framework xác thực thứ hai).
- No secondary user store (không có kho user thứ hai).
- Role change chỉ đi qua admin path có audit.
- Public profile chỉ expose sanitized fields (trường đã làm sạch) qua contract.
- Canonical auth write-path luôn ưu tiên hơn mọi side-effects.

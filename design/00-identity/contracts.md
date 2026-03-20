# Identity Contracts (Hợp đồng Mô-đun Định danh)

## Input schemas (Lược đồ đầu vào)

- `registerSchema`: register payload (lược đồ đăng ký)
- `loginSchema`: login payload (lược đồ đăng nhập)
- `forgotPasswordSchema`: forgot-password payload (lược đồ quên mật khẩu)
- `resetPasswordSchema`: reset-password payload (lược đồ đặt lại mật khẩu)
- `updateProfileSchema`: profile update payload (lược đồ cập nhật hồ sơ)

Source (Nguồn): `packages/shared/src/schemas/auth.ts` hoặc schema Zod tương đương của rebuild.

## Primary routes (Tuyến đường chính)

- `POST /api/auth/register`: account creation (tạo tài khoản)
- `POST /api/auth/login`: credential validation + session start (đăng nhập)
- `POST /api/auth/logout`: current-session revoke (đăng xuất)
- `POST /api/auth/logout-all`: revoke all sessions (đăng xuất mọi phiên)
- `POST /api/auth/refresh`: rotate refresh token (xoay refresh token)
- `POST /api/auth/forgot-password`: start reset flow (khởi tạo quên mật khẩu)
- `POST /api/auth/reset-password`: token-based password change (đặt lại mật khẩu bằng token)
- `GET /api/auth/me`: current session retrieval (lấy phiên hiện tại)
- `PATCH /api/auth/profile`: profile update (cập nhật hồ sơ)

## Canonical rules (Quy tắc chuẩn gốc)

- Sole auth authority (quyền lực xác thực duy nhất) là `NestJS auth` backed by `users` + `sessions`.
- Web/Admin là client surfaces (bề mặt client), không giữ authority.
- Session authority nằm ở backend, không nằm ở frontend store.
- `admin` là operational role (vai trò vận hành), không bị bó vào `own-records-only`.
- Mọi request payload, provider callback payload, env contract đều phải có runtime schema rõ.
- email/reset/provider notification signal nếu có nên đi qua `outbox_events`.

## Response rules (Quy tắc phản hồi)

Public auth response map về:

- `AuthUser`: sanitized auth user (người dùng xác thực đã làm sạch)
- `AuthSession`: active session metadata (metadata phiên xác thực đang hoạt động)

Do not expose (Tuyệt đối không để lộ):

- raw password fields
- password hash
- raw reset token
- internal auth secret
- raw refresh token

## Expected errors (Lỗi dự kiến)

- `400`: schema validation fail hoặc token/password format sai
- `401`: invalid credentials hoặc invalid session
- `403`: blocked account hoặc insufficient role
- `404`: user không tồn tại trong flow nội bộ cần định danh cụ thể
- `409`: email đã tồn tại
- `429`: rate limit / abuse guard chặn
- `500`: auth runtime, persistence, hoặc provider mapping error

## Notes for AI/codegen (Ghi chú cho AI và sinh mã)

- Không thêm secondary auth authority.
- `users` + `sessions` là canonical owner cho account và session lifecycle.
- Public client state phải bám theo session/token do backend cấp.
- Không tự thêm role mới như `editor` hoặc `moderator` nếu design chưa chốt.

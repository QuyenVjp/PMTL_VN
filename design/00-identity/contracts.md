# Identity Contracts

## Input schemas đang có

- `registerSchema`
- `loginSchema`
- `forgotPasswordSchema`
- `resetPasswordSchema`
- `updateProfileSchema`

Nguồn:
- `packages/shared/src/schemas/auth.ts`

## Routes chính

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `PATCH /api/auth/profile`

## Canonical rules

- auth authority duy nhất là Payload auth trong `users`
- web route chỉ là BFF/proxy hoặc compatibility layer
- session authority không nằm ở frontend store
- permission logic chi tiết xem thêm `PERMISSION_MATRIX.md`
- `admin` trong current scope là role vận hành, không bị giới hạn kiểu `chỉ sửa record của chính mình`
- request payload, provider callback payload, session payload và env config liên quan auth phải có schema runtime rõ
- email/reset/provider notification signal nếu có nên đi qua `outbox_events`

## Response rules

Auth response công khai map về:
- `AuthUser`
- `AuthSession`

Không expose:
- raw password fields
- reset token
- internal auth secrets

## Error expectations

- `400`
  - schema (lược đồ dữ liệu) fail
  - password/token/body không hợp lệ
- `401`
  - credentials sai
  - session không tồn tại
- `403`
  - account bị block hoặc role không cho phép
- `404`
  - user không tồn tại ở một số flow nội bộ
- `409`
  - email đã tồn tại
- `500`
  - CMS auth runtime lỗi, append outbox lỗi, hoặc provider mapping lỗi

## Notes for AI/codegen

- Đừng thêm auth authority thứ hai.
- `users` là canonical owner của account + profile cơ bản.
- Public/client state phải theo session do CMS phát hành, không tự phát minh token model khác.
- Đừng tự bịa role `editor` hoặc `moderator` trở lại nếu design hiện tại chưa tách.
- Nếu auth side-effect downstream bị lệch, recovery path phải dựa trên canonical `users` + auth state, không vá client token state bằng tay.


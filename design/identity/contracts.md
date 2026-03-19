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
  - schema fail
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
  - CMS auth runtime lỗi

## Notes for AI/codegen

- Đừng thêm auth authority thứ hai.
- `users` là canonical owner của account + profile cơ bản.
- Public/client state phải theo session do CMS phát hành, không tự phát minh token model khác.

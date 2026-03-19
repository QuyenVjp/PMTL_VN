# Update Profile

## Purpose
- Cập nhật profile cơ bản của người dùng hiện tại mà không thay đổi auth authority hay role model.

## Owner module
- `identity`

## Actors
- `member`
- `admin` khi sửa profile theo scope quản trị

## Trigger
- Web gọi `PATCH /api/auth/profile`.

## Preconditions
- Có session hợp lệ.
- Body hợp lệ theo `updateProfileSchema`.

## Input contract
- `updateProfileSchema`

## Read set
- auth session
- `users`

## Write path
1. Resolve current user từ session.
2. Parse body theo schema.
3. Ghi canonical update vào `users`.
4. Invalidate/cập nhật session cache nếu cần.
5. Append audit `auth.profile.update`.

## Async side-effects
- không có side-effect nặng bắt buộc

## Success result
- Profile DTO mới được trả về.

## Errors
- `400`: body không hợp lệ.
- `401`: chưa đăng nhập.
- `403`: cố sửa profile ngoài phạm vi cho phép.
- `500`: lỗi auth/CMS.

## Audit
- log `auth.profile.update`

## Idempotency / anti-spam
- update cùng payload chỉ ghi lại profile hiện tại, không tạo record mới.

## Performance target
- profile update `< 800ms`.

## Notes for AI/codegen
- `users` là owner của account + profile cơ bản.
- Role change là flow admin riêng, không nằm trong self-profile contract.

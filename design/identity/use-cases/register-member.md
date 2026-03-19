# Register Member

## Purpose
- Đăng ký một tài khoản thành viên mới bằng Payload auth, tạo session hợp lệ và trả auth contract đã map cho web.

## Owner module
- `identity`

## Actors
- `guest`

## Trigger
- Web gọi `POST /api/auth/register`.

## Preconditions
- Body hợp lệ theo `registerSchema`.
- Email chưa tồn tại.

## Input contract
- `registerSchema`

## Read set
- `users`

## Write path
1. Parse body theo `registerSchema`.
2. Gọi CMS auth register.
3. Ghi canonical user record vào `users`.
4. Tạo auth session/token theo Payload auth.
5. Set auth cookie ở web BFF.
6. Append audit `auth.register`.

## Async side-effects
- có thể có email welcome hoặc verification về sau, nhưng không phải canonical path hiện tại

## Success result
- User mới được tạo.
- Session hợp lệ được thiết lập cho web.

## Errors
- `400`: body không hợp lệ.
- `409`: email đã tồn tại.
- `500`: CMS auth lỗi.

## Audit
- log `auth.register`

## Idempotency / anti-spam
- Retry cùng email sau khi user đã tạo phải trả conflict, không tạo nhiều user.

## Performance target
- register nên `< 800ms` khi CMS khỏe.

## Notes for AI/codegen
- Session authority là Payload auth.
- Đừng tự phát minh user table hoặc token issuance ở web.

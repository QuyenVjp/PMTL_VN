# Register Member

## Purpose
- Đăng ký một tài khoản thành viên mới bằng Payload auth, tạo session hợp lệ và trả auth contract (hợp đồng dữ liệu/nghiệp vụ) đã map cho web.

## owner module (module sở hữu)
- `identity`

## Actors
- `guest`

## trigger (điểm kích hoạt)
- Web gọi `POST /api/auth/register`.

## preconditions (điều kiện tiên quyết)
- Body hợp lệ theo `registerSchema`.
- Email chưa tồn tại.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)
- `registerSchema`
- nếu có downstream email/signal thì outbox payload phải có event type, event version và idempotency key

## Read set
- `users`

## write path (thứ tự ghi dữ liệu chuẩn)
1. Parse body theo `registerSchema`.
2. Gọi CMS auth register.
3. Ghi canonical user record vào `users`.
4. Tạo auth session/token theo Payload auth.
5. Set auth cookie ở web BFF.
6. Append audit `auth.register`.
7. Nếu có welcome email hoặc verification follow-up, append outbox event downstream.

## async (bất đồng bộ) side-effects
- có thể có email welcome hoặc verification về sau, nhưng không phải canonical path hiện tại

## success result (kết quả thành công)
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
- replay outbox không được tạo duplicate welcome/verification signal cho cùng user create event.

## Performance target
- register nên `< 800ms` khi CMS khỏe.

## Notes for AI/codegen
- Session authority là Payload auth.
- Đừng tự phát minh user table hoặc token issuance ở web.


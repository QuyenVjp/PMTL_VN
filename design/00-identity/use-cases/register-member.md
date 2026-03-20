# Use Case: Register Member (Đăng ký Thành viên)

## Purpose (Mục đích)

- Register a new member account (đăng ký tài khoản thành viên mới)
- establish a valid session (thiết lập phiên hợp lệ)
- return the mapped auth contract (trả về hợp đồng xác thực đã chuẩn hóa)

## owner module (module sở hữu)

- `identity`

## Actors (Tác nhân)

- `guest`: anonymous visitor (khách chưa đăng nhập)

## Trigger (Điểm kích hoạt)

- web calls `POST /api/auth/register`

## Preconditions (Điều kiện tiên quyết)

- body phải hợp lệ theo `registerSchema`
- email chưa tồn tại trong `users`

## Input contract (Hợp đồng đầu vào)

- `registerSchema`
- nếu có downstream welcome/verification signal thì outbox payload phải có event type, version, và idempotency key

## Read set (Tập dữ liệu đọc)

- `users`
- `rate_limit_records` hoặc shared limiter state

## write path (thứ tự ghi dữ liệu chuẩn)

1. Parse và validate body theo `registerSchema`.
2. Check rate limit / anti-abuse guard.
3. Kiểm tra email đã tồn tại hay chưa.
4. Tạo canonical `users` record.
5. Tạo canonical `sessions` record.
6. Cấp access token + refresh token theo auth contract.
7. Set secure cookie nếu là browser flow.
8. Append audit log `auth.register`.
9. Nếu policy cần, append `outbox_events` cho welcome/verification email.

## async (bất đồng bộ) side-effects

- welcome email
- email verification send

## success result (kết quả thành công)

- user mới được tạo
- session hợp lệ được thiết lập
- client nhận sanitized auth response

## Errors (Lỗi dự kiến)

- `400`: body sai schema
- `409`: email đã đăng ký
- `429`: rate limit / anti-abuse guard chặn
- `500`: auth runtime hoặc persistence lỗi

## Audit (Kiểm toán)

- action: `auth.register`
- log context: email, IP, requestId, timestamp

## Idempotency & anti-spam (Tính không đổi & chống thư rác)

- retry với cùng email sau khi tạo thành công phải trả `409`
- replay outbox không được tạo duplicate welcome/verification email

## Performance target (Mục tiêu hiệu năng)

- register path nên hoàn tất trong `< 800ms` ở điều kiện bình thường

## Notes for AI/codegen (Ghi chú cho AI và sinh mã)

- session authority nằm ở backend
- không tạo secondary user store
- không phát token ở web layer

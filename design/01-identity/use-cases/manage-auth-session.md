# Manage Auth Session (Quản lý Phiên Xác thực)

## Purpose (Mục đích)

Chốt write-path nguy hiểm nhất của current phase:

- login (đăng nhập)
- refresh (làm mới phiên)
- logout (đăng xuất)
- logout-all (đăng xuất mọi phiên)
- reset password (đặt lại mật khẩu)
- email verification (xác minh email)

File này tồn tại để AI/dev không tự đoán auth/session behavior (hành vi xác thực/phiên).

## Official Nest auth docs interpretation

- official Nest `Authentication` doc là reference tốt cho:
  - tách `AuthModule`
  - dùng guard để bảo vệ route
  - dùng custom decorator kiểu `@Public()`
  - tư duy `APP_GUARD` nếu phần lớn route là protected-by-default
- nhưng sample mặc định của docs là `JWT bearer` tutorial, **không phải PMTL browser baseline**
- PMTL browser baseline là:
  - access token ngắn hạn trong `HttpOnly` cookie
  - refresh token rotation trong `HttpOnly` cookie riêng
  - CSRF cookie/header contract riêng cho browser mutations
- bearer token chỉ là lane riêng cho automation/internal route hoặc API contract đã design riêng
- không được bê nguyên sample `Authorization: Bearer <jwt>` làm mặc định cho web/admin browser flows
- `JwtModule.register({ global: true })` trong sample docs không tự động trở thành PMTL baseline; token/signing wiring phải đi qua config + security contract của repo
- sample `UsersService` hard-coded/in-memory chỉ là demo DI, không được dùng làm mental model cho PMTL persistence ownership
- nếu dùng `APP_GUARD` + `@Public()`:
  - chỉ áp dụng sau khi public route inventory đã rõ
  - phải bám `PERMISSION_MATRIX.md` và route contract thật
  - không dùng để che việc chưa thiết kế auth surface

## Official Nest session docs interpretation

- Nest session docs hữu ích để hiểu middleware hookup, `@Session()` decorator, và transport mechanics
- nhưng PMTL không dùng `@Session()` object như auth authority business-level
- canonical auth/session state vẫn phải đi qua:
  - `sessions` persistence owner
  - token/cookie verification path
  - `/auth/me` aggregate contract
- in-memory session examples hoặc framework secret sample không được dùng làm production mental model
- route handler không được suy “đã đăng nhập” chỉ vì `req.session` hoặc cookie object hiện diện; phải dựa vào canonical session validation path

## Current defaults (Mặc định hiện tại)

- access token TTL: `15 phút`
- refresh token TTL: `30 ngày`
- refresh token rotation: bắt buộc
- hash algorithm: `Argon2id`
- reset token TTL: `15 phút`, one-time use
- email verification token TTL: `24 giờ`
- resend cooldown: `60 giây`

## Canonical records (Bản ghi chuẩn gốc)

- `users`
- `sessions`
- `audit_logs`
- `rate_limit_records` hoặc shared limiter store tương đương

## Login flow (Luồng đăng nhập)

### Input contract (Hợp đồng đầu vào)

- email hoặc username theo auth policy
- password
- device/session metadata tối thiểu nếu implementation dùng

### Guards (Bộ chặn)

- rate limit theo IP
- rate limit theo account/email
- anti-enumeration response

### Canonical write path (Luồng ghi chuẩn gốc)

1. Validate input schema.
2. Tìm canonical user record.
3. Verify password hash.
4. Nếu pass:
   - tạo `sessions` record
   - cấp access token
   - set browser cookie nếu là browser flow
5. Ghi audit log `login.success`.
6. Nếu fail:
   - ghi audit log `login.failed` trong giới hạn policy
   - không lộ user có tồn tại hay không

## Refresh flow (Luồng làm mới phiên)

### Guards (Bộ chặn)

- refresh token còn hạn
- refresh token chưa revoke
- refresh token chưa bị reuse
- rate limit bắt buộc theo exact contract đã chốt ở `tracking/coding-readiness.md` Phần 5: `30 requests / 15 phút / per-IP`

### Canonical write path (Luồng ghi chuẩn gốc)

1. Validate token/cookie input.
2. Xác minh refresh token record trong `sessions`.
3. Rotate token:
   - token cũ invalid trong `sessions`
   - token mới được cấp
4. Cấp access token mới.
5. Ghi audit event nếu policy yêu cầu.

### Rotation integrity rules (Quy tắc toàn vẹn khi xoay vòng)

- refresh rotation phải là **single canonical write transaction**
- flow refresh dùng interactive transaction khi cần read-modify-write trên session record
- nếu concurrent refresh gây write conflict/deadlock, retry transaction hữu hạn; không cấp hai refresh token mới cho cùng một phiên
- retry budget mặc định: tối đa `3` lần cho conflict/deadlock class; vượt ngưỡng thì fail closed với `503` an toàn
- reuse detection:
  - refresh token đã bị rotate mà xuất hiện lại = suspicious replay
  - hệ thống phải revoke current session hoặc cả session family theo policy, không âm thầm bỏ qua
- session record tối thiểu phải phân biệt:
  - current valid refresh credential
  - revoked/replaced state
  - revokedAt / replacedBy hoặc equivalent linkage để điều tra replay

### Recovery / failure (Phục hồi / lỗi)

- token replay hoặc reuse bất thường phải trigger revoke path
- không cấp token mới nếu refresh record không hợp lệ
- nếu transaction retry vượt ngưỡng hoặc auth store conflict không giải được, fail closed và clear cookie transport hiện tại

## Logout (Đăng xuất)

1. Xác định current session.
2. Revoke current session trong `sessions`.
3. Clear cookie/token transport phù hợp.
4. Ghi audit log `logout`.

## Logout all (Đăng xuất mọi phiên)

1. Xác định canonical user.
2. Revoke toàn bộ `sessions` records của user.
3. Clear current cookie/token transport.
4. Ghi audit log `logout_all`.

## Browser cookie transport contract

- access cookie: `HttpOnly`, `Secure`, `SameSite=Lax`, path `/`
- refresh cookie: `HttpOnly`, `Secure`, `SameSite=Lax`, path `/api/auth/refresh`
- csrf cookie: non-HttpOnly, same-site, path `/`
- login thành công phải set đủ browser cookies trong cùng response; logout/logout-all/reset success phải clear đúng cả access/refresh/csrf transport liên quan
- browser route guard/read-model không được suy auth state chỉ từ cookie presence; phải qua canonical `/auth/me` hoặc equivalent session contract
- route docs / OpenAPI security annotation cho browser auth không được drift thành bearer-only sample chỉ vì Nest docs auth chapter minh họa theo JWT header

## Reset password (Đặt lại mật khẩu)

### Request reset (Yêu cầu đặt lại)

1. Validate input.
2. Áp anti-enumeration response.
3. Áp rate limit theo IP và account/email.
4. Tạo reset token one-time use nếu account hợp lệ.
5. Ghi audit event phù hợp.

### Confirm reset (Xác nhận đặt lại)

1. Validate token + password mới.
2. Verify reset token còn hạn và chưa dùng.
3. Hash password mới bằng `Argon2id`.
4. Update canonical `users.password_hash`.
5. Invalidate reset token.
6. Revoke session cũ trong `sessions`.
7. Ghi audit log `password.reset.completed`.

## Email verification (Xác minh email)

1. Validate token.
2. Verify token TTL.
3. Đánh dấu `users.email_verified_at`.
4. Invalidate token.
5. Ghi audit event.

## Authz / privilege guard (Bộ chặn phân quyền)

- `member` không được chạm admin/editorial/moderation routes.
- `admin` không được tự nâng thành `super_admin`.
- mọi role change phải có audit log.

## Required audit events (Audit event bắt buộc)

- `login.success`
- `login.failed`
- `logout`
- `logout_all`
- `password.reset.requested`
- `password.reset.completed`
- `email.verification.sent`
- `email.verification.completed`
- `role.changed`

## Required anti-abuse controls (Kiểm soát chống lạm dụng bắt buộc)

- brute-force guard theo IP
- brute-force guard theo account/email
- reset resend cooldown
- verification resend cooldown

## Error contract (Hợp đồng lỗi)

- `401`: invalid credentials hoặc invalid session
- `403`: role/permission không hợp lệ
- `429`: rate limit hoặc abuse guard chặn
- `500`: auth persistence hoặc revoke path lỗi

## Failure behavior (Hành vi khi lỗi)

- auth storage unavailable:
  - fail closed
- invalid credentials:
  - không lộ enumeration detail
- session revoke fail:
  - không giả vờ logout thành công nếu canonical revoke chưa commit

# Use Case: Update Profile (Cập nhật Hồ sơ)

## Purpose (Mục đích)

- Update basic profile data (cập nhật hồ sơ cơ bản)
- without changing auth authority or role model (không làm thay đổi quyền lực xác thực hay mô hình vai trò)

## owner module (module sở hữu)

- `identity`

## Actors (Tác nhân)

- `member`: cập nhật hồ sơ của chính mình
- `admin`: cập nhật hồ sơ người khác trong phạm vi admin policy

## Trigger (Điểm kích hoạt)

- client calls `PATCH /api/auth/profile`

## Preconditions (Điều kiện tiên quyết)

- có active session (phiên đang hoạt động) hợp lệ
- body hợp lệ theo `updateProfileSchema`

## Input contract (Hợp đồng đầu vào)

- `updateProfileSchema`
- downstream profile signal nếu có phải có runtime schema rõ

## Read set (Tập dữ liệu đọc)

- `sessions`
- `users`

## write path (thứ tự ghi dữ liệu chuẩn)

1. Resolve current user từ session.
2. Validate request body theo schema.
3. Commit canonical update vào `users`.
4. Nếu cần, cập nhật session-derived display data hoặc invalidate cache liên quan.
5. Append audit log `auth.profile.update`.
6. **Phase 1**: avatar processing hoặc profile refresh downstream chỉ chạy khi policy bật và phải có best-effort/recovery path rõ; không giả định outbox.
7. **Phase 2+**: nếu profile downstream signal cần reliability, append `outbox_events`.

## async (bất đồng bộ) side-effects

- **Phase 1**: avatar processing/profile refresh là optional side-effects theo sync hoặc best-effort path.
- **Phase 2+**: downstream profile signal đi qua outbox khi cần reliability.

## success result (kết quả thành công)

- trả về sanitized profile DTO đã cập nhật

## Errors (Lỗi dự kiến)

- `400`: body sai schema
- `401`: session thiếu hoặc không hợp lệ
- `403`: cố sửa hồ sơ ngoài phạm vi cho phép
- `500`: persistence hoặc system runtime lỗi

## Audit (Kiểm toán)

- action: `auth.profile.update`
- log context: actorId, targetId, updatedFields, requestId

## Idempotency & anti-spam (Tính không đổi & chống thư rác)

- cùng một payload lặp lại nên là NOOP hợp lệ
- replay outbox không được tạo duplicate downstream signal cho cùng một update event khi phase 2+ đã bật

## Performance target (Mục tiêu hiệu năng)

- profile update nên hoàn tất trong `< 800ms`

## Notes for AI/codegen (Ghi chú cho AI và sinh mã)

- `users` là canonical owner cho account và basic profile
- role change là flow riêng, không nằm trong self-profile update

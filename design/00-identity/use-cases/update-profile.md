# Update Profile

## Purpose
- Cập nhật profile cơ bản của người dùng hiện tại mà không thay đổi auth authority hay role model.

## owner module (module sở hữu)
- `identity`

## Actors
- `member`
- `admin` khi sửa profile theo scope quản trị

## trigger (điểm kích hoạt)
- Web gọi `PATCH /api/auth/profile`.

## preconditions (điều kiện tiên quyết)
- Có session hợp lệ.
- Body hợp lệ theo `updateProfileSchema`.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)
- `updateProfileSchema`
- nếu có downstream profile signal thì payload phải có schema runtime rõ

## Read set
- auth session
- `users`

## write path (thứ tự ghi dữ liệu chuẩn)
1. Resolve current user từ session.
2. Parse body theo schema (lược đồ dữ liệu).
3. Ghi canonical update vào `users`.
4. Invalidate/cập nhật session cache nếu cần.
5. Append audit `auth.profile.update`.
6. Nếu có downstream signal như avatar processing hoặc profile-notify, append outbox event sau canonical update.

## async (bất đồng bộ) side-effects
- không có side-effect nặng bắt buộc

## success result (kết quả thành công)
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
- replay outbox không được tạo duplicate downstream profile signal cho cùng update event.

## Performance target
- profile update `< 800ms`.

## Notes for AI/codegen
- `users` là owner của account + profile cơ bản.
- Role change là flow admin riêng, không nằm trong self-profile contract (hợp đồng dữ liệu/nghiệp vụ).


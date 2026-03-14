# Domains

## Posts

- Nguồn nội dung chính.
- Có category, author, slug, trạng thái publish.
- Là nguồn feed cho web và search index.

## Comments

- Gắn với post.
- Có business rule về moderation, rate limit và notification.
- Search index tùy chọn, mặc định ưu tiên moderation trước search.

## Events

- Nội dung theo thời gian.
- Cần date range rõ ràng, timezone rõ ràng và chiến lược hiển thị upcoming/past.

## Users

- Payload auth là source of truth cho auth.
- Admin UI của CMS dùng cùng auth foundation này, không có auth authority thứ hai.
- User profile nền tảng gồm `displayName`, `avatar`, `bio`, `role`, `status`.
- Role kiểm soát access ở CMS và API.
- Role mặc định:
  - `super-admin`: toàn quyền hệ thống.
  - `admin`: quản trị nội dung và người dùng ở mức cao.
  - `editor`: quản lý content scope.
  - `moderator`: quản lý moderation scope.
  - `member`: người dùng chuẩn sau đăng ký.
- Status nền tảng:
  - `active`
  - `pending`
  - `suspended`
- Auth scope phase hiện tại:
  - register
  - login
  - logout
  - forgot password
  - reset password
  - current session
  - update own profile

## CMS Runtime

- `apps/cms` là Next.js app riêng cho admin và API.
- `apps/web` vẫn là public frontend riêng.
- Boundary domain không đổi khi đổi bootstrap/runtime layer.

## Search

- Nguồn dữ liệu chính từ Payload.
- Meilisearch chỉ là projection/index để truy vấn nhanh.
- Reindex được, không phải source of truth.

## Notifications

- Giai đoạn 1: gọi service nội bộ hoặc webhook.
- Giai đoạn 2: đưa sang queue/worker.

# Content Contracts

File này không thay `docs/api/contracts.md`.
Mục đích của nó là chốt business contract (hợp đồng dữ liệu/nghiệp vụ) của content module để AI biết:

- route nào là public contract (hợp đồng dữ liệu/nghiệp vụ)
- input nào cần validate
- field nào là canonical
- side-effect nào không được làm đồng bộ

## Owner data

- `posts`
- `hubPages`
- `beginnerGuides`
- `downloads`
- `sutras`
- `sutraVolumes`
- `sutraChapters`
- `sutraGlossary`
- `chantItems`
- `chantPlans`

## Public read contracts

### Posts
- `GET /api/posts`
- `GET /api/posts/:slugOrPublicId`
- `GET /api/posts/search?q=<query>&limit=<n>`
- `POST /api/posts/:publicId/view`
- `GET /api/posts/:publicId/comments`

Canonical content source:
- `posts` collection trong Postgres/Payload

Search-related source fields:
- `contentPlainText`
- `normalizedSearchText`
- `excerptComputed`

### Guides / Downloads / Hub / Sutras / Chanting
- `GET /api/guides`
- `GET /api/downloads`
- `GET /api/hub-pages`
- `GET /api/sutras`
- `GET /api/chant-items`
- `GET /api/chant-plans`

Ghi chú:
- `beginnerGuides` và `hubPages` nên là public surface chính cho:
  - giới thiệu pháp môn
  - sơ học nhập môn
  - đường dẫn bắt đầu tu học
  - hub điều hướng tài nguyên chính thức

## Write contracts

### Editorial authoring
- canonical write đi qua Payload collection owner
- admin (`Phụng sự viên`) hoặc super-admin là actor chính
- `_status` và `publishedAt` là cặp field quyết định public delivery

### Revalidation
- `POST /api/revalidate`
- chỉ là downstream invalidation contract (hợp đồng dữ liệu/nghiệp vụ)
- không thay cho canonical publish state

## Status / workflow contract (hợp đồng dữ liệu/nghiệp vụ)

- Editorial workflow mặc định:
  - `draft`
  - `published`
- Không giả định có approval state nhiều bước nếu code chưa có.

## Error expectations

- `400`
  - dữ liệu biên soạn không hợp lệ
  - thiếu field bắt buộc để publish
- `401`
  - chưa đăng nhập vào CMS/web auth
- `403`
  - không có role admin/super-admin phù hợp
- `404`
  - document hoặc relation không tồn tại
- `409`
  - slug/publicId conflict hoặc state conflict khi publish
- `500`
  - lỗi service (lớp xử lý nghiệp vụ)/hook/append outbox event/search dispatch/revalidation webhook

## Notes for AI/codegen

- Public route đọc content đã map DTO, không trả raw Payload document nếu chưa lọc field.
- Search index chỉ là derived document; canonical body vẫn nằm ở content collections.
- Publish thành công không được phụ thuộc vào việc Meilisearch hay push notification hoàn tất ngay.


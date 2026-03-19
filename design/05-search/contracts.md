# Search Contracts

## Input schema (lược đồ dữ liệu)

- `searchQuerySchema` từ `packages/shared/src/schemas/search.ts`

## Routes chính

- `GET /api/posts/search?q=<query>&limit=<n>`
- `POST /api/posts/search/reindex`
- `GET /api/search/status`

## Canonical rules

- search module không sở hữu canonical content body
- source fields nằm trên content owner document
- search document trong Meilisearch là computed projection
- sync guarantee hiện tại là `at-least-once`
- search update phải idempotent theo `document id + updatedAt/version`
- business event phát search sync phải đi qua `outbox_events`
- search payload nên có version rõ nếu thay đổi shape theo thời gian

## Unified wisdom retrieval rule

- search phải index chung:
  - `01-content` public knowledge content
  - `09-wisdom-qa` entries cho `Bạch thoại Phật pháp`
  - `09-wisdom-qa` entries cho `Huyền học vấn đáp`
- với người dùng cuối, đây nên hiện như một `Kho Trí Huệ` thống nhất, dù ownership vẫn tách theo module

## Response rules

Search result phải nói rõ engine:
- `meilisearch`
- `payload-fallback (đường dự phòng)`

Status route nên phản ánh:
- search engine health
- outbox lag / retry state
- queue (hàng đợi xử lý) state
- index document count
- index freshness / last successful sync

## Error expectations

- `400`
  - query rỗng hoặc limit ngoài khoảng cho phép
- `401`
  - route admin/status/reindex cần auth mà thiếu session
- `403`
  - role không đủ cho reindex
- `500`
  - engine lỗi và fallback (đường dự phòng) cũng lỗi

## Notes for AI/codegen

- Public search read có fallback (đường dự phòng); index failure không được làm mất canonical content.
- Batch reindex là operational action, nên có audit và status riêng.
- Đừng dùng search index làm nơi quyết định publish state.
- worker (tiến trình xử lý nền) chết giữa chừng phải dẫn đến retry/recovery, không được coi như sync đã hoàn tất.
- Current scope chuẩn hóa theo outbox-driven projection cho business event quan trọng.
- `pgvector` chỉ là optional capability cho related-content / recommendation, không thay search box Meilisearch.


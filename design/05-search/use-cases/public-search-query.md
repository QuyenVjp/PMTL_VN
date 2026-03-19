# Public Search Query

## Purpose
- Trả kết quả tìm kiếm public theo query người dùng, ưu tiên Meilisearch nhưng có fallback qua Payload khi engine gặp sự cố.

## Owner module
- `search`

## Actors
- `guest`
- `member`

## Trigger
- Web gọi `GET /api/posts/search?q=<query>&limit=<n>`.

## Preconditions
- Query string hợp lệ theo `searchQuerySchema`.

## Input contract
- `searchQuerySchema`

## Read set
- Meilisearch index
- fallback Payload query path

## Write path
- Không có canonical business write-path.
- Có thể ghi metrics/log operational theo policy.

## Async side-effects
- không có

## Success result
- Trả `hits`, `totalHits`, và marker `engine`.

## Errors
- `400`: query rỗng hoặc limit ngoài giới hạn.
- `500`: Meilisearch lỗi và fallback cũng lỗi.

## Audit
- không audit từng query thường.
- chỉ log metrics hoặc incidents khi fallback bị dùng nhiều.

## Idempotency / anti-spam
- read-only, không có canonical duplicate concern.

## Performance target
- Meilisearch path `< 250ms`
- fallback path `< 1200ms`

## Notes for AI/codegen
- Search result là DTO đọc, không phải canonical content record.
- Fallback là đường dự phòng correctness, không phải nhánh mặc định khi engine khỏe.

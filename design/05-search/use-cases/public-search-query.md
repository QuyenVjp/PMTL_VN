# Public Search Query

## Purpose
- Trả kết quả tìm kiếm public theo query người dùng, ưu tiên Meilisearch nhưng có fallback (đường dự phòng) qua Payload khi engine gặp sự cố.

## owner module (module sở hữu)
- `search`

## Actors
- `guest`
- `member`

## trigger (điểm kích hoạt)
- Web gọi `GET /api/posts/search?q=<query>&limit=<n>`.

## preconditions (điều kiện tiên quyết)
- Query string hợp lệ theo `searchQuerySchema`.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)
- `searchQuerySchema`

## Read set
- Meilisearch index
- fallback (đường dự phòng) Payload query path

## write path (thứ tự ghi dữ liệu chuẩn)
- Không có canonical business write-path.
- Có thể ghi metrics/log operational theo policy.

## async (bất đồng bộ) side-effects
- không có

## success result (kết quả thành công)
- Trả `hits`, `totalHits`, và marker `engine`.

## Errors
- `400`: query rỗng hoặc limit ngoài giới hạn.
- `500`: Meilisearch lỗi và fallback (đường dự phòng) cũng lỗi.

## Audit
- không audit từng query thường.
- chỉ log metrics hoặc incidents khi fallback (đường dự phòng) bị dùng nhiều.

## Idempotency / anti-spam
- read-only, không có canonical duplicate concern.

## Performance target
- Meilisearch path `< 250ms`
- fallback (đường dự phòng) path `< 1200ms`

## Notes for AI/codegen
- Search result là DTO đọc, không phải canonical content record.
- fallback (đường dự phòng) là đường dự phòng correctness, không phải nhánh mặc định khi engine khỏe.


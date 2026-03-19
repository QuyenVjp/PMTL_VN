# Search Module

> Ghi chú cho sinh viên:
> Search không giữ dữ liệu gốc.
> Nó chỉ dựng "bản sao để tìm kiếm nhanh" từ dữ liệu thật ở Postgres.

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Search Module

## Mục tiêu
- mô tả indexing pipeline hiện có
- mô tả public search contract (hợp đồng dữ liệu/nghiệp vụ) hiện có
- giữ rõ ranh giới giữa source document và search index

## Current scope

### Search source
- search fields nằm trên owner content documents
- current public search chủ yếu cho `posts`

### Search runtime
- `outbox_events` cho business event search quan trọng
- dispatcher phát search-sync
- Redis execution queue (hàng đợi thực thi) `search-sync`
- worker (tiến trình xử lý nền) processor search sync
- Meilisearch index `posts`
- `pgvector` chỉ là capability optional khi module recommendation được chốt

### Public contracts
- `GET /api/posts/search`
- `POST /api/posts/search/reindex`
- `GET /api/search/status`

## Current responsibilities

### Build search documents
- đọc `title`
- đọc `excerptComputed`
- đọc `contentPlainText`
- đọc `normalizedSearchText`
- đọc taxonomy summary
- đọc counters/public metadata

### Index lifecycle
- append outbox event cho publish/update quan trọng
- dispatcher phát reindex/update
- worker (tiến trình xử lý nền) upsert vào Meilisearch
- remove hoặc stop public indexing khi document không còn public

### Query lifecycle
- ưu tiên Meilisearch
- fallback (đường dự phòng) qua Payload query khi cần

## Current boundaries

### Search owns
- search query contract (hợp đồng dữ liệu/nghiệp vụ)
- indexing pipeline
- search status reporting

### Search does not own
- canonical content data
- taxonomy authority
- moderation authority
- notification logic

## Current rules
- Meilisearch chỉ là index
- current public search chỉ index published content
- business event quan trọng của search không phát thẳng bằng pub/sub thuần
- fallback (đường dự phòng) không được trở thành source of truth (nguồn dữ liệu gốc đáng tin cậy nhất) mới


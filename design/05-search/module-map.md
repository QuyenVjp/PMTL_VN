# Search Module

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Search Module

## Mục tiêu
- mô tả indexing pipeline hiện có
- mô tả public search contract hiện có
- giữ rõ ranh giới giữa source document và search index

## Current scope

### Search source
- search fields nằm trên owner content documents
- current public search chủ yếu cho `posts`

### Search runtime
- Redis queue `search-sync`
- worker processor search sync
- Meilisearch index `posts`

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
- enqueue reindex/update
- worker upsert vào Meilisearch
- remove hoặc stop public indexing khi document không còn public

### Query lifecycle
- ưu tiên Meilisearch
- fallback qua Payload query khi cần

## Current boundaries

### Search owns
- search query contract
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
- fallback không được trở thành source of truth mới

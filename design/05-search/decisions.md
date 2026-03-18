# Search Module Decisions

## Decision 1. Search là downstream module, không phải canonical owner

### Context
Repo đã chốt Postgres/Payload là source of truth.

### Decision
- Search chỉ sở hữu indexing/query pipeline.
- Canonical content fields vẫn nằm trên owner collections.

### Rationale
- Tránh biến Meilisearch thành data authority.
- Dễ reindex toàn bộ khi cần.

### Trade-off
- Search correctness phụ thuộc vào quality của source field sync.

## Decision 2. Queue-first indexing cho current scope

### Context
Repo đã có Redis + worker + search-sync processor.

### Decision
- Search updates đi qua queue `search-sync` theo flow chuẩn.
- Sync trực tiếp chỉ là fallback đặc biệt khi queue path không khả dụng và code cho phép.

### Rationale
- Giảm tải request path.
- Có retry và quan sát queue rõ hơn.

### Trade-off
- Eventual consistency giữa content write và search result.

## Decision 3. Chỉ published content mới được index

### Context
Public search không được lộ draft hoặc content chưa public.

### Decision
- Search index current scope chỉ chứa document đã publish.
- Khi document mất trạng thái public, index phải được cập nhật hoặc gỡ.

### Rationale
- An toàn cho public delivery.
- Khớp nguyên tắc hệ thống và implementation.

### Trade-off
- Search result có thể chậm vài giây hoặc vài phút sau publish tùy queue lag.

## Decision 4. Payload fallback là một phần của current design

### Context
Repo hiện đã có fallback query khi Meilisearch unavailable.

### Decision
- Public search contract phải trả rõ engine đang dùng:
  - `meilisearch`
  - `payload-fallback`

### Rationale
- Tăng độ bền của public search.
- Hữu ích cho debugging và observability.

### Trade-off
- Kết quả fallback có thể yếu hơn về ranking, typo tolerance, và facet behavior.

## Decision 5. Current public search scope tập trung vào posts

### Context
Current contracts và service hiện tập trung rõ nhất ở post search.

### Decision
- Design current scope của search tập trung vào `posts`.
- Không ép mọi content collection phải vào public search ngay nếu repo chưa có route/index contract rõ.

### Rationale
- Bám repo thật.
- Tránh over-scope indexing matrix.

### Trade-off
- Muốn search guides/sutras/downloads trong tương lai sẽ cần mở rộng contract có chủ đích.

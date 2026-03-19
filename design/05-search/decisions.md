# Search Module Decisions

> Ghi chú cho sinh viên:
> Nếu bạn sợ nhầm Meilisearch là database thứ hai, hãy đọc Decision 1 và Decision 3 trước.

## Decision 1. Search là downstream module, không phải canonical owner

### Context
Repo đã chốt Postgres/Payload là source of truth (nguồn dữ liệu gốc đáng tin cậy nhất).

### Decision
- Search chỉ sở hữu indexing/query pipeline.
- Canonical content fields vẫn nằm trên owner collections.

### Rationale
- Tránh biến Meilisearch thành data authority.
- Dễ reindex toàn bộ khi cần.

### Trade-off
- Search correctness phụ thuộc vào quality của source field sync.

## Decision 2. outbox-driven indexing cho current scope

### Context
Search là downstream projection nên cần handoff chắc tay giữa canonical write và execution queue.

### Decision
- Search updates đi theo flow chuẩn:
  - canonical content write
  - append `outbox_events`
  - dispatcher phát `search-sync`
  - worker/indexer cập nhật Meilisearch
- Sync trực tiếp chỉ là fallback (đường dự phòng) đặc biệt khi code/recovery path cho phép.

### Rationale
- Giảm tải request path.
- Có retry, replay, và quan sát outbox/queue rõ hơn.

### Trade-off
- Eventual consistency giữa content write và search result.
- Tăng thêm một tầng dispatcher/outbox cần vận hành.

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
- Search result có thể chậm vài giây hoặc vài phút sau publish tùy queue (hàng đợi xử lý) lag.

## Decision 4. Payload fallback (đường dự phòng) là một phần của current design

### Context
Repo hiện đã có fallback (đường dự phòng) query khi Meilisearch unavailable.

### Decision
- Public search contract (hợp đồng dữ liệu/nghiệp vụ) phải trả rõ engine đang dùng:
  - `meilisearch`
  - `payload-fallback (đường dự phòng)`

### Rationale
- Tăng độ bền của public search.
- Hữu ích cho debugging và observability.

### Trade-off
- Kết quả fallback (đường dự phòng) có thể yếu hơn về ranking, typo tolerance, và facet behavior.

## Decision 5. Current public search scope tập trung vào posts

### Context
Current contracts và service (lớp xử lý nghiệp vụ) hiện tập trung rõ nhất ở post search.

### Decision
- Design current scope của search tập trung vào `posts`.
- Không ép mọi content collection phải vào public search ngay nếu repo chưa có route/index contract (hợp đồng dữ liệu/nghiệp vụ) rõ.

### Rationale
- Bám repo thật.
- Tránh over-scope indexing matrix.

### Trade-off
- Muốn search guides/sutras/downloads trong tương lai sẽ cần mở rộng contract (hợp đồng dữ liệu/nghiệp vụ) có chủ đích.

## Decision 6. Meilisearch là engine chính; pgvector chỉ là optional capability

### Context
Search text công khai và recommendation gần nghĩa là hai bài toán khác nhau.

### Decision
- Meilisearch tiếp tục là engine chính cho public search.
- `pgvector` không thay Meilisearch.
- Chỉ thêm `pgvector` khi module recommendation / related-content / semantic retrieval đã được chốt rõ owner và contract.

### Rationale
- Giữ public search đơn giản, nhanh, và dễ quan sát.
- Tránh mở rộng semantic stack quá sớm.

### Trade-off
- Nếu muốn recommendation nâng cao, sẽ cần pipeline embedding, retention, đánh giá chất lượng và fallback riêng.


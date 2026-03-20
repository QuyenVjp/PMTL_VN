# Search Contracts (Hợp đồng Mô-đun Tìm kiếm)

Tài liệu này chốt data contract (hợp đồng dữ liệu) và business contract (hợp đồng nghiệp vụ) cho Search module (mô-đun Tìm kiếm).

## Input schemas (Lược đồ đầu vào)

- `searchQuerySchema`: standard schema cho public/admin search query từ `packages/shared/src/schemas/search.ts` hoặc Zod schema tương đương của rebuild

## Public & admin routes (Tuyến đường public & admin)

- `GET /api/posts/search?q=<query>&limit=<n>`: primary search endpoint (điểm cuối tìm kiếm chính)
- `POST /api/posts/search/reindex`: admin trigger cho full/partial reindex (kích hoạt lập chỉ mục lại)
- `GET /api/search/status`: route báo engine health, queue depth, indexing progress
- `GET /api/admin/search/status`: admin operations endpoint (điểm cuối vận hành) cho dashboard trạng thái
- `POST /api/admin/search/reindex`: admin trigger chuẩn cho full reindex từ admin UI
- `POST /api/admin/search/reindex/:source`: reindex theo nguồn như `posts`, `guides`, `wisdom`

## Canonical rules (Quy tắc chuẩn gốc)

1. Source independence (độc lập với nguồn):
   - Search không sở hữu source article text.
2. Computed projection (bản chiếu được tính ra):
   - Meilisearch document là projection được tính từ PostgreSQL data.
3. Reliability (độ tin cậy):
   - khi đã bật async search sync, update phải idempotent theo document identity + version.
4. Outbox driven (đi theo outbox):
   - business event kích hoạt reindex phải đi qua `outbox_events`.
5. Versioning (phiên bản hóa):
   - search payload nên có version metadata khi projection schema thay đổi.

## Unified wisdom retrieval rule (Quy tắc truy xuất trí huệ hợp nhất)

Search có thể aggregate result (tổng hợp kết quả) từ:

- `01-content`: public knowledge/articles
- `09-wisdom-qa`: Baihua entries
- `09-wisdom-qa`: Metaphysics QA entries

Frontend presentation (cách trình bày phía giao diện) có thể hiển thị như unified wisdom repository (kho trí huệ hợp nhất), dù owner module vẫn tách riêng.

## Response & error handling (Phản hồi & xử lý lỗi)

### Response metadata (Metadata phản hồi)

Response nên chỉ rõ engine used (engine được dùng):

- `meilisearch`
- `sql-api-fallback`

### Status route coverage (Phạm vi route trạng thái)

Status route nên báo:

- engine health
- outbox lag nếu search sync đã bật
- worker queue status nếu worker đã bật
- document count
- last successful sync / freshness
- source-by-source freshness để admin biết `posts`, `guides`, `wisdom`, `little_house_guides` đang lệch ở đâu

### Expected errors (Lỗi dự kiến)

- `400`: query rỗng hoặc limit ngoài phạm vi
- `401`: admin/status route cần session mà không có
- `403`: role không đủ cho reindex
- `500`: engine fail và fallback cũng fail

## Notes for AI/codegen (Ghi chú cho AI và sinh mã)

- Fallback integrity (tính toàn vẹn của fallback):
  - search fail không được làm hỏng source content
- Batch reindex là administrative task (tác vụ hành chính), phải có logging và status tracking
- Admin search operations page không được tự nghĩ logic index trong browser; UI chỉ gọi status/reindex endpoints và hiển thị source freshness rõ ràng
- Không dùng search index như authority cho publish status
- Nếu worker crash, recovery phải hỗ trợ replay/reindex; partial sync không được đánh dấu hoàn tất
- `pgvector` là optional capability (khả năng tùy chọn), không thay vai trò chính của Meilisearch

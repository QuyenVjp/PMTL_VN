# Search Contracts (Hợp đồng Mô-đun Tìm kiếm)

Tài liệu này chốt data contract (hợp đồng dữ liệu) và business contract (hợp đồng nghiệp vụ) cho Search module (mô-đun Tìm kiếm).

## Input schemas (Lược đồ đầu vào)

- `searchQuerySchema`: standard schema cho public/admin search query từ `packages/shared/src/schemas/search.ts` hoặc Zod schema tương đương của rebuild

## Public & admin routes (Tuyến đường public & admin)

- `GET /api/search?q=<query>&limit=<n>`: federated search endpoint (điểm cuối tìm kiếm chính cho web public)
- `GET /api/qa/search?q=<query>&limit=<n>`: specialized wisdom/QA search endpoint khi FE cần surface hẹp hơn
- `POST /api/search/reindex`: admin trigger cho full/partial reindex (kích hoạt lập chỉ mục lại)
- `GET /api/search/status`: route báo engine health, queue depth, indexing progress
- `GET /api/admin/search/status`: admin operations endpoint (điểm cuối vận hành) cho dashboard trạng thái
- `POST /api/admin/search/reindex`: admin trigger chuẩn cho full reindex từ admin UI
- `POST /api/admin/search/reindex/:source`: reindex theo nguồn như `posts`, `guides`, `wisdom`

### Route contract profiles

| Route | Success profile | Required request/response notes |
|---|---|---|
| `GET /api/search` | `list` | query params tối thiểu: `q`, optional `limit`, `type`, `entryType`, `sourceFamily`; response phải có `engine` trong `meta` |
| `GET /api/qa/search` | `list` | query params như search public nhưng result set bị giới hạn `qa_entry`/wisdom QA families |
| `GET /api/search/status` | `single` | chỉ expose operational-safe summary; không dump internals nhạy cảm |
| `GET /api/admin/search/status` | `single` | response phải có `engine`, `documentCounts`, `freshness`, `queue`, `outboxLag?`, `sources` |
| `POST /api/admin/search/reindex` | `accepted` | request phải có `scope: full | source | ids`, optional `reason`, optional `source`; response phải có `jobAccepted` hoặc replay token/job ref |
| `POST /api/admin/search/reindex/:source` | `accepted` | `:source` phải validate theo allowlist như `posts`, `guides`, `wisdom`, `little_house_guides` |

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

Hiện chưa aggregate public search từ:

- `authorityProfiles`

cho đến khi public route canon của authority profile được chốt trong `PAGE_INVENTORY`.

Frontend presentation (cách trình bày phía giao diện) có thể hiển thị như unified wisdom repository (kho trí huệ hợp nhất), dù owner module vẫn tách riêng.

Khi search trả document thuộc Wisdom-QA, response phải đủ để FE không đoán:

- `docType`: `wisdom_entry` | `qa_entry`
- `entryType`:
  - `baihua_teaching`
  - `qa_retrieval`
  - `exposition`
  - `aphorism`
  - `event_discourse`
- `sourceFamily` nếu có:
  - `btpp_video`
  - `btpp_radio`
  - `wenda`
  - `mail_qa`
  - `zongshu`
  - `guide_manual`

Search query contract nên cho filter hẹp thêm:

- `type=<docType>`
- `entryType=<entryType>`
- `sourceFamily=<sourceFamily>`

Quy tắc:

- `type` lọc ở tầng index document (`post`, `wisdom_entry`, `qa_entry`, ...)
- `entryType` và `sourceFamily` chỉ áp dụng cho Wisdom-QA search documents
- FE public `/tim-kiem`, `/bach-thoai`, và `/hoi-dap` không được tự suy luận loại entry từ title string
- `event_discourse` là subtype nội bộ cho retrieval/index; public UI phase hiện tại hiển thị dưới nhóm `Khai thị`, không mở tab public riêng

## Response & error handling (Phản hồi & xử lý lỗi)

### Response metadata (Metadata phản hồi)

Response nên chỉ rõ engine used (engine được dùng):

- `meilisearch`
- `sql-api-fallback`

Public search item tối thiểu phải trả đủ để FE không đoán:

- `publicId`
- `docType`
- `title`
- `excerpt`
- `href` hoặc canonical route ref
- `entryType?`
- `sourceFamily?`
- `publishedAt?`

Consumer aggregate rule cho `/tim-kiem`:

- `GET /api/search` phải đủ shape để map thẳng sang `SearchResultsPageDto`
- ngoài `data[]`, response `meta` phải có:
  - `engine`
  - `pagination`
  - `tabCounts`
  - `filterFacets`
- public/member consumer không được tự quét `data[]` để đếm tab hoặc dựng facet
- nếu query bị reject vì guard (`length`, `term count`, suspicious pattern), canonical error code phải tới từ backend thay vì client-side heuristic

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
- `400`: query vượt guard budget (`search.query.invalid`)
- `401`: admin/status route cần session mà không có
- `403`: role không đủ cho reindex
- `404`: `reindex/:source` dùng source không tồn tại trong registry
- `409`: reindex request trùng job đang chạy mà policy không cho enqueue trùng
- `500`: engine fail và fallback cũng fail

## Notes for AI/codegen (Ghi chú cho AI và sinh mã)

- Fallback integrity (tính toàn vẹn của fallback):
  - search fail không được làm hỏng source content
- Batch reindex là administrative task (tác vụ hành chính), phải có logging và status tracking
- Admin search operations page không được tự nghĩ logic index trong browser; UI chỉ gọi status/reindex endpoints và hiển thị source freshness rõ ràng
- Không dùng search index như authority cho publish status
- Nếu worker crash, recovery phải hỗ trợ replay/reindex; partial sync không được đánh dấu hoàn tất
- `pgvector` là optional capability (khả năng tùy chọn), không thay vai trò chính của Meilisearch

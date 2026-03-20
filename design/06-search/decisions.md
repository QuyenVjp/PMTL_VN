# Search Module Decisions (Các quyết định của mô-đun Tìm kiếm)

> Ghi chú cho sinh viên:
> Search (tìm kiếm) không phải nơi giữ dữ liệu gốc. Nó chỉ là projection (bản chiếu dữ liệu) để đọc nhanh hơn và tìm thuận tiện hơn.

---

## Decision 1. Search là downstream module (mô-đun hạ nguồn)

### Context (Ngữ cảnh)
`Postgres` mới là source of truth (nguồn dữ liệu gốc đáng tin cậy nhất) của hệ thống. Search chỉ nhận dữ liệu đã được xuất bản hợp lệ từ các owner module (mô-đun sở hữu).

### Decision (Quyết định)
Search chỉ sở hữu:
- query contract (hợp đồng truy vấn)
- indexing pipeline (luồng lập chỉ mục)
- engine health/status (trạng thái sức khỏe của máy tìm kiếm)

Nó không sở hữu field nội dung gốc.

### Rationale (Lý do)
- Tránh việc `Meilisearch` bị hiểu nhầm là nơi ghi dữ liệu thật.
- Cho phép rebuild/reindex toàn bộ từ dữ liệu chuẩn gốc khi cần.

---

## Decision 2. Indexing lifecycle (vòng đời lập chỉ mục) đi qua outbox khi phase đó được bật

### Context (Ngữ cảnh)
Khi search đã được tách thành projection riêng, việc handoff (bàn giao) giữa canonical write (ghi dữ liệu chuẩn gốc) và indexing side-effect (tác động phụ lập chỉ mục) phải đáng tin cậy.

### Decision (Quyết định)
Khi phase search projection được bật, luồng chuẩn là:
1. Ghi canonical content vào `Postgres`.
2. Ghi signal vào `outbox_events`.
3. Dispatcher đẩy execution job (công việc thực thi) sang queue.
4. Worker/Indexer upsert document vào `Meilisearch`.

Nếu phase này chưa bật, public search dùng `SQL/API fallback` (đường dự phòng bằng SQL/API) và không giả vờ có reliability stack đầy đủ.

### Rationale (Lý do)
- Giảm tải request path (đường xử lý request) chính.
- Có retry/replay path (đường thử lại/chạy lại) rõ khi projection bị lệch.

---

## Decision 3. Chỉ index nội dung ở trạng thái published (đã xuất bản)

### Context (Ngữ cảnh)
Public search không được làm lộ draft (bản nháp), nội dung nội bộ, hay nội dung đã bị gỡ hiển thị.

### Decision (Quyết định)
Search index chỉ chứa document đang ở trạng thái `published`.
Khi nội dung rời trạng thái public:
- phải de-index (gỡ khỏi chỉ mục) hoặc
- phải bị loại khỏi query path công khai ngay.

### Rationale (Lý do)
- Giữ boundary (ranh giới trách nhiệm) đúng giữa workflow xuất bản và bề mặt public.
- Tránh data leak (rò rỉ dữ liệu) từ projection.

---

## Decision 4. SQL/API fallback là design primitive (thành phần thiết kế gốc), không phải vá tạm

### Context (Ngữ cảnh)
Search engine riêng có thể chưa bật, có thể lỗi, hoặc có thể đang rebuild. Public discovery (khám phá nội dung công khai) vẫn cần đường dự phòng đúng đắn.

### Decision (Quyết định)
Search contract phải cho biết engine hiện tại là:
- `sql-api-fallback`
- hoặc `meilisearch`

Fallback không tạo source of truth mới; nó chỉ là read path (đường đọc dữ liệu) thay thế khi cần.

### Rationale (Lý do)
- Tăng availability (khả năng sẵn sàng phục vụ) mà không phá data correctness (độ đúng của dữ liệu).
- Giúp debug nhanh hơn khi search engine gặp sự cố.

---

## Decision 5. Current scope (phạm vi hiện tại) ưu tiên bài viết trước

### Context (Ngữ cảnh)
Trong phase đầu, bài toán tìm kiếm công khai chủ yếu xoay quanh `posts` và các nội dung biên tập trọng tâm.

### Decision (Quyết định)
Current scope của Search tập trung trước vào `posts`.
Các content type khác chỉ được thêm vào khi:
- đã có indexing contract (hợp đồng lập chỉ mục) rõ
- đã có owner module xác nhận field nào được đem đi search
- đã có rule hiển thị public tương ứng

### Rationale (Lý do)
- Tránh mở quá sớm indexing matrix (ma trận lập chỉ mục) cho nhiều loại nội dung.
- Giữ triển khai ban đầu gọn và dễ verify.

---

## Decision 6. pgvector là optional capability (khả năng tùy chọn), không phải mặc định

### Context (Ngữ cảnh)
Keyword search (tìm kiếm từ khóa) và semantic retrieval (truy xuất ngữ nghĩa) giải hai bài toán khác nhau.

### Decision (Quyết định)
`Meilisearch` vẫn là engine ưu tiên cho public keyword search.
`pgvector` chỉ được thêm khi có use case (ca sử dụng) rõ như:
- related content (nội dung liên quan)
- semantic recommendation (gợi ý theo ngữ nghĩa)
- similarity lookup (tìm nội dung gần nghĩa)

### Rationale (Lý do)
- Giữ search stack (ngăn xếp tìm kiếm) đơn giản trong phase đầu.
- Không tăng complexity tax (thuế độ phức tạp) khi chưa có giá trị thực tế đủ rõ.

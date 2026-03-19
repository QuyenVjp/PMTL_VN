# PMTL_VN Design Guide (Hướng dẫn Thiết kế PMTL_VN)

## Đọc file nào trước? (Which file to read first?)

Nếu bạn là sinh viên và muốn hiểu nhanh (If you are a student and want to understand quickly), đọc theo thứ tự này (read in this order):

1. `design/00-overview/domain-map.md` (Bản đồ nghiệp vụ)
2. `design/00-overview/execution-map.md` (Bản đồ thực thi)
3. `design/CORE_DECISIONS.md` (Các quyết định cốt lõi)
4. `design/ARCHITECTURE_GOVERNANCE.md` (Checklist kiến trúc gộp)
5. `design/MODULE_INTERACTIONS.md` (Tương tác giữa các module)
6. `design/TERMINOLOGY_RULES.md` (Quy chuẩn thuật ngữ)
7. `design/EN_VI_NOTATION_RULES.md` (Quy tắc ghi tiếng Anh kèm giải thích tiếng Việt)
8. `design/SOURCE_NOTES_OFFICIAL.md` (Ghi chú nguồn chính thống)
9. `design/00-overview/FEATURE_SURFACE_FROM_OFFICIAL_SITES.md` (Bề mặt tính năng từ trang chính hiệu)
10. `design/ELDERLY_UX_RULES.md` (Quy tắc thiết kế cho người lớn tuổi)
11. `design/AUDIT_POLICY.md` (Chính sách nhật ký kiểm định)
12. `design/SLA_SLO.md` (Cam kết chất lượng vận hành)
13. `design/SECURITY_BASELINE.md` (Tiêu chuẩn bảo mật cơ sở)
14. `design/FAILURE_MODE_MATRIX.md` (Ma trận chế độ lỗi)
15. `design/CONTRACT_GUIDELINES.md` (Hướng dẫn về hợp đồng dữ liệu)
16. `design/USE_CASE_TEMPLATE.md` (Mẫu kịch bản sử dụng)
17. `design/01-content/*` (Các nội dung biên tập)

- đọc thêm `design/01-content/practice-support-reference.md` nếu bạn đang làm phần niệm kinh / Ngôi Nhà Nhỏ / phóng sinh (practice support)

18. `design/03-engagement/module-map.md` (Bản đồ gắn kết/tu tập)
19. `design/06-calendar/PERSONAL_PRACTICE_CALENDAR_READ_MODEL.md` (Mô hình đọc lịch tu tập cá nhân)
20. `design/08-vows-merit/*` (Lời nguyện và Công đức)
21. `design/09-wisdom-qa/*` (Trí huệ và Giải đáp)
22. `design/09-wisdom-qa/SOURCE_PROVENANCE_MATRIX.md` (Ma trận nguồn gốc bài gốc, bản dịch, web phụng sự viên)
23. `design/09-wisdom-qa/INGESTION_PLAN.md` (Kế hoạch nhập dữ liệu có nguồn đối chiếu)
24. `design/06-calendar/PRACTICE_ADVISORY_MODEL.md` (Mô hình thông báo tu học hằng ngày)
25. `design/00-identity/*` (Định danh người dùng)

- đọc thêm `design/00-identity/PERMISSION_MATRIX.md` nếu bạn đang làm quyền (permissions), moderation (kiểm duyệt), hoặc admin actions (thao tác quản trị)

26. các module còn lại (remaining modules)

## Mỗi loại file dùng để làm gì? (What is each file type for?)

### `.md` (Markdown)

- Dùng để đọc giải thích (For reading explanations).
- Hợp để mở bằng **Markdown Preview** trong VS Code.
- Các file `module-map.md` thường xem bằng **markmap** extension sẽ dễ hiểu hơn.
- Riêng `practice-support-reference.md` là nơi nối tài liệu PDF thực tế với thiết kế của app.
- Các file `contracts.md` chốt **business contract (hợp đồng dữ liệu/nghiệp vụ)** theo từng module.
- Các file trong `use-cases/` chốt **write-path** (quy trình ghi dữ liệu) thực thi cho từng chức năng.
- `TERMINOLOGY_RULES.md` chốt cách gọi đúng để không dịch lệch (to avoid mistranslation).
- `SOURCE_NOTES_OFFICIAL.md` ghi lại cơ sở từ nguồn chính thống để định hướng module.
- `EN_VI_NOTATION_RULES.md` chốt cách giữ tiếng Anh chuyên ngành kèm giải thích tiếng Việt.
- `SOURCE_PROVENANCE_MATRIX.md` chốt tầng nguồn nào là gốc, tầng nào là bản dịch, tầng nào chỉ là support/community.
- `INGESTION_PLAN.md` chốt record nhập dữ liệu thật phải điền field nào, theo thứ tự nào.
- `ELDERLY_UX_RULES.md` chốt nguyên tắc giao diện cho người lớn tuổi (UX rules for elderly).
- `PRACTICE_ADVISORY_MODEL.md` chốt cách bóc một bài thông báo tu học thành data blocks và logic.

### `.mmd` (Mermaid)

- Là file Mermaid thuần (Pure Mermaid file).
- Hợp để mở bằng **Mermaid preview** extension.
- File này chỉ dành cho sơ đồ (For diagrams only), không phải để nhét giải thích dài.
- Các file trạng thái (state models) như `publish-state.mmd`, `report-state.mmd` dùng khi luồng (flow) có nhiều trạng thái dễ hiểu sai.

### `.dbml` (Database Markup Language)

- Là file **schema (lược đồ dữ liệu) logic** cho dbdiagram / DBML preview.
- Dùng để nhìn quan hệ bảng (table relationships), nhóm bảng, enum, note.
- Đây là **schema (lược đồ dữ liệu) thiết kế** để hiểu hệ thống, không phải file SQL thô (Not raw SQL dump).

## Cách đọc nhanh cho sinh viên (Fast track for students)

### Khi mở `module-map.md`

- Hãy xem nó như “bản đồ khu vực” (Area map).
- Câu hỏi cần trả lời (Questions to answer):
  - module này sở hữu cái gì? (What does this module own?)
  - module này không sở hữu cái gì? (What does it NOT own?)
  - module này tham chiếu sang đâu? (Where does it reference to?)

### Khi mở `decisions.md` (Quyết định)

- Đọc theo thứ tự (Read in order):
  - `Context` = vì sao phải quyết định (Why the decision was needed)
  - `Decision` = chốt chọn gì (What was decided)
  - `Rationale` = tại sao chọn vậy (Why it was chosen)
  - `Trade-off` = cái giá phải chấp nhận (What was sacrificed)

### Khi mở `flows` (Luồng dữ liệu)

- Xem như “đường đi của dữ liệu” (Data path).
- Chỉ cần bám 3 câu hỏi (Follow 3 questions):
  - ai bấm / ai gọi? (Who clicks/calls?)
  - dữ liệu được lưu ở đâu? (Where is data stored?)
  - side effect (tác dụng phụ) nào chạy async (bất đồng bộ)?

### Khi mở `use-cases` (Kịch bản sử dụng)

- Xem như “bản đặc tả để code” (Spec for coding).
- Chỉ cần bám 5 câu hỏi (Follow 5 questions):
  - owner module (module sở hữu) là ai?
  - **canonical record (bản ghi chuẩn gốc)** ghi ở đâu trước?
  - summary field nào chỉ là dữ liệu đọc nhanh (read-only data)?
  - side effect nào là **async-only (chỉ chạy ngầm, bất đồng bộ)**?
  - lỗi nào phải **fail fast** (ngắt ngay lập tức)?

### Khi mở `contracts.md` (Hợp đồng dữ liệu)

- Xem như “ranh giới dữ liệu” (Data boundaries).
- Hãy tìm (Look for):
  - schema (lược đồ dữ liệu) validate (lược đồ kiểm tra) nào đang dùng thật
  - route public/BFF nào là contract (hợp đồng dữ liệu/nghiệp vụ) hiện tại
  - field (trường dữ liệu) nào không được expose (tiết lộ) ra ngoài

### Khi mở `AUDIT_POLICY.md` (Chính sách kiểm định)

- Xem để biết (Read to know):
  - hành động nào bắt buộc log (ghi nhật ký)
  - log tối thiểu phải có gì
  - module owner nào phải chịu trách nhiệm ghi nhật ký (append audit)

### Khi mở `TERMINOLOGY_RULES.md` (Quy chuẩn thuật ngữ)

- Xem để biết (Read to know):
  - tên nào là tên chuẩn trong giao diện (UI)
  - tên gốc Hoa nào cần giữ để đối chiếu
  - từ nào tuyệt đối không được dùng bừa (must not be used carelessly)

### Khi mở file `schema.dbml` (sơ đồ cơ sở dữ liệu)

- Đừng cố đọc hết một lúc (Don't try to read everything at once).
- Hãy tìm (Look for):
  - bảng owner chính (main owner tables)
  - bảng phụ / bảng nối (auxiliary/join tables)
  - các field trạng thái (status fields)
  - quan hệ `ref: >` (mối quan hệ tham chiếu)

## Ký hiệu hay gặp (Common Symbols & Terms)

- `source of truth (nguồn dữ liệu gốc đáng tin cậy nhất)` = nơi dữ liệu gốc được tin là đúng nhất (Reliable data source).
- `canonical` = dữ liệu chuẩn, dữ liệu gốc.
- `summary field` = trường tổng hợp để đọc nhanh, không phải nguồn gốc.
- `owner module (module sở hữu)` = module có quyền định nghĩa và ghi dữ liệu gốc.
- `reference` = chỉ tham chiếu sang dữ liệu module khác.
- `async (bất đồng bộ)` = xử lý nền (Asynchronous), không chờ trả kết quả ngay.
- `fallback (đường dự phòng)` = đường dự phòng khi luồng chính lỗi.
- `write-path` = thứ tự ghi dữ liệu chuẩn của use-case (kịch bản sử dụng).
- `control-plane (lớp điều phối hệ thống)` = bản ghi điều phối (như job/subscription), không phải dữ liệu nghiệp vụ gốc.
- `retrieval-first` = tra đúng nguồn trước, không tự sinh nội dung mới trước.

## Mẹo preview trong VS Code (VS Code Preview Tips)

### Markmap

- Mở các file `module-map.md`.
- Dùng extension **Markmap** hoặc **Markdown Preview Enhanced** có hỗ trợ markmap.

### Mermaid

- Mở các file `.mmd`.
- Nếu preview thấy quá nhỏ, dùng (use):
  - zoom của preview
  - hoặc mở file `.mmd` riêng biệt thay vì nhìn nhiều diagram cùng lúc

### DBML

- Dùng extension **DBML / dbdiagram**.
- File đã được thêm `note` và `table group` để nhìn dễ hơn.

## Ghi nhớ quan trọng của repo này (Important Repo Notes)

- **PostgreSQL** là **source of truth (nguồn dữ liệu gốc đáng tin cậy nhất)** (nguồn chính thống).
- **Redis** không phải source of truth (chỉ là bộ nhớ đệm/hàng đợi).
- **Meilisearch** chỉ là index (chỉ mục tìm kiếm).
- **Payload auth** là auth authority (đơn vị xác thực) duy nhất.
- Content (Nội dung) không được ôm **user-state** (trạng thái người dùng).
- **Moderation** là first-class module (module hạng nhất).
- **Notification** là async-only (chỉ chạy ngầm, bất đồng bộ) control-plane (lớp điều phối hệ thống).
- **Search** là outbox-driven projection (bản chiếu đi từ outbox) và có fallback (đường dự phòng).
- Business event quan trọng nên đi qua `outbox_events`, không fire-and-forget.
- Boundary runtime nên được chốt bằng schema validation và env contracts.
- App ưu tiên hỗ trợ tu tập thực tế (real-world practice), không ưu tiên tính năng "ảo".
- **Người lớn tuổi** (Elderly) là nhóm sử dụng chính nên UI/logic phải đơn giản, rõ, dễ đọc.

## Lớp tài liệu mới dùng để làm gì? (What are the new documentation layers for?)

### Root governance files (Tài liệu quản trị gốc)

- `AUDIT_POLICY.md`
  - chốt hành động nào bắt buộc ghi nhật ký (mandatory audit logging)
- `TERMINOLOGY_RULES.md`
  - chốt cách gọi chuẩn cho `Ngôi Nhà Nhỏ`, `Phát nguyện`, `Phóng sanh`, `Bạch thoại Phật pháp`, `Huyền học vấn đáp`
- `SLA_SLO.md`
  - chốt mục tiêu vận hành tối thiểu (operational targets) để không nhét việc nặng vào request path
- `SECURITY_BASELINE.md`
  - chốt tiêu chuẩn bảo mật (security baseline) cho auth, public input, file/media, và public exposure
- `FAILURE_MODE_MATRIX.md`
  - chốt module nào continue / degrade / fail closed khi dependency hỏng
- `CONTRACT_GUIDELINES.md`
  - chốt cách đọc hợp đồng (how to read contracts) và tránh nhầm raw Payload với public DTO
- `USE_CASE_TEMPLATE.md`
  - mẫu chuẩn để viết logic chức năng dạng hành động (action-driven)
- `ARCHITECTURE_GOVERNANCE.md`
  - checklist gộp cho baseline hạ tầng, storage, outbox, metrics, health, rate limit, feature flags

## Tiêu chuẩn chất lượng tối thiểu (Minimum Quality Standards)

### Chiến lược xử lý lỗi (Error strategy)

- Khi một thành phần phụ lỗi (sub-component failure), thiết kế phải trả lời rõ (design must answer clearly):
  - `degrade nhẹ` (Graceful degradation)
  - `read-only` (Chế độ chỉ đọc)
  - hay `fail closed` (Ngắt hoàn toàn để an toàn)
- Lập trường hiện tại (Current stance) của repo:
  - `Postgres down`:
    - không có chế độ chỉ đọc giả từ Redis/Meilisearch
    - vì Redis và Meilisearch không phải source of truth (nguồn dữ liệu gốc đáng tin cậy nhất)
    - hệ thống coi đây là lỗi nghiêm trọng (critical failure) và ưu tiên recovery, không giả lập correctness từ dữ liệu phụ
  - `Meilisearch down`:
    - tìm kiếm công khai (public search) được phép **fallback (đường dự phòng)** về Payload query
  - `Redis/worker (tiến trình xử lý nền) down`:
    - canonical write vẫn có thể thành công ở nhiều flow
    - nhưng async (bất đồng bộ) side effects (tác dụng phụ chạy ngầm) sẽ trễ và cần recovery
- Nếu muốn biết rõ hơn, đọc (read):
  - `design/00-overview/domain-map.md`
  - `design/CORE_DECISIONS.md`
  - `design/05-search/contracts.md`
  - `design/infra/INFRA.md`

### Hiệu năng (Performance SLA)

- Đừng chỉ nói “hỗ trợ người lớn tuổi”; phải có mục tiêu thời gian phản hồi (response time targets).
- PMTL_VN đã chốt SLA/SLO (service (lớp xử lý nghiệp vụ) Level Agreements) ở:
  - `design/SLA_SLO.md`
- Các con số quan trọng cần nhớ (Key numbers to remember):
  - public read (đọc công khai) `< 500ms`
  - search healthy (tìm kiếm khi ổn định) `< 250ms`
  - fallback (đường dự phòng) search (tìm kiếm dự phòng) `< 1200ms`
  - comment/community submit (gửi bình luận/cộng đồng) `< 800ms`
  - push job create (tạo thông báo đẩy) `< 500ms`

### Bảo mật cơ sở (Security baseline)

- Nếu tính năng có xác thực (auth), tải file, PDF, audio, video, public search, hoặc public submit form, phải đọc:
  - `design/SECURITY_BASELINE.md`
- Đặc biệt với PDF/media:
  - file phải qua danh sách cho phép (allowlist) + kiểm tra size/mime.
  - sản phẩm thực tế (production) nên chuẩn bị object storage rõ như `S3` / `MinIO`
  - file từ nguồn ngoài hoặc upload lại nên có quy trình quét/cách ly (scan/quarantine flow) trước khi công khai

### Failure mode matrix
- Nếu muốn biết từng module phản ứng ra sao khi:
  - `Postgres down`
  - `Meilisearch down`
  - `Redis/worker (tiến trình xử lý nền) down`
  - `media storage down`
  - `object storage/scan fail`
  thì đọc:
  - `design/FAILURE_MODE_MATRIX.md`
- File này đặc biệt quan trọng khi viết:
  - degraded mode
  - fallback (đường dự phòng) logic
  - maintenance mode
  - recovery path

## Một số điều README này cố tình chốt (Enforced Patterns)

- Không có chế độ chỉ đọc "giả" khi Postgres chết.
- Tìm kiếm có dự phòng (fallback (đường dự phòng)), nhưng dự phòng không thay thế nguồn dữ liệu gốc (source of truth (nguồn dữ liệu gốc đáng tin cậy nhất)).
- Event quan trọng không được coi là "đã phát" chỉ vì canonical write đã thành công.
- SLA là yếu tố đầu vào thiết kế (design input), không phải tối ưu sau.
- File/media/PDF là phần của ranh giới bảo mật (security boundary (ranh giới trách nhiệm)), không chỉ là “chuyện hạ tầng”.

### Module execution files (Tài liệu triển khai module)

- `<module>/contracts.md`
  - hợp đồng dữ liệu và route chính của module
- `<module>/use-cases/*.md`
  - đặc tả chức năng ở mức AI có thể code theo (AI-ready spec) mà không cần đoán
- `<module>/*state*.mmd`
  - sơ đồ trạng thái (state machine) cho các luồng dễ hiểu lầm

## Nếu bạn bị rối (If you are confused)

Hãy quay lại 3 file "la bàn" này (Back to these 3 compass files):

- `design/00-overview/domain-map.md`
- `design/CORE_DECISIONS.md`
- `design/MODULE_INTERACTIONS.md`

Ba file đó là “la bàn” của toàn bộ thư mục `design/`.

Sau khi hiểu 3 file đó, nếu muốn code một chức năng cụ thể thì đọc tiếp (read further):

- `design/TERMINOLOGY_RULES.md`
- file `contracts.md` của module chủ sở hữu (owner)
- file tương ứng trong `use-cases/`

## Tài liệu PDF hỗ trợ niệm nên đọc ở đâu? (Where to read practice support PDFs?)

- Nếu bạn đang map từ tài liệu kinh sách / hướng dẫn thực hành vào app:
  - đọc `design/01-content/practice-support-reference.md`
  - xem thêm `design/01-content/practice-support-flows.mmd`
  - mở `design/01-content/practice-pdf-extracts/README.md` để xem output từ PDF thật
  - mở `design/01-content/chant-items-catalog.md` (danh sách mục niệm đề xuất)
  - mở `design/01-content/practice-ui-checklists.md` (checklists giao diện)
  - mở `design/01-content/little-house-spec.md` (đặc tả Ngôi Nhà Nhỏ)
- File đó giúp trả lời:
  - tài liệu nào nên map vào `chantItems`
  - tài liệu nào nên map vào `chantPlans`
  - phần nào là checklist giao diện (UI checklist)
  - phần nào còn cần con người xem lại (human review)



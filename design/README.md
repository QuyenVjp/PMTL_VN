# PMTL_VN Design Guide (Hướng dẫn Thiết kế PMTL_VN)

## Đọc file nào trước? (Which file to read first?)

Nếu bạn là sinh viên và muốn hiểu nhanh (If you are a student and want to understand quickly), đọc theo thứ tự này (read in this order):

1. `design/00-overview/domain-map.md` (Bản đồ nghiệp vụ)
2. `design/00-overview/execution-map.md` (Bản đồ thực thi)
3. `design/CORE_DECISIONS.md` (Các quyết định cốt lõi)
4. `design/MODULE_INTERACTIONS.md` (Tương tác giữa các module)
5. `design/TERMINOLOGY_RULES.md` (Quy chuẩn thuật ngữ)
6. `design/SOURCE_NOTES_OFFICIAL.md` (Ghi chú nguồn chính thống)
7. `design/00-overview/FEATURE_SURFACE_FROM_OFFICIAL_SITES.md` (Bề mặt tính năng từ trang chính thức)
8. `design/ELDERLY_UX_RULES.md` (Quy tắc thiết kế cho người lớn tuổi)
9. `design/AUDIT_POLICY.md` (Chính sách nhật ký kiểm định)
10. `design/SLA_SLO.md` (Cam kết chất lượng vận hành)
11. `design/SECURITY_BASELINE.md` (Tiêu chuẩn bảo mật cơ sở)
12. `design/CONTRACT_GUIDELINES.md` (Hướng dẫn về hợp đồng dữ liệu)
13. `design/USE_CASE_TEMPLATE.md` (Mẫu kịch bản sử dụng)
14. `design/01-content/*` (Các nội dung biên tập)

- đọc thêm `design/01-content/practice-support-reference.md` nếu bạn đang làm phần niệm kinh / Ngôi Nhà Nhỏ / phóng sinh

15. `design/03-engagement/module-map.md` (Bản đồ gắn kết/tu tập)
16. `design/06-calendar/PERSONAL_PRACTICE_CALENDAR_READ_MODEL.md` (Mô hình đọc lịch tu tập cá nhân)
17. `design/08-vows-merit/*` (Lời nguyện và Công đức)
18. `design/09-wisdom-qa/*` (Trí huệ và Giải đáp)
19. `design/identity/*` (Định danh người dùng)

- đọc thêm `design/identity/PERMISSION_MATRIX.md` nếu bạn đang làm quyền, moderation (kiểm duyệt), hoặc admin actions (thao tác quản trị)

20. các module còn lại (other modules)

## Mỗi loại file dùng để làm gì? (What is each file type for?)

### `.md` (Markdown)

- Dùng để đọc giải thích (For reading explanations).
- Hợp để mở bằng **Markdown Preview** trong VS Code.
- Các file `module-map.md` thường xem bằng **markmap** extension sẽ dễ hiểu hơn.
- Riêng `practice-support-reference.md` là nơi nối tài liệu PDF thực tế với thiết kế của app.
- Các file `contracts.md` chốt **business contract** (hợp đồng nghiệp vụ) theo từng module.
- Các file trong `use-cases/` chốt **write-path** (quy trình ghi dữ liệu) thực thi cho từng chức năng.
- `TERMINOLOGY_RULES.md` chốt cách gọi đúng để không dịch lệch (to avoid mistranslation).
- `SOURCE_NOTES_OFFICIAL.md` ghi lại cơ sở từ nguồn chính thức để định hướng module.
- `ELDERLY_UX_RULES.md` chốt nguyên tắc giao diện cho người lớn tuổi (UX rules for elderly).

### `.mmd` (Mermaid)

- Là file Mermaid thuần (Pure Mermaid file).
- Hợp để mở bằng **Mermaid preview** extension.
- File này chỉ dành cho sơ đồ (For diagrams only), không phải để nhét giải thích dài.
- Các file trạng thái như `publish-state.mmd`, `report-state.mmd` dùng khi luồng (flow) có nhiều trạng thái dễ hiểu sai.

### `.dbml` (Database Markup Language)

- Là file **schema logic** cho dbdiagram / DBML preview.
- Dùng để nhìn quan hệ bảng, nhóm bảng, enum, note.
- Đây là **schema thiết kế** để hiểu hệ thống, không phải file SQL thô (Not raw SQL dump).

## Cách đọc nhanh cho sinh viên (Fast track for students)

### Khi mở `module-map.md`

- Hãy xem nó như “bản đồ khu vực” (Area map).
- Câu hỏi cần trả lời (Questions to answer):
  - module này sở hữu cái gì? (What does this module own?)
  - module này không sở hữu cái gì? (What does it NOT own?)
  - module này tham chiếu sang đâu? (Where does it reference to?)

### Khi mở `decisions.md` (Quyết định)

- Đọc theo thứ tự:
  - `Context` = hoàn cảnh/vì sao phải quyết định
  - `Decision` = chốt chọn gì (the decision itself)
  - `Rationale` = lý do tại sao chọn vậy
  - `Trade-off` = cái giá phải chấp nhận (nhược điểm)

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
  - **canonical record** (bản ghi chính thống) ghi ở đâu trước?
  - summary field nào chỉ là dữ liệu đọc nhanh (read-only data)?
  - side effect nào là **async-only** (chỉ chạy ngầm)?
  - lỗi nào phải **fail fast** (ngắt ngay lập tức)?

### Khi mở `contracts.md` (Hợp đồng dữ liệu)

- Xem như “ranh giới dữ liệu” (Data boundaries).
- Hãy tìm (Look for):
  - schema validate (lược đồ kiểm tra) nào đang dùng thật
  - route public/BFF nào là contract hiện tại
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

### Khi mở `schema.dbml` (Sơ đồ cơ sở dữ liệu)

- Đừng cố đọc hết một lúc (Don't try to read everything at once).
- Hãy tìm (Look for):
  - bảng owner chính (main owner tables)
  - bảng phụ / bảng nối (auxiliary/join tables)
  - các field trạng thái (status fields)
  - quan hệ `ref: >` (mối quan hệ tham chiếu)

## Ký hiệu hay gặp (Common Symbols & Terms)

- `source of truth` = nguồn dữ liệu gốc được tin là đúng nhất.
- `canonical` = dữ liệu chuẩn, dữ liệu gốc.
- `summary field` = trường tổng hợp để đọc nhanh, không phải nguồn gốc.
- `owner module` = module có quyền định nghĩa và ghi dữ liệu gốc.
- `reference` = chỉ tham chiếu sang dữ liệu module khác.
- `async` = xử lý nền, không chờ trả kết quả ngay (Asynchronous).
- `fallback` = đường dự phòng khi luồng chính lỗi.
- `write-path` = thứ tự ghi dữ liệu chuẩn của use-case.
- `control-plane` = bản ghi điều phối (như job/subscription), không phải dữ liệu nghiệp vụ gốc.
- `retrieval-first` = tra đúng nguồn trước, không tự sinh nội dung mới trước.

## Mẹo preview trong VS Code (VS Code Preview Tips)

### Markmap
- Mở các file `module-map.md`.
- Dùng extension **Markmap** hoặc **Markdown Preview Enhanced** có hỗ trợ markmap.

### Mermaid
- Mở các file `.mmd`.
- Nếu preview thấy quá nhỏ, hãy zoom preview hoặc mở file `.mmd` riêng biệt.

### DBML
- Dùng extension **DBML / dbdiagram**.
- File đã được thêm `note` và `table group` để nhìn dễ hơn.

## Ghi nhớ quan trọng của repo này (Important Notes)

- **PostgreSQL** là **source of truth** (nguồn chính thống).
- **Redis** không phải source of truth (chỉ là bộ nhớ đệm/hàng đợi).
- **Meilisearch** chỉ là index (chỉ mục tìm kiếm).
- **Payload auth** là auth authority duy nhất (đơn vị xác thực duy nhất).
- Content (Nội dung) không được ôm **user-state** (trạng thái người dùng).
- **Moderation** là first-class module (module hạng nhất).
- **Notification** là async-only control-plane (hệ điều phối chạy ngầm).
- **Search** là queue-first và có fallback (ưu tiên hàng đợi và có dự phòng).
- App ưu tiên hỗ trợ tu tập thực tế (real-world practice), không ưu tiên tính năng "ảo" (virtual features).
- **Người lớn tuổi** là nhóm sử dụng chính nên UI/logic phải đơn giản, rõ, dễ đọc.

## Lớp tài liệu mới dùng để làm gì? (What are the new docs for?)

### Root governance files (Tài liệu quản trị gốc)

- `AUDIT_POLICY.md`: chốt hành động nào bắt buộc ghi nhật ký (audit).
- `TERMINOLOGY_RULES.md`: chốt cách gọi chuẩn cho `Ngôi Nhà Nhỏ`, `Phát nguyện`, `Phóng sanh`, `Bạch thoại Phật pháp`, `Huyền học vấn đáp`.
- `SLA_SLO.md`: chốt mục tiêu vận hành tối thiểu (operational targets).
- `SECURITY_BASELINE.md`: chốt tiêu chuẩn bảo mật cho xác thực, dữ liệu và đầu vào người dùng.
- `CONTRACT_GUIDELINES.md`: chốt cách đọc hợp đồng dữ liệu (how to read contracts).
- `USE_CASE_TEMPLATE.md`: mẫu chuẩn để viết logic chức năng dạng hành động (action-driven).

## Tiêu chuẩn chất lượng tối thiểu (Minimum Quality Standards)

### Chiến lược xử lý lỗi (Error strategy)

- Khi một thành phần phụ lỗi (sub-component failure), thiết kế phải trả lời rõ (design must answer clearly):
  - `degrade nhẹ` (Graceful degradation)
  - `read-only` (Chế độ chỉ đọc)
  - hay `fail closed` (Ngắt hoàn toàn để an toàn)
  - 
- Lập trường hiện tại của repo (Current stance of the repo):
  - **Postgres down**: Không có chế độ chỉ đọc giả từ Redis/Meilisearch. Hệ thống coi đây là lỗi nghiêm trọng (critical failure).
  - **Meilisearch down**: Tìm kiếm công khai được phép **fallback** (dự phòng) về Payload query.
  - **Redis/worker down**: Ghi dữ liệu trực tiếp vẫn thành công, nhưng các tác vụ chạy ngầm sẽ trễ.

### Cam kết hiệu năng (Performance SLA)

- Đừng chỉ nói “hỗ trợ người lớn tuổi”; phải có mục tiêu thời gian phản hồi (response time targets).
- Các con số quan trọng cần nhớ (Key numbers to remember):
  - public read (đọc công khai) `< 500ms`
  - search healthy (tìm kiếm khi ổn định) `< 250ms`
  - fallback search (tìm kiếm dự phòng) `< 1200ms`
  - comment/community submit (gửi bình luận/cộng đồng) `< 800ms`
  - push job create (tạo thông báo đẩy) `< 500ms`

### Tiêu chuẩn bảo mật (Security baseline)

- Nếu tính năng có xác thực (auth), tải file, PDF, audio, video, phải đọc: `design/SECURITY_BASELINE.md`.
- Đặc biệt với PDF/media:
  - File phải qua danh sách cho phép (allowlist) + kiểm tra size/mime.
  - Sản phẩm thực tế nên dùng object storage như **S3 / MinIO**.
  - File từ nguồn ngoài cần được quét (scan) trước khi công khai.

## Một số điều README này cố tình chốt (Specific Enforcements)

- Không có chế độ chỉ đọc "giả" khi Postgres chết.
- Tìm kiếm có dự phòng, nhưng dự phòng không thay thế nguồn dữ liệu gốc (source of truth).
- SLA là yếu tố đầu vào thiết kế (design input), không phải cái tối ưu sau này.
- File/media/PDF là ranh giới bảo mật (security boundary), không chỉ là chuyện hạ tầng (infra).

### Module execution files (Tài liệu triển khai module)

- `<module>/contracts.md`: hợp đồng dữ liệu chính của module.
- `<module>/use-cases/*.md`: đặc tả chức năng để AI có thể code (AI-ready spec).
- `<module>/*state*.mmd`: sơ đồ trạng thái (state machine) cho các quy trình phức tạp.

## Nếu bạn bị rối (If you are confused)

Hãy quay lại 3 file "la bàn" này (Back to these 3 compass files):
- `design/00-overview/domain-map.md`
- `design/CORE_DECISIONS.md`
- `design/MODULE_INTERACTIONS.md`

Sau khi hiểu 3 file đó, để code chức năng cụ thể thì đọc tiếp:
- `design/TERMINOLOGY_RULES.md`
- file `contracts.md` của module sở hữu (owner)
- file tương ứng trong `use-cases/`

## Tài liệu PDF hỗ trợ tu tập (PDF Practice Support)

- Nếu bạn đang map từ tài liệu kinh sách / hướng dẫn thực hành vào app:
  - đọc `design/01-content/practice-support-reference.md`
  - xem thêm `design/01-content/practice-support-flows.mmd`
  - mở `design/01-content/practice-pdf-extracts/README.md`
  - mở `design/01-content/chant-items-catalog.md` (danh sách đề xuất)
  - mở `design/01-content/practice-ui-checklists.md` (danh mục kiểm tra giao diện)
  - mở `design/01-content/little-house-spec.md` (Ngôi Nhà Nhỏ)
- File giúp trả lời: Cái nào là **chantItems**, cái nào là **chantPlans**, checklist UI, và phần nào cần kiểm duyệt thủ công (human review).

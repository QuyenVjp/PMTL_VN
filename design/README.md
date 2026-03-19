# PMTL_VN Design Guide

## Đọc file nào trước?

Nếu bạn là sinh viên và muốn hiểu nhanh, đọc theo thứ tự này:

1. `design/00-overview/domain-map.md`
2. `design/00-overview/execution-map.md`
3. `design/CORE_DECISIONS.md`
4. `design/MODULE_INTERACTIONS.md`
5. `design/TERMINOLOGY_RULES.md`
6. `design/SOURCE_NOTES_OFFICIAL.md`
7. `design/00-overview/FEATURE_SURFACE_FROM_OFFICIAL_SITES.md`
8. `design/ELDERLY_UX_RULES.md`
9. `design/AUDIT_POLICY.md`
10. `design/SLA_SLO.md`
11. `design/CONTRACT_GUIDELINES.md`
12. `design/USE_CASE_TEMPLATE.md`
13. `design/01-content/*`
   - đọc thêm `design/01-content/practice-support-reference.md` nếu bạn đang làm phần niệm kinh / Ngôi Nhà Nhỏ / phóng sinh
14. `design/03-engagement/module-map.md`
15. `design/06-calendar/PERSONAL_PRACTICE_CALENDAR_READ_MODEL.md`
16. `design/08-vows-merit/*`
17. `design/09-wisdom-qa/*`
18. `design/identity/*`
19. các module còn lại

## Mỗi loại file dùng để làm gì?

### `.md`
- Dùng để đọc giải thích.
- Hợp để mở bằng Markdown Preview trong VS Code.
- Các file `module-map.md` thường xem bằng markmap extension sẽ dễ hiểu hơn.
- Riêng `practice-support-reference.md` là nơi nối tài liệu PDF thực tế với design của app.
- Các file `contracts.md` chốt business contract theo module.
- Các file trong `use-cases/` chốt write-path thực thi cho từng chức năng.
- `TERMINOLOGY_RULES.md` chốt cách gọi đúng để không dịch lệch.
- `SOURCE_NOTES_OFFICIAL.md` ghi lại cơ sở từ nguồn chính thức để định hướng module.
- `ELDERLY_UX_RULES.md` chốt nguyên tắc giao diện cho người lớn tuổi.

### `.mmd`
- Là file Mermaid thuần.
- Hợp để mở bằng Mermaid preview extension.
- File này chỉ dành cho sơ đồ, không phải để nhét giải thích dài.
- Các file state như `publish-state.mmd`, `report-state.mmd` dùng khi flow có nhiều trạng thái dễ hiểu sai.

### `.dbml`
- Là file schema logic cho dbdiagram / DBML preview.
- Dùng để nhìn quan hệ bảng, nhóm bảng, enum, note.
- Đây là schema thiết kế để hiểu hệ thống, không phải raw SQL dump.

## Cách đọc nhanh cho sinh viên

### Khi mở `module-map.md`
- Hãy xem nó như “bản đồ khu vực”.
- Câu hỏi cần trả lời:
  - module này sở hữu cái gì?
  - module này không sở hữu cái gì?
  - module này tham chiếu sang đâu?

### Khi mở `decisions.md`
- Đọc theo thứ tự:
  - `Context` = vì sao phải quyết định
  - `Decision` = chốt chọn gì
  - `Rationale` = tại sao chọn vậy
  - `Trade-off` = cái giá phải chấp nhận

### Khi mở `flows`
- Xem như “đường đi của dữ liệu”.
- Chỉ cần bám 3 câu hỏi:
  - ai bấm / ai gọi?
  - dữ liệu được lưu ở đâu?
  - side effect nào chạy async?

### Khi mở `use-cases`
- Xem như “spec để code”.
- Chỉ cần bám 5 câu hỏi:
  - owner module là ai?
  - canonical record ghi ở đâu trước?
  - summary field nào chỉ là dữ liệu đọc nhanh?
  - side effect nào là async-only?
  - lỗi nào phải fail fast?

### Khi mở `contracts.md`
- Xem như “ranh giới dữ liệu”.
- Hãy tìm:
  - schema validate nào đang dùng thật
  - route public/BFF nào là contract hiện tại
  - field nào không được expose ra ngoài

### Khi mở `AUDIT_POLICY.md`
- Xem để biết:
  - hành động nào bắt buộc log
  - log tối thiểu phải có gì
  - module owner nào phải chịu trách nhiệm append audit

### Khi mở `TERMINOLOGY_RULES.md`
- Xem để biết:
  - tên nào là tên chuẩn trong UI
  - tên gốc Hoa nào cần giữ để đối chiếu
  - từ nào tuyệt đối không được dùng bừa

### Khi mở `schema.dbml`
- Đừng cố đọc hết một lúc.
- Hãy tìm:
  - bảng owner chính
  - bảng phụ / bảng nối
  - các field trạng thái
  - quan hệ `ref: >`

## Ký hiệu hay gặp

- `source of truth` = nơi dữ liệu gốc được tin là đúng nhất
- `canonical` = dữ liệu chuẩn, dữ liệu gốc
- `summary field` = field tổng hợp để đọc nhanh, không phải nguồn gốc
- `owner module` = module có quyền định nghĩa và ghi dữ liệu gốc
- `reference` = chỉ tham chiếu sang dữ liệu module khác
- `async` = xử lý nền, không chờ trả kết quả ngay
- `fallback` = đường dự phòng khi luồng chính lỗi
- `write-path` = thứ tự ghi dữ liệu chuẩn của use-case
- `control-plane` = record điều phối như job/subscription, không phải dữ liệu nghiệp vụ gốc
- `retrieval-first` = tra đúng nguồn trước, không sinh nội dung mới trước

## Mẹo preview trong VS Code

### Markmap
- Mở các file `module-map.md`.
- Dùng extension Markmap hoặc Markdown Preview enhanced có hỗ trợ markmap.

### Mermaid
- Mở các file `.mmd`.
- Nếu preview thấy quá nhỏ, dùng:
  - zoom của preview
  - hoặc mở file `.mmd` riêng thay vì nhìn nhiều diagram cùng lúc

### DBML
- Dùng DBML / dbdiagram extension.
- File đã được thêm note và table group để nhìn dễ hơn.

## Ghi nhớ quan trọng của repo này

- PostgreSQL là source of truth.
- Redis không phải source of truth.
- Meilisearch chỉ là index.
- Payload auth là auth authority duy nhất.
- Content không được ôm user-state.
- Moderation là first-class module.
- Notification là async-only control-plane.
- Search là queue-first và có fallback.
- App ưu tiên hỗ trợ tu tập thực tế, không ưu tiên tính năng "ảo".
- Người lớn tuổi là nhóm sử dụng chính nên UI/logic phải đơn giản, rõ, dễ đọc.

## Lớp tài liệu mới dùng để làm gì?

### Root governance files
- `AUDIT_POLICY.md`
  - chốt hành động nào bắt buộc ghi audit
- `TERMINOLOGY_RULES.md`
  - chốt cách gọi chuẩn cho `Ngôi Nhà Nhỏ`, `Phát nguyện`, `Phóng sanh`, `Bạch thoại Phật pháp`, `Huyền học vấn đáp`
- `SLA_SLO.md`
  - chốt target vận hành tối thiểu để không nhét việc nặng vào request path
- `CONTRACT_GUIDELINES.md`
  - chốt cách đọc contract và tránh nhầm raw Payload với public DTO
- `USE_CASE_TEMPLATE.md`
  - mẫu chuẩn để viết logic chức năng theo kiểu action-driven

### Module execution files
- `<module>/contracts.md`
  - hợp đồng dữ liệu và route chính của module
- `<module>/use-cases/*.md`
  - spec chức năng ở mức AI có thể code theo mà không đoán
- `<module>/*state*.mmd`
  - state machine cho các flow dễ hiểu lầm

## Nếu bạn bị rối

Hãy quay lại 3 file này:
- `design/00-overview/domain-map.md`
- `design/CORE_DECISIONS.md`
- `design/MODULE_INTERACTIONS.md`

Ba file đó là “la bàn” của toàn bộ thư mục `design/`.

Sau khi hiểu 3 file đó, nếu muốn code một chức năng cụ thể thì đọc tiếp:
- `design/TERMINOLOGY_RULES.md`
- file `contracts.md` của module owner
- file tương ứng trong `use-cases/`

## Tài liệu PDF hỗ trợ niệm nên đọc ở đâu?

- Nếu anh đang map từ tài liệu kinh sách / hướng dẫn thực hành vào app:
  - đọc `design/01-content/practice-support-reference.md`
  - xem thêm `design/01-content/practice-support-flows.mmd`
  - mở `design/01-content/practice-pdf-extracts/README.md` để xem output pipeline local từ PDF thật
  - mở `design/01-content/chant-items-catalog.md` để xem danh sách chant item gợi ý
  - mở `design/01-content/practice-ui-checklists.md` để xem checklist UI cho flow nghi thức
  - mở `design/01-content/little-house-spec.md` nếu đang làm riêng phần Ngôi Nhà Nhỏ
- File đó giúp trả lời:
  - tài liệu nào nên map vào `chantItems`
  - tài liệu nào nên map vào `chantPlans`
  - phần nào là checklist UI
  - phần nào còn cần human review

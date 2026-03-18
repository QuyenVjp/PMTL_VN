# PMTL_VN Design Guide

## Đọc file nào trước?

Nếu bạn là sinh viên và muốn hiểu nhanh, đọc theo thứ tự này:

1. `design/00-overview/domain-map.md`
2. `design/CORE_DECISIONS.md`
3. `design/MODULE_INTERACTIONS.md`
4. `design/01-content/*`
   - đọc thêm `design/01-content/practice-support-reference.md` nếu bạn đang làm phần niệm kinh / Ngôi Nhà Nhỏ / phóng sinh
5. `design/identity/*`
6. các module còn lại

## Mỗi loại file dùng để làm gì?

### `.md`
- Dùng để đọc giải thích.
- Hợp để mở bằng Markdown Preview trong VS Code.
- Các file `module-map.md` thường xem bằng markmap extension sẽ dễ hiểu hơn.
- Riêng `practice-support-reference.md` là nơi nối tài liệu PDF thực tế với design của app.

### `.mmd`
- Là file Mermaid thuần.
- Hợp để mở bằng Mermaid preview extension.
- File này chỉ dành cho sơ đồ, không phải để nhét giải thích dài.

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

## Nếu bạn bị rối

Hãy quay lại 3 file này:
- `design/00-overview/domain-map.md`
- `design/CORE_DECISIONS.md`
- `design/MODULE_INTERACTIONS.md`

Ba file đó là “la bàn” của toàn bộ thư mục `design/`.

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

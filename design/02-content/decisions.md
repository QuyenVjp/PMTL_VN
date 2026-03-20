# Content Module Decisions

> Ghi chú cho sinh viên:
> Mỗi quyết định ở đây dùng để ngăn AI hoặc dev mới quay lại mô hình cũ sai boundary (ranh giới trách nhiệm).

## Decision 1. Content dùng split collections, không dùng single posts table

### Context
Design cũ giả định mọi loại content phải gộp vào một bảng `posts`.
Repo hiện tại đã split collection rõ ràng theo trách nhiệm và public contract (hợp đồng dữ liệu/nghiệp vụ).

### Decision
- Giữ editorial content theo collection riêng:
  - `posts`
  - `hubPages`
  - `beginnerGuides`
  - `downloads`
  - `sutras`
  - `sutraVolumes`
  - `sutraChapters`
  - `sutraGlossary`
- Taxonomy và media tiếp tục là collection dùng chung qua reference.

### Rationale
- Khớp implementation thật.
- Dễ giữ admin UI, validation, DTO mapping và field set riêng cho từng loại document.
- Tránh null-field explosion của một mega-table.

### Trade-off
- Có nhiều collection hơn để quản lý.
- Search/discovery cần mapping từ nhiều owner collections thay vì một nguồn duy nhất.

## Decision 2. Workflow publish dùng explicit status + publishedAt

### Context
Current direction đã chốt workflow explicit ở backend và giữ `publishedAt` làm canonical timestamp.

### Decision
- Workflow gốc của editorial content là:
  - draft
  - published
- `publishedAt` là timestamp public delivery.
- Không giữ workflow approval nhiều bước cho content nếu code hiện tại chưa dùng.

### Rationale
- Khớp current direction.
- Đủ rõ cho cache, search, public route và SEO.

### Trade-off
- Editorial review workflow hiện tại không chi tiết như hệ thống CMS enterprise.
- Nếu sau này cần review queue (hàng đợi xử lý) riêng thì phải thiết kế thêm, không tự suy từ file này.

## Decision 3. Search fields nằm trên owner document

### Context
`posts` đang có `contentPlainText`, `normalizedSearchText`, `excerptComputed`, và public counters.
Search module cần source fields ổn định để build document.

### Decision
- Search source fields nằm trên content owner document.
- Content module chịu trách nhiệm chuẩn hóa field nguồn.
- Search module chỉ đọc và index, không sở hữu canonical content body.

### Rationale
- Giảm duplicated transformation logic.
- Dễ debug khi search index sai vì source fields nằm ngay trong owner collection.

### Trade-off
- Mỗi collection owner phải giữ discipline khi cập nhật field tính toán.
- Một số search fields là denormalized data trên canonical record (bản ghi chuẩn gốc).

## Decision 4. Taxonomy và media dùng reference rõ ràng

### Context
Editorial content hiện liên kết tới `categories`, `tags`, `media`, `relatedPosts`, và đôi lúc `events`.

### Decision
- Dùng relation/reference explicit cho taxonomy và media.
- Không embed generic metadata blob để thay thế quan hệ thật.
- Event chỉ được tham chiếu từ content, ownership nằm ở calendar.

### Rationale
- Giữ boundary (ranh giới trách nhiệm) rõ.
- Tối ưu cho public mapping, admin editing, và incremental refactor.

### Trade-off
- Một số read path cần populate/resolve relation.
- Phải giữ mapper rõ thay vì đọc raw relation trực tiếp ngoài UI.

## Decision 5. Content không sở hữu user-state hoặc moderation source-of-truth

### Context
Design cũ từng nhét bookmark và reading progress vào content schema (lược đồ dữ liệu).
Repo hiện tại đã có collection self-owned state riêng và moderation report riêng.

### Decision
- Không đặt các entity sau trong content module:
  - bookmarks
  - reading progress
  - practice logs
  - moderation reports
- `postComments` cũng không thuộc content ownership; content chỉ là entity được bình luận.

### Rationale
- Khớp boundary (ranh giới trách nhiệm) module hiện tại.
- Tránh để content trở thành module “ôm tất cả”.

### Trade-off
- Cross-module flow cần rõ hơn.
- Module interactions phải được đọc cùng tài liệu này khi generate code.

## Decision 6. Practice support content thuộc content, không thuộc engagement

### Context
Repo hiện có collection thật `chantItems` và `chantPlans`.
Các tài liệu PDF niệm hằng ngày, thắp tâm hương, phát nguyện, phóng sinh, và Ngôi Nhà Nhỏ cho thấy có một lớp dữ liệu public/editorial riêng:
- script
- lời khấn mẫu
- số biến gợi ý
- time rules
- checklist nghi thức

### Decision
- `chantItems` và `chantPlans` thuộc content module.
- PDF hướng dẫn, bản in, preview image, script file nên đi qua `downloads`, `media`, hoặc `beginnerGuides` tùy use case.
- Engagement chỉ được lưu:
  - preference theo user
  - practice log
  - progress/bookmark cá nhân

### Rationale
- Khớp current direction ở `apps/api`.
- Giữ được boundary (ranh giới trách nhiệm) rất rõ giữa “nội dung chuẩn để mọi người đọc” và “trạng thái cá nhân của một user”.
- Dễ map bộ PDF hiện tại vào app mà không làm engagement phình to sai vai trò.

### Trade-off
- Reader hoặc practice screen phải compose từ nhiều owner:
  - content cho script/rule
  - engagement cho progress/log
- Khi tài liệu PDF được cập nhật, cần review mapping sang `chantItems` / `chantPlans` thay vì sửa bừa ở UI.

## Decision 7. `Kinh Bài Tập Hằng Ngày` là first-class content surface

### Context
Ngoài thực tế, phần `Kinh Bài Tập Hằng Ngày` thường bị tách thành:
- PDF bước niệm
- bài FAQ/lưu ý
- beginner hub
- preset theo tình huống

Nếu chỉ giữ ở dạng `chantItems` / `chantPlans`, FE và admin sẽ thiếu:
- grouped IA
- scenario presets
- FAQ
- companion downloads

### Decision
- `Kinh Bài Tập Hằng Ngày` được nâng thành first-class content surface.
- Dùng:
  - `hubPages` cho hub
  - `beginnerGuides` cho guides / scenario pages / FAQ-style longform
  - `downloads` cho PDF companion
- `chantItems` và `chantPlans` vẫn là canonical registry cho bài niệm và plan.

### Rationale
- giữ chuẩn boundary
- giúp public FE, admin FE, advisory, practice sheet dùng chung truth
- vượt mô hình blog/PDF rời đang thấy trên web ngoài

### Trade-off
- content surface lớn hơn, cần editorial discipline mạnh hơn
- API và admin workspace phải rõ hơn thay vì chỉ dùng generic guide editor

## Decision 8. `Phóng Sanh` là first-class content surface, không chỉ là journal

### Context
Repo hiện đã có:
- `life release journal` trong `09-vows-merit`
- source mapping và checklist trong `02-content`

Nhưng nếu chỉ dừng ở journal:
- user không có public guide rõ
- FE không có ritual variants
- admin không có workspace chuẩn cho wording nhạy cảm

### Decision
- `Phóng Sanh` được nâng thành first-class content surface.
- Dùng:
  - `hubPages` cho pillar/hub
  - `beginnerGuides` cho nghi thức, variant pages, FAQ
  - `downloads` cho PDF nghi thức và printable checklists
- `09-vows-merit` chỉ giữ journal canonical state.

### Rationale
- giữ đúng boundary giữa ritual truth và self-state
- hỗ trợ public SEO + admin editing + member companion flow
- khớp nhu cầu product thực tế tốt hơn mô hình article/PDF rời

### Trade-off
- cần thêm admin/editorial discipline
- content và journal phải có context bridge rõ để không drift

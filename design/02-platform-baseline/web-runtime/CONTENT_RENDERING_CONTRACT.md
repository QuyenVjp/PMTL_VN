# CONTENT_RENDERING_CONTRACT

File này chốt cách `apps/web` render content surfaces.
Nó tập trung vào:

- block types
- attribution
- quote / note / footnote
- audio companion
- rich text safety

> Design language: `design/02-platform-baseline/web-runtime/DESIGN_PRINCIPLES.md`
> Page canon: `design/04-execution-overlay/web/PAGE_INVENTORY.md`
> DTO canon: `design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md`

---

## Baseline

- Content rendering phải server-first khi có thể.
- Không render raw CMS/editor HTML không sanitize.
- Rich text / markdown surfaces phải đi qua safe renderer contract.
- Source attribution là first-class UI, không phải footnote vứt cuối trang.
- shadcn `Typography` examples chỉ là utility reference; không thay owner content renderer contract.

---

## Surface families

### Editorial article

Routes:
- `/bai-viet`
- `/bai-viet/[slug]`

Traits:
- title, metadata, reading flow
- optional doctrinal citation
- comments/community zone ở dưới

### Wisdom / Baihua / Khai thi

Routes:
- `/bach-thoai`
- `/bach-thoai/[slug]`

Traits:
- text-first
- doctrinal/teacher/source authority phải rõ
- audio là companion, không được lấn text

### QA / Wenda

Routes:
- `/hoi-dap`
- `/hoi-dap/[slug]`

Traits:
- source/timestamp/screenshot provenance rất quan trọng
- UI phải làm nổi “nguồn gốc câu trả lời”

### Structured guide / How-to

Routes:
- grouped guide details
- practice instruction pages

Traits:
- TOC
- summary box
- step/warning/checklist blocks
- CTA sang tracker hoặc download

---

## Block vocabulary

Phase đầu renderer phải support rõ các block classes sau:

- `heading`
- `paragraph`
- `list`
- `quote`
- `warning`
- `note`
- `step-sequence`
- `faq`
- `download-panel`
- `source-attribution`
- `audio-companion`
- `image-compare`
- `table` khi thật sự cần

Không để mỗi route tự chế block rendering mới nếu chưa thêm vào vocabulary owner.

## Typography implementation note

- Heading, paragraph, list, blockquote, inline-code, table typography có thể mượn utility class direction từ shadcn examples.
- Nhưng PMTL không ship một `Typography` component chung rồi phó mặc toàn bộ semantics cho nó.
- Typography phải đi sau block semantics:
  - block nào là `quote` thì render theo quote contract
  - block nào là `warning` thì render theo warning contract
  - block nào là `source-attribution` thì render theo provenance contract

---

## Quote / note / warning

### Quote

- dùng cho lời dạy, trích đoạn, đoạn nhấn mạnh
- phải có visual distinction nhẹ, trang nghiêm
- nếu quote có source thì source phải đi cùng block hoặc ngay sau block

### Note

- dùng cho giải thích bổ sung
- không được nhìn như warning nếu không có risk

### Warning

- dùng cho caution, nghi thức nhạy cảm, hoặc boundary quan trọng
- warning phải nổi hơn note, nhưng không đỏ gắt kiểu lỗi hệ thống nếu đây không phải error

---

## Source attribution

### Required rule

Source attribution bắt buộc rõ ở:
- `Bạch thoại`
- `Hỏi đáp`
- `Khai thị`
- doctrinal article có trích nguồn

### Attribution card tối thiểu

- source name / authority
- source origin
- timestamp/code nếu route là QA/Wenda
- optional screenshot/source link

Không được để source chỉ là text chìm cuối bài.

---

## Footnotes / citations

- Nếu có footnote/citation:
  - phải có anchor rõ
  - phải quay lại được
  - không render kiểu superscript vô chủ rồi bỏ mặc
- Citation UI phải nhẹ, không academic nặng tay quá với PMTL reading flow

---

## Audio companion

- Audio là companion cho text, không phải primary owner mặc định
- Trên detail pages:
  - text content phải đọc được trước
  - audio control không che TOC/navigation
  - audio block nên gần source/intro hoặc vị trí hợp logic
- Với sách nói/chapter reading:
  - chapter text vẫn là primary surface
  - audio không được phá navigator chương

---

## Downloads / attachments

- Download panel là block owner riêng, không phải link trần rải trong paragraph
- Mỗi download item nên có:
  - label
  - file type
  - size nếu có
  - intent/context ngắn

---

## Open product decisions still needing owner input

- bộ block types cuối cùng của editorial renderer
- có support footnote chi tiết ở phase đầu hay không
- `table` có là block official ngay từ phase đầu hay để phase sau
- screenshot/source-preview trên QA detail hiển thị mức nào

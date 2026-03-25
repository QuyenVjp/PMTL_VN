# Manual Translation Editor Workflow

File này chốt lane thực dụng cho PMTL:

`dịch tay -> check trùng -> preview slug -> lưu draft -> review -> publish`

Mục tiêu:

- bỏ `MCP auto publish` khỏi current scope
- giữ tốc độ nhập bài đủ tốt cho editor
- để hệ thống chỉ làm phần cơ khí: `duplicate-check`, `slug-preview`, `draft creation`
- giữ `human review` là gate thật cho nội dung pháp môn

## Product stance

- PMTL hiện không dùng lane `auto publish`.
- PMTL hiện không cần `full-auto ingestion` làm owner flow.
- PMTL giữ `manual-first workflow` cho:
  - `BTPP`
  - `Hỏi đáp / Wenda`
  - `Khai thị`
  - `Pháp hội`
- Machine assist chỉ là phụ trợ cho:
  - gợi ý slug
  - gợi ý field mapping
  - gợi ý tag / alias
  - draft translation nếu editor chủ động dùng

## Current canonical workflow

### Step 1. Editor chuẩn bị source

Editor phải có tối thiểu:

- `entryType`
- `sourceFamily`
- `sourceUrl`
- `sourceCode` nếu có
- `titleOriginal`
- `rawOriginalText`

### Step 2. Editor nhập bản dịch

Editor nhập tay hoặc paste bản dịch đã tự xử lý từ tool riêng.

Required fields tối thiểu:

- `titleVietnamese`
- `translatedText`
  - hoặc `questionVietnamese` + `answerVietnamese` cho `qa`

Optional but recommended:

- `summaryVietnamese`
- `keywordAliases`
- `editorNotes`

### Step 3. Hệ thống chạy duplicate-check

Editor bấm `Kiểm tra trùng`.

Input:

- `entryType`
- `sourceFamily`
- `sourceCode?`
- `sourceUrl?`

Output tối thiểu:

- `duplicateFound`
- `matchedPublicId?`
- `matchedReason`

Rule:

- nếu trùng canonical key thì không tạo entry mới
- editor chỉ được:
  - mở record cũ
  - hoặc hủy thao tác

### Step 4. Hệ thống chạy slug-preview

Editor bấm `Xem trước slug`.

Input:

- `titleVietnamese?`
- `titleOriginal?`
- `sourceCode?`
- `entryType`

Output tối thiểu:

- `slug`
- `exists`
- `conflictWithPublicId?`
- `dedupeStatus`

Rule:

- slug chỉ là readability/SEO helper
- slug collision không được override canonical duplicate detection

### Step 5. Lưu draft

Nếu `duplicate-check` pass:

- editor bấm `Lưu draft`
- entry tạo ở trạng thái:
  - `translated_draft`
  - hoặc `human_review_required`

### Step 6. Review và publish

Reviewer/editor xác nhận:

- source provenance
- original text đủ và đúng
- translated text đúng nghĩa
- tags / aliases hợp lý
- slug ổn
- entry type đúng

Sau đó mới được `publish`.

## Required admin form

Admin workspace cần có một create/edit flow tối giản với các field:

- `entryType`
- `sourceFamily`
- `sourceCode`
- `sourceUrl`
- `titleOriginal`
- `titleVietnamese`
- `rawOriginalText`
- `translatedText` hoặc `question/answer` pair
- `summaryVietnamese`
- `keywordAliases`
- `editorNotes`

Actions tối thiểu:

- `Kiểm tra trùng`
- `Xem trước slug`
- `Lưu draft`
- `Gửi review`
- `Publish`

## Minimal statuses

- `source_verified`
- `translated_draft`
- `human_review_required`
- `translated_reviewed`
- `published`

## What is explicitly out of scope now

- MCP auto publish
- browser automation lên custom GPT web
- scheduler tự tạo bài public
- translation provider làm canonical owner
- batch ingestion không có người review

## Phase-later upgrade path

Khi volume bài đủ lớn, mới nâng lên:

- semi-auto import từ template/paste payload
- import job queue
- translation provider profile thực sự dùng trong admin flow

Nhưng lúc đó vẫn giữ:

- duplicate-check
- slug-preview
- draft gate
- human review

## Notes for AI/codegen

- Đừng scaffold current admin flow như một automation pipeline mặc định.
- Hãy coi `manual editor workflow` là lane canon hiện tại.
- Nếu có `import jobs`, hãy coi chúng là phase-later lane hoặc admin convenience lane, không phải default create flow.

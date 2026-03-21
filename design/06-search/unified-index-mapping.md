# Unified Index Mapping (Ánh xạ Chỉ mục Tìm kiếm Hợp nhất)

File này chốt **field mapping cụ thể** từ các module source sang unified search document.

Không có doc này, developer không biết:
- field nào từ module nào vào index
- document shape thống nhất là gì
- ai chịu trách nhiệm build document cho từng type

---

## Document types (Các loại tài liệu trong index)

Unified index gồm **8 document types** từ 2 module source:

| docType | Module nguồn | Collection nguồn |
|---|---|---|
| `post` | Content | `posts` |
| `beginner_guide` | Content | `beginnerGuides` |
| `chant_item` | Content | `chantItems` |
| `sutra` | Content | `sutras` |
| `little_house_guide` | Content | `beginnerGuides` (sub-type: little_house) |
| `little_house_faq` | Content | `beginnerGuides` (guide_type='faq', content_group='little_house') |
| `wisdom_entry` | Wisdom-QA | `wisdomEntries` |
| `qa_entry` | Wisdom-QA | `qaEntries` |

> **Quy tắc bất biến**: chỉ đánh index tài liệu có `status = 'published'` hoặc `reviewStatus` đã được approved.
> Search không được expose draft, hidden, hoặc quarantined content.

> **Quy tắc bất biến**: chỉ đánh index tài liệu có `status = 'published'` hoặc `reviewStatus` đã được approved.
> Search không được expose draft, hidden, hoặc quarantined content.

---

## Unified document shape (Lược đồ tài liệu thống nhất)

Đây là canonical shape của mọi document trong unified index.
Phải có Zod schema runtime cho shape này.

```typescript
// packages/shared/src/search-document.schema.ts
const SearchDocumentSchema = z.object({
  // Metadata
  docId:        z.string().uuid(),    // internal index ID (không expose ra public)
  docType:      z.enum(['post', 'beginner_guide', 'chant_item', 'sutra', 'little_house_guide', 'little_house_faq', 'wisdom_entry', 'qa_entry']),
  moduleOwner:  z.enum(['content', 'wisdom-qa']),
  publicId:     z.string(),           // publicId của entity nguồn
  slug:         z.string().optional(), // nếu entity có slug

  // Searchable fields
  title:        z.string(),           // field chính cho matching tiêu đề
  body:         z.string(),           // nội dung chính để full-text search
  excerpt:      z.string().optional(), // snippet ngắn cho search result UI

  // Taxonomy & filtering
  tags:         z.array(z.string()).default([]),
  categories:   z.array(z.string()).default([]),
  language:     z.enum(['vi', 'zh', 'bilingual']).default('vi'),

  // Source attribution (cho Wisdom-QA)
  sourceName:   z.string().optional(), // tên nguồn thẩm quyền
  sourceUrl:    z.string().url().optional(),
  provenanceType: z.enum(['official', 'mirror', 'volunteer', 'translation', 'annotation']).optional(),

  // Temporal
  publishedAt:  z.string().datetime(),
  indexedAt:    z.string().datetime(),

  // Version tracking
  sourceVersion: z.number().int().positive(), // version counter trên entity nguồn
});
```

---

## Field mapping per docType (Ánh xạ field từng loại)

### `post` (từ Content.posts)

| Search field | Source field | Ghi chú |
|---|---|---|
| `title` | `posts.title` | |
| `body` | `posts.contentPlainText` | plain text đã strip HTML |
| `excerpt` | `posts.excerptComputed` | auto-generated hoặc editor-written |
| `tags` | `posts.tags[].name` | |
| `categories` | `posts.categories[].name` | |
| `language` | `'vi'` | hardcode |
| `publishedAt` | `posts.publishedAt` | |
| `sourceVersion` | `posts.updatedAt` → epoch | dùng để detect stale index |

---

### `beginner_guide` (từ Content.beginnerGuides)

| Search field | Source field | Ghi chú |
|---|---|---|
| `title` | `beginnerGuides.title` | |
| `body` | `beginnerGuides.contentPlainText` | |
| `excerpt` | `beginnerGuides.description` | |
| `tags` | `beginnerGuides.tags[].name` | |
| `language` | `'vi'` | hardcode |
| `publishedAt` | `beginnerGuides.publishedAt` | |

---

### `chant_item` (từ Content.chantItems)

| Search field | Source field | Ghi chú |
|---|---|---|
| `title` | `chantItems.name` | |
| `body` | `chantItems.contentPlainText` | text của bài niệm |
| `excerpt` | `chantItems.description` | |
| `tags` | `chantItems.tags[].name` | |
| `language` | `chantItems.language` | vi / zh / bilingual |
| `publishedAt` | `chantItems.publishedAt` | |

---

### `sutra` (từ Content.sutras)

| Search field | Source field | Ghi chú |
|---|---|---|
| `title` | `sutras.title` | |
| `body` | `sutras.descriptionPlainText` concat `sutraVolumes.summaryText` | ghép mô tả + tóm tắt quyển |
| `excerpt` | `sutras.description` | |
| `tags` | `sutras.tags[].name` | |
| `language` | `sutras.language` | |
| `publishedAt` | `sutras.publishedAt` | |

---

### `little_house_guide` (từ Content.beginnerGuides — sub-type little_house)

| Search field | Source field | Ghi chú |
|---|---|---|
| `title` | `beginnerGuides.title` | |
| `body` | `beginnerGuides.contentPlainText` | plain text stripped từ block content |
| `excerpt` | `beginnerGuides.description` | |
| `tags` | `beginnerGuides.tags[].name` + `['ngoi-nha-nho', 'little-house']` | luôn gắn tag định danh |
| `categories` | `['ngoi-nha-nho']` | hardcode để filter cluster |
| `language` | `'vi'` | hardcode |
| `publishedAt` | `beginnerGuides.publishedAt` | |
| `sourceVersion` | `beginnerGuides.updatedAt` → epoch | |

> **Filter rule**: chỉ index `beginnerGuides` có `contentGroup = 'little_house'`.
> Không index toàn bộ `beginnerGuides` chung vào type này — phải có discriminator field.

---

### `little_house_faq` (từ Content — beginnerGuides với guide_type='faq', content_group='little_house')

> **Lưu ý nguồn**: Phase 1 dùng `beginnerGuides` với discriminator `content_group = 'little_house'` và `guide_type = 'faq'`.
> Nếu Phase 2 tách `faq_entries` thành bảng riêng, cập nhật mapping tương ứng.

| Search field | Source field | Ghi chú |
|---|---|---|
| `title` | `beginnerGuides.title` | câu hỏi FAQ là tiêu đề để search match |
| `body` | `beginnerGuides.content` (extracted plain text) | |
| `excerpt` | `beginnerGuides.description` hoặc content first 200 chars | |
| `tags` | `beginnerGuides.tags` + `['ngoi-nha-nho', 'faq']` | |
| `categories` | `['ngoi-nha-nho']` | |
| `contentGroup` | `beginnerGuides.content_group` | discriminator cho filter |
| `language` | `'vi'` | hardcode |
| `publishedAt` | `beginnerGuides.created_at` (hoặc `published_at` nếu có) | |

> FAQ entries trong Little House context nên xuất hiện riêng biệt trong search filter tab "Hỏi đáp Ngôi Nhà Nhỏ".
> Không cần source attribution vì FAQ là nội dung editorial của PMTL_VN.

---

### `wisdom_entry` (từ Wisdom-QA.wisdomEntries)

| Search field | Source field | Ghi chú |
|---|---|---|
| `title` | `wisdomEntries.title` | |
| `body` | `wisdomEntries.translatedText` + `' '` + `wisdomEntries.originalText` | tiếng Việt ưu tiên, giữ cả bản gốc để match |
| `excerpt` | `wisdomEntries.translatedText` — first 200 chars | |
| `tags` | `wisdomEntries.tags` | |
| `language` | `'bilingual'` | vì có cả gốc + dịch |
| `sourceName` | `wisdomEntries.authorityProfile.name` | |
| `sourceUrl` | `wisdomEntries.sourceUrl` | |
| `provenanceType` | `wisdomEntries.provenanceType` | |
| `publishedAt` | `wisdomEntries.publishedAt` | chỉ index khi `reviewStatus = 'translated_reviewed'` hoặc `'source_verified'` |

> **Quan trọng**: chỉ index `wisdomEntries` khi `reviewStatus` là `translated_reviewed` hoặc `source_verified`.
> Draft hoặc `translated_draft` không được xuất hiện trong public search.

---

### `qa_entry` (từ Wisdom-QA.qaEntries)

| Search field | Source field | Ghi chú |
|---|---|---|
| `title` | `qaEntries.question` | câu hỏi là tiêu đề |
| `body` | `qaEntries.answerText` | |
| `excerpt` | `qaEntries.answerText` — first 200 chars | |
| `tags` | `qaEntries.tags` | |
| `language` | `'vi'` | |
| `sourceName` | `qaEntries.sourceName` | |
| `sourceUrl` | `qaEntries.sourceUrl` | |
| `publishedAt` | `qaEntries.publishedAt` | |

---

## Indexing ownership (Ai xây document?)

| Module nguồn | Responsibility |
|---|---|
| Content module | Build `SearchDocumentDto` cho: post, beginner_guide, chant_item, sutra, little_house_guide, little_house_faq |
| Wisdom-QA module | Build `SearchDocumentDto` cho: wisdom_entry, qa_entry |
| Search module | Nhận document (qua direct call phase 1, hoặc outbox phase 2+), upsert vào store |

Quy tắc:
- **source module biết field của mình** — Search không được tự query Content/WisdomQA để build document
- Search module chỉ nhận đã-built document và upsert
- khi entity thay đổi, source module trigger reindex cho document của mình

---

## Index lifecycle rules (Quy tắc vòng đời index)

| Sự kiện | Hành động |
|---|---|
| Entity published | Upsert document vào index |
| Entity updated (nội dung/taxonomy) | Upsert lại toàn bộ document (overwrite) |
| Entity unpublished | Xóa document khỏi index |
| Entity soft deleted | Xóa document khỏi index |
| wisdomEntry reviewStatus thay đổi sang draft | Xóa document khỏi index |
| wisdomEntry reviewStatus thay đổi sang reviewed | Upsert document vào index |

---

## Phase 1 vs Phase 2+ implementation

| Phase | Mechanism | Store |
|---|---|---|
| Phase 1 | SQL `ILIKE` / `tsvector` query trực tiếp trên Postgres | Không cần index riêng |
| Phase 2+ | Meilisearch với outbox-driven sync | Meilisearch + outbox |

**Phase 1 query contract:**
- `GET /api/search?q=<term>&type=<docType>&lang=<language>&limit=20&offset=0`
- Query chạy trên `normalizedSearchText` hoặc `tsvector` column trên từng bảng nguồn
- Response trả về unified shape (subset của `SearchDocumentSchema`)

> **Bug 4 fix — Search KHÔNG được trả draft/hidden content:**
> Mọi search query phase 1 (SQL) PHẢI có:
> ```sql
> WHERE status = 'published'
>   AND published_at IS NOT NULL
>   AND published_at <= NOW()
> ```
> Với wisdom_entries còn phải thêm:
> ```sql
>   AND review_status IN ('translated_reviewed', 'source_verified')
> ```
> **Không có exception.** Nếu developer quên filter → draft content lọt ra public search.
> Đây là `WHERE` clause bắt buộc ở tầng repository, không phải tầng service — để không ai bypass được.

**Phase 2+ migration:**
- khi Meilisearch bật, build lại toàn bộ index từ Postgres (full reindex)
- fallback vẫn phải hoạt động khi Meilisearch down
- `GET /api/search/status` báo engine đang dùng

---

## Notes for AI/codegen

- Search module không tự query Content hoặc Wisdom-QA để lấy data — source module push document
- Không expose `docId` (internal) ra public API — chỉ expose `publicId`
- `body` field không được chứa HTML — phải là plain text
- Wisdom-QA `body` bao gồm cả `originalText` để người dùng search được chữ Hán hoặc Pali gốc
- Không index entity chưa published hoặc chưa reviewed

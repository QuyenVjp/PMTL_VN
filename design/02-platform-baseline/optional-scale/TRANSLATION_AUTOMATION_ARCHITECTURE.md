# Translation Automation Architecture

File này chốt kiến trúc cho lane:

`raw source text -> structured ingest job -> translation draft -> duplicate guard -> slug preview -> PMTL draft entry`

Mục tiêu:

- cho PMTL ingest được nhiều bài `Wenda / Khai thị / BTPP / Pháp hội` mà không phải copy tay từng bước
- giữ chặt `source-backed` và `human review`
- tách rõ `canonical duplicate detection` với `slug collision handling`
- chốt vai trò của `Responses API`, `MCP`, và workflow orchestrator

> Current product decision:
> - lane này không phải owner flow hiện tại
> - owner flow hiện tại là `manual-first` ở `manual-translation-editor-workflow.md`
> - file này chỉ giữ kiến trúc phase-later nếu PMTL cần semi-auto ingestion

## Product stance

- PMTL không dùng AI để tự sinh `khai thị` hoặc tự trả lời Phật pháp.
- PMTL hiện không dùng `MCP auto publish` làm flow chính.
- AI chỉ được dùng để:
  - parse source metadata
  - draft translation
  - propose tags / aliases / excerpt
  - propose slug
- publish vẫn phải qua review gate của PMTL.

## Programmatic stance

- `chatgpt.com/gpts/...` custom GPT của cá nhân là `editor-assist lane`, không phải canonical automation API lane.
- Hướng full-auto được khuyến nghị là:
  - workflow orchestrator
  - gọi `OpenAI Responses API` hoặc translation provider profile
  - dùng PMTL ingest API hoặc PMTL MCP server để check duplicate / preview slug / create draft
- Browser automation lên ChatGPT web chỉ là fallback fragile, không là canonical system path.

## Recommended automation lanes

Các lane dưới đây là `phase-later`, không phải current canonical flow.

### Lane A. API-first automation (recommended)

`n8n / Pipedream / Make / internal worker`
-> normalize source
-> call translation profile
-> call PMTL duplicate guard
-> call PMTL slug preview
-> create ingestion job
-> poll import job result

Đây là lane phù hợp cho batch hoặc semi-batch.

### Lane B. Chat-first with PMTL MCP tools (assisted)

`ChatGPT / agent runtime`
-> dùng PMTL MCP tools để:
  - tìm bài đã có
  - preview slug
  - tạo draft ingest job
  - mở import job result

Lane này phù hợp cho editor làm việc tương tác, không phải scheduler batch chính.

## Orchestrator recommendation

- Nếu ưu tiên self-host / kiểm soát dữ liệu: `n8n`
- Nếu ưu tiên build nhanh bằng code workflow: `Pipedream`
- Nếu ưu tiên no-code cloud flow: `Make`

PMTL design không khóa cứng một vendor, nhưng route/API phải không phụ thuộc vendor.

## Pipeline stages

### 1. Normalize source

Input tối thiểu:

- `entryType`
- `sourceFamily`
- `sourceUrl`
- `sourceCode` nếu có
- `titleOriginal`
- `rawOriginalText`

Nếu source giống:

- `Wenda20161016A 25:58`

thì normalize thành:

- `entryType = qa`
- `sourceFamily = wenda`
- `sourceCode = Wenda20161016A 25:58`

### 2. Canonical duplicate guard

Duplicate guard phải chạy trước translation draft.

Canonical duplicate key ưu tiên:

- `entryType + sourceFamily + sourceCode`

Fallback duplicate signals:

- `sourceUrl`
- normalized original title + same source family

Nếu trùng canonical key:

- không tạo entry mới
- trả `duplicate_found`
- mở link record cũ hoặc attach vào import job hiện tại dạng skipped outcome

### 3. Translation draft

Translation service chỉ tạo:

- `titleVietnamese`
- `bodyVietnamese`
- `questionVietnamese`
- `answerVietnamese`
- `summaryVietnamese`
- `keywordAliases` draft

Mọi output machine-generated phải vào draft state:

- `reviewStatus = translated_draft` hoặc `human_review_required`

Không auto-publish machine translation.

### 4. Slug preview

Slug là readability/SEO field, không phải duplicate authority.

Rule:

- base slug ưu tiên từ `titleVietnamese`
- nếu thiếu title Việt, fallback sang:
  - `sourceCode` normalized
  - hoặc `titleOriginal`
- server-side slug preview phải trả:
  - `slug`
  - `exists`
  - `conflictWithPublicId?`
  - `dedupeStatus`

Nếu slug trùng nhưng canonical duplicate không trùng:

- suffix theo deterministic strategy
- ví dụ: `...-2`, `...-3`

### 5. Create import job

Import job phải lưu:

- `jobType`
- `entryType`
- `sourceFamily`
- `sourceCode`
- `sourceUrl`
- `providerProfile`
- `dedupeStatus`
- `candidateSlug`
- `resultEntryPublicId?`
- `status`
- `errorSummary?`

### 6. Human review gate

Editor review tối thiểu:

- source provenance
- original text completeness
- translation correctness
- tags / aliases
- slug
- publish readiness

## Provider profile model

PMTL nên tách `translation provider profile` khỏi bài cụ thể.

Ví dụ:

- `openai_responses_spiritual_vi_v1`
- `manual_human_translation`
- `community_translation_import`

`chatgpt.com/gpts/...` link cá nhân không phải canonical provider id.

## PMTL MCP tool surface

Nếu bật PMTL MCP server, tool set tối thiểu nên có:

- `wisdom.lookup_existing`
- `wisdom.preview_slug`
- `wisdom.create_ingestion_job`
- `wisdom.get_import_job`

MCP tool không được bypass backend policy; nó chỉ gọi cùng canonical business lane như API.

## Required admin/API surface

Để code batch này sạch, admin/API phải có:

- duplicate check
- slug preview
- create import job
- import job detail
- retry import job

## Notes for AI/codegen

- Đừng gắn chặt automation vào custom GPT web URL.
- Canonical duplicate detection phải thắng slug collision.
- MCP là tool lane; backend API mới là authority.
- Machine translation chỉ tạo draft, không tự chuyển sang published.

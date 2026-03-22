# Wisdom-QA & Search Routing Design Review
**Focus**: Overlap/confusion analysis for apps/web + apps/admin in Wisdom-QA area  
**Date**: 2026-03-22  
**Status**: Design gaps identified for scaffold clarity

---

## I. Route Naming Conflicts & Confusion Points

### 1.1 `/bach-thoai` Hub — Overlapping Doc Types
**Issue**: Single route surface covers 4 distinct content types with unclear filtering.

| Doc Type | Route Pattern | Admin Owner | Issue |
|---|---|---|---|
| Bạch thoại | `/bach-thoai/[slug]` | `/admin/noi-dung/bach-thoai` | generic slug won't indicate type |
| Hỏi đáp (Q&A) | `/bach-thoai/[slug]` | same | **type detection must use query filter or detail fetch** |
| Khai thị | `/bach-thoai/[slug]` | same | **no URL-level type distinction** |
| Sách nói | `/bach-thoai/sach-noi/*` | same | audiobook nested, OK |

**Decision Required**:
- ✅ **KEEP**: `/bach-thoai` as unified hub (design intent: "Bạch thoại Phật pháp" learning surface)
- **ACTION**: Page must load tab state from URL query param: `/bach-thoai?type=hoi-dap` or similar
- **ACTION**: Detail page **must fetch entry type from API** and render badge/styling per type
- **Admin action**: `/admin/noi-dung/bach-thoai` needs table/filter columns for `entryType` (bai-viet | hoi-dap | khai-thi)

---

### 1.2 `/tim-kiem` vs `/bach-thoai` — Search Scope Confusion
**Issue**: Two different search surfaces serving similar but overlapping queries.

| Surface | Route | Scope | Module |
|---|---|---|---|
| **Universal Search** | `/tim-kiem` | Posts + Wisdom entries + Guides | Search |
| **Wisdom Search** | `/bach-thoai` (w/ search bar) | Wisdom-QA only | Wisdom-QA |

**Problem**:
- User at `/bach-thoai` sees "search bar" → unclear if it's global or wisdom-only
- `/tim-kiem` may also surface wisdom entries via Search module
- **Namespace collision**: both can index same wisdom entries

**Decision Required**:
- ✅ **KEEP `/tim-kiem`**: Global discovery page (public, Cmd+K trigger)
- ✅ **KEEP `/bach-thoai` search bar**: Wisdom-QA scoped (filter results to wisdom type only)
- **ACTION**: Admin needs `/admin/he-thong/tim-kiem` to monitor **merged search index** across both surfaces
- **Admin clarification**: Is Search module responsible for indexing wisdom entries, or does Wisdom-QA own that?

---

### 1.3 `/ngoi-nha-nho/tra-cuu` — Potential Route Duplication
**Issue**: `/ngoi-nha-nho/tra-cuu` is a **guide group landing page**, not a generic "lookup" route.

| Route | Type | Purpose | Problem |
|---|---|---|---|
| `/ngoi-nha-nho/tra-cuu` | Guide group hub | Navigate to sub-guides (e.g., so-luong, hoi-dap) | ✅ correct as guide landing |
| `/niem-kinh`, `/kinh-sach` | Content hubs | Library browsing | ✅ scope-specific |
| `/bach-thoai` | Wisdom hub | Type-filtered retrieval | ✅ scope-specific |

**Decision Required**:
- ✅ **KEEP** `/ngoi-nha-nho/tra-cuu` — it's a **guide category**, not a generic lookup surface
- **ACTION**: Do NOT create `/tra-cuu` as separate public route — that would be confusing duplication
- **ACTION**: If future "lookup calculator" (số lượng tra cứu) is added, nest it under Little House: `/ngoi-nha-nho/tra-cuu/so-luong` (already designed)

---

## II. Admin Workspace Naming & Structure

### 2.1 `/admin/noi-dung/bach-thoai` — Content Type Grouping Misaligned
**Issue**: Admin workspace mixes multiple content modules under one page.

**Current design**:
```
/admin/noi-dung/bach-thoai
├── Wisdom entries (Bạch thoại, Hỏi đáp, Khai thị)
├── Baihua books & chapters
└── Offline bundles
```

**Problem**:
- Single page + single query key family `['admin-wisdom', ...]`
- If **baihua translation** differs from **wisdom curation** workflow, workspace becomes overstuffed
- New editor may confuse "publish" button scope (affects which public surface?)

**Decision Required**:
- ✅ **KEEP `/admin/noi-dung/bach-thoai`** as unified workspace (Wisdom-QA owns all three)
- **ACTION**: But separate tab or sub-workspace:
  - Tab 1: **Wisdom entries** (Bạch thoại | Hỏi đáp | Khai thị) list/edit
  - Tab 2: **Baihua books** (audiobook metadata + chapter translation queue)
  - Tab 3: **Offline bundles** (refresh manifest, check status)
- **Admin clarification**: Are workflows (review → publish) same across tabs, or does Tab 2 (baihua) have separate approval flow?

### 2.2 `/admin/he-thong/tim-kiem` — Search Status ≠ Workspace
**Issue**: Search is **status monitor**, not content workspace.

**Current role**:
```
/admin/he-thong/tim-kiem
├── Reindex status & health
├── Trigger reindex by source
└── Freshness metrics
```

**Problem**:
- Search doesn't **own content** (Wisdom-QA, Content, Community do)
- Admin users may expect to **edit search results** here (they shouldn't)
- **Invalidation rule** unclear: who invalidates search after wisdom entry publishes?

**Decision Required**:
- ✅ **KEEP `/admin/he-thong/tim-kiem`** as **system health/operations** page
- **ACTION**: Label it clearly: "Search Index Operations" not "Search Content"
- **ACTION**: Add onboarding: "This is a monitoring tool. To index new content, publish it from [Nội dung > Bạch thoại]"
- **Invalidation clarity**: `/admin/noi-dung/bach-thoai` publish action must **trigger** search reindex signal
  - Wisdom-QA publishes → writes to `outbox_events` → Search indexer consumes

---

## III. Doc Type Distinctions in Search Results

### 3.1 Search Result Grouping & Admin Visibility
**Issue**: `/tim-kiem` and `/bach-thoai` both surface wisdom entries; grouping differs.

**Public `/tim-kiem` design** (from PAGE_INVENTORY.md):
```
Tabs: [Tất cả] [Bài viết] [Kinh sách] [Bạch thoại] [Hỏi đáp] [Khai thị]

"Tất cả" shows:
  BÀI VIẾT (2 kết quả)
  BẠCH THOẠI (5 kết quả)
  HỎI ĐÁP (3 kết quả)
```

**Public `/bach-thoai` design** (from PAGE_INVENTORY.md):
```
Tabs: [Bạch thoại] [Hỏi đáp] [Khai thị] [Sách nói]

Shows filtered by type.
```

**Problem**:
- Two different tab sets (Search has [Kinh sách], Bach-thoai has [Sách nói])
- Search groups by content type; Bach-thoai doesn't group (filters instead)
- Admin needs to understand **what lands where**

**Decision Required**:
- ✅ **KEEP both**: They serve different user journeys
  - `/tim-kiem`: "I'm searching for anything"
  - `/bach-thoai`: "I want to learn from Bạch thoại teaching"
- **ACTION**: Admin `/admin/noi-dung/bach-thoai` entry edit form must show:
  - `entryType`: [Bạch thoại | Hỏi đáp | Khai thị]
  - `publishStatus`: [Draft | Published | Archived]
  - Preview: "Will appear in: /bach-thoai, /tim-kiem (Bạch thoại tab)"
- **Admin feature**: Bulk action "Publish to /bach-thoai" vs "Publish to /tim-kiem only" — clarify if that's a real option or always both

---

### 3.2 Query/Filter Expectations Mismatch
**Issue**: Admin mapping doc doesn't specify query parameter contract for type filtering.

**Current `/admin/noi-dung/bach-thoai` query keys** (from admin-page-api-mapping.md):
```typescript
['admin-wisdom', 'list', filters]  // filters = ?
['admin-wisdom', 'detail', publicId]
```

**Question**: What do filters include?
- `entryType`? (Bạch thoại | Hỏi đáp | Khai thị)
- `publishStatus`? (Draft | Published | Archived)
- `language`? (Original | Vietnamese)
- `source`? (BTPP library | Wenda | custom)

**Decision Required**:
- **ACTION**: Admin table columns & filters must match public `/bach-thoai` tabs exactly
  - If `/bach-thoai?type=hoi-dap` exists on public, admin must have checkbox/dropdown `entryType=[hoi-dap]`
  - If publish status affects visibility, filter must appear in admin
- **ACTION**: Update `admin-page-api-mapping.md` to specify:
  ```typescript
  ['admin-wisdom', 'list', { entryType?, publishStatus?, language?, source? }]
  ```

---

## IV. Public vs Admin Distinctions

### 4.1 Member-Only Features Not in Public Design
**Issue**: Some public pages mention member+ features, but unclear if they affect routing.

**Example**: `/bach-thoai/[slug]` detail page
```
Public features:
  - Read entry
  - Source attribution
  - Related entries

Member+ features:
  - Download for offline
  - Audio player (may be member+?)
  - Bookmark/highlight (maybe future)
```

**Problem**: 
- Design doesn't specify if `/bach-thoai/[slug]` returns different JSON for members vs guests
- Admin doesn't know if "Download offline" button is admin-controlled vs member self-service

**Decision Required**:
- ✅ **KEEP public `/bach-thoai/[slug]`** but clarify response shape:
  - **All users**: entry text, source, type, related
  - **Members only** (in separate API response): offline bundle status, saved state
- **ACTION**: API contract must define:
  ```
  GET /api/wisdom/entries/[slug]?auth=true|false
  Returns: { entry, offlineAvailable, bookmarked, savedAt? }
  ```
- **Admin action**: `/admin/noi-dung/bach-thoai` detail form **must have**:
  - Checkbox: "Allow offline download" (controls field in response)
  - Checkbox: "Featured" (controls homepage placement)

---

### 4.2 Admin-Only Flows Not Visible in Public
**Issue**: Admin workflows (baihua import, offline bundle refresh) have no public equivalent.

| Workflow | Admin page | Public equivalent |
|---|---|---|
| **Baihua ingestion** | `/admin/noi-dung/bach-thoai` (Tab 2: Baihua books) | None — is this admin-only? |
| **Offline bundle refresh** | `/admin/noi-dung/bach-thoai` (Tab 3: Bundles) | `/bach-thoai/[slug]` "Download" button is end-user action, not refresh |
| **Wisdom entry curation** | `/admin/noi-dung/bach-thoai` (Tab 1: Entries) | `/bach-thoai` browse/search is read-only |

**Decision Required**:
- ✅ **Baihua ingestion is admin-only** — design intent is that educators/volunteers import translations, not users
- ✅ **Offline bundle refresh is admin-triggered** — member downloads latest snapshot, doesn't control refresh timing
- **ACTION**: Admin page Tab 2 (Baihua) must clearly indicate:
  - "Upload/Update chapter translation" button (admin action)
  - "Trigger full-book audio sync" (admin action)
  - Not member-exposed UI

---

## V. Scaffold Implementation Blockers

### 5.1 Search Index Ownership Unclear
**Blocker**: Who owns the search index across `posts | wisdom | guides | chants`?

**Current state** (from search/decisions.md):
- Search module owns **projection** (Meilisearch engine, query contract)
- Content module owns **source of truth** for posts/guides/chants
- Wisdom-QA module owns **source of truth** for wisdom entries

**Question for scaffold**:
- Does `/api/search/entries` return unified results with source type indicated?
- Or do we call separate `/api/wisdom/entries` and `/api/content/posts` independently on `/tim-kiem`?

**Decision Required**:
- **ACTION**: Clarify in `06-search/contracts.md`:
  ```
  GET /api/search/query?q=...&types=post,wisdom,guide
  Returns: { results: [ { id, type, title, excerpt, source }, ... ] }
  ```
  OR confirm separate queries:
  ```
  GET /api/wisdom/entries?q=...
  GET /api/content/posts?q=...
  ```

---

### 5.2 Wisdom Entry Type Enum Not Defined
**Blocker**: No Prisma schema or API contract specifies enum values.

**Design references entryType as**:
- "Bạch thoại" (wisdom teaching)
- "Hỏi đáp" (Q&A retrieval)
- "Khai thị" (exposition)
- "Sách nói" (audiobook) — but this is nested route, not entry type?

**Question**: 
- Are there 3 or 4 types?
- Is "Sách nói" an `entryType` or a `mediaFormat` alongside entry type?

**Decision Required**:
- **ACTION**: Define in `10-wisdom-qa/contracts.md`:
  ```typescript
  enum EntryType {
    BAIHUA_TEACHING = "baihua_teaching",      // Bạch thoại
    QA_RETRIEVAL = "qa_retrieval",            // Hỏi đáp
    EXPOSITION = "exposition",                // Khai thị
    // AUDIOBOOK is NOT an entryType; it's a mediaFormat or content delivery method
  }
  
  type WisdomEntry = {
    id: string;
    entryType: EntryType;
    originalText: string;
    vietnameseTranslation: string;
    mediaFormats: { text: true, audio?: true, video?: true }
  }
  ```

---

### 5.3 Offline Bundle Scope Unclear
**Blocker**: Design says "offline bundle" but unclear which entries qualify.

**Design intent** (10-wisdom-qa/decisions.md):
- Ưu tiên: Bạch thoại, bài đọc căn bản, hỏi đáp hay, tra cứu bài
- Admin can control: "Allow offline download" on each entry

**Question for scaffold**:
- Can user manually select entries to bundle? Or only admin-curated bundles?
- Does `/bach-thoai/[slug]` show "Download for offline" button on ALL entries or only flagged ones?
- Can member refresh their offline data, or is that admin-only?

**Decision Required**:
- **ACTION**: Define in `10-wisdom-qa/OFFLINE_BAIHUA_DIRECTION.md`:
  ```
  1. Admin publishes wisdom entry with offlineAvailable=true
  2. Platform builds periodic manifest of all offlineAvailable entries
  3. Member can fetch latest bundle or individual entry
  4. Member does NOT curate their own bundle — always syncs full public offline set
  ```

---

## VI. Concrete Decisions & Actions

### Summary Table: Keep/Merge/Split/Create

| Element | Decision | Action | Risk Level |
|---|---|---|---|
| `/bach-thoai` hub | **KEEP** | Add URL query param for type filtering; fetch detail API to determine type | Low |
| `/bach-thoai/[slug]` detail | **KEEP** | Must show `entryType` badge; API response includes `offlineAvailable` flag | Low |
| `/bach-thoai/sach-noi/*` | **KEEP** | Separate audiobook routing, no conflict | Low |
| `/tim-kiem` | **KEEP** | Clarify scope in UI; separate search bar on `/bach-thoai` must say "Search Bạch thoại" not "Search" | Low |
| `/ngoi-nha-nho/tra-cuu` | **KEEP** | It's a guide group, not a generic lookup route; do NOT create `/tra-cuu` global | Low |
| `/admin/noi-dung/bach-thoai` | **KEEP BUT SPLIT** | Separate 3 tabs: Entries | Baihua books | Offline bundles; each has own query key | Medium |
| `/admin/he-thong/tim-kiem` | **KEEP** | Clarify: "Search Index Operations" not content editing; add invalidation workflow diagram | Low |
| **Search index ownership** | **NEEDS DEFINITION** | Update `06-search/contracts.md` to specify unified vs separate query pattern | **Medium** |
| **EntryType enum** | **NEEDS DEFINITION** | Define in Prisma schema: BAIHUA_TEACHING \| QA_RETRIEVAL \| EXPOSITION | **High** |
| **Offline bundle logic** | **NEEDS DEFINITION** | Clarify: admin-curated vs member-selected vs auto-synced | **High** |
| **Member+ features** | **NEEDS DEFINITION** | Specify API response shape: which fields only in auth=true responses | Medium |

---

## VII. Route Naming & Path Reference

### Public Routes (apps/web)
```
✅ / (homepage)
✅ /bai-viet (posts list)
✅ /bai-viet/[slug] (post detail)
✅ /bach-thoai (wisdom hub — needs query param support for type)
✅ /bach-thoai/[slug] (entry detail — needs entryType badge)
✅ /bach-thoai/sach-noi (audiobook hub)
✅ /bach-thoai/sach-noi/[bookSlug] (book detail)
✅ /bach-thoai/sach-noi/[bookSlug]/chuong/[n] (chapter reader)
✅ /tim-kiem (universal search page)
✅ /ngoi-nha-nho (little house hub)
✅ /ngoi-nha-nho/tra-cuu (guide group: lookup — NOT generic lookup route)
✅ /ngoi-nha-nho/tra-cuu/so-luong (guide detail)
✅ /ngoi-nha-nho/tra-cuu/hoi-dap (guide detail)
❌ /tra-cuu (DO NOT CREATE — would duplicate /ngoi-nha-nho/tra-cuu scope)
```

### Admin Routes (apps/admin)
```
✅ /admin/noi-dung/bach-thoai (wisdom workspace — SPLIT into 3 tabs)
  ├── Tab 1: Wisdom entries list/edit
  ├── Tab 2: Baihua books (chapter translation queue)
  └── Tab 3: Offline bundles (manifest, refresh status)
✅ /admin/he-thong/tim-kiem (search operations monitor, NOT content editor)
✅ /admin/noi-dung/media (shared media asset manager)
```

---

## VIII. Recommendations for Scaffold Phase

### Phase 0 (Planning):
1. ✅ Define `EntryType` enum in `packages/database/prisma/schema.prisma`
2. ✅ Define `WisdomEntry` API response contract in `10-wisdom-qa/contracts.md`
3. ✅ Clarify search index pattern (unified vs separate queries)
4. ✅ Clarify offline bundle logic (who controls enrollment?)

### Phase 1 (Public `/tim-kiem` & `/bach-thoai`):
1. Implement `/bach-thoai?type=hoi-dap` query param support
2. Fetch entry detail to render type badge
3. Implement search bar label: "Search Bạch thoại"

### Phase 2 (Admin `/admin/noi-dung/bach-thoai`):
1. Build tab structure: Entries | Baihua | Bundles
2. Define separate query key families per tab
3. Ensure publish action triggers search reindex signal

### Phase 3 (Admin `/admin/he-thong/tim-kiem`):
1. Implement search status monitor (read-only)
2. Add reindex trigger UI
3. Display invalidation queue if applicable

---

## Appendix: File References

**Design docs**:
- `design/ui/PAGE_INVENTORY.md` — route canon (sections 1.12-1.14)
- `design/ui/NAVIGATION_ARCHITECTURE.md` — IA & routing principles
- `design/ui/ADMIN_ARCHITECTURE.md` — admin layout & route structure
- `design/tracking/admin-page-api-mapping.md` — query key mapping (rows 47, 61)
- `design/10-wisdom-qa/decisions.md` — wisdom module intent
- `design/10-wisdom-qa/module-map.md` — module boundary clarity
- `design/06-search/decisions.md` — search ownership rules
- `design/10-wisdom-qa/contracts.md` — (needs definition)

**Codebase**:
- `apps/web/src/app/` — existing public routes (check `/search`, `/bach-thoai` pattern)
- `apps/admin/src/routes/` — admin route structure (currently empty, scaffold pending)

---

**Review date**: 2026-03-22  
**For scaffold**: Use this matrix to unblock design → implementation handoff.  
**Next step**: Resolve blockers in Section V before detailed feature specification.

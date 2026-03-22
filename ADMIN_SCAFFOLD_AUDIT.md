# Admin Scaffold Requirements Audit
## Content & Community Feature Groups

**Audit Date**: 2026-03-22  
**Canon Docs**: PAGE_INVENTORY.md, ADMIN_ARCHITECTURE.md, ADMIN_MODULE_SPECS.md, api-route-inventory.md, admin-page-api-mapping.md  
**Scope**: `/admin/noi-dung/*` (content), `/admin/cong-dong/*` (community)  
**Target Implementation**: `apps/admin/src/features/*/queries.ts` and `mutations.ts`

---

## Executive Summary

**9 feature groups identified** across content (7) and community (2) namespaces. All require structured query key factories and mutation invalidation rules per TanStack Query v5 + React Query patterns. **3 CRITICAL blockers** prevent immediate scaffold:

1. **API coverage gap**: Workspace pages (daily-practice, little-house, life-release, media-library) lack canonical `/api/admin/content/{workspace}/*` contract definitions
2. **Public cache invalidation**: Publish mutations must trigger platform webhook; not yet defined in platform/cache module
3. **Dashboard invalidation missing**: Recent posts & pending reports widgets lack mutation invalidation rules in current codebase

---

## CONTENT GROUP: `/admin/noi-dung/*`

### 1. Bài Viết (Posts) — `/admin/noi-dung/bai-viet`

| Aspect | Detail |
|--------|--------|
| **Feature Folder** | `posts` |
| **Role** | `editor+` |
| **API Owner** | `content` |
| **Query Key Family** | `['admin-posts', 'list', filters]`<br/>`['admin-posts', 'detail', publicId]` |
| **Required Query Functions** | `getPosts(filters?: PostFilters)` → `/api/content/posts`<br/>`getPostDetail(publicId: string)` → `/api/content/posts/:publicId` |
| **Required Mutation Functions** | `createPost(data: CreatePostInput)` → `POST /api/content/posts`<br/>`updatePost(publicId: string, data: UpdatePostInput)` → `PATCH /api/content/posts/:publicId`<br/>`publishPost(publicId: string)` → `POST /api/content/posts/:publicId/publish`<br/>`unpublishPost(publicId: string)` → `POST /api/content/posts/:publicId/unpublish` (if route exists)<br/>`deletePost(publicId: string)` → soft delete or status change |
| **Invalidation Rules** | **Create/Update**: invalidate `admin-posts` list + detail<br/>**Publish/Unpublish**: invalidate list + detail + `admin-dashboard` recent-posts + **trigger public cache invalidation**<br/>**Delete**: invalidate list, remove detail key |
| **Blockers** | ✓ No blockers — all API routes defined in api-route-inventory.md |

**Implementation Notes:**
- Queries must support filtering (status, category, tag, date range per ADMIN_MODULE_SPECS.md spec)
- Mutation invalidation must include dashboard widget cascade
- Publish action triggers Next.js revalidation webhook (platform/cache owner)

---

### 2. Hướng Dẫn (Beginner Guides) — `/admin/noi-dung/huong-dan`

| Aspect | Detail |
|--------|--------|
| **Feature Folder** | `beginner-guides` |
| **Role** | `editor+` |
| **API Owner** | `content` |
| **Query Key Family** | `['admin-beginner-guides', 'list', filters]`<br/>`['admin-beginner-guides', 'detail', slugOrId]` |
| **Required Query Functions** | `getGuides(filters?: GuideFilters)` → `/api/content/beginner-guides`<br/>`getGuideDetail(slugOrId: string)` → `/api/content/beginner-guides/:slug` |
| **Required Mutation Functions** | `createGuide(data: CreateGuideInput)` → `POST /api/content/beginner-guides`<br/>`updateGuide(id: string, data: UpdateGuideInput)` → `PATCH /api/content/beginner-guides/:slug`<br/>`publishGuide(id: string)` → status change or explicit publish<br/>`deleteGuide(id: string)` → soft delete |
| **Invalidation Rules** | **Create/Update**: invalidate list + detail<br/>**Publish**: invalidate list + detail + related hub/loaders (if guide surfaces on public hub pages)<br/>**Delete**: invalidate list |
| **Blockers** | ✓ No blockers |

**Implementation Notes:**
- Guide type filtering (Beginner / Advanced / Topic) required per ADMIN_MODULE_SPECS
- No bulk publish allowed — individual review flow per spec

---

### 3. Kinh Bài Tập (Daily Practice) — `/admin/noi-dung/kinh-bai-tap`

| Aspect | Detail |
|--------|--------|
| **Feature Folder** | `daily-practice` |
| **Role** | `editor+` |
| **API Owner** | `content` |
| **Query Key Family** | `['admin-daily-practice', 'overview']`<br/>`['admin-daily-practice', 'guides']`<br/>`['admin-daily-practice', 'presets']`<br/>`['admin-daily-practice', 'faq']`<br/>`['admin-daily-practice', 'downloads']` |
| **Required Query Functions** | `getDailyPracticeOverview()` → `/api/admin/content/daily-practice/overview`<br/>`getGuides(filters?)` → `/api/admin/content/daily-practice/guides`<br/>`getScenarioPresets()` → `/api/admin/content/daily-practice/presets`<br/>`getFAQ()` → `/api/admin/content/daily-practice/faq`<br/>`getDownloads()` → `/api/admin/content/daily-practice/downloads` |
| **Required Mutation Functions** | `createGuide(data)`, `updateGuide(id, data)`, `deleteGuide(id)`<br/>`createPreset(data)`, `updatePreset(id, data)`, `deletePreset(id)`<br/>`createFAQ(data)`, `updateFAQ(id, data)`, `deleteFAQ(id)`<br/>`publishWorkspace()` → workspace-level publish<br/>`unpublishWorkspace()` |
| **Invalidation Rules** | **Any mutation in workspace**: invalidate `admin-daily-practice` (all keys)<br/>**Publish**: also invalidate public daily-practice pages + related search freshness |
| **Blockers** | 🚫 **CRITICAL**: API routes `/api/admin/content/daily-practice/*` not fully defined in api-route-inventory.md. Must define:<br/>- `GET /admin/content/daily-practice/overview`<br/>- `POST /admin/content/daily-practice/guides`<br/>- `PATCH /admin/content/daily-practice/guides/:id`<br/>- `DELETE /admin/content/daily-practice/guides/:id`<br/>- `POST /admin/content/daily-practice/presets`<br/>- etc. for presets, FAQ, downloads |

**Implementation Notes:**
- Tab-based workspace layout (Tổng quan / Nhóm & Bước / Scenario Presets / FAQ / Tải xuống)
- Drag-to-reorder support for groups, steps, presets, FAQ
- Publish action is workspace-level (affects entire content suite)
- Admin preview of member companion cards

---

### 4. Ngôi Nhà Nhỏ (Little House) — `/admin/noi-dung/ngoi-nha-nho`

| Aspect | Detail |
|--------|--------|
| **Feature Folder** | `little-house` |
| **Role** | `editor+` |
| **API Owner** | `content` |
| **Query Key Family** | `['admin-little-house', 'overview']`<br/>`['admin-little-house', 'guides']`<br/>`['admin-little-house', 'case-variants']`<br/>`['admin-little-house', 'faq']`<br/>`['admin-little-house', 'downloads']` |
| **Required Query Functions** | `getLittleHouseOverview()` → `/api/admin/content/little-house/overview`<br/>`getGuides()` → `/api/admin/content/little-house/guides`<br/>`getCaseVariants()` → `/api/admin/content/little-house/case-variants`<br/>`getFAQ()` → `/api/admin/content/little-house/faq`<br/>`getDownloads()` → `/api/admin/content/little-house/downloads` |
| **Required Mutation Functions** | `createGuide(data)`, `updateGuide(id, data)`, `deleteGuide(id)`<br/>`createVariant(data)`, `updateVariant(id, data)`, `deleteVariant(id)` [Case variants]<br/>`createFAQ(data)`, `updateFAQ(id, data)`, `deleteFAQ(id)`<br/>`publishWorkspace()`, `unpublishWorkspace()` |
| **Invalidation Rules** | **Any mutation**: invalidate `admin-little-house` (all keys)<br/>**Publish**: also invalidate public little-house grouped pages |
| **Blockers** | 🚫 **CRITICAL**: API routes `/api/admin/content/little-house/*` not fully defined. Required routes:<br/>- Overview, guides, case-variants, FAQ, downloads CRUD routes<br/>Per pattern from daily-practice |

**Implementation Notes:**
- Case variants are special (targeted guidance: self, others, specific scenarios)
- Includes internal "Review notes" field (not published)
- Admin preview of public guide pages and tracker companion cards
- Near-paper interface validation for elderly UX considerations

---

### 5. Phóng Sanh (Life Release) — `/admin/noi-dung/phong-sanh`

| Aspect | Detail |
|--------|--------|
| **Feature Folder** | `life-release` |
| **Role** | `editor+` |
| **API Owner** | `content` |
| **Query Key Family** | `['admin-life-release', 'overview']`<br/>`['admin-life-release', 'guides']`<br/>`['admin-life-release', 'variants']`<br/>`['admin-life-release', 'faq']`<br/>`['admin-life-release', 'downloads']` |
| **Required Query Functions** | `getLifeReleaseOverview()`, `getGuides()`, `getVariants()`, `getFAQ()`, `getDownloads()` |
| **Required Mutation Functions** | Guides, variants (ritual-specific), FAQ, downloads CRUD<br/>Workspace publish/unpublish |
| **Invalidation Rules** | **Any mutation**: invalidate `admin-life-release`<br/>**Publish**: also invalidate public life-release guide surfaces |
| **Blockers** | 🚫 **CRITICAL**: API routes `/api/admin/content/life-release/*` not defined in api-route-inventory.md |

**Implementation Notes:**
- Variants tied to ritual context (self, others, species count matrix variations)
- Script wording validation critical (sensitive content flag + review notes)
- Ethical guidelines & preparation checklists

---

### 6. Thư viện pháp môn (Media Library) — `/admin/noi-dung/thu-vien-phap-mon`

| Aspect | Detail |
|--------|--------|
| **Feature Folder** | `media-library` |
| **Role** | `editor+` |
| **API Owner** | `content` |
| **Query Key Family** | `['admin-media-library', 'overview']`<br/>`['admin-media-library', 'collections', filters]`<br/>`['admin-media-library', 'collection', publicId]`<br/>`['admin-media-library', 'featured']`<br/>`['admin-media-library', 'tags']` |
| **Required Query Functions** | `getOverview()` → `/api/admin/content/media-library/overview`<br/>`getCollections(filters?)` → `/api/admin/content/media-library/collections`<br/>`getCollectionDetail(publicId)` → `/api/admin/content/media-library/collections/:id`<br/>`getFeatured()` → `/api/admin/content/media-library/featured`<br/>`getTags()` → `/api/admin/content/media-library/tags` |
| **Required Mutation Functions** | `createCollection(data)`, `updateCollection(id, data)`, `deleteCollection(id)`<br/>`addItem(collectionId, itemData)`, `updateItem(collectionId, itemId, data)`, `deleteItem(collectionId, itemId)`<br/>`setFeatured(collectionIds)` — up to 6 featured slots<br/>`publishWorkspace()`, `unpublishWorkspace()` |
| **Invalidation Rules** | Collection/item/featured mutation: invalidate collection list + detail + featured/tags<br/>**Publish**: also invalidate public media-library surfaces |
| **Blockers** | 🚫 **CRITICAL**: API routes `/api/admin/content/media-library/*` not fully defined. Read routes `/api/content/media-library/*` must also exist for public surface |

**Implementation Notes:**
- Collection types: photo / video
- External video domain validation required
- Item type & owner references validation
- Validation for external video domains critical for security

---

### 7. Media — `/admin/noi-dung/media`

| Aspect | Detail |
|--------|--------|
| **Feature Folder** | `media` |
| **Role** | `editor+` |
| **API Owner** | `content` + `storage` |
| **Query Key Family** | `['admin-media', 'assets', filters]`<br/>`['admin-media', 'detail', publicId]` |
| **Required Query Functions** | `getAssets(filters?: { type?, status?, date?, uploader? })` → `/api/content/media`<br/>`getAssetDetail(publicId)` → `/api/content/media/:publicId` |
| **Required Mutation Functions** | `uploadAsset(file: File)` → `POST /api/content/media/upload`<br/>`updateAsset(publicId, metadata)` → asset metadata only, not re-upload<br/>`deleteAsset(publicId)` → `DELETE /api/content/media/:publicId` |
| **Invalidation Rules** | **Upload/Delete/Update**: invalidate asset list + detail + any workspace currently embedding selected asset |
| **Blockers** | 🔶 **HIGH**: Must coordinate deletion with media-library module — cannot delete assets if linked to collections. Query/mutation must check linked entities before allowing delete |

**Implementation Notes:**
- Grid gallery view (4 cols desktop, 2 cols mobile) with infinite scroll
- Type filtering: image/audio/video/document
- Status filtering: pending/approved/quarantined
- Upload panel: drag-and-drop, MIME validation, progress indicator
- Asset detail modal: checksum, uploader, linked entities, audit trail
- Soft delete or logical delete with audit required

---

## COMMUNITY GROUP: `/admin/cong-dong/*`

### 8. Bài Đăng (Community Posts) — `/admin/cong-dong/bai-dang`

| Aspect | Detail |
|--------|--------|
| **Feature Folder** | `community-posts` |
| **Role** | `moderator+` |
| **API Owner** | `community` + `moderation` |
| **Query Key Family** | `['admin-community-posts', 'list', filters]`<br/>`['admin-community-post', 'detail', publicId]` |
| **Required Query Functions** | `getPosts(filters?: { status?, hasReports?, sort? })` → `/api/community/posts`<br/>`getPostDetail(publicId)` → `/api/community/posts/:publicId` |
| **Required Mutation Functions** | `updatePostStatus(publicId, status)` — state change (Pending/Approved/Hidden)<br/>`hidePost(publicId, reason)` → explicit hide with reason<br/>`showPost(publicId)` → restore from hidden<br/>`deletePost(publicId)` — if supported (check api-route-inventory) |
| **Invalidation Rules** | **Status change/hide/show/delete**: invalidate list + detail + dashboard widgets (if pending reports widget surfaces community posts count)<br/>Per moderation.decision rules: also invalidate affected target workspace list/detail |
| **Blockers** | 🔶 **MEDIUM**: Feature flag `community.post.enabled` must be enforced; moderation support routes must be coordinated with moderation module for report tracking |

**Implementation Notes:**
- DataTable columns: Author, Title/excerpt, Status chip, Report count, Date
- Filter: Status (All/Pending/Approved/Hidden), Has reports
- Sort: Date desc (default), Report count desc
- Bulk: Approve selected, Hide selected
- Detail page: post preview + moderation history + decision panel
- No edit allowed (approve/hide/delete only, per ADMIN_MODULE_SPECS)
- Report integration: each post shows pending report count; link to moderation/reports

---

### 9. Sổ Lưu Niệm (Guestbook) — `/admin/cong-dong/so-luu-niem`

| Aspect | Detail |
|--------|--------|
| **Feature Folder** | `guestbook` |
| **Role** | `moderator+` |
| **API Owner** | `community` |
| **Query Key Family** | `['admin-guestbook', 'list', filters]`<br/>`['admin-guestbook', 'detail', publicId]` |
| **Required Query Functions** | `getEntries(filters?: { status?, date? })` → `/api/guestbook`<br/>`getEntryDetail(publicId)` → `/api/guestbook/:publicId` |
| **Required Mutation Functions** | `approveEntry(publicId)` → status = 'approved'<br/>`rejectEntry(publicId, reason?)` → status = 'rejected'<br/>`deleteEntry(publicId)` → hard or soft delete<br/>**⚠️ NO updateEntry()** — spec explicitly forbids edit |
| **Invalidation Rules** | **Approve/Reject/Delete**: invalidate list + detail + dashboard widgets (if guestbook entry count surfaces on dashboard) |
| **Blockers** | 🔶 **MEDIUM**: Feature flag `community.guestbook.enabled` required; **no edit mutation allowed** (only approve/reject/delete) |

**Implementation Notes:**
- DataTable columns: Name, Message (truncated), Status chip, IP (hashed), Date
- Filter: Status (All/Pending/Approved/Rejected)
- Sort: Date desc (default)
- Bulk: Approve selected, Reject selected
- **Single-click approval flow** — clicking approve toggles status immediately on list or detail
- Detail modal shows full message, IP info, timestamps
- No content edit — moderators can only approve/reject/delete
- Approval makes entry visible on public page (`/so-luu-niem`)

---

## Invalidation Rules Matrix

| Mutation Family | Affected Query Keys | Dashboard Impact |
|---|---|---|
| **Content Publish/Unpublish** | admin-{workspace} list + detail<br/>+ public cache trigger | recent-posts widget |
| **Content Create/Update** | admin-{workspace} list + detail | — |
| **Community Post Status Change** | admin-community-posts list + detail | — |
| **Guestbook Approve/Reject/Delete** | admin-guestbook list + detail | — |
| **Moderation Decision** | admin-moderation-reports list + detail<br/>+ target workspace list/detail | pending-reports badge (count--) |

---

## CRITICAL BLOCKERS

### 1. API Coverage — Workspace Routes (Blocks 4 features)

**Issue**: `/api/admin/content/{daily-practice,little-house,life-release,media-library}/*` routes not canonically defined in `design/tracking/api-route-inventory.md`

**Required Actions Before Scaffold**:
- Add full CRUD route definitions to api-route-inventory.md for:
  - `GET /admin/content/{workspace}/overview`
  - `POST /admin/content/{workspace}/guides` (or appropriate entity)
  - `PATCH /admin/content/{workspace}/guides/:id`
  - `DELETE /admin/content/{workspace}/guides/:id`
  - Similar for presets, FAQ, variants, downloads per workspace
  - `POST /admin/content/{workspace}/publish`, `POST /admin/content/{workspace}/unpublish`
- Define request/response schemas in contracts.md per module owner

**Impact**: Cannot write valid queries.ts/mutations.ts without API contract  
**Owner**: Content module  
**Target**: Before feature implementation phase

---

### 2. Public Cache Invalidation (Blocks all publish mutations)

**Issue**: Publish mutations require `platform/cache` webhook trigger (per admin-page-api-mapping.md rule) — webhook route & contract not yet defined

**Required Actions**:
- Define `/internal/revalidate` webhook route in api-route-inventory.md (shared-secret auth)
- Document webhook payload schema in platform/cache contracts.md
- Implement webhook client in mutations.ts for content publish events

**Impact**: Public pages may serve stale content after admin publish  
**Owner**: Platform (cache) module  
**Target**: Before go-live

---

### 3. Dashboard Invalidation Rules (Blocks dashboard refresh)

**Issue**: Recent posts & pending reports widgets lack mutation trigger rules in codebase

**Required Actions**:
- Define which content/moderation mutations must invalidate dashboard keys
- Document in admin-page-api-mapping.md under "Dashboard cascade rules"
- Implement in mutations.ts invalidation chains

**Impact**: Dashboard widgets become stale after publish/moderation actions  
**Owner**: Content + Moderation modules (dashboard owner coordinates)  
**Target**: Before beta testing

---

## HIGH-IMPACT FINDINGS

### Role Narrowing Mismatch

**Finding**: Page auth is `admin+` (PAGE_INVENTORY.md) but API auth is `editor+`/`moderator+` (api-route-inventory.md)

**Impact**: Users with admin+ role but not editor+ can access UI that calls editor+ API routes → 403 errors or confused role model

**Required Fix**: Document in ADMIN_MODULE_SPECS.md that page-level `admin+` gate applies to all content/community pages, but backend must enforce narrower role (editor+/moderator+) at API level per route ownership

---

### Query Key Factory Pattern

**Finding**: Query key families defined in admin-page-api-mapping.md must become factory functions, not hardcoded strings

**Required Implementation**:
```typescript
// apps/admin/src/features/{feature}/queries.ts
export const {feature}Keys = {
  all: ['{feature}'] as const,
  lists: () => [{feature}, 'list'] as const,
  list: (filters: Filters) => [{feature}, 'list', filters] as const,
  details: () => [{feature}, 'detail'] as const,
  detail: (id: string) => [{feature}, 'detail', id] as const,
  // workspace-specific
  overview: () => [{feature}, 'overview'] as const,
};
```

---

### Media-Library ↔ Media Cross-Module Coordination

**Finding**: `admin-media` (gallery) and `admin-media-library` (collections) must coordinate on asset deletion

**Required Logic**:
- Media delete mutation must check if asset is linked to media-library collections
- If linked: show warning with collection preview, require confirmation
- Invalidate both media list + media-library detail for affected collections
- Audit trail must log which collections were affected

---

### Guestbook Edit Restriction

**Finding**: ADMIN_MODULE_SPECS.md explicitly states "Moderator can only approve/reject/delete, not edit content"

**Required Constraint**:
- `mutations.ts` must NOT include `updateEntry()` function
- Detail view is read-only (except status actions)
- Enforce at UI level: no form editor, only action buttons

---

## Feature Flag Dependencies

| Feature | Flag | Status |
|---------|------|--------|
| Community Posts | `community.post.enabled` | ✓ Documented, gating required |
| Guestbook | `community.guestbook.enabled` | ✓ Documented, gating required |
| Daily Practice | — | ⚠️ No flag (shipped or not yet staged?) |
| Little House | — | ⚠️ No flag |
| Life Release | — | ⚠️ No flag |
| Media Library | — | ⚠️ No flag |

**Action**: Clarify feature rollout status in ADMIN_MODULE_SPECS.md or add feature flag definitions

---

## Implementation Sequence Recommendation

### Phase 1 (Unblocked — Start Now)
- ✅ `posts` queries.ts/mutations.ts
- ✅ `beginner-guides` queries.ts/mutations.ts
- ✅ `community-posts` queries.ts/mutations.ts
- ✅ `guestbook` queries.ts/mutations.ts

### Phase 2 (Blocked on API definitions)
- 🚫 `daily-practice` — Wait for api-route-inventory.md route definitions
- 🚫 `little-house` — Wait for api-route-inventory.md route definitions
- 🚫 `life-release` — Wait for api-route-inventory.md route definitions
- 🚫 `media-library` — Wait for api-route-inventory.md route definitions

### Phase 3 (Blocked on platform/cache webhook)
- 🚫 Publish mutation invalidation for all content features — Wait for `/internal/revalidate` webhook route + contract

---

## Query & Mutation Skeleton Reference

Each feature folder `apps/admin/src/features/{feature}/` should contain:

### queries.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import { {feature}Keys } from './query-keys';
import { apiClient } from '@/lib/api-client';

export const use{Feature}List = (filters?: Filters) => {
  return useQuery({
    queryKey: {feature}Keys.list(filters),
    queryFn: () => apiClient.get('/api/...'),
  });
};

export const use{Feature}Detail = (id: string) => {
  return useQuery({
    queryKey: {feature}Keys.detail(id),
    queryFn: () => apiClient.get(`/api/.../${id}`),
  });
};
```

### mutations.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { {feature}Keys } from './query-keys';
import { apiClient } from '@/lib/api-client';

export const useCreate{Entity} = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.post('/api/...', data),
    onSuccess: () => {
      // Invalidate per canonical rules from admin-page-api-mapping.md
      queryClient.invalidateQueries({ queryKey: {feature}Keys.lists() });
      // Dashboard cascade if applicable
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard', 'recent-posts'] });
    },
  });
};
```

### query-keys.ts
```typescript
export const {feature}Keys = {
  all: ['{feature}'] as const,
  lists: () => [{feature}, 'list'] as const,
  list: (filters: Filters) => [{feature}, 'list', filters] as const,
  details: () => [{feature}, 'detail'] as const,
  detail: (id: string) => [{feature}, 'detail', id] as const,
};
```

---

## Documentation References

- **Page routes**: design/ui/PAGE_INVENTORY.md § IV. Admin Pages
- **Admin layout**: design/ui/ADMIN_ARCHITECTURE.md
- **Module specs**: design/ui/ADMIN_MODULE_SPECS.md § 2–12
- **API routes**: design/tracking/api-route-inventory.md § Content, Community
- **Query mapping**: design/tracking/admin-page-api-mapping.md § Mapping table
- **Cache doctrine**: design/baseline/cache-topology.md (referenced but not in scope)

---

## Audit Metadata

- **Generated**: 2026-03-22
- **Canonical Sources**: 5 design docs (full authority on requirements)
- **Scope Boundary**: `/admin/noi-dung/*` + `/admin/cong-dong/*` only; excludes system, moderation, user management, calendar, wisdom pages
- **Out of Scope**: UI component specs, form validation schemas, accessibility, responsive behavior (see COMPONENT_SPECS.md, DESIGN_PRINCIPLES.md, ELDERLY_UX.md separately)

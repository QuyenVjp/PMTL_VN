# APPS_ADMIN_SCAFFOLD_BACKLOG

File này chốt `design-to-code backlog` cho riêng `apps/admin`.
Nó trả lời 4 câu:

- scaffold feature nào trước
- mỗi feature folder cần `queries.ts` và `mutations.ts` gì
- query key factory nên đặt ra sao
- invalidation nào là bắt buộc sau mutation

File này không tuyên bố `apps/admin` đã tồn tại.
Ở thời điểm hiện tại, repo mới có `apps/web`; file này tồn tại để khi bắt đầu dựng `apps/admin`, team không phải đoán nữa.

> Canonical refs:
> - `design/ui/ADMIN_ARCHITECTURE.md`
> - `design/ui/ADMIN_MODULE_SPECS.md`
> - `design/tracking/admin-page-api-mapping.md`
> - `design/tracking/api-route-inventory.md`
> - `design/baseline/frontend-architecture.md`
> - `design/baseline/cache-topology.md`

---

## Scope

Chỉ áp dụng cho `apps/admin`.
Không thay API canon ở `apps/api`.
Không thay page route canon ở `PAGE_INVENTORY.md`.

---

## Non-negotiables before first scaffold

- `apps/admin` là Vite + React SPA riêng, không nhập nhằng với `apps/web`
- mọi data fetch đi qua API contracts đã chốt, không tự bịa endpoint trong UI
- query layer phải dùng query key factory + `queryOptions()` / `infiniteQueryOptions()`
- mutation layer phải dùng `mutationOptions()` và invalidate đúng key family, không `invalidateQueries()` kiểu quét mù
- page route dùng tiếng Việt theo `ADMIN_ARCHITECTURE.md` / `PAGE_INVENTORY.md`
- API group có thể là tiếng Anh dưới `/api/admin/*`; mapping canon nằm ở `tracking/admin-page-api-mapping.md`
- admin mutation có tác động public surface phải đi qua invalidation owner của `platform/cache`, không để UI tự revalidate

---

## Target tree to scaffold first

```txt
apps/admin/
  src/
    app/
      router.tsx
      providers/
        query-client.tsx
        auth-session.tsx
    lib/
      api/
        admin-client.ts
        http-error.ts
        envelopes.ts
      query/
        create-admin-query.ts
        create-admin-mutation.ts
        invalidate.ts
    features/
      dashboard/
        queries.ts
      posts/
        queries.ts
        mutations.ts
      beginner-guides/
        queries.ts
        mutations.ts
      daily-practice-admin/
        queries.ts
        mutations.ts
      little-house-admin/
        queries.ts
        mutations.ts
      life-release-admin/
        queries.ts
        mutations.ts
      media-library-admin/
        queries.ts
        mutations.ts
      sutras-admin/
        queries.ts
        mutations.ts
      chant-admin/
        queries.ts
        mutations.ts
      media-admin/
        queries.ts
        mutations.ts
      wisdom-baihoa/
        queries.ts
        mutations.ts
      community-posts-admin/
        queries.ts
        mutations.ts
      guestbook-admin/
        queries.ts
        mutations.ts
      moderation-reports/
        queries.ts
        mutations.ts
      moderated-comments/
        queries.ts
        mutations.ts
      users-admin/
        queries.ts
        mutations.ts
      sessions-admin/
        queries.ts
        mutations.ts
      feature-flags-admin/
        queries.ts
        mutations.ts
      audit-logs-admin/
        queries.ts
      events-admin/
        queries.ts
        mutations.ts
      search-admin/
        queries.ts
        mutations.ts
      notifications-admin/
        queries.ts
        mutations.ts
      volunteers-admin/
        queries.ts
        mutations.ts
      health-admin/
        queries.ts
      assisted-entry-admin/
        queries.ts
        mutations.ts
```

`queries.ts` là nơi giữ:

- query key factory
- queryOptions/infiniteQueryOptions
- select/transform nhẹ ở client boundary khi cần

`mutations.ts` là nơi giữ:

- mutationOptions
- typed payload builders nếu mutation nhiều biến thể
- invalidation choreography sau success

---

## Shared infra phải tồn tại trước

### Step A — Admin query foundation

Phải có tối thiểu:

```txt
src/app/providers/query-client.tsx
src/lib/api/admin-client.ts
src/lib/api/http-error.ts
src/lib/api/envelopes.ts
src/lib/query/create-admin-query.ts
src/lib/query/create-admin-mutation.ts
src/lib/query/invalidate.ts
```

### Required behavior

- `admin-client.ts` tự attach credentials/cookies
- parse đúng success envelope:
  - `single`
  - `list`
  - `created`
  - `accepted`
  - `manifest`
- parse đúng canonical error envelope `error.code/message/status/requestId`
- `invalidate.ts` có helper cho:
  - invalidate exact key
  - invalidate key family
  - invalidate dashboard dependencies
  - chạy side-effect callback khi mutation còn cần trigger public cache invalidation notice

### Do not move on until

- có helper chuẩn cho paginated list query
- có helper chuẩn cho detail query
- mutation success path không hardcode query keys trong component
- query/mutation files không trực tiếp gọi `fetch` thô lặp đi lặp lại

---

## Query key factory rules

### Naming pattern

Mỗi feature dùng 1 root key cố định:

```ts
['admin-posts']
['admin-moderation-reports']
['admin-events']
```

Subkeys:

```ts
['admin-posts', 'list', filters]
['admin-posts', 'detail', publicId]
['admin-posts', 'aux', 'statuses']
```

### Required factory shape in `queries.ts`

```ts
export const postKeys = {
  all: ['admin-posts'] as const,
  list: (filters: PostListFilters) => ['admin-posts', 'list', filters] as const,
  detail: (publicId: string) => ['admin-posts', 'detail', publicId] as const,
  aux: {
    statuses: ['admin-posts', 'aux', 'statuses'] as const,
  },
}
```

### Rules

- luôn có `all`
- list/detail/aux phải tách riêng
- filter object phải stable và serialize được
- detail key dùng `publicId` hoặc stable route param, không dùng row index

---

## Scaffold waves

### Wave 0 — Shell and auth-safe data foundation

Scaffold trước:

- `dashboard`
- `feature-flags-admin`
- `audit-logs-admin`
- `health-admin`

Lý do:

- dựng được shell + query client + error handling
- có route read-only để verify table/query pattern trước mutation-heavy pages

### Canon blockers and exclusions

- `queue-ops` là explicit exclusion cho current scaffold wave; route này chỉ tồn tại ở Phase 2+ notes, chưa đủ canon route + mapping.
- `moderated-comments` chưa được scaffold cho tới khi comment moderation route group được canon hóa riêng trong `tracking/api-route-inventory.md`.
- `feature-flags-admin` chỉ dùng admin read-path `GET /api/admin/feature-flags` và `GET /api/admin/feature-flags/:key`.
- `health-admin` là read-only view trên route `GET /api/admin/system/health-extended`; không có `mutations.ts`.
- `users-admin`, `sessions-admin`, `wisdom-baihoa`, `assisted-entry-admin` phải bám chính xác canon route mới thêm trong `tracking/api-route-inventory.md`, không được scaffold theo API deps cũ trong audit notes.

### Wave 1 — Core editorial workspaces

- `posts`
- `beginner-guides`
- `daily-practice-admin`
- `little-house-admin`
- `life-release-admin`
- `media-library-admin`

### Wave 2 — Moderation and community operations

- `community-posts-admin`
- `guestbook-admin`
- `moderation-reports`

### Wave 3 — Calendar, search, notifications

- `events-admin`
- `search-admin`
- `notifications-admin`

### Wave 4 — Identity, support, wisdom, contact

- `users-admin`
- `sessions-admin`
- `sutras-admin`
- `chant-admin`
- `media-admin`
- `wisdom-baihoa`
- `volunteers-admin`
- `assisted-entry-admin`

---

## Per-feature scaffold backlog

### 1. `dashboard`

Page routes:

- `/admin/dashboard`

Files:

- `apps/admin/src/features/dashboard/queries.ts`

Required query keys:

- `dashboardKeys.stats()`
- `dashboardKeys.recentPosts(filters)`
- `dashboardKeys.pendingReports(filters)`
- `dashboardKeys.auditStream(filters)`

Required query functions:

- `getDashboardStatsQuery()`
- `getRecentPostsQuery()`
- `getPendingReportsQuery()`
- `getAuditStreamQuery()`

No `mutations.ts` in first pass.

Blockers:

- `/api/admin/system/dashboard-stats`
- `/api/admin/audit-logs`

### 2. `posts`

Page routes:

- `/admin/noi-dung/bai-viet`

Files:

- `apps/admin/src/features/posts/queries.ts`
- `apps/admin/src/features/posts/mutations.ts`

Required query keys:

- `postKeys.list(filters)`
- `postKeys.detail(publicId)`

Required query functions:

- `getPostListQuery(filters)`
- `getPostDetailQuery(publicId)`

Required mutations:

- `createPostMutation()`
- `updatePostMutation()`
- `publishPostMutation()`
- `unpublishPostMutation()`
- `softDeletePostMutation()`

Required invalidation:

- list + detail
- `dashboardKeys.recentPosts`
- trigger public cache invalidation notice on publish/unpublish

### 3. `beginner-guides`

Files:

- `features/beginner-guides/queries.ts`
- `features/beginner-guides/mutations.ts`

Query keys:

- `beginnerGuideKeys.list(filters)`
- `beginnerGuideKeys.detail(slugOrId)`

Queries:

- list
- detail

Mutations:

- create
- update
- publish
- unpublish

Invalidation:

- list + detail
- related hub loaders if public grouping changes

### 4. `daily-practice-admin`

Files:

- `features/daily-practice-admin/queries.ts`
- `features/daily-practice-admin/mutations.ts`

Query keys:

- `dailyPracticeAdminKeys.overview()`
- `dailyPracticeAdminKeys.guides()`
- `dailyPracticeAdminKeys.presets()`
- `dailyPracticeAdminKeys.faq()`
- `dailyPracticeAdminKeys.downloads()`

Queries:

- overview
- guide list
- preset list
- faq list
- download list

Mutations:

- create/update/delete guide
- reorder groups/steps when route exists
- create/update/delete preset
- create/update/delete faq
- create/update/delete download ref
- publish workspace

Invalidation:

- whole workspace family
- related public daily-practice loaders

### 5. `little-house-admin`

Files:

- `features/little-house-admin/queries.ts`
- `features/little-house-admin/mutations.ts`

Query keys:

- `littleHouseAdminKeys.overview()`
- `littleHouseAdminKeys.guides()`
- `littleHouseAdminKeys.caseVariants()`
- `littleHouseAdminKeys.faq()`
- `littleHouseAdminKeys.downloads()`

Mutations:

- guide create/update/delete
- case variant create/update/delete
- faq create/update/delete
- download ref update
- publish workspace

Invalidation:

- workspace family
- public little-house grouped surfaces

### 6. `life-release-admin`

Files:

- `features/life-release-admin/queries.ts`
- `features/life-release-admin/mutations.ts`

Query keys:

- `lifeReleaseAdminKeys.overview()`
- `lifeReleaseAdminKeys.guides()`
- `lifeReleaseAdminKeys.variants()`
- `lifeReleaseAdminKeys.faq()`
- `lifeReleaseAdminKeys.downloads()`

Mutations:

- guide create/update/delete
- variant create/update/delete
- faq create/update/delete
- publish workspace

Invalidation:

- workspace family
- public life-release surfaces

### 7. `media-library-admin`

Files:

- `features/media-library-admin/queries.ts`
- `features/media-library-admin/mutations.ts`

Query keys:

- `mediaLibraryAdminKeys.overview()`
- `mediaLibraryAdminKeys.collections(filters)`
- `mediaLibraryAdminKeys.collection(publicId)`
- `mediaLibraryAdminKeys.featured()`
- `mediaLibraryAdminKeys.tags()`

Mutations:

- create/update collection
- add/update/remove collection item
- reorder collection items
- set featured
- tag create/rename/merge/delete
- publish collection

Invalidation:

- collection list/detail
- featured/tags
- public media library surfaces

### 8. `sutras-admin`

Files:

- `features/sutras-admin/queries.ts`
- `features/sutras-admin/mutations.ts`

Query keys:

- `sutraKeys.list(filters)`
- `sutraKeys.detail(publicId)`
- `baihuaBookKeys.list(filters)`
- `baihuaChapterKeys.detail(publicId)`

Mutations:

- update baihua translation
- publish baihua chapter
- import baihua source

Invalidation:

- baihua list/detail
- wisdom admin list/status

Blockers:

- wisdom admin list/detail/status routes must exist and stay stable

### 9. `chant-admin`

Files:

- `features/chant-admin/queries.ts`
- `features/chant-admin/mutations.ts`

Status:

- scaffold placeholder only until chant item / chant plan route group is fully canonized

Minimum queries:

- chant item list/detail
- chant plan list/detail

Mutations:

- create/update chant item
- create/update chant plan

Blocker:

- admin route group still future-facing

### 10. `media-admin`

Files:

- `features/media-admin/queries.ts`
- `features/media-admin/mutations.ts`

Query keys:

- `mediaKeys.assets(filters)`
- `mediaKeys.detail(publicId)`

Mutations:

- upload asset
- delete asset
- patch asset metadata if route exists

Invalidation:

- media list/detail
- any embedding workspace keys when selection modal closes with success

### 11. `community-posts-admin`

Files:

- `features/community-posts-admin/queries.ts`
- `features/community-posts-admin/mutations.ts`

Query keys:

- `communityPostAdminKeys.list(filters)`
- `communityPostAdminKeys.detail(publicId)`

Mutations:

- patch post status
- moderate/hide if dedicated route exists

Invalidation:

- list + detail
- dashboard widgets if surfaced

### 12. `guestbook-admin`

Files:

- `features/guestbook-admin/queries.ts`
- `features/guestbook-admin/mutations.ts`

Query keys:

- `guestbookAdminKeys.list(filters)`
- `guestbookAdminKeys.detail(publicId)`

Mutations:

- approve guestbook entry
- reject/delete guestbook entry

Invalidation:

- list + detail
- moderation/dashboard widgets if surfaced

Blocker:

- approval/reject routes need final canon if not already exposed

### 13. `moderation-reports`

Files:

- `features/moderation-reports/queries.ts`
- `features/moderation-reports/mutations.ts`

Query keys:

- `moderationReportKeys.list(filters)`
- `moderationReportKeys.detail(publicId)`

Mutations:

- resolve report decision

Invalidation:

- report list/detail
- affected target workspace keys
- dashboard pending reports

### 14. `moderated-comments`

Files:

- `features/moderated-comments/queries.ts`
- `features/moderated-comments/mutations.ts`

Query keys:

- `moderatedCommentKeys.list(filters)`
- `moderatedCommentKeys.detail(publicId)`

Mutations:

- hide/unhide comment
- resolve comment-related moderation action

Invalidation:

- comment list/detail
- related moderation report keys
- target post/community detail keys

Blocker:

- dedicated admin comment moderation route group still needs final canon

### 15. `users-admin`

Files:

- `features/users-admin/queries.ts`
- `features/users-admin/mutations.ts`

Query keys:

- `userAdminKeys.list(filters)`
- `userAdminKeys.detail(publicId)`
- `userAdminKeys.audit(publicId, filters)`
- `userAdminKeys.practiceStats(publicId)`

Mutations:

- update profile
- change role
- block/unblock user

Invalidation:

- user list/detail
- audit/practice-stats của user bị ảnh hưởng
- sessions/dashboard if affected

Route canon dùng:

- `GET /api/admin/users`
- `GET /api/admin/users/:publicId`
- `PATCH /api/admin/users/:publicId/profile`
- `PATCH /api/admin/users/:publicId/role`
- `POST /api/admin/users/:publicId/block`
- `POST /api/admin/users/:publicId/unblock`
- `GET /api/admin/users/:publicId/audit-history`
- `GET /api/admin/users/:publicId/practice-stats`
- `POST /api/admin/users/:publicId/sessions/revoke-all`

### 16. `sessions-admin`

Files:

- `features/sessions-admin/queries.ts`
- `features/sessions-admin/mutations.ts`

Query keys:

- `sessionAdminKeys.list(filters)`
- `sessionAdminKeys.detail(sessionId)`
- `sessionAdminKeys.byUser(userPublicId)`

Mutations:

- revoke session
- revoke selected sessions
- revoke all sessions for user

Invalidation:

- session list/detail
- `byUser`
- affected user detail

Route canon dùng:

- `GET /api/admin/sessions`
- `GET /api/admin/sessions/:sessionId`
- `DELETE /api/admin/sessions/:sessionId`
- `POST /api/admin/sessions/revoke-bulk`
- `POST /api/admin/users/:publicId/sessions/revoke-all`

### 17. `feature-flags-admin`

Files:

- `features/feature-flags-admin/queries.ts`
- `features/feature-flags-admin/mutations.ts`

Query keys:

- `featureFlagKeys.list()`
- `featureFlagKeys.detail(key)`

Mutations:

- update flag

Invalidation:

- feature flag list/detail
- any directly bound screen keys
- if public surface impacted, coordinate server-side invalidation

Notes:

- read-path canon là `GET /api/admin/feature-flags` và `GET /api/admin/feature-flags/:key`
- write-path vẫn là `PATCH /api/admin/feature-flags/:key`
- UI nằm trong admin shell nhưng write action phải giữ `super-admin` gate

### 18. `audit-logs-admin`

Files:

- `features/audit-logs-admin/queries.ts`

Query keys:

- `auditLogKeys.list(filters)`
- `auditLogKeys.detail(id)`

No `mutations.ts` first pass.

Blocker:

- audit-log admin route group still future-facing in canon

### 19. `events-admin`

Files:

- `features/events-admin/queries.ts`
- `features/events-admin/mutations.ts`

Query keys:

- `eventKeys.list(filters)`
- `eventKeys.detail(eventId)`
- `eventKeys.agenda(eventId)`
- `eventKeys.speakers(eventId)`
- `eventKeys.ctas(eventId)`
- `eventKeys.overrides()`
- `eventKeys.status()`

Mutations:

- create/update event
- publish event
- reschedule event
- cancel event
- create/update/reorder agenda
- create/update speakers
- create/update ctas
- create lunar override
- manual personal-practice refresh

Invalidation:

- event list/detail
- child tab key touched
- calendar status
- public event surfaces on publish/reschedule/cancel

### 20. `search-admin`

Files:

- `features/search-admin/queries.ts`
- `features/search-admin/mutations.ts`

Query keys:

- `searchAdminKeys.status()`
- `searchAdminKeys.freshness()`
- `searchAdminKeys.reindexJobs()`

Mutations:

- reindex all
- reindex source

Invalidation:

- status/freshness immediately
- maybe related content lists when freshness is shown in-page

### 21. `notifications-admin`

Files:

- `features/notifications-admin/queries.ts`
- `features/notifications-admin/mutations.ts`

Query keys:

- `notificationAdminKeys.status()`
- `notificationAdminKeys.pushJobs(filters)`
- `notificationAdminKeys.pushJob(publicId)`
- `notificationAdminKeys.preferences()`
- `notificationAdminKeys.practiceReminders()`

Mutations:

- update preferences
- update practice reminder settings
- create push job
- process push job
- redrive push job

Invalidation:

- jobs list/detail
- notification status
- preferences/reminder keys

### 22. `volunteers-admin`

Files:

- `features/volunteers-admin/queries.ts`
- `features/volunteers-admin/mutations.ts`

Query keys:

- `volunteerKeys.list()`
- `volunteerKeys.detail(publicId)`
- `contactInfoKeys.detail()`

Mutations:

- create/update/delete volunteer
- sort volunteers
- update contact info

Invalidation:

- volunteer list/detail
- contact info

Route canon dùng:

- `GET /api/admin/volunteers`
- `GET /api/admin/volunteers/:publicId`
- `POST /api/admin/volunteers`
- `PATCH /api/admin/volunteers/:publicId`
- `DELETE /api/admin/volunteers/:publicId`
- `PATCH /api/admin/volunteers/sort`
- `GET /api/admin/contact-info`
- `PATCH /api/admin/contact-info`

Note:

- `PATCH /api/admin/contact-info` là `super-admin` only, không trộn vào shared mutation permission guard mặc định của volunteer CRUD

### 23. `wisdom-baihoa`

Files:

- `features/wisdom-baihoa/queries.ts`
- `features/wisdom-baihoa/mutations.ts`

Query keys:

- `wisdomAdminKeys.list(filters)`
- `wisdomAdminKeys.detail(publicId)`
- `wisdomAdminKeys.offlineBundles()`
- `wisdomAdminKeys.importJobs()`
- `baihuaAdminKeys.books(filters)`
- `baihuaAdminKeys.chapter(publicId)`

Mutations:

- create wisdom entry
- update wisdom entry
- publish wisdom entry
- trigger ingestion job
- import baihua source
- update baihua translation
- publish baihua chapter
- rebuild offline bundles

Invalidation:

- wisdom list/detail
- offline bundles
- import jobs
- baihua chapter detail
- search/offline freshness widgets nếu workspace có surfaced state

Route canon dùng:

- `GET /api/admin/wisdom/entries`
- `GET /api/admin/wisdom/entries/:publicId`
- `POST /api/admin/wisdom/entries`
- `PATCH /api/admin/wisdom/entries/:publicId`
- `POST /api/admin/wisdom/entries/:publicId/publish`
- `POST /api/admin/wisdom/entries/ingestion-jobs`
- `GET /api/admin/wisdom/offline-bundles`
- `POST /api/admin/wisdom/offline-bundles/rebuild`
- `GET /api/admin/wisdom/import-jobs`
- `GET /api/admin/wisdom/baihua/books`
- `GET /api/admin/wisdom/baihua/chapters/:publicId`
- `POST /api/admin/wisdom/baihua/books/import-source`
- `PATCH /api/admin/wisdom/baihua/chapters/:publicId/translation`
- `POST /api/admin/wisdom/baihua/chapters/:publicId/publish`

### 24. `health-admin`

Files:

- `features/health-admin/queries.ts`

Query keys:

- `healthAdminKeys.summary()`
- `healthAdminKeys.checks()`

No mutations in first pass.

Route canon dùng:

- `GET /api/admin/system/health-extended`

Notes:

- dùng polling 30s, không tạo `mutations.ts`

### 25. `assisted-entry-admin`

Files:

- `features/assisted-entry-admin/queries.ts`
- `features/assisted-entry-admin/mutations.ts`

Query keys:

- `assistedEntryKeys.history(filters)`
- `assistedEntryKeys.memberSearch(filters)`
- `assistedEntryKeys.memberVows(memberPublicId)`

Mutations:

- create assisted life-release entry
- create assisted vow progress entry

Invalidation:

- history
- affected member detail
- affected vow detail
- dashboard recent support activity if shown

Route canon dùng:

- `POST /api/admin/vows/assisted-entry/life-release`
- `POST /api/admin/vows/assisted-entry/progress`
- `GET /api/admin/vows/assisted-entry/history`
- `GET /api/admin/vows/assisted-entry/members/search`
- `GET /api/admin/vows/assisted-entry/members/:memberPublicId/vows`

---

## Folder rollout order

1. `dashboard`
2. `feature-flags-admin`
3. `audit-logs-admin`
4. `posts`
5. `moderation-reports`
6. `events-admin`
7. `notifications-admin`
8. `users-admin`
9. các editorial workspaces còn lại
10. `sessions-admin`
11. `wisdom-baihoa`
12. support/contact

Lý do:

- verify shared query infra trên screen read-heavy trước
- rồi mới sang mutation-heavy core pages
- moderation/events/notifications là nơi invalidation logic dễ sai nhất nên đưa lên sớm
- identity/wisdom/support bị đẩy sau vì cross-module invalidation và auth narrowing nhiều hơn

---

## Done criteria before calling admin scaffold ready

- mọi feature có `queries.ts`
- mọi feature mutation-heavy có `mutations.ts`
- không component nào hardcode query key string ngoài feature query files
- dashboard invalidation dependencies được nối tối thiểu
- page route -> feature folder -> API group map được 1-1 hoặc 1-n rõ ràng
- blockers còn lại được ghi rõ, không để “TODO maybe route X”

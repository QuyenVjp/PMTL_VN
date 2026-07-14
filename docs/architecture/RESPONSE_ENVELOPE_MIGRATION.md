# Response Envelope Migration Strategy

Ngày: 2026-07-13  
Tasks: Plans.md 0.2, 4.1, 4.2  
Owner: `design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md` (DTO envelope rules)

## Decision

**Single owner:** `ResponseInterceptor` owns the transport success envelope.

```json
{
  "data": <payload>,
  "meta": {
    "timestamp": "ISO-8601",
    "generatedAt": "ISO-8601",
    "requestId": "req_...",
    "path": "/admin/..."
  }
}
```

- `generatedAt` is the canonical field (API_DTO_SHAPE_PLAN).
- `timestamp` is kept as a temporary alias (= generatedAt) during migration.
- Error envelope is unchanged (`ERROR_ENVELOPE_CONTRACT.md`).

## List payload canon (inside transport `data`)

```json
{
  "items": [ /* T */ ],
  "pagination": {
    "total": 0,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

Client auto-unwrap peels one layer → callers receive `{ items, pagination }` directly.

## Canary (Phase 4.1) — REOPENED then narrowed (2026-07-13 review)

| Layer | Change | Status |
|---|---|---|
| `ResponseInterceptor` | emit `generatedAt` (+ keep `timestamp`) | kept |
| `AdminUsersService.list` | return `{ items, pagination }` — no manual wrap | kept |
| `AdminUsersService.getDetail` | **legacy** `{ data: item }` until detail batch | restored after hybrid-shape regression |
| `packages/api-client` | add `PaginatedList<T>` type | kept |
| Admin users list | consume `items` | kept |
| Admin users detail | still `SingleEnvelope` + `envelope.data` | do not migrate alone |

Contract tests: `apps/api/src/common/interceptors/response.interceptor.spec.ts`
(full-chain list vs detail cases included).

**Rule:** never migrate list and detail independently when Admin readers still differ.

## Compatibility during migration

| Endpoint state | Service returns | Wire after interceptor | Client after unwrap |
|---|---|---|---|
| **Migrated (canary)** | `{ items, pagination }` | `{ data: { items, pagination }, meta }` | `{ items, pagination }` |
| **Legacy (not yet)** | `{ data: T[], meta: { pagination } }` | `{ data: { data, meta }, meta }` (double-wrap) | `{ data: T[], meta: { pagination } }` |

Legacy endpoints keep working because Admin already types them as `ListEnvelope<T>` and the client peels exactly one layer. New code must not cast around nested envelopes.

## Forbidden

- Service/controller returning transport envelope fields (`requestId`, `generatedAt`, outer `meta.timestamp`).
- Nested `{ data: { data: ... } }` on migrated endpoints.
- Search/replace migration of all list endpoints in one commit.
- Casting `as ListEnvelope` / `as any` to hide shape drift.

## Phase 4.2 batch order

1. Users + Content (posts, guides, downloads)
2. Moderation + Community + Guestbook
3. System + remaining workspaces (calendar, media, wisdom, dharma-compliance, events, altar, little-house, life-liberation, daily-recitation, volunteers, sessions, notifications)

Each batch:

1. Change service return to `{ items, pagination }` (or raw item for single).
2. Update Admin query factory to `PaginatedList<T>`.
3. Update table consumers `list?.items`.
4. Targeted typecheck + component/query tests.

## Phase 4.2 batch 1 — Content guides + downloads (2026-07-14)

| Endpoint | Service method | Before | After | Admin reader |
|---|---|---|---|---|
| `GET /admin/content/guides` | `ContentService.listGuides` | `{ data, meta.pagination }` (ListEnvelope → double-wrap) | `{ items, pagination }` | `guideListOptions` → `PaginatedList`; `guides-table` reads `list?.items` |
| `GET /admin/content/downloads` | `ContentService.adminListDownloads` | `{ data, meta.pagination }` (ListEnvelope → double-wrap) | `{ items, pagination }` | `downloadListOptions` → `PaginatedList`; `downloads-table` reads `list?.items` |
| `GET /admin/content/posts` | `ContentService.listPosts` | already `{ items, pagination:{page,limit,total,totalPages} }` (ListResponse) | unchanged — not double-wrapped | already `list?.items` |

Notes:

- Public list methods (`publicListBeginnerGuides`, `publicListDownloads`) are **separate** service methods and out of scope for this batch.
- Guide/download **detail** already return raw items and Admin detail queries already consume raw items — list migration does not create hybrid-shape drift.
- Users list was the 4.1 canary and is already on `{ items, pagination }`.
- Contract tests: `response.interceptor.spec.ts` → `Phase 4.2 batch 1 — content guides + downloads list full-chain`.

## Phase 4.2 batch 2 — Community + Moderation (2026-07-14)

| Endpoint | Service method | Before | After | Admin reader |
|---|---|---|---|---|
| `GET /admin/community/posts` | `CommunityService.adminListPosts` | `{ data, meta.pagination }` | `{ items, pagination }` | `communityPostListOptions` → `PaginatedList`; table reads `envelope?.items` |
| `GET /admin/community/guestbook` | `CommunityService.adminListGuestbook` | `{ data, meta.pagination }` | `{ items, pagination }` | `guestbookListOptions` → `PaginatedList`; table reads `envelope?.items` |
| `GET /moderation/reports` | `ModerationService.list` | `{ data, meta.pagination }` | `{ items, pagination }` | both `moderation-reports` (feature + api-client) and `moderation-comments` → `PaginatedList`; tables read `envelope?.items` |

Notes:

- Public community lists (`listPosts`, `listComments`, `listTestimonials`) remain on legacy ListEnvelope — separate methods, out of scope.
- `ModerationService.listCommentsForModeration` (admin comments controller) is a different endpoint and stays on ListEnvelope until its batch.
- Detail endpoints still return SingleEnvelope / raw as before; only lists moved.
- Contract tests: `response.interceptor.spec.ts` → `Phase 4.2 batch 2 — community + moderation list full-chain`.

## Phase 4.2 batch 3a — clean Shape A admin-only lists (2026-07-14)

| Endpoint | Service method | After | Admin readers |
|---|---|---|---|
| `GET /admin/calendar/events` | `CalendarService.adminListEvents` | `{ items, pagination }` | `calendar/queries` + 2 table sites |
| `GET /admin/media` | `AdminMediaService.list` | `{ items, pagination }` | media index, media-picker-modal (3), guides/downloads media maps, calendar media map |
| `GET /admin/content/media-library/collections` | `AdminMediaLibraryService.listCollections` | `{ items, pagination }` | media-library index collections |
| `GET /admin/audit-logs` | `AdminAuditLogsService.list` | `{ items, pagination }` | audit-logs-page; unit tests updated |
| `GET /admin/volunteers` | `ContactService.adminListVolunteers` | `{ items, pagination }` | volunteers-table |
| `GET /admin/vows/assisted-entry/history` | `VowsMeritService.adminAssistedEntryHistory` | `{ items, pagination }` | assisted-entry index (items + `pagination.total`) |

### Deferred inventory (batch 3b+)

| Class | Endpoints | Why deferred |
|---|---|---|
| **Shape B flat-meta** `{data, meta:{total,limit,offset}}` | wisdom entries/authority-profiles; altar items/validation-logs; events; life-liberation records; dharma charities/fraud/vows/guidance; little-house records/fraud | need to *build* `pagination` (incl. `hasMore`), not lift nested object |
| **Shape C page-based** `{page,limit,total,totalPages}` | daily-practice guides; daily-recitation schedules/guidelines | `PaginatedList` expects `offset`/`hasMore` — field-set reconciliation required |
| **Shape D bare `{data:[]}`** | life-liberation species-summary | non-paginated; mis-typed as ListEnvelope |
| **Shared service methods** | `events.listEvents`, `altar.listItems`, `little-house.listRecords`, `life-liberation.listRecords`, `dharma.listCharities` | same method feeds member/public route — flip both ends or split methods first |

Contract tests: `response.interceptor.spec.ts` → `Phase 4.2 batch 3a — clean Shape A admin lists full-chain`.

## Deprecations

| Type | Status |
|---|---|
| `ListEnvelope<T>` | Legacy — do not use for new endpoints |
| `PaginatedList<T>` | Canon for migrated list endpoints |
| `SingleEnvelope<T>` | Legacy for detail; migrate to raw `T` when batch reaches it |
| `meta.timestamp` | Alias of `generatedAt` — remove after full migration |

## Verification

```bash
pnpm --filter @pmtl/api exec vitest run src/common/interceptors/response.interceptor.spec.ts
pnpm --filter @pmtl/api typecheck
pnpm --filter @pmtl/admin typecheck
pnpm --filter @pmtl/api-client typecheck
```

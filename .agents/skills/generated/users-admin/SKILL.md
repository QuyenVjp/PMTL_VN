---
name: users-admin
description: "Skill for the Users-admin area of PMTL_VN. 53 symbols across 19 files."
---

# Users-admin

53 symbols | 19 files | Cohesion: 100%

## When to Use

- Working with code in `apps/`
- Understanding how createAdminListQuery, getUsersQuery, getRolesQuery work
- Modifying users-admin-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/admin/src/features/users-admin/queries.ts` | getUsersQuery, getRolesQuery, getPermissionsQuery, getUserActivityQuery |
| `apps/admin/src/features/sutras-admin/queries.ts` | getSutraTextsQuery, getSutraTranslationsQuery, getSutraCommentariesQuery, getSutraInterpretationsQuery |
| `apps/admin/src/features/notifications-admin/queries.ts` | getNotificationTypesQuery, getNotificationTemplatesQuery, getNotificationSchedulesQuery, getNotificationLogsQuery |
| `apps/admin/src/features/moderated-comments-admin/queries.ts` | getCommentsQuery, getCommentThreadsQuery, getModerationQueueQuery, getModeratedCommentsAnalyticsQuery |
| `apps/admin/src/features/community-posts-admin/queries.ts` | getCommunityPostsQuery, getCommunityTopicsQuery, getModerationQueueQuery, getCommunityAnalyticsQuery |
| `apps/admin/src/features/chant-admin/queries.ts` | getChantCollectionsQuery, getChantItemsQuery, getChantRecordingsQuery, getChantLyricsQuery |
| `apps/admin/src/features/sessions-admin/queries.ts` | getActiveSessionsQuery, getSessionHistoryQuery, getDevicesQuery |
| `apps/admin/src/features/media-library-admin/queries.ts` | getMediaLibraryCollectionsQuery, getMediaLibraryItemsQuery, getMediaLibraryTagsQuery |
| `apps/admin/src/features/little-house-admin/queries.ts` | getLittleHouseGuidesQuery, getLittleHouseCaseVariantsQuery, getLittleHouseFaqQuery |
| `apps/admin/src/features/life-release-admin/queries.ts` | getLifeReleaseRitualsQuery, getLifeReleaseDicantsQuery, getLifeReleaseLocationsQuery |

## Entry Points

Start here when exploring this area:

- **`createAdminListQuery`** (Function) — `apps/admin/src/lib/query/create-admin-query.ts:35`
- **`getUsersQuery`** (Function) — `apps/admin/src/features/users-admin/queries.ts:83`
- **`getRolesQuery`** (Function) — `apps/admin/src/features/users-admin/queries.ts:115`
- **`getPermissionsQuery`** (Function) — `apps/admin/src/features/users-admin/queries.ts:144`
- **`getUserActivityQuery`** (Function) — `apps/admin/src/features/users-admin/queries.ts:161`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `createAdminListQuery` | Function | `apps/admin/src/lib/query/create-admin-query.ts` | 35 |
| `getUsersQuery` | Function | `apps/admin/src/features/users-admin/queries.ts` | 83 |
| `getRolesQuery` | Function | `apps/admin/src/features/users-admin/queries.ts` | 115 |
| `getPermissionsQuery` | Function | `apps/admin/src/features/users-admin/queries.ts` | 144 |
| `getUserActivityQuery` | Function | `apps/admin/src/features/users-admin/queries.ts` | 161 |
| `getSutraTextsQuery` | Function | `apps/admin/src/features/sutras-admin/queries.ts` | 81 |
| `getSutraTranslationsQuery` | Function | `apps/admin/src/features/sutras-admin/queries.ts` | 110 |
| `getSutraCommentariesQuery` | Function | `apps/admin/src/features/sutras-admin/queries.ts` | 139 |
| `getSutraInterpretationsQuery` | Function | `apps/admin/src/features/sutras-admin/queries.ts` | 156 |
| `getActiveSessionsQuery` | Function | `apps/admin/src/features/sessions-admin/queries.ts` | 79 |
| `getSessionHistoryQuery` | Function | `apps/admin/src/features/sessions-admin/queries.ts` | 111 |
| `getDevicesQuery` | Function | `apps/admin/src/features/sessions-admin/queries.ts` | 130 |
| `getAdminPostsQuery` | Function | `apps/admin/src/features/posts/queries.ts` | 56 |
| `getNotificationTypesQuery` | Function | `apps/admin/src/features/notifications-admin/queries.ts` | 80 |
| `getNotificationTemplatesQuery` | Function | `apps/admin/src/features/notifications-admin/queries.ts` | 109 |
| `getNotificationSchedulesQuery` | Function | `apps/admin/src/features/notifications-admin/queries.ts` | 138 |
| `getNotificationLogsQuery` | Function | `apps/admin/src/features/notifications-admin/queries.ts` | 155 |
| `getCommentsQuery` | Function | `apps/admin/src/features/moderated-comments-admin/queries.ts` | 85 |
| `getCommentThreadsQuery` | Function | `apps/admin/src/features/moderated-comments-admin/queries.ts` | 117 |
| `getModerationQueueQuery` | Function | `apps/admin/src/features/moderated-comments-admin/queries.ts` | 148 |

## How to Explore

1. `gitnexus_context({name: "createAdminListQuery"})` — see callers and callees
2. `gitnexus_query({query: "users-admin"})` — find related execution flows
3. Read key files listed above for implementation details

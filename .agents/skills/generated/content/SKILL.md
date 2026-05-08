---
name: content
description: "Skill for the Content area of PMTL_VN. 114 symbols across 32 files."
---

# Content

114 symbols | 32 files | Cohesion: 75%

## When to Use

- Working with code in `apps/`
- Understanding how mapReportToDetail, canCreatePost, canEditPost work
- Modifying content-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/api/src/modules/content/content.service.ts` | listGuides, getGuide, adminListDownloads, adminGetDownload, publicListBeginnerGuides (+18) |
| `apps/api/src/modules/content/content.controller.ts` | listAdminGuides, getAdminGuide, listDownloads, getDownload, listPublicGuides (+10) |
| `apps/api/src/modules/content/admin-media-library.service.ts` | listCollections, listItems, getCollection, publishCollection, unpublishCollection (+3) |
| `apps/api/src/modules/content/content.policy.ts` | canCreatePost, canEditPost, canPublishPost, canDeletePost, canUnpublishPost (+1) |
| `apps/admin/src/features/content/posts-table.tsx` | statusBadgeClass, statusLabel, postTypeLabel, postTypeBadgeClass, PostsTable (+1) |
| `apps/admin/src/features/content/posts-dialogs.tsx` | PostEditDialog, PostPublishDialog, PostDeleteDialog, PostCreateDialog, PostsDialogs (+1) |
| `apps/admin/src/features/content/post-detail-page.tsx` | readPostBodyHtml, PostDetailPage, statusBadgeClass, statusLabel, DetailSidebar (+1) |
| `apps/api/src/platform/storage/admin-media.controller.ts` | list, detail, content, updateMetadata, softDelete |
| `apps/admin/src/features/content/mutations.ts` | useUpdatePost, useUnpublishPost, usePublishPost, useDeletePost, useCreatePost |
| `apps/api/src/modules/content/admin-media-library.controller.ts` | list, detail, publish, unpublish |

## Entry Points

Start here when exploring this area:

- **`mapReportToDetail`** (Function) — `apps/api/src/modules/moderation/moderation.mapper.ts:30`
- **`canCreatePost`** (Function) — `apps/api/src/modules/content/content.policy.ts:2`
- **`canEditPost`** (Function) — `apps/api/src/modules/content/content.policy.ts:6`
- **`canPublishPost`** (Function) — `apps/api/src/modules/content/content.policy.ts:12`
- **`canDeletePost`** (Function) — `apps/api/src/modules/content/content.policy.ts:16`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `NotFoundError` | Class | `apps/api/src/common/errors/app-error.ts` | 33 |
| `mapReportToDetail` | Function | `apps/api/src/modules/moderation/moderation.mapper.ts` | 30 |
| `canCreatePost` | Function | `apps/api/src/modules/content/content.policy.ts` | 2 |
| `canEditPost` | Function | `apps/api/src/modules/content/content.policy.ts` | 6 |
| `canPublishPost` | Function | `apps/api/src/modules/content/content.policy.ts` | 12 |
| `canDeletePost` | Function | `apps/api/src/modules/content/content.policy.ts` | 16 |
| `canUnpublishPost` | Function | `apps/api/src/modules/content/content.policy.ts` | 20 |
| `getPublicStatuses` | Function | `apps/api/src/modules/content/content.policy.ts` | 24 |
| `mapPostToResponse` | Function | `apps/api/src/modules/content/content.mapper.ts` | 9 |
| `slugify` | Function | `packages/shared/src/utils/slug.ts` | 0 |
| `normalize` | Function | `infra/tools/multi_cli_router.py` | 56 |
| `postListOptions` | Function | `apps/admin/src/features/content/queries.ts` | 55 |
| `PostsTable` | Function | `apps/admin/src/features/content/posts-table.tsx` | 154 |
| `postDetailOptions` | Function | `apps/admin/src/features/content/queries.ts` | 68 |
| `useUpdatePost` | Function | `apps/admin/src/features/content/mutations.ts` | 49 |
| `useUnpublishPost` | Function | `apps/admin/src/features/content/mutations.ts` | 78 |
| `PostDetailPage` | Function | `apps/admin/src/features/content/post-detail-page.tsx` | 429 |
| `usePublishPost` | Function | `apps/admin/src/features/content/mutations.ts` | 64 |
| `useDeletePost` | Function | `apps/admin/src/features/content/mutations.ts` | 93 |
| `useCreatePost` | Function | `apps/admin/src/features/content/mutations.ts` | 35 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `UpdatePost → ToCreateData` | cross_community | 5 |
| `ThemeSync → NotFoundError` | cross_community | 5 |
| `DeletePost → ToCreateData` | cross_community | 5 |
| `UpdateDownload → RequireClient` | cross_community | 5 |
| `UpdateDownload → RequireBucket` | cross_community | 5 |
| `CreateCollectionDialog → Normalize` | cross_community | 4 |
| `Main → Normalize` | cross_community | 4 |
| `ListPosts → RequireClient` | cross_community | 4 |
| `ListPosts → RequireBucket` | cross_community | 4 |
| `UpdateGuide → RequireClient` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Identity | 11 calls |
| Prisma | 3 calls |
| Downloads | 3 calls |
| Storage | 2 calls |
| Wisdom-qa | 2 calls |
| Community-posts | 1 calls |
| Media | 1 calls |
| Dharma-compliance | 1 calls |

## How to Explore

1. `gitnexus_context({name: "mapReportToDetail"})` — see callers and callees
2. `gitnexus_query({query: "content"})` — find related execution flows
3. Read key files listed above for implementation details

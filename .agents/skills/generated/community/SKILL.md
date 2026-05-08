---
name: community
description: "Skill for the Community area of PMTL_VN. 56 symbols across 4 files."
---

# Community

56 symbols | 4 files | Cohesion: 86%

## When to Use

- Working with code in `apps/`
- Understanding how mapPostToAdminItem, mapGuestbookEntryToAdminItem, getPostById work
- Modifying community-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/api/src/modules/community/community.service.ts` | getPostById, adminGetPost, adminUpdatePostStatus, adminDeletePost, adminPinPost (+18) |
| `apps/api/src/modules/community/community.repository.ts` | findAdminPostByPublicId, updatePostStatus, updatePost, deletePost, findAdminGuestbookEntryByPublicId (+11) |
| `apps/api/src/modules/community/community.controller.ts` | getPost, updatePostStatus, deletePost, pinPost, unpinPost (+10) |
| `apps/api/src/modules/community/community.mapper.ts` | mapPostToAdminItem, mapGuestbookEntryToAdminItem |

## Entry Points

Start here when exploring this area:

- **`mapPostToAdminItem`** (Function) — `apps/api/src/modules/community/community.mapper.ts:10`
- **`mapGuestbookEntryToAdminItem`** (Function) — `apps/api/src/modules/community/community.mapper.ts:25`
- **`getPostById`** (Method) — `apps/api/src/modules/community/community.service.ts:44`
- **`adminGetPost`** (Method) — `apps/api/src/modules/community/community.service.ts:185`
- **`adminUpdatePostStatus`** (Method) — `apps/api/src/modules/community/community.service.ts:191`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `mapPostToAdminItem` | Function | `apps/api/src/modules/community/community.mapper.ts` | 10 |
| `mapGuestbookEntryToAdminItem` | Function | `apps/api/src/modules/community/community.mapper.ts` | 25 |
| `getPostById` | Method | `apps/api/src/modules/community/community.service.ts` | 44 |
| `adminGetPost` | Method | `apps/api/src/modules/community/community.service.ts` | 185 |
| `adminUpdatePostStatus` | Method | `apps/api/src/modules/community/community.service.ts` | 191 |
| `adminDeletePost` | Method | `apps/api/src/modules/community/community.service.ts` | 208 |
| `adminPinPost` | Method | `apps/api/src/modules/community/community.service.ts` | 225 |
| `adminUnpinPost` | Method | `apps/api/src/modules/community/community.service.ts` | 241 |
| `adminHidePost` | Method | `apps/api/src/modules/community/community.service.ts` | 257 |
| `adminRestorePost` | Method | `apps/api/src/modules/community/community.service.ts` | 273 |
| `findAdminPostByPublicId` | Method | `apps/api/src/modules/community/community.repository.ts` | 81 |
| `updatePostStatus` | Method | `apps/api/src/modules/community/community.repository.ts` | 88 |
| `updatePost` | Method | `apps/api/src/modules/community/community.repository.ts` | 95 |
| `deletePost` | Method | `apps/api/src/modules/community/community.repository.ts` | 102 |
| `getPost` | Method | `apps/api/src/modules/community/community.controller.ts` | 55 |
| `updatePostStatus` | Method | `apps/api/src/modules/community/community.controller.ts` | 149 |
| `deletePost` | Method | `apps/api/src/modules/community/community.controller.ts` | 161 |
| `pinPost` | Method | `apps/api/src/modules/community/community.controller.ts` | 173 |
| `unpinPost` | Method | `apps/api/src/modules/community/community.controller.ts` | 181 |
| `hidePost` | Method | `apps/api/src/modules/community/community.controller.ts` | 189 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `CreateGuestbookEntry → BuildAuditLogInput` | cross_community | 4 |
| `UpdatePostStatus → BuildAuditLogInput` | cross_community | 4 |
| `UpdateGuestbookStatus → BuildAuditLogInput` | cross_community | 4 |
| `ListGuestbook → FindManyAdminGuestbook` | intra_community | 3 |
| `ListGuestbook → ZodValidationPipe` | cross_community | 3 |
| `ListGuestbook → FindManyPublicGuestbook` | intra_community | 3 |
| `CreateGuestbookEntry → ZodValidationPipe` | cross_community | 3 |
| `CreateGuestbookEntry → CreateGuestbookEntry` | intra_community | 3 |
| `AdminUpdateVolunteer → BuildAuditLogInput` | cross_community | 3 |
| `AdminDeleteVolunteer → BuildAuditLogInput` | cross_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Identity | 15 calls |
| Wisdom-qa | 4 calls |

## How to Explore

1. `gitnexus_context({name: "mapPostToAdminItem"})` — see callers and callees
2. `gitnexus_query({query: "community"})` — find related execution flows
3. Read key files listed above for implementation details

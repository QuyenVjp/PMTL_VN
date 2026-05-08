---
name: storage
description: "Skill for the Storage area of PMTL_VN. 30 symbols across 7 files."
---

# Storage

30 symbols | 7 files | Cohesion: 91%

## When to Use

- Working with code in `apps/`
- Understanding how R2StorageAdapter, LocalStorageAdapter, uploadFile work
- Modifying storage-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/api/src/platform/storage/storage.service.ts` | uploadFile, getMaxSizeForType, getFolder, getSafeExtension, sanitizeFilename (+6) |
| `apps/api/src/platform/storage/r2-storage.adapter.ts` | upload, delete, getUrl, exists, requireClient (+4) |
| `apps/api/src/platform/storage/local-storage.adapter.ts` | upload, getUrl, delete, LocalStorageAdapter |
| `apps/api/src/platform/storage/storage.interface.ts` | upload, delete, StorageInterface |
| `apps/api/src/platform/storage/admin-media.controller.ts` | upload |
| `apps/api/src/modules/life-liberation/life-liberation.repository.ts` | updateStatus |
| `apps/api/src/platform/storage/media-assets.repository.ts` | findByUploader |

## Entry Points

Start here when exploring this area:

- **`R2StorageAdapter`** (Class) — `apps/api/src/platform/storage/r2-storage.adapter.ts:12`
- **`LocalStorageAdapter`** (Class) — `apps/api/src/platform/storage/local-storage.adapter.ts:7`
- **`uploadFile`** (Method) — `apps/api/src/platform/storage/storage.service.ts:50`
- **`getMaxSizeForType`** (Method) — `apps/api/src/platform/storage/storage.service.ts:189`
- **`getFolder`** (Method) — `apps/api/src/platform/storage/storage.service.ts:195`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `R2StorageAdapter` | Class | `apps/api/src/platform/storage/r2-storage.adapter.ts` | 12 |
| `LocalStorageAdapter` | Class | `apps/api/src/platform/storage/local-storage.adapter.ts` | 7 |
| `StorageInterface` | Interface | `apps/api/src/platform/storage/storage.interface.ts` | 0 |
| `uploadFile` | Method | `apps/api/src/platform/storage/storage.service.ts` | 50 |
| `getMaxSizeForType` | Method | `apps/api/src/platform/storage/storage.service.ts` | 189 |
| `getFolder` | Method | `apps/api/src/platform/storage/storage.service.ts` | 195 |
| `getSafeExtension` | Method | `apps/api/src/platform/storage/storage.service.ts` | 203 |
| `sanitizeFilename` | Method | `apps/api/src/platform/storage/storage.service.ts` | 208 |
| `isSafeUndetectableType` | Method | `apps/api/src/platform/storage/storage.service.ts` | 216 |
| `isAllowedMimeType` | Method | `apps/api/src/platform/storage/storage.service.ts` | 220 |
| `virusScan` | Method | `apps/api/src/platform/storage/storage.service.ts` | 224 |
| `scanWithClamavInstream` | Method | `apps/api/src/platform/storage/storage.service.ts` | 237 |
| `upload` | Method | `apps/api/src/platform/storage/storage.interface.ts` | 1 |
| `upload` | Method | `apps/api/src/platform/storage/local-storage.adapter.ts` | 16 |
| `getUrl` | Method | `apps/api/src/platform/storage/local-storage.adapter.ts` | 38 |
| `upload` | Method | `apps/api/src/platform/storage/admin-media.controller.ts` | 63 |
| `updateStatus` | Method | `apps/api/src/modules/life-liberation/life-liberation.repository.ts` | 67 |
| `deleteFile` | Method | `apps/api/src/platform/storage/storage.service.ts` | 115 |
| `delete` | Method | `apps/api/src/platform/storage/storage.interface.ts` | 2 |
| `upload` | Method | `apps/api/src/platform/storage/r2-storage.adapter.ts` | 38 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `UpdateDownload → RequireClient` | cross_community | 5 |
| `UpdateDownload → RequireBucket` | cross_community | 5 |
| `ListPosts → RequireClient` | cross_community | 4 |
| `ListPosts → RequireBucket` | cross_community | 4 |
| `UpdateGuide → RequireClient` | cross_community | 4 |
| `UpdateGuide → RequireBucket` | cross_community | 4 |
| `Upload → ScanWithClamavInstream` | intra_community | 4 |
| `Detail → RequireClient` | cross_community | 4 |
| `Detail → RequireBucket` | cross_community | 4 |
| `DeleteFile → RequireClient` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Prisma | 1 calls |
| Identity | 1 calls |

## How to Explore

1. `gitnexus_context({name: "R2StorageAdapter"})` — see callers and callees
2. `gitnexus_query({query: "storage"})` — find related execution flows
3. Read key files listed above for implementation details

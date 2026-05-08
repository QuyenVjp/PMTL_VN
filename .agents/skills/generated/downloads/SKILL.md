---
name: downloads
description: "Skill for the Downloads area of PMTL_VN. 57 symbols across 28 files."
---

# Downloads

57 symbols | 28 files | Cohesion: 72%

## When to Use

- Working with code in `apps/`
- Understanding how useNavigateTo, extractUploadMediaPayload, invalidFieldClass work
- Modifying downloads-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/admin/src/features/downloads/downloads-table.tsx` | categoryLabel, statusBadgeClass, statusLabel, formatFileSize, DownloadsTable (+2) |
| `apps/admin/src/features/downloads/downloads-dialogs.tsx` | DownloadCreateDialog, DownloadEditDialog, DownloadPublishDialog, DownloadDeleteDialog, DownloadsDialogs (+1) |
| `apps/admin/src/features/downloads/mutations.ts` | useCreateDownload, useUpdateDownload, useDeleteDownload, usePublishDownload, useUnpublishDownload |
| `apps/admin/src/features/downloads/download-detail-page.tsx` | statusLabel, statusBadgeClass, formatFileSize, DownloadDetailPage |
| `apps/admin/src/features/media-library/index.tsx` | CreateCollectionDialog, toggleMediaSelection, EditCollectionDialog |
| `apps/admin/src/components/workspace/workspace-helpers.ts` | contentStatusLabel, contentStatusBadgeClass, downloadCategoryLabel |
| `apps/admin/src/features/self-cultivation/mutations.ts` | useCreateSelfCultivationGuide, useCreateSelfCultivationFaq |
| `apps/admin/src/features/self-cultivation/index.tsx` | CreateGuideDialog, CreateFaqDialog |
| `apps/admin/src/features/media-library/mutations.ts` | useCreateCollection, useUpdateCollection |
| `apps/admin/src/features/downloads/queries.ts` | downloadDetailOptions, downloadListOptions |

## Entry Points

Start here when exploring this area:

- **`useNavigateTo`** (Function) — `apps/admin/src/lib/router-utils.ts:6`
- **`extractUploadMediaPayload`** (Function) — `apps/admin/src/lib/media-upload.ts:7`
- **`invalidFieldClass`** (Function) — `apps/admin/src/lib/form-validation.ts:37`
- **`useCreateVolunteer`** (Function) — `apps/admin/src/features/volunteers/mutations.ts:29`
- **`useCreateSelfCultivationGuide`** (Function) — `apps/admin/src/features/self-cultivation/mutations.ts:38`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `useNavigateTo` | Function | `apps/admin/src/lib/router-utils.ts` | 6 |
| `extractUploadMediaPayload` | Function | `apps/admin/src/lib/media-upload.ts` | 7 |
| `invalidFieldClass` | Function | `apps/admin/src/lib/form-validation.ts` | 37 |
| `useCreateVolunteer` | Function | `apps/admin/src/features/volunteers/mutations.ts` | 29 |
| `useCreateSelfCultivationGuide` | Function | `apps/admin/src/features/self-cultivation/mutations.ts` | 38 |
| `useCreateSelfCultivationFaq` | Function | `apps/admin/src/features/self-cultivation/mutations.ts` | 62 |
| `VolunteerCreatePage` | Function | `apps/admin/src/features/volunteers/volunteer-create-page.tsx` | 21 |
| `useCreateCollection` | Function | `apps/admin/src/features/media-library/mutations.ts` | 30 |
| `useUpdateCollection` | Function | `apps/admin/src/features/media-library/mutations.ts` | 43 |
| `mediaListOptions` | Function | `apps/admin/src/features/media/queries.ts` | 36 |
| `useUploadMediaAsset` | Function | `apps/admin/src/features/media/mutations.ts` | 8 |
| `useCreateGuide` | Function | `apps/admin/src/features/guides/mutations.ts` | 34 |
| `downloadDetailOptions` | Function | `apps/admin/src/features/downloads/queries.ts` | 59 |
| `useCreateDownload` | Function | `apps/admin/src/features/downloads/mutations.ts` | 34 |
| `useUpdateDownload` | Function | `apps/admin/src/features/downloads/mutations.ts` | 48 |
| `GuidesPage` | Function | `apps/admin/src/features/guides/index.tsx` | 14 |
| `GuideCreatePage` | Function | `apps/admin/src/features/guides/guide-create-page.tsx` | 52 |
| `DownloadDetailPage` | Function | `apps/admin/src/features/downloads/download-detail-page.tsx` | 76 |
| `DownloadCreatePage` | Function | `apps/admin/src/features/downloads/download-create-page.tsx` | 39 |
| `MediaPickerModal` | Function | `apps/admin/src/components/media/media-picker-modal.tsx` | 231 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `MediaPickerModal → GetCsrfTokenFromCookie` | cross_community | 4 |
| `GuideCreatePage → GetCsrfTokenFromCookie` | cross_community | 4 |
| `DownloadCreatePage → GetCsrfTokenFromCookie` | cross_community | 4 |
| `CreateCollectionDialog → Normalize` | cross_community | 4 |
| `GuideEditDialog → GetCsrfTokenFromCookie` | cross_community | 4 |
| `DownloadCreateDialog → GetCsrfTokenFromCookie` | cross_community | 4 |
| `DownloadEditDialog → GetCsrfTokenFromCookie` | cross_community | 4 |
| `EventFormDialog → GetCsrfTokenFromCookie` | cross_community | 4 |
| `GuideCreateDialog → GetCsrfTokenFromCookie` | cross_community | 4 |
| `WisdomCreateDialog → Cn` | cross_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Media | 8 calls |
| Ui | 5 calls |
| Guides | 2 calls |
| Settings | 1 calls |
| Content | 1 calls |
| Community-posts | 1 calls |
| Dharma-compliance | 1 calls |
| System | 1 calls |

## How to Explore

1. `gitnexus_context({name: "useNavigateTo"})` — see callers and callees
2. `gitnexus_query({query: "downloads"})` — find related execution flows
3. Read key files listed above for implementation details

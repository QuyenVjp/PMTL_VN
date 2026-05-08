---
name: guides
description: "Skill for the Guides area of PMTL_VN. 63 symbols across 26 files."
---

# Guides

63 symbols | 26 files | Cohesion: 88%

## When to Use

- Working with code in `apps/`
- Understanding how handleApiError, extractValidationFieldErrors, hasFieldErrors work
- Modifying guides-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/admin/src/features/guides/guide-detail-page.tsx` | editorTextLength, normalizeEditorHtml, buildGuideContent, handleSave, readGuideBodyHtml (+3) |
| `apps/admin/src/features/guides/guides-table.tsx` | categoryLabel, categoryBadgeClass, statusBadgeClass, statusLabel, GuidesTable (+2) |
| `apps/admin/src/features/guides/guides-dialogs.tsx` | reset, handleSubmit, GuidePublishDialog, GuideDeleteDialog, GuidesDialogs (+1) |
| `apps/admin/src/features/guides/guide-create-page.tsx` | editorTextLength, normalizeEditorHtml, buildGuideContent, handleSave |
| `apps/admin/src/features/content/post-detail-page.tsx` | excerptTextLength, normalizeEditorHtml, buildPostContent, handleSave |
| `apps/admin/src/features/content/post-create-page.tsx` | excerptTextLength, normalizeEditorHtml, buildPostContent, handleSave |
| `apps/admin/src/features/guides/mutations.ts` | useUpdateGuide, usePublishGuide, useDeleteGuide |
| `apps/admin/src/lib/form-validation.ts` | extractValidationFieldErrors, hasFieldErrors |
| `apps/admin/src/features/wisdom-baihoa/index.tsx` | reset, handleSubmit |
| `apps/admin/src/features/self-cultivation/index.tsx` | reset, handleSave |

## Entry Points

Start here when exploring this area:

- **`handleApiError`** (Function) — `apps/admin/src/lib/handle-api-error.ts:11`
- **`extractValidationFieldErrors`** (Function) — `apps/admin/src/lib/form-validation.ts:13`
- **`hasFieldErrors`** (Function) — `apps/admin/src/lib/form-validation.ts:33`
- **`reset`** (Function) — `apps/admin/src/features/wisdom-baihoa/index.tsx:327`
- **`handleSubmit`** (Function) — `apps/admin/src/features/wisdom-baihoa/index.tsx:338`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `handleApiError` | Function | `apps/admin/src/lib/handle-api-error.ts` | 11 |
| `extractValidationFieldErrors` | Function | `apps/admin/src/lib/form-validation.ts` | 13 |
| `hasFieldErrors` | Function | `apps/admin/src/lib/form-validation.ts` | 33 |
| `reset` | Function | `apps/admin/src/features/wisdom-baihoa/index.tsx` | 327 |
| `handleSubmit` | Function | `apps/admin/src/features/wisdom-baihoa/index.tsx` | 338 |
| `handleSave` | Function | `apps/admin/src/features/wisdom-baihoa/create-page.tsx` | 54 |
| `handleSave` | Function | `apps/admin/src/features/volunteers/volunteer-detail-page.tsx` | 68 |
| `handleSave` | Function | `apps/admin/src/features/volunteers/volunteer-create-page.tsx` | 35 |
| `handleSubmit` | Function | `apps/admin/src/features/users/users-action-dialog.tsx` | 76 |
| `handleSave` | Function | `apps/admin/src/features/users/user-detail-page.tsx` | 74 |
| `handleSave` | Function | `apps/admin/src/features/guides/guide-detail-page.tsx` | 135 |
| `handleSave` | Function | `apps/admin/src/features/guides/guide-create-page.tsx` | 77 |
| `handleSave` | Function | `apps/admin/src/features/downloads/download-detail-page.tsx` | 123 |
| `handleSave` | Function | `apps/admin/src/features/downloads/download-create-page.tsx` | 66 |
| `handleSave` | Function | `apps/admin/src/features/content/post-detail-page.tsx` | 471 |
| `handleSave` | Function | `apps/admin/src/features/content/post-create-page.tsx` | 132 |
| `guideListOptions` | Function | `apps/admin/src/features/guides/queries.ts` | 42 |
| `GuidesTable` | Function | `apps/admin/src/features/guides/guides-table.tsx` | 95 |
| `handleBulkPublish` | Function | `apps/admin/src/features/guides/guides-table.tsx` | 224 |
| `handleBulkDelete` | Function | `apps/admin/src/features/guides/guides-table.tsx` | 232 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `HandleSave → EditorTextLength` | intra_community | 4 |
| `HandleSave → EditorTextLength` | intra_community | 4 |
| `HandleSave → ExcerptTextLength` | intra_community | 4 |
| `HandleSave → ExcerptTextLength` | intra_community | 4 |
| `HandleSubmit → ExtractValidationFieldErrors` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Downloads | 7 calls |
| Media | 2 calls |
| Community-posts | 1 calls |
| Dharma-compliance | 1 calls |

## How to Explore

1. `gitnexus_context({name: "handleApiError"})` — see callers and callees
2. `gitnexus_query({query: "guides"})` — find related execution flows
3. Read key files listed above for implementation details

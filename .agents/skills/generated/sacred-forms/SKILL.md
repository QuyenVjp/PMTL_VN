---
name: sacred-forms
description: "Skill for the Sacred-forms area of PMTL_VN. 33 symbols across 6 files."
---

# Sacred-forms

33 symbols | 6 files | Cohesion: 86%

## When to Use

- Working with code in `apps/`
- Understanding how mapApplicantToItem, mapApplicantToDetail, mapTemplateToItem work
- Modifying sacred-forms-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/api/src/modules/sacred-forms/sacred-forms.repository.ts` | findApplicantByPublicId, updateApplicantStatus, appendApplicantAudit, upsertPrerequisite, findTemplateByPublicId (+6) |
| `apps/api/src/modules/sacred-forms/sacred-forms.service.ts` | getApplicant, reviewApplication, updatePrerequisite, getTemplate, createTemplate (+5) |
| `apps/api/src/modules/sacred-forms/sacred-forms.controller.ts` | review, apply, listPolarities, listApplicants, myApplications (+2) |
| `apps/api/src/modules/sacred-forms/sacred-forms.mapper.ts` | mapApplicantToItem, mapApplicantToDetail, mapTemplateToItem |
| `apps/admin/src/features/sacred-forms/mutations.ts` | useReviewApplication |
| `apps/admin/src/features/sacred-forms/index.tsx` | ReviewDialog |

## Entry Points

Start here when exploring this area:

- **`mapApplicantToItem`** (Function) — `apps/api/src/modules/sacred-forms/sacred-forms.mapper.ts:26`
- **`mapApplicantToDetail`** (Function) — `apps/api/src/modules/sacred-forms/sacred-forms.mapper.ts:41`
- **`mapTemplateToItem`** (Function) — `apps/api/src/modules/sacred-forms/sacred-forms.mapper.ts:7`
- **`useReviewApplication`** (Function) — `apps/admin/src/features/sacred-forms/mutations.ts:6`
- **`getApplicant`** (Method) — `apps/api/src/modules/sacred-forms/sacred-forms.service.ts:60`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `mapApplicantToItem` | Function | `apps/api/src/modules/sacred-forms/sacred-forms.mapper.ts` | 26 |
| `mapApplicantToDetail` | Function | `apps/api/src/modules/sacred-forms/sacred-forms.mapper.ts` | 41 |
| `mapTemplateToItem` | Function | `apps/api/src/modules/sacred-forms/sacred-forms.mapper.ts` | 7 |
| `useReviewApplication` | Function | `apps/admin/src/features/sacred-forms/mutations.ts` | 6 |
| `getApplicant` | Method | `apps/api/src/modules/sacred-forms/sacred-forms.service.ts` | 60 |
| `reviewApplication` | Method | `apps/api/src/modules/sacred-forms/sacred-forms.service.ts` | 82 |
| `updatePrerequisite` | Method | `apps/api/src/modules/sacred-forms/sacred-forms.service.ts` | 121 |
| `findApplicantByPublicId` | Method | `apps/api/src/modules/sacred-forms/sacred-forms.repository.ts` | 78 |
| `updateApplicantStatus` | Method | `apps/api/src/modules/sacred-forms/sacred-forms.repository.ts` | 108 |
| `appendApplicantAudit` | Method | `apps/api/src/modules/sacred-forms/sacred-forms.repository.ts` | 119 |
| `upsertPrerequisite` | Method | `apps/api/src/modules/sacred-forms/sacred-forms.repository.ts` | 125 |
| `review` | Method | `apps/api/src/modules/sacred-forms/sacred-forms.controller.ts` | 89 |
| `getTemplate` | Method | `apps/api/src/modules/sacred-forms/sacred-forms.service.ts` | 29 |
| `createTemplate` | Method | `apps/api/src/modules/sacred-forms/sacred-forms.service.ts` | 35 |
| `toggleTemplate` | Method | `apps/api/src/modules/sacred-forms/sacred-forms.service.ts` | 43 |
| `findTemplateByPublicId` | Method | `apps/api/src/modules/sacred-forms/sacred-forms.repository.ts` | 33 |
| `toggleTemplateActive` | Method | `apps/api/src/modules/sacred-forms/sacred-forms.repository.ts` | 51 |
| `submitApplication` | Method | `apps/api/src/modules/sacred-forms/sacred-forms.service.ts` | 66 |
| `findApplicantByUserAndTemplate` | Method | `apps/api/src/modules/sacred-forms/sacred-forms.repository.ts` | 90 |
| `createApplicant` | Method | `apps/api/src/modules/sacred-forms/sacred-forms.repository.ts` | 96 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `ToggleTemplate → BuildAuditLogInput` | cross_community | 3 |
| `CreateTemplate → BuildAuditLogInput` | cross_community | 3 |
| `ReviewApplication → BuildAuditLogInput` | cross_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Identity | 4 calls |
| Prisma | 2 calls |

## How to Explore

1. `gitnexus_context({name: "mapApplicantToItem"})` — see callers and callees
2. `gitnexus_query({query: "sacred-forms"})` — find related execution flows
3. Read key files listed above for implementation details

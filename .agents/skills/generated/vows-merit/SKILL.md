---
name: vows-merit
description: "Skill for the Vows-merit area of PMTL_VN. 50 symbols across 15 files."
---

# Vows-merit

50 symbols | 15 files | Cohesion: 86%

## When to Use

- Working with code in `apps/`
- Understanding how vowListOptions, vowDetailOptions, useUpdateVowProgress work
- Modifying vows-merit-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/api/src/modules/vows-merit/vow-member.service.ts` | createVow, updateProgress, fulfillVow, listVows, getVow (+2) |
| `apps/api/src/modules/vows-merit/vows-merit.service.ts` | adminCreateAssistedEntry, adminCreateLifeReleaseEntry, adminGetMemberVows, adminAssistedEntryHistory, adminSearchMembers |
| `apps/api/src/modules/vows-merit/vows-merit.repository.ts` | findMemberByPublicId, createVow, createLifeReleaseJournal, findVowsByUserId, findManyVows |
| `apps/api/src/modules/vows-merit/vows-merit.controller.ts` | getMemberVows, createAssistedEntry, createLifeReleaseEntry, assistedEntryHistory, searchMembers |
| `apps/api/src/modules/vows-merit/life-release-member.service.ts` | list, getDetail, create, update, toDto |
| `apps/api/src/modules/vows-merit/altar-relocation.service.ts` | startRelocation, advanceRelocationStep, validateStepTransition, validatePrerequisites, getWorkflowState |
| `apps/api/src/modules/vows-merit/altar.service.ts` | createLog, listLogs, getLog, toDto |
| `apps/api/src/modules/vows-merit/altar-management.controller.ts` | listLogs, listTemplates, listItems, listMyItems |
| `apps/web/src/features/vows-merit/queries.ts` | vowListOptions, vowDetailOptions |
| `apps/web/src/features/vows-merit/mutations.ts` | useUpdateVowProgress, useFulfillVow |

## Entry Points

Start here when exploring this area:

- **`vowListOptions`** (Function) — `apps/web/src/features/vows-merit/queries.ts:34`
- **`vowDetailOptions`** (Function) — `apps/web/src/features/vows-merit/queries.ts:42`
- **`useUpdateVowProgress`** (Function) — `apps/web/src/features/vows-merit/mutations.ts:32`
- **`useFulfillVow`** (Function) — `apps/web/src/features/vows-merit/mutations.ts:48`
- **`PhongSanhClient`** (Function) — `apps/web/src/app/(member)/phong-sanh/phong-sanh-client.tsx:6`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `vowListOptions` | Function | `apps/web/src/features/vows-merit/queries.ts` | 34 |
| `vowDetailOptions` | Function | `apps/web/src/features/vows-merit/queries.ts` | 42 |
| `useUpdateVowProgress` | Function | `apps/web/src/features/vows-merit/mutations.ts` | 32 |
| `useFulfillVow` | Function | `apps/web/src/features/vows-merit/mutations.ts` | 48 |
| `PhongSanhClient` | Function | `apps/web/src/app/(member)/phong-sanh/phong-sanh-client.tsx` | 6 |
| `VowListClient` | Function | `apps/web/src/app/(member)/phat-nguyen/vow-list-client.tsx` | 60 |
| `LogLifeReleaseForm` | Function | `apps/web/src/app/(member)/phong-sanh/ghi-lai/log-life-release-form.tsx` | 19 |
| `VowDetailClient` | Function | `apps/web/src/app/(member)/phat-nguyen/[id]/vow-detail-client.tsx` | 31 |
| `adminCreateAssistedEntry` | Method | `apps/api/src/modules/vows-merit/vows-merit.service.ts` | 39 |
| `adminCreateLifeReleaseEntry` | Method | `apps/api/src/modules/vows-merit/vows-merit.service.ts` | 54 |
| `adminGetMemberVows` | Method | `apps/api/src/modules/vows-merit/vows-merit.service.ts` | 70 |
| `findMemberByPublicId` | Method | `apps/api/src/modules/vows-merit/vows-merit.repository.ts` | 46 |
| `createVow` | Method | `apps/api/src/modules/vows-merit/vows-merit.repository.ts` | 53 |
| `createLifeReleaseJournal` | Method | `apps/api/src/modules/vows-merit/vows-merit.repository.ts` | 69 |
| `findVowsByUserId` | Method | `apps/api/src/modules/vows-merit/vows-merit.repository.ts` | 85 |
| `getMemberVows` | Method | `apps/api/src/modules/vows-merit/vows-merit.controller.ts` | 85 |
| `createAssistedEntry` | Method | `apps/api/src/modules/vows-merit/vows-merit.controller.ts` | 93 |
| `createLifeReleaseEntry` | Method | `apps/api/src/modules/vows-merit/vows-merit.controller.ts` | 110 |
| `createVow` | Method | `apps/api/src/modules/vows-merit/vow-member.service.ts` | 18 |
| `updateProgress` | Method | `apps/api/src/modules/vows-merit/vow-member.service.ts` | 36 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `LogLifeReleaseForm → BuildUrl` | cross_community | 5 |
| `LogLifeReleaseForm → HttpError` | cross_community | 5 |
| `VowDetailClient → BuildUrl` | cross_community | 5 |
| `VowDetailClient → HttpError` | cross_community | 5 |
| `PhongSanhClient → BuildUrl` | cross_community | 5 |
| `PhongSanhClient → HttpError` | cross_community | 5 |
| `VowListClient → BuildUrl` | cross_community | 5 |
| `VowListClient → HttpError` | cross_community | 5 |
| `CreateAssistedEntry → BuildAuditLogInput` | cross_community | 4 |
| `CreateLifeReleaseEntry → BuildAuditLogInput` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Engagement | 6 calls |
| Prisma | 6 calls |
| Identity | 2 calls |
| Wisdom-qa | 2 calls |

## How to Explore

1. `gitnexus_context({name: "vowListOptions"})` — see callers and callees
2. `gitnexus_query({query: "vows-merit"})` — find related execution flows
3. Read key files listed above for implementation details

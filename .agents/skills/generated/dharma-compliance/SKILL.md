---
name: dharma-compliance
description: "Skill for the Dharma-compliance area of PMTL_VN. 77 symbols across 19 files."
---

# Dharma-compliance

77 symbols | 19 files | Cohesion: 85%

## When to Use

- Working with code in `apps/`
- Understanding how useSafeReactTable, auditListOptions, templateListOptions work
- Modifying dharma-compliance-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/api/src/modules/dharma-compliance/dharma-compliance.service.ts` | registerVow, getMyVow, logThought, getThoughtLogs, submitGuidanceRequest (+12) |
| `apps/api/src/modules/dharma-compliance/dharma-compliance.repository.ts` | findVowByUserId, createVow, updateVowStatus, createThoughtLog, findThoughtLogs (+9) |
| `apps/api/src/modules/dharma-compliance/dharma-compliance.controller.ts` | respondGuidance, register, getThoughts, requestGuidance, create (+5) |
| `apps/api/src/modules/dharma-compliance/dharma-compliance.mapper.ts` | mapThoughtLogToItem, mapGuidanceToItem, mapCharityToAdminItem, mapCharityToDetail, mapFraudAlertToItem |
| `apps/admin/src/features/dharma-compliance/mutations.ts` | useResolveFraudAlert, useRespondGuidance, useCreateCharity, useUpdateCharityStatus |
| `apps/admin/src/features/dharma-compliance/index.tsx` | FraudAlertsPage, PurityVowsPage, GuidanceQueuePage, CharitiesPage |
| `apps/admin/src/features/dharma-compliance/queries.ts` | fraudAlertListOptions, guidanceQueueOptions, charityListOptions |
| `apps/admin/src/features/sacred-forms/queries.ts` | templateListOptions, applicantListOptions |
| `apps/admin/src/features/sacred-forms/index.tsx` | SacredFormTemplatesPage, SacredFormApplicantsPage |
| `apps/admin/src/features/little-house/queries.ts` | lhListOptions, lhFraudListOptions |

## Entry Points

Start here when exploring this area:

- **`useSafeReactTable`** (Function) — `apps/admin/src/lib/table/use-safe-react-table.ts:14`
- **`auditListOptions`** (Function) — `apps/admin/src/features/system/audit-queries.ts:20`
- **`templateListOptions`** (Function) — `apps/admin/src/features/sacred-forms/queries.ts:14`
- **`applicantListOptions`** (Function) — `apps/admin/src/features/sacred-forms/queries.ts:28`
- **`AuditLogsPage`** (Function) — `apps/admin/src/features/system/audit-logs-page.tsx:18`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `useSafeReactTable` | Function | `apps/admin/src/lib/table/use-safe-react-table.ts` | 14 |
| `auditListOptions` | Function | `apps/admin/src/features/system/audit-queries.ts` | 20 |
| `templateListOptions` | Function | `apps/admin/src/features/sacred-forms/queries.ts` | 14 |
| `applicantListOptions` | Function | `apps/admin/src/features/sacred-forms/queries.ts` | 28 |
| `AuditLogsPage` | Function | `apps/admin/src/features/system/audit-logs-page.tsx` | 18 |
| `SacredFormTemplatesPage` | Function | `apps/admin/src/features/sacred-forms/index.tsx` | 46 |
| `SacredFormApplicantsPage` | Function | `apps/admin/src/features/sacred-forms/index.tsx` | 241 |
| `lhListOptions` | Function | `apps/admin/src/features/little-house/queries.ts` | 13 |
| `lhFraudListOptions` | Function | `apps/admin/src/features/little-house/queries.ts` | 27 |
| `lifeReleaseListOptions` | Function | `apps/admin/src/features/life-liberation/queries.ts` | 12 |
| `speciesSummaryOptions` | Function | `apps/admin/src/features/life-liberation/queries.ts` | 26 |
| `fraudAlertListOptions` | Function | `apps/admin/src/features/dharma-compliance/queries.ts` | 43 |
| `guidanceQueueOptions` | Function | `apps/admin/src/features/dharma-compliance/queries.ts` | 71 |
| `useResolveFraudAlert` | Function | `apps/admin/src/features/dharma-compliance/mutations.ts` | 37 |
| `useRespondGuidance` | Function | `apps/admin/src/features/dharma-compliance/mutations.ts` | 50 |
| `LhRecordsPage` | Function | `apps/admin/src/features/little-house/index.tsx` | 270 |
| `LhFraudQueuePage` | Function | `apps/admin/src/features/little-house/index.tsx` | 407 |
| `LifeReleaseListPage` | Function | `apps/admin/src/features/life-liberation/index.tsx` | 174 |
| `SpeciesSummaryPage` | Function | `apps/admin/src/features/life-liberation/index.tsx` | 240 |
| `EventsListPage` | Function | `apps/admin/src/features/events/index.tsx` | 281 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `ReportViolation → BuildAuditLogInput` | cross_community | 3 |
| `List → FindManyCharities` | intra_community | 3 |
| `List → FindManyFraudAlerts` | intra_community | 3 |
| `List → FindManyVows` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Identity | 6 calls |
| Prisma | 3 calls |

## How to Explore

1. `gitnexus_context({name: "useSafeReactTable"})` — see callers and callees
2. `gitnexus_query({query: "dharma-compliance"})` — find related execution flows
3. Read key files listed above for implementation details

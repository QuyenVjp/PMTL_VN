---
name: engagement
description: "Skill for the Engagement area of PMTL_VN. 46 symbols across 15 files."
---

# Engagement

46 symbols | 15 files | Cohesion: 79%

## When to Use

- Working with code in `apps/`
- Understanding how altarListOptions, gongkeListOptions, repentanceListOptions work
- Modifying engagement-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/web/src/features/engagement/queries.ts` | gongkeListOptions, repentanceListOptions, repentanceByDateOptions, littleHouseListOptions, littleHouseDetailOptions (+4) |
| `apps/api/src/modules/engagement/little-house.service.ts` | nextAllowed, create, startChanting, advance, list (+2) |
| `apps/web/src/features/engagement/mutations.ts` | useUpsertGongke, useCreateLittleHouse, useUpsertRepentance, useAdvanceLittleHouse, useCreateActivationLog |
| `apps/api/src/modules/engagement/repentance.service.ts` | upsertLog, getLog, listLogs, toDto |
| `apps/api/src/modules/engagement/daily-gongke.service.ts` | upsertLog, getLog, listLogs, toDto |
| `apps/web/src/app/(member)/tu-tap/nha-nho/little-house-client.tsx` | LittleHouseClient, CreateHouseForm, AdvanceButton |
| `apps/web/src/features/vows-merit/mutations.ts` | useCreateVow, useAddMeritTransfer, useCreateAltarLog |
| `apps/api/src/modules/engagement/practice-profile.service.ts` | getOrCreate, update, toDto |
| `apps/web/src/lib/api/member-client.ts` | get, post |
| `apps/web/src/features/vows-merit/queries.ts` | altarListOptions |

## Entry Points

Start here when exploring this area:

- **`altarListOptions`** (Function) — `apps/web/src/features/vows-merit/queries.ts:49`
- **`gongkeListOptions`** (Function) — `apps/web/src/features/engagement/queries.ts:68`
- **`repentanceListOptions`** (Function) — `apps/web/src/features/engagement/queries.ts:83`
- **`repentanceByDateOptions`** (Function) — `apps/web/src/features/engagement/queries.ts:91`
- **`littleHouseListOptions`** (Function) — `apps/web/src/features/engagement/queries.ts:98`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `altarListOptions` | Function | `apps/web/src/features/vows-merit/queries.ts` | 49 |
| `gongkeListOptions` | Function | `apps/web/src/features/engagement/queries.ts` | 68 |
| `repentanceListOptions` | Function | `apps/web/src/features/engagement/queries.ts` | 83 |
| `repentanceByDateOptions` | Function | `apps/web/src/features/engagement/queries.ts` | 91 |
| `littleHouseListOptions` | Function | `apps/web/src/features/engagement/queries.ts` | 98 |
| `littleHouseDetailOptions` | Function | `apps/web/src/features/engagement/queries.ts` | 106 |
| `practiceProfileOptions` | Function | `apps/web/src/features/engagement/queries.ts` | 113 |
| `activationListOptions` | Function | `apps/web/src/features/engagement/queries.ts` | 120 |
| `meritSummaryOptions` | Function | `apps/web/src/features/engagement/queries.ts` | 128 |
| `DashboardClient` | Function | `apps/web/src/app/(member)/dashboard/dashboard-client.tsx` | 5 |
| `LittleHouseClient` | Function | `apps/web/src/app/(member)/tu-tap/nha-nho/little-house-client.tsx` | 158 |
| `zodResolver` | Function | `apps/web/src/lib/form.ts` | 9 |
| `useCreateVow` | Function | `apps/web/src/features/vows-merit/mutations.ts` | 15 |
| `gongkeByDateOptions` | Function | `apps/web/src/features/engagement/queries.ts` | 76 |
| `useUpsertGongke` | Function | `apps/web/src/features/engagement/mutations.ts` | 15 |
| `useCreateLittleHouse` | Function | `apps/web/src/features/engagement/mutations.ts` | 55 |
| `GongkeForm` | Function | `apps/web/src/app/(member)/tu-tap/bai-tap/gongke-form.tsx` | 32 |
| `CreateVowForm` | Function | `apps/web/src/app/(member)/phat-nguyen/tao-moi/create-vow-form.tsx` | 35 |
| `useAddMeritTransfer` | Function | `apps/web/src/features/vows-merit/mutations.ts` | 66 |
| `useCreateAltarLog` | Function | `apps/web/src/features/vows-merit/mutations.ts` | 86 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `LogLifeReleaseForm → BuildUrl` | cross_community | 5 |
| `LogLifeReleaseForm → HttpError` | cross_community | 5 |
| `CreateVowForm → BuildUrl` | cross_community | 5 |
| `CreateVowForm → HttpError` | cross_community | 5 |
| `VowDetailClient → BuildUrl` | cross_community | 5 |
| `VowDetailClient → HttpError` | cross_community | 5 |
| `GongkeForm → BuildUrl` | cross_community | 5 |
| `GongkeForm → HttpError` | cross_community | 5 |
| `PhongSanhClient → BuildUrl` | cross_community | 5 |
| `PhongSanhClient → HttpError` | cross_community | 5 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Prisma | 3 calls |
| Api | 2 calls |
| Contact | 2 calls |
| Encryption | 1 calls |

## How to Explore

1. `gitnexus_context({name: "altarListOptions"})` — see callers and callees
2. `gitnexus_query({query: "engagement"})` — find related execution flows
3. Read key files listed above for implementation details

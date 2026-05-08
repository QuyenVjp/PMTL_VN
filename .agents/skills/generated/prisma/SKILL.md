---
name: prisma
description: "Skill for the Prisma area of PMTL_VN. 41 symbols across 11 files."
---

# Prisma

41 symbols | 11 files | Cohesion: 76%

## When to Use

- Working with code in `apps/`
- Understanding how use, createWisdomEntry, createAuthorityProfile work
- Modifying prisma-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/api/prisma/seed.ts` | seedEnvironmentRules, seedDevAdminUser, ensureSeedUsers, seedFeatureFlags, seedPosts (+18) |
| `apps/api/src/modules/content/sutra-interruption.service.ts` | seedSutraMetadata, generateId, generatePublicId, nanoid |
| `apps/api/src/modules/engagement/dream-journal.service.ts` | createDreamEntry, analyzeChildState, createAutoLittleHouseRequirement |
| `apps/api/src/modules/engagement/activation.service.ts` | createLog, listLogs, toDto |
| `apps/api/src/modules/wisdom-qa/wisdom-qa.service.ts` | createWisdomEntry, createAuthorityProfile |
| `apps/api/src/common/middleware/request-id.middleware.ts` | use |
| `apps/api/src/modules/wisdom-qa/wisdom-qa.admin.controller.ts` | createEntry |
| `apps/api/src/modules/vows-merit/vow-member.service.ts` | addMeritTransfer |
| `apps/api/src/modules/vows-merit/altar-management.service.ts` | createItem |
| `apps/api/src/modules/engagement/little-house-cron.service.ts` | checkStaleLittleHouses |

## Entry Points

Start here when exploring this area:

- **`use`** (Method) — `apps/api/src/common/middleware/request-id.middleware.ts:17`
- **`createWisdomEntry`** (Method) — `apps/api/src/modules/wisdom-qa/wisdom-qa.service.ts:92`
- **`createAuthorityProfile`** (Method) — `apps/api/src/modules/wisdom-qa/wisdom-qa.service.ts:189`
- **`createEntry`** (Method) — `apps/api/src/modules/wisdom-qa/wisdom-qa.admin.controller.ts:68`
- **`addMeritTransfer`** (Method) — `apps/api/src/modules/vows-merit/vow-member.service.ts:80`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `use` | Method | `apps/api/src/common/middleware/request-id.middleware.ts` | 17 |
| `createWisdomEntry` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.service.ts` | 92 |
| `createAuthorityProfile` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.service.ts` | 189 |
| `createEntry` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.admin.controller.ts` | 68 |
| `addMeritTransfer` | Method | `apps/api/src/modules/vows-merit/vow-member.service.ts` | 80 |
| `createItem` | Method | `apps/api/src/modules/vows-merit/altar-management.service.ts` | 65 |
| `checkStaleLittleHouses` | Method | `apps/api/src/modules/engagement/little-house-cron.service.ts` | 23 |
| `createDreamEntry` | Method | `apps/api/src/modules/engagement/dream-journal.service.ts` | 36 |
| `analyzeChildState` | Method | `apps/api/src/modules/engagement/dream-journal.service.ts` | 98 |
| `createAutoLittleHouseRequirement` | Method | `apps/api/src/modules/engagement/dream-journal.service.ts` | 131 |
| `createLog` | Method | `apps/api/src/modules/engagement/activation.service.ts` | 16 |
| `listLogs` | Method | `apps/api/src/modules/engagement/activation.service.ts` | 40 |
| `toDto` | Method | `apps/api/src/modules/engagement/activation.service.ts` | 73 |
| `seedSutraMetadata` | Method | `apps/api/src/modules/content/sutra-interruption.service.ts` | 78 |
| `generateId` | Method | `apps/api/src/modules/content/sutra-interruption.service.ts` | 162 |
| `generatePublicId` | Method | `apps/api/src/modules/content/sutra-interruption.service.ts` | 166 |
| `createNameChangeApplication` | Method | `apps/api/src/modules/content/name-change.service.ts` | 26 |
| `seedEnvironmentRules` | Function | `apps/api/prisma/seed.ts` | 312 |
| `seedDevAdminUser` | Function | `apps/api/prisma/seed.ts` | 369 |
| `ensureSeedUsers` | Function | `apps/api/prisma/seed.ts` | 1014 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Main → ReadFlag` | cross_community | 4 |
| `Main → GetDefaultEnabled` | cross_community | 4 |
| `Main → NormalizeRole` | cross_community | 4 |
| `Refresh → Nanoid` | cross_community | 4 |
| `BootstrapAdmin → Nanoid` | cross_community | 4 |
| `CreateEntry → BuildAuditLogInput` | cross_community | 4 |
| `Main → Nanoid` | intra_community | 3 |
| `Login → Nanoid` | cross_community | 3 |
| `CreateEntry → ZodValidationPipe` | cross_community | 3 |
| `CreateEntry → Nanoid` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Identity | 3 calls |
| Seed | 2 calls |
| Wisdom-qa | 1 calls |

## How to Explore

1. `gitnexus_context({name: "use"})` — see callers and callees
2. `gitnexus_query({query: "prisma"})` — find related execution flows
3. Read key files listed above for implementation details

---
name: chanting
description: "Skill for the Chanting area of PMTL_VN. 29 symbols across 4 files."
---

# Chanting

29 symbols | 4 files | Cohesion: 90%

## When to Use

- Working with code in `apps/`
- Understanding how mapGroupToResponse, mapRuleToResponse, getEnvironmentRuleGroup work
- Modifying chanting-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/api/src/modules/content/chanting/chanting.service.ts` | getEnvironmentRuleGroup, adminUpdateEnvironmentRule, mapSeverityToDb, mapProductizationModeToDb, createChantingSession (+9) |
| `apps/api/src/modules/content/chanting/chanting.repository.ts` | findGroupByKey, findRuleByKey, updateRuleByKey, findChantingSessionById, findChantingSessionByIdAdmin (+5) |
| `apps/api/src/modules/content/chanting/chanting.mapper.ts` | mapGroupToResponse, mapSeverity, mapProductizationMode, mapRuleToResponse |
| `apps/api/src/modules/content/chanting/chanting.controller.ts` | updateEnvironmentRule |

## Entry Points

Start here when exploring this area:

- **`mapGroupToResponse`** (Function) — `apps/api/src/modules/content/chanting/chanting.mapper.ts:83`
- **`mapRuleToResponse`** (Function) — `apps/api/src/modules/content/chanting/chanting.mapper.ts:67`
- **`getEnvironmentRuleGroup`** (Method) — `apps/api/src/modules/content/chanting/chanting.service.ts:152`
- **`adminUpdateEnvironmentRule`** (Method) — `apps/api/src/modules/content/chanting/chanting.service.ts:163`
- **`findGroupByKey`** (Method) — `apps/api/src/modules/content/chanting/chanting.repository.ts:19`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `mapGroupToResponse` | Function | `apps/api/src/modules/content/chanting/chanting.mapper.ts` | 83 |
| `mapRuleToResponse` | Function | `apps/api/src/modules/content/chanting/chanting.mapper.ts` | 67 |
| `getEnvironmentRuleGroup` | Method | `apps/api/src/modules/content/chanting/chanting.service.ts` | 152 |
| `adminUpdateEnvironmentRule` | Method | `apps/api/src/modules/content/chanting/chanting.service.ts` | 163 |
| `findGroupByKey` | Method | `apps/api/src/modules/content/chanting/chanting.repository.ts` | 19 |
| `findRuleByKey` | Method | `apps/api/src/modules/content/chanting/chanting.repository.ts` | 49 |
| `updateRuleByKey` | Method | `apps/api/src/modules/content/chanting/chanting.repository.ts` | 56 |
| `updateEnvironmentRule` | Method | `apps/api/src/modules/content/chanting/chanting.controller.ts` | 234 |
| `createChantingSession` | Method | `apps/api/src/modules/content/chanting/chanting.service.ts` | 235 |
| `getChantingSession` | Method | `apps/api/src/modules/content/chanting/chanting.service.ts` | 260 |
| `updateChantingSession` | Method | `apps/api/src/modules/content/chanting/chanting.service.ts` | 278 |
| `deleteChantingSession` | Method | `apps/api/src/modules/content/chanting/chanting.service.ts` | 309 |
| `getChantingSessionAdmin` | Method | `apps/api/src/modules/content/chanting/chanting.service.ts` | 376 |
| `deleteChantingSessionAdmin` | Method | `apps/api/src/modules/content/chanting/chanting.service.ts` | 392 |
| `mapChantingSessionToResponse` | Method | `apps/api/src/modules/content/chanting/chanting.service.ts` | 423 |
| `findChantingSessionById` | Method | `apps/api/src/modules/content/chanting/chanting.repository.ts` | 76 |
| `findChantingSessionByIdAdmin` | Method | `apps/api/src/modules/content/chanting/chanting.repository.ts` | 100 |
| `getUserChantingSessions` | Method | `apps/api/src/modules/content/chanting/chanting.service.ts` | 208 |
| `getAllChantingSessions` | Method | `apps/api/src/modules/content/chanting/chanting.service.ts` | 345 |
| `findChantingSessions` | Method | `apps/api/src/modules/content/chanting/chanting.repository.ts` | 68 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `UpdateChantingSession → BuildAuditLogInput` | cross_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Identity | 4 calls |
| Wisdom-qa | 1 calls |

## How to Explore

1. `gitnexus_context({name: "mapGroupToResponse"})` — see callers and callees
2. `gitnexus_query({query: "chanting"})` — find related execution flows
3. Read key files listed above for implementation details

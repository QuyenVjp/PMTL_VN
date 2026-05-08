---
name: notification
description: "Skill for the Notification area of PMTL_VN. 28 symbols across 4 files."
---

# Notification

28 symbols | 4 files | Cohesion: 92%

## When to Use

- Working with code in `apps/`
- Understanding how mapPushJobToAdminItem, adminGetPushJob, adminCreatePushJob work
- Modifying notification-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/api/src/modules/notification/notification.repository.ts` | findPushJobByPublicId, createPushJob, redriveJob, deletePushJob, findSubscriptionByEndpoint (+6) |
| `apps/api/src/modules/notification/notification.service.ts` | adminGetPushJob, adminCreatePushJob, adminRedrivePushJob, adminDeletePushJob, subscribe (+4) |
| `apps/api/src/modules/notification/notification.controller.ts` | getJob, createJob, redriveJob, deleteJob, listJobs (+2) |
| `apps/api/src/modules/notification/notification.mapper.ts` | mapPushJobToAdminItem |

## Entry Points

Start here when exploring this area:

- **`mapPushJobToAdminItem`** (Function) — `apps/api/src/modules/notification/notification.mapper.ts:6`
- **`adminGetPushJob`** (Method) — `apps/api/src/modules/notification/notification.service.ts:36`
- **`adminCreatePushJob`** (Method) — `apps/api/src/modules/notification/notification.service.ts:44`
- **`adminRedrivePushJob`** (Method) — `apps/api/src/modules/notification/notification.service.ts:65`
- **`adminDeletePushJob`** (Method) — `apps/api/src/modules/notification/notification.service.ts:83`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `mapPushJobToAdminItem` | Function | `apps/api/src/modules/notification/notification.mapper.ts` | 6 |
| `adminGetPushJob` | Method | `apps/api/src/modules/notification/notification.service.ts` | 36 |
| `adminCreatePushJob` | Method | `apps/api/src/modules/notification/notification.service.ts` | 44 |
| `adminRedrivePushJob` | Method | `apps/api/src/modules/notification/notification.service.ts` | 65 |
| `adminDeletePushJob` | Method | `apps/api/src/modules/notification/notification.service.ts` | 83 |
| `findPushJobByPublicId` | Method | `apps/api/src/modules/notification/notification.repository.ts` | 42 |
| `createPushJob` | Method | `apps/api/src/modules/notification/notification.repository.ts` | 49 |
| `redriveJob` | Method | `apps/api/src/modules/notification/notification.repository.ts` | 69 |
| `deletePushJob` | Method | `apps/api/src/modules/notification/notification.repository.ts` | 77 |
| `getJob` | Method | `apps/api/src/modules/notification/notification.controller.ts` | 93 |
| `createJob` | Method | `apps/api/src/modules/notification/notification.controller.ts` | 100 |
| `redriveJob` | Method | `apps/api/src/modules/notification/notification.controller.ts` | 113 |
| `deleteJob` | Method | `apps/api/src/modules/notification/notification.controller.ts` | 126 |
| `subscribe` | Method | `apps/api/src/modules/notification/notification.service.ts` | 134 |
| `findSubscriptionByEndpoint` | Method | `apps/api/src/modules/notification/notification.repository.ts` | 144 |
| `createSubscription` | Method | `apps/api/src/modules/notification/notification.repository.ts` | 150 |
| `reactivateSubscription` | Method | `apps/api/src/modules/notification/notification.repository.ts` | 169 |
| `adminListPushJobs` | Method | `apps/api/src/modules/notification/notification.service.ts` | 20 |
| `findManyPushJobs` | Method | `apps/api/src/modules/notification/notification.repository.ts` | 24 |
| `listJobs` | Method | `apps/api/src/modules/notification/notification.controller.ts` | 86 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `CreateJob → BuildAuditLogInput` | cross_community | 4 |
| `Subscribe → BuildAuditLogInput` | cross_community | 3 |
| `CreateJob → ZodValidationPipe` | cross_community | 3 |
| `CreateJob → CreatePushJob` | intra_community | 3 |
| `CreateJob → MapPushJobToAdminItem` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Identity | 4 calls |
| Wisdom-qa | 1 calls |

## How to Explore

1. `gitnexus_context({name: "mapPushJobToAdminItem"})` — see callers and callees
2. `gitnexus_query({query: "notification"})` — find related execution flows
3. Read key files listed above for implementation details

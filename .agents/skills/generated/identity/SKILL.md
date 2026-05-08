---
name: identity
description: "Skill for the Identity area of PMTL_VN. 114 symbols across 32 files."
---

# Identity

114 symbols | 32 files | Cohesion: 70%

## When to Use

- Working with code in `apps/`
- Understanding how mapFraudToItem, buildAuditLogInput, canUserLogin work
- Modifying identity-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/api/src/modules/identity/identity.service.ts` | logoutAll, login, register, getBootstrapStatus, bootstrapFirstAdmin (+10) |
| `apps/api/src/modules/identity/identity.controller.ts` | bootstrapStatus, me, login, bootstrapAdmin, refresh (+8) |
| `apps/api/src/modules/identity/admin-users.service.ts` | updateProfile, changeRole, blockUser, unblockUser, getAuditHistory (+5) |
| `apps/api/src/modules/wisdom-qa/wisdom-qa.service.ts` | publishWisdomEntry, deleteWisdomEntry, updateAuthorityProfile, deleteAuthorityProfile, suggestSlug (+2) |
| `apps/api/src/modules/content/self-cultivation/self-cultivation.service.ts` | saveOverview, adminCreateGuide, adminUpdateGuide, adminCreateFaq, adminUpdateFaq (+2) |
| `apps/api/src/modules/community/community.service.ts` | createPost, toggleHeart, listComments, createComment, reportPost (+1) |
| `apps/api/src/platform/sessions/sessions.service.ts` | revokeAllUserSessions, createSession, validateRefreshToken, rotateSession, revokeSession |
| `apps/api/src/modules/content/content.service.ts` | publishGuide, unpublishGuide, deleteGuide, adminDeleteDownload, adminPublishDownload |
| `apps/api/src/platform/sessions/sessions.repository.ts` | revokeAllForUser, create, findByRefreshToken, revoke |
| `apps/api/src/modules/identity/admin-users.controller.ts` | block, unblock, auditHistory, practiceStats |

## Entry Points

Start here when exploring this area:

- **`mapFraudToItem`** (Function) — `apps/api/src/modules/little-house/little-house.mapper.ts:37`
- **`buildAuditLogInput`** (Function) — `apps/api/src/platform/audit/audit.service.ts:14`
- **`canUserLogin`** (Function) — `apps/api/src/modules/identity/identity.policy.ts:10`
- **`mapUserToAuthResponse`** (Function) — `apps/api/src/modules/identity/identity.mapper.ts:3`
- **`val`** (Function) — `apps/api/src/modules/identity/identity.service.ts:589`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `ForbiddenError` | Class | `apps/api/src/common/errors/app-error.ts` | 54 |
| `UnauthorizedError` | Class | `apps/api/src/common/errors/app-error.ts` | 44 |
| `mapFraudToItem` | Function | `apps/api/src/modules/little-house/little-house.mapper.ts` | 37 |
| `buildAuditLogInput` | Function | `apps/api/src/platform/audit/audit.service.ts` | 14 |
| `canUserLogin` | Function | `apps/api/src/modules/identity/identity.policy.ts` | 10 |
| `mapUserToAuthResponse` | Function | `apps/api/src/modules/identity/identity.mapper.ts` | 3 |
| `val` | Function | `apps/api/src/modules/identity/identity.service.ts` | 589 |
| `revokeAllUserSessions` | Method | `apps/api/src/platform/sessions/sessions.service.ts` | 61 |
| `revokeAllForUser` | Method | `apps/api/src/platform/sessions/sessions.repository.ts` | 51 |
| `revokeBulk` | Method | `apps/api/src/platform/sessions/admin-sessions.service.ts` | 159 |
| `append` | Method | `apps/api/src/platform/audit/audit.service.ts` | 37 |
| `publishWisdomEntry` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.service.ts` | 147 |
| `deleteWisdomEntry` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.service.ts` | 162 |
| `updateAuthorityProfile` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.service.ts` | 204 |
| `deleteAuthorityProfile` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.service.ts` | 222 |
| `suggestSlug` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.service.ts` | 303 |
| `createTranslationDraft` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.service.ts` | 321 |
| `ensureFeatureEnabled` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.service.ts` | 340 |
| `publishEntry` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.admin.controller.ts` | 106 |
| `deleteEntry` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.admin.controller.ts` | 125 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `BootstrapAdmin → ToCreateData` | cross_community | 6 |
| `DeleteMyAccount → ToCreateData` | cross_community | 6 |
| `ForgotPassword → ToCreateData` | cross_community | 6 |
| `Login → ToCreateData` | intra_community | 5 |
| `UpdatePost → ToCreateData` | cross_community | 5 |
| `AdminCreateGuide → InternalError` | cross_community | 5 |
| `AdminUpdateGuide → InternalError` | cross_community | 5 |
| `AdminCreateFaq → InternalError` | cross_community | 5 |
| `Register → ToCreateData` | intra_community | 5 |
| `DeletePost → ToCreateData` | cross_community | 5 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Prisma | 5 calls |
| Self-cultivation | 5 calls |
| Wisdom-qa | 4 calls |
| Moderation | 3 calls |
| Content | 2 calls |
| Feature-flags | 1 calls |
| Practice-support | 1 calls |

## How to Explore

1. `gitnexus_context({name: "mapFraudToItem"})` — see callers and callees
2. `gitnexus_query({query: "identity"})` — find related execution flows
3. Read key files listed above for implementation details

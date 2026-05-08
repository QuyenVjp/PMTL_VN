---
name: wisdom-qa
description: "Skill for the Wisdom-qa area of PMTL_VN. 95 symbols across 28 files."
---

# Wisdom-qa

95 symbols | 28 files | Cohesion: 85%

## When to Use

- Working with code in `apps/`
- Understanding how ZodValidate, parseQ161RulePackWithMini, mapQ161ForCalendar work
- Modifying wisdom-qa-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/api/src/modules/vows-merit/vows-merit.controller.ts` | listVows, createVow, updateProgress, fulfillVow, addMeritTransfer (+6) |
| `apps/api/src/modules/wisdom-qa/wisdom-qa.admin.controller.ts` | listEntries, updateEntry, duplicateCheck, suggestSlug, createTranslationDraft (+4) |
| `apps/api/src/modules/engagement/engagement.controller.ts` | toggleReaction, toggleBookmark, listLogs, upsertLog, list (+4) |
| `apps/api/src/modules/wisdom-qa/wisdom-qa.service.ts` | listWisdomEntries, updateWisdomEntry, listPublicWisdomEntries, checkDuplicateEntry, getQuestionById (+3) |
| `apps/api/src/modules/community/community.controller.ts` | createPost, listComments, createComment, reportPost, createVolunteer (+1) |
| `apps/api/src/modules/content/self-cultivation/self-cultivation.controller.ts` | getGuideGroup, adminCreateGuide, adminUpdateGuide, adminCreateFaq, adminUpdateFaq (+1) |
| `apps/api/src/modules/content/content.controller.ts` | createPost, updatePost, unpublishPost, createGuide, updateGuide |
| `apps/api/src/modules/wisdom-qa/wisdom-gemini.service.ts` | suggestSlug, draftTranslation, generateJson, extractResponseText, readString |
| `apps/api/src/modules/wisdom-qa/wisdom-qa.controller.ts` | askQuestion, submitAnswer, getQuestion |
| `apps/api/src/modules/notification/notification.controller.ts` | updatePreferences, subscribe, unsubscribe |

## Entry Points

Start here when exploring this area:

- **`ZodValidate`** (Function) — `apps/api/src/common/validation/zod-validation.pipe.ts:42`
- **`parseQ161RulePackWithMini`** (Function) — `apps/api/src/modules/wisdom-qa/q161-rule-pack.mini-schema.ts:36`
- **`mapQ161ForCalendar`** (Function) — `apps/api/src/modules/wisdom-qa/q161-rule-pack.data.ts:101`
- **`mapQ161ForContent`** (Function) — `apps/api/src/modules/wisdom-qa/q161-rule-pack.data.ts:112`
- **`ZodValidationPipe`** (Class) — `apps/api/src/common/validation/zod-validation.pipe.ts:15`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `ZodValidationPipe` | Class | `apps/api/src/common/validation/zod-validation.pipe.ts` | 15 |
| `AppError` | Class | `apps/api/src/common/errors/app-error.ts` | 8 |
| `ValidationError` | Class | `apps/api/src/common/errors/app-error.ts` | 64 |
| `RateLimitError` | Class | `apps/api/src/common/errors/app-error.ts` | 86 |
| `ZodValidate` | Function | `apps/api/src/common/validation/zod-validation.pipe.ts` | 42 |
| `parseQ161RulePackWithMini` | Function | `apps/api/src/modules/wisdom-qa/q161-rule-pack.mini-schema.ts` | 36 |
| `mapQ161ForCalendar` | Function | `apps/api/src/modules/wisdom-qa/q161-rule-pack.data.ts` | 101 |
| `mapQ161ForContent` | Function | `apps/api/src/modules/wisdom-qa/q161-rule-pack.data.ts` | 112 |
| `revokeBulk` | Method | `apps/api/src/platform/sessions/admin-sessions.controller.ts` | 63 |
| `listWisdomEntries` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.service.ts` | 63 |
| `updateWisdomEntry` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.service.ts` | 118 |
| `listPublicWisdomEntries` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.service.ts` | 237 |
| `checkDuplicateEntry` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.service.ts` | 281 |
| `askQuestion` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.controller.ts` | 41 |
| `submitAnswer` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.controller.ts` | 51 |
| `listEntries` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.admin.controller.ts` | 50 |
| `updateEntry` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.admin.controller.ts` | 86 |
| `duplicateCheck` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.admin.controller.ts` | 145 |
| `suggestSlug` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.admin.controller.ts` | 155 |
| `createTranslationDraft` | Method | `apps/api/src/modules/wisdom-qa/wisdom-qa.admin.controller.ts` | 172 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `CreateTranslationDraft → ValidationError` | cross_community | 4 |
| `CreateTranslationDraft → ExtractResponseText` | cross_community | 4 |
| `UpdateEntry → BuildAuditLogInput` | cross_community | 4 |
| `Update → BuildAuditLogInput` | cross_community | 4 |
| `CreateEvent → BuildAuditLogInput` | cross_community | 4 |
| `Update → ZodValidationPipe` | cross_community | 3 |
| `SuggestSlug → ValidationError` | intra_community | 3 |
| `SuggestSlug → ExtractResponseText` | intra_community | 3 |
| `SuggestSlug → Normalize` | cross_community | 3 |
| `BootstrapAdmin → ZodValidationPipe` | cross_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Identity | 3 calls |
| Content | 1 calls |

## How to Explore

1. `gitnexus_context({name: "ZodValidate"})` — see callers and callees
2. `gitnexus_query({query: "wisdom-qa"})` — find related execution flows
3. Read key files listed above for implementation details

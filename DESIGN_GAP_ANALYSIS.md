# PMTL_VN Design Gap Analysis — Verified May 2026

**Scope**: design/03-domains contracts vs. current `apps/api`, `apps/admin`, and shared code.

**Analysis method**: GitNexus query/context plus direct source inspection. No deprecated `corn_*` tools used.

**Last updated**: 2026-05-03

---

## Verified Status

The April 2026 "Top 5 Critical Gaps" list is stale. The highest-risk items it
called missing now have current implementations in the repo. Keep this file as
the current verification snapshot so future agents do not recreate existing
guards, interceptors, or routes.

### 1. Dharma Compliance — Charity Firewall

**Status**: Implemented.

**Evidence**:
- Global registration: `apps/api/src/app.module.ts` registers `CharityFirewallInterceptor` as an `APP_INTERCEPTOR`.
- Interceptor: `apps/api/src/modules/dharma-compliance/interceptors/charity-firewall.interceptor.ts`.
- Service: `apps/api/src/modules/dharma-compliance/services/charity-firewall.service.ts`.
- Detector/tests exist under the dharma-compliance module.
- Community write paths also call `CharityFirewallService.scanContent` directly for silent auto-hide behavior.

**Residual risk**:
- Direct community-service scan plus global interceptor may create duplicate fraud alerts for the same write path. Verify intended behavior before changing either path.
- Repeat-offender escalation exists, but role downgrade/volunteer demotion must be rechecked against current design before claiming full completion.

### 2. Vows & Merit — Assisted Entry Audit Trail

**Status**: Implemented at service/repository route level.

**Evidence**:
- Admin assisted-entry routes exist in `apps/api/src/modules/vows-merit/vows-merit.controller.ts`.
- `VowsMeritService` writes audit metadata with `ownerUserId`, `ownerPublicId`, `actorUserId`, `memberPublicId`, and before/after state for progress.
- Admin UI mutations call `/admin/vows/assisted-entry`, `/admin/vows/assisted-entry/life-release`, and `/admin/vows/assisted-entry/progress`.

**Residual risk**:
- Recovery/recompute from audit trail should still get a targeted verification pass if progress drift is reported.

### 3. Content — Typed Blocks And Environment Rules

**Status**: Implemented for core guide publish validation and chanting environment grouping.

**Evidence**:
- `apps/api/src/modules/content/content.schemas.ts` defines a discriminated `contentBlockSchema` and `typedContentPayloadSchema`.
- `ContentService` enforces typed blocks before guide publish via `parseTypedContentForPublish` and `assertGuideRequiredBlocks`.
- `ChantingService.getEnvironmentRulesPage()` returns grouped rule page data and related guide refs.

**Residual risk**:
- Surface-specific DTO completeness for Little House, Daily Practice, and Life Release should be verified route by route before marking the whole content domain complete.

### 4. Life Liberation — Predatory Species And Habitat Verification

**Status**: Implemented for create/start guard path.

**Evidence**:
- `PredatorySpeciesGuard` exists in `apps/api/src/modules/life-liberation/guards/predatory-species.guard.ts`.
- The guard is wired with `@UseGuards(PredatorySpeciesGuard)` in `life-liberation.controller.ts`.
- Schema includes `habitatVerified` and `habitatSafe`.
- Service also hard-blocks predatory animals without safe habitat verification.
- Guard tests and species blacklist tests exist.

**Residual risk**:
- 30-day follow-up notification and mortality-rate escalation still need a separate verification pass.

### 5. Wisdom-QA — Offline Bundle Recovery, Delta, Duplicate Gate

**Status**: Implemented at route/service level.

**Evidence**:
- Admin duplicate check: `POST /admin/wisdom/entries/duplicate-check`.
- Slug preview: `POST /admin/wisdom/entries/slug-preview`.
- Offline bundle list/rebuild routes exist in `wisdom-qa.admin.controller.ts`.
- Member delta route exists in `wisdom-qa.controller.ts`.
- `WisdomQaService.getOfflineBundleDelta()` returns `isFullSync`, `pendingCount`, `deltaReason`, manifest data, and changes.
- `WisdomQaService.rebuildOfflineBundles()` accepts scoped rebuild input and clears relevant cache keys.

**Residual risk**:
- Search-index replay/reindex behavior should be verified against the actual Meilisearch/search module if drift is observed.

---

## Current Priority Backlog

1. Verify duplicate charity scanning on community post/comment write paths.
2. Verify life-liberation follow-up notifications and mortality escalation.
3. Verify content response DTO completeness for Little House, Daily Practice, and Life Release surfaces.
4. Verify Wisdom-QA search reindex/replay behavior against the search runtime.
5. Remove generated build-info files from git tracking in a dedicated cleanup commit if the team agrees.

---

## Summary Table

| Domain | Current status | Remaining risk |
|---|---|---|
| dharma-compliance | Charity firewall implemented | Possible duplicate scan/alert path; role downgrade verification |
| vows-merit | Assisted-entry audit metadata implemented | Recovery/recompute needs targeted verification |
| content | Typed block publish gate implemented | Route-level DTO completeness still needs audit |
| life-liberation | Predatory guard and habitat checks implemented | Follow-up cron and mortality escalation need verification |
| wisdom-qa | Offline delta/rebuild and duplicate/slug gates implemented | Search replay/reindex needs runtime verification |
| identity | Previously aligned | Recheck only when auth/session code changes |
| community | Previously aligned plus firewall integration | Watch duplicate charity scan behavior |
| calendar/events | Previously aligned | Recheck only when event model changes |

---

## Verification Commands

```bash
pnpm --filter @pmtl/api typecheck
pnpm --filter @pmtl/api test -- charity-firewall
pnpm --filter @pmtl/api test -- predatory-species
py infra/tools/codex_actions.py skill-audit
```

Use GitNexus before editing any current implementation symbol:

```text
gitnexus_query({ query: "target concept" })
gitnexus_context({ name: "TargetSymbol" })
gitnexus_detect_changes({ scope: "all" })
```

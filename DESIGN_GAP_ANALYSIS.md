# PMTL_VN Design Gap Analysis — April 2026

**Scope**: 17 domains analyzed across design/03-domains/ CONTRACTS.md files vs. code implementation in apps/api, apps/admin, packages/shared.

**Analysis Method**: gitnexus_query + gitnexus_context + direct contract/code cross-reference. No corn_* tools used (per policy).

**Last Updated**: 2026-04-06

---

## TOP 5 CRITICAL GAPS

### 1. **Dharma Compliance — Missing CharityFirewallInterceptor (CRITICAL)**
- **Design says**:
  - `CharityFirewallInterceptor` must run on every user-generated content route (posts, comments, chat)
  - Bank account regex detection on all user content before persistence
  - Auto-detect personal accounts; compare against whitelist
  - Auto-delete violating content + audit log + notification
  - 3+ violations in 30 days → escalate to moderation (downgrade VOLUNTEER → MEMBER)
  - Audit log with `eventType`, `userId`, `detectedAccount`, `content` (truncated)

- **Code reality**:
  - Charity whitelist CRUD exists in `dharma-compliance.service.ts` (lines 38–71)
  - Admin routes for charity management implemented
  - **MISSING**: Interceptor that monitors user content streams
  - **MISSING**: Bank account regex detection logic
  - **MISSING**: Content auto-deletion pipeline
  - **MISSING**: Escalation to moderation on repeat violations

- **Severity**: **CRITICAL** — Blocks core dharma compliance enforcement; violates privacy/financial safety rules
- **File paths**:
  - Design: `/design/03-domains/dharma-compliance/CONTRACTS.md` (lines 39–43)
  - Code stub: `/apps/api/src/modules/dharma-compliance/` (no interceptor file)
  - Should integrate with: `/apps/api/src/modules/community/` (posts/comments) and `/apps/api/src/modules/moderation/`

---

### 2. **Vows & Merit — Assisted-Entry Audit Trail Not Canonical (CRITICAL)**
- **Design says**:
  - Assisted-entry (admin support workflow) MUST record both `ownerUserId` AND `actorUserId`
  - Mutable via audit trail only; no silent overwrites
  - If progress downstream conflicts, recovery path is replay/recompute, NOT manual patch
  - Routes: `POST /api/admin/vows/assisted-entry/life-release`, `POST /api/admin/vows/assisted-entry/progress`

- **Code reality**:
  - `vows-merit.service.ts` and `vow-member.service.ts` exist
  - Async services for member + life-release operations found
  - **MISSING**: Explicit audit schema enforcing `ownerUserId` + `actorUserId` pairs
  - **MISSING**: Assisted-entry routes in controller with `@IsAdmin()` guard
  - **MISSING**: Recovery path for progress drift (no recompute logic visible)
  - Admin mutations in `apps/admin/src/features/assisted-entry/mutations.ts` but backend routes unclear

- **Severity**: **CRITICAL** — Breaks audit compliance; enables untracked cross-user edits
- **File paths**:
  - Design: `/design/03-domains/vows-merit/CONTRACTS.md` (lines 56–84)
  - Code: `/apps/api/src/modules/vows-merit/vow-member.service.ts` (264 lines but no audit trail spec)
  - Affected downstream: `/apps/api/src/modules/vows-merit/life-release-member.service.ts`

---

### 3. **Content — Typed Content Blocks (chant scripts, warnings, steps) Not Enforced (HIGH)**
- **Design says**:
  - Little House guides MUST validate `script_block`, `warning_list`, `step_sequence`, `image_compare`, `faq_block` as typed blocks before publish
  - Daily Practice guides require `timePlaceRules`, `warningList`, `sourceReference` validation
  - Life Release guides require `warning blocks` and `checklist` as typed data, not rich text blobs
  - Chanting `environment-rules` must group `(time, place, food-body, posture-hygiene, special-location, non-interpretive)` canonically
  - Each surface (`Ngôi Nhà Nhỏ` / `Kinh Bài Tập` / `Phóng Sanh`) returns DTO with grouped IA + guides + FAQ + downloads, not scattered raw items

- **Code reality**:
  - `content.service.ts` (875 lines) and multiple sub-controllers exist (guides, chanting, life-release, daily-practice, self-cultivation)
  - Admin creates/edits guides via `ContentService`
  - **MISSING**: Zod schema or TypeScript interface enforcing typed blocks for each guide type
  - **MISSING**: Pre-publish validation that blocks save if required fields/blocks are missing
  - **MISSING**: Grouped response DTOs — routes likely return raw editor payloads
  - **MISSING**: Canonical `chanting/environment-rules` grouping before delivery

- **Severity**: **HIGH** — Allows unsafe content delivery; UI must compensate with ad-hoc parsing
- **File paths**:
  - Design: `/design/03-domains/content/CONTRACTS.md` (lines 157–180, 210–217, 328–332)
  - Code: `/apps/api/src/modules/content/content.service.ts` (lines 18–875)
  - Affected routes: `GET /api/content/little-house/*`, `GET /api/content/daily-practice/*`, `GET /api/content/life-release/*`

---

### 4. **Life Liberation — Predatory Species Guard & Habitat Verification Missing (HIGH)**
- **Design says**:
  - Predatory species (cá lóc, cá trê, ba ba hung dữ) are HARD-BLOCK
  - User must verify habitat before start (large deep water, no small fish)
  - "Start" button must be locked completely if habitat unsuitable
  - Predatory releases trigger `LIFE_RELEASE_PREDATORY_SPECIES` audit with `riskLevel: HIGH`
  - Auto follow-up notification after 30 days (cron job)
  - Mortality > 10% → `excessive_loss` alert requiring auditor compensation recommendation

- **Code reality**:
  - `life-liberation` routes exist but no guard implementation visible
  - `life-release-member.service.ts` (132 lines) handles release operations
  - **MISSING**: `PredatorySpeciesGuard` NestJS guard to prevent unsafe releases
  - **MISSING**: Habitat verification schema and validation before `POST /api/life-liberation/releases/:publicId/start`
  - **MISSING**: 30-day follow-up cron job logic
  - **MISSING**: Mortality rate audit calculation and escalation

- **Severity**: **HIGH** — Allows accidental harm to sentient beings; violates dharma safety rules
- **File paths**:
  - Design: `/design/03-domains/life-liberation/CONTRACTS.md` (lines 41–59)
  - Code: `/apps/api/src/modules/life-liberation/` (missing guard file)
  - Related models: `Prisma` schema needs species_predatory_risk and habitat_verification tracking

---

### 5. **Wisdom-QA — Search/Offline Bundle Recovery Path Not Implemented (HIGH)**
- **Design says**:
  - If search or offline bundle drift occurs, recovery path is **replay signal, reindex or rebuild from source records**
  - Offline bundles must support incremental delta; if server doesn't have history, return `isFullSync: true` but still 200 OK
  - `POST /api/admin/wisdom/offline-bundles/rebuild` must accept target bundle family or scope
  - Duplicate detection + slug collision handling must be canonical before import
  - Machine translation creates `draft` only; PMTL review gate publishes

- **Code reality**:
  - `wisdom-qa.service.ts` (346 lines) with admin controller
  - Offline bundle routes exist in design but implementation unclear
  - **MISSING**: Replay/reindex recovery logic when search index diverges
  - **MISSING**: Incremental delta manifest with `isFullSync` flag
  - **MISSING**: Scope specification in rebuild endpoint (likely all-or-nothing)
  - **MISSING**: Canonical duplicate-check + slug-preview as gate before draft creation

- **Severity**: **HIGH** — Offline users get stale data; no way to recover consistency
- **File paths**:
  - Design: `/design/03-domains/wisdom-qa/CONTRACTS.md` (lines 100–251)
  - Code: `/apps/api/src/modules/wisdom-qa/wisdom-qa.service.ts` (lines 29–346)
  - Routes: `GET /api/offline-bundles/:publicId/delta`, `POST /api/admin/wisdom/offline-bundles/rebuild`

---

## 3 DOMAINS MATCHING DESIGN WELL

### ✅ **Identity/Auth (identity)**
- **Why aligned**:
  - Auth bootstrap route `GET /api/auth/me` returns `AuthSessionStateDto` with required fields: user, session, permissions, securityFlags[], mustRefreshBefore
  - Session authority properly rooted in `users` + `sessions` tables (not frontend)
  - Reset token rules enforced: expiry window, one-time use, invalidation on success
  - All error codes match contract (`auth.invalid_credentials`, `auth.session_expired`, etc.)
  - Schemas validated at `packages/shared/src/schemas/auth.ts`
- **File paths**:
  - `/apps/api/src/modules/identity/identity.service.ts` (632 lines)
  - `/apps/api/src/modules/identity/identity.controller.ts` (351 lines)
  - Strong compliance on routes + response shapes

---

### ✅ **Community (Posts, Comments, Guestbook)**
- **Why aligned**:
  - Canonical write paths separate: `communityPosts`, `communityComments`, `guestbookEntries` own their records
  - Heart toggle is idempotent per actor+target; counter is read-model
  - Moderation reports go to separate `ModerationReport` collection (not merged into community entity)
  - Guestbook approval summary on `guestbookEntries`; report truth stays in moderation
  - Admin + moderation integration clear via `AdminCommunityController` and `ModerationService`
  - Privacy rules enforced: no streak/progress leakage to public
- **File paths**:
  - `/apps/api/src/modules/community/community.service.ts` (458 lines)
  - `/apps/api/src/modules/community/community.controller.ts` (345 lines)
  - `/apps/api/src/modules/moderation/moderation.service.ts` (306 lines)
  - Separation of concerns is clean

---

### ✅ **Calendar & Events**
- **Why aligned**:
  - Lunar/solar calendar events modeled as first-class records
  - Teaching discourses, observances, agenda items have proper ownership
  - Admin workspace routes defined (create, update, publish)
  - Event + AgendaItem relationship is explicit
  - Admin controller has overview + CRUD routes
- **File paths**:
  - `/apps/api/src/modules/calendar/calendar.service.ts` (296 lines)
  - `/apps/api/src/modules/calendar/calendar.controller.ts` (211 lines)
  - `/apps/api/src/modules/events/events.service.ts` (121 lines)
  - Alignment: solid; no major contract violations observed

---

## REFACTOR ROADMAP (Priority Order)

### Phase 1: Compliance & Safety (Weeks 1–2)

**1. Implement CharityFirewallInterceptor** (BLOCKS dharma-compliance.HIGH.1)
  - Create: `/apps/api/src/modules/dharma-compliance/charity-firewall.interceptor.ts`
  - Implement: Bank account regex detection on user-generated content (posts, comments)
  - Logic:
    - Extract all content strings from incoming request
    - Apply regex patterns for Vietnamese & international bank accounts
    - Normalize detected accounts (strip spaces/dashes)
    - Validate against `CharityWhitelist` whitelist + `approved_accounts`
    - If personal account found: auto-delete content, create audit log, send notification
    - Track violations per user; escalate to moderation on 3+ in 30 days
  - Integration point: Hook into `CommunityController`, `PostController` write paths
  - Test: Bank account detection accuracy, false positive handling, audit log completeness
  - Depends on: Charity whitelist already canonical (CONFIRMED)

**2. Implement PredatorySpeciesGuard** (BLOCKS life-liberation.HIGH.5)
  - Create: `/apps/api/src/modules/life-liberation/predatory-species.guard.ts`
  - Data model: Add fields to Prisma `LifeRelease`: `species_predatory_risk`, `habitat_verified`, `habitat_description`
  - Logic:
    - On `POST /api/life-liberation/releases/:publicId/start`: check if species in predatory list
    - If yes: require `habitat_verified: true` + validation message before allowing state transition
    - Lock "Start" button if habitat unsuitable (deep: <5m, area: <1000m², or has small fish)
    - Log: `LIFE_RELEASE_PREDATORY_SPECIES` audit with `riskLevel: HIGH`
  - Follow-up: Cron job queries predatory releases with `startedAt > now - 31 days`; send notification
  - Test: Block on missing verification, allow on valid, audit completeness
  - Depends on: Species metadata canonical (CONFIRM via getnexus_context)

**3. Migrate Vows Assisted-Entry to Audit Trail** (BLOCKS vows-merit.CRITICAL.2)
  - Refactor: `/apps/api/src/modules/vows-merit/vow-admin.service.ts` (create new)
  - Schema: Add `VowAuditEntry` with `ownerUserId`, `actorUserId`, `supportReason`, `action`, `before/after` snapshots
  - Routes: Define canonical assisted-entry routes with `@IsAdmin()` + `@Audit()` guards:
    - `POST /api/admin/vows/assisted-entry/life-release` (admin creates on behalf of member)
    - `POST /api/admin/vows/assisted-entry/progress` (admin logs progress correction)
    - Both append audit with both user IDs
  - Recovery: If progress diverges, query audit trail + recompute progress from `VowAuditEntry` source
  - Test: Audit completeness, recovery path integrity, member data not overwritten without audit
  - Depends on: Vows domain already modeled

---

### Phase 2: Content & Data Quality (Weeks 3–4)

**4. Enforce Typed Content Blocks** (BLOCKS content.HIGH.3)
  - Create schemas: `LittleHouseGuideBlockSchema`, `DailyPracticeGuideBlockSchema`, `LifeReleaseGuideBlockSchema`
  - Validation:
    - Little House: `script_block[]`, `warning_list[]`, `step_sequence[]`, `image_compare[]`, `faq_block[]`
    - Daily Practice: `scenarioPreset[]`, `timePlaceRules{}`, `warningList[]`, `sourceReference`
    - Life Release: `ritualVariant[]`, `warning_blocks[]`, `preparation_checklist[]`, `faq[]`
  - Pre-publish gate: Block save if any required block type missing
  - Response DTOs: Return `LittleHouseGuideResponseDto` with `{ guides[], caseVariants[], faq, downloads, groupedBySection }`
  - Test: Block save on schema violation, DTO completeness, no raw editor blobs in response
  - Depends on: Content service refactor

**5. Implement Canonical Chanting Environment Rules** (PART of content.HIGH.3)
  - Create: `/apps/api/src/modules/content/chanting/environment-rules.grouper.ts`
  - Logic:
    - Query all `ChantEnvironmentRule` records
    - Group by `category`: `time`, `place`, `food-body`, `posture-hygiene`, `special-location`, `non-interpretive`
    - Return as `{ categoryGroups: { [key]: { rules: [] } } }`
  - Route: `GET /api/content/chanting/environment-rules` → grouped response (not flat array)
  - Single source: All surfaces (guides, daily practice, life release) reference this canonical grouping
  - Test: Grouping correctness, no drift between surfaces
  - Depends on: Environment rule records canonical

**6. Implement Wisdom-QA Recovery Path** (BLOCKS wisdom-qa.HIGH.5)
  - Create: `/apps/api/src/modules/wisdom-qa/offline-bundle-recovery.service.ts`
  - Logic:
    - On drift detection: Query source `WisdomEntry` + `BaihuaBookEntry` records
    - Replay publish events from source audit trail
    - Reindex Meilisearch or rebuild offline bundle manifest
    - Return: `{ recoveryStartedAt, estimatedCompletionTime, affectedBundles }` (202 status)
  - Delta endpoint: `GET /api/offline-bundles/:publicId/delta` returns `{ isFullSync, version, manifest, pendingCount }`
  - Rebuild scope: Accept `?bundleFamily=baihua|wisdom|practices` to target subset
  - Test: Drift recovery accuracy, incremental vs full sync distinction, no data loss
  - Depends on: Offline bundle infra already exists

---

### Phase 3: Audit & Policy (Weeks 5–6)

**7. Complete Audit Trail Integration**
  - Add audit context to all domain services (vows, life-liberation, content, wisdom-qa, community, calendar)
  - Standardize: Every write must append audit log before commit
  - Implement: Recovery CLI scripts for each domain (`pnpm audit:recover -- --domain vows`)
  - Test: Audit log completeness, recovery path end-to-end

**8. Policy & Permission Enforcement**
  - Complete: `/apps/api/src/modules/dharma-compliance/dharma-compliance.policy.ts` (currently 818 bytes)
  - Rules: Charity whitelist checking on all donation/fundraising flows
  - Admin scope boundaries: Verify no admin has blanket read/write on self-owned records without audit

---

## IMPLEMENTATION CHECKLIST

### Pre-commit for each domain fix:
- [ ] `gitnexus_impact({target: "newInterceptor", direction: "upstream"})` to verify scope
- [ ] Unit tests (80%+ coverage) for new logic
- [ ] Integration test with real data
- [ ] Audit log completeness verification
- [ ] No console.log or hardcoded secrets
- [ ] TypeScript strict mode passes
- [ ] `just verify-cms` (backend verification) passes
- [ ] Commit message references design contract + file path

### Cross-domain tests:
- [ ] Community post creation doesn't bypass charity firewall
- [ ] Vows admin assisted-entry creates complete audit trail
- [ ] Life release predatory species blocks appropriately
- [ ] Content publish validates all typed blocks
- [ ] Offline bundle rebuild recovers from drift

---

## SUMMARY TABLE

| Domain | Critical Gap | High Gap | Medium Gap | Aligned |
|--------|---------|---------|---------|---------|
| dharma-compliance | CharityFirewall missing | Fraud alert escalation incomplete | Bank account regex patterns | Charity CRUD |
| vows-merit | Assisted-entry audit trail | Recovery path missing | — | Core vow tracking |
| identity | — | — | — | ✅ Auth bootstrap + session |
| content | — | Typed blocks not enforced | Environment rules not grouped | Post/guide CRUD |
| life-liberation | — | Predatory species guard missing | Mortality audit incomplete | Release CRUD |
| wisdom-qa | — | Offline recovery path missing | Duplicate detection scope unclear | Entry CRUD |
| community | — | — | — | ✅ Post/comment/guestbook |
| calendar | — | — | — | ✅ Events & agenda |
| identity | — | — | — | ✅ Auth & sessions |

---

## DESIGN-TO-CODE MAPPING

All gaps reference exact file paths per gitnexus findings. To investigate further:

```bash
# Check impact of new dharma-compliance interceptor
gitnexus_impact({target: "CharityFirewallInterceptor", direction: "upstream"})

# Verify vows audit trail implementation
gitnexus_context({name: "VowsMeritService"})

# Analyze life-liberation predatory species reach
gitnexus_impact({target: "PredatorySpeciesGuard", direction: "downstream"})

# Test content block schema enforcement
gitnexus_query({query: "typed content blocks guide validation"})
```

---

**Next Action**: Start Phase 1 Week 1 with CharityFirewallInterceptor (CRITICAL, unblocks dharma compliance audit). Parallel-path PredatorySpeciesGuard (CRITICAL, safety-critical). Both enable design intent enforcement by end of Q2.

# PMTL_VN Design Implementation Roadmap

**Date**: 2026-04-06
**Scope**: All 17 domains across design/03-domains/
**Analysis Method**: GitNexus + manual design/code cross-reference (NO corn_* tools per policy)

---

## Executive Summary

**Total Gaps**: 100+ missing endpoints across 17 domains

| Severity | Count | Domains |
|----------|-------|---------|
| **CRITICAL** | 7 | Dharma, Content, Life-Liberation, Wisdom-QA, Events, Little-House, Altar-Management |
| **HIGH** | 7 | Vows-Merit, Calendar, Search, Engagement, Sacred-Forms, (Community MEDIUM), (Identity MEDIUM) |
| **MEDIUM** | 3 | Community, Identity, Notification |
| **LOW** | 2 | Contact, Moderation |

---

## Implementation Priority Order (By Severity + Blast Radius)

### **TIER 1: Safety-Critical (Weeks 1-4)**

#### 1.1 CharityFirewallInterceptor (Dharma-Compliance) — CRITICAL
**Why First**: Protects community from financial fraud; ethical/legal requirement.

**What to Build**:
- `apps/api/src/modules/dharma-compliance/charity-firewall.interceptor.ts` — NestJS global interceptor
  - Bank account regex detection on all user-generated content (posts, comments, chat)
  - Cross-reference against charity whitelist
  - Auto-delete + audit log + notification on violation
  - Recidivism tracking (3+ in 30 days → demote VOLUNTEER → MEMBER)
- Routes: Add `GET /api/dharma-compliance/approved-accounts`, `GET /api/admin/dharma-compliance/status`, admin rules CRUD

**Files to Create/Modify**:
- CREATE: `charity-firewall.interceptor.ts`
- CREATE: `dharma-compliance.policy.ts` (if not exists)
- MODIFY: `dharma-compliance.controller.ts` (add missing routes)
- MODIFY: `dharma-compliance.service.ts` (add recidivism logic)
- MODIFY: `apps/api/src/app.module.ts` (register interceptor globally)

**Dependencies**: None (standalone)
**Estimated Effort**: 3-4 days

---

#### 1.2 PredatorySpeciesGuard (Life-Liberation) — CRITICAL
**Why Second**: Animal welfare safety; prevents accidental harm to sentient beings.

**What to Build**:
- `apps/api/src/modules/life-liberation/predatory-species.guard.ts` — NestJS guard with hard block
  - Whitelist: cá lóc, cá trê, ba ba hung dữ (hard-block)
  - Habitat verification REQUIRED before "Start" button unlocks
  - 30-day follow-up cron job for predatory releases
  - Mortality audit system (>10% threshold → escalation)
- Routes: Add species CRUD, candidate/dedication/audit management, status dashboard

**Files to Create/Modify**:
- CREATE: `predatory-species.guard.ts`
- CREATE: `life-liberation-cron.service.ts`
- MODIFY: `life-liberation.controller.ts` (add ~15 routes)
- MODIFY: `life-liberation.service.ts` (add mortality audit, anonymity modes)
- MODIFY: `apps/api/prisma/schema.prisma` (add tables: species_predatory_risk, habitat_verification, life_release_audits)

**Dependencies**: None (standalone)
**Estimated Effort**: 4-5 days

---

#### 1.3 Outbox Event Pattern (Cross-Cutting) — CRITICAL
**Why Third**: Foundation for reliable async signals across vows-merit, content, wisdom-qa.

**What to Build**:
- `apps/api/src/platform/outbox/` — Event sourcing infrastructure
  - `outbox.service.ts` — append events
  - `outbox.processor.ts` — background dispatcher
  - Database table: `outbox_events`
  - Error recovery + replay logic

**Files to Create/Modify**:
- CREATE: `apps/api/src/platform/outbox/outbox.service.ts`
- CREATE: `apps/api/src/platform/outbox/outbox.processor.ts`
- MODIFY: `apps/api/prisma/schema.prisma` (add outbox_events table)
- MODIFY: `apps/api/src/app.module.ts` (register processor as provider)

**Dependencies**: None (but unblocks vows-merit, content, wisdom-qa)
**Estimated Effort**: 2-3 days

---

### **TIER 2: Core Features (Weeks 5-8)**

#### 2.1 Content Editorial Workspaces — CRITICAL
**Why**: Largest admin surface gap; blocks editorial workflow.

**What to Build**:
- 7 dedicated workspace controllers (little-house, daily-practice, life-release, sutra, hub-pages, baihua, media-upload)
- Grouped public IA delivery (guideMap, FAQ, downloads, variants)
- Typed content block validation (script_block, warning_list, step_sequence, etc.)
- Signed upload contract for media

**Files to Create/Modify**:
- CREATE: `apps/api/src/modules/content/little-house/` (controller, service, schemas, repository)
- CREATE: `apps/api/src/modules/content/daily-practice/` (controller, service, schemas)
- CREATE: `apps/api/src/modules/content/life-release-content/` (controller, service)
- CREATE: `apps/api/src/modules/content/sutra/` (controller, service, hierarchy logic)
- CREATE: `apps/api/src/modules/content/hub-pages/` (controller)
- CREATE: `apps/api/src/modules/content/media-upload.controller.ts`
- MODIFY: `content.schemas.ts` (add typed block schemas)
- MODIFY: `apps/api/prisma/schema.prisma` (verify all content tables exist)

**Dependencies**: Outbox (for publish events)
**Estimated Effort**: 8-10 days

---

#### 2.2 Events Monetization + Violations — CRITICAL
**Why**: Compliance + revenue tracking; large gap (~18 endpoints).

**What to Build**:
- Monetization rules CRUD (pricing, fundraising blocks)
- Violations CRUD with escalation (summary, acknowledge, resolve)
- Life-liberation state machine for fundraising events
- `price = 0` ZeroMonetizationEventGate
- Admin status dashboard

**Files to Create/Modify**:
- CREATE: `apps/api/src/modules/events/monetization-rules.controller.ts`
- CREATE: `apps/api/src/modules/events/violations.controller.ts`
- CREATE: `apps/api/src/modules/events/events-compliance.service.ts`
- MODIFY: `events.controller.ts` (add publish/unpublish, status, upcoming routes)
- MODIFY: `events.service.ts` (integrate monetization, violation logic)
- MODIFY: `apps/api/prisma/schema.prisma` (add monetization_rules, event_violations tables)

**Dependencies**: None (but coordinate with notification)
**Estimated Effort**: 6-8 days

---

#### 2.3 Little-House Granular Lifecycle + Admin — CRITICAL
**Why**: Complex state machine; core engagement feature.

**What to Build**:
- Granular endpoints: start-recitation, update-recitation, dotting-sessions, confirm-combustion
- Metadata immutability after start
- Dotting geometric algorithm
- Combustion safety checklist
- Admin surface: list/detail, recitations, dotting, combustion per NNN, fraud management
- Admin status + completion stats

**Files to Create/Modify**:
- CREATE: `apps/api/src/modules/engagement/little-house.controller.ts` (dedicated or extend existing)
- CREATE: `apps/api/src/modules/engagement/little-house-fraud.service.ts`
- MODIFY: `little-house.service.ts` (replace advance with granular transitions)
- MODIFY: `little-house-burn.service.ts` (add combustion checklist)
- MODIFY: `apps/api/prisma/schema.prisma` (add fraud tracking, dotting session schema)

**Dependencies**: None
**Estimated Effort**: 7-9 days

---

#### 2.4 Wisdom-QA Baihua + Offline Bundles — CRITICAL
**Why**: Major content vertical with zero implementation.

**What to Build**:
- Baihua audiobook system (book selector, chapters, audio refs, import, translation, publish)
- Offline bundle management (rebuild, delta sync with `isFullSync` flag, device fingerprint)
- Import jobs management
- Public WisdomHubDto with tabCounts, filterFacets

**Files to Create/Modify**:
- CREATE: `apps/api/src/modules/wisdom-qa/baihua/` (controller, service, schemas)
- CREATE: `apps/api/src/modules/wisdom-qa/offline-bundles/` (controller, service)
- CREATE: `apps/api/src/modules/wisdom-qa/import-jobs/` (controller, service)
- MODIFY: `wisdom-hub.controller.ts` (return rich `WisdomHubDto`)
- MODIFY: `wisdom-qa.schemas.ts` (add source provenance, review status enums)
- MODIFY: `apps/api/prisma/schema.prisma` (add baihuaBooks, audioTracks, offlineBundles tables)

**Dependencies**: Outbox (for publish events)
**Estimated Effort**: 8-10 days

---

### **TIER 3: Secondary Features (Weeks 9-12)**

#### 3.1 Sacred-Forms Burn + Probation — HIGH
**Files to Create/Modify**:
- CREATE: `apps/api/src/modules/sacred-forms/sacred-forms-probation.service.ts`
- MODIFY: `sacred-forms.controller.ts` (add ~15 missing endpoints)
- MODIFY: `sacred-forms.service.ts` (burn time/weather gate, 100-day auto-unlock cron)
- Estimated Effort: 5-6 days

---

#### 3.2 Engagement Practice Sheets + Reading Progress — HIGH
**Files to Create/Modify**:
- MODIFY: `engagement.controller.ts` (add practice-sheets, reading-progress endpoints)
- CREATE: `apps/api/src/modules/engagement/practice-sheets.service.ts`
- Estimated Effort: 4-5 days

---

#### 3.3 Calendar Advisory + Personal Practice — HIGH
**Files to Create/Modify**:
- MODIFY: `calendar.controller.ts` (add daily advisory, personal-practice routes)
- CREATE: `calendar-advisory.service.ts`, `calendar-personal-practice.service.ts`
- MODIFY: `apps/api/prisma/schema.prisma` (lunar overrides, personal practice models)
- Estimated Effort: 4-5 days

---

#### 3.4 Altar-Management Ceremony Validation — CRITICAL
**Files to Create/Modify**:
- EXTRACT: Move marital purity vow logic from dharma-compliance to separate module
- CREATE: `altar-ceremony-validation.service.ts` (water temp, metal container, incense count)
- MODIFY: `altar-management.controller.ts` (add 4 validation routes)
- Estimated Effort: 3-4 days

---

### **TIER 4: Refinements (Weeks 13-16)**

#### 4.1 Community Comment Hearts + Reports — MEDIUM
**Files to Create/Modify**:
- MODIFY: `community.controller.ts` (split heart into POST/DELETE, add comment hearts/reports)
- Estimated Effort: 2 days

---

#### 4.2 Search QA Endpoint + Security Fix — HIGH
**Files to Create/Modify**:
- **SECURITY**: Move `POST reindex` from public to admin controller (line 24-29)
- ADD: `GET /api/qa/search` route
- MODIFY: Response with `engine`, `tabCounts`, `filterFacets` meta
- Estimated Effort: 2 days

---

#### 4.3 Identity AuthSessionStateDto — MEDIUM
**Files to Create/Modify**:
- VERIFY: `/auth/me` returns full shape (permissions, securityFlags[], mustRefreshBefore, session metadata)
- Estimated Effort: 1 day

---

#### 4.4 Notification Reminders + Rich DTO — MEDIUM
**Files to Create/Modify**:
- ADD: `GET/PATCH /notifications/reminders/practice`, `GET/PATCH /notifications/reminders/events`
- ENHANCE: preferences response with `NotificationPreferencesPageDto` richness
- Estimated Effort: 2 days

---

#### 4.5 Vows-Merit Context Refs + Void — HIGH
**Files to Create/Modify**:
- ADD: context ref fields (guideContextRef, ritualVariantRef, advisoryContextRef) with snapshots
- ADD: source snapshot preservation (sourcePublicId, sourceKind, sourceVersion)
- ADD: void with downstream check logic
- ADD: practice rule storage (source URL, quote, translation, review status)
- Estimated Effort: 4-5 days

---

### **TIER 5: Low-Priority (Weeks 17+)**

#### 5.1 Contact Sort + Permission Tweaks — LOW
**Estimated Effort**: 1 day

#### 5.2 Moderation Comment Detail + Summary Sync — LOW
**Estimated Effort**: 1 day

---

## Cross-Cutting Requirements

| Requirement | Affected Domains | Priority |
|-------------|-----------------|----------|
| Outbox event pattern | vows-merit, content, wisdom-qa | CRITICAL (Tier 1) |
| Route path standardization | all domains | MEDIUM (during implementation) |
| Scope cleanup (marital purity from dharma) | dharma-compliance, altar-management | HIGH (Tier 1) |
| Zod schema expansion | all domains | ONGOING |
| Prisma schema updates | all domains | ONGOING |
| NestJS guard/policy creation | dharma, life-liberation, sacred-forms | CRITICAL (Tier 1-2) |

---

## Estimated Timeline

| Tier | Weeks | Domains | Effort (person-days) |
|------|-------|---------|----------------------|
| **Tier 1** (Safety-Critical) | 1-4 | Dharma, Life-Liberation, Outbox | 12-15 |
| **Tier 2** (Core Features) | 5-8 | Content, Events, Little-House, Wisdom-QA | 30-40 |
| **Tier 3** (Secondary) | 9-12 | Sacred-Forms, Engagement, Calendar, Altar | 16-20 |
| **Tier 4** (Refinements) | 13-16 | Community, Search, Identity, Notification | 8-10 |
| **Tier 5** (Low-Priority) | 17+ | Contact, Moderation | 2-3 |
| **TOTAL** | | **17 domains** | **68-88 person-days** |

**Team Capacity**: Adjust timeline based on team size.

---

## Pre-Implementation Checklist

- [ ] Approve Tier 1-3 prioritization
- [ ] Create dedicated branch per domain (or per tier)
- [ ] Assign owners to each domain
- [ ] Set up git workflow (PR review checklist per AGENTS.md)
- [ ] Run `npx gitnexus analyze` after each major domain to update graph
- [ ] Schedule cross-domain integration tests (Tier 2+)
- [ ] Plan database migration strategy for new tables

---

## References

- Full phase analysis: `DESIGN_GAP_ANALYSIS.md`
- CLAUDE.md: GitNexus tools + NestJS Hybrid Protocol
- AGENTS.md: deprecated `corn_*` tools removed from active workflow, GitNexus-first enforcement

---

**Last Updated**: 2026-04-06
**Analysis by**: GitNexus + architecture subagent
**Next Action**: Start Tier 1 implementation

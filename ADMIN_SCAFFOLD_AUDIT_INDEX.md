# Admin Scaffold Audit — Complete Deliverables Index

**Audit Date**: 2026-03-22  
**Scope**: Content & Community feature groups under `/admin/noi-dung/*` and `/admin/cong-dong/*`  
**Canon Sources**: 5 design documents verified and in scope  
**Generated**: 4 structured artifacts

---

## Deliverables

### 1. **ADMIN_SCAFFOLD_AUDIT.md** (24 KB)
**Type**: Comprehensive specification document  
**Audience**: Developers, architects, module owners  
**Contents**:
- Executive summary (3 CRITICAL blockers)
- Feature-by-feature detailed spec (9 features):
  - Query key families
  - Required query functions
  - Required mutation functions
  - Invalidation rules
  - Blockers per feature
- Invalidation rules matrix
- CRITICAL blockers deep dive (API coverage, public cache, dashboard)
- High-impact findings (role narrowing, factory pattern, coordination)
- Feature flag dependencies table
- Implementation sequence recommendation (3 phases)
- Query/mutation skeleton code reference
- Documentation cross-references

**Use This For**:
- Understanding complete requirements before implementation
- Reviewing scaffold completeness
- Tracking blocker resolution
- Designing query/mutation structure

---

### 2. **ADMIN_SCAFFOLD_AUDIT_SUMMARY.txt** (11 KB)
**Type**: Quick reference checklist  
**Audience**: Developers implementing Phase 1–3  
**Contents**:
- Feature inventory table (9 features with status)
- Queries.ts implementation checklist
- Mutation functions matrix (what each feature needs)
- CRITICAL blockers summary table
- High-impact constraints reference
- Invalidation rules summary
- Implementation sequence timeline
- Common pitfalls to avoid (do's/don'ts examples)
- Feature flag verification guide
- API routes reference (already defined vs. missing)

**Use This For**:
- Daily development reference
- Implementation checklist validation
- Quick decision-making on edge cases
- Onboarding new team members

---

### 3. **ADMIN_SCAFFOLD_FINDINGS_MATRIX.txt** (11 KB)
**Type**: Visual findings and decision matrix  
**Audience**: Tech leads, architects, stakeholders  
**Contents**:
- CRITICAL blockers (3) — boxed visual format
- HIGH-impact constraints (7) with rules and violations
- Feature status matrix (9 features at a glance)
- Implementation phases (timeline and blockers)
- Quick decisions (FAQ-style guidance on ambiguous questions)

**Use This For**:
- Stakeholder briefing
- Phase planning and unblocking decisions
- Architecture review
- Risk assessment

---

### 4. **ADMIN_SCAFFOLD_AUDIT.json** (8 KB)
**Type**: Structured data export  
**Audience**: CI/CD pipelines, code generators, dashboards  
**Contents**:
- 9 feature objects with:
  - id, featureFolder, adminPageRoute
  - role, apiOwner
  - queryKeyFamily (array)
  - requiredQueryFunctions (array)
  - requiredMutationFunctions (array)
  - blockers (string)
  - status (unblocked | blocked | caution)

**Use This For**:
- Automated scaffold generation
- Dashboard/tracking tools
- API contract generation
- CI/CD pipeline input

---

## Quick Navigation

### By Role

**👨‍💻 Implementing Developer (Phase 1)**
```
1. Start: ADMIN_SCAFFOLD_AUDIT_SUMMARY.txt § "Phase 1 — START NOW"
2. Reference: ADMIN_SCAFFOLD_AUDIT.md § "Posts" (detailed spec)
3. Check: Common pitfalls section
4. Code: Use skeleton from ADMIN_SCAFFOLD_AUDIT.md § "Query & Mutation Skeleton"
```

**🏗️ Tech Lead (Planning Phases)**
```
1. Overview: ADMIN_SCAFFOLD_FINDINGS_MATRIX.txt § "CRITICAL BLOCKERS"
2. Timeline: ADMIN_SCAFFOLD_AUDIT_SUMMARY.txt § "Implementation Sequence"
3. Decisions: ADMIN_SCAFFOLD_FINDINGS_MATRIX.txt § "QUICK DECISIONS"
4. Details: ADMIN_SCAFFOLD_AUDIT.md as reference
```

**📊 Stakeholder/PM (High-Level Status)**
```
1. Summary: ADMIN_SCAFFOLD_AUDIT.md § "Executive Summary"
2. Blockers: ADMIN_SCAFFOLD_FINDINGS_MATRIX.txt § "CRITICAL BLOCKERS"
3. Timeline: ADMIN_SCAFFOLD_AUDIT_SUMMARY.txt § "Feature Inventory" table
4. Risks: ADMIN_SCAFFOLD_FINDINGS_MATRIX.txt § "HIGH-IMPACT CONSTRAINTS"
```

**🔧 Module Owner (API, Platform, Content, etc.)**
```
1. Your Blockers: Find your module in ADMIN_SCAFFOLD_FINDINGS_MATRIX.txt § "CRITICAL BLOCKERS"
2. Your Features: ADMIN_SCAFFOLD_AUDIT.md § find feature sections
3. Action Items: ADMIN_SCAFFOLD_AUDIT.md § "Required Actions Before Scaffold"
```

---

## Key Findings at a Glance

| Finding | Impact | Owner | Timeline |
|---------|--------|-------|----------|
| `/api/admin/content/{workspace}/*` routes undefined | Blocks 4 features (Phase 2) | Content | ASAP |
| Public cache invalidation webhook not defined | Blocks all publish mutations (Phase 3) | Platform | Pre-go-live |
| Dashboard invalidation rules missing | Stale dashboard widgets | Dashboard | Pre-beta |
| Query key factory pattern not enforced | Technical debt, maintenance burden | Dev team | Phase 1 |
| Guestbook edit mutation forbidden | Must NOT implement updateEntry() | Dev team | Phase 1 |
| Media deletion needs media-library coordination | Cross-module contract | Content+Storage | Phase 1 |

---

## Feature Group Summary

### Content Group (7 features)
| Feature | Route | Status | Phase |
|---------|-------|--------|-------|
| Posts | `/admin/noi-dung/bai-viet` | ✓ Ready | Phase 1 |
| Beginner Guides | `/admin/noi-dung/huong-dan` | ✓ Ready | Phase 1 |
| Daily Practice | `/admin/noi-dung/kinh-bai-tap` | 🚫 Blocked | Phase 2 |
| Little House | `/admin/noi-dung/ngoi-nha-nho` | 🚫 Blocked | Phase 2 |
| Life Release | `/admin/noi-dung/phong-sanh` | 🚫 Blocked | Phase 2 |
| Media Library | `/admin/noi-dung/thu-vien-phap-mon` | 🚫 Blocked | Phase 2 |
| Media | `/admin/noi-dung/media` | ⚠️ Caution | Phase 1 |

### Community Group (2 features)
| Feature | Route | Status | Phase |
|---------|-------|--------|-------|
| Community Posts | `/admin/cong-dong/bai-dang` | ⚠️ Caution | Phase 1 |
| Guestbook | `/admin/cong-dong/so-luu-niem` | ⚠️ Caution | Phase 1 |

---

## Implementation Timeline

```
WEEK 1–2: Phase 1 (4 unblocked features)
├─ posts
├─ beginner-guides
├─ community-posts
└─ guestbook

WEEK 3+: Phase 2 (4 blocked on API definitions)
├─ [BLOCKED: Waiting for api-route-inventory.md]
├─ daily-practice
├─ little-house
├─ life-release
└─ media-library

WEEK 5+: Phase 3 (publish mutations)
├─ [BLOCKED: Waiting for /internal/revalidate webhook]
└─ Implement public cache trigger in all content publish mutations

PARALLEL: Blockers
├─ Content module: Define /api/admin/content/{workspace}/* routes
├─ Platform module: Define /internal/revalidate webhook
└─ Dashboard owner: Document cascade invalidation rules
```

---

## Canon Document References

All findings grounded in these official sources:

1. **design/ui/PAGE_INVENTORY.md** § IV. Admin Pages (4.2–4.9)
   - Routes, auth levels, module ownership
   - Admin dashboard spec
   - Post, guide, workspace, media, community page details

2. **design/ui/ADMIN_ARCHITECTURE.md**
   - Sidebar navigation structure
   - Shell components and layout
   - Tech stack (React 19, TanStack Router, TanStack Query v5)

3. **design/ui/ADMIN_MODULE_SPECS.md** § 2–12
   - Detailed workspace specs (tabs, columns, actions)
   - Audit events per module
   - Empty/error/success states
   - Query invalidation rules

4. **design/tracking/api-route-inventory.md** § Content, Community
   - API route definitions (GET/POST/PATCH/DELETE)
   - Auth scope semantics (editor+, moderator+)
   - Response envelope conventions
   - Planned vs. implemented routes

5. **design/tracking/admin-page-api-mapping.md**
   - Query key families per page
   - Invalidation rules table
   - Mutation-to-invalidation quick rules
   - Mapping between admin pages and API route groups

---

## No Code Proposed

✓ This audit does **NOT** include code implementations  
✓ Only outlines requirements, structure, and constraints  
✓ Implementation guidance provided via skeleton references only  
✓ Actual code generation/scaffolding is separate task

---

## Next Steps

### For Developers
1. Review ADMIN_SCAFFOLD_AUDIT_SUMMARY.txt § Phase 1
2. Pick first feature (e.g., posts)
3. Reference ADMIN_SCAFFOLD_AUDIT.md § Posts section
4. Create `apps/admin/src/features/posts/` folder structure
5. Implement queries.ts, mutations.ts, query-keys.ts
6. Validate against invalidation rules matrix

### For Architects
1. Schedule Phase 2 unblocking (Content module API definitions)
2. Schedule Phase 3 setup (Platform webhook)
3. Coordinate dashboard invalidation rules documentation
4. Review feature flag status for workspace pages

### For Module Owners
1. **Content**: Define `/api/admin/content/{daily-practice,little-house,life-release,media-library}/*` routes in api-route-inventory.md
2. **Platform/Cache**: Define `POST /internal/revalidate` webhook route + contract
3. **Dashboard**: Document cascade invalidation for recent-posts and pending-reports widgets
4. **All**: Review ADMIN_SCAFFOLD_AUDIT.md for your module's section

---

## Document Integrity

- **Audit Date**: 2026-03-22
- **Canon Sources Verified**: ✓ All 5 design documents exist and are current
- **Scope Locked**: /admin/noi-dung/*, /admin/cong-dong/* only
- **Not In Scope**: System pages, moderation pages, user management, calendar, wisdom
- **Out of Scope Files**: COMPONENT_SPECS.md, DESIGN_PRINCIPLES.md, ELDERLY_UX.md, contracts.md (referenced but detailed specs are separate)

---

**For questions or updates, refer to canonical design documents in design/ui/ and design/tracking/.**

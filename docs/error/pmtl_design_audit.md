# PMTL_VN Design Directory — Deep Codegen-Readiness Audit

> **Date**: 2026-03-26  
> **Scope**: `design/` directory readiness for safe code scaffolding  
> **Method**: Cross-file consistency, contract completeness, ownership clarity, machine-usable format  
> **Files audited**: ~4,200 lines across 10 critical codegen-gating files + 7 cross-reference docs

---

## Executive Verdict

The `design/` directory is **exceptionally well-structured** for a pre-implementation design system. It is among the most thorough design-first documentation sets I've analyzed. The files have clear ownership chains, explicit anti-invention rules, and strong cross-referencing.

However, there are **18 findings** that would cause silent codegen drift if not patched before broad scaffold. Most are cross-file consistency gaps rather than missing documentation.

| Severity | Count | Impact |
|---|---|---|
| 🔴 P0 — Will cause wrong code | 4 | Scaffold produces code that contradicts another canon file |
| 🟡 P1 — Will cause confusion | 8 | AI/dev must guess or ask; slows scaffold, risks invention |
| 🟢 P2 — Polish / future-proof | 6 | Minor drift risk; can fix during first scaffold wave |

---

## 🔴 P0 Findings — Will Cause Wrong Code

### P0-1: Missing error codes in ERROR_CODE_REGISTRY referenced by DTO_SHAPE_PLAN

**Files**: [ERROR_CODE_REGISTRY.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/ERROR_CODE_REGISTRY.md) vs [API_DTO_SHAPE_PLAN.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md)

The DTO shape plan's `Contract closure requirements` table (lines 775-784) references error codes that **do not exist** in the error code registry:

| Referenced error code | Found in registry? |
|---|---|
| `identity.unauthorized` | ❌ No — registry uses `auth.*` family |
| `dashboard.aggregate_unavailable` | ✅ Yes |
| `calendar.advisory_unavailable` | ❌ No — registry has `calendar.aggregate_unavailable` but not `advisory_unavailable` |
| `engagement.practice_profile_invalid` | ❌ No — entire `engagement.*` family missing |
| `engagement.practice_profile_conflict` | ❌ No |
| `engagement.practice_log_invalid` | ❌ No |
| `engagement.practice_log_conflict` | ❌ No |
| `engagement.practice_sheet_invalid` | ❌ No |
| `engagement.practice_sheet_transition_invalid` | ❌ No |
| `engagement.practice_foundation_warning` | ❌ No |
| `wisdom.offline.version_stale` | ❌ No — `wisdom.*` family missing |
| `wisdom.offline.bundle_not_found` | ❌ No |
| `wisdom.offline.device_fingerprint_required` | ❌ No |
| `offline.bundle_list_unavailable` | ✅ Yes |
| `offline.sync_degraded` | ✅ Yes |

**Impact**: Codegen will either invent error codes or use wrong family prefixes. The DTO plan says `phải cập nhật ERROR_CODE_REGISTRY trước khi scaffold` but the registry itself is incomplete.

**Fix**: Add `engagement.*`, `wisdom.offline.*` families, and align `identity.unauthorized` → `auth.session_missing` or add `identity.unauthorized` as an alias row.

---

### P0-2: Pagination semantic conflict between DTO plan and page loader contracts

**Files**: [API_DTO_SHAPE_PLAN.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md) vs [PAGE_LOADER_CONTRACTS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/PAGE_LOADER_CONTRACTS.md)

| Surface | DTO plan says | Loader contract says |
|---|---|---|
| `OfflineBundleListPageDto` | cursor pagination (line 718-722) | Just says `pagination` without specifying type |
| `/bach-thoai`, `/hoi-dap` | offset pagination (line 700-705) | offset (line 186-189) ✅ consistent |

The DTO plan explicitly says offline bundle list `ưu tiên cursor semantics` (line 722), but the route inventory and loader contract don't echo this decision. If codegen reads the loader contract first, it may default to offset.

**Fix**: Add explicit `pagination: cursor` annotation to `OfflineBundleListPageDto` in PAGE_LOADER_CONTRACTS.md line 137-157.

---

### P0-3: `storage.provider_unavailable` duplicated in ERROR_CODE_REGISTRY

**File**: [ERROR_CODE_REGISTRY.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/ERROR_CODE_REGISTRY.md)

`storage.provider_unavailable` appears in **two** sections:
- Line 64 — under "Content / Media"
- Line 102 — under "Storage / Upload" (as `storage.root_unavailable` is distinct, but `storage.provider_unavailable` is a true duplicate)

Inspection shows line 64 is `storage.provider_unavailable` and line 102 is also `storage.provider_unavailable`. This is a literal duplicate entry.

**Impact**: Minor — won't cause wrong code but signals registry isn't deduped, which erodes trust in its authority.

**Fix**: Remove the duplicate in "Content / Media" section. Storage codes should live only under "Storage / Upload".

---

### P0-4: PRISMA_SCHEMA_PLAN content table list incomplete vs domain SCHEMA_PLAN.dbml references

**File**: [PRISMA_SCHEMA_PLAN.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/data/PRISMA_SCHEMA_PLAN.md) line 17

The content module table list includes `hub_pages`, `hub_page_blocks`, `beginner_guides`, `downloads`, `media_collections`, `media_collection_items`, `chant_items`, `chant_plans`, `sutras`, `sutra_volumes`, `sutra_chapters`, `sutra_glossary`.  

But the FK dependency graph (line 263-264) also references:
- `chant_item_preview_media`
- `chant_item_recommended_presets`
- `chant_item_time_rules`
- `chant_plan_items`
- `hub_page_curated_posts`
- `beginner_guide_media`
- `post_tags`
- `post_related_posts`
- `post_gallery_media`

These child/junction tables are in the FK graph but NOT in the source files table (line 17). Codegen reading only the "Tables chính" column will miss them in migration step 3.

**Fix**: Either add a "Child/junction tables" column to the source files table, or add a note that FK graph is the canonical complete list.

---

## 🟡 P1 Findings — Will Cause Confusion

### P1-1: `identity.unauthorized` vs `auth.*` vocabulary mismatch

DTO_SHAPE_PLAN contract closure table uses `identity.unauthorized` (line 777-783) but ERROR_CODE_REGISTRY uses `auth.*` family for all auth-related codes. These are two different module prefixes for the same concept.

**Fix**: Standardize on one prefix. Recommendation: keep `auth.*` in registry (it's more established) and update DTO_SHAPE_PLAN to use `auth.session_missing` or `auth.forbidden`.

---

### P1-2: ENV_INVENTORY auth model says JWT but SECURITY_POLICY says session-based cookie-first

**Files**: [ENV_INVENTORY.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/repo/ENV_INVENTORY.md) lines 65-68 vs security/auth model

ENV_INVENTORY defines `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ACCESS_TOKEN_TTL_MINUTES`, `REFRESH_TOKEN_TTL_DAYS` — suggesting JWT-based auth. But the auth model is described as **cookie-first browser transport** with session persistence in Postgres.

This isn't a contradiction (JWT can be transported via cookies), but the env naming creates mental model confusion. A new dev/AI might think this is a stateless JWT system when it's actually a **stateful session system** using JWT as the token format.

**Fix**: Add a note to ENV_INVENTORY auth section: *"These JWTs are transported via httpOnly cookies, not Authorization headers. Session state is persisted in Postgres `sessions` table. See SECURITY_POLICY.md for transport contract."*

---

### P1-3: CODING_READINESS skill alignment section references `.claude/skills/` that don't exist

**File**: [CODING_READINESS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/repo/CODING_READINESS.md) lines 390-401

References skills like `.claude/skills/arch-check`, `.claude/skills/module-scaffold`, `.claude/skills/use-case-write`. These paths follow Claude Code plugin convention but the actual repo skills are under `.agents/skills/pmtl-*`.

**Impact**: AI agent following CODING_READINESS will try to load non-existent skill paths.

**Fix**: Update skill paths to match actual repo structure, or note these are conceptual skills not yet materialized.

---

### P1-4: IMPLEMENTATION_MAPPING "new design docs" table has absolute Windows paths

**File**: [IMPLEMENTATION_MAPPING.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md) lines 200-265

Many cross-reference links use absolute Windows paths (`C:/Users/ADMIN/DEV2/PMTL_VN/design/...`). While functional for the current developer, these break for:
- Any other developer's machine
- CI/CD documentation checks
- GitHub/web rendering

**Fix**: Convert to relative paths from repo root (e.g., `design/04-execution-overlay/...`).

---

### P1-5: No `contact.*` error codes in registry

The Contact module has use cases (`update-contact-info.md`, `manage-volunteer-directory.md`) referenced in IMPLEMENTATION_MAPPING but ERROR_CODE_REGISTRY has no `contact.*` family.

**Fix**: Add at minimum `contact.not_found`, `contact.update_forbidden`, `contact.volunteer_duplicate`.

---

### P1-6: Wisdom-QA `audio_talk_entries` and `video_talk_entries` in PRISMA_SCHEMA_PLAN but no DTO coverage

**Files**: PRISMA_SCHEMA_PLAN line 25 defines `audio_talk_entries`, `video_talk_entries` tables. But API_DTO_SHAPE_PLAN has no admin or public DTO profiles for these content types.

**Impact**: When scaffold reaches wisdom-qa module, codegen will have schema but no DTO guidance — exactly the "blind invention" the DTO plan was designed to prevent.

**Fix**: Add `AdminAudioTalkDetailDto` and route family picks, or explicitly mark as "Phase 2 — DTO pending".

---

### P1-7: Admin route patterns inconsistent between PAGE_LOADER_CONTRACTS and route inventory

**File**: PAGE_LOADER_CONTRACTS.md line 56 uses `/he-thong/health` (no `/admin/` prefix) while line 57 uses `/admin/he-thong/thong-bao` (with prefix). The pattern is inconsistent within the same table.

**Fix**: Standardize to always include or always omit the `/admin/` prefix in loader contracts.

---

### P1-8: APPS_API_SCAFFOLD_ORDER Step 7 says "5 route đầu tiên" but IMPLEMENTATION_MAPPING says "first vertical slice = chanting environment rules"

**Files**: APPS_API_SCAFFOLD_ORDER line 494-502 lists 5 content post CRUD routes as first Step 7 routes. But IMPLEMENTATION_MAPPING lines 30-46 recommends chanting environment rules as the first vertical slice.

These aren't contradictory (Step 7 is the content module baseline; vertical slice is the recommended E2E test), but the relationship isn't stated. A codegen agent might try to scaffold posts first AND environment rules first simultaneously.

**Fix**: Add a note to Step 7: *"After these 5 post routes are stable, the recommended first E2E vertical slice is chanting environment rules per IMPLEMENTATION_MAPPING."*

---

## 🟢 P2 Findings — Polish / Future-Proof

### P2-1: DTO envelope rules in API_DTO_SHAPE_PLAN partially duplicate ERROR_ENVELOPE_CONTRACT

Lines 831-846 of DTO_SHAPE_PLAN define envelope rules that overlap with ERROR_ENVELOPE_CONTRACT.md. The DTO plan adds route-family-specific guidance (`meta.engine`, `meta.degraded`) which is valuable, but the base envelope shape is stated in both places.

**Fix**: Add a cross-reference note: *"Base envelope shape → ERROR_ENVELOPE_CONTRACT.md. This section adds route-family-specific envelope extensions."*

---

### P2-2: CODING_READINESS Wave order doesn't mention `apps/admin` scaffold timing

Waves 1-6 only mention `apps/api` and `apps/web`. `apps/admin` first appears at Wave 4 for moderation queue. But ADMIN_PAGE_API_MAPPING and ADMIN_MODULE_SPECS have 24 workspaces. No wave plan exists for admin beyond moderation.

**Fix**: Add admin scaffold waves or note that admin follows API module readiness.

---

### P2-3: ENV_INVENTORY has `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` but no corresponding design doc

Line 112 references this env for multi-instance Server Action encryption but there's no design doc explaining the multi-instance deployment model or when this becomes required.

**Fix**: Add a note referencing the deployment architecture doc, or mark as "Phase 2+ when multi-instance web deploy".

---

### P2-4: ERROR_CODE_REGISTRY has no `vows.*` family

Vows-merit module has use cases and route inventory entries but no error code family. The DTO plan doesn't reference vow-specific errors either.

**Fix**: Add `vows.not_found`, `vows.status_invalid`, `vows.progress_conflict`, `vows.assisted_entry_forbidden`.

---

### P2-5: PRISMA_SCHEMA_PLAN community merge notes reference `post_comments` but route inventory uses `/content/posts/:publicId/comments`

The naming suggests `post_comments` are editorial blog post comments (under content module), while `community_comments` are community post comments. This split is documented but could easily confuse codegen that sees both.

**Fix**: Add a 1-line clarification to the merge notes: *"`post_comments` = editorial blog post comments; `community_comments` = community post comments. Different modules, different visibility rules."*

---

### P2-6: No explicit `do-not-cache` list in CACHE_TOPOLOGY cross-referenced by DTO plan

DTO_SHAPE_PLAN references cache expectations but there's no unified "never cache these routes" list that codegen can mechanically check. Individual route notes mention `no-store` but it's scattered.

**Fix**: Consider adding a `## Routes that MUST NOT be cached` section to CACHE_TOPOLOGY or a column to API_ROUTE_INVENTORY.

---

## Cross-File Consistency Matrix

| Check | Status | Notes |
|---|---|---|
| DTO names match between DTO_SHAPE_PLAN ↔ PAGE_LOADER_CONTRACTS | ✅ Consistent | All primary loader DTOs match |
| Error codes in DTO_SHAPE_PLAN exist in ERROR_CODE_REGISTRY | ❌ 13 missing | See P0-1 |
| Route paths in PAGE_LOADER_CONTRACTS exist in API_ROUTE_INVENTORY | ✅ Consistent | Spot-checked 15 routes |
| Env vars in ENV_INVENTORY referenced by scaffold docs | ✅ Consistent | All Phase 1 vars referenced correctly |
| Prisma tables in schema plan match domain DBML owners | 🟡 Partial | Child/junction tables not in summary table (P0-4) |
| Pagination types consistent across DTO/loader/route docs | ❌ 1 conflict | Offline bundle cursor vs unspecified (P0-2) |
| Phase gating consistent across IMPLEMENTATION_MAPPING ↔ SCAFFOLD_ORDER | ✅ Consistent | Both enforce same Step 0-7 window |
| Feature flag keys match between CODING_READINESS and route inventory conditions | ✅ Consistent | 8 flags verified |

---

## Phased Patch Plan

### Phase A — Before first scaffold commit (P0 fixes)

1. **Add missing error code families** to ERROR_CODE_REGISTRY:
   - `engagement.*` (6 codes from DTO plan)
   - `wisdom.offline.*` (3 codes)
   - `contact.*` (3 codes)
   - `vows.*` (4 codes)
2. **Resolve `identity.unauthorized` vs `auth.*`** vocabulary mismatch in DTO_SHAPE_PLAN
3. **Add pagination type annotation** to OfflineBundleListPageDto in PAGE_LOADER_CONTRACTS
4. **Deduplicate `storage.provider_unavailable`** in ERROR_CODE_REGISTRY
5. **Add child/junction tables note** to PRISMA_SCHEMA_PLAN source files table

### Phase B — Before Wave 2 scaffold (P1 fixes)

6. **Add auth transport note** to ENV_INVENTORY identity section
7. **Fix skill paths** in CODING_READINESS to match actual `.agents/skills/` structure
8. **Convert absolute Windows paths** to relative in IMPLEMENTATION_MAPPING
9. **Add audio/video talk DTO profiles** or phase-gate note to API_DTO_SHAPE_PLAN
10. **Standardize admin route prefix** in PAGE_LOADER_CONTRACTS
11. **Clarify Step 7 → vertical slice relationship** in APPS_API_SCAFFOLD_ORDER

### Phase C — Polish (P2 fixes, can be done incrementally)

12-18. Remaining P2 items — envelope cross-ref, admin waves, cache do-not-cache list, comment naming clarification, env doc references

---

## Strengths Worth Preserving

> [!TIP]
> These patterns are uncommon even in enterprise design docs and should be treated as repo canon:

1. **Anti-invention surfaces** (DTO_SHAPE_PLAN P0 contract closure table) — explicitly blocks codegen from starting without full contract closure
2. **Evidence-gated status changes** (IMPLEMENTATION_MAPPING) — prevents "design = implemented" hallucination
3. **Projection safety baseline** (DTO_SHAPE_PLAN) — clear safe/unsafe field taxonomy prevents data leaks
4. **Request-shape freeze rule** (DTO_SHAPE_PLAN line 848-856) — prevents controller drift after design lock
5. **E2E page acceptance checklist** (PAGE_LOADER_CONTRACTS line 300-318) — 6-point checklist before any page enters implementation
6. **Scaffold step blockers** (APPS_API_SCAFFOLD_ORDER) — each step has explicit "do not move on until" gates
7. **Bug prediction section** (CODING_READINESS) — proactive identification of 8 bugs with pre-applied fixes
8. **Bilingual documentation** — Vietnamese context preserved alongside technical English terms

# SUPER PROMPT — Fix Practice Support Home Guide Review Findings

Repo: `C:\Users\ADMIN\DEV2\PMTL_VN`

You are working in this repo only. Execute the fix completely. Do not touch `apps/web`.

## Goal
Fix the two verified review findings in the `practice-support / vietnam-home-practice-guide` implementation.

## Verified Findings To Fix

### 1. Remove runtime writes to `design/` canon files
Current implementation in:
- `C:\Users\ADMIN\DEV2\PMTL_VN\apps\api\src\modules\content\practice-support\practice-support.service.ts`

Problem:
- Admin `PATCH` currently reads and writes directly to:
  - `design/04-execution-overlay/api/schemas/practice-support.seed.vi.json`
- This is not an acceptable long-term runtime write path.
- `design/` is canon/spec territory, not mutable runtime persistence.
- The implementation is also brittle because it depends on `process.cwd()`.

Required fix:
- Stop mutating files under `design/` at runtime.
- Keep `design/.../practice-support.seed.vi.json` as bootstrap/source seed only.
- Move runtime-owned mutable state to an API-owned location under `apps/api` or another clearly runtime-owned path already consistent with repo conventions.
- The service may still read canon seed as fallback/bootstrap if runtime state does not exist yet.
- Runtime path resolution must not be brittle. Do not rely on an unsafe cwd assumption if a stronger path strategy is available.
- Preserve existing response shape.
- Preserve audit logging.

### 2. Tighten PATCH contract to only the 3 approved editable fields
Current files:
- `C:\Users\ADMIN\DEV2\PMTL_VN\apps\api\src\modules\content\practice-support\practice-support.schemas.ts`
- `C:\Users\ADMIN\DEV2\PMTL_VN\apps\api\src\modules\content\practice-support\practice-support.service.ts`
- `C:\Users\ADMIN\DEV2\PMTL_VN\apps\admin\src\features\practice-support-home-guide\mutations.ts`

Problem:
- The prompt scope allows editing only:
  - `vegetarianDisciplineRules`
  - `officeNutritionNotes`
  - `supplementalDietNotes`
- But the PATCH schema and mutation types currently allow unrelated fields such as:
  - `title`
  - `overview`
  - `homeAltarRules`
  - `sacredItemRules`
  - etc.

Required fix:
- Restrict API PATCH validation to only the 3 approved editable fields.
- Restrict service merge logic to only those 3 fields.
- Restrict admin mutation input type to only those 3 fields.
- Do not widen the contract “for future use”. Future scope is out of scope for this task.

## Files You Must Inspect First
- `C:\Users\ADMIN\DEV2\PMTL_VN\AGENTS.md`
- `C:\Users\ADMIN\DEV2\PMTL_VN\apps\api\AGENTS.override.md`
- `C:\Users\ADMIN\DEV2\PMTL_VN\apps\admin\AGENTS.override.md`
- `C:\Users\ADMIN\DEV2\PMTL_VN\.agents\skills\pmtl-cornhub-workflow\SKILL.md`

## CornHub Workflow — Mandatory
For this task, use CornHub first when available:
1. `corn_session_start`
2. `corn_detect_changes`
3. `corn_code_search`
4. `corn_code_context`
5. If changing shared or risky logic, use `corn_code_impact`
6. After implementation and verification, use `corn_knowledge_store`
7. End with `corn_quality_report`
8. End with `corn_session_end`

If CornHub is unavailable or weak for this area, state that briefly and continue with direct repo inspection.

## Implementation Constraints
- Do not touch `apps/web`.
- Do not change public response shape unless strictly necessary.
- Do not add placeholder TODOs.
- Keep Vietnamese UI text with proper dấu.
- Keep audit logging intact.
- Keep this fix scoped to API + admin only.
- Prefer minimal surgical changes.

## Strong Suggestions
- If no runtime-owned storage file exists yet for this practice-support content, create one under an API-owned path and implement bootstrap-from-seed behavior on first load.
- Make the ownership explicit in naming so nobody mistakes runtime content for design canon.
- If the runtime file is JSON-backed for now, isolate path handling and file IO clearly so it can later be replaced by DB storage without rewriting the controller contract.

## Verification — Mandatory
Run and report these exact checks after implementation:
- `pnpm --filter @pmtl/api typecheck`
- `pnpm --filter @pmtl/admin typecheck`

Then verify behavior logically:
- public GET still returns the guide
- admin GET still returns the guide
- admin PATCH only accepts the 3 allowed fields
- runtime edits no longer write into `design/04-execution-overlay/api/schemas/practice-support.seed.vi.json`

## Final Response Format
Return:
1. What you changed
2. Exact files changed
3. Verification results
4. CornHub tools used
5. Any residual risk or follow-up

Do not claim success unless the code and verification actually pass.

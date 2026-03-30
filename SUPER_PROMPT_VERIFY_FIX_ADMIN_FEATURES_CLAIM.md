# SUPER PROMPT — Verify And Fix Claimed Admin Feature Changes

Repo: `C:\Users\ADMIN\DEV2\PMTL_VN`

You are working in this repo only. Treat the summary below as untrusted until verified from code and runtime behavior.
Do not touch `apps/web`.

## Claimed Summary To Verify

The previous agent claims all of the following are already fixed and typecheck clean:

- Downloads — full edit dialog (title, description, category, fileUrl, fileType, fileSize) + `Gỡ xuất bản` row action + unpublish confirm dialog
- Users — role `Select` (`MEMBER` / `ADMIN` / `SUPER_ADMIN`), status badge display, and block/unblock buttons directly in the action dialog wired to existing mutations
- Community Posts — added `isPinned` to type, `heartCount` / `commentCount` / `isPinned` columns, pin/unpin/restore/hide row actions, and all 7 confirm dialogs wired
- Volunteers — added `avatarUrl` input and `isActive` checkbox to create/edit form, both passed to mutations
- Guides — added `slug` field to edit dialog, `sortOrder` and `versionNote` to both create and edit dialogs

You must verify all of this from actual repo code and behavior. If any part is missing, inconsistent, broken, miswired, or only partially implemented, fix it completely.

## Primary Goal
Perform a strict verify-and-fix pass across these admin features:
- Downloads
- Users
- Community Posts
- Volunteers
- Guides

## Required Outcome
By the end:
- the claimed feature set is either actually implemented and verified,
- or you implement/fix the missing parts until it is true,
- and you report exactly what was real vs what was false/missing in the original claim.

## Read First
- `C:\Users\ADMIN\DEV2\PMTL_VN\AGENTS.md`
- `C:\Users\ADMIN\DEV2\PMTL_VN\apps\admin\AGENTS.override.md`
- `C:\Users\ADMIN\DEV2\PMTL_VN\apps\api\AGENTS.override.md`
- `C:\Users\ADMIN\DEV2\PMTL_VN\.agents\skills\pmtl-cornhub-workflow\SKILL.md`
- `C:\Users\ADMIN\DEV2\PMTL_VN\.agents\skills\pmtl-admin-ui\SKILL.md`
- `C:\Users\ADMIN\DEV2\PMTL_VN\.agents\skills\pmtl-ui-behavior\SKILL.md`

## CornHub Workflow — Mandatory
Use CornHub first when available:
1. `corn_session_start`
2. `corn_detect_changes`
3. `corn_code_search`
4. `corn_code_context`
5. `corn_code_impact` before changing shared dialog/context/table/action logic
6. After implementation and verification, `corn_knowledge_store`
7. End with `corn_quality_report`
8. End with `corn_session_end`

If CornHub is weak or unavailable for part of the task, state that briefly and continue with direct repo inspection.

## Verification Workflow — Mandatory
Do not trust the summary. For each feature area:
1. Locate the actual admin feature entry point.
2. Verify the relevant queries, mutations, dialog state/context, row actions, forms, and table columns.
3. Verify the feature compiles.
4. If the feature is UI-behavior-sensitive, verify with browser automation if practical.
5. If any piece is missing or miswired, fix it.

## Areas To Audit In Detail

### 1. Downloads
Verify and fix if needed:
- edit dialog exists and opens correctly
- fields present: `title`, `description`, `category`, `fileUrl`, `fileType`, `fileSize`
- save path is wired to the correct mutation
- row action includes `Gỡ xuất bản`
- unpublish confirm dialog exists and is wired
- query invalidation and error handling are correct

### 2. Users
Verify and fix if needed:
- role select exists in action dialog
- allowed roles exactly: `MEMBER`, `ADMIN`, `SUPER_ADMIN`
- current role/status render correctly
- status badge displays correctly
- block/unblock buttons are in the action dialog, not dead UI
- buttons call the existing `useChangeRole` / `useBlockUser` / `useUnblockUser` mutations correctly
- optimistic assumptions are forbidden; verify actual wiring

### 3. Community Posts
Verify and fix if needed:
- `isPinned` exists in the relevant type definitions used by admin UI
- table columns include `heartCount`, `commentCount`, `isPinned`
- row actions include pin/unpin/restore/hide as appropriate
- all claimed confirm dialogs actually exist and open/close correctly
- action state and invalidation are correct
- no dead menu items or unreachable dialogs

### 4. Volunteers
Verify and fix if needed:
- create form contains `avatarUrl`
- create/edit forms contain `isActive`
- fields are actually submitted in create/update mutation payloads
- field defaults and editing behavior are sane

### 5. Guides
Verify and fix if needed:
- edit dialog contains `slug`
- create dialog contains `sortOrder` and `versionNote`
- edit dialog contains `sortOrder` and `versionNote`
- values are passed to mutations correctly
- no mismatch between form fields and API contract

## Shared Risks You Must Check
- dialog context union types or dialog discriminated unions drifting from actual dialog usage
- menu items that call nonexistent dialog keys
- forms showing fields but not sending them
- mutation inputs wider or narrower than actual API contract
- missing `handleApiError`
- missing query invalidation after write actions
- Vietnamese text must keep proper dấu
- broken table columns or action menus caused by stale types

## Preferred Search Targets
Use CornHub first, then direct code search if needed. Likely targets include:
- admin feature folders under `apps/admin/src/features/`
- row action components
- dialog context files such as `context.tsx`
- queries/mutations files
- route pages that mount the feature shells

## Scope Rules
- You may modify `apps/admin` and `apps/api` if needed.
- Do not touch `apps/web`.
- Keep changes surgical and repo-aligned.
- Do not leave TODOs or partial scaffolding.
- Do not declare success just because typecheck passes.

## Required Verification Commands
Run and report at minimum:
- `pnpm --filter @pmtl/admin typecheck`
- `pnpm --filter @pmtl/api typecheck`

If browser verification is feasible, also verify the affected admin routes/actions with a real browser lane.

## Final Response Format
Return exactly these sections:
1. Verified true from the original claim
2. False / incomplete parts found
3. What you changed
4. Exact files changed
5. Verification results
6. CornHub tools used
7. Residual risks

If the original summary was partly wrong, say so directly.
Do not smooth over missing work.

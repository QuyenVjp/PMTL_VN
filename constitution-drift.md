# Constitution Drift Report

> Generated: 2026-03-30
> Constitutions: `apps/admin/AGENTS.override.md`, `apps/api/AGENTS.override.md`
> Scope: 3 admin features + 2 API modules audited

---

## Admin Features

### Severity Legend
- **CRITICAL** — monolithic structure, no constitution-aligned file layout at all
- **HIGH** — missing required component (detail sheet, row actions); wrong action placement
- **MEDIUM** — minor pattern inconsistency, duplicate helpers, style drift
- **LOW** — best-practice suggestion, no functional impact

---

### 1. `features/guides/` — HIGH violations

**Missing files:**
- `guides-detail.tsx` — detail sheet does not exist

**Violations:**

| Sev | File | Issue |
|-----|------|-------|
| HIGH | `data-table-row-actions.tsx:19` | Row actions start with "Chỉnh sửa" — must start with "Xem chi tiết". Edit belongs in detail sheet. |
| HIGH | Feature | `guides-detail.tsx` is missing. Constitution §12 requires WorkspaceDetailSheet for every management page. |
| MEDIUM | `data-table-row-actions.tsx` | Publish action in row menu is acceptable as a quick toggle, but edit must move to detail sheet. |
| LOW | `guides-table.tsx:42-64` | `CATEGORY_LABELS` map duplicated inline — should live in `workspace-helpers.ts`. |

**Fix order:**
1. Create `guides-detail.tsx` with `WorkspaceDetailSheet` (info + inline edit + publish/unpublish + delete)
2. Update `data-table-row-actions.tsx`: replace "Chỉnh sửa" with "Xem chi tiết", keep "Xuất bản" quick toggle + "Xoá"
3. Move `CATEGORY_LABELS` to `workspace-helpers.ts`

---

### 2. `features/community-posts/` — CRITICAL

**Missing files:** context.tsx, community-posts-table.tsx, community-posts-dialogs.tsx, community-posts-detail.tsx, data-table-row-actions.tsx

**Violations:**

| Sev | File | Issue |
|-----|------|-------|
| CRITICAL | `index.tsx:1-333` | Entire feature is monolithic — Context, helpers, row actions, table, and dialogs are all in one file. Must be split per constitution §1. |
| HIGH | `index.tsx:35-55` | Context definition lives in index.tsx — must move to `context.tsx`. |
| HIGH | `index.tsx:105-129` | Row actions exceed 3 quick actions. Approve/Hide/Reject should move to detail sheet; only Xoá stays as quick action. |
| HIGH | Feature | No "Xem chi tiết" action — detail sheet entirely missing. |
| HIGH | Feature | No `community-posts-detail.tsx` with `WorkspaceDetailSheet`. |
| MEDIUM | `index.tsx:257-261` | Mutation logic inlined in dialog JSX — should be in `mutations.ts`. |

**Fix order:**
1. Extract `context.tsx` (ContextType + Provider + hook)
2. Extract `data-table-row-actions.tsx` (add "Xem chi tiết" first; reduce to ≤3 quick actions)
3. Extract `community-posts-table.tsx`
4. Extract `community-posts-dialogs.tsx` (keep only approve/reject/delete confirm dialogs)
5. Create `community-posts-detail.tsx` (full view + inline moderation actions)
6. Reduce `index.tsx` to: Provider + Table + Dialogs + DetailSheet wiring only

---

### 3. `features/guestbook/` — CRITICAL

**Missing files:** context.tsx, guestbook-table.tsx, guestbook-dialogs.tsx, guestbook-detail.tsx, data-table-row-actions.tsx

**Violations:**

| Sev | File | Issue |
|-----|------|-------|
| CRITICAL | `index.tsx:1-319` | Same monolithic pattern as community-posts. All components in one file. |
| HIGH | `index.tsx:31-58` | Context definition in index.tsx — must move to `context.tsx`. |
| HIGH | `index.tsx:97-119` | Row actions don't start with "Xem chi tiết". Approve/Reject should move to detail sheet. |
| HIGH | Feature | No `guestbook-detail.tsx` with `WorkspaceDetailSheet`. |
| MEDIUM | `index.tsx:250-254` | Mutation called inline in dialog with `mutate(status: "APPROVED" | "REJECTED")` — should be via named hooks. |

**Fix order:** Same pattern as community-posts above.

---

### Admin Features Compliance Summary

| Feature | File Layout | Row Actions | Detail Sheet | Overall |
|---------|-------------|-------------|--------------|---------|
| `downloads` | [OK] Compliant (just retrofitted) | [OK] | [OK] | **Compliant** |
| `guides` | [WARN] Missing detail | [WARN] Wrong first action | [FAIL] Missing | **HIGH** |
| `community-posts` | [FAIL] Monolithic | [FAIL] Missing | [FAIL] Missing | **CRITICAL** |
| `guestbook` | [FAIL] Monolithic | [FAIL] Missing | [FAIL] Missing | **CRITICAL** |

---

## API Modules

### 4. `modules/content/` — GOOD (1 minor issue)

| Sev | File | Issue |
|-----|------|-------|
| MEDIUM | `content.schemas.ts:31` | `postResponseSchema` exposes internal `id` field — responses must use `publicId` only (Constitution §5). |

**Everything else compliant:** `@Body(ZodValidate(...))` pattern used, business logic in service, `NotFoundError`/`ConflictError` from common errors, `nanoid(21)` for publicIds, audit context passed on all write paths, `@CurrentUser()` used consistently.

---

### 5. `modules/contact/` — GOOD (2 issues)

| Sev | File | Issue |
|-----|------|-------|
| HIGH | `contact.service.ts:44-60` | Cache read/write (`cache.getJson`, `cache.setJson`) is infrastructure concern mixed into business service. Should be in a repository layer or `CacheService` wrapper. |
| LOW | `contact.service.ts` | Uses NestJS `NotFoundException` instead of custom `NotFoundError` from `common/errors`. Inconsistent with content module. Align across all modules. |

**Everything else compliant:** Zod validation, business logic in service, audit context, publicId via nanoid, @CurrentUser() consistent.

---

## API Modules Compliance Summary

| Module | Validation | Logic Placement | Errors | Audit | PublicId | Overall |
|--------|------------|-----------------|--------|-------|---------|---------|
| `content` | [OK] | [OK] | [OK] | [OK] | [OK] | **Good** (minor schema) |
| `contact` | [OK] | [WARN] Cache mixed in | [WARN] Wrong type | [OK] | [OK] | **Good** (2 fixable issues) |

---

## Recommended Fix Priority

| Priority | Target | Work |
|----------|--------|------|
| 1 | `features/guides` | Create detail sheet; update row actions |
| 2 | `features/community-posts` | Full refactor into constitution layout |
| 3 | `features/guestbook` | Full refactor into constitution layout |
| 4 | `content.schemas.ts` | Remove `id` from response schema |
| 5 | `contact.service.ts` | Extract cache to infrastructure layer |
| 6 | `contact.service.ts` | Replace `NotFoundException` with `NotFoundError` |

---

> Use `scaffolds/management-page/` as the reference template when refactoring features above.

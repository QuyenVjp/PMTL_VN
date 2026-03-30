# Management Page Scaffold

Copy-paste template for a new admin management feature.
Follows `apps/admin/AGENTS.override.md` exactly.

## Usage

1. Copy this entire folder to `apps/admin/src/features/[your-feature]/`
2. Rename files: replace `[features]` in filenames with your plural feature name
   - `[features]-detail.tsx` → `guides-detail.tsx`
   - `[features]-dialogs.tsx` → `guides-dialogs.tsx`
   - `[features]-table.tsx` → `guides-table.tsx`
3. Find and replace all placeholders in file contents:

| Placeholder | Replace with | Example |
|-------------|--------------|---------|
| `[Feature]` | PascalCase singular | `Guide` |
| `[feature]` | camelCase singular | `guide` |
| `[features]` | camelCase plural | `guides` |
| `[domain]` | API route segment | `content` |
| `[Page title]` | Vietnamese page title | `Hướng dẫn` |
| `[Page description]` | Vietnamese description | `Quản trị bài hướng dẫn.` |

4. Add your domain-specific fields to:
   - `queries.ts` — `[Feature]Item` interface + filter params
   - `mutations.ts` — create/update input types
   - `[features]-detail.tsx` — `WorkspaceDetailField` rows + form fields
   - `[features]-table.tsx` — column definitions

5. Register the page in `apps/admin/src/features/workspaces/module-pages.tsx`

6. Add the route in `apps/admin/src/routes/`

## File Layout

```
[features]/
├── index.tsx                   ← Provider + header + Table + Dialogs + DetailSheet. Zero logic.
├── context.tsx                 ← DialogType union + Provider + use[Feature]s() hook
├── queries.ts                  ← [Feature]Item interface + queryOptions factory + query keys
├── mutations.ts                ← useMutation hooks (create, update, delete, publish, unpublish)
├── [features]-table.tsx        ← column defs + toolbar filters + WorkspaceDataTable
├── [features]-dialogs.tsx      ← Create dialog + Publish/Delete WorkspaceConfirmDialogs
├── [features]-detail.tsx       ← WorkspaceDetailSheet (info + inline edit + status actions)
└── data-table-row-actions.tsx  ← WorkspaceRowActions: "Xem chi tiết" first, ≤3 total
```

## Constitution Checklist

Before shipping, verify:

- [ ] `index.tsx` has zero business logic — only wires components
- [ ] `context.tsx` has `"detail"` in the `DialogType` union
- [ ] Row actions: "Xem chi tiết" is FIRST, max 3 total
- [ ] Edit form lives ONLY in detail sheet, never in a separate edit dialog
- [ ] `WorkspaceDetailSheet` used (not custom Sheet)
- [ ] `WorkspaceRowActions` used (not inline DropdownMenu)
- [ ] `WorkspaceDataTable` used (not raw `<Table>`)
- [ ] `WorkspaceConfirmDialog` for all confirmations
- [ ] All mutations use `handleApiError` in `onError`
- [ ] All mutations invalidate queries on success (no optimistic updates)
- [ ] No `any` types on API responses
- [ ] All Vietnamese text has full diacritics
- [ ] API responses use `publicId`, never internal `id`

# Admin UI Contract

This file is the operator-facing UI contract for `apps/admin`. It turns the
`shadcn-admin` direction into concrete PMTL rules that every sidebar workspace
must follow.

## List Workspaces

- Use `WorkspaceDataTable` for management lists.
- Table rows must be clickable when a record has a detail route or detail sheet.
- Row actions use `WorkspaceRowActions` only.
- Row actions are limited to:
  - `Xem chi tiết`
  - one status transition when needed
  - `Xoá` for destructive delete
- Edit, metadata, publish history, and secondary operations belong in a detail
  sheet or full detail page, not in a row dropdown.
- Empty, loading, and error states must be visible in the table area.

## Create And Detail Flows

- Content-heavy workspaces use `AdminDetailPage` full-page create/detail.
- Lightweight operational records may use `WorkspaceDetailSheet`.
- A workspace that already has `/tao-moi` and `/$publicId` routes must not
  regress to modal create/edit.
- Detail surfaces group content as:
  - `Thông tin`
  - `Biên tập`
  - `Audit`
  - `Nguy hiểm` when destructive actions exist

## Forms

- Forms must show field-level errors near the input.
- API validation errors must include `details.fieldErrors` when a field can be
  identified.
- Toast-only validation is not enough.
- Inputs must preserve Vietnamese labels with full diacritics.
- Media fields use preview pickers; operators must not type raw storage keys or
  `publicId` as the primary workflow.

## Navigation

- Header không dùng breadcrumb. Sidebar + top nav + page title là nguồn định vị chính.
- Command menu includes:
  - route navigation
  - quick create commands
  - shell commands such as theme switch and notification entry
- Sidebar route labels are the canonical operator labels.

## API Contract

- Admin API errors use `{ error: { code, message, status, requestId, traceId, details } }`.
- Validation details should include:
  - `fieldErrors: Record<string, string>`
  - `fields: string[]`
  - `issues` when the source validator supports it
- Mutations invalidate the narrowest correct query keys: list, detail, and
  affected dashboard summaries when relevant.
- Business authority stays in `apps/api`; admin UI only reflects backend state.

## Verification

Before closing a meaningful admin change:

- Run `pnpm --filter @pmtl/admin typecheck`.
- Run targeted ESLint for touched admin files.
- Run API typecheck when API validation or error contracts change.
- Browser-smoke at least `/dashboard` and one changed workspace on desktop and
  mobile viewport.

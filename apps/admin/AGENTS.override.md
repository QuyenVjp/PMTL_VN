# Admin FE — Coding Constitution

> Scope: `apps/admin/` only.
> Root rules: `AGENTS.md` at repo root.
> Stack: React 18 + TypeScript + Vite + TanStack Router + TanStack Query + TanStack Table + shadcn/ui + Tailwind.

---

## 1. Feature Module Structure

Every feature module lives under `src/features/{feature-name}/` with this file layout:

```
features/{name}/
├── index.tsx           ← page export (Provider + Table + Dialogs)
├── context.tsx         ← dialog/sheet state (Context + Provider + hook)
├── queries.ts          ← TanStack Query options + TypeScript interfaces
├── mutations.ts        ← useMutation hooks
├── {name}-table.tsx    ← table component
├── {name}-dialogs.tsx  ← dialog switcher (create, edit, publish, delete)
├── {name}-detail.tsx   ← detail sheet (view + edit + delete)
└── data-table-row-actions.tsx  ← row ⋮ menu
```

**Rules:**
- `index.tsx` wires Provider + Table + Dialogs. Zero business logic.
- Page state (which dialog is open, which row is selected) belongs in `context.tsx`.
- Query logic belongs in `queries.ts`. Never inline `adminClient` calls in components.
- Mutation logic belongs in `mutations.ts`. Never inline `fetch` or `adminClient` in components.

---

## 2. State Management

| Concern | Tool | Rule |
|---------|------|------|
| Server data | TanStack Query | Always use `queryOptions()` factory |
| Dialog / sheet open state | React Context | One `[Feature]Provider` + `use[Feature]()` per feature |
| Form state | `useState` | Local to dialog/sheet components only |
| Global UI (theme, sidebar) | Zustand store | `src/stores/` — do not add stores for feature state |

**Forbidden:** Redux, Jotai, MobX, global mutable singletons for feature state.

---

## 3. Component Hierarchy — What Goes Where

### Table pages (list view)
```
<FeatureProvider>
  <FeaturePageHeader />          ← title + primary action button
  <FeatureTable />               ← toolbar + WorkspaceDataTable + bulk actions
  <FeatureDialogs />             ← portal-rendered dialogs
  <FeatureDetailSheet />         ← portal-rendered detail sheet
</FeatureProvider>
```

### Table row actions
- **Quick actions only** (3 max): "Xem chi tiết", "Xoá", one status toggle.
- All edit/metadata/publish/unpublish actions go inside the detail sheet.
- Use `WorkspaceRowActions` — **never** build a custom DropdownMenu inline.

### Detail sheet (`{name}-detail.tsx`)
- Use `WorkspaceDetailSheet` shell from `@/components/workspace`.
- Full record view + inline edit form + delete.
- This is where all non-quick operations live.

### Dialogs
- Use `WorkspaceConfirmDialog` for publish/unpublish/delete confirmations.
- Dialog type is a union string literal, never a numeric enum:
  ```typescript
  type DialogType = "create" | "edit" | "publish" | "delete" | null;
  ```

---

## 4. Workspace Components — Mandatory Usage

| Task | Use | Never use |
|------|-----|-----------|
| Table rendering | `WorkspaceDataTable` | Raw `<Table>` inline in feature |
| Row ⋮ menu | `WorkspaceRowActions` | Inline `DropdownMenu` |
| Confirm modal | `WorkspaceConfirmDialog` | Ad-hoc `Dialog` for confirm |
| Status/category labels | `contentStatusLabel()`, `contentStatusBadgeClass()` from `workspace-helpers` | Inline switch/if chains duplicated per feature |
| Detail panel | `WorkspaceDetailSheet` + `WorkspaceDetailSection` + `WorkspaceDetailField` | Custom Sheet per feature |
| File size display | `formatFileSize()` from `workspace-helpers` | Inline conversion |
| Relative time | `timeAgo()` from `workspace-helpers` | Inline `Date` logic |

When you need a helper that doesn't exist, add it to `workspace-helpers.ts` — **not** inline in the component.

---

## 5. Query Pattern

```typescript
// queries.ts
export interface FeatureItem {
  publicId: string;
  // ... (never expose internal DB `id`)
}

export const featureKeys = {
  all:     ["admin-feature"]               as const,
  lists:   () => [...featureKeys.all, "list"] as const,
  list:    (f: Filters) => [...featureKeys.lists(), f] as const,
  detail:  (id: string) => [...featureKeys.all, "detail", id] as const,
};

export function featureListOptions(filters: Filters = {}) {
  return queryOptions({
    queryKey: featureKeys.list(filters),
    queryFn:  () => adminClient.get<ListEnvelope<FeatureItem>>("/admin/...", params),
  });
}
```

---

## 6. Mutation Pattern

```typescript
// mutations.ts
export function useUpdateFeature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...body }: UpdateInput) =>
      adminClient.patch<void>(`/admin/.../${publicId}`, body),
    onSuccess: () => {
      toast.success("Đã cập nhật.");
      void qc.invalidateQueries({ queryKey: featureKeys.lists() });
    },
    onError: handleApiError,
  });
}
```

**Rules:**
- Always call `handleApiError` in `onError`.
- Always invalidate after success — never optimistic-update unless explicitly required.
- `toast.success` message must be Vietnamese with full diacritics.

---

## 7. API Client Rules

- Import `adminClient` from `@/lib/api/admin-client.js` (shim re-exports `@pmtl/api-client`).
- `adminClient` is JSON-only. For file uploads use raw `fetch` with `FormData` + `credentials: "include"`.
- Base URL is `/api` — all paths are relative to that: `adminClient.get("/admin/media/...")`.
- Image/media display: use `mediaPath(url)` helper (extract pathname from stored URL) so Vite proxy `/media` serves them.

---

## 8. Routing

- Routes live in `src/routes/` using TanStack Router file-based routing.
- Page components are lazy-imported; heavy feature imports use `React.lazy` + `Suspense`.
- Route path segments use **kebab-case Vietnamese**: `/noi-dung/thu-vien-phap-mon`.
- Never put page layout logic inside route files — route files only `import` and `export` the page component.

---

## 9. TypeScript Rules

- `interface` for API shapes and props. `type` for unions and utility aliases.
- No `any`. Use `unknown` + type guard when shape is truly unknown.
- Props that are React nodes: `React.ReactNode`. Never `JSX.Element | null | undefined`.
- Never use non-null assertion (`!`) on API response fields — always guard.
- Dialog-type union must include `null` as a member (closed state).

---

## 10. Style & UI Rules

- Use Tailwind utility classes. No inline `style={{}}` except for dynamic values impossible in Tailwind.
- Dark mode: all status badge classes must include `dark:` variants (see `contentStatusBadgeClass`).
- Vietnamese text in UI must have full diacritics (dấu): "Đã xuất bản", not "Da xuat ban".
- Destructive actions (delete, revoke): use `variant="destructive"` on Button and `text-destructive` on menu items.
- Use `cn()` from `@/lib/utils` to merge conditional class names.

---

## 11. What Is Forbidden

| Anti-pattern | Why |
|---|---|
| Business logic in page/route component | Breaks separation; hard to reuse |
| Direct `fetch()` inside a component (except file upload) | Bypasses TanStack Query cache |
| Hardcoded color hex values | Break dark mode and design tokens |
| Duplicating `formatFileSize`, `timeAgo`, status helpers inline | Creates drift — use `workspace-helpers` |
| Custom DropdownMenu in row actions | Inconsistent UX — use `WorkspaceRowActions` |
| Raw `<Table>` instead of `WorkspaceDataTable` | Feature-level deviation — use the shared shell |
| `any` type in API response handling | Defeats TypeScript protection |
| Non-diacritic Vietnamese text | Product rule violation |
| Committing `.env` or secret values | Security violation |

---

## 12. Detail Sheet Pattern (New Standard)

Every management page **must** have a detail sheet accessible from the table row.

**Table row action order:**
1. "Xem chi tiết" → opens `WorkspaceDetailSheet`
2. Quick status toggle (optional)
3. "Xoá" (optional quick delete for clearly deletable items)

**Inside the detail sheet:**
- Section "Thông tin" — readonly `WorkspaceDetailField` rows
- Section "Chỉnh sửa" — inline edit form with "Lưu thay đổi" button
- Section "Trạng thái" — publish/unpublish buttons (if applicable)
- Footer delete button (via `onDelete` prop on `WorkspaceDetailSheet`)

**Example scaffold:**
```tsx
<WorkspaceDetailSheet
  open={open === "detail"}
  onOpenChange={(v) => !v && handleClose()}
  title={currentRow.title}
  subtitle={`Tạo bởi ${currentRow.authorName} · ${formatDate(currentRow.createdAt)}`}
  status={<Badge className={contentStatusBadgeClass(currentRow.status)}>{contentStatusLabel(currentRow.status)}</Badge>}
  primaryActions={
    currentRow.status === "DRAFT"
      ? <Button size="sm" onClick={() => publish.mutate(currentRow.publicId)}>Xuất bản</Button>
      : <Button size="sm" variant="outline" onClick={() => unpublish.mutate(currentRow.publicId)}>Gỡ xuất bản</Button>
  }
  onDelete={() => deleteItem.mutate(currentRow.publicId, { onSuccess: handleClose })}
  deleteItemName={currentRow.title}
  isPendingDelete={deleteItem.isPending}
>
  <WorkspaceDetailSection title="Thông tin">
    <WorkspaceDetailField label="Tiêu đề" value={currentRow.title} />
    <WorkspaceDetailField label="Danh mục" value={currentRow.category} />
    <WorkspaceDetailField label="Ngày tạo" value={new Date(currentRow.createdAt).toLocaleDateString("vi-VN")} />
  </WorkspaceDetailSection>

  <WorkspaceDetailDivider />

  <WorkspaceDetailSection title="Chỉnh sửa">
    {/* inline edit form */}
  </WorkspaceDetailSection>
</WorkspaceDetailSheet>
```

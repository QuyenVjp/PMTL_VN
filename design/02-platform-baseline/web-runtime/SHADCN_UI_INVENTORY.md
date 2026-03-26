# SHADCN_UI_INVENTORY

File này chốt `seed inventory + acquisition rules` cho `shadcn/ui`.
Nó không thay design system owner docs; nó tồn tại để AI biết nên add gì, để ở đâu, và không custom bừa.

Authority liên quan:

- [FRONTEND_ARCHITECTURE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md)
- [DESIGN_PRINCIPLES.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/web-runtime/DESIGN_PRINCIPLES.md)
- [COMPONENT_SPECS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/web-runtime/COMPONENT_SPECS.md)
- [TAILWIND_CSS_4_POLICY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/web-runtime/TAILWIND_CSS_4_POLICY.md)

## Acquisition rules

- ưu tiên add component từ shadcn CLI khi component đã có fit rõ
- customize theo PMTL token/style canon trước khi tự phát minh component mới
- `packages/ui` chỉ giữ primitive hoặc customized base component có reuse thật giữa web/admin
- route-aware hoặc feature-aware composition phải ở app feature folders
- generated shadcn code sau khi copy vào repo là `repo-owned`; re-run `shadcn add` không được coi là auto-update mechanism cho component đã customize
- breaking changes từ shadcn hoặc registry update phải đi qua review/migration riêng, không overwrite component local một cách mù

## Seed set

### P0 foundation

- `button`
- `input`
- `textarea`
- `label`
- `field`
- `form`
- `select`
- `checkbox`
- `radio-group`
- `switch`
- `dialog`
- `sheet`
- `dropdown-menu`
- `tooltip`
- `sonner`

### P1 layout/navigation

- `sidebar`
- `tabs`
- `breadcrumb`
- `command`
- `separator`
- `scroll-area`
- `popover`

### P1 data surfaces

- `table`
- `pagination`
- `badge`
- `skeleton`
- `alert`
- `card`

### P2 conditional

- `calendar`
- `carousel`
- `drawer`
- `combobox`
- `data-table` pattern trên TanStack Table

## Forbidden drift

- add cả catalog shadcn từ đầu rồi để chết
- để default shadcn theme sống nguyên xi như source-of-truth thẩm mỹ
- đưa app-specific composition vào `packages/ui` chỉ vì muốn reuse sớm

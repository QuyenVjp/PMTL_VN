# SHADCN_UI_INVENTORY

File này chốt `seed inventory + acquisition rules` cho `shadcn/ui`.
Nó không thay design system owner docs; nó tồn tại để AI biết nên add gì, để ở đâu, và không custom bừa.

Authority liên quan:

- [FRONTEND_ARCHITECTURE.md](../../02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md)
- [DESIGN_PRINCIPLES.md](../../02-platform-baseline/web-runtime/DESIGN_PRINCIPLES.md)
- [COMPONENT_SPECS.md](../../02-platform-baseline/web-runtime/COMPONENT_SPECS.md)
- [TAILWIND_CSS_4_POLICY.md](../../02-platform-baseline/web-runtime/TAILWIND_CSS_4_POLICY.md)

## Acquisition rules

- ưu tiên add component từ shadcn CLI khi component đã có fit rõ
- customize theo PMTL token/style canon trước khi tự phát minh component mới
- `packages/ui` chỉ giữ primitive hoặc customized base component có reuse thật giữa web/admin
- route-aware hoặc feature-aware composition phải ở app feature folders
- generated shadcn code sau khi copy vào repo là `repo-owned`; re-run `shadcn add` không được coi là auto-update mechanism cho component đã customize
- breaking changes từ shadcn hoặc registry update phải đi qua review/migration riêng, không overwrite component local một cách mù

## Seed set

Status semantics:

- `planned` = chưa scaffold, không được giả định là đã cài
- `install-on-demand` = chỉ add khi feature thật cần
- `repo-owned after add` = sau khi `shadcn add`, code local là authority của repo

### P0 foundation

| Component | Status | Note |
|---|---|---|
| `button` | planned | add sớm ở base UI scaffold |
| `input` | planned | add sớm ở base UI scaffold |
| `textarea` | planned | add sớm ở form surface scaffold |
| `label` | planned | add cùng `input`/`field` |
| `field` | planned | preferred field wrapper when form stack is scaffolded |
| `form` | planned | add khi RHF + Zod bridge được dựng |
| `select` | planned | add cho filters/forms |
| `checkbox` | planned | add cho consent/preferences |
| `radio-group` | install-on-demand | chỉ add khi UX thật cần single-choice grouped controls |
| `switch` | planned | add cho boolean toggles |
| `dialog` | planned | add sớm cho modal confirmation/editor flows |
| `sheet` | planned | add cho mobile/off-canvas surfaces |
| `dropdown-menu` | planned | add sớm cho action menus |
| `tooltip` | install-on-demand | không add hàng loạt nếu chưa có need rõ |
| `sonner` | planned | toast baseline khi app shell có feedback lane |

### P1 layout/navigation

| Component | Status | Note |
|---|---|---|
| `sidebar` | planned | add khi app shell/navigation scaffolded |
| `tabs` | planned | add cho settings/detail surfaces |
| `breadcrumb` | install-on-demand | chỉ add nếu IA thực sự cần breadcrumb |
| `command` | install-on-demand | for command palette or fast navigation only |
| `separator` | planned | low-risk primitive, add with layout base |
| `scroll-area` | install-on-demand | only when native overflow is not enough |
| `popover` | planned | needed by several composite controls |

### P1 data surfaces

| Component | Status | Note |
|---|---|---|
| `table` | planned | base table primitive before TanStack composition |
| `pagination` | install-on-demand | only where pagination UX beats infinite list |
| `badge` | planned | cheap status primitive |
| `skeleton` | planned | required for loading-state discipline |
| `alert` | planned | baseline warning/info surface |
| `card` | planned | common surface primitive |

### P2 conditional

| Component | Status | Note |
|---|---|---|
| `calendar` | install-on-demand | only when date-picking UX really needs it |
| `carousel` | install-on-demand | avoid unless specific content UX requires it |
| `drawer` | install-on-demand | use only when `dialog`/`sheet` are not enough |
| `combobox` | install-on-demand | add when searchable select is proven needed |
| `data-table` pattern trên TanStack Table | planned pattern | compose after `table`, not as blind starter import |

## Scaffold rule

- prompt/code review phải nói rõ component nào đang `planned` hay `install-on-demand`
- AI không được giả định `components/ui/*` đã tồn tại chỉ vì file này liệt kê nó
- sau khi scaffold thật, inventory phải đổi trạng thái từ `planned` sang `installed` theo component đã add

## Forbidden drift

- add cả catalog shadcn từ đầu rồi để chết
- để default shadcn theme sống nguyên xi như source-of-truth thẩm mỹ
- đưa app-specific composition vào `packages/ui` chỉ vì muốn reuse sớm

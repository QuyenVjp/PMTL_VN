# COMPONENT_TRIGGER_MAP

File này chốt route nào thật sự cần component/library nào ở `apps/web`.
Mục tiêu là scaffold/add component theo nhu cầu thật, không add theo cảm hứng.

> Component inventory: `design/02-platform-baseline/web-runtime/COMPONENT_SPECS.md`
> Route canon: `design/04-execution-overlay/web/PAGE_INVENTORY.md`

---

## Baseline shared primitives

Gần như chắc chắn cần sớm:
- `button`
- `card`
- `input`
- `textarea`
- `label`
- `select`
- `checkbox`
- `radio-group`
- `tabs`
- `dialog`
- `sheet`
- `dropdown-menu`
- `navigation-menu`
- `tooltip`
- `separator`
- `scroll-area`
- `badge`
- `avatar`
- `skeleton`
- `breadcrumb`
- `form`
- `sonner`
- `command`
- `drawer`

---

## Conditional components

| Component | Trigger routes/surfaces | Priority | Notes |
|---|---|---|---|
| `calendar` | `/lich-ca-nhan` | P0 | shadcn `Calendar` trên `react-day-picker`; nếu date selection theo local timezone thì phải truyền `timeZone` client-detected |
| `date-picker` | profile/date fields, scheduling forms, advanced filters | P1 | composition `Popover + Calendar`; không add nếu chưa có concrete field |
| `sidebar` | member shell desktop nav | P0 | phải có `SidebarProvider`; desktop ưu tiên collapsible shell, mobile mở kiểu transient |
| `data-table` | không phải web baseline | P2 | pattern trên `table` + TanStack Table; chủ yếu admin hoặc web surface có sort/filter/visibility/selection thật |
| `carousel` | homepage spotlight nhiều slides, media gallery, justified testimonial/story strip | P2 | shadcn trên Embla; không là homepage mặc định; autoplay không bật mặc định |
| `typography` | optional docs/reference only | P2 | chỉ là utility examples; không dùng làm owner render contract thay content renderer |

---

## Route mapping

### `/dashboard`

Nên có:
- `card`
- `tabs` nếu aggregate chia cụm
- `drawer` hoặc `sheet` cho companion/details khi mobile

Không mặc định cần:
- `carousel`
- `data-table`

### `/lich-ca-nhan`

Nên có:
- `calendar`
- `date-picker` nếu có jump-to-date / date-range filter thật
- `tabs` hoặc segmented controls
- `dialog` cho event/reminder detail

### `/tim-kiem`

Nên có:
- `tabs`
- `input`
- `select` / filters
- `sheet` cho mobile filters
- `date-picker` chỉ nếu search/filter contract có date range canonical

Không mặc định cần:
- `calendar`
- `carousel`
- `data-table`

### `/bach-thoai*` và `/hoi-dap*`

Nên có:
- `tabs` ở hub level nếu cần
- `breadcrumb`
- `dialog` hoặc `sheet` nếu có source preview/audio detail

Không mặc định cần:
- `carousel`
- `data-table`

### `/tu-tap/*`

Nên có:
- `form`
- `field`
- `checkbox`
- `radio-group`
- `drawer` / `sheet`
- `dialog` confirmation

### Global shell

Nên có:
- `sidebar`
- `navigation-menu`
- `dropdown-menu`
- `tooltip`
- `command`

Sidebar notes:
- desktop member shell có thể dùng `collapsible="icon"`
- mobile open state là ephemeral, không persist như navigation preference
- nếu cần shell inset layout, phải map qua `SidebarInset`

### `/`

Có thể có:
- `carousel` chỉ khi homepage thật sự có nhiều spotlight/media items và interaction value rõ

Không mặc định cần:
- `data-table`
- `calendar`

---

## Open owner decisions still needed

- homepage có justified need cho `carousel` không
- route nào thật sự cần `date-picker` trong phase đầu ngoài `/lich-ca-nhan`
- có route public/member nào cần table thật hay không

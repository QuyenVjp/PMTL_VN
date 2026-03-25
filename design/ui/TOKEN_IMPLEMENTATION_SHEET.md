# TOKEN_IMPLEMENTATION_SHEET

File này chốt implementation-facing token sheet cho FE.
Nó nối giữa `DESIGN_PRINCIPLES.md` và runtime CSS variables / shadcn token usage.

> Design language: `design/ui/DESIGN_PRINCIPLES.md`
> Frontend architecture: `design/baseline/frontend-architecture.md`

---

## Purpose

Chốt:
- token families
- token naming
- mapping semantic -> shadcn usage
- cái gì phải là token, cái gì không

File này chưa phải bảng giá trị cuối cùng đầy đủ.
Nó là sheet để scaffold không đặt tên loạn.

---

## Token layers

### 1. Primitive

- raw palette values
- raw spacing steps
- raw radius steps
- raw shadow recipes
- raw type scale

### 2. Semantic

- background / foreground
- surface / surface-2 / surface-3
- primary / secondary / accent
- muted
- border
- success / warning / danger / info

### 3. Component

- button tokens
- input tokens
- card tokens
- nav tokens
- badge tokens
- dialog/sheet tokens

---

## Required CSS variable families

### Core shadcn-compatible

- `--background`
- `--foreground`
- `--card`
- `--card-foreground`
- `--popover`
- `--popover-foreground`
- `--primary`
- `--primary-foreground`
- `--secondary`
- `--secondary-foreground`
- `--muted`
- `--muted-foreground`
- `--accent`
- `--accent-foreground`
- `--destructive`
- `--destructive-foreground`
- `--border`
- `--input`
- `--ring`

### PMTL semantic extension

- `--success`
- `--success-foreground`
- `--warning`
- `--warning-foreground`
- `--info`
- `--info-foreground`
- `--surface-2`
- `--surface-3`
- `--hairline`
- `--focus-strong`

### Sidebar token family

- `--sidebar-background`
- `--sidebar-foreground`
- `--sidebar-primary`
- `--sidebar-primary-foreground`
- `--sidebar-accent`
- `--sidebar-accent-foreground`
- `--sidebar-border`
- `--sidebar-ring`

---

## Typography token families

- `--font-heading`
- `--font-body`
- `--font-sacred`
- `--font-mono`

- `--text-xs`
- `--text-sm`
- `--text-base`
- `--text-lg`
- `--text-xl`
- `--text-2xl`
- `--text-3xl`
- `--text-4xl`

- `--leading-tight`
- `--leading-snug`
- `--leading-normal`
- `--leading-relaxed`

---

## Radius / spacing / shadow families

### Radius

- `--radius-xs`
- `--radius-sm`
- `--radius-md`
- `--radius-lg`
- `--radius-xl`

### Spacing

- `--space-1`
- `--space-2`
- `--space-3`
- `--space-4`
- `--space-5`
- `--space-6`
- `--space-8`
- `--space-10`
- `--space-12`

### Shadow

- `--shadow-xs`
- `--shadow-sm`
- `--shadow-md`
- `--shadow-lg`

---

## Component token direction

### Button

- primary button phải dùng semantic `primary`
- secondary/subtle button không tự bịa màu ngoài token
- danger button map về `destructive`

### Input

- input background/border/focus ring phải map token
- invalid state không hardcode đỏ random ngoài token lane

### Card

- card background/border/shadow/radius phải đi qua token
- featured card variant có thể dùng component token riêng nếu thật sự lặp lại

### Navigation

- active item
- hover item
- selected tab
- bottom nav badge dot

đều nên có token/component-level vocabulary rõ, không hardcode từng route

### Sidebar

- shell sidebar phải map qua `--sidebar-*` family
- desktop collapsed/icon state không được kéo theo đổi màu hardcoded
- rail, trigger, active menu item, badge trong nav đều phải dùng token lane

---

## Open owner work still needed

- bảng giá trị cuối cùng light theme
- bảng giá trị cuối cùng dark theme
- exact font family mapping chính thức
- exact radius scale
- exact shadow recipes
- exact component-level variants cho:
  - button
  - card
  - input
  - nav
  - badge

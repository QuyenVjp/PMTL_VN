# Shadboard → PMTL Admin Port — Design Spec

**Date**: 2026-04-03
**Status**: Approved (user greenlit all 6 phases)
**Source**: `tmp/reference/shadboard/full-kit/src/`
**Target**: `apps/admin/src/`

---

## Constraints (from design/ folder)

| Dimension | Rule |
|-----------|------|
| Background | White (#FFFFFF), cards #FAFAFA |
| Typography | Inter sans-serif only (no serif headings) |
| Primary accent | Gold-500 (#B8860B), Gold-400 (#D4A847) hover |
| Semantic | Success #4A7C59, Error #C75050, Warning #C49A3C, Info #5B7FA5 |
| Dark mode | Default light, toggle to dark (keep current behavior) |
| Density | Compact, mouse-first (36px touch targets OK) |
| Color system | Keep OKLCH tokens — do NOT replace with Shadboard HSL |
| Animation | 150ms ease transitions, pulse loading (no shimmer) |
| No i18n | Vietnamese only |
| No gamification | No badges, streaks, points |

## What NOT to port

- NextAuth / Prisma adapter (admin uses PMTL API auth)
- `app/` directory / Next.js routing (admin uses TanStack Router)
- `[lang]` i18n routing
- `next/image`, `next/link` (use standard React equivalents)
- `middleware.ts` (no Next.js middleware)
- MDX docs pages (not applicable)
- RTL support (Vietnamese is LTR)

## Conversion rules for every ported file

1. Remove `"use client"` directives
2. Replace `next/link` `<Link href>` → nothing (admin uses TanStack Router `<Link to>`)
3. Replace `next/image` → `<img>` or custom wrapper
4. Replace `next/navigation` hooks → TanStack Router hooks
5. Keep all Radix UI imports unchanged (same packages)
6. Keep all Tailwind classes unchanged (same Tailwind 4 version)
7. Keep all Recharts imports unchanged (same library)
8. Adapt Shadboard HSL color references → PMTL OKLCH CSS variable names
9. All Vietnamese text with proper dấu
10. No `console.log` in production code

---

## Phase 1: Dashboard Widgets

**Goal**: Port Shadboard's rich dashboard patterns (stat cards with mini-charts, percentage change badges, chart wrappers) to improve the existing 850-line dashboard.

### Components to port

| Shadboard source | Target location | Purpose |
|-----------------|----------------|---------|
| `components/dashboards/dashboard-card.tsx` | `components/dashboard/dashboard-card.tsx` | Reusable metric card with embedded mini-chart |
| `components/dashboards/percentage-change-badge.tsx` | `components/dashboard/percentage-change-badge.tsx` | Up/down trend indicator |
| `components/ui/chart.tsx` | `components/ui/chart.tsx` | Recharts wrapper (ChartContainer, ChartTooltip, ChartLegend) |
| Analytics overview widgets (unique-visitors, bounce-rate, etc.) | Adapt for PMTL metrics | Pattern reference for stat + sparkline |
| eCommerce overview pattern | Adapt for PMTL metrics | Pattern reference for KPI cards |

### PMTL-specific dashboard widgets to build

Using Shadboard patterns but with PMTL domain data:

- **Thành viên** stat card with 7-day registration sparkline
- **Bài viết** stat card with publish trend
- **Báo cáo pending** stat card with severity breakdown mini-bar
- **Tu tập hôm nay** stat card with daily practice trend
- **Activity chart** (improved) — multi-series area chart with date range selector
- **Content status** — donut chart (Published/Draft/Archived)
- **Top content** — horizontal bar chart with labels
- **Recent activity timeline** — port Timeline component from Shadboard

### Chart types to add from Shadboard gallery

Port chart wrapper examples for future use:
- Area charts (stacked, smooth)
- Composed charts (line + bar)
- Radial bar (circular progress)
- Funnel chart

---

## Phase 2: Extended UI Components

**Goal**: Port 10+ missing extended UI components from Shadboard.

| Component | Shadboard source | Target | Use case in admin |
|-----------|-----------------|--------|-------------------|
| Timeline | `components/ui/timeline.tsx` | `components/ui/timeline.tsx` | Audit logs, activity feeds |
| Rating | `components/ui/rating.tsx` | `components/ui/rating.tsx` | Content quality indicators |
| Input Tags | `components/ui/input-tags.tsx` | `components/ui/input-tags.tsx` | Post tags, category labels |
| File Dropzone | Extended UI reference | `components/ui/file-dropzone.tsx` | Media upload |
| Show More Text | `components/ui/show-more-text.tsx` | `components/ui/show-more-text.tsx` | Long content preview |
| Input Phone | `components/ui/input-phone.tsx` | `components/ui/input-phone.tsx` | Volunteer phone fields |
| Input Group | `components/ui/input-group.tsx` | `components/ui/input-group.tsx` | Prefix/suffix icons on inputs |
| Date Range Picker | `components/ui/date-range-picker.tsx` | `components/ui/date-range-picker.tsx` | Analytics date filtering |
| Date Time Picker | `components/ui/date-time-picker.tsx` | `components/ui/date-time-picker.tsx` | Event scheduling |
| Emoji Picker | `components/ui/emoji-picker.tsx` | `components/ui/emoji-picker.tsx` | Community content |

---

## Phase 3: Notification Dropdown + Header

**Goal**: Port notification bell dropdown and improve header UX.

### Notification dropdown
- Port `components/layout/notification-dropdown.tsx`
- Bell icon with unread count badge
- Popover with notification list (icon, text, relative time, read indicator)
- "Dismiss All" action
- Wire to existing `/api/admin/notifications` endpoint
- `aria-live="polite"` for accessibility

### Header improvements
- Port fullscreen toggle (`full-screen-toggle.tsx`)
- Improve existing command palette search styling
- Add breadcrumb improvements from Shadboard pattern

---

## Phase 4: Missing UI Components

**Goal**: Fill the ~55-component gap between admin (25) and Shadboard (80+).

### Priority batches

**Batch A — High-use (port first)**:
- Alert + AlertDialog (confirmation modals)
- HoverCard
- NavigationMenu
- Progress (enhanced)
- AspectRatio
- Resizable panels

**Batch B — Forms**:
- InputFile (with preview)
- InputOTP
- InputSpin (number spinner)
- RadioGroup (if not already present)
- Slider

**Batch C — Display**:
- Carousel
- ContextMenu
- Menubar
- Accordion (enhanced)
- CodeBlock

**Batch D — Specialty**:
- BentoGrid
- MediaGrid
- StickyLayout
- Keyboard (key display)
- FileThumbnail

### Installation approach
Prefer `npx shadcn@latest add [component]` for standard components.
Manual port only for Shadboard-custom components not in shadcn registry.

---

## Phase 5: Theme Customizer Panel

**Goal**: Floating gear icon (bottom-right) that opens a settings sheet.

### Features (adapted from Shadboard)
- **Mode toggle**: Light / Dark / System (3 buttons with Sun/Moon/Auto icons)
- **Radius selector**: 0 / 0.3 / 0.5 / 0.75 / 1rem options
- **Sidebar style**: Default / Compact toggle
- **Reset to defaults** button

### What NOT to include (per PMTL constraints)
- No multi-theme color picker (keep PMTL gold brand)
- No i18n language selector
- No layout toggle (vertical/horizontal — admin is always vertical sidebar)
- No RTL toggle

### Persistence
- Save preferences to localStorage via Zustand persist middleware
- Key: `pmtl-admin-preferences`

---

## Phase 6: Design System Showcase Pages

**Goal**: Internal dev reference pages showing all available components.

### Routes (under `/he-thong/design-system/`)
- `/he-thong/design-system/colors` — Color palette with PMTL tokens
- `/he-thong/design-system/typography` — Font scale, weights, line heights
- `/he-thong/design-system/charts` — All chart types with sample data
- `/he-thong/design-system/tables` — Table variants and DataTable features
- `/he-thong/design-system/forms` — Form components gallery
- `/he-thong/design-system/icons` — Lucide icon browser
- `/he-thong/design-system/cards` — Card variant gallery
- `/he-thong/design-system/extended-ui` — Extended component demos

### Navigation
- Add "Design System" section to admin sidebar under Hệ thống group
- Visible only in development mode (`import.meta.env.DEV`)

---

## File organization

New components go to:
- `apps/admin/src/components/ui/` — base shadcn/ui components
- `apps/admin/src/components/dashboard/` — dashboard-specific widgets
- `apps/admin/src/components/layout/` — layout shell improvements
- `apps/admin/src/features/design-system/` — showcase pages (Phase 6)

Shared components that ALSO benefit web go to:
- `packages/ui/src/` — only if truly framework-agnostic

---

## Success criteria

- [ ] Dashboard has rich stat cards with sparklines and trend badges
- [ ] 9+ chart types available with consistent theming
- [ ] Extended UI components (Timeline, Rating, Tags, DateRange, etc.) working
- [ ] Notification bell dropdown functional with API data
- [ ] 80+ UI components available (up from 25)
- [ ] Theme customizer with mode/radius/sidebar preferences
- [ ] Design system showcase pages accessible in dev mode
- [ ] Zero TypeScript errors (`npx tsc --noEmit`)
- [ ] All Vietnamese text with proper dấu
- [ ] Responsive: tables scroll horizontally on mobile, grids stack

# Design Principles (Nguyên tắc thiết kế PMTL_VN)

File này hợp nhất ngôn ngữ thiết kế từ các skill:
- `taste-skill` — $150k agency-level, premium details
- `soft-skill` — luxury editorial, warm creams, serifs
- `minimalist-skill` — clean editorial, warm monochrome, bento grids
- `pmtl-creative-designer` — contemplative, premium through discipline
- `pmtl-ui-behavior` — interaction patterns
- `pmtl-vercel-precision` — sub-pixel refinement

> **Tech stack**: Next.js App Router + shadcn/ui + Tailwind CSS (web), Vite + React + shadcn/ui (admin)
> **Component specs**: `design/ui/COMPONENT_SPECS.md`
> **Admin architecture**: `design/ui/ADMIN_ARCHITECTURE.md`

---

## Core identity: "Contemplative Premium"

PMTL_VN không phải app todo, không phải social media, không phải e-commerce.
Đây là không gian tu tập — giao diện phải truyền đạt: **tĩnh lặng, trang nghiêm, ấm áp, tôn kính**.

### 3 từ khóa thiết kế

1. **Contemplative** (Chiêm nghiệm) — Mỗi trang là không gian thở. Generous whitespace, không cluttered.
2. **Warm** (Ấm áp) — Không lạnh lẽo. Cream tones, gold accents, humanistic typography.
3. **Respectful** (Tôn kính) — Nội dung Phật pháp phải được trình bày với sự trang trọng. Không gamify tu tập.

---

## Color system

### Primary palette

| Token | Hex | Dùng cho |
|---|---|---|
| `--gold-500` | `#B8860B` | Primary accent, CTAs, active states |
| `--gold-400` | `#D4A847` | Hover states, secondary accent |
| `--gold-100` | `#FDF6E3` | Subtle backgrounds, cards |
| `--cream-50` | `#FFFDF7` | Page background |
| `--cream-100` | `#FAF7F0` | Section backgrounds |
| `--warm-gray-900` | `#2D2A26` | Primary text |
| `--warm-gray-600` | `#6B6560` | Secondary text |
| `--warm-gray-300` | `#C5BFB8` | Borders, dividers |
| `--warm-gray-100` | `#F0ECE6` | Muted backgrounds |

### Semantic colors

| Token | Hex | Dùng cho |
|---|---|---|
| `--success` | `#4A7C59` | Save confirmed, practice logged |
| `--error` | `#C75050` | Validation errors, failures |
| `--warning` | `#C49A3C` | Amber, caution states |
| `--info` | `#5B7FA5` | Neutral information |

### Dark mode (Phase 2+)

Phase 1 chỉ hỗ trợ light mode. Dark mode deferred — Buddhist content thường đọc tốt hơn trên nền sáng ấm.

---

## Typography

### Font stack

```css
/* Headings — editorial feel */
--font-heading: 'Noto Serif', 'Georgia', serif;

/* Body — clear readability */
--font-body: 'Inter', 'system-ui', sans-serif;

/* Kinh text — sacred content */
--font-sacred: 'Noto Serif CJK TC', 'Noto Serif', serif;

/* Monospace — code, numbers */
--font-mono: 'JetBrains Mono', monospace;
```

### Scale

| Level | Size | Weight | Line height | Usage |
|---|---|---|---|---|
| Display | 36px / 2.25rem | 700 | 1.2 | Landing hero |
| H1 | 30px / 1.875rem | 700 | 1.3 | Page titles |
| H2 | 24px / 1.5rem | 600 | 1.35 | Section headers |
| H3 | 20px / 1.25rem | 600 | 1.4 | Card titles |
| Body | 16px / 1rem | 400 | 1.6 | Default text |
| Body large | 17px / 1.0625rem | 400 | 1.65 | Elderly-heavy screens |
| Small | 14px / 0.875rem | 400 | 1.5 | Meta, timestamps |
| Caption | 12px / 0.75rem | 500 | 1.4 | Labels, badges |

### Sacred text rules

- Kinh văn (sutra text) dùng `font-sacred` với body large size (17px+)
- Dòng kinh không bao giờ truncate — hiện đầy đủ
- Source attribution luôn hiện dưới kinh văn
- Không italic kinh văn — giữ nghiêm trang

---

## Spacing & Layout

### Spacing scale (8px grid)

```
4px  — micro (icon-text gap)
8px  — tight (related items)
12px — compact (within card)
16px — base (default padding)
24px — comfortable (section gap)
32px — spacious (between cards)
48px — generous (section break)
64px — hero (page sections)
```

### Layout principles (từ minimalist-skill)

- **Generous whitespace**: Không sợ trống. Whitespace = thở.
- **Content-first**: Nội dung quan trọng nhất ở center column, max width 680px cho reading.
- **Card-based**: Content cards với subtle shadow (`shadow-sm`) và rounded corners (`rounded-lg`).
- **Bento grid** (chỉ cho landing/dashboard): Grid layout không đều nhau, visual interest.

### Mobile-first breakpoints

```
sm: 640px   — small tablets
md: 768px   — tablets (MobileBottomNav hidden)
lg: 1024px  — desktop
xl: 1280px  — wide desktop
```

---

## Component aesthetics

### Buttons (từ taste-skill + pmtl-creative-designer)

```
Primary:
  bg: gold-500 → gold-400 on hover
  text: white
  shadow: subtle drop shadow
  border-radius: 8px
  min-height: 44px (52px for CTA)
  transition: 150ms ease

Secondary:
  bg: transparent
  border: 1px warm-gray-300
  text: warm-gray-900
  hover: cream-100 bg

Ghost:
  bg: transparent
  text: warm-gray-600
  hover: warm-gray-100 bg

Destructive:
  bg: error → darker on hover
  text: white
  Confirmation modal LUÔN bắt buộc
```

### Cards

```
bg: white (hoặc cream-50 trên cream backgrounds)
border: 1px warm-gray-100 (hoặc none nếu có shadow)
shadow: shadow-sm (hover → shadow-md transition)
border-radius: 12px
padding: 16px (mobile) / 24px (desktop)
```

### Inputs

```
border: 1px warm-gray-300
border-radius: 8px
padding: 12px 16px
font-size: 16px (tránh iOS zoom)
focus: gold-500 ring, 2px offset
error: error border + error text dưới input
placeholder: warm-gray-400
```

### Skeleton loading (từ pmtl-ui-behavior)

```
Animation: pulse (opacity 0.5 → 1 → 0.5)
Duration: 1.5s
Timing: ease-in-out
Color: warm-gray-100
Shape: match component shape (rounded-lg for cards)
❌ KHÔNG dùng shimmer (gradient slide) — distracting cho elderly
```

---

## Interaction patterns (từ pmtl-ui-behavior)

### Transitions

```
Default: 150ms ease — buttons, hovers
Slow: 200ms ease-out — modals, drawers
Page: 300ms ease — route transitions (nếu dùng)
❌ KHÔNG animate practice forms — elderly cần stability
```

### Feedback

- **Optimistic updates** cho: like, practice log save, comment post
- **Loading spinner** cho: upload, search, data fetch > 300ms
- **Toast** cho: save success, error, info — auto-dismiss 4s, max 3 stack
- **Confirmation modal** cho: delete, void vow, "dâng nhà", admin destructive actions

### Mobile gestures

- Swipe: chỉ cho navigation (back) — không cho content actions
- Pull-to-refresh: optional, chỉ cho list pages
- Long press: không dùng — elderly không quen

---

## Visual hierarchy (từ taste-skill)

### Premium details — "The $150k difference"

1. **Micro-typography**: Letter spacing -0.01em cho headings, +0.01em cho body small
2. **Subtle shadows**: Multi-layer shadows cho depth (`shadow-sm` = `0 1px 2px rgba(45,42,38,0.06), 0 1px 3px rgba(45,42,38,0.10)`)
3. **Gold accents**: Dùng tiết kiệm — chỉ cho primary CTA, active nav, important badges
4. **Icon consistency**: Lucide icons, stroke width 1.5, always 20×20 hoặc 24×24
5. **Image treatment**: Rounded corners, subtle border, lazy loading placeholder matching cream palette
6. **Dividers**: `warm-gray-100` 1px, hoặc dùng spacing thay divider khi có thể
7. **Hover states**: Mọi clickable element phải có hover state rõ ràng (color change + cursor pointer)
8. **Active states**: Gold-tinted, slight scale down (0.98) cho buttons

---

## SVG asset discipline

### Khi nào dùng `svg-precision`

Trong `design/ui/`, dùng `svg-precision` cho:
- icon studies
- component anatomy diagrams
- wireframe hoặc mockup tĩnh cần commit dưới dạng text
- chart hoặc visual explainer cần geometry chính xác

Không dùng `svg-precision` để thay cho toàn bộ visual exploration. Các quyết định về mood, rhythm, premium finish, và typography vẫn chốt ở level design system trước.

### SVG rules cho PMTL

- icon canvas mặc định: `24x24` hoặc `32x32`
- icon stroke: `1.5` hoặc `2`, `round` linecap/join
- luôn có `viewBox`
- ưu tiên absolute coordinates
- giữ `spec.json` song song với `svg`
- nếu preview cần cho review, render thêm `.preview.png`

Ref workflow: `design/SVG_PRECISION_WORKFLOW.md`

---

## Elderly UX rules (chốt — xem chi tiết ở COMPONENT_SPECS.md)

| Rule | Value | Áp dụng cho |
|---|---|---|
| Min touch target | 44×44px (48px preferred) | Mọi interactive element |
| Min body font | 16px / 17px+ cho practice | Mọi text |
| Tally buttons | 52×52px min | NgoiNhaNhoSheet |
| Play/Pause | 64×64px | ChantPlayer |
| Number font | 24px+ | Practice counting displays |
| Save button | Fixed bottom, full-width mobile, 52px height | Practice forms |
| Animation | Không animate practice forms | PracticeSheet, NgoiNhaNhoSheet |
| Tab labels | Phải có text, không icon-only | MobileBottomNav |
| Keyboard | Numeric cho số biến input | Mobile number inputs |
| Confirmation | 2-step cho destructive actions | "Dâng nhà", void vow |

---

## Contrast & accessibility

### WCAG AA requirements (minimum)

- Text on background: 4.5:1
- Large text (18px+ or 14px+ bold): 3:1
- UI components: 3:1
- Focus indicator: 3:1 against adjacent

### Color-blind safe

- Không dùng color là indicator duy nhất
- Success/error luôn có icon kèm theo (✓ / ✗)
- Status badges: color + text label

---

## Admin design (shadcn-admin style)

Admin dùng chung design tokens nhưng khác ở:

| Aspect | Web | Admin |
|---|---|---|
| Background | Cream tones | Neutral white/gray |
| Typography | Serif headings | Sans-serif throughout |
| Layout | Content-centered | Sidebar + dense data tables |
| Density | Spacious (elderly) | Compact (professional) |
| Touch target | 44-48px | 36px acceptable (mouse-first) |

Chi tiết admin architecture: `design/ui/ADMIN_ARCHITECTURE.md`

---

## Image & media guidelines

- Lazy load tất cả images dưới fold
- Placeholder: cream-colored skeleton matching card shape
- Avatar: 40×40 default, 80×80 profile, rounded-full
- Post thumbnail: 16:9 aspect ratio, object-cover, rounded-lg
- Audio waveform: simplified bar visualization, gold accent color
- Buddhist imagery: tôn trọng, không crop mặt Phật, không dùng làm decoration tùy tiện

---

## Notes for AI/codegen

- Mọi component phải support loading, empty, error states
- Không dùng emojis trong production UI (trừ nơi user tự nhập)
- Vietnamese text: kiểm tra line-breaking, dấu không bị cut
- Practice screens ưu tiên legibility over aesthetics
- Gold accent (#B8860B) dùng cho 1 focal point per screen, không rải khắp nơi
- Admin components ưu tiên data density, web components ưu tiên readability

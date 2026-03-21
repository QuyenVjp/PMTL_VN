# Spiritual App Screens — PMTL_VN

> **Triết lý màn hình**: Mỗi màn hình là **1 câu hỏi được trả lời** — không nhiều hơn.
> Dashboard: "Hôm nay tôi cần làm gì?"
> Practice: "Tôi đang niệm bài nào, đến đâu rồi?"
> Wisdom: "Câu này dạy gì?"
> Vows: "Nguyện của tôi đang ở đâu?"
>
> **Ref**: `ui/DESIGN_PRINCIPLES.md` (tokens), `ui/USER_FLOWS.md` (journeys), `ui/COMPONENT_SPECS.md` (components)

---

## Tổng quan màn hình

> **Route authority**: Routes dưới đây phải khớp với `ui/PAGE_INVENTORY.md` — file đó là canonical owner. Nếu có mâu thuẫn, PAGE_INVENTORY.md thắng.

| Screen | Route (canonical) | Auth | Owner | Priority |
|---|---|---|---|---|
| Dashboard | `/dashboard` | member+ | Content + Calendar | P0 |
| Practice Sheet | `/tu-tap/bai-tap` | member+ | Engagement | P0 |
| Ngôi Nhà Nhỏ | `/tu-tap/nha-nho` | member+ | Engagement | P0 |
| Personal Calendar | `/lich-ca-nhan` | member+ | Calendar | P0 |
| Wisdom Reader | `/bai-hoa/[slug]` | public | Wisdom-QA | P0 |
| Vow Tracker | `/phat-nguyen` | member+ | Vows-Merit | P1 |
| Search | `/tim-kiem` | public | Search | P1 |
| Practice Guide | `/kinh-bai-tap/[slug]` | public | Content | P1 |
| Profile / Account | `/tai-khoan` | member+ | Identity | P1 |
| Notifications | `/thong-bao` | member+ | Notification | P2 |

---

## Screen 1 — Dashboard (`/dashboard`)

### Vai trò
Màn hình chỉ huy hàng ngày. Người dùng mở app = mở dashboard.
Không phải social feed. Không phải stats dashboard.
**1 mục tiêu duy nhất: biết hôm nay nên làm gì.**

### Layout — Mobile (primary)

```
┌────────────────────────────────────┐
│  [Chào buổi sáng, Minh ☀]        │  ← greeting, dynamic
│  Thứ Tư · Mùng 1 tháng 3 Ất Tỵ  │  ← lunar date, always present
├────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │  ADVISORY HÔM NAY            │  │  ← Card nổi bật nhất
│  │  [Gold top border 3px]       │  │
│  │  "Ngày mùng 1 nên niệm bài   │  │
│  │   Lương Hoàng Sám. Hãy nhớ  │  │
│  │   hướng tâm trước khi bắt   │  │
│  │   đầu..."                   │  │
│  │  [Bắt đầu buổi tu →]        │  │
│  └──────────────────────────────┘  │
├────────────────────────────────────┤
│  QUICK ACTIONS                    │
│  ┌──────────┐ ┌──────────┐        │
│  │ Công     │ │ Ngôi     │        │
│  │ khóa     │ │ Nhà Nhỏ  │        │
│  └──────────┘ └──────────┘        │
│  ┌──────────┐ ┌──────────┐        │
│  │ Lịch     │ │ Phóng    │        │
│  │ cá nhân  │ │ Sanh     │        │
│  └──────────┘ └──────────┘        │
├────────────────────────────────────┤
│  TUẦN NÀY                         │
│  [Progress mini bar: 3/7 ngày]    │
│  Đã tu 3 ngày trong tuần này       │
│  [Xem lịch sử →]                  │
├────────────────────────────────────┤
│  NỘI DUNG MỚI                     │
│  [2 content cards, horizontal]    │
│  ────────────────────────────      │
│  [Bottom navigation bar]          │
└────────────────────────────────────┘
```

### Layout — Desktop

```
┌──────────────────────────────────────────────────────────────────┐
│  [Sidebar]  │  Chào buổi sáng, Minh ☀                           │
│             │  Thứ Tư · Mùng 1 tháng 3 Ất Tỵ                   │
│  [Nav items]│                                                    │
│             │  ┌─────────────────────────┬──────────────────┐   │
│             │  │  ADVISORY HÔM NAY       │  TUẦN NÀY        │   │
│             │  │  [Full advisory text]   │  [Week grid]     │   │
│             │  │  [Bắt đầu buổi tu →]   │  M T W T F S S   │   │
│             │  │                         │  ✓ ✓ ● ○ ○ ○ ○  │   │
│             │  └─────────────────────────┴──────────────────┘   │
│             │                                                    │
│             │  ┌──────────────────────────────────────────┐     │
│             │  │  QUICK ACTIONS — 4 cards horizontal       │     │
│             │  └──────────────────────────────────────────┘     │
│             │                                                    │
│             │  ┌──────────────────────────────────────────┐     │
│             │  │  NỘI DUNG MỚI — 3-col content cards      │     │
│             │  └──────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

### Advisory Card specs

```
Visual hierarchy:
  1st: Card title "Advisory hôm nay"
  2nd: Advisory text (body của ngày)
  3rd: CTA button

Card:
  bg: white
  border-top: 3px solid --gold-500
  border-radius: 12px
  padding: 20px
  shadow: shadow-md (quan trọng nhất trên trang)

Title bar:
  left: "Advisory hôm nay" — 12px Inter 600 uppercase gold-500 letter-spacing 0.06em
  right: lunar date tag — 12px capsule warm-gray-100

Advisory text:
  font: Noto Serif 17px 400, warm-gray-800
  line-height: 1.75
  max-lines: 4 (expandable)
  "Xem thêm" link nếu text dài

CTA:
  "Bắt đầu buổi tu →" — gold-500 button, full width mobile, 48px height
```

### Quick Action buttons

```
Grid: 2×2 (mobile), 4×1 (desktop)
Each button:
  bg: cream-100
  border: 1px warm-gray-100
  border-radius: 12px
  height: 80px
  padding: 12px 16px
  icon: 24×24 Lucide (stroke 1.5, gold-500)
  label: 14px Inter 500 warm-gray-800
  hover: cream-50 bg + shadow-sm
  tap: scale 0.97

Actions: Công khóa, Ngôi Nhà Nhỏ, Lịch cá nhân, Phóng Sanh
```

### Week progress strip

```
Label: "TUẦN NÀY" — 11px Inter 700 uppercase warm-gray-400 tracking-widest
Days: M T W T F S S — each 32×32px circle
  - Completed: gold-500 fill + white checkmark
  - Today: gold-200 fill + warm-gray-900 letter
  - Future: warm-gray-100 fill + warm-gray-400 letter
  - NO streak indicator, NO glow animation — chỉ render trạng thái thực tế

Sub-text: "Đã tu X ngày trong tuần này" — 13px warm-gray-500
  ❌ KHÔNG dùng "Chuỗi X ngày" — streak framing là gamification
  ❌ KHÔNG highlight "current day" với gold glow/pulse — tránh game feel
```

### Greeting logic

```
Sáng (5:00–11:59):   "Chào buổi sáng, {tên} ☀"
Trưa (12:00–13:59):  "Chào buổi trưa, {tên}"
Chiều (14:00–17:59): "Chào buổi chiều, {tên}"
Tối (18:00–4:59):    "Chào buổi tối, {tên} 🌙"

Đặc biệt — mùng 1/15: "Mùng 1 tháng {X}, {tên} — ngày tốt để tu tập đặc biệt"
```

### First-visit state

```
Banner onboarding (dismissible):
  bg: cream-100 với gold-500 left border
  "Chào mừng đến PMTL! Bắt đầu bằng cách khám phá công khóa cho người mới →"
  Dismiss X button (top-right)
  KHÔNG intrusive — không modal, không overlay
```

---

## Screen 2 — Practice Sheet (`/tu-tap/bai-tap`)

### Vai trò
Workspace chính của buổi tu học. Nơi người dùng **check bài niệm, nhập số biến, lưu buổi tu**.
Elderly-first design — mọi target 48px+.

### Layout — Mobile (primary)

```
┌────────────────────────────────────┐
│  ← Công khóa                      │  ← back
│                                    │
│  ┌──────────────────────────────┐  │
│  │ Advisory context (mini card) │  │  ← reminder ngữ cảnh ngày
│  └──────────────────────────────┘  │
│                                    │
│  DANH SÁCH BÀI NIỆM               │
│  ┌──────────────────────────────┐  │
│  │ ☑ Bài 1: [Tên bài]          │  │
│  │  ▷ Nghe hướng dẫn           │  │
│  │  [Companion guide ↓]        │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ ☐ Bài 2: [Tên bài]          │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ Số biến hôm nay              │  │
│  │  ┌──────┐ ─  ┌──────┐ +     │  │  ← tally counter
│  │  │  0   │    │      │       │  │
│  │  └──────┘    └──────┘       │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ GHI CHÚ (tùy chọn)          │  │
│  │ [textarea]                   │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │     [ LƯU BUỔI TU ]         │  │  ← fixed bottom, full width
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

### Practice item row

```
height: min 64px (elderly comfortable)
padding: 16px
border-bottom: 1px warm-gray-100

Left: checkbox 24×24px — gold-500 checked, warm-gray-300 unchecked
  Tap target: 48×48px (expanded touch area)

Title: 17px Inter 500 warm-gray-900 (completed: line-through warm-gray-400)
Subtitle: "▷ Nghe hướng dẫn" — 13px warm-gray-500, tapable

Expand row (companion guide):
  Trigger: tap vào row hoặc "Companion guide ↓" text
  Shows: 2-4 lines hướng dẫn thực hành, cream-50 bg, left-indent 16px
  Font: 15px Noto Serif 400 warm-gray-700 italic
```

### Tally counter (số biến)

```
Container: cream-100 bg, border-radius 12px, padding 16px

Label: "Số biến hôm nay" — 14px Inter 600 warm-gray-700

Layout:
  [ − ] [ number display ] [ + ]

  Minus button: 52×52px, bg warm-gray-100, border-radius 50%, warm-gray-700
  Number: 32px Inter 700 warm-gray-900, min-width 64px, text-center
  Plus button: 52×52px, bg gold-100, border-radius 50%, gold-500

  Tap feedback: scale(0.92) + 80ms, haptic if available

Input field dưới counter:
  Nếu user muốn nhập số trực tiếp: tap vào number → keypad mở
  Keypad: numeric-only (inputMode="numeric")
  Font: 24px (tránh iOS zoom)
```

### Fixed Save button

```
Position: fixed bottom 0, z-index 50
bg: white với border-top 1px warm-gray-100
padding: 12px 16px + safe-area-inset-bottom

Button:
  text: "Lưu buổi tu"
  bg: gold-500 → gold-400 hover
  height: 52px
  width: 100%
  border-radius: 8px
  font: Inter 16px 600

Disable state:
  bg: warm-gray-200 (no practice recorded)
  text: warm-gray-500
  not clickable

Loading state:
  spinner (16px, white) left of text
  text: "Đang lưu..."
  disable button during save
```

### Post-save state

```
Toast: "Đã lưu buổi tu #47 ✓"
  top-center, cream bg + gold border, 4s auto-dismiss

If special day (mùng 1, 15):
  After toast: gentle prompt card appears
  "Hôm nay là mùng 1 — cập nhật Ngôi Nhà Nhỏ nhé?"
  [Cập nhật ngay] [Để sau]
  — NOT a modal, NOT blocking
```

### Companion Guide drawer

```
Trigger: tap "Companion guide" or chevron-down icon
Type: slide-up drawer (not modal), partial height (40vh)

Header: "Hướng dẫn thực hành" — 16px Noto Serif 600
Content:
  - Guide text (Noto Serif 16px, line-height 1.8)
  - May include: đọc đúng cách, chú ý gì khi niệm, lịch sử bài
  - NO gamification, NO points

Close: drag down hoặc tap outside
```

---

## Screen 3 — Ngôi Nhà Nhỏ (`/tu-tap/nha-nho`)

### Vai trò
Theo dõi tiến độ "Ngôi Nhà Nhỏ" — tích lũy số biến để hoàn thành một ngôi nhà.
Đây là **tính năng thiêng liêng nhất** — design phải trang trọng, không gamify.

### Concept thiết kế

"Ngôi nhà không phải achievement badge. Đây là hình thức tu học tích lũy — như xây từng viên gạch bằng tâm niệm."
→ Không dùng progress bar kiểu game
→ Không có animation nổ confetti khi đạt mốc
→ Chỉ: số liệu rõ ràng + hành động đơn giản

### Layout — Mobile

```
┌────────────────────────────────────┐
│  ← Ngôi Nhà Nhỏ                   │
│                                    │
│  ┌──────────────────────────────┐  │
│  │                              │  │
│  │   [SVG Ngôi Nhà]            │  │
│  │   Ngôi nhà #3                │  │
│  │                              │  │
│  │   42,800 / 49,000 biến       │  │
│  │   ══════════════════░░ 87%   │  │
│  │                              │  │
│  │   Còn 6,200 biến             │  │
│  └──────────────────────────────┘  │
│                                    │
│  NHẬP BIẾN HÔM NAY                │
│  ┌──────────────────────────────┐  │
│  │  [ − ] [ 0 ] [ + ]           │  │  ← tally input
│  │  hoặc nhập tay              │  │
│  └──────────────────────────────┘  │
│                                    │
│  LỊCH SỬ GẦN ĐÂY                 │
│  20/03: +500 biến                 │
│  19/03: +300 biến                 │
│  18/03: +200 biến                 │
│  [Xem tất cả →]                   │
│                                    │
│  [Cập nhật Ngôi Nhà]              │  ← fixed bottom
└────────────────────────────────────┘
```

### SVG Ngôi Nhà

```
Canvas: 200×180px centered
Style: simple house outline, minimalist
  - Roof: triangle, stroke 2px warm-gray-700
  - Walls: rectangle outline, stroke 2px warm-gray-700
  - Door: centered at bottom, stroke 1.5px
  - Windows: 2 small squares, stroke 1.5px

Fill progression (NOT game-like):
  0-24%: house outline only (warm-gray-200 bg)
  25-49%: subtle gold-100 fill appears
  50-74%: gold-200 fill, walls more defined
  75-99%: gold-300 fill, all lines clear
  100% (Dâng nhà): gold-400 fill, warm glow (box-shadow blur)

"Dâng nhà" state:
  Additional text below house: "Đã hoàn thành · Sẵn sàng dâng nhà"
  Button changes: "Dâng nhà" — warm red (#8B3030) — requires 2-step confirm
```

### Progress display

```
Number display:
  "42,800 / 49,000 biến" — 20px Inter 600 warm-gray-900
  Number formatted: vi-VN locale (dấu chấm ngăn hàng nghìn)

Progress bar:
  height: 8px
  bg: warm-gray-100
  fill: gold-400, border-radius full
  NO animation on mount (just renders at current state)
  Below: "Còn {X} biến" — 14px warm-gray-500

House number:
  "Ngôi nhà #3" — 13px Inter 500 warm-gray-500 (above progress)
```

### Dâng nhà — 2-step confirm

```
Step 1: Tap "Dâng nhà" button
  → Modal appears:
    Title: "Xác nhận dâng nhà?"
    Body: "Ngôi nhà #3 với 49,000 biến sẽ được ghi lại.
           Hành động này không thể hoàn tác."
    Actions: [Xác nhận dâng] [Hủy]
    Xác nhận: warm red (#8B3030), 48px height
    Hủy: ghost, warm-gray-600

Step 2: After confirm
  → Success state:
    SVG house: gold fill + soft shadow
    Text: "Đã dâng ngôi nhà #3 ✓"
    Subtext: "Ngôi nhà mới #4 đã bắt đầu"
    No confetti, no big animation — just quiet acknowledgment
    [Về Dashboard]
```

---

## Screen 4 — Personal Calendar (`/lich-ca-nhan`)

### Vai trò
Xem lịch tu học cá nhân — kết hợp: lịch âm, advisory sắp tới, sự kiện tổ chức.
Read-only view (không tạo event từ đây).

### Layout — Mobile

```
┌────────────────────────────────────┐
│  Lịch cá nhân                     │
│  Tháng 3, 2025                    │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  T2  T3  T4  T5  T6  T7  CN │  │
│  │  17  18  19  20  21  22  23  │  │
│  │  [●] [ ] [○] [ ] [今] [ ] [ ] │  │
│  │  24  25  26  27  28  29  30  │  │
│  └──────────────────────────────┘  │
│  ● đã tu  ○ chưa tu  今 hôm nay   │
│                                    │
│  HÔM NAY — Thứ Sáu 21/3           │
│  Mùng 22 tháng 2 Ất Tỵ            │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ Advisory: [text...]          │  │
│  │ [Bắt đầu tu học]             │  │
│  └──────────────────────────────┘  │
│                                    │
│  SẮP ĐẾN                          │
│  ┌──────────────────────────────┐  │
│  │ Mùng 1 tháng 3 · 29/3       │  │
│  │ Ngày quan trọng tu tập       │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ [Event tổ chức nếu có]       │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

### Calendar grid

```
Days of week header: T2 T3 T4 T5 T6 T7 CN
  - 12px Inter 600 warm-gray-500, text-center

Day cell: 40×40px
  States:
    Completed: bg gold-100, center dot gold-500
    Today: bg warm-gray-900, text white, ring gold-400 2px offset
    Future special (mùng 1/15): gold-200 bg, small star top-right
    Future normal: transparent, warm-gray-700
    Past uncompleted: warm-gray-100 bg, warm-gray-400 text

  Tap: navigate to that day's advisory
```

### Upcoming items

```
Card style: cream bg, rounded-12, border 1px warm-gray-100

Left: date indicator
  month day: "29" — 20px Noto Serif 600 warm-gray-900
  month label: "Tháng 3" — 11px warm-gray-400

Separator: 1px warm-gray-100 vertical

Right:
  title: 15px Inter 500 warm-gray-900
  tags: capsule chips (mùng 1, phóng sanh, sự kiện...)
```

---

## Screen 5 — Wisdom Reader (`/bai-hoa/[slug]`)

### Vai trò
Đọc bài Bạch Thoại Phật Pháp — immersive, distraction-free.
Tương tự Kindle mode: chữ to, ít chrome, dễ đọc.

### Layout — Mobile

```
┌────────────────────────────────────┐
│  ← Bạch Thoại             [⋯]     │  ← minimal nav, options
│                                    │
│  [Cover image 16:9]               │
│                                    │
│  Tựa đề bài                        │
│  Tập 2 · Chương 3                 │
│  ── Source attribution            │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ [Audio player - if exists]   │  │  ← expandable player
│  │ ▶ 00:00 ───────── 45:23     │  │
│  └──────────────────────────────┘  │
│                                    │
│  Nội dung bài                      │
│  [Noto Serif 18px, line-height    │
│   1.85, warm-gray-800]            │
│                                    │
│  ...reading continues...           │
│                                    │
│  [Bottom: bookmark + share]       │
└────────────────────────────────────┘
```

### Reading area typography

```
Font: --font-sacred (Noto Serif CJK TC fallback → Noto Serif)
Size: 18px (default), adjustable 16px/18px/20px/22px
Line-height: 1.85
Color: --warm-gray-800
Max-width: 660px, margin: 0 auto
Padding: 0 20px

Paragraph spacing: 1.5em
No justified text (dễ đọc hơn cho Vietnamese)
```

### Reader settings drawer

```
Trigger: [⋯] top-right
Content:
  Cỡ chữ: [A−] [A] [A+]
  (khoảng cách dòng: không cần — mặc định đủ tốt)
  [Đánh dấu trang] toggle
  [Chia sẻ] → share sheet

Design: slide-up panel, 200px height, cream bg, rounded top
```

### Audio player (khi có)

```
Collapsed (default):
  Show: play/pause + time + title
  Height: 56px
  bg: warm-gray-900 (dark, để phân biệt với reading area)
  text/icons: white + gold-400

Expanded (tap to expand):
  Adds: progress bar, skip -15s / +15s, speed control
  Height: 140px

Play/Pause button:
  Size: 44×44px (collapsed), 56×56px (expanded)
  Khi expanded, vùng safe không che text đọc
```

### Sacred text rules enforcement

```
Kinh văn blocks (nếu có trong bài):
  font-family: --font-sacred
  font-size: 17px (KHÔNG nhỏ hơn)
  color: warm-gray-900 (KHÔNG dùng màu khác)
  border-left: 2px solid gold-400
  padding-left: 16px
  font-style: normal (KHÔNG italic)
  NO truncation
  Source line bên dưới: 13px warm-gray-400

Buddhist images trong bài:
  object-fit: contain (KHÔNG crop)
  Caption: Noto Serif 14px italic warm-gray-500
  Không center-crop mặt Phật
```

---

## Screen 6 — Vow Tracker (`/phat-nguyen`)

### Vai trò
Xem và theo dõi các nguyện đã phát. Tạo nguyện mới.
**Không gamify** — không streak counter, không achievement, không leaderboard.

### Layout — Mobile

```
┌────────────────────────────────────┐
│  Phát Nguyện                  [+] │
│                                    │
│  ĐANG THỰC HIỆN                   │
│  ┌──────────────────────────────┐  │
│  │ Niệm 10,000 biến Đại Bi     │  │
│  │ ████████████░░░░░░ 68%       │  │
│  │ 6,800 / 10,000 biến          │  │
│  │ Hạn: 15/4/2025 · Còn 25 ngày│  │
│  │ [Cập nhật tiến độ]           │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ Phóng sanh 3 lần tháng 3    │  │
│  │ ██░░░░░░░░░░░░░░ 33%         │  │
│  │ 1 / 3 lần                    │  │
│  │ [Cập nhật tiến độ]           │  │
│  └──────────────────────────────┘  │
│                                    │
│  ĐÃ HOÀN THÀNH                    │
│  [Vow 1] · [Vow 2] → collapsed   │
│  [Xem tất cả →]                   │
└────────────────────────────────────┘
```

### Active vow card

```
bg: white
border: 1px warm-gray-100
border-radius: 12px
padding: 16px 20px

Title: 16px Noto Serif 600 warm-gray-900
Progress bar:
  height: 6px (subtle, không nổi bật như game)
  bg: warm-gray-100
  fill: gold-400
  No animation

Numbers: "6,800 / 10,000 biến" — 14px Inter 400 warm-gray-600
Deadline: "Hạn: 15/4 · Còn 25 ngày" — 13px warm-gray-500
  - Nếu còn ≤ 7 ngày: warning color (#C49A3C)
  - Nếu đã quá hạn: error color (#C75050) + "(Đã quá hạn)"

[Cập nhật tiến độ]: ghost button, 36px height
```

### Create vow flow

```
[+] → slide-up form:
  Title: "Phát nguyện mới"

  Fields:
    - Nội dung nguyện (textarea, required)
      placeholder: "VD: Niệm 10,000 biến..."
    - Số mục tiêu (optional, number)
    - Đơn vị (optional: biến, lần, ngày, ...)
    - Ngày bắt đầu (date picker — defaults today)
    - Hạn chót (optional date picker)
    - Ghi chú (textarea optional)

  Submit: "Phát nguyện" — gold-500 button
  Cancel: ghost "Hủy"
```

---

## Screen 7 — Search (`/tim-kiem`)

### Vai trò
Tìm kiếm nội dung tu học: Bạch Thoại, bài viết, hỏi đáp, kinh bài tập.
Phase 1: SQL-based. Phase 2+: Meilisearch. UI không đổi.

### Layout — Mobile

```
┌────────────────────────────────────┐
│  ┌──────────────────────────────┐  │
│  │ 🔍 Tìm kiếm...              │  │
│  └──────────────────────────────┘  │
│                                    │
│  [Tab: Tất cả] [Bạch Thoại] [Hỏi] │
│                                    │
│  (empty state — chưa search):      │
│  "Bạn đang tìm gì?"               │
│  GỢI Ý:                           │
│  • Vô thường                       │
│  • Phóng sanh                      │
│  • Hướng dẫn niệm Phật            │
│                                    │
│  (khi có kết quả):                 │
│  ┌──────────────────────────────┐  │
│  │ [Result card 1]              │  │
│  │ tag · title · excerpt        │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ [Result card 2]              │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

### Search bar

```
Input:
  height: 48px
  border-radius: 24px (pill shape)
  bg: cream-100
  focus: white bg + gold-500 ring
  font: 16px Inter (prevent iOS zoom)
  left icon: search 20px warm-gray-400
  right: X (clear) khi có text, 20px warm-gray-400

Debounce: 300ms trước khi trigger search
```

### Result card

```
bg: white, border-radius 12px, padding 14px 16px
shadow: shadow-sm

Top: [module tag] e.g. "Bạch Thoại" — 12px capsule gold-100/gold-400
Title: 16px Noto Serif 500 warm-gray-900
Excerpt: 2 lines, 14px Inter 400 warm-gray-600
  - Highlight match: bg gold-100, không bold (quá nặng)
```

---

## Screen 8 — Profile / Account (`/tai-khoan`)

### Vai trò
Xem và cập nhật hồ sơ cá nhân. **Không phải social profile** — không public stats.

### Layout — Mobile

```
┌────────────────────────────────────┐
│  Hồ sơ                      [⚙]   │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  [Avatar 80×80]              │  │
│  │  Nguyễn Văn Minh             │  │
│  │  Thành viên từ tháng 3/2024  │  │
│  │  [Chỉnh sửa hồ sơ →]        │  │
│  └──────────────────────────────┘  │
│                                    │
│  CÀI ĐẶT                          │
│  [Nhắc nhở tu học]      [toggle]  │
│  [Cỡ chữ mặc định]     [16px ▼]  │
│  [Thông báo]            [toggle]  │
│                                    │
│  TÀI KHOẢN                        │
│  [Đổi mật khẩu →]                 │
│  [Email: m***@gmail.com]          │
│                                    │
│  [Đăng xuất]                      │
│                                    │
└────────────────────────────────────┘
```

---

## Global States — Patterns cho mọi màn hình

### Loading states

```
Page-level (full screen load):
  Skeleton: match layout shape với warm-gray-100 blocks
  Pulse animation: 1.5s ease-in-out (opacity 0.5→1→0.5)
  KHÔNG shimmer gradient (distracting for elderly)

Component-level:
  Same skeleton, smaller scope

Data fetch > 300ms:
  Show skeleton sau 300ms delay (tránh flash)
```

### Empty states

```
Center the page when list is empty
Icon: Lucide icon (muted, warm-gray-300, 48px)
Title: "Chưa có {item}" — 17px Noto Serif warm-gray-700
Body: Explain what to do — 15px Inter warm-gray-500
CTA: relevant action button (optional)

Examples:
  Practice history: "Chưa có buổi tu nào được ghi lại"
  Bookmarks: "Chưa có trang được đánh dấu"
  Vows: "Bạn chưa phát nguyện nào · [Phát nguyện đầu tiên →]"
```

### Error states

```
Full-page error (network/server):
  Icon: wifi-off or alert-circle, warm-gray-300, 48px
  Title: "Không tải được nội dung" — 17px
  Body: "Kiểm tra kết nối internet và thử lại"
  Button: "Thử lại" — ghost button

Inline error (form):
  Red text + icon dưới input
  font: 13px Inter 400 --error
  KHÔNG popup, KHÔNG toast cho validation errors
```

### Offline behavior

```
Banner (khi mất kết nối):
  Fixed top, bg --warning (#C49A3C), text white
  "Đang offline · Một số tính năng có thể không khả dụng"
  Dismiss X sau 5s

Cached content:
  Load từ cache bình thường
  Subtle "Xem nội dung offline" badge trên cached items

Actions không thể offline:
  Disable button + tooltip: "Cần kết nối để lưu"
```

---

## Bottom Navigation (Mobile)

```
Tabs: 5 mục
  1. Trang chủ (Home icon)
  2. Tu tập (Layers icon)
  3. Pháp bảo (BookOpen icon)
  4. Lịch (Calendar icon)
  5. Hồ sơ (User icon)

Each tab:
  icon: 24×24 Lucide, stroke 1.5
  label: 11px Inter 500 (LUÔN CÓ TEXT — không icon-only)
  active: gold-500 icon + gold-500 text
  inactive: warm-gray-400

Height: 56px + safe-area-inset-bottom
bg: white
border-top: 1px warm-gray-100
```

---

## Sidebar Navigation (Desktop)

```
Width: 240px fixed left
bg: cream-50
border-right: 1px warm-gray-100
padding: 24px 0

Top: Logo PMTL_VN (24px Noto Serif 600)

Nav sections:
  TU HỌC
    Tổng quan (dashboard icon)
    Công khóa (clipboard icon)
    Ngôi Nhà Nhỏ (home icon)
    Lịch cá nhân (calendar icon)

  PHÁP BẢO
    Bạch Thoại (book-open icon)
    Hỏi Đáp (help-circle icon)
    Phóng Sanh (leaf icon)
    Phát Nguyện (circle-check icon)

  CỘNG ĐỒNG
    Sổ lưu niệm (pen-line icon)
    Bài viết (file-text icon)
    Tìm kiếm (search icon)

Section headers:
  11px Inter 700 uppercase warm-gray-400 tracking-widest
  padding: 16px 20px 8px

Nav items:
  height: 40px
  padding: 0 20px
  font: 14px Inter 500 warm-gray-700
  icon: 18px left, warm-gray-500
  active: bg cream-100 + gold-500 left border 2px + gold-500 text/icon
  hover: bg cream-100

Bottom: User mini-profile + settings link
```

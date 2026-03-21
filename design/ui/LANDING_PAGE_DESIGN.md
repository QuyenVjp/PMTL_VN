# Landing Page Design — PMTL_VN

> **Triết lý**: Landing page không phải trang bán hàng. Đây là **cổng vào không gian tu học** — người đến đây đang tìm sự tĩnh lặng, hướng dẫn, và cộng đồng.
> **Không bắt chước**: tránh SaaS generic, tránh app store screenshot dump, tránh countdown timer.
> **Hướng đến**: Editorial premium — tương tự Kinfolk magazine, nhưng kỹ thuật số và Phật giáo Việt.

---

## Concept direction: "Cổng Vào Ngôi Đền"

Mỗi section là một bước đi sâu hơn vào không gian tu học.
Người dùng đọc từ trên xuống như đang bước vào sân, vào điện, vào nội tâm.
Motion chỉ để **dẫn dắt sự chú ý**, không để giải trí.

---

## Tổng quan cấu trúc (7 sections)

```
[S1] The Gate       — Hero: Lời mời nhập môn
[S2] Five Gates     — 5 Đại Pháp Bảo: cổng vào 5 con đường
[S3] Philosophy     — Triết lý: đây không phải app todo
[S4] Daily Flow     — Thực tế tu học hằng ngày
[S5] Wisdom Taste   — Nếm thử nội dung Bạch Thoại / Hỏi Đáp
[S6] Community Warmth — Cộng đồng ấm áp, không performative
[S7] Begin          — CTA cuối: lời mời nhẹ nhàng
```

---

## Section 1 — The Gate (Hero)

### Mục đích
Trả lời ngay: "Đây là gì?" và "Tôi có muốn vào không?"
Không nhồi thông tin. Để yên không gian thở.

### Layout — Desktop (1280px+)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   [NAV]  Logo PMTL_VN          [Đăng nhập]  [Bắt đầu]         │
│                                                                  │
│                                                                  │
│                      ┌──────────────┐                           │
│                      │  [SVG Lotus] │  ← subtle, not dominant  │
│                      └──────────────┘                           │
│                                                                  │
│              Hành trình tu học                                   │
│              của bạn bắt đầu                                    │
│              từ đây                                              │
│                                                                  │
│     Nền tảng hỗ trợ 5 đại pháp bảo — cho người mới             │
│     lẫn người đã tu học nhiều năm.                              │
│                                                                  │
│              [ Bắt đầu tu học · Miễn phí ]                     │
│              Đã có tài khoản? Đăng nhập →                      │
│                                                                  │
│                    ↓  Khám phá thêm                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
   Background: --cream-50 (#FFFDF7)
   100vh
```

### Layout — Mobile

```
┌────────────────────────┐
│  Logo PMTL     [Menu] │
│                        │
│    [SVG Lotus Small]  │
│                        │
│  Hành trình tu học    │
│  của bạn bắt đầu      │
│  từ đây               │
│                        │
│  Nền tảng hỗ trợ 5    │
│  đại pháp bảo...       │
│                        │
│  [Bắt đầu tu học]     │
│  Đăng nhập →          │
└────────────────────────┘
   100svh (safe viewport)
```

### Typography specs

| Element | Font | Size | Weight | Color | Letter-spacing |
|---|---|---|---|---|---|
| Headline L1 | Noto Serif | 56px / 3.5rem | 700 | --warm-gray-900 | -0.02em |
| Headline L2 | Noto Serif | 48px / 3rem | 700 | --warm-gray-900 | -0.02em |
| Subtitle | Inter | 20px / 1.25rem | 400 | --warm-gray-600 | 0 |
| CTA Button | Inter | 16px / 1rem | 600 | white | +0.02em |
| Ghost link | Inter | 15px / 0.9375rem | 400 | --warm-gray-600 | 0 |

**Mobile:** Headline giảm xuống 36px (L1) / 32px (L2).

### SVG Lotus

- Icon lotus đơn, minimalist, centered
- Size: 80×80px desktop, 60×60px mobile
- Color: gold-400 (#D4A847), stroke only, không fill
- Stroke: 1.5px
- Animation: opacity fade-in 0.8s ease-out trên page load (chỉ 1 lần)
- KHÔNG spin, KHÔNG pulse — chỉ appear quietly

### CTA Button

```
Primary CTA:
  text: "Bắt đầu tu học · Miễn phí"
  bg: --gold-500
  hover: --gold-400, slight shadow lift (translateY -1px)
  height: 52px
  padding: 0 40px
  border-radius: 8px
  font: Inter 16px 600
  transition: 150ms ease
  min-width: 240px (desktop), 100% width (mobile)

Ghost CTA (sub-action):
  text: "Đã có tài khoản? Đăng nhập →"
  color: --warm-gray-600
  hover: --warm-gray-900
  no border, no bg
  font: 15px 400
  margin-top: 16px
```

### Navbar

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo: PMTL_VN wordmark, Noto Serif]   [Đăng nhập] [Bắt đầu] │
└─────────────────────────────────────────────────────────────┘
  height: 64px
  bg: transparent (sticky: cream-50/90 backdrop-blur)
  border-bottom: none (sticky: 1px warm-gray-100)
  Logo: 24px Noto Serif 600, gold-500 cho "PMTL", warm-gray-900 cho "_VN"

  Mobile: Logo + hamburger icon
```

### Scroll indicator

```
Position: bottom-center, 40px from bottom
Content: "↓ Khám phá thêm" — tiny, warm-gray-400, 12px
Animation: bounce gently (translateY 0 → 6px → 0), 2s loop
Disappears: when user scrolls past 100px
```

---

## Section 2 — Five Gates (Năm Đại Pháp Bảo)

### Mục đích
Cho người dùng thấy ngay **5 con đường tu học** chính. Mỗi cổng là một thế giới.
Layout phải trực quan, không cần text giải thích nhiều. Hình ảnh dẫn dắt.

### Layout — Desktop Bento Grid

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  NĂM ĐẠI PHÁP BẢO                                            │
│  Năm con đường hỗ trợ bởi PMTL                               │
│                                                                │
│  ┌──────────────────────┬──────────────┐                      │
│  │                      │              │                      │
│  │   Niệm Kinh          │ Phát Nguyện  │                      │
│  │   (Tall card)        │ (Square)     │                      │
│  │   2 cols wide        │              │                      │
│  │                      ├──────────────┤                      │
│  │                      │              │                      │
│  ├──────────────────────┤ Phóng Sanh   │                      │
│  │                      │ (Square)     │                      │
│  │   Hỏi Đáp            │              │                      │
│  │   (Wide card)        ├──────────────┘                      │
│  │   3 cols wide        │                                     │
│  │                      │                                     │
│  ├──────────────────────┴──────────────┐                      │
│  │   Bạch Thoại Phật Pháp              │                      │
│  │   (Full width card)                 │                      │
│  └─────────────────────────────────────┘                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
  Section bg: --cream-100
  Grid: 5-column, gap: 16px
  Container max-width: 1140px
```

### Grid template (CSS Grid areas)

```css
grid-template-areas:
  "niem-kinh   niem-kinh   phat-nguyen  phat-nguyen  phong-sanh"
  "hoi-dap     hoi-dap     hoi-dap      phong-sanh   phong-sanh"
  "bach-thoai  bach-thoai  bach-thoai   bach-thoai   bach-thoai";
grid-template-rows: 220px 180px 160px;
```

### Layout — Mobile

```
Stack vertically, 1 column:
  - Niệm Kinh (tall, 200px)
  - Phát Nguyện + Phóng Sanh (2-col, 160px each)
  - Bạch Thoại (wide, 160px)
  - Hỏi Đáp (wide, 160px)
Gap: 12px
```

### Card specs — Mỗi Pháp Bảo Card

```
bg: white
border-radius: 16px
overflow: hidden
cursor: pointer
transition: transform 200ms ease, shadow 200ms ease
hover: translateY(-3px) + shadow-md

Content structure:
  [Icon area - top]
    icon: 32×32px SVG (custom, stroke 1.5, gold-400)
  [Text area - bottom]
    title: H3 font (20px Noto Serif 600)
    tagline: 14px Inter 400 warm-gray-600 (1 line max)
  [Hover overlay]
    bg: rgba(184,134,11,0.05) — subtle gold wash
    description: 2-3 lines, appear on hover
    CTA: "Khám phá →" gold-500 link
```

### Five card content

| Pháp Bảo | Icon concept | Title | Tagline | Description (hover) |
|---|---|---|---|---|
| Niệm Kinh | Sóng âm thanh tĩnh | Niệm Kinh | Bài tập hằng ngày, Ngôi Nhà Nhỏ | Theo dõi công khóa hàng ngày, lưu lại buổi niệm, nghe hướng dẫn đọc đúng |
| Phát Nguyện | Vòng tròn hoàn thành | Phát Nguyện | Lập và theo dõi nguyện lực | Tạo nguyện, theo dõi tiến độ từng ngày, nhận nhắc khi đến hạn |
| Phóng Sanh | Ba con cá nhỏ | Phóng Sanh | Sổ tay & hướng dẫn | Checklist đầy đủ, lời khấn, bài đọc — gắn với ngày tốt trong tháng |
| Bạch Thoại | Sách mở với sóng âm | Bạch Thoại Phật Pháp | Đọc, nghe, tải về | Kho tàng lời dạy — học theo chủ đề, nghe audiobook, tải về học offline |
| Hỏi Đáp | Dấu hỏi với ánh sáng | Hỏi Đáp | Tra cứu lời khai thị | Tìm lời dạy theo vấn đề, hỏi đáp Phật học, khai thị theo hoàn cảnh |

### Section header

```
position: above grid, text-center
title: "Năm Đại Pháp Bảo" — H1, Noto Serif 30px 700, warm-gray-900
subtitle: "Năm con đường tu học được hỗ trợ bởi PMTL" — 17px Inter 400 warm-gray-600
spacing: 48px top, 40px below header text to grid
```

---

## Section 3 — Philosophy (Triết Lý)

### Mục đích
Tạo sự tin tưởng. Người đọc hiểu PMTL là gì và **không phải là gì**.
Section này tĩnh lặng nhất — chỉ typography, không icon, không card.

### Layout — Desktop

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌───────────────────┬───────────────────────────────┐    │
│   │                   │                               │    │
│   │   "Tu học không   │  PMTL không phải ứng dụng     │    │
│   │    phải            │  ghi nhật ký, không phải mạng │    │
│   │    performance.   │  xã hội, không phải gamification│   │
│   │    Đây là không   │  công đức.                    │    │
│   │    gian của bạn." │                               │    │
│   │                   │  Đây là không gian hỗ trợ...  │    │
│   │    ─────────       │  [3 short paragraphs]        │    │
│   │    Nguyên tắc     │                               │    │
│   │    thiết kế       │                               │    │
│   │                   │                               │    │
│   └───────────────────┴───────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
  bg: --cream-50
  max-width: 1000px, padding: 80px 0
```

### Left column — Pull Quote

```
font: Noto Serif 32px 400 italic (duy nhất chỗ dùng italic — là quote trích dẫn)
color: --warm-gray-900
line-height: 1.4
max-width: 320px

Below quote:
  divider: 40px gold-500 line (1.5px height, left-aligned)
  source attribution: "Nguyên tắc thiết kế PMTL" — 13px Inter 400 warm-gray-400
```

### Right column — Copy blocks

3 short blocks, each 2-4 sentences:

```
Block 1: "PMTL không phải ứng dụng todo..."
Block 2: "Chúng tôi không đo công đức bằng điểm số..."
Block 3: "Giao diện được thiết kế để ở lại bên bạn..."

Each block:
  font: Inter 17px 400, --warm-gray-700
  line-height: 1.7
  margin-bottom: 24px
```

### Mobile

Single column. Pull quote first (24px Noto Serif), then copy blocks.

---

## Section 4 — Daily Flow Preview (Thực Tế Tu Học)

### Mục đích
"Show don't tell" — thấy **giao diện thực tế** của app trong context tu học.
Không phải screenshot dump — là câu chuyện có trình tự.

### Layout — Desktop Split Screen

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌──────────────────────────┬────────────────────────┐    │
│   │                          │                        │    │
│   │   [Phone mockup]         │  Buổi sáng của bạn     │    │
│   │   showing app screen     │  ─────────────         │    │
│   │                          │  1. Mở app, xem        │    │
│   │   [3 state carousel]     │     advisory hôm nay   │    │
│   │   • Advisory screen      │  2. Bắt đầu công khóa  │    │
│   │   • Practice screen      │  3. Ghi lại buổi niệm  │    │
│   │   • Completion screen    │  4. Cập nhật Ngôi      │    │
│   │                          │     Nhà Nhỏ nếu đặc   │    │
│   │                          │     biệt ngày hôm nay  │    │
│   │                          │                        │    │
│   │                          │  [ Xem demo → ]        │    │
│   └──────────────────────────┴────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
  bg: --cream-100
  Phone mockup: centered, 320×640px with rounded corners (44px) + shadow-lg
```

### Phone mockup visual specs

```
Frame:
  width: 280px desktop, 240px mobile
  border-radius: 40px
  border: 8px solid --warm-gray-900
  box-shadow: 0 24px 64px rgba(45,42,38,0.18), 0 8px 24px rgba(45,42,38,0.12)
  bg: --cream-50

Screen states (auto-advance 3s, manual tap):
  State 1 — Advisory:
    top bar: ngày âm "Mùng 1 tháng 3"
    advisory card: cream-100 bg, gold-500 top border 3px, 2-3 lines text
    quick actions: 3 pill buttons

  State 2 — Practice:
    header: "Công khóa hôm nay"
    checklist: 3-4 items with checkboxes
    input field: "Số biến đã niệm" — numeric keyboard look

  State 3 — Completion:
    center: checkmark icon (gold-500, 48px)
    text: "Đã lưu · Buổi tu #47"
    sub-text: small stats
```

### Step list (right column)

```
Numbered steps (1, 2, 3, 4):
  number: 24px Noto Serif 700 gold-500
  text: 17px Inter 400 warm-gray-700
  spacing: 20px between steps

Active step (synced with phone state):
  number: bg gold-100 circle
  text: warm-gray-900 (bolder)
  left-border: 2px solid gold-500
```

### Mobile

Stack: phone mockup on top (smaller, 240px wide), steps below.

---

## Section 5 — Wisdom Taste (Nếm Thử Nội Dung)

### Mục đích
Cho người dùng cảm nhận **chất lượng nội dung** — một bài Bạch Thoại trích dẫn, một câu hỏi đáp.
Đây là "content preview" nhưng không spoil.

### Layout — Desktop

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   KHO TÀ NG LỜI DẠY                                       │
│   Học theo chủ đề · Nghe audiobook · Tải về học offline     │
│                                                             │
│   ┌────────────────┐  ┌────────────────┐  ┌─────────────┐  │
│   │ [Bạch Thoại    │  │ [Hỏi Đáp       │  │ [Khai Thị   │  │
│   │  Preview Card] │  │  Preview Card] │  │  Preview    │  │
│   │                │  │                │  │  Card]      │  │
│   │  Trích đoạn    │  │  Câu hỏi ngắn  │  │  Quote từ   │  │
│   │  2-3 dòng      │  │  + trả lời     │  │  khai thị   │  │
│   │                │  │  tóm tắt       │  │  quan trọng │  │
│   │  [Đọc tiếp →]  │  │  [Xem thêm →]  │  │  [Xem thêm] │  │
│   └────────────────┘  └────────────────┘  └─────────────┘  │
│                                                             │
│                    [ Khám phá kho tàng lời dạy → ]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
  bg: --warm-gray-900 (DARK section — contrast với các section cream)
```

### Dark section rationale

Section này dùng **dark background** để:
1. Tạo visual break, tránh cream monotony
2. Nội dung lời dạy Phật pháp xứng đáng được "framed" trong không gian trang trọng
3. Contrast để typography trắng nổi bật như ánh đèn trong bóng tối

```
bg: --warm-gray-900 (#2D2A26)
text: white / warm-gray-100
accent: gold-400 (sáng hơn trên dark bg)
card bg: rgba(255,255,255,0.06) — frosted glass effect nhẹ
card border: rgba(255,255,255,0.10)
```

### Preview cards

```
bg: rgba(255,255,255,0.06)
border: 1px rgba(255,255,255,0.10)
border-radius: 12px
padding: 24px
hover: bg rgba(255,255,255,0.10)

Content:
  tag: "Bạch Thoại" / "Hỏi Đáp" / "Khai Thị"
       — 12px capsule, gold-400 bg/10% + gold-400 text
  title: 18px Noto Serif 600 white
  excerpt: 3-4 lines, 15px Inter 400, warm-gray-300
  link: "Đọc tiếp →" gold-400 14px
```

### Section header (dark)

```
Title: "Kho Tàng Lời Dạy" — 30px Noto Serif 700 white
Subtitle: 17px Inter 400 warm-gray-300
```

---

## Section 6 — Community Warmth (Cộng Đồng)

### Mục đích
Thấy rằng có người thật đang dùng, đang tu học, đang chia sẻ.
**Không phải testimonial sales** — mà là excerpts thật từ sổ guestbook.

### Layout — Desktop

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   CỘNG ĐỒNG TU HỌC                                        │
│   Những chia sẻ từ thành viên                              │
│                                                             │
│   ┌──────────────────────────────────────────────────┐     │
│   │ ❝ ... trích dẫn guestbook entry 1 (2-3 dòng) ❞  │     │
│   │   — Thành viên · Hà Nội · 6 tháng trước          │     │
│   └──────────────────────────────────────────────────┘     │
│   ┌──────────────────────────────────────────────────┐     │
│   │ ❝ ... trích dẫn guestbook entry 2 (2-3 dòng) ❞  │     │
│   │   — Thành viên · TP.HCM · 3 tháng trước          │     │
│   └──────────────────────────────────────────────────┘     │
│   ┌──────────────────────────────────────────────────┐     │
│   │ ❝ ... trích dẫn guestbook entry 3 (2-3 dòng) ❞  │     │
│   │   — Thành viên · Đà Nẵng · 1 tháng trước         │     │
│   └──────────────────────────────────────────────────┘     │
│                                                             │
│               [ Xem sổ lưu niệm → ]                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
  bg: --cream-50
  entries: staggered left indent (alternating 0 / 40px left margin)
```

### Guestbook entry card

```
bg: white
border-left: 3px solid gold-200
border-radius: 0 8px 8px 0
padding: 20px 24px
shadow: shadow-sm

Quote mark: ❝ — Noto Serif 24px gold-300, float left
Quote text: 16px Noto Serif 400 italic warm-gray-700, line-height 1.7
Attribution: 13px Inter 400 warm-gray-400, margin-top 12px
  Format: "— [Tên tắt] · [Tỉnh] · [Thời gian]"
```

### Note về content

- Entries phải là **opt-in** từ người dùng
- KHÔNG hiện tên thật nếu người dùng không muốn
- KHÔNG hiện số biến hay thống kê tu học — đó là riêng tư
- Chỉ hiện những chia sẻ có tính **hỗ trợ người mới**

---

## Section 7 — Begin (CTA Cuối)

### Mục đích
Lời mời cuối — nhẹ nhàng, không áp lực.
Người đọc đã hiểu hết. Chỉ cần một bước.

### Layout — Desktop

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│              Sẵn sàng bắt đầu?                            │
│                                                             │
│         Tạo tài khoản miễn phí — không cần thẻ,           │
│         không subscription, không phức tạp.               │
│                                                             │
│              [ Tạo tài khoản ]                            │
│                                                             │
│         Hoặc chỉ muốn xem trước? [ Khám phá nội dung ]   │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
  bg: --gold-100 (#FDF6E3)
  min-height: 400px
  text-align: center
```

### Typography

```
Headline: "Sẵn sàng bắt đầu?" — 40px Noto Serif 700 warm-gray-900
Subtext: 18px Inter 400 warm-gray-600, max-width 480px
CTA Primary: "Tạo tài khoản" — standard gold-500 button
CTA Ghost: "Khám phá nội dung" — ghost button, warm-gray-600
```

---

## Footer

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  PMTL_VN                 Tìm hiểu thêm      Hỗ trợ        │
│  Nền tảng tu học         Về chúng tôi        Liên hệ       │
│  (short tagline)         5 Đại Pháp Bảo      Câu hỏi thường│
│                          Hướng dẫn người mới  gặp           │
│                          Blog / Bài viết                    │
│                                                             │
│  ──────────────────────────────────────────────────────     │
│  © 2025 PMTL_VN · Được xây dựng với tâm tôn kính          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
  bg: --warm-gray-900
  text: warm-gray-300
  links: warm-gray-300 hover → white
  font: Inter 14px 400
```

---

## Scroll Behavior & Entrance Animations

### Global rules

```
✅ Dùng: fade-in-up (opacity 0→1, translateY 20px→0) khi element vào viewport
✅ Dùng: stagger cho list items (100ms delay giữa các item)
✅ Duration: 400ms ease-out
✅ Trigger: IntersectionObserver, threshold 0.15

❌ Không: parallax phức tạp trên mobile (performance)
❌ Không: slide-in từ trái/phải (gây layout shift)
❌ Không: animation loop (chỉ play once)
❌ Không: reduce-motion media query phải được respect
```

### Prefers-reduce-motion

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

---

## SEO & Meta

### Open Graph

```
og:title: "PMTL_VN · Nền Tảng Tu Học 5 Đại Pháp Bảo"
og:description: "Hỗ trợ Niệm Kinh, Phát Nguyện, Phóng Sanh, Bạch Thoại Phật Pháp và Hỏi Đáp.
                 Nền tảng cho người tu học Phật giáo Việt Nam."
og:image: /og-landing.jpg (1200×630, cream bg + lotus + title typography)
og:type: website
```

### Structured data

```json
{
  "@type": "WebSite",
  "name": "PMTL_VN",
  "description": "Nền tảng hỗ trợ tu học 5 đại pháp bảo",
  "inLanguage": "vi-VN"
}
```

---

## Performance targets (landing page)

| Metric | Target | Notes |
|---|---|---|
| LCP | < 2.0s | Hero headline là LCP element |
| CLS | < 0.05 | Reserve space cho lotus SVG và phone mockup |
| INP | < 150ms | Hover trên Five Gates cards |
| First load JS | < 80KB | Landing là mostly static |
| Font loading | FOUT tối thiểu | preload Noto Serif 700 + Inter 400 |

### Font strategy

```html
<link rel="preload" href="/fonts/noto-serif-v700.woff2" as="font" crossorigin>
<link rel="preload" href="/fonts/inter-v400.woff2" as="font" crossorigin>
```

---

## Responsive summary

| Breakpoint | Hero | Five Gates | Philosophy | Daily Flow | Wisdom |
|---|---|---|---|---|---|
| Mobile (< 640px) | Single col, 36px headline | 1-col stack | Single col | Stack phone top | Single col dark |
| Tablet (640-1024px) | Centered, 44px | 2-col | 2-col narrow | Side-by-side (50/50) | 2-col |
| Desktop (1024px+) | Centered, 56px | Bento 5-col | 2-col 35/65 | 55/45 split | 3-col |

---

## Notes for implementation

- Landing page là **Next.js static page** — không cần server data ngoại trừ featured posts (ISR 1 giờ)
- Five Treasures cards: hover state có thể dùng CSS-only trên desktop, touch có tap-active
- Phone mockup animation: pure CSS hoặc Framer Motion — KHÔNG dùng video (bandwidth)
- Community entries: seed data hoặc admin-curated — KHÔNG tự động pull random guestbook
- Dark section (Section 5): test contrast WCAG AA trên cả text và icon

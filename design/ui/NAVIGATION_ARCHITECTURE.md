# Navigation Architecture — PMTL_VN

> **Mục đích**: Chốt cấu trúc điều hướng, information architecture, và URL scheme cho toàn bộ app.
> **Ref**: `ui/PAGE_INVENTORY.md` (route list), `ui/USER_FLOWS.md` (journeys), `ui/SPIRITUAL_APP_SCREENS.md` (screen specs)
> **Rule**: Mọi thay đổi URL scheme phải cập nhật file này trước, rồi mới sửa code.

---

## Nguyên tắc IA

### 1. "3 taps from anywhere"

Mọi tính năng cốt lõi phải đạt được trong **tối đa 3 tap** từ màn hình nào cũng được.
Nếu không đạt được, đó là dấu hiệu IA sai — không phải thêm shortcut.

### 2. Mental model rõ ràng

```
TU HỌC     = Hành động của bạn (công khóa, ngôi nhà nhỏ, nguyện)
PHÁP BẢO   = Nội dung để học và tra cứu (bạch thoại, hỏi đáp)
CỘNG ĐỒNG  = Chia sẻ và kết nối (sổ lưu niệm, bài viết)
CÀI ĐẶT   = Tài khoản và tùy chỉnh
```

Không trộn lẫn. Nếu user phải đoán một tính năng ở đâu → sai IA.

### 3. Public vs Member rõ ràng

```
Public:  landing, bài viết, pháp bảo (read-only), tìm kiếm, sự kiện
Member+: công khóa, ngôi nhà nhỏ, phát nguyện, lịch cá nhân, hồ sơ
Admin+:  quản lý nội dung, kiểm duyệt, sự kiện
```

Không "tease" tính năng member+ trên public pages rồi redirect sau khi tap — redirect phải xảy ra **trước** khi user thực hiện hành động.

---

## Sơ đồ IA toàn cục

```
PMTL_VN
├── PUBLIC
│   ├── /                          Landing page
│   ├── /bai-viet                  Danh sách bài viết
│   │   └── /bai-viet/[slug]       Chi tiết bài viết
│   ├── /bai-hoa                   Hub: Bạch Thoại + Hỏi Đáp (Wisdom Library)
│   │   ├── /bai-hoa/[slug]        Wisdom entry detail (Bạch Thoại / Hỏi Đáp / Khai Thị)
│   │   ├── /bai-hoa/sach-noi      Audiobook library
│   │   │   ├── /bai-hoa/sach-noi/[bookSlug]             Book detail
│   │   │   └── /bai-hoa/sach-noi/[bookSlug]/chuong/[n]  Chapter reader
│   ├── /su-kien                   Danh sách sự kiện
│   │   └── /su-kien/[slug]        Chi tiết sự kiện
│   ├── /tim-kiem                  Tìm kiếm
│   ├── /so-luu-niem               Sổ lưu niệm (public read)
│   ├── /huong-dan-nguoi-moi       Landing cho người mới
│   └── /kinh-bai-tap              Tổng hợp kinh và bài tập
│       └── /kinh-bai-tap/[slug]   Chi tiết bài tập/kinh
│
├── AUTH
│   ├── /dang-nhap                 Đăng nhập
│   ├── /dang-ky                   Đăng ký
│   ├── /xac-nhan-email            Xác nhận email
│   ├── /quen-mat-khau             Quên mật khẩu
│   └── /dat-lai-mat-khau          Reset password
│
├── MEMBER (auth required)
│   ├── /dashboard                 Tổng quan hằng ngày
│   ├── /tu-tap
│   │   ├── /tu-tap/bai-tap        Công khóa (Practice Sheet)
│   │   └── /tu-tap/nha-nho        Ngôi Nhà Nhỏ
│   ├── /phat-nguyen               Phát nguyện list
│   │   └── /phat-nguyen/[id]      Chi tiết nguyện (nếu cần)
│   ├── /lich-ca-nhan              Lịch cá nhân
│   ├── /thong-bao                 Thông báo
│   ├── /tai-khoan                 Hồ sơ & tài khoản (tabs: thông tin, mật khẩu, phiên, xóa)
│   └── /luu-trang                 Trang đã đánh dấu (bookmarks)
│
└── ADMIN (admin+ required — separate SPA)
    └── /admin/*                   Admin dashboard (Vite + React)
```

---

## URL Scheme Rules

### Tiếng Việt có dấu trong URL

```
✅ Slug từ content: ASCII slug, no diacritics
   e.g., "Vô thường là gì?" → /bai-hoa/vo-thuong-la-gi

✅ Route segments: lowercase, hyphen-separated, no diacritics
   e.g., /phat-nguyen, /tu-tap/bai-tap, /lich-ca-nhan

❌ Không dùng %20 hay encode dấu tiếng Việt trong URL
❌ Không dùng underscore trong routes
❌ Không dùng CamelCase trong routes
```

### ID-based vs slug-based

```
Content (public, SEO-important): SLUG
  /bai-viet/[slug]
  /bai-hoa/[slug]
  /su-kien/[slug]

Member data (private, no SEO): CUID or UUID
  /phat-nguyen/[id]     ← vow detail nếu có
  (most member routes không cần ID in URL)
```

### Redirect rules

```
/ (logged in) → redirect to /dashboard (server-side)
/dang-nhap (logged in) → redirect to /dashboard
/dashboard (logged out) → redirect to /dang-nhap?next=/dashboard

Post-action redirects:
  Register success → /dashboard (NOT /dang-nhap)
  Email verified → /dashboard (NOT /)
  Save practice → stay on /tu-tap/bai-tap + toast
  Dâng nhà → /dashboard + toast
```

---

## Mobile Navigation

### Bottom Navigation Bar

```
5 tabs — luôn hiển thị khi đã đăng nhập trên mobile

Tab 1: Trang chủ
  icon: Home (Lucide)
  route: /dashboard
  badge: none

Tab 2: Tu tập
  icon: Layers (Lucide) — hoặc custom "hands in prayer" icon
  route: /tu-tap/bai-tap
  badge: none (KHÔNG badge số buổi — không gamify)

Tab 3: Pháp bảo
  icon: BookOpen (Lucide)
  route: /bai-hoa
  badge: none

Tab 4: Lịch
  icon: Calendar (Lucide)
  route: /lich-ca-nhan
  badge: dot nếu có sự kiện hôm nay (chấm nhỏ, không số)

Tab 5: Hồ sơ
  icon: User (Lucide)
  route: /tai-khoan
  badge: dot nếu có thông báo chưa đọc
```

**Public pages**: bottom nav ẩn. Chỉ hiện khi member+ và đã đăng nhập.

### Mobile header pattern

```
Standard header (most screens):
  height: 56px
  bg: cream-50 / white
  content: ← back (nếu không phải root) | [title center] | [action right]

Root screens (dashboard, pháp bảo, lịch, hồ sơ):
  NO back button — user đến từ bottom nav
  Title: page name (left-aligned, H2)
  Right: optional action icon (24×24)

Sub-screens:
  ← Back với tên route cha
  (iOS style: tên page trước, không chỉ "←")
```

---

## Desktop Navigation

### Sidebar layout

```
Sidebar: 240px fixed, cream-50 bg
Main content: flexible, max-content-width theo loại page

Sidebar sections — collapsed header + nav items:

  [Logo PMTL_VN]
  ─────────────────
  TU HỌC
    ⌂  Tổng quan        → /dashboard
    ≡  Công khóa        → /tu-tap/bai-tap
    ⌂  Ngôi Nhà Nhỏ    → /tu-tap/nha-nho
    ○  Phát Nguyện      → /phat-nguyen
    □  Lịch cá nhân     → /lich-ca-nhan

  PHÁP BẢO
    ▣  Bạch Thoại       → /bai-hoa
    ?  Hỏi Đáp          → /bai-hoa (filter tab)
    ♦  Phóng Sanh       → /phong-sanh (member journal) / /huong-dan/phong-sanh (public guide)

  CỘNG ĐỒNG
    ✎  Sổ lưu niệm      → /so-luu-niem
    ✦  Bài viết          → /bai-viet
    ◎  Tìm kiếm         → /tim-kiem

  ─────────────────
  [User avatar + name]
  ⚙  Cài đặt           → /tai-khoan
```

### Active state

```
Active nav item:
  bg: cream-100
  left border: 2px solid gold-500
  text + icon: gold-500
  font-weight: 600

Hover (inactive):
  bg: cream-100
  text: warm-gray-900
  transition: 100ms

Active group section header:
  color: gold-500 (section where active item lives)
```

### Desktop header (topbar)

```
NOT a sidebar — sidebar takes left, topbar không cần
NGOẠI LỆ: trên public pages (landing, bài viết) có topbar thay sidebar

Public topbar:
  Logo (left) | Nav links (center): Bài viết, Pháp bảo, Sự kiện | CTA buttons (right)

Member pages: Sidebar only, no topbar
```

---

## Public → Member transitions

### Soft gate pattern

```
Scenario: guest đang đọc bài Bạch Thoại muốn đánh dấu trang

Approach: KHÔNG redirect ngay
  1. Tap "Đánh dấu" → show soft gate:
     Small modal/popover:
     "Đánh dấu bài này cần tài khoản"
     [Đăng nhập] [Đăng ký miễn phí]
     [Không, thôi] ← dismiss

  2. After login/register → return to same page + perform action

  WHY: Hard redirect phá vỡ context, làm mất trang đang đọc
```

### Hard gate pattern (for deeply member-only screens)

```
Scenario: guest cố mở /dashboard, /tu-tap/bai-tap

  Approach: server redirect + ?next= param
  /dang-nhap?next=/dashboard

  After login: redirect to ?next
  If no ?next: default /dashboard
```

---

## Search Architecture

### Universal search bar

```
Location: /tim-kiem (dedicated page)
Shortcut: Cmd/Ctrl+K → opens search modal trên desktop
Mobile: tap search icon trong bottom nav của /bai-hoa

Scope: searches across
  1. Bạch Thoại (title + content excerpt)
  2. Hỏi Đáp (question + answer excerpt)
  3. Bài viết (title + excerpt)
  4. Kinh bài tập (title + description)

Does NOT search:
  - User-private data (practice logs, vows)
  - Admin content

Phase 1: SQL ILIKE with ranking
Phase 2+: Meilisearch (transparent to UI)
```

### Search result grouping

```
Results grouped by type nếu "Tất cả" tab:

  BẠI VIẾT (2 kết quả)
  [card 1] [card 2]

  BẠCH THOẠI (5 kết quả)
  [card 1] [card 2] [card 3]
  [Xem tất cả 5 kết quả Bạch Thoại →]

  HỎI ĐÁP (3 kết quả)
  [card 1] [card 2] [card 3]

Tabs filter to single type: [Tất cả] [Bài viết] [Bạch Thoại] [Hỏi Đáp]
```

---

## Deep Linking

### Share URLs

Mọi content page có URL đầy đủ để share:

```
Bạch Thoại / Hỏi Đáp: /bai-hoa/[slug]
Audiobook chapter:     /bai-hoa/sach-noi/[bookSlug]/chuong/[n]
Bài viết:              /bai-viet/[slug]
Sự kiện:               /su-kien/[slug]
```

Member-private pages (vow detail, practice log) **không share** — không có public URL.

### Progressive Web App deep linking

```
PWA manifest start_url: /dashboard
Scope: /
Display: standalone

Share target (Phase 2+):
  Members có thể share bài Bạch Thoại trực tiếp sang app khác
  Web Share API nếu available, fallback copy URL
```

---

## Breadcrumb Pattern

```
Dùng breadcrumb khi:
  - Depth ≥ 2 (sub-page của sub-section)
  - Desktop only (mobile dùng ← back button)
  - Content pages (không dùng cho app screens như dashboard)

Format:
  Pháp bảo / Bạch Thoại / Tựa đề bài

Spec:
  font: 13px Inter 400 warm-gray-400
  separator: / với padding 8px
  current page: warm-gray-700 (not clickable)
  parent items: warm-gray-400 → warm-gray-700 hover, clickable links
  max depth shown: 3 levels (truncate middle nếu sâu hơn)
```

---

## 404 & Error Pages

### 404 Page

```
bg: cream-50
Center content:
  [Small lotus SVG — warm-gray-200, 64px]
  "Trang này không tồn tại" — 24px Noto Serif 600 warm-gray-700
  "Có thể đường dẫn đã thay đổi hoặc nội dung đã được gỡ bỏ."
  — 16px Inter 400 warm-gray-500
  [Về trang chủ →] — gold-500 button
  [Tìm kiếm nội dung →] — ghost button
```

### 403 Page (unauthorized)

```
"Bạn chưa có quyền xem trang này"
  If guest: [Đăng nhập →] button
  If member (but not admin): "Trang này chỉ dành cho quản trị viên"
```

### 500 Page

```
"Đã xảy ra lỗi"
"Chúng tôi đang xử lý. Vui lòng thử lại sau."
[Thử lại] [Về trang chủ →]
```

---

## Accessibility Navigation

### Skip links

```html
<!-- Đặt ngay sau <body> -->
<a href="#main-content" class="skip-link">Chuyển đến nội dung chính</a>
<a href="#main-nav" class="skip-link">Chuyển đến điều hướng chính</a>

Style: visually hidden by default, shown on :focus
  bg: gold-500, text white, padding 8px 16px
  position: absolute top-0 left-0 z-[100]
```

### Focus management

```
Route transitions:
  On navigate: focus moves to main h1 or main landmark
  On modal open: focus traps inside modal
  On modal close: focus returns to trigger element

Tab order:
  1. Skip links
  2. Navbar/sidebar
  3. Main content (top to bottom)
  4. Footer

❌ Không dùng tabIndex > 0 (dùng 0 hoặc -1 chỉ)
```

### ARIA landmarks

```html
<header role="banner">     ← Topbar/navbar
<nav role="navigation">    ← Primary nav
<main id="main-content">   ← Page content
<aside role="complementary">← Sidebar content (không phải nav)
<footer role="contentinfo"> ← Footer
```

---

## Page Transitions

```
Between sibling pages (same nav level):
  Transition: opacity 0→1, 200ms ease
  NO slide left/right — gây nausea trên some users

Drill-down (tap into detail):
  Mobile: slide-up 300ms ease (sheet behavior)
  Desktop: cross-fade 150ms

Modal/drawer open:
  slide-up-from-bottom: 250ms ease-out

Respect prefers-reduced-motion:
  Tất cả transitions disable nếu user bật reduce motion
```

---

## Navigation — Anti-patterns cần tránh

| Anti-pattern | Tại sao tránh | Thay bằng |
|---|---|---|
| Hamburger menu trên desktop | Hidden navigation = broken discoverability | Sidebar visible |
| Breadcrumb trên mobile | Chiếm space, khó tap | ← back button |
| Tab bar > 5 items | Quá đông, label bị cắt | Group liên quan vào một tab |
| Nested bottom nav | User lạc | Flat nav structure |
| "Back" về homepage sau form | Mất context | Return to previous screen |
| Float action button (FAB) | Che nội dung, elderly khó | Fixed bottom bar button |
| Infinite scroll trên practice history | Elderly mất chỗ | Pagination or "Load more" |
| URL chứa state (modal open) | Broken sharing | History push chỉ cho route changes |

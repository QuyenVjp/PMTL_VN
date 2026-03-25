# MOTION_ROUTE_INVENTORY

File này chốt motion theo route/surface.
Nó bổ sung cho nguyên tắc motion chung trong `frontend-architecture.md`.

---

## Global stance

- Motion phải hỗ trợ clarity và premium polish, không biểu diễn phô trương.
- Public editorial surfaces được phép có reveal nhẹ.
- Member/task surfaces phải tiết chế hơn.
- Import baseline là `motion/react`.
- Với animation rất đơn giản, self-contained, như đổi màu hoặc hover transition nhẹ, ưu tiên CSS trước.
- Motion lane phù hợp nhất khi cần:
  - gesture
  - enter/exit
  - layout transitions
  - scroll-triggered hoặc scroll-linked effects

---

## Route matrix

| Route / Surface | Motion policy | Notes |
|---|---|---|
| `/` homepage | `LIGHT_REVEAL` | section reveal nhẹ, hero polish có kiểm soát |
| `/bai-viet` | `MINIMAL` | card hover nhẹ, không stagger nặng |
| `/bai-viet/[slug]` | `MINIMAL` | đọc là chính |
| `/bach-thoai` | `MINIMAL` | tab/filter transition nhẹ |
| `/bach-thoai/[slug]` | `MINIMAL` | text-first, audio companion không nhảy nhiều |
| `/hoi-dap` | `MINIMAL` | utility hơn homepage |
| `/hoi-dap/[slug]` | `MINIMAL` | source/provenance rõ hơn motion |
| `/tim-kiem` | `MINIMAL` | filter/result update rõ, không flashy |
| `/dashboard` | `SUBTLE` | card enter nhẹ, no big choreography |
| `/lich-ca-nhan` | `SUBTLE` | month/event transitions nhẹ, không rối |
| `/tu-tap/*` | `RESTRAINED` | practically no decorative motion |
| `/tai-khoan` | `RESTRAINED` | form-first |
| dialogs/sheets | `STANDARD_OVERLAY` | enter/exit nhanh, rõ |
| dropdowns/tooltips | `FAST_UI` | micro only |

---

## Preset vocabulary

- `FAST_UI`
  - dropdown
  - tooltip
  - menu
  - `whileHover` / `whileTap` micro-interaction khi CSS không đủ
- `STANDARD_OVERLAY`
  - dialog
  - sheet
  - drawer
  - `AnimatePresence` exit/enter nhẹ
- `LIGHT_REVEAL`
  - homepage sections
  - selected spotlight blocks
  - `whileInView` cho section reveal có kiểm soát
- `SUBTLE`
  - dashboard cards
  - tab switches
  - list enter
  - `layout` / `layoutId` khi thay đổi vị trí hoặc active indicator
- `RESTRAINED`
  - practice/task/elderly-sensitive surfaces

---

## Motion features allowed in PMTL

- `whileHover`
- `whileTap`
- `whileInView`
- `useScroll`
- `layout`
- `layoutId`
- `AnimatePresence`

Không mặc định bật:
- drag-heavy interactions
- scroll spectacle
- choreography nhiều lớp trên reading-first screens

## Open owner tuning still needed

- duration numbers cuối
- easing curves cuối
- spring profile cuối
- reduced-motion policy chi tiết

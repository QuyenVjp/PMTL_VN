# PRESERVED_UI_STATE_MATRIX

File này chốt state nào được giữ qua navigation và state nào phải reset.
Nó tồn tại vì `cacheComponents` + Activity preservation là default behavior ở Next.js 16.

> Platform rules: `design/04-execution-overlay/web/WEB_APP_ROUTER_FILE_CONTRACT.md`
> Frontend architecture: `design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md`
> Search UX: `design/02-platform-baseline/web-runtime/SEARCH_UX_CONTRACT.md`
> Auth UX: `design/02-platform-baseline/web-runtime/AUTH_UX_CONTRACT.md`

---

## Legend

- `KEEP`: preserve khi user quay lại route
- `RESET`: phải reset khi hide/navigate away
- `URL`: canonical state nằm ở URL
- `USER-SCOPED`: phải reset khi đổi user

---

## Matrix

| Route / Surface | State | Policy | Notes |
|---|---|---|---|
| `/tim-kiem` | query text | `URL + KEEP` | query canonical ở `q` |
| `/tim-kiem` | active tab | `URL + KEEP` | shareable/search canonical |
| `/tim-kiem` | applied filters | `URL + KEEP` | nếu đổi result set |
| `/tim-kiem` | filter panel open | `KEEP` | view preference |
| `/tim-kiem` | hover preview / transient tooltip | `RESET` | ephemeral |
| `/bach-thoai` | local hub tab/filter | `KEEP` hoặc `URL` nếu ảnh hưởng result set | nên nghiêng về URL khi shareable |
| `/hoi-dap` | local hub tab/filter | `KEEP` hoặc `URL` | như trên |
| `/bai-viet` | list filter/search mini | `KEEP` | nếu có canonical filter, đưa vào URL |
| `/dang-nhap` | email field | `KEEP` ngắn hạn | tiện cho retry |
| `/dang-nhap` | password field | `RESET` | security-sensitive |
| `/dang-ky` | text inputs | `KEEP` ngắn hạn | tránh mất công nhập |
| `/quen-mat-khau` | email field | `KEEP` ngắn hạn | retry UX |
| `/tai-khoan` | unsaved profile draft | `KEEP + USER-SCOPED` | phải reset khi đổi user |
| `/tai-khoan` | password change form | `RESET` | security-sensitive |
| `/dashboard` | notification dropdown open | `RESET` | transient |
| `/dashboard` | collapsed/expanded advisory panels | `KEEP` | user view preference |
| `/lich-ca-nhan` | selected month/week | `KEEP` hoặc `URL` | nếu deep-link được thì ưu tiên URL |
| `/lich-ca-nhan` | inline date-picker popover open | `RESET` | transient overlay |
| `/lich-ca-nhan` | reminder modal open | `RESET` | transient |
| `/tu-tap/bai-tap` | unsaved practice draft | `KEEP + USER-SCOPED` | cần warning nếu auth expires |
| `/tu-tap/bai-tap` | companion drawer open | `KEEP` | long-lived support state |
| `/tu-tap/bai-tap` | ephemeral success banner | `RESET` | one-shot |
| `/tu-tap/nha-nho` | unsaved ritual/progress draft | `KEEP + USER-SCOPED` | user work state |
| global nav/sidebar | expanded nav groups | `KEEP` | navigation preference |
| global nav/sidebar | desktop collapsed vs expanded shell | `KEEP` | shell preference, không phải transient |
| global nav | mobile sheet open | `RESET` | transient |
| dialogs across app | open state | `RESET` by default | trừ multi-step wizard explicit |

---

## Default rules

### Keep by default

- search/filter setup
- long draft input
- expanded sidebar/group panels
- scroll position
- non-sensitive user view preferences

### Reset by default

- dropdown
- popover
- transient dialog
- toast/success banner
- password/token/security-sensitive inputs

---

## URL-state rule

Nếu state có các tính chất sau thì nên đưa vào URL:
- ảnh hưởng content set đang xem
- cần share/deep-link
- user kỳ vọng back/forward hoạt động đúng

Ví dụ:
- search query
- active content tab
- selected month nếu calendar cần deep-link
- open detail panel nếu product coi nó là navigable state

---

## Open product decisions still needing owner input

- `/lich-ca-nhan`: selected month có bắt buộc canonical ở URL không
- `/bach-thoai` và `/hoi-dap`: local hub filters có canonical ở URL ngay phase đầu không
- `/tu-tap/*`: draft giữ bao lâu và có dirty-exit warning scope nào
- route nào có multi-step dialog thật sự được preserve thay vì reset

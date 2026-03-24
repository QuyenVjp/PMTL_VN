# Ngôi Nhà Nhỏ — Tech Features Spec

> File này mô tả các tính năng công nghệ đặc thù cho Ngôi Nhà Nhỏ, vượt trội so với đối thủ.
> Mỗi feature được phân tích: là gì, tại sao cần, owner, phase triển khai.
>
> Đọc cùng:
> - `design/02-content/little-house-experience-architecture.md` — kiến trúc tổng thể
> - `design/02-content/little-house-spec.md` — spec flow và validation
> - `design/04-engagement/schema.dbml` — engagement schema
> - `design/07-calendar/schema.dbml` — lunar calendar schema

---

## 1. Feature 1: Dynamic PDF Generator

### Là gì

Tạo PDF cá nhân hóa cho người dùng ngay trên web — thay vì tải file PDF cố định từ Google Drive.

### Tại sao cần

Competitor: Người dùng tải PDF từ Google Drive → tự điền tay → dễ sai.
PMTL_VN: Người dùng nhập thông tin trên web → PDF tự điền sẵn → chính xác hơn.

### Tính năng

- Người dùng chọn loại Ngôi Nhà Nhỏ (27/49/84/87 biến)
- Nhập `Kính Tặng` và `Tặng` vào form
- Hệ thống generate PDF với các thông tin đã điền
- Gắn kèm version nghi thức hiện hành (từ `template_version_ref`)
- In watermark nhỏ "Pháp Môn Tâm Linh" ở footer
- Download ngay hoặc preview trước

### Technical notes

- Stack gợi ý: `@react-pdf/renderer` (client-side) hoặc Puppeteer (server-side via API)
- Phase 1: Server-side render qua `apps/api` — đơn giản hơn, kiểm soát font tốt hơn
- Phase 2: Client-side để giảm tải server (React PDF Renderer)
- Font phải hỗ trợ đầy đủ tiếng Việt có dấu (dùng font Noto Serif Vietnamese)
- Template lưu trong Content module, versioned

### Owner

- Content module: lưu template metadata, version
- apps/api: endpoint `POST /content/little-house/generate-pdf`
- apps/web: UI form nhập thông tin + download button

### Phase

Phase B (sau khi có content ổn định).

---

## 2. Feature 2: Smart Quantity Calculator + Lunar Calendar Integration

### Là gì

Tool tính số lượng tờ Ngôi Nhà Nhỏ được phép đốt, tự động dựa trên:
- Ngày âm lịch hôm nay
- Trường hợp người nhận

### Tại sao cần

Competitor chỉ liệt kê quy tắc số lượng dạng văn bản — người dùng phải tự tính.
PMTL_VN tính tự động: "Hôm nay là ngày 15 âm lịch, bạn có thể đốt tối đa 21 tờ."

### Logic rule engine

```
input: ngày âm lịch (từ Calendar module), recipientType (từ Engagement)

logic:
  if today is ngay_ram or ngay_mung_mot:
    max_sheets = 21
  else if today is phat_dan or le_lon:
    max_sheets = per_event_config
  else:
    max_sheets = 7

constraint: sheets_count must be odd number (1, 3, 5, 7, ...)
suggestion: show recommended count based on recipientType
```

### UI

- Hiển thị trên trang `/ngoi-nha-nho/tra-cuu/so-luong`
- Hiển thị trên tracker `/tu-tap/nha-nho` khi user bắt đầu tờ mới
- Format: "Hôm nay (ngày [X] tháng [Y] âm lịch): bạn có thể đốt [N] tờ"
- Hiển thị gợi ý số lẻ gần nhất nếu user nhập số chẵn

### Owner

- Calendar module: cung cấp ngày âm lịch + is_special_day
- Content module: lưu config số lượng theo loại ngày
- apps/web: UI calculator component

### Phase

Phase C (sau khi Calendar module hoạt động ổn định).

---

## 3. Feature 3: Contextual Warning Engine

### Là gì

Khi người dùng chọn trường hợp (recipientType) trong tracker, hệ thống tự động hiển thị warning cards đặc thù cho trường hợp đó — không hiển thị tất cả mọi warning.

### Tại sao cần

Người dùng thường bỏ qua warning nếu quá dài. Warning phải contextual:
- Niệm cho thai nhi → hiển thị warning riêng cho thai nhi
- Niệm cho người bệnh → hiển thị warning khác
- Người mới bắt đầu → hiển thị tất cả warning cơ bản

### Data flow

```
user selects recipientType → Engagement records case_variant_ref
→ FE fetches warning_list blocks for that case_variant_ref from Content API
→ Content serves: GET /content/little-house/case-variants/{variantId}/warnings
→ FE renders warning cards contextually
```

### Case variants và warning sets

| Trường hợp | Warning đặc thù |
|---|---|
| Người bệnh (còn sống) | Không đốt khi người bệnh đang ngủ. Tâm thanh tịnh. |
| Người quá cố | Chú ý ngày kỵ. Không cần thông báo cho gia đình (tùy). |
| Thai nhi / phá thai | Xem hướng dẫn riêng bắt buộc. Wording đặc biệt. |
| Hóa giải oán kết | Không viết "cắt đứt" trong lời cầu. Chỉ "hóa giải". |
| Tích lũy bản thân | Không cần Kính Tặng đặc biệt. |

### Owner

- Content module: lưu `warning_list` blocks trong `case_variants`
- Engagement module: lưu `case_variant_ref` trong sheet
- apps/web: render warning cards dựa trên variant

### Phase

Phase D (Smart bridging).

---

## 4. Feature 4: Offline PWA — Flow đốt hoạt động không cần mạng

### Là gì

Trang hướng dẫn quy trình đốt và tracker `/tu-tap/nha-nho` hoạt động offline.

### Tại sao cần

Thực tế: người dùng đốt ở ban công, sân vườn, ngoài trời — thường không có WiFi tốt.
Nếu app mất mạng giữa chừng → trải nghiệm hỏng.

### Scope offline

**Offline-first (phải hoạt động hoàn toàn offline):**
- `/ngoi-nha-nho/dot-va-hau-xu-ly/quy-trinh-dot` — hướng dẫn đốt
- `/ngoi-nha-nho/dot-va-hau-xu-ly/luu-y-dot` — lưu ý khi đốt
- `/tu-tap/nha-nho` — tracker counter (lưu local, sync khi online)

**Cache-first (hoạt động offline nhưng có thể stale):**
- Tất cả guide pages Ngôi Nhà Nhỏ
- Hướng dẫn niệm kinh

**Network-first (không cần offline):**
- Trang search, community, blog mới

### Technical notes

- Dùng Next.js PWA (next-pwa hoặc Workbox trực tiếp)
- Service Worker cache: Cache-First cho static guides, Stale-While-Revalidate cho content
- Tracker entries: IndexedDB local → sync với `POST /engagement/ngoi-nha-nho-sheets/:publicId/entries` khi online
- `clientEventId` đã có trong schema → dùng cho idempotency khi sync
- Hiển thị offline indicator banner nhỏ khi user đang offline

### Owner

- apps/web: Service Worker config, PWA manifest
- Engagement module: `clientEventId` idempotency (đã có sẵn trong schema)

### Phase

Phase C (sau tracker cơ bản hoạt động).

---

## 5. Feature 5: Step Timer — Đếm giờ giữa các tờ

### Là gì

Khi người dùng đốt cho nhiều người nhận khác nhau trong cùng một buổi, hệ thống hiển thị countdown timer 1-2 phút giữa mỗi lần đốt.

### Tại sao cần

Quy tắc: phải chờ 1-2 phút giữa khi đốt cho người khác nhau.
Hiện tại người dùng tự đếm — dễ quên hoặc vội vàng.

### UI

- Chỉ hiển thị khi sheet có `multiple_recipients = true`
- Sau khi confirm "Đã đốt xong tờ [N] cho [người X]":
  - Hiển thị countdown 90 giây (1 phút 30 giây — giữa khoảng 1-2 phút)
  - Simple progress bar, không animation phức tạp
  - Text: "Vui lòng chờ trước khi đốt tờ tiếp theo"
  - Nút "Bỏ qua" (có warning "Nên chờ đủ thời gian")
- Sau hết giờ: unlock nút "Bắt đầu đốt tờ tiếp theo"

### Nguyên tắc UX

- Không game hóa
- Không sound effect
- Không animation phức tạp
- Chỉ là functional countdown timer, gần với đồng hồ thật

### Owner

- apps/web: component `StepTimer` — pure client-side, không cần API
- Engagement module: field để track số tờ đã đốt trong session (optional)

### Phase

Phase C.

---

## 6. Feature 6: Image Compare Component

### Là gì

Component hiển thị cặp ảnh "đúng / sai" với slider interactive hoặc side-by-side, dùng trong các trang hướng dẫn.

### Dùng cho

- Cách chấm đỏ đúng vs sai
- Đĩa sứ đúng vs sai
- Cách gói tro đúng vs sai
- Điền Kính Tặng đúng vs sai

### UI options

**Option A: Side-by-side (ưu tiên mobile)**
```
| ✅ Đúng     | ❌ Sai      |
|-------------|-------------|
| [ảnh đúng]  | [ảnh sai]   |
| Chú thích   | Chú thích   |
```

**Option B: Slider (desktop)**
Kéo slider để reveal ảnh đúng/sai.

**Khuyến nghị**: Option A vì dễ dùng hơn với người cao tuổi (không cần kéo slider).

### Block type

`image_compare` block trong Content module:
```typescript
{
  type: 'image_compare',
  correctImage: { url, alt, caption },
  incorrectImage: { url, alt, caption },
  explanation: string,  // text giải thích tại sao đúng/sai
}
```

### Owner

- Content module: `image_compare` block type trong beginnerGuides
- packages/ui: `ImageCompare` component
- apps/admin: preview mode cho block này

### Phase

Phase A (cần ngay khi có content).

---

## 7. Feature 7: Practice Companion — Deep-link từ Guide sang Tracker

### Là gì

Khi người dùng đọc guide và bấm "Bắt đầu thực hành", FE truyền context sang tracker để tracker mở đúng state ban đầu.

### Flow

```
User đọc /ngoi-nha-nho/bat-dau
→ Bấm "Bắt đầu thực hành"
→ Nếu chưa login: redirect /dang-nhap?next=/tu-tap/nha-nho&case=nguoi-benh
→ Nếu đã login: redirect /tu-tap/nha-nho?initCase=nguoi-benh&guideRef=bat-dau

Tracker nhận query params:
- initCase → pre-select recipientType
- guideRef → ghi lại guide user đã đọc (cho audit)
- burningMode → pre-select nếu đến từ guide đốt
```

### Params supported

| Param | Giá trị | Mô tả |
|---|---|---|
| `initCase` | `nguoi-benh`, `nguoi-qua-co`, `thai-nhi`, `tich-luy`, v.v. | Pre-select trường hợp |
| `guideRef` | slug của guide | Guide user vừa đọc |
| `burningMode` | `with-altar`, `without-altar` | Mode đốt |

### Owner

- apps/web: query param handling trong `/tu-tap/nha-nho` page
- Content module: `guideRef` tracking (optional analytics)

### Phase

Phase D (Smart bridging).

---

## 8. Feature 8: Anti-mistake Validation UI

### Là gì

Validation realtime khi user điền thông tin trong tracker, ngăn các lỗi phổ biến trước khi bắt đầu niệm.

### Validation rules (UI level)

| Field | Rule | Error message |
|---|---|---|
| `recipientLabel` (Kính Tặng) | Không được để trống (trừ tích lũy) | "Bạn cần điền rõ tên người nhận trước khi bắt đầu tụng." |
| `recipientLabel` | Không được quá ngắn (< 3 ký tự) | "Tên người nhận quá ngắn. Vui lòng điền họ tên đầy đủ." |
| `giverName` (Tặng) | Không được để trống | "Bạn cần điền tên người đang tụng." |
| `recipientType` | Phải chọn 1 trong các case | "Vui lòng chọn trường hợp của người nhận." |
| Nếu là thai nhi | Warning đặc biệt | "Vui lòng đọc hướng dẫn riêng cho trường hợp này trước khi bắt đầu." |

### UI behavior

- Validation hiển thị inline dưới field (không modal)
- Màu đỏ nhẹ cho error, không quá chói (người cao tuổi dễ đọc)
- Nút "Bắt đầu tụng" bị disabled khi còn validation error
- Sau khi fix error: nút tự động enable

### Owner

- apps/web: inline validation + helper copy
- apps/api: final schema validation and safe error codes
- Content module: source-backed helper text and warning wording
- Engagement module: server-side validation (Zod schema) như failsafe

### Phase

Phase C.

---

## 9. Feature 9: Official Name Helper + Recipient Wizard

### Là gì

Wizard nhỏ giúp user điền đúng `Kính Tặng` / `Tặng` theo case, thay vì để hai ô text trống hoàn toàn.

### Tại sao cần

FAQ cho thấy lỗi điền tên là lỗi cực hay gặp:
- dùng nickname
- viết tên quá mơ hồ
- nhầm người nhận với người tụng
- case thuê nhà / người trong nhà cần kinh / đổi tên

### UI

- bước chọn case:
  - người cần kinh của bản thân
  - người quá cố
  - người trong nhà cần kinh
  - hóa giải oán kết
  - tích lũy
- helper copy đổi theo case
- warning nếu:
  - tên quá ngắn
  - dùng placeholder như `mẹ`, `ba`, `bé`
  - để trống khi không phải case tích lũy
- example preview cho cách hiển thị final trên tờ

### Không làm

- không tự quyết định chuyện thăng văn / đổi tên
- không sinh wording “chuẩn pháp” nếu source chưa đủ

### Owner

- apps/web: wizard + preview
- Content module: case-specific helper copy
- Engagement module: persist `recipientType`, `recipientLabel`, `giverName`

### Phase

Phase C.

---

## 10. Feature 10: Interruption Recovery Helper

### Là gì

Trợ lý tiếp tục tụng khi user bị gián đoạn.

### Tại sao cần

FAQ cho thấy đây là pain point thật:
- đang niệm thì bị làm phiền
- không biết nên tiếp tục hay niệm lại
- không biết case nào có thể resume, case nào nên restart

### UI

- nút `Tạm dừng`
- khi resume, hỏi nhanh:
  - gián đoạn ngắn
  - gián đoạn lâu
  - đang ở kinh ngắn hay kinh dài
- hiển thị guidance card tương ứng:
  - resume from current point
  - restart current segment
  - ưu tiên niệm lại từ đầu với kinh ngắn

### Owner

- apps/web: pause/resume UX
- Content module: guidance wording per interruption case
- Engagement module: optional `pausedAt` / local resume state

### Phase

Phase D.

---

## 11. Feature 11: Focus Mode + Environment Checklist

### Là gì

Một lớp hỗ trợ chất lượng tụng, không phải để kiểm soát user.

### Tại sao cần

FAQ cho thấy chất lượng tụng phụ thuộc mạnh vào bối cảnh:
- đang làm việc nhà
- ở nơi không sạch
- đang nấu món mặn
- thiếu tập trung

### UI

- mini mode selector:
  - `Tôi đang tập trung`
  - `Tôi đang tranh thủ`
- nếu là `tranh thủ`, hiện warning về chất lượng
- environment checklist:
  - nơi sạch sẽ
  - không ở nhà vệ sinh
  - không đang làm món mặn
  - có thể giữ tập trung

### UX rule

- chỉ nhắc, không chặn cứng trừ khi là rule cấm rõ
- không biến thành shame UX

### Owner

- apps/web: focus mode card
- Content module: environment guardrails and copy

### Phase

Phase C.

---

## 12. Feature 12: Burning Readiness Advisor

### Là gì

Checklist cuối trước khi chuyển từ `marked_complete` sang `ready_to_burn`.

### Tại sao cần

Rất nhiều lỗi xảy ra ở giai đoạn sát lúc đốt:
- chưa chấm đúng
- quên phần tên
- ghi nhầm ngày
- đang ở nơi không phù hợp

### UI

- advisory sheet trước bước đốt:
  - đã chấm xong
  - tên người nhận / người tụng đã đúng
  - ngày ghi là dương lịch
  - đang ở nơi phù hợp
  - nếu đang ở bệnh viện / nơi trường khí kém thì hiện warning riêng
- CTA:
  - `Xem lại hướng dẫn đốt`
  - `Tôi đã kiểm tra xong`

### Owner

- apps/web: readiness advisory UI
- Content module: check items, warning copy
- Engagement module: store `last_guidance_acknowledged_at`

### Phase

Phase C.

---

## 13. Feature 13: Family Assist Mode

### Là gì

Mode hỗ trợ người thân lớn tuổi hoặc mắt kém, nhưng vẫn giữ đúng chủ thể tu tập.

### Tại sao cần

FAQ cho thấy đây là use case thật, không phải edge case.

### UI

- switch `Tôi đang hỗ trợ người thân`
- hiện guidance:
  - ai là người niệm chính
  - phần nào có thể hỗ trợ
  - phần nào không được thay
- caregiver checklist:
  - hỗ trợ cầm tay ký
  - hỗ trợ chấm đỏ
  - hỗ trợ đốt

### Không làm

- không biến thành delegation workflow nhiều tài khoản
- không làm shared editing realtime

### Owner

- apps/web: assist mode UX
- Content module: helper copy and guardrails

### Phase

Phase D.

---

## 14. Feature 14: Dream & Sign Caution Panel

### Là gì

Một panel giải thích “cách đọc thông tin tham khảo” cho các case như giấc mơ, con số, hiện tượng tro/lửa.

### Tại sao cần

FAQ cho thấy user rất dễ:
- over-interpret con số trong mơ
- over-interpret hiện tượng khi đốt
- đi tìm tool “dịch nghĩa” tự động

### UI

- panel luôn là dạng caution / educational
- nội dung:
  - đây là thông tin tham khảo
  - phải xét theo toàn cảnh
  - nếu không chắc, quay về lane thực hành an toàn
- CTA:
  - `Đọc FAQ`
  - `Xem hướng dẫn thực hành căn bản`

### Product rule

- không làm dream-number calculator
- không sinh kết luận tự động từ giấc mơ hoặc hiện tượng vật lý

### Owner

- Content module: caution content
- apps/web: render panel on FAQ / post-burn screen

### Phase

Phase B.

---

## 15. Feature 15: Post-Burn Reassurance Card

### Là gì

Card trấn an ngắn sau khi user đánh dấu đã đốt xong.

### Tại sao cần

Ngay sau lúc đốt, user thường dễ lo và tự suy diễn hiện tượng.

### UI

- text ngắn:
  - không cần quá chấp vào màu tro / ngọn lửa
  - nếu lo mình làm sai, mở lại checklist chuẩn
  - giữ tâm bình ổn
- action:
  - `Xem lại lưu ý khi đốt`
  - `Quay về danh sách tờ`

### Owner

- apps/web: completion state UI
- Content module: reassurance wording

### Phase

Phase C.

---

## 9. Tổng hợp phases

| Feature | Phase | Dependency |
|---|---|---|
| Image Compare Component | Phase A | Content blocks |
| Dynamic PDF Generator | Phase B | Content stable |
| Dream & Sign Caution Panel | Phase B | FAQ + caution content |
| Contextual Warning Engine | Phase D | Content + Case variants |
| Anti-mistake Validation UI | Phase C | Tracker UI |
| Official Name Helper + Recipient Wizard | Phase C | Tracker UI + content copy |
| Interruption Recovery Helper | Phase D | Tracker state + guidance copy |
| Focus Mode + Environment Checklist | Phase C | Tracker UI + content guardrails |
| Burning Readiness Advisor | Phase C | Tracker state + guidance copy |
| Family Assist Mode | Phase D | Tracker UI + content guardrails |
| Post-Burn Reassurance Card | Phase C | Completion state UI |
| Smart Quantity Calculator | Phase C | Calendar module |
| Step Timer | Phase C | Tracker UI |
| Offline PWA | Phase C | Tracker + Service Worker |
| Practice Companion deep-link | Phase D | Guide pages + Tracker |

---

## 10. Competitor comparison

| Feature | phapmontamlinh.vn | PMTL_VN |
|---|---|---|
| PDF download | Google Drive (static) | ✅ Dynamic PDF với thông tin đã điền |
| Số lượng gợi ý | Text tĩnh | ✅ Calculator tích hợp lịch âm |
| Warning contextual | Không | ✅ Theo từng trường hợp |
| Tracker cá nhân | Không có | ✅ /tu-tap/nha-nho |
| Offline | Không | ✅ PWA cache guide + tracker |
| Timer giữa các tờ | Không | ✅ Countdown timer |
| Hình đúng/sai | Ít, không interactive | ✅ image_compare block |
| Deep-link guide → tracker | Không | ✅ Context-aware navigation |

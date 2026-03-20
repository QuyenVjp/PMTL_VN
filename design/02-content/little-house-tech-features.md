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
- Tracker entries: IndexedDB local → sync với `POST /engagement/ngoi-nha-nho-sheets/:id/entries` khi online
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

- apps/web: form validation trong tracker UI
- Engagement module: server-side validation (Zod schema) như failsafe

### Phase

Phase C (cùng với tracker).

---

## 9. Tổng hợp phases

| Feature | Phase | Dependency |
|---|---|---|
| Image Compare Component | Phase A | Content blocks |
| Dynamic PDF Generator | Phase B | Content stable |
| Contextual Warning Engine | Phase D | Content + Case variants |
| Anti-mistake Validation UI | Phase C | Tracker UI |
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

# Ngoại Lệ Thời Gian & Tự Động Sửa Lỗi Niệm Kinh — Advanced Recitation Time Exceptions

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Quy tắc thời khóa và sám hối lỗi niệm
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Mở rộng logic thời gian của `daily-recitation-system.md` với 3 nghiệp vụ bổ sung:
1. **Midnight Exception:** Mở rộng deadline niệm *Tâm Kinh* và *Vãng Sinh Chú* đến 00:00 khi user đang trong phiên Tiểu Phương Tử có điền đủ `offerTo`.
2. **Full Title Enforcement:** Nhắc nhở niệm đầy đủ tiêu đề kinh trước khi vào nội dung chính.
3. **Auto-Correction Popup:** Tự động render *Bổ Khuyết Chân Ngôn* cuối mỗi phiên bài tập hàng ngày.

**Không trùng với:** `daily-recitation-system.md` (catalog kinh + presets), `validate-little-house-burn-conditions.md` (burn gate).

---

## Owner module

`content` — ritual rules và sutra catalog
`engagement` — session state và UI enforcement

---

## Actors

- `member` — người thực hành
- `system` — tự động bật exceptions và popup

---

## Rule 1: Midnight Exception cho Tiểu Phương Tử

### Trigger
User đang trong session `NgoiNhaNhoSheet` với `status = IN_PROGRESS` và `offerTo IS NOT NULL`.

### Logic

```
isLittleHouseSession     = activeSheet.status == "IN_PROGRESS"
isOfferToFilled          = activeSheet.offerTo != null && activeSheet.offerTo.trim() != ""

if (isLittleHouseSession && isOfferToFilled):
  extendedDeadline["TamKinh"]     = "23:59:59"  // thay vì 22:00
  extendedDeadline["VangSinhChu"] = "23:59:59"  // thay vì 22:00
else:
  // giữ nguyên rule gốc: Tâm Kinh và Vãng Sinh Chú cấm sau 22:00
```

### Implementation notes

- Service check này là **per-request**, không phải global toggle.
- `offerTo` phải được verify server-side, không tin frontend.
- Nếu user kết thúc sheet (status → `CHANTED`) sau 22:00, deadline extension **tự động hết** với sheet đó.
- Exception không áp dụng cho các kinh khác (`Lễ Phật Đại Sám Hối Văn` vẫn cấm sau 22:00 cứng).

### API endpoint bổ sung

```
GET /api/chanting/time-gate-status?sheetId=<publicId>

Response:
{
  currentTime:         ISO8601,
  isLittleHouseActive: boolean,
  offerToFilled:       boolean,
  gates: {
    TamKinh:     { allowed: boolean, until: "22:00" | "00:00" },
    VangSinhChu: { allowed: boolean, until: "22:00" | "00:00" },
    LePhat:      { allowed: boolean, until: "22:00" },  // không exception
    DaiBi:       { allowed: boolean, until: "anytime" }
  }
}
```

---

## Rule 2: Full Title Enforcement (UI)

### Rule

Trước khi user bắt đầu niệm bất kỳ kinh nào, UI **bắt buộc hiển thị** tiêu đề đầy đủ với font nổi bật.

| Kinh | Tiêu đề đầy đủ cần niệm |
|---|---|
| Chú Đại Bi | *Thiên Thủ Thiên Nhãn Vô Ngại Đại Bi Tâm Đà La Ni* (Qian Shou Qian Yan Wu Ai Da Bei Xin Tuo Luo Ni) |
| Tâm Kinh | *Bát Nhã Ba La Mật Đa Tâm Kinh* (Bo Re Bo Luo Mi Duo Xin Jing) |
| Lễ Phật Đại Sám Hối Văn | *Nam Mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn Quán Thế Âm Bồ Tát* (opening invocation) |
| Vãng Sinh Chú | *Bạt Nhất Thiết Nghiệp Chướng Căn Bản Đắc Sinh Tịnh Độ Đà La Ni* |

### UI rules

- Tiêu đề hiển thị trong **card riêng biệt** trước content block, font-size lớn hơn body ít nhất 20%.
- Không thể scroll qua tiêu đề trong vòng 3 giây đầu (delay UX).
- Tooltip nhắc nhở: *"Hãy niệm đầy đủ tiêu đề này trước khi vào phần nội dung chính để giữ đúng linh nghiệm."*
- **Không phải hard block** — user vẫn có thể proceed sau 3 giây.

### Content ownership

Tiêu đề đầy đủ của từng kinh được quản lý trong `SutraCatalog` (Content module), field `fullTitle` và `fullTitlePinyin`. Admin CMS có thể cập nhật — không hardcode trong component.

---

## Rule 3: Auto-Correction Popup — Bổ Khuyết Chân Ngôn

### Trigger

Khi user bấm **[Kết thúc bài tập hàng ngày]** (hoàn thành daily recitation session).

### Flow

1. Hệ thống tự động render **Bổ Khuyết Popup** trước khi đóng phiên:
   - Title: *"Bổ Khuyết Chân Ngôn — Bù Đắp Lỗi Phát Âm"*
   - Content: Full text Bổ Khuyết Chân Ngôn (từ `SutraCatalog.key = "bo_khuyet_chan_ngon"`)
   - Counter: user chọn số biến cần niệm: `[3 biến]` | `[5 biến]` | `[7 biến]`
   - Default suggestion: **3 biến** (cho phiên bình thường), **7 biến** (nếu user tự báo cáo có sai sót).

2. User có thể `[Bỏ qua]` — hệ thống chỉ log `recitation.session.skipped-bo-khuyet`.

3. Sau khi hoàn thành:
   - Append `DailyRecitationSession.boKhuyetCount = N`.
   - Đóng phiên.
   - Audit `recitation.session.completed`.

### UX note

- Popup này là **optional reminder**, không phải hard gate.
- Chỉ xuất hiện **1 lần per session** — không lặp nếu user đã dismiss.
- Không xuất hiện nếu phiên chỉ có niệm Bổ Khuyết (tránh vòng lặp vô tận).

---

## Write path (summary)

1. `GET /api/chanting/time-gate-status` — session-aware, check Little House + offerTo.
2. `POST /api/recitation/session/complete` — append `boKhuyetCount`, close session.
3. Content CMS cung cấp `SutraCatalog` entries cho `fullTitle`, `fullTitlePinyin`, `bo_khuyet_chan_ngon` text.

---

## Errors

| Condition | Error code | HTTP |
|---|---|---|
| `sheetId` không tồn tại khi check time gate | `not_found` | 404 |
| `sheetId` không thuộc actor | `forbidden` | 403 |
| Chưa đăng nhập khi complete session | `unauthorized` | 401 |

---

## Audit

| Action | Actor | Trigger |
|---|---|---|
| `recitation.time-gate.exception-granted` | actorUserId | Midnight exception được kích hoạt |
| `recitation.session.completed` | actorUserId | Phiên bài tập kết thúc |
| `recitation.session.skipped-bo-khuyet` | actorUserId | User bỏ qua Bổ Khuyết |

---

## Notes for AI/codegen

- Time gate check phải là **server-side** — không chỉ dựa vào client clock (có thể bị chỉnh sai).
- `offerTo` validation phải trim whitespace trước khi check `IS NOT NULL` — `"   "` không phải filled.
- Bổ Khuyết Chân Ngôn text lấy từ `SutraCatalog` (Content module), không hardcode string trong component.
- `fullTitle` field trên `SutraCatalog` cần được thêm vào migration nếu chưa có — không tạo model mới.
- 3-giây delay UX cho tiêu đề: implement bằng CSS `transition` + `pointer-events: none`, không dùng `setTimeout` trong business logic.

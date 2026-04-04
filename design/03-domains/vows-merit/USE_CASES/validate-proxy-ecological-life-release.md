# Phóng Sinh Ủy Thác & Bảo Vệ Sinh Thái — Proxy & Ecological Life Release Validation

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Nghi thức phóng sinh nâng cao
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Mở rộng `guide-life-release-interactive-flow.md` với 2 nghiệp vụ chưa được xử lý:

1. **Ecological Validation:** Kiểm tra loài vật phù hợp với môi trường thả — tránh phóng sinh gây hại sinh thái.
2. **Proxy Merit Protection:** Khi dùng tiền bản thân mua cá phóng sinh cho người khác, phải có lời khấn ủy thác tiền + cảnh báo cứng không nhắc tên bản thân tại điểm thả.

**Không trùng với:** `guide-life-release-interactive-flow.md` (luồng tổng thể), `log-life-release.md` (ghi nhận hậu kỳ).

---

## Owner module

`vows-merit` — [xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người thực hiện phóng sinh
- `system` — ecological validator + merit protection alert

---

## Part 1: Ecological Validation

### Trigger

Khi user tạo `LifeReleaseSession` và chọn `animalType` + `releaseEnvironment`.

### Input bổ sung

```typescript
// Thêm vào input contract của guide-life-release-interactive-flow.md Phase 1:
{
  animalType:         AnimalType     // "fish_freshwater" | "fish_saltwater" | "crab" | "shrimp" | "turtle_freshwater" | "turtle_sea" | "bird" | "other"
  releaseEnvironment: Environment    // "river" | "lake" | "pond" | "sea" | "stream" | "release_point_unknown"
  locationNote:       string
}
```

### Ecological Compatibility Matrix (hardcoded)

```typescript
const ECO_RULES: Record<AnimalType, Environment[]> = {
  fish_freshwater:    ["river", "lake", "pond", "stream"],          // CẤM: "sea"
  fish_saltwater:     ["sea"],                                       // CẤM: "river", "lake", "pond"
  turtle_freshwater:  ["river", "lake", "pond"],                    // CẤM: "sea"
  turtle_sea:         ["sea"],                                       // CẤM: "river", "lake", "pond"
  crab:               ["sea", "river", "stream"],
  shrimp:             ["sea", "river", "pond", "lake"],
  bird:               [],                                            // no environment restriction
  other:              [],
}

function validateEcology(animal: AnimalType, env: Environment): EcoResult {
  const allowed = ECO_RULES[animal]
  if (allowed.length === 0) return { ok: true }
  if (!allowed.includes(env)) return {
    ok: false,
    severity: "HARD_BLOCK",
    message: `${animal} không thể sống trong môi trường ${env}. Phóng sinh loại này ở đây sẽ gây chết vật và phản tác dụng.`
  }
  return { ok: true }
}
```

### Fishing Zone Advisory

Nếu `releaseEnvironment = "sea"` hoặc `"river"` và user nhập location có keyword "cảng", "bến cá", "khu đánh bắt":
- Hiển thị **advisory card màu cam** (không block):
  > *"Vị trí này gần khu vực đánh bắt thủy sản. Khuyến nghị tìm địa điểm khác để sinh vật có cơ hội sống sót tốt hơn."*

### Ecological Disclaimer (luôn hiển thị)

Cuối màn hình chọn địa điểm, hiển thị **static text**:
> *"Nếu việc phóng sinh vô tình gây ra vấn đề mất cân bằng sinh thái, con xin Quán Thế Âm Bồ Tát và Hộ Pháp từ bi tha thứ."*

User không cần đọc to — đây là lời khấn mặc định được hệ thống ghi nhận kèm theo session.

### Write path (eco gate)

1. Validate `animalType` + `releaseEnvironment`.
2. Run `validateEcology()`.
3. Nếu `severity = HARD_BLOCK`:
   - **Block** — không cho tiến hành.
   - Hiển thị lý do rõ ràng + gợi ý môi trường đúng.
   - Return `400 ecological_mismatch`.
4. Nếu fishing zone advisory → render advisory card, user xác nhận tiếp tục.
5. Ghi `ecoValidated = true` + `disclaimerAppended = true` vào `LifeReleaseSession`.

---

## Part 2: Proxy Merit Protection

### Trigger

User chọn `dedicationType = "PROXY"` trong session phóng sinh — tức là **dùng tiền của mình** mua cá đi phóng sinh thay người khác.

### Business Rules

#### Rule A — Lời Khấn Ủy Thác Tiền (Pre-departure)

Trước khi xuất phát, hệ thống bắt buộc render **Money Dedication Card**:

```
Title: "Ủy Thác Tiền Phóng Sinh"
Body:  "Xin Quán Thế Âm Bồ Tát và Hộ Pháp chứng minh:
        Con [Tên người đi phóng sinh] dùng tiền của con để mua sinh vật phóng sinh.
        Số tiền này và toàn bộ công đức phóng sinh hôm nay
        xin ủy thác hoàn toàn cho [Tên người được phóng sinh].
        Con không nhận bất kỳ phần công đức nào từ đợt phóng sinh này."

Button: [Đã đọc lời khấn — Bắt đầu đi mua]
```

Card này **không có nút Skip** — bắt buộc đọc trước khi đi.

#### Rule B — Merit Theft Prevention tại điểm thả (CRITICAL)

Khi user check-in **[Đã đến nơi thả]** với `dedicationType = PROXY`:

1. Hệ thống render **CRITICAL RED ALERT** (full-screen overlay, không thể dismiss trong 5 giây):

```
🔴 CẢNH BÁO QUAN TRỌNG

TUYỆT ĐỐI KHÔNG nhắc đến TÊN của bạn tại đây!

Khi đang thả sinh vật:
• Không được nói tên bản thân
• Không được nghĩ đến tên bản thân
• Không được giới thiệu bản thân

Nếu bạn vô ý nhắc đến hoặc nghĩ về tên mình,
một phần công đức sẽ tự động chuyển sang bạn
thay vì người bệnh [Tên người được phóng sinh].

Hãy chỉ tập trung vào [Tên người được phóng sinh].
```

2. Sau 5 giây, nút `[Đã hiểu — Tiến hành thả]` xuất hiện.
3. Ghi `proxyMeritWarningShown = true` vào session.

#### Rule C — Lời Khấn tại điểm thả (Proxy variant)

Checklist bước 5 (Lời Khấn) trong on-site flow thay bằng template Proxy:

```
"Xin Quán Thế Âm Bồ Tát chứng minh.
Con [Tên người đi phóng sinh] đại diện cho [Tên người được phóng sinh]
thả [số lượng] [loài vật] hôm nay ngày [ngày].
Toàn bộ công đức phóng sinh này xin kính dâng lên
oan gia trái chủ của [Tên người được phóng sinh]
để hóa giải nghiệp chướng và cầu cho [Tên người được phóng sinh] [mục đích: khỏi bệnh / bình an / ...]."
```

Template được inject tự động từ `proxyFor.recipientName` và `proxyFor.purpose`.

---

## Write path tổng hợp (bổ sung vào Phase 1-5 của guide-life-release-interactive-flow)

```
Phase 0 (NEW): Eco + Proxy Setup
  → validateEcology()
  → if PROXY: render MoneyDedicationCard (block until confirmed)

Phase 3 (EXTEND): On-site
  → if PROXY: render CRITICAL red alert (5s lock) trước checklist
  → swap lời khấn template sang Proxy variant

Phase 5 (EXTEND): Journal close
  → record: ecoValidated, proxyMeritWarningShown, ecologicalDisclaimer
```

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| `animalType` + `releaseEnvironment` incompatible | `ecological_mismatch` | 400 | Chọn lại môi trường |
| `dedicationType = PROXY` thiếu `proxyFor.recipientName` | `invalid_body` | 400 | Nhập tên người nhận |
| MoneyDedicationCard chưa confirm (server check) | `precondition_not_met` | 400 | Phải xác nhận lời khấn |
| Chưa đăng nhập | `unauthorized` | 401 | — |

---

## Audit

| Action | Actor | Trigger |
|---|---|---|
| `life-release.eco-validation.passed` | actorUserId | Eco check thành công |
| `life-release.eco-validation.blocked` | actorUserId | Eco mismatch hard block |
| `life-release.proxy.money-dedicated` | actorUserId | MoneyDedicationCard confirmed |
| `life-release.proxy.merit-warning-shown` | actorUserId | CRITICAL alert hiển thị tại điểm thả |

---

## Notes for AI/codegen

- `ECO_RULES` matrix là **hardcoded constant trong service** — không phải DB config. Admin không được chỉnh sửa rule này.
- CRITICAL red alert có `5 giây lock` — implement bằng `setTimeout` + state flag `canDismiss`, không phải backend gate.
- `MoneyDedicationCard` không có nút Skip — enforce bằng cách không render nút đó trong component.
- `animalType` enum mới cần thêm differentiation: `fish_freshwater` vs `fish_saltwater` (hiện tại có thể chỉ có `fish` generic). Cần migration nếu enum cũ chỉ có 1 giá trị fish.
- Ecological disclaimer text phải được **lưu vào session record** (không chỉ display) để có audit proof sau này.

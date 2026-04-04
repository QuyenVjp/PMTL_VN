# Giao Thức Chụp Ảnh Bàn Thờ Khi Du Lịch — Travel Altar Photo Protocol

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi người tu đi du lịch hoặc công tác xa nhà, họ có thể mang ảnh bàn thờ để thắp Tâm Hương. Tuy nhiên, **khi ở chế độ du lịch (Travel Mode) và ngoài nhà, tuyệt đối KHÔNG được thắp hương trên bàn thờ di động**. Chỉ được đặt Tâm Hương (tâm niệm) và cầu nguyện im lặng mà thôi.

Hệ thống phát hiện người dùng đang ở chế độ du lịch + ngoài nhà + cố gắng log Tâm Hương session, hiển thị cảnh báo mà không block (advisory only).

---

## Owner module

`vows-merit` — TravelAltarPhotoProtocol / TamHuongTravelValidator
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — đang ở chế độ du lịch, tại địa điểm ngoài nhà, muốn log Tâm Hương session
- `system` — phát hiện điều kiện travel mode + outside home, hiển thị cảnh báo advisory

---

## Trigger

`POST /api/vows-merit/tam-huong/travel-session`

User cố gắng log Tâm Hương session khi:
- `travelMode.isActive = true`
- `travelMode.locationOutsideHome = true`

---

## Business Rule

| Điều kiện | Hành động |
|---|---|
| Travel mode OFF hoặc ở nhà | ✅ Tiếp tục bình thường, không cảnh báo |
| Travel mode ON + ngoài nhà + log Tâm Hương | ⚠️ Hiển thị banner vàng cảnh báo advisory |
| User xác nhận hiểu luật | ✅ Log session bình thường (no hard block) |
| User bỏ qua cảnh báo | ✅ Vẫn log bình thường (advisory only) |

**Quy tắc cứng:** Khi du lịch, tuyệt đối KHÔNG thắp hương trên bàn thờ di động. Chỉ được đặt Tâm Hương và cầu nguyện im lặng.

---

## Input Contract

```typescript
interface TamHuongTravelDto {
  isInTravelMode:     boolean   // Travel mode flag
  locationOutsideHome: boolean  // GPS/manual location check
  sessionType:        string    // "tam_huong" hoặc loại session khác
  understood?:        boolean   // Checkbox: "Tôi hiểu luật tu"
}
```

---

## Write Path

```
POST /api/vows-merit/tam-huong/travel-session
────────────────────────────────────────────
Body: {
  isInTravelMode: boolean,
  locationOutsideHome: boolean,
  understood?: boolean   // Advisory acknowledgment (optional)
}

1. Parse request body.
2. Check advisory conditions:
   - Nếu isInTravelMode = true AND locationOutsideHome = true:
     → Flag advisory warning (log audit event)
     → FE sẽ hiển thị cảnh báo TRƯỚC khi gọi endpoint này
3. Log Tâm Hương session bình thường.
   {
     userId,
     sessionType: "tam_huong",
     timestamp: now(),
     travelModeActive: isInTravelMode,
     outsideHomeConfirmed: locationOutsideHome,
     advisoryAckowledged: understood || false
   }
4. Audit: vow.tam-huong.travel-mode-warning-shown (nếu cảnh báo)
5. Response: { success: true, sessionId: "..." }
```

---

## FE Behavior

### Luồng Tam Hương Khi Du Lịch

```
Step 1: User bấm "Bắt Đầu Tâm Hương"

Step 2: Kiểm tra điều kiện
  - Nếu travel mode OFF hoặc ở nhà → tiếp tục bình thường
  - Nếu travel mode ON + outside home → hiện banner cảnh báo (Step 3)

Step 3: Hiển thị Banner Cảnh Báo (màu vàng, advisory only)
  ┌──────────────────────────────────────────────────────────┐
  │  ⚠️  CẢNH BÁO TU LUỤ — KHI ĐI DU LỊCH                    │
  │                                                          │
  │  Khi du lịch, tuyệt đối KHÔNG thắp hương trên bàn       │
  │  thờ di động. Chỉ được đặt Tâm Hương và cầu nguyện      │
  │  im lặng.                                               │
  │                                                          │
  │  Bàn thờ di động không có năng lượng như bàn thờ        │
  │  thật ở nhà. Hương thật có thể làm khó khăn cho         │
  │  năng lượng bàn thờ.                                    │
  │                                                          │
  │  ☑ Tôi hiểu luật tu (xác nhận để tiếp tục)             │
  │                                                          │
  │  [Tiếp Tục Tâm Hương] [Hủy]                           │
  └──────────────────────────────────────────────────────────┘
```

### Banner Style

- Màu nền: **vàng** (`bg-yellow-100` hoặc `bg-amber-100`)
- Viền: **cam/vàng** (`border-yellow-400`)
- Icon: ⚠️ (warning triangle)
- Text: "CẢNH BÁO TU LUỤ" in đậm
- Checkbox: `[_] Tôi hiểu luật tu`
  - Nếu không tick → button [Tiếp Tục Tâm Hương] bị **disable**
  - Khi tick → button enable
  - Advisory only — không hard block, user vẫn có thể click "Hủy" hoặc nút khác

### Logic Điều Kiện

```typescript
// FE-side check trước khi POST
async function handleStartTamHuong() {
  const { isInTravelMode, locationOutsideHome } = getUserTravelStatus()

  if (isInTravelMode && locationOutsideHome) {
    // Hiện modal cảnh báo
    showTravelAdvisoryBanner()
    // User phải tick checkbox trước khi click "Tiếp Tục"
    // Nút "Tiếp Tục" disabled cho đến khi checkbox = true
  } else {
    // Tiếp tục bình thường
    postTamHuongSession()
  }
}
```

---

## DTO & Schema

### DTO

```typescript
interface TamHuongTravelDto {
  isInTravelMode:     boolean   // từ TravelModeProfile.isActive
  locationOutsideHome: boolean  // từ GPS hoặc location picker
  sessionType:        string    // "tam_huong"
  understood:         boolean   // checkbox acknowledgment (FE: required để enable button)
}
```

### Schema Changes

**None.** This is advisory only — không cần thay đổi schema.

Nếu muốn track advisory acknowledgments (optional):

```prisma
model TamHuongSession {
  // ... existing fields ...
  travelModeActive:      Boolean   @default(false)
  outsideHomeConfirmed:  Boolean   @default(false)
  advisoryAckowledged:   Boolean   @default(false)
}
```

---

## Error Handling

**No hard errors.** This is advisory only.

| Condition | Behavior |
|---|---|
| Travel mode + outside home | ⚠️ Warning banner (non-blocking) |
| User ignores warning | ✅ Session logs normally |
| User dismisses banner | ✅ Back to normal flow |

---

## Audit

| Action | Trigger |
|---|---|
| `vow.tam-huong.travel-mode-warning-shown` | FE detects travel mode + outside home, shows banner |
| `vow.tam-huong.travel-advisory-acknowledged` | User ticks checkbox + clicks "Tiếp Tục" |
| `vow.tam-huong.travel-session.logged` | Session created (advisory acknowledged or ignored) |

---

## Related Rules

Differs from [transit-wilderness-recitation-guard.md](./transit-wilderness-recitation-guard.md):
- **Transit Recitation Guard:** Controls VOICE-BASED chanting during travel (audio/recitation guards)
- **Travel Altar Photo Protocol:** Controls INCENSE BURNING on portable altar during travel (advisory about physical offerings)

---

## Notes for AI/codegen

- Advisory only — no hard block. User can proceed even if they ignore the warning.
- FE-side detection: check `TravelModeProfile.isActive` + `userLocation.isOutsideHome` before showing banner.
- Location detection: either GPS (if enabled) or user manually selected location as "outside home" in travel mode setup.
- Checkbox state management: disable button until `understood = true`.
- Audit events should log both "warning shown" and "acknowledgment received" separately.
- If full tracking desired, add `travelModeActive`, `outsideHomeConfirmed`, `advisoryAckowledged` to `TamHuongSession` schema (optional).

---

## Related

- [travel-mode-altar-photo-rule.md](./travel-mode-altar-photo-rule.md) — Ảnh bàn thờ di động khi đi xa
- [heart-incense-diet-counter.md](./heart-incense-diet-counter.md) — Tâm Hương session base flow
- [validate-altar-oil-and-water.md](./validate-altar-oil-and-water.md) — Altar offering validations

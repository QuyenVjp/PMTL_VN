# Giao Thức "Để Trần" Bàn Thờ Khi Đi Vắng — Travel Mode No-Cover Protocol

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 391)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi người tu đi công tác hoặc du lịch vài ngày, bàn thờ phải được **để nguyên trạng thái** — tuyệt đối **KHÔNG ĐƯỢC dùng vải, màn, hoặc bất kỳ vật liệu gì che đậy tượng Bồ Tát**. Chỉ cần dọn sạch trái cây, hoa dễ hỏng trước khi đi. Che đậy tượng bằng vải là hành động mang tính "nhốt" trường khí, không phải bảo vệ.

---

## Owner module

`vows-merit` — TravelModeProfile / AltarManagement
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — khai báo đi vắng và xác nhận checklist bàn thờ
- `system` — enforce checklist bắt buộc trước khi activate Travel Mode

---

## Trigger

User bấm **[Khai Báo Đi Vắng / Bật Travel Mode]** trong màn hình quản lý bàn thờ.

---

## Business Rules

| Hành động | Quy tắc |
|---|---|
| Dọn sạch trái cây, hoa dễ hỏng trước khi đi | ✅ BẮT BUỘC |
| Để nguyên trạng thái bàn thờ | ✅ BẮT BUỘC |
| Dùng vải/màn che đậy tượng Bồ Tát | ❌ FORBIDDEN |
| Tắt đèn dầu trước khi đi (an toàn phòng cháy) | ✅ ALLOWED — lý do thực tế |
| Thay nước trước khi đi nếu có thể | ✅ RECOMMENDED |

---

## Input Contract

```
ActivateTravelModeDto {
  departureDate:          Date
  returnDate?:            Date
  perishablesClearedConfirmed: boolean   // BẮT BUỘC true
  didNotCoverAltar:       boolean        // BẮT BUỘC true — không che đậy
  lampTurnedOffConfirmed: boolean        // optional — an toàn phòng cháy
}
```

---

## Write Path

```
POST /api/vows-merit/travel-mode/activate
──────────────────────────────────────────
Body: ActivateTravelModeDto

1. Validate perishablesClearedConfirmed = true.
   - Nếu false → HTTP 422:
     { error: "perishables_not_cleared", message: "Dọn sạch hoa quả dễ hỏng trước khi kích hoạt Travel Mode." }

2. Validate didNotCoverAltar = true.
   - Nếu false → HTTP 422:
     {
       error:   "altar_cover_forbidden",
       message: "Tuyệt đối không được dùng vải hay màn che đậy tượng Bồ Tát khi đi vắng. Hãy để nguyên trạng thái bàn thờ."
     }

3. Upsert TravelModeProfile:
   {
     userId, departureDate, returnDate,
     perishablesClearedConfirmed: true,
     didNotCoverAltar: true,
     lampTurnedOffConfirmed,
     activatedAt: now(),
     status: "ACTIVE"
   }

4. Suppress altar-related reminders cho đến returnDate.
5. Audit: travel-mode.activated
```

---

## FE Behavior

### Checklist Trước Khi Đi Vắng

```
┌──────────────────────────────────────────────────────────┐
│  ✈️  Khai Báo Đi Vắng — Checklist Bàn Thờ              │
│                                                          │
│  Ngày đi:  [04/04/2026]   Ngày về: [08/04/2026]       │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│  Bắt buộc:                                             │
│                                                          │
│  [_] Tôi đã dọn sạch trái cây, hoa dễ hỏng           │
│      (để không bị thối rữa khi vắng nhà)              │
│                                                          │
│  [_] Tôi để NGUYÊN TRẠNG THÁI bàn thờ,               │
│      KHÔNG dùng vải hay màn che đậy tượng Bồ Tát.    │
│                                                          │
│  💡  Che đậy tượng không phải cách bảo vệ —          │
│      hãy để trường khí bàn thờ lưu thông tự nhiên.   │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│  Tùy chọn:                                             │
│                                                          │
│  [_] Tôi đã tắt đèn dầu (an toàn phòng cháy)        │
│                                                          │
│  [Kích Hoạt Travel Mode]  ← enable khi đủ 2 ô bắt buộc│
└──────────────────────────────────────────────────────────┘
```

---

## Schema Notes

Bổ sung vào `TravelModeProfile` (model hiện có từ Phase 8):

```prisma
model TravelModeProfile {
  // ... existing fields (noIncenseBurningConfirmed, altarPhotoUrl) ...
  didNotCoverAltar             Boolean   @default(false)
  perishablesClearedConfirmed  Boolean   @default(false)
  lampTurnedOffConfirmed       Boolean   @default(false)
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `travel-mode.activated` | Travel Mode bật thành công |
| `travel-mode.cover-rejected` | `didNotCoverAltar = false` bị reject |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `perishablesClearedConfirmed` = false | `perishables_not_cleared` | 422 |
| `didNotCoverAltar` = false | `altar_cover_forbidden` | 422 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Related

- [travel-mode-altar-photo-rule.md](./travel-mode-altar-photo-rule.md) — No-incense + altar photo khi đi vắng (Phase 8)
- [altar-profile-spatial-validation.md](./altar-profile-spatial-validation.md) — Kiểm tra không gian bàn thờ

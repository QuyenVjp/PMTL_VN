# Bộ Hiển Thị Phước Báo Vật Phẩm Cúng Dường — Offering Blessing Visualizer

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 375, 367)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Mỗi loại vật phẩm cúng dường mang lại một phước báo cụ thể theo giáo lý. Hiển thị phước báo ngay sau khi user log cúng dường có tác dụng khích lệ tinh tấn, đặc biệt với người mới tu. Đây là Gamification layer — không ảnh hưởng đến business logic cốt lõi.

| Vật phẩm | Phước báo |
|---|---|
| Hoa tươi | Tướng mạo trở nên xinh đẹp, trang nghiêm |
| Trái cây tươi | Những lời cầu xin thành hiện thực nhanh hơn |
| Dầu thực vật (chêm đèn hoặc nguyên chai) | Mắt sáng, tai thính, gia tăng trí tuệ |

---

## Owner module

`engagement` — OfferingLog / AltarGamification
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — log vật phẩm cúng dường
- `system` — return blessing payload trong response, FE render toast animation

---

## Trigger

Sau bất kỳ `POST` thành công nào tạo `AltarOfferingItem` với `itemType` thuộc nhóm FLOWERS / FRUITS / OIL.

---

## Business Rules

### Blessing Map

```typescript
const OFFERING_BLESSING_MAP: Record<OfferingBlessingType, BlessingPayload> = {
  FLOWERS: {
    icon:    "🌸",
    title:   "Phước báo nhận được",
    message: "Tướng mạo trở nên xinh đẹp và trang nghiêm."
  },
  FRUITS: {
    icon:    "🍊",
    title:   "Phước báo nhận được",
    message: "Những lời cầu xin sẽ thành hiện thực nhanh hơn."
  },
  OIL: {
    icon:    "🕯️",
    title:   "Phước báo nhận được",
    message: "Mắt sáng, tai thính và gia tăng trí tuệ."
  }
}
```

### Mapping offeringType → BlessingType

```typescript
function resolveBlessingType(itemType: AltarOfferingType): OfferingBlessingType | null {
  if (itemType === "FLOWERS")                          return "FLOWERS"
  if (itemType === "FRUITS" || itemType === "FRUIT_PLATE") return "FRUITS"
  if (itemType === "OIL" || itemType === "FULL_BOTTLE_OIL") return "OIL"
  return null   // WATER, INCENSE, etc. — no blessing toast for now
}
```

---

## Write Path (Response Extension)

Các endpoint hiện có chỉ cần bổ sung `blessing` field vào response:

```
POST /api/vows-merit/altar-offerings/flowers       → AltarOfferingItem + blessing
POST /api/vows-merit/altar-offerings/fruit-plates  → AltarOfferingItem + blessing
POST /api/vows-merit/altar-offerings/oil           → AltarOfferingItem + blessing
POST /api/vows-merit/altar-offerings/full-bottle-oil → AltarOfferingItem + blessing

Response shape (augmented):
{
  offeringItem: AltarOfferingItem,
  blessing: {
    icon:    string,
    title:   string,
    message: string
  } | null
}
```

Không cần endpoint mới — chỉ augment response hiện có.

---

## FE Behavior

### Success Toast Animation

Sau khi API trả về `blessing != null`, FE hiển thị toast nổi lên từ dưới:

```
┌──────────────────────────────────────────────────────────┐
│  🌸  Phước báo nhận được                                 │
│                                                          │
│  Tướng mạo trở nên xinh đẹp và trang nghiêm.          │
│                                                          │
│  ✨  (animation: sparkle effect 1.5 giây)               │
└──────────────────────────────────────────────────────────┘
```

- Duration: 4 giây tự động dismiss
- Position: bottom-center
- Animation: slide up + fade out
- Không cần user interaction — tự dismiss

### Ví dụ theo từng loại

**Sau khi cúng hoa:**
> 🌸 **Phước báo nhận được** — Tướng mạo trở nên xinh đẹp và trang nghiêm.

**Sau khi cúng trái cây:**
> 🍊 **Phước báo nhận được** — Những lời cầu xin sẽ thành hiện thực nhanh hơn.

**Sau khi chêm dầu hoặc cúng nguyên chai:**
> 🕯️ **Phước báo nhận được** — Mắt sáng, tai thính và gia tăng trí tuệ.

---

## Schema Notes

Không cần model mới — blessing là stateless response payload, không persist vào DB.

`OFFERING_BLESSING_MAP` nên lưu vào `SystemConfig` JSON để admin có thể chỉnh message mà không cần deploy:

```json
{
  "key": "offering_blessing_map",
  "value": {
    "FLOWERS": { "icon": "🌸", "title": "Phước báo nhận được", "message": "Tướng mạo trở nên xinh đẹp và trang nghiêm." },
    "FRUITS":  { "icon": "🍊", "title": "Phước báo nhận được", "message": "Những lời cầu xin sẽ thành hiện thực nhanh hơn." },
    "OIL":     { "icon": "🕯️", "title": "Phước báo nhận được", "message": "Mắt sáng, tai thính và gia tăng trí tuệ." }
  }
}
```

---

## Audit

Không cần audit riêng cho blessing display — blessing là side-effect của offering log đã có audit.

---

## Notes for AI/codegen

- Blessing payload là `null` cho các offeringType không trong map (WATER, INCENSE, SANDALWOOD) — FE check null trước khi render toast.
- `OFFERING_BLESSING_MAP` resolve từ `SystemConfig` tại runtime — cache 1 giờ.
- Không lưu blessing vào DB — stateless. Nếu user refresh, không hiện lại. Đây là one-time celebration.
- Phase 2+: có thể thêm blessing cho INCENSE (Đại Hương) và WATER khi có thêm khai thị.

---

## Related

- [altar-fruit-atomic-replacement.md](../vows-merit/USE_CASES/altar-fruit-atomic-replacement.md) — Fruit plate management
- [oil-bottle-offering-label-removal.md](../vows-merit/USE_CASES/oil-bottle-offering-label-removal.md) — Full bottle oil offering
- [altar-profile-spatial-validation.md](../vows-merit/USE_CASES/altar-profile-spatial-validation.md) — Altar setup validation

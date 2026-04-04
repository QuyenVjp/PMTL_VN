# Bộ Lọc Thực Vật & Sinh Học Dâng Cúng — Altar Botanical & Biological Filter

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn Phase 30)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Bàn thờ Phật bắt buộc phải thanh tịnh. Một số loại hoa và trái cây bị cấm vì mang từ trường không phù hợp hoặc bất lợi: hoa có gai gây thương tổn, hoa có tên không tốt lành, cây trồng trong đất mang tính âm trược, trái cây có nghĩa không may. Hệ thống phải tự động kiểm tra khi user ghi nhận vật phẩm dâng cúng.

---

## Owner module

`vows-merit` — AltarOfferingService / BotanicalBiologicalFilter
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — ghi log vật phẩm dâng hoa/quả lên bàn thờ ảo
- `system` — kiểm tra blacklist hoa/quả, validate điều kiện trồng

---

## Trigger

Khi user log `OfferItems` với `itemType = FLOWER` hoặc `itemType = FRUIT` vào Nhật Ký Bàn Thờ.

---

## Business Rules

### Hoa (FLOWER)

| Điều kiện | Hành động |
|---|---|
| Hoa thuộc `APPROVED_FLOWER_LIST` (cúc, lan, bách hợp, thủy tiên) | ✅ ALLOWED |
| Hoa có gai hoặc tên keyword trong blacklist | ❌ REJECTED — 400 |
| Chậu/bình hoa trồng bằng **đất/bùn** | ❌ REJECTED — 400 |
| Chậu/bình hoa **cắm nước** (không đất) | ✅ ALLOWED |
| Hoa tùy chỉnh (custom text) — không khớp blacklist | ✅ ALLOWED với force-confirm soil checkbox |

**Blacklist hoa:** `['hồng', 'gai', 'loa kèn', 'đào', 'trúc đào']`

### Trái cây (FRUIT)

| Điều kiện | Hành động |
|---|---|
| Trái cây thuộc `APPROVED_FRUIT_LIST` | ✅ ALLOWED |
| Trái cây trong `FORBIDDEN_FRUIT_LIST` | ❌ REJECTED — 400 |
| Mixed fruit trên một đĩa | ❌ REJECTED (xem `single-fruit-plate-constraint.md`) |

**Blacklist quả:** `['chuối', 'đào', 'lê' (tùy vùng — advisory only)]`

---

## Input Contract

```typescript
interface LogAltarOfferItemDto {
  itemType:       'FLOWER' | 'FRUIT' | 'INCENSE' | 'WATER' | 'OTHER'
  itemName:       string
  flowerSubtype?: string     // nếu FLOWER
  isInSoil?:      boolean    // bắt buộc nếu FLOWER
  fruitSubtype?:  string     // nếu FRUIT
  quantity?:      number
}
```

---

## Write Path

```
POST /api/vows-merit/altar-offerings/offer-items

--- FLOWER validation ---
1. If itemType == 'FLOWER':
   a. Normalize itemName + flowerSubtype to lowercase
   b. Check against FLOWER_BLACKLIST keywords
      → If match: throw 400 { error: 'flower_type_forbidden', matched: keyword }
   c. Validate isInSoil is provided
      → If isInSoil == true: throw 400 { error: 'soil_planted_flower_forbidden' }
   d. Proceed if passes all checks

--- FRUIT validation ---
2. If itemType == 'FRUIT':
   a. Normalize fruitSubtype to lowercase
   b. Check against FRUIT_BLACKLIST
      → If match: throw 400 { error: 'fruit_type_forbidden', matched: keyword }
   c. Proceed if passes

3. Insert AltarOfferingLog
```

---

## FE Behavior

### Form dâng hoa — dropdown an toàn + custom:

```
┌──────────────────────────────────────────────────────┐
│ Loại Hoa Dâng Cúng:                                  │
│  ○ Hoa Cúc      ○ Hoa Lan                            │
│  ○ Bách Hợp     ○ Thủy Tiên                          │
│  ○ Hoa Khác: [__________________]                    │
│                                                      │
│ Hoa được cắm trong:                                  │
│  ◉ Bình nước (không đất) ✅                          │
│  ○ Chậu đất    ← sẽ hiện lỗi nếu chọn              │
│                                                      │
│                          [Lưu Dâng Hoa]              │
└──────────────────────────────────────────────────────┘
```

Khi user chọn "Chậu đất":
```
❌ Đất mang tính âm trược, không được đặt lên bàn thờ.
   Chỉ được dùng hoa cắm bình nước hoặc cắm trực tiếp
   vào lư hương (không có đất).
```

Khi user nhập hoa có gai (ví dụ "hoa hồng"):
```
❌ Hoa có gai không phù hợp để dâng cúng.
   Các loại hoa phù hợp: Cúc, Lan, Bách Hợp, Thủy Tiên.
```

### Form dâng quả — chuối/đào bị chặn:

```
❌ Loại quả này không phù hợp để dâng lên Chư Phật.
   Hoa quả không thanh tịnh hoặc mang từ trường không
   tốt lành không nên đặt trên bàn thờ.
```

---

## Schema Notes

```prisma
model AltarOfferingLog {
  // ... existing fields ...
  itemType    String   // FLOWER, FRUIT, INCENSE, WATER, OTHER
  itemName    String
  isInSoil    Boolean?
  // Migration: ALTER TABLE "AltarOfferingLog" ADD COLUMN "itemType" TEXT
  //            ADD COLUMN "itemName" TEXT
  //            ADD COLUMN "isInSoil" BOOLEAN
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.offering.flower_accepted` | Hoa hợp lệ được ghi nhận |
| `altar.offering.flower_blocked_type` | Loại hoa bị chặn |
| `altar.offering.flower_blocked_soil` | Hoa trong đất bị chặn |
| `altar.offering.fruit_accepted` | Quả hợp lệ |
| `altar.offering.fruit_blocked_type` | Loại quả bị chặn |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Loại hoa trong blacklist | `flower_type_forbidden` | 400 |
| Hoa trong đất/bùn | `soil_planted_flower_forbidden` | 400 |
| Loại quả trong blacklist | `fruit_type_forbidden` | 400 |

---

## Notes for AI/codegen

- Blacklists nên là config constants, không hard-code inline
- Keyword matching dùng `includes()` sau normalize — không cần exact match
- Tham số `isInSoil` là bắt buộc nếu `itemType == FLOWER` — dùng Zod discriminated union
- `FRUIT_BLACKLIST` có thể cần extend theo vùng miền — thiết kế để extensible
- Phase 2+: AI image recognition để tự động detect loại hoa/quả từ ảnh upload

---

## Related

- [single-fruit-plate-constraint.md](./single-fruit-plate-constraint.md) — mỗi đĩa một loại quả
- [altar-fruit-atomic-replacement.md](./altar-fruit-atomic-replacement.md) — thay trái cây định kỳ
- [lucky-bamboo-quota-limiter.md](./lucky-bamboo-quota-limiter.md) — quota trúc phú quý

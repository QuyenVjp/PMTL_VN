# Định Mức Cành Trúc Phú Quý Mỗi Bình — Lucky Bamboo Quota Limiter

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 366, 818)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Trúc phú quý là vật phẩm cúng dường tốt lành, nên đặt mỗi bên bàn thờ một bình. Tuy nhiên mỗi bình chỉ được cắm 1, 2 hoặc 3 cành — tuyệt đối không được cắm cả bó nhiều hơn 3 cành. Cắm quá nhiều sẽ làm rối loạn trường khí, mất cân bằng năng lượng xung quanh bàn thờ.

---

## Owner module

`vows-merit` — AltarOfferingService / BambooQuotaValidator
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — đăng ký hoặc cập nhật vật phẩm Trúc Phú Quý trên bàn thờ ảo
- `system` — validate số lượng cành, block nếu vượt quá 3

---

## Trigger

Khi user thêm hoặc cập nhật `AltarItem` có `itemType = LUCKY_BAMBOO`.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| `quantityPerVase = 1` | ✅ ALLOWED |
| `quantityPerVase = 2` | ✅ ALLOWED |
| `quantityPerVase = 3` | ✅ ALLOWED |
| `quantityPerVase >= 4` | ❌ REJECTED — 400 BadRequest |
| `quantityPerVase = 0` | ❌ REJECTED — 400 BadRequest |
| `vaseCount > 2` (nhiều hơn 2 bình) | ⚠️ WARNING — thông thường chỉ 2 bình (2 bên bàn thờ) |

---

## Input Contract

```typescript
interface AddAltarItemDto {
  itemType:        'LUCKY_BAMBOO' | string
  quantityPerVase: number
  vaseCount:       number
  placementSide:   'LEFT' | 'RIGHT' | 'CENTER'
}
```

---

## Write Path

```
POST /api/vows-merit/altar-offerings/items

1. If itemType == 'LUCKY_BAMBOO':
   a. Validate quantityPerVase >= 1 AND quantityPerVase <= 3
      → If quantityPerVase > 3: throw 400 { error: 'bamboo_quantity_exceeded' }
      → If quantityPerVase < 1: throw 400 { error: 'bamboo_quantity_zero' }
   b. If vaseCount > 2:
      → Return 200 with warnings: [{ code: 'bamboo_vase_count_unusual' }]
2. Insert AltarItem
```

---

## FE Behavior

```
┌─────────────────────────────────────────────────────┐
│ Thêm Vật Phẩm: Trúc Phú Quý                         │
│─────────────────────────────────────────────────────│
│                                                     │
│ Số cành mỗi bình:  [ 1 ]  [ 2 ]  [✓ 3 ]  [ 4 ]    │
│                    ✅     ✅      ✅      ❌ xám    │
│                                                     │
│ Số bình:   [___]                                    │
│ (Khuyến nghị: 2 bình — mỗi bên 1 bình)              │
│                                                     │
│                              [Lưu Vật Phẩm]        │
└─────────────────────────────────────────────────────┘
```

Khi user chọn/nhập `4+`:
```
┌──────────────────────────────────────────────────────┐
│ ❌ Số Cành Vượt Mức Cho Phép                          │
│──────────────────────────────────────────────────────│
│ Mỗi bình chỉ được cắm tối đa 1, 2 hoặc 3 cành       │
│ trúc phú quý.                                        │
│                                                      │
│ Cắm quá nhiều sẽ làm rối loạn trường khí bàn thờ.   │
│                                                      │
│                             [Chọn Lại 1–3 Cành]     │
└──────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model AltarItem {
  // ... existing fields ...
  itemType        String
  quantityPerVase Int?
  vaseCount       Int?    @default(1)
  placementSide   String?
  // Migration: ALTER TABLE "AltarItem" ADD COLUMN "quantityPerVase" INT
  //            ADD COLUMN "vaseCount" INT DEFAULT 1
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.bamboo.added` | Thêm trúc phú quý thành công |
| `altar.bamboo.quota_exceeded_blocked` | Cố thêm ≥4 cành |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `quantityPerVase >= 4` | `bamboo_quantity_exceeded` | 400 |
| `quantityPerVase < 1` | `bamboo_quantity_zero` | 400 |

---

## Notes for AI/codegen

- Zod schema: `quantityPerVase: z.number().int().min(1).max(3)`
- `vaseCount > 2` chỉ là soft warning — không block
- Rule này chỉ áp dụng cho `LUCKY_BAMBOO` — các loại cây khác không có quota này

---

## Related

- [altar-botanical-biological-filter.md](./altar-botanical-biological-filter.md) — blacklist hoa/quả không phù hợp
- [altar-fruit-atomic-replacement.md](./altar-fruit-atomic-replacement.md) — quy tắc thay trái cây bàn thờ

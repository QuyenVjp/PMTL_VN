# Giao Thức Cúng Nguyên Chai Dầu & Bóc Nhãn Mác — Full Bottle Oil Offering Label Removal

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 376)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Ngoài việc chêm dầu vào đèn dầu thông thường, người tu có thể cúng **nguyên chai dầu thực vật mới mua** lên bàn thờ. Tuy nhiên, trước khi đặt chai lên bàn thờ, **BẮT BUỘC phải bóc sạch toàn bộ bao bì, nhãn mác thương mại và nilon bọc ngoài**. Nhãn mác thương mại mang tính chất quảng cáo — không phù hợp khi cúng dường Bồ Tát.

---

## Owner module

`vows-merit` — AltarOffering / OilOffering
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — chuẩn bị và log việc cúng chai dầu lên bàn thờ
- `system` — enforce acknowledgment bóc nhãn mác, validate oil type

---

## Trigger

User chọn loại cúng dường `FULL_BOTTLE_OIL` trong màn hình quản lý bàn thờ.

---

## Business Rules

| Điều kiện | Quy tắc |
|---|---|
| Chai dầu còn nguyên nhãn mác | ❌ FORBIDDEN — phải bóc sạch trước khi đặt lên |
| Chai dầu đã bóc sạch nhãn, nilon | ✅ ALLOWED |
| Loại dầu: OLIVE, CORN, CANOLA | ✅ ALLOWED (kế thừa từ validate-altar-oil-and-water) |
| Loại dầu: SESAME, PEANUT, SOYBEAN | ❌ FORBIDDEN (kế thừa từ validate-altar-oil-and-water) |

---

## Input Contract

```
OfferFullBottleOilDto {
  oilType:              "OLIVE" | "CORN" | "CANOLA"
  labelRemovedConfirmed: boolean    // BẮT BUỘC true
  quantity:             number      // số chai
}
```

---

## Write Path

```
POST /api/vows-merit/altar-offerings/full-bottle-oil
─────────────────────────────────────────────────────
1. Validate oilType ∈ ALLOWED_OIL_TYPES.
   - Nếu SESAME/PEANUT/SOYBEAN → HTTP 422 SPIRITUAL_BLOCK (kế thừa từ oil validator).
2. Validate labelRemovedConfirmed = true.
   - Nếu false → HTTP 422:
     {
       error:   "label_not_removed",
       message: "Phải bóc sạch toàn bộ nhãn mác thương mại và bao bì nilon trước khi đặt chai dầu lên bàn thờ."
     }
3. Insert AltarOfferingItem:
   {
     userId, itemType: "FULL_BOTTLE_OIL", oilType, quantity,
     labelRemovedConfirmed: true, placedAt: now(), status: ACTIVE
   }
4. Audit: altar.offering.full-bottle-oil.added
```

---

## FE Behavior

### Khi user chọn [Cúng Nguyên Chai Dầu]

```
┌──────────────────────────────────────────────────────────┐
│  🕯️  Cúng Nguyên Chai Dầu Lên Bàn Thờ                  │
│                                                          │
│  Loại dầu:                                              │
│  ○ Dầu Ô Liu (Olive)                                   │
│  ○ Dầu Ngô (Corn)                                      │
│  ○ Dầu Hoa Cải (Canola)                               │
│                                                          │
│  Số chai: [1]                                           │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│  ⚠️  Trước khi đặt lên bàn thờ:                        │
│                                                          │
│  [_] Tôi đã bóc sạch toàn bộ nhãn mác quảng cáo,     │
│      bao bì nilon bên ngoài chai dầu.                  │
│      (Không để nhãn thương mại lên trước Bồ Tát)      │
│                                                          │
│  [Xác Nhận Cúng Dầu]   ← enable khi đã tick           │
└──────────────────────────────────────────────────────────┘
```

---

## Schema Notes

Dùng lại `AltarOfferingItem` (đã có từ Phase 8), bổ sung:

```prisma
model AltarOfferingItem {
  // ... existing fields ...
  labelRemovedConfirmed  Boolean?  // null cho non-bottle offerings, true cho FULL_BOTTLE_OIL
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.offering.full-bottle-oil.added` | Cúng chai dầu thành công |
| `altar.offering.full-bottle-oil.label-rejected` | Gửi lên khi `labelRemovedConfirmed = false` |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `labelRemovedConfirmed` = false | `label_not_removed` | 422 |
| `oilType` bị cấm | `spiritual_block` | 422 |
| `quantity` < 1 | `invalid_body` | 400 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Related

- [validate-altar-oil-and-water.md](./validate-altar-oil-and-water.md) — Oil type allowed/forbidden list
- [GRAND-INCENSE-PROTOCOL.md](../REFERENCES/GRAND-INCENSE-PROTOCOL.md) — Giao thức Đại Hương

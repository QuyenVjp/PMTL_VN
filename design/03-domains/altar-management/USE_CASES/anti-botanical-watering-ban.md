# Luật Chống Tưới Cây Bằng Nước Phật — Anti-Botanical Watering Ban

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 913, 914)
> **Trạng thái:** Verified source — hard block + advisory warning
> **Cập nhật:** 2026-04-04

---

## Purpose

Nước Đại Bi sau khi cúng mang năng lượng gia trì cực lớn. Có thể uống hoặc đổ đi ở nơi sạch sẽ, nhưng tuyệt đối cấm dùng Nước cúng chư Phật, Bồ Tát để tưới cây cối, hoa cỏ (watering plants). Nước Phật được thiêng liêng, không nên dùng cho mục đích trị mộng cây cối.

---

## Owner module

`altar-management` — AltarService / BotanicalDisposalGuard
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người xử lý nước thừa
- `system` — disposal method validator

---

## Trigger

Khi user click option disposal sau uống nước cúng

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User chọn "Đổ xuống toilet/chậu nước sạch" | ✅ ALLOWED |
| User chọn "Uống" | ✅ ALLOWED |
| User chọn "Tưới cây" | ❌ HARD BLOCK 400 |
| User chọn "Tưới hoa trong nhà" | ❌ HARD BLOCK 400 |

---

## Input Contract

```typescript
interface WaterDisposalMethodDto {
  disposalMethod: 'DRINK' | 'POUR_DRAIN' | 'WATER_PLANTS' | 'WATER_FLOWERS'
}

interface DisposalValidationResult {
  allowed: boolean
  error?: string
}
```

---

## Write Path

```
POST /api/altar-management/water/log-disposal

1. Validate disposalMethod:
   const ALLOWED_METHODS = ['DRINK', 'POUR_DRAIN']

2. If disposalMethod in ALLOWED_METHODS:
   → Proceed to logging

3. Else (WATER_PLANTS or WATER_FLOWERS):
   → throw 400 {
       error: 'botanical_watering_forbidden',
       message: 'Cấm kỵ: Tuyệt đối không được dùng Nước Đại Bi để tưới cây cối, hoa cỏ. Nước Phật là thiêng liêng, chỉ được uống hoặc đổ ở nơi sạch sẽ.'
     }

4. If allowed:
   a. Create DisposalLog: { userId, waterId, disposalMethod, timestamp }
   b. Audit: altar.water.disposal_logged
   c. Return success

```

---

## FE Behavior

### Disposal Method Selection

```
┌────────────────────────────────────────────────────────┐
│ 💧 Xử Lý Nước Thừa Đại Bi                              │
│────────────────────────────────────────────────────────│
│ Nước cúng còn lại nên xử lý như thế nào?              │
│                                                        │
│ ⭕ Uống hết                                            │
│ ⭕ Đổ xuống toilet hoặc chậu nước sạch                │
│                                                        │
│ ❌ CẤMI: Tưới cây cối                                  │
│ ❌ CẤM: Tưới hoa trong nhà                             │
│                                                        │
│ Lý do: Nước Đại Bi là thiêng liêng và mang năng       │
│ lượng gia trì cực lớn. Không nên dùng để tưới       │
│ cây cối vì sẽ làm lãng phí ơn từ của Bồ Tát.         │
│                                                        │
│            [Tiếp Tục]                                 │
└────────────────────────────────────────────────────────┘
```

### Blocked Attempt

```
┌────────────────────────────────────────────────────────┐
│ ❌ Cấm Tưới Cây                                         │
│────────────────────────────────────────────────────────│
│ Cấm kỵ: Tuyệt đối không được dùng Nước Đại Bi        │
│ để tưới cây cối, hoa cỏ.                              │
│                                                        │
│ Nước Phật là thiêng liêng, chỉ được uống hoặc        │
│ đổ ở nơi sạch sẽ.                                     │
│                                                        │
│         [Quay Lại]                                    │
└────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model WaterDisposalLog {
  id              String   @id @default(cuid())
  userId          String
  waterId         String
  disposalMethod  String   // DRINK | POUR_DRAIN
  disposedAt      DateTime @default(now())
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.water.disposal_logged` | Disposal method recorded |
| `altar.water.botanical_watering_blocked` | Plant watering attempt |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| WATER_PLANTS selected | `botanical_watering_forbidden` | 400 |
| WATER_FLOWERS selected | `botanical_watering_forbidden` | 400 |

---

## Notes for AI/codegen

- Plant watering = HARD BLOCK, zero exceptions
- Only DRINK and POUR_DRAIN allowed
- Clear error message on UI explaining why
- Audit trail for blocked attempts

---

## Related

- [water-source-validation.md](./water-source-validation.md) — Kiểm tra loại nước
- [buddha-water-segregation-law.md](./buddha-water-segregation-law.md) — Phân tách nước các Bồ Tát

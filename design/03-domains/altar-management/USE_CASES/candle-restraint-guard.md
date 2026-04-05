# Cảm Biến Khống Chế Nến — Candle Restraint Guard

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — soft exception enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Việc cúng nến (candles) trên bàn thờ Phật nhìn chung **không được khuyến khích**. Ngoại lệ: Nếu trước đây đã có thói quen cúng nến và vẫn tiếp tục cúng, thì bắt buộc phải là một **cặp nến màu đỏ** (không màu khác). Hệ thống UI sẽ không đưa icon "Nến" vào danh sách vật phẩm cúng dường tiêu chuẩn, chỉ cho phép hiển thị nếu User chủ động yêu cầu bật ngoại lệ.

---

## Owner module

`altar-management` — AltarService / CandleOfferingGuard
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — muốn cúng nến trên bàn thờ
- `system` — enforce red candle pair rule, hide by default

---

## Trigger

User cố add "Nến" vào danh sách vật cúng dường, hoặc click [+] để thêm vật cúng

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Candle item NOT in standard offerings list | ✅ Hidden by default |
| User request Exception Override | ⚠️ Show modal with red pair requirement |
| User confirms RED candles PAIR (2 only) | ✅ Allow |
| User tries other color/quantity | ❌ BLOCK 400 |

---

## Input Contract

```typescript
interface CandleOfferingDto {
  candleType: 'RED_PAIR' | 'OTHER_COLOR' | 'SINGLE'
  exceptionOverrideConfirmed: boolean
}

interface CandleValidationResult {
  allowed: boolean
  reason?: string
  requiresOverride: boolean
}
```

---

## Write Path

```
POST /api/altar-management/offerings/add-candle

1. Check if candle in standard list:
   const STANDARD_OFFERINGS = ['oil-lamp', 'incense', 'flowers', ...]
   // 'candle' NOT in list

2. If user attempts to add candle:
   a. Check exceptionOverrideConfirmed:
      - If false → return 403 {
          error: 'exception_override_required',
          requiresConfirmation: true,
          message: 'Cúng nến không được khuyến khích. Nếu vẫn muốn cúng, bắt buộc phải là một CẶP nến màu ĐỎ.'
        }

   b. If true → validate candleType:
      - If candleType !== 'RED_PAIR' → 400 {
          error: 'invalid_candle_color',
          message: 'Chỉ được cúng một cặp nến màu đỏ (2 chiếc). Không được màu khác hay số lượng khác.'
        }
      - If candleType === 'RED_PAIR' → Allow

3. Create OfferingItem record
4. Audit: altar.candle.exception_override_used

```

---

## FE Behavior

### Standard Offerings List (Candle Hidden)

```
┌────────────────────────────────────────────────────────┐
│ 🏮 Danh Sách Vật Cúng Dường Tiêu Chuẩn               │
│────────────────────────────────────────────────────────│
│ ✅ Hoa (Flowers)                                       │
│ ✅ Nước (Water)                                        │
│ ✅ Nhang (Incense)                                     │
│ ✅ Đèn Dầu (Oil Lamp)                                 │
│ ✅ Trái Cây (Fruits)                                  │
│                                                        │
│ [+] Thêm Vật Cúng Khác                                │
│    (Nến KHÔNG trong danh sách tiêu chuẩn)            │
└────────────────────────────────────────────────────────┘
```

### Exception Override Modal

```
┌────────────────────────────────────────────────────────┐
│ ⚠️  Ngoại Lệ: Cúng Nến                                │
│────────────────────────────────────────────────────────│
│ Cúng nến trên bàn thờ Phật nhìn chung KHÔNG được      │
│ khuyến khích. Tuy nhiên, nếu bạn có thói quen cúng    │
│ nến từ trước, bạn có thể tiếp tục với điều kiện:      │
│                                                        │
│ ✅ Phải là một CẶP nến màu ĐỎ (đúng 2 chiếc)         │
│ ✅ Không được màu khác (trắng, vàng, etc.)           │
│ ✅ Không được số lượng khác (chỉ 1 cặp)              │
│                                                        │
│ [ ] Tôi xác nhận sẽ cúng một cặp nến màu đỏ          │
│                                                        │
│         [Hủy]   [Xác Nhận]                            │
└────────────────────────────────────────────────────────┘
```

### Red Candle Pair Only

```
┌────────────────────────────────────────────────────────┐
│ 🕯️  Chọn Nến                                          │
│────────────────────────────────────────────────────────│
│ Loại nến:                                              │
│ ⭕ Cặp nến màu đỏ (2 chiếc)                           │
│ ❌ Nến màu trắng (KHÔNG được)                         │
│ ❌ Nến màu vàng (KHÔNG được)                          │
│ ❌ Nến đơn (KHÔNG được, phải là cặp)                 │
│                                                        │
│            [Thêm Cặp Nến Đỏ]                          │
└────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model OfferingItem {
  // ... existing fields ...
  candleColor?: String     // RED only if present
  candleQuantity?: Int     // Must be 2 if candle
  isExceptionOverride: Boolean @default(false)
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.candle.exception_override_requested` | User request modal |
| `altar.candle.exception_override_confirmed` | User accepts |
| `altar.candle.invalid_color_rejected` | Non-red candle attempt |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| No override confirmation | `exception_override_required` | 403 |
| Wrong color | `invalid_candle_color` | 400 |
| Wrong quantity | `invalid_candle_quantity` | 400 |

---

## Notes for AI/codegen

- Candle is "soft discouraged" — not forbidden, but hidden by default
- Red pair is THE ONLY exception allowed
- Single candles, other colors, odd quantities = all blocked
- Override flag tracked in audit for user education

---

## Related

- [electric-lotus-lamp-sequence.md](./electric-lotus-lamp-sequence.md) — Electric lamp rules
- [multi-deity-oil-lamp-allocation.md](./multi-deity-oil-lamp-allocation.md) — Oil lamp standard

# CANDLE-RESTRICTION

## Owner
- `vows-merit` (Altar Management)

## Purpose
Chốt chặn Nến Đỏ (Candle Restriction Validator)

---

## Business Rule

### Rule - Red Candles Only, Pair Required
**Nghiệp vụ [Nguồn: Intro to Guan Yin Citta - Oil Offerings]:**
- Pháp môn Tâm Linh **KHÔNG khuyến khích** cúng nến
- Nếu nhất định phải cúng:
  - BẮT BUỘC **1 đôi** (pair = 2 cây)
  - BẮT BUỘC **Nến Đỏ** (Red)

---

## Schema Hints

```prisma
model AltarInventory {
  // ... existing
  hasCandles       Boolean @default(false)
  candleColor      String? // Must be 'RED'
  candleQuantity   Int?    // Must be 2
}
```

---

## Service Logic

```typescript
export class AltarCandleValidator {
  validateCandles(dto: AddCandlesDto) {
    if (dto.color !== 'RED') {
      throw new BadRequestException('Nến phải là màu ĐỎ');
    }

    if (dto.quantity !== 2) {
      throw new BadRequestException('Nến phải cúng 1 ĐÔI (2 cây)');
    }
  }
}
```

---

## UI Component

```
┌────────────────────────────────────────────┐
│  ⚠️ KHÔNG khuyến khích cúng nến           │
├────────────────────────────────────────────┤
│  Nếu nhất định phải cúng:                 │
│  • Màu: [Đỏ ▼]                           │
│  • Số lượng: [2] (1 đôi)                  │
│                                            │
│  [Thêm]                                   │
└────────────────────────────────────────────┘
```

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 11 Logic 8

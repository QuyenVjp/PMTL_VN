# Công thức Toán học của Đĩa Trái Cây — Fruit Plate Mathematical Integrity

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Mỗi đĩa trái cây không chỉ tổng số quả bắt buộc phải là lẻ, mà **MỖI TẦNG** xếp lên cũng phải là số lẻ (3, 5, 7...).

---

## Owner module

`vows-merit` — AltarOfferingService / FruitPlateValidator

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Tổng quả = số lẻ AND mọi tầng = số lẻ | ✅ ALLOWED |
| Tầng nào = số chẵn (dù tổng lẻ) | ❌ REJECTED |
| Example: Tầng 1=4, Tầng 2=1 (tổng=5 lẻ) | ❌ REJECTED vì tầng 1=4 là chẵn |
| Example: Tầng 1=5, Tầng 2=1 (tổng=6) | ❌ REJECTED vì tổng=6 là chẵn |
| Example: Tầng 1=5, Tầng 2=1 (tổng=6) | ❌ REJECTED |

---

## Input Contract

```typescript
interface FruitPlateInput {
  userId: string;
  layers: {
    layerIndex: number;
    fruitCount: number;    // Must be odd
  }[];
}

interface ValidationResult {
  isValid: boolean;
  totalCount: number;
  errors: string[];  // List violations
}
```

---

## Validation Logic

```
1. Calculate total = sum of all layer counts
2. Check: total % 2 !== 0 (total must be odd)
3. For each layer:
   - Check: layer.fruitCount % 2 !== 0
   - If any layer is even, reject with specific error
4. Only return ALLOWED if ALL checks pass
```

---

## Errors

| Condition | Message |
|---|---|
| Total is even | "Tổng số quả phải là số lẻ" |
| Layer N is even | "Tầng {N} có {count} quả (chẵn). Phải là số lẻ" |

---

## Notes

Two-level mathematical constraint. Both global and per-layer must satisfy odd-number rule.
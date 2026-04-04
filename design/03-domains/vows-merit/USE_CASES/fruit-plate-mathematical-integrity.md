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

---

## Part B: Quy Tắc Độc Canh — One Fruit Type Per Plate

> **Nguồn bổ sung:** Khai thị chính thức Pháp Môn Tâm Linh (Phase 35 Logic 3, Nguồn 371, 372, 841)

Ngoài quy tắc số lẻ ở Part A, mỗi đĩa trái cây cúng bàn thờ **CHỈ ĐƯỢC PHÉP CÚNG DUY NHẤT 1 LOẠI TRÁI CÂY**. Tuyệt đối không trộn lẫn (ví dụ: táo + cam chung 1 đĩa là vi phạm).

### Business Rules bổ sung

| Điều kiện | Hành động |
|---|---|
| Đĩa chỉ có 1 loại trái cây | ✅ ALLOWED |
| Đĩa có 2+ loại trái cây khác nhau | ❌ REJECTED — `mixed_fruit_plate_forbidden` 400 |

### Input Contract bổ sung

```typescript
// FruitPlateInput mở rộng (kết hợp Part A + Part B):
interface FruitPlateInput {
  plateId:   string
  fruitType: FruitTypeEnum  // 1 loại duy nhất per plateId
  layers:    { layerIndex: number; fruitCount: number }[]
}
// Rule: 1 plateId → 1 fruitType. Nếu submit 2 entries cùng plateId nhưng fruitType khác nhau → rejected.
```

### Write Path bổ sung

```
POST /api/altar-management/fruit-plate/validate

1. Load existing FruitPlateOffering for plateId (nếu có)
2. If existing.fruitType !== dto.fruitType:
   → throw 400 { error: 'mixed_fruit_plate_forbidden',
                 message: 'Mỗi đĩa chỉ được cúng duy nhất 1 loại trái cây. CẤM trộn lẫn.' }
3. Continue Part A odd-layer validation (layers array)
```

### FE Behavior bổ sung

```
┌──────────────────────────────────────────────────────────┐
│  🍎  Đĩa Trái Cây #1                                    │
│──────────────────────────────────────────────────────────│
│  Loại trái cây:  [Táo đỏ                   ▾]            │
│                  ← 1 loại duy nhất cho đĩa này           │
│                                                          │
│  Tầng 1 (đáy):  [  5  ] quả  ← phải là số lẻ           │
│  Tầng 2:        [  3  ] quả  ← phải là số lẻ           │
│  Tầng 3 (đỉnh): [  1  ] quả  ← phải là số lẻ           │
│  [+ Thêm tầng]                                          │
│                                                          │
│  ⚠️  Luật PMTL: Mỗi đĩa CHỈ 1 LOẠI trái cây.           │
│     Không được thêm cam, quýt, hay loại khác vào đây.  │
└──────────────────────────────────────────────────────────┘
```

### Errors bổ sung

| Condition | Code | HTTP |
|---|---|---|
| Trộn 2+ loại trái cây trên 1 đĩa | `mixed_fruit_plate_forbidden` | 400 |

### Notes for AI/codegen bổ sung

- `fruitType` dropdown nên dùng `FruitTypeEnum` — loại trái cây được phép (đã filter qua `altar-botanical-biological-filter.md`).
- Part A + Part B validation chạy tuần tự: check fruit type trước (Part B), rồi mới check odd layers (Part A). Fail fast tại violation đầu tiên.
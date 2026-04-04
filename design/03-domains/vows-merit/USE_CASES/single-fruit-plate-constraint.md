# Ràng Buộc Một Loại Trái Cây Mỗi Đĩa — Single-Fruit Plate Constraint

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — "Do not offer an assortment of fruits on one plate"
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Mỗi đĩa trái cây trên bàn thờ **CHỈ ĐƯỢC PHÉP chứa một loại quả duy nhất**. Không được trộn lẫn nhiều loại trên cùng một đĩa. Nếu muốn cúng nhiều loại quả, phải dùng nhiều đĩa riêng biệt — mỗi đĩa một loại.

---

## Owner module

`vows-merit` — AltarOfferingItem / AltarPlate
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — quản lý đĩa trái cây trên bàn thờ
- `system` — validate single-type constraint, reject mixed plates

---

## Business Rule

| Điều kiện | Hành động |
|---|---|
| Đĩa có 1 loại quả (bất kỳ số lượng) | ✅ ALLOWED |
| Đĩa có 2+ loại quả khác nhau | ❌ REJECTED — `400 BadRequest` |
| Thêm loại mới vào đĩa đang có quả | ❌ REJECTED — hướng dẫn tạo đĩa mới |

---

## Input Contract

```
AltarFruitPlateDto {
  plateIndex:  number    // số thứ tự đĩa (0, 1, 2...)
  fruitType:   string    // "APPLE" | "ORANGE" | "GRAPE" | ...
  quantity:    number    // số quả trong đĩa này
  condition:   "FRESH"
}
```

Mỗi request = 1 đĩa + 1 loại quả. Không có `fruits: []` array — đơn giản hóa để enforce constraint tại schema level.

---

## Write Path

```
POST /api/vows-merit/altar-offerings/fruit-plates
──────────────────────────────────────────────────
1. Load tất cả AltarOfferingItem ACTIVE cho userId, plateIndex.
2. Kiểm tra existingTypes = distinct fruitType trong plate đó.
3. Nếu existingTypes.length > 0 AND existingTypes[0] !== payload.fruitType:
   → throw 400 BadRequest {
       error:   "mixed_fruit_plate_forbidden",
       message: "Mỗi đĩa chỉ được cúng 1 loại trái cây. Hãy thêm một đĩa mới để cúng [loại quả mới].",
       hint:    "Dùng plateIndex mới (ví dụ: plateIndex = " + (maxPlateIndex + 1) + ")"
     }
4. Nếu hợp lệ → insert AltarOfferingItem:
   { userId, plateIndex, fruitType, quantity, condition, placedAt: now(), status: ACTIVE }
5. Audit: altar.offering.fruit-plate.added.
```

---

## FE Behavior

### Màn hình quản lý đĩa trái cây

```
Bàn thờ — Đĩa Trái Cây
─────────────────────────────────────────────
Đĩa 1:  🍎 Táo × 5    [Thay toàn bộ] [Dọn]
Đĩa 2:  🍊 Cam × 3    [Thay toàn bộ] [Dọn]
Đĩa 3:  🍇 Nho × 1    [Thay toàn bộ] [Dọn]

                        [+ Thêm đĩa mới]
─────────────────────────────────────────────
ℹ️  Mỗi đĩa chỉ được cúng 1 loại trái cây.
    Dùng nhiều đĩa nếu muốn cúng nhiều loại.
```

### Khi user cố thêm loại quả khác vào đĩa đang có

```
┌──────────────────────────────────────────────────────────┐
│  ❌  Không thể thêm Cam vào Đĩa 1                       │
│                                                          │
│  Đĩa 1 đang có Táo.                                    │
│  Mỗi đĩa chỉ được cúng 1 loại trái cây duy nhất.      │
│                                                          │
│  Bạn có muốn thêm Cam vào một đĩa mới?                │
│                                                          │
│  [Thêm Đĩa Mới cho Cam]     [Hủy]                     │
└──────────────────────────────────────────────────────────┘
```

Nút [Thêm Đĩa Mới cho Cam] tự động set `plateIndex = maxPlateIndex + 1` và `fruitType = "ORANGE"`.

### Dropdown trái cây per đĩa

Khi đĩa đã có 1 loại quả, dropdown chỉ hiển thị duy nhất loại đó (locked) — không cho chọn loại khác. Muốn thêm loại khác → phải bấm [+ Thêm đĩa mới].

---

## Validation tại Prisma Level

```prisma
model AltarOfferingItem {
  id          String              @id @default(cuid())
  userId      String
  plateIndex  Int
  itemType    AltarOfferingType
  fruitType   String?             // nullable — chỉ dùng khi itemType = FRUIT
  quantity    Int
  condition   String              @default("FRESH")
  placedAt    DateTime
  status      AltarOfferingStatus @default(ACTIVE)

  user        User                @relation(fields: [userId], references: [id])

  // Unique constraint: mỗi (user, plateIndex, fruitType) chỉ có 1 ACTIVE record
  @@unique([userId, plateIndex, fruitType, status])
}
```

Unique constraint `(userId, plateIndex, fruitType, status)` ngăn duplicate rows, nhưng **không ngăn mixed plates** — constraint mixed plates phải enforce ở service layer (query distinct fruitTypes trước khi insert).

---

## Relation to Atomic Replacement

Rule này phối hợp với [altar-fruit-atomic-replacement.md](./altar-fruit-atomic-replacement.md):

- **Atomic Replacement** — khi thay, phải thay toàn bộ đĩa (không partial).
- **Single-Fruit Constraint** — khi thêm mới, chỉ 1 loại per đĩa.

Cả hai cùng enforce tại `AltarOfferingService`.

---

## Audit

| Action | Trigger |
|---|---|
| `altar.offering.fruit-plate.added` | Thêm quả vào đĩa hợp lệ |
| `altar.offering.fruit-plate.mixed-rejected` | Cố thêm loại thứ 2 vào đĩa |
| `altar.offering.fruit-plate.new-plate-suggested` | User chọn tạo đĩa mới thay vì mix |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Cố thêm loại quả khác vào đĩa đang có | `mixed_fruit_plate_forbidden` | 400 |
| `quantity` < 1 | `invalid_body` | 400 |
| `fruitType` không trong allowed list | `invalid_body` | 400 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Notes for AI/codegen

- Service query `distinct fruitType WHERE plateIndex = X AND status = ACTIVE` trước khi insert — không rely vào DB constraint cho logic này.
- `plateIndex` là integer không có gap — FE tự assign `maxPlateIndex + 1` khi tạo đĩa mới.
- Số đĩa không giới hạn cứng — nhưng Phase 2+ có thể thêm soft limit (VD: max 7 đĩa) dựa trên khai thị về số lẻ.
- Allowed `fruitType` values nên là `SystemConfig` JSON array để admin thêm loại quả mới mà không cần deploy.

---

## Related

- [altar-fruit-atomic-replacement.md](./altar-fruit-atomic-replacement.md) — Atomic replacement + 7-day expiry
- [altar-profile-spatial-validation.md](./altar-profile-spatial-validation.md) — Spatial hazard checks
- [validate-altar-oil-and-water.md](./validate-altar-oil-and-water.md) — Oil type + water constraints

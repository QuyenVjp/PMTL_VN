# Khóa Cứng Phi Lợi Nhuận Pháp Bảo — Dharma Item Zero-Monetization Lock

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn Phase 30)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Mọi tài liệu, sách kinh, đĩa CD, Ngôi Nhà Nhỏ và vật phẩm Pháp Bảo đều **BẮT BUỘC phải tặng miễn phí** — tuyệt đối không được gắn giá tiền, bán hay thu phí. Lấy Pháp Bảo kinh doanh là tội nặng. Hệ thống phải đảm bảo không ai — kể cả quản trị viên — có thể vô tình hay cố ý gắn giá cho các vật phẩm thuộc loại `DHARMA_ITEM`.

---

## Owner module

`engagement` — ItemInventoryService / DharmaItemPriceGuard
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `admin` — quản lý kho vật phẩm
- `member` — xem và yêu cầu vật phẩm Pháp Bảo
- `system` — Interceptor kiểm tra mọi request liên quan đến giá và checkout

---

## Trigger

1. Admin tạo hoặc cập nhật `ItemInventory` với `category = DHARMA_ITEM`
2. Bất kỳ request checkout/cart nào chứa vật phẩm loại `DHARMA_ITEM`

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Admin tạo DHARMA_ITEM | ✅ Auto-set `price = 0`, không cho nhập giá |
| Admin cố gắng set `price > 0` trên DHARMA_ITEM | ❌ REJECTED — 400 BadRequest |
| Checkout cart chứa DHARMA_ITEM với `price > 0` | ❌ REJECTED — 500 + admin feature lock |
| Checkout cart với DHARMA_ITEM tất cả `price = 0` | ✅ ALLOWED — xử lý như "free order" |
| Bất kỳ query nào cố update price của DHARMA_ITEM | ❌ REJECTED — Prisma middleware block |

---

## Input Contract

```typescript
enum ItemCategory {
  DHARMA_ITEM       // Pháp bảo: sách kinh, đĩa CD, NNN, tranh ảnh Bồ Tát
  PRACTICE_SUPPLY   // Đồ dùng tu tập: nhang, nến, v.v.
  GENERAL           // Vật phẩm thông thường
}

interface CreateItemDto {
  name:     string
  category: ItemCategory
  price?:   number   // Ignored / forced to 0 if category = DHARMA_ITEM
}

interface CheckoutDto {
  cartItems: CartItemDto[]
}
```

---

## Write Path

```
POST /api/engagement/items (admin)

1. If category == DHARMA_ITEM:
   → Force dto.price = 0 (override any provided value)
   → Set priceIsLocked = true
2. Insert ItemInventory

PATCH /api/engagement/items/:id (admin)

1. Load existing item
2. If item.category == DHARMA_ITEM AND body.price != undefined AND body.price > 0:
   → throw 400 { error: 'dharma_item_price_forbidden' }
3. Update (price remains 0)

--- NestJS Global Interceptor: DharmaItemPriceGuard ---
POST /api/engagement/checkout (or any checkout endpoint)

1. For each cartItem: load ItemInventory
2. If any item.category == DHARMA_ITEM AND item.price > 0:
   → Log CRITICAL audit event: 'dharma_item_price_violation'
   → Throw 500 { error: 'dharma_price_integrity_violation' }
   → Lock admin account feature (flag: requiresPriceAudit = true)
3. Continue checkout with dharma items at price = 0

--- Prisma Middleware (DB level) ---
beforeUpdate: if model == ItemInventory AND data.price > 0:
  load current record
  if record.category == DHARMA_ITEM:
    throw Error('dharma_item_price_immutable')
```

---

## FE Behavior

### Admin — Form tạo/sửa vật phẩm Pháp Bảo:

```
┌────────────────────────────────────────────────────────┐
│ Loại vật phẩm: [▼ Pháp Bảo (Miễn Phí)]                 │
│────────────────────────────────────────────────────────│
│ Giá:  [0 VND]  🔒 Cố định — Pháp Bảo luôn miễn phí    │
│                                                        │
│ (Trường giá bị disabled hoàn toàn, không thể nhập)     │
└────────────────────────────────────────────────────────┘
```

### Member — Yêu cầu Pháp Bảo:

```
┌────────────────────────────────────────────────────────┐
│ 📖 Sách "Lời Khuyên Vàng"                              │
│ Loại: Pháp Bảo                    Giá: MIỄN PHÍ 🎁    │
│                                                        │
│                    [Thỉnh Về]                          │
└────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model ItemInventory {
  // ... existing fields ...
  category      ItemCategory   @default(GENERAL)
  price         Int            @default(0)
  priceIsLocked Boolean        @default(false)
  // Migration: ALTER TABLE "ItemInventory" ADD COLUMN "category" TEXT DEFAULT 'GENERAL'
  //            ADD COLUMN "priceIsLocked" BOOLEAN DEFAULT FALSE
}

enum ItemCategory {
  DHARMA_ITEM
  PRACTICE_SUPPLY
  GENERAL
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `item.dharma.created_free` | Admin tạo Pháp Bảo — price auto-set 0 |
| `item.dharma.price_change_blocked` | Admin cố gắng thay đổi giá |
| `item.dharma.price_integrity_violation` | Checkout phát hiện giá > 0 trên Pháp Bảo |
| `admin.dharma.price_audit_required` | Admin bị lock sau vi phạm giá |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Admin cố set price > 0 trên DHARMA_ITEM | `dharma_item_price_forbidden` | 400 |
| Checkout phát hiện DHARMA_ITEM có price > 0 | `dharma_price_integrity_violation` | 500 |

---

## Notes for AI/codegen

- Interceptor phải chạy ở `APP_GUARD` level để không thể bị bypass
- HTTP 500 là có chủ đích — đây là data integrity violation, không phải user error
- `priceIsLocked = true` là thêm signal cho FE disable UI; enforcement thực sự ở BE middleware
- Admin feature lock (`requiresPriceAudit`) cần manual review từ super-admin để mở lại
- Rule áp dụng cho toàn bộ `DHARMA_ITEM` bất kể ai tạo request — kể cả super-admin

---

## Related

- [anti-financial-attachment-regex.md](../../vows-merit/USE_CASES/anti-financial-attachment-regex.md) — guard tài chính liên quan đến công đức
- [print-hardware-calibration-lock.md](./print-hardware-calibration-lock.md) — in ấn Pháp Bảo

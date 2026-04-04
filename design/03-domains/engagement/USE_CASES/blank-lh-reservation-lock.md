# Khóa Bảo Vệ Tờ NNN Trống — Blank LH Reservation Lock

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Tờ NNN trống dành cho tương lai phải luôn giữ trong vải đỏ (bảo vệ năng lượng). Bắt buộc:
1. Kho NNN trống PHẢI luôn bọc vải đỏ trước khi sử dụng
2. Nếu kho dưới 5 tờ, hệ thống cảnh báo: "Hãy chuẩn bị thêm tờ NNN trống"
3. CHẶN nếu user cố bỏ vải đỏ mà chưa có NNN session thực tế (tức là chưa viết NNN)
4. Chỉ cho phép bỏ vải đỏ khi user đang thực hiện session NNN cụ thể

---

## Owner module

`engagement` — BlankLittleHouseReservationLock
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — dự trữ tờ NNN trống, kiểm tra tình trạng kho
- `system` — enforce wrapper requirement, trigger warnings, block unwrapping without active session

---

## Trigger

Khi user POST `/api/engagement/lh-inventory/reserve-blank` hoặc GET `/api/engagement/lh-inventory/status`.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Dự trữ NNN trống (quantity > 0) | ✅ Inventory + quantity, wrappedInRedCloth = true |
| Inventory ≥ 5 tờ | ℹ️ No warning, normal status |
| Inventory < 5 tờ | ⚠️ Trigger warning advisory: "Hãy chuẩn bị thêm tờ NNN trống" |
| User cố bỏ vải đỏ (unwrap) khi wrappedInRedCloth = true | ❌ Check active LittleHouse session |
| Có active NNN session (viết/edit) | ✅ Allow unwrap: wrappedInRedCloth = false |
| KHÔNG có active NNN session | ❌ 400 blank_lh_not_wrapped_in_red_cloth |
| User trở lại vải đỏ sau dùng xong | ✅ wrappedInRedCloth = true, lastRestockedAt = now() |

---

## Input Contract

```typescript
interface BlankLHReservationDto {
  quantity: number                  // >= 1
  wrappedInRedCloth: boolean        // default true on reserve
}

interface BlankLHInventoryStatus {
  quantity: Int
  wrappedInRedCloth: Boolean
  lastRestockedAt?: DateTime
  needsRestocking: Boolean          // computed: quantity < 5
  warningMessage?: String           // "Hãy chuẩn bị thêm tờ NNN trống"
}

interface UnwrapBlankLHDto {
  littleHouseSessionId: string      // active session ID
  confirmed: boolean
}

interface BlankLHInventory {
  id: String
  quantity: Int
  wrappedInRedCloth: Boolean        // default true
  lastRestockedAt: DateTime?
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## Write Path

### Reserve Blank NNN
```
POST /api/engagement/lh-inventory/reserve-blank
Body: { quantity: N }

1. Validate quantity >= 1
2. Create/update BlankLHInventory:
   → quantity += N
   → wrappedInRedCloth = true (always on reserve)
   → lastRestockedAt = now()
3. Compute needsRestocking = (quantity < 5)
4. If needsRestocking:
   → Audit: lh.blank-inventory.low-stock-warning
   → Include warningMessage in response
5. Response includes current inventory status
   → Audit: lh.blank-inventory.reserved
```

### Get Inventory Status
```
GET /api/engagement/lh-inventory/status

1. Fetch BlankLHInventory
2. Compute needsRestocking = (quantity < 5)
3. If needsRestocking:
   → Include warningMessage: "Hãy chuẩn bị thêm tờ NNN trống"
4. Return BlankLHInventoryStatus
```

### Unwrap Blank NNN
```
POST /api/engagement/lh-inventory/unwrap

1. Validate littleHouseSessionId exists
2. Validate LittleHouse status = ACTIVE or IN_PROGRESS
3. Check wrappedInRedCloth = true
   → If false: already unwrapped, return 400 blank_lh_already_unwrapped
4. If valid session:
   → wrappedInRedCloth = false
   → Audit: lh.blank-inventory.wrapper-removed
5. If no session or session invalid:
   → return 400 blank_lh_not_wrapped_in_red_cloth
   → Message: "Chỉ được bỏ vải đỏ khi đang viết NNN"
```

### Re-wrap Blank NNN
```
POST /api/engagement/lh-inventory/rewrap

1. Validate littleHouseSessionId or manual rewrap
2. Check wrappedInRedCloth = false
3. Update:
   → wrappedInRedCloth = true
   → Audit: lh.blank-inventory.wrapper-reapplied
```

---

## FE Behavior

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    📋 QUẢN LÝ KHO NNN TRỐNG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tình trạng kho hiện tại:

Tờ NNN Trống: [8]
Tình trạng:   🔴 Bọc vải đỏ
Cập nhật:     2026-03-25 14:30

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(normal mode: quantity >= 5)

[+ Thêm 5 tờ NNN trống]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(warning mode: quantity < 5)

⚠️ CẢNH BÁO:
Hãy chuẩn bị thêm tờ NNN trống

Tờ NNN Trống: [3]
Tình trạng:   🔴 Bọc vải đỏ

[+ Thêm 5 tờ NNN trống]
[+ Thêm 10 tờ NNN trống]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(during NNN session: can unwrap)

Đang viết NNN: [Active]
Tờ NNN Trống: [8]

[ ] Bỏ vải đỏ khỏi kho
    (để lấy tờ trống dùng ngay)

[Xác Nhận]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(after unwrap)

Tình trạng:   ⚪ Chưa bọc vải đỏ
Tờ Trống:     [1 tờ được lấy ra]

[🔄 Bọc lại vải đỏ]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Schema Notes

```prisma
model BlankLHInventory {
  id                  String    @id @default(cuid())
  quantity            Int       @default(0)
  wrappedInRedCloth   Boolean   @default(true)
  lastRestockedAt     DateTime?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  // Computed fields (not stored):
  // needsRestocking = quantity < 5
  // warningMessage = if needsRestocking then "Hãy chuẩn bị thêm tờ NNN trống"
}
```

---

## Audit

| Action | Trigger | Advisory? |
|---|---|---|
| `lh.blank-inventory.reserved` | User reserves blank NNN | No |
| `lh.blank-inventory.low-stock-warning` | quantity < 5 after reserve | Yes |
| `lh.blank-inventory.wrapper-verified` | System confirms wrappedInRedCloth = true | No |
| `lh.blank-inventory.wrapper-removed` | User unwraps for active session | No |
| `lh.blank-inventory.wrapper-reapplied` | User re-wraps after session | No |

---

## Error Handling

| Code | Status | Message | Recovery |
|---|---|---|---|
| `blank_lh_not_wrapped_in_red_cloth` | 400 | Chỉ được bỏ vải đỏ khi đang viết NNN thực tế | Create active NNN session first |
| `blank_lh_already_unwrapped` | 400 | Kho NNN trống đã được bỏ vải rồi | Bọc lại vải đỏ trước khi tiếp |
| `blank_lh_minimum_warning` | 200 (advisory) | Hãy chuẩn bị thêm tờ NNN trống | Reserve more blank forms |
| `invalid_session_for_unwrap` | 400 | LittleHouse session không hợp lệ | Use active session only |
| `inventory_not_found` | 404 | Kho NNN trống không tìm thấy | Initialize inventory |

---

## Notes for AI/codegen

- **Wrapper requirement is ADVISORY for low stock (<5):** Show warning but allow normal flow.
- **Hard block for unwrapping without active session:** This is a CRITICAL business rule — cannot bypass.
- Unwrap requires an active `LittleHouse` session in progress (status = ACTIVE or IN_PROGRESS).
- After unwrapping, user should re-wrap when NNN session completes.
- **Minimum stock check (< 5) is a reminder system, not enforcement** — user can continue even with low stock.
- `lastRestockedAt` is updated on every reserve/restock action for tracking restocking patterns.
- Reserved blank NNN is always created with `wrappedInRedCloth = true` by default.

---

## Related

- [no-altar-prerequisite-enforcer.md](./no-altar-prerequisite-enforcer.md) — altar availability guard
- [burn-container-sanitization-protocol.md](./burn-container-sanitization-protocol.md) — post-burn ritual
- [invalid-lh-voiding-protocol.md](./invalid-lh-voiding-protocol.md) — error correction protocol

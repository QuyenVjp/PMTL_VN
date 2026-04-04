# Thay Thế Toàn Phần Trái Cây & Cảnh Báo Quá Hạn — Altar Fruit Atomic Replacement

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Introduction to Guan Yin Citta
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Hai quy tắc cứng cho việc quản lý trái cây và hoa trên bàn thờ:

1. **Atomic Replacement** — Khi thay trái cây, phải thay **TOÀN BỘ đĩa**, không được nhặt quả hỏng ra và chêm quả mới vào trộn lẫn với quả cũ còn lại.
2. **7-Day Expiry Alert** — Trái cây và hoa không được để quá **1 tuần** trên bàn thờ. Ngày thứ 6 phải nhận cảnh báo để kịp thay.

---

## Owner module

`vows-merit` — AltarLog / AltarOfferingSession
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — quản lý đồ cúng bàn thờ
- `system` — enforce atomic action, chạy cronjob kiểm tra tuổi đồ cúng

---

## Part A — Atomic Fruit Replacement Rule

### Business Rule

Hành động thay trái cây chỉ có MỘT dạng hợp lệ: **`CLEAR_ALL_AND_REPLACE`**.

| Action | Allowed | Lý do |
|---|---|---|
| `CLEAR_ALL_AND_REPLACE` | ✅ YES | Thay toàn bộ — đúng quy tắc |
| `APPEND` (thêm vào đĩa cũ) | ❌ NO | Trộn lẫn quả cũ-mới |
| `REMOVE_PARTIAL` (bỏ vài quả hỏng) | ❌ NO | Không thay toàn bộ |
| `UPDATE_QUANTITY` | ❌ NO | Phải xóa sạch trước |

### Trigger

User bấm **[Thay trái cây / Thay hoa]** trong AltarLog flow.

### Input Contract

```
AltarFruitReplaceDto {
  action:     "CLEAR_ALL_AND_REPLACE"   // chỉ giá trị này hợp lệ — Zod literal
  newItems: [
    {
      fruitType:  string    // "APPLE" | "ORANGE" | "GRAPE" | "MANGO" | ...
      quantity:   number    // số lượng quả
      condition:  "FRESH"   // chỉ nhận FRESH khi thay
    }
  ]
  replacedAt: DateTime     // timestamp người dùng xác nhận
  plateIndex?: number      // số thứ tự đĩa nếu nhiều đĩa (mặc định = 0)
}
```

### Write Path

```
POST /api/vows-merit/altar-offerings/fruit-replace
────────────────────────────────────────────────────
1. Validate Zod: action phải là literal "CLEAR_ALL_AND_REPLACE".
   - Nếu action là bất kỳ giá trị khác → throw 400 {
       error: "partial_replacement_forbidden",
       message: "Phải thay toàn bộ đĩa trái cây. Không được nhặt quả hỏng ra rồi chêm thêm."
     }
2. Archive record cũ: set tất cả AltarOfferingItem với type=FRUIT, plateIndex=plateIndex → status=RETIRED, retiredAt=now().
3. Insert batch mới: toàn bộ newItems với placedAt=now(), status=ACTIVE.
4. Tạo AltarOfferingLog: { action: "FULL_REPLACE", itemType: "FRUIT", replacedAt, userId }.
5. Audit: altar.offering.fruit.replaced.
```

### FE Behavior

- Nút [Thay trái cây] không có option "Thêm vào" hay "Bỏ vài quả" — chỉ có một flow duy nhất: nhập đầy đủ danh sách quả mới.
- Trước khi xác nhận, hiển thị warning: *"Toàn bộ [X] quả trên đĩa hiện tại sẽ bị xóa và thay mới. Xác nhận?"*
- Nếu user cố gọi API với action khác → FE cũng chặn ở client trước.

---

## Part B — 7-Day Expiry Cronjob

### Business Rule

Trái cây và hoa để **quá 7 ngày** trên bàn thờ là bất kính. Hệ thống phải cảnh báo vào **ngày thứ 6** (còn 1 ngày).

### Cronjob Spec

```
Schedule:  Mỗi ngày lúc 08:00 giờ địa phương (per user timezone)
Job name:  altar-offering-expiry-check
```

### Logic

```
AltarOfferingExpiryJob:
────────────────────────
1. Query tất cả AltarOfferingItem:
   WHERE status = 'ACTIVE'
   AND itemType IN ('FRUIT', 'FLOWER')
   AND placedAt <= now() - 6 days
2. Group by userId.
3. Với mỗi userId có items sắp hết hạn:
   a. Lấy user.pushSubscription.
   b. Dispatch push notification:
      {
        title: "Nhắc nhở Phật đài",
        body:  "Hoa quả trên bàn thờ của bạn sắp quá 1 tuần. Hãy dọn sạch và thay toàn bộ mới để giữ lòng thành kính.",
        type:  "ALTAR_OFFERING_EXPIRY",
        deepLink: "/altar"
      }
   c. Audit: altar.offering.expiry-warning.sent.
4. Nếu items đã tồn tại >= 8 ngày (quá hạn) → escalate:
   - In-app persistent banner (không tắt được cho đến khi user thay).
   - Audit: altar.offering.overdue.flagged.
```

### Schema Notes

```prisma
model AltarOfferingItem {
  id          String              @id @default(cuid())
  userId      String
  itemType    AltarOfferingType   // FRUIT | FLOWER | WATER | OIL
  fruitType   String?
  quantity    Int
  plateIndex  Int                 @default(0)
  placedAt    DateTime
  retiredAt   DateTime?
  status      AltarOfferingStatus

  user        User                @relation(fields: [userId], references: [id])
}

enum AltarOfferingType {
  FRUIT
  FLOWER
  WATER
  OIL
}

enum AltarOfferingStatus {
  ACTIVE
  RETIRED    // đã bị thay/dọn
  OVERDUE    // flagged bởi cronjob
}
```

### Expiry Notification Config

| Key | Value |
|---|---|
| `altar.fruit_expiry_warn_days` | `6` (cảnh báo ngày 6) |
| `altar.fruit_expiry_max_days` | `7` (quá hạn ngày 7) |
| `altar.expiry_check_hour` | `8` (8h sáng mỗi ngày) |

Config được lưu trong `SystemConfig` để admin có thể điều chỉnh.

---

## Audit

| Action | Trigger |
|---|---|
| `altar.offering.fruit.placed` | Đặt đĩa trái cây mới |
| `altar.offering.fruit.replaced` | Thay toàn bộ đĩa |
| `altar.offering.expiry-warning.sent` | Notification ngày 6 |
| `altar.offering.overdue.flagged` | Item quá 7 ngày |

---

## Notes for AI/codegen

- `CLEAR_ALL_AND_REPLACE` dùng Zod `z.literal("CLEAR_ALL_AND_REPLACE")` — không phải enum — để compiler error nếu code vô tình pass giá trị khác.
- Archive (RETIRED) thay vì hard delete để giữ lịch sử audit và analytics (admin xem lịch sử thay đồ cúng).
- Cronjob nên dùng `@nestjs/schedule` với `@Cron()` decorator, không setTimeout.
- Timezone-aware scheduling: job chạy theo UTC nhưng `placedAt` được lưu UTC — convert to user timezone chỉ cho notification content.
- `plateIndex` hỗ trợ trường hợp có nhiều đĩa trái cây (phase 2+).

---

## Related

- [altar-profile-spatial-validation.md](./altar-profile-spatial-validation.md) — Spatial rules khi lập bàn thờ
- [validate-altar-oil-and-water.md](./validate-altar-oil-and-water.md) — Validation dầu và nước cúng
- [schedule-altar-lamp-reminder.md](./schedule-altar-lamp-reminder.md) — Lamp-incense sync

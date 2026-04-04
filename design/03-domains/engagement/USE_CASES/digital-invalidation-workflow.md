# Quy Trình Hủy Bỏ Kỹ Thuật Số — Digital Invalidation Workflow

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi user phát hiện **viết sai tên trên NNN**, hệ thống **TUYỆT ĐỐI KHÔNG ĐƯỢC PHÉP TẨY XÓA, XÉ HAY ĐỐT**. Thay vào đó, phải thực hiện quy trình hủy bỏ thiêng liêng: **gạch chéo tên, gấp nhỏ, bọc giấy, vứt thùng rác, kèm theo lời cầu nguyện**. Hệ thống ghi nhận trạng thái INVALIDATED để không đưa vào tế lễ.

---

## Owner module

`engagement` — DigitalInvalidationProtocol

---

## Actors

- `member` — phát hiện lỗi, thực hiện quy trình hủy bỏ vật lý, xác nhận hoàn tất
- `system` — remove delete button, show invalidation modal, track status change

---

## Trigger

Khi user nhấn nút [Báo Cáo Viết Sai / Mark as Invalid] trên NNN record (replaces [Delete] button).

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User views NNN in ACTIVE state | ✅ Hide [Delete] button |
| Replace with [Báo Cáo Viết Sai] button | ✅ Show invalidation button |
| User clicks invalidation button | ✅ Show modal with instructions |
| Modal shown, instructions displayed | ✅ Require checkbox confirmation |
| Checkbox: "[x] Tôi đã hoàn thành quy trình vật lý hủy bỏ" unchecked | ❌ Button [Xác Nhận Hủy Bỏ] disabled |
| Checkbox checked | ✅ Button [Xác Nhận Hủy Bỏ] enabled |
| User confirms | ✅ Status → INVALIDATED, modal closes |
| Status = INVALIDATED | ✅ Record removed from active tế lễ queue |

---

## Input Contract

```typescript
interface MarkInvalidDto {
  littleHouseId: string
  reason?: string                          // optional reason/notes
  invalidationCompletedConfirmed: boolean  // MANDATORY = true to proceed
}

interface InvalidationRecord {
  littleHouseId: string
  status: 'ACTIVE' | 'INVALIDATED'
  invalidatedAt: DateTime?
  invalidationReason: string?
  invalidationCompletedConfirmed: boolean
}

interface LittleHouse {
  // ... existing fields
  status: 'ACTIVE' | 'INVALIDATED'
  invalidatedAt: DateTime?
  invalidationReason: String?
}
```

---

## Write Path

### Mark NNN as Invalid

```
POST /api/engagement/little-house/mark-invalid
Body: {
  littleHouseId: "lh_xyz",
  reason?: "Viết nhầm tên người thụ hưởng",
  invalidationCompletedConfirmed: true
}

1. Fetch LittleHouse by littleHouseId
2. Validate invalidationCompletedConfirmed:
   → If false/missing:
      • return 400 invalidation_confirmation_required
      • Message: "Bắt buộc xác nhận đã hoàn thành quy trình hủy bỏ vật lý"
   → If true:
      • Proceed
3. Update LittleHouse:
   → status = INVALIDATED
   → invalidatedAt = now()
   → invalidationReason = (optional reason if provided)
4. Audit: lh.invalidation.marked-invalid, lh.invalidation.protocol-completed
5. Response: { littleHouseId, status: INVALIDATED, invalidatedAt, message: "✅ NNN đã được ghi nhận là hủy bỏ" }
```

### Get Invalidation Status

```
GET /api/engagement/little-house/:littleHouseId

Returns:
{
  littleHouseId: string
  status: 'ACTIVE' | 'INVALIDATED'
  invalidatedAt: DateTime | null
  invalidationReason: string | null
}
```

---

## FE Behavior

### Normal NNN View (Status = ACTIVE)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    📋 NGÔI NHÀ NHỎ (NNN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Người Thụ Hưởng: Nguyễn Văn A
Ngày Tạo: 2026-04-01
Trạng Thái: Đang Hoạt Động ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(Old UI had [Delete] button)
(New UI: [Delete] button HIDDEN)

[← Quay lại]  [Báo Cáo Viết Sai]  [Chỉnh Sửa]
```

### Invalidation Modal (On Button Click)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ⚠️ QUY TRÌNH HỦY BỎ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NNN VĂN BẢN VIẾT SAI HO CHO KỲ THỊ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CẤM TẨY XÓA, XÉ HAY ĐỐT!

Hãy dùng bút gạch chéo tên, gấp nhỏ,
bọc giấy vứ thùng rác.

Đọc to:

"Nam mô Quán Thế Âm Bồ Tát, con là [Tên],
tấm NNN này viết sai, nay xin phép hủy bỏ"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

☐ [x] Tôi đã hoàn thành quy trình
      vật lý hủy bỏ

(Checkbox starts UNCHECKED)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Huỷ]  [Xác Nhận Hủy Bỏ] (disabled)

---

When user checks checkbox:

☑ [x] Tôi đã hoàn thành quy trình
      vật lý hủy bỏ

[Huỷ]  [Xác Nhận Hủy Bỏ] (enabled)

---

On successful confirmation:

✅ NNN đã được ghi nhận là hủy bỏ.
Tấm NNN này sẽ không được đưa vào
tế lễ cầu siêu.

[← Quay lại Danh Sách NNN]
```

### After Invalidation (Status = INVALIDATED)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    📋 NGÔI NHÀ NHỎ (NNN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Người Thụ Hưởng: Nguyễn Văn A
Ngày Tạo: 2026-04-01
Trạng Thái: Đã Hủy Bỏ ❌

Ngày Hủy Bỏ: 2026-04-04 10:30
Lý Do: Viết nhầm tên

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(All action buttons hidden)
(Record is read-only, archived)

[← Quay lại Danh Sách NNN]
```

---

## Schema Notes

```prisma
model LittleHouse {
  // ... existing fields
  status                      String      @default("ACTIVE")  // ACTIVE | INVALIDATED
  invalidatedAt               DateTime?
  invalidationReason          String?     @db.Text

  // For audit trail:
  invalidationCompletedConfirmed Boolean?  @default(false)

  @@index([status])
  @@index([invalidatedAt])
}

model LittleHouseAudit {
  id                          String      @id @default(cuid())
  littleHouseId               String
  action                      String      // "marked-invalid", "protocol-completed"
  reason                      String?
  completedConfirmed          Boolean?
  createdAt                   DateTime    @default(now())

  @@index([littleHouseId])
  @@index([action])
}
```

---

## Audit

| Action | Trigger | Context |
|---|---|---|
| `lh.invalidation.marked-invalid` | User clicks [Báo Cáo Viết Sai] | Modal shown |
| `lh.invalidation.protocol-completed` | User checks confirmation + clicks [Xác Nhận] | Status → INVALIDATED |

---

## Error Handling

| Code | Status | Message | Recovery |
|---|---|---|---|
| `invalidation_confirmation_required` | 400 | Bắt buộc xác nhận đã hoàn thành quy trình hủy bỏ vật lý | Check the confirmation checkbox before proceeding |
| `little_house_not_found` | 404 | NNN không tìm thấy | Verify littleHouseId is correct |
| `already_invalidated` | 400 | NNN đã được hủy bỏ rồi, không thể thay đổi | No further action needed |
| `cannot_invalidate_completed` | 400 | Không thể hủy bỏ NNN đã hoàn thành cầu siêu | Only invalidate before completion |

---

## Notes for AI/codegen

- **No Delete button:** Remove standard [Delete] button from UI for all NNN records. This prevents accidental deletion.
- **Mandatory invalidation workflow:** Instead of deletion, show [Báo Cáo Viết Sai] button that triggers modal.
- **Modal is informative:** The instructions are explicit and culturally critical. Do NOT simplify or modify the text.
- **Checkbox requirement:** invalidationCompletedConfirmed MUST be true before BE accepts the request. Hard 400 block if false.
- **Read-only after invalidation:** Once status = INVALIDATED, the record is locked and cannot be edited or un-invalidated.
- **Audit tracking:** Log both the marked-invalid action (FE button click) and protocol-completed action (BE confirmation).
- **Queue exclusion:** Invalidated NNNs must be excluded from any tế lễ ceremony queues or recitation sessions.
- **Optional reason field:** User can optionally provide a reason (e.g., "Viết nhầm tên người thụ hưởng"), but it's not required for the hard block.

---

## Related

- [blank-lh-reservation-lock.md](./blank-lh-reservation-lock.md) — blank NNN lifecycle management
- [spirit-money-collision-alert.md](./spirit-money-collision-alert.md) — rule enforcement before burn
- [burn-container-sanitization-protocol.md](./burn-container-sanitization-protocol.md) — post-burn cleanup

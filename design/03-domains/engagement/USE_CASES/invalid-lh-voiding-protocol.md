# Giao Thức Hủy NNN Lỗi — Invalid LH Voiding Protocol

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi phát hiện lỗi trên NNN đã viết xong (lỗi chính tả, sai người nhận, v.v.), bắt buộc tuân thủ nghi thức hủy:
1. Gạch chéo toàn bộ tờ NNN bằng bút
2. Gấp nhỏ tờ NNN
3. Bọc giấy rác bên ngoài
4. Vứt thùng rác

Chỉ khi thực hiện xong tất cả 4 bước, hệ thống mới cho phép đánh dấu NNN là "đã hủy". Không thể hoàn tác sau khi xác nhận.

---

## Owner module

`engagement` — InvalidLittleHouseVoidingProtocol
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — phát hiện lỗi, thực hiện nghi thức hủy, xác nhận từng bước
- `system` — trigger checklist hủy, chặn xác nhận nếu chưa hoàn tất tất cả 4 bước

---

## Trigger

Khi user khởi tạo voiding trên LittleHouse có status `COMPLETED`.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User nhấn "Hủy NNN" trên form đã viết xong | ✅ Trigger voiding checklist modal |
| Bước 1 (gạch chéo) chưa check | ❌ Nút "Xác Nhận Hủy NNN" disabled |
| Bước 2 (gấp nhỏ) chưa check | ❌ Nút "Xác Nhận Hủy NNN" disabled |
| Bước 3 (bọc giấy rác) chưa check | ❌ Nút "Xác Nhận Hủy NNN" disabled |
| Bước 4 (vứt thùng) chưa check | ❌ Nút "Xác Nhận Hủy NNN" disabled |
| Tất cả 4 bước checked | ✅ Nút "Xác Nhận Hủy NNN" enabled |
| User nhấn "Xác Nhận Hủy NNN" | ✅ LittleHouse → voidedAt = now(), không thể undo |
| User đóng modal trước khi xong | ⚠️ Voiding bị hủy, có thể thực hiện lại sau |

---

## Input Contract

```typescript
interface VoidLittleHouseDto {
  littleHouseId: string
  voided: boolean                    // true = confirm voiding
  stepsConfirmed: {
    crossedOut: boolean             // Step 1: gạch chéo
    folded: boolean                 // Step 2: gấp nhỏ
    wrappedInTrash: boolean         // Step 3: bọc giấy rác
    discarded: boolean              // Step 4: vứt thùng
  }
}

interface VoidingChecklistState {
  littleHouseId: string
  voidingInitiatedAt: DateTime
  stepsConfirmed: {
    crossedOut: boolean
    folded: boolean
    wrappedInTrash: boolean
    discarded: boolean
  }
  allStepsCompleted: boolean        // computed: all 4 true
  canConfirmVoiding: boolean        // computed: allStepsCompleted
}
```

---

## Write Path

```
POST /api/engagement/little-house/void
1. Validate littleHouseId exists
2. Validate LittleHouse.status = COMPLETED
3. Check stepsConfirmed: must have all 4 = true
   → If not all true: return 400 lh_voiding_steps_incomplete
4. If voided = true:
   → LittleHouse.voidedAt = now()
   → LittleHouse.voidingStepsConfirmedAt = now()
   → Audit: lh.voiding-confirmed
5. If voided = false (user cancelled):
   → Clear voiding state, allow re-attempt
   → Audit: lh.voiding-cancelled
```

---

## FE Behavior

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ⚠️ HỦY NNN LỖI — XÁC NHẬN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phát hiện lỗi trên NNN?
Vui lòng tuân thủ nghi thức hủy:

[ ] Bước 1: Gạch Chéo
    ✓ Dùng bút gạch chéo toàn bộ tờ NNN
    ✓ Đảm bảo không còn chữ nào nhìn thấy rõ

[ ] Bước 2: Gấp Nhỏ
    ✓ Gấp nhỏ tờ NNN lại nhiều lần
    ✓ Tạo hình dáng nhỏ gọn

[ ] Bước 3: Bọc Giấy Rác
    ✓ Lấy giấy rác (báo cũ, giấy vụn)
    ✓ Bọc lấy tờ NNN đã gạch

[ ] Bước 4: Vứt Thùng
    ✓ Đem vứt vào thùng rác
    ✓ Không để lại tờ NNN đâu

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lý do hủy:
(optional text field)
[_________________________________]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Hủy]  [Xác Nhận Hủy NNN]
(disabled until all 4 checked)

⚠️ CHÚ Ý: Sau khi xác nhận, KHÔNG THỂ
hoàn tác. NNN sẽ bị đánh dấu là "đã hủy"
trong hệ thống.
```

---

## Schema Notes

```prisma
model LittleHouse {
  // ... existing fields ...
  voidedAt               DateTime?
  voidingStepsConfirmedAt DateTime?
  voidingReason          String?
  // tracking voiding lifecycle:
  // voidingInitiatedAt is implicit in audit log
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `lh.voiding-initiated` | User opens voiding modal |
| `lh.voiding-steps-updated` | User checks/unchecks any step |
| `lh.voiding-steps-completed` | All 4 steps checked simultaneously |
| `lh.voiding-confirmed` | User clicks "Xác Nhận Hủy NNN" with all steps confirmed |
| `lh.voiding-cancelled` | User closes modal before confirming |

---

## Error Handling

| Code | Status | Message | Recovery |
|---|---|---|---|
| `lh_voiding_steps_incomplete` | 400 | Chưa hoàn tất tất cả 4 bước hủy NNN | Re-check missing steps |
| `lh_not_found` | 404 | NNN không tìm thấy | Refresh & retry |
| `lh_not_completed` | 400 | Chỉ có thể hủy NNN đã viết xong | N/A |
| `lh_already_voided` | 409 | NNN này đã được hủy rồi | N/A |

---

## Notes for AI/codegen

- Voiding là **irreversible** action — không có "undo" sau khi xác nhận.
- Button "Xác Nhận Hủy NNN" chỉ enable khi CẢ 4 steps = true.
- Nếu user đóng modal trước khi xác nhận: voiding state bị xóa, có thể thực hiện lại.
- Voiding là **full form destruction** — không giữ lại data để khôi phục.
- VoidingReason là optional context để audit hiểu tại sao NNN bị hủy.

---

## Related

- [burn-container-sanitization-protocol.md](./burn-container-sanitization-protocol.md) — post-burn ritual
- [little-house-ash-disposal.md](./little-house-ash-disposal.md) — ash handling
- [no-altar-prerequisite-enforcer.md](./no-altar-prerequisite-enforcer.md) — altar guard

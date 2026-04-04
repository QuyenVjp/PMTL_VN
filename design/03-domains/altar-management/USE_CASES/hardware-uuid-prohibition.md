# Cấm Đổi Chủ Phật Cụ — Hardware UUID Prohibition

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Phật cụ (cốc, lư hương, bát nước...) đã được cúng dường cho một vị Bồ Tát cụ thể thì **vĩnh viễn thuộc về vị đó**. Chuyển sang vị khác hoặc dùng sinh hoạt cá nhân là phạm tội bất kính nghiêm trọng. Hệ thống gán UUID và khóa vĩnh viễn.

---

## Owner module

`altar-management` — AltarService / HardwareRoleEngine
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người quản lý bàn thờ
- `system` — gán UUID khi tạo item, chặn reassignment

---

## Trigger

Khi user cố kéo thả hoặc chỉnh sửa `assignedTo` của một HardwareItem đã active.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| HardwareItem mới được tạo | ✅ Gán UUID + Bodhisattva — immutable |
| Item đã assign cho Bồ Tát A | 🔐 Lock vĩnh viễn với A |
| User kéo thả item sang Bồ Tát B | ❌ Reject, hiển thị lỗi |
| User click `[Thay Phật Cụ Mới]` | ✅ Tạo item MỚI, retire item cũ |
| Item cũ retired | ✅ Mark STATUS = RETIRED |
| Item retired | ⚠️ Yêu cầu cam kết bọc vải đỏ |

---

## Input Contract

```typescript
interface CreateHardwareItemDto {
  name: string         // "Cốc nước", "Lư hương"
  itemType: HardwareItemType  // CUP | INCENSE_BURNER | WATER_BOWL
  assignedTo: string   // Tên Bồ Tát — IMMUTABLE after creation
}

interface RetireHardwareItemDto {
  itemId: string
  retirementPledge: string  // "Tôi sẽ bọc vải đỏ và cất đi"
  wrappingCommitted: boolean
  notUsedForPersonalUse: boolean
}
```

---

## Write Path

```
POST /api/altar-management/hardware-items
1. Create HardwareItem with assignedTo (immutable field)
2. assignedAt = now(), status = ACTIVE

PATCH /api/altar-management/hardware-items/:id → FORBIDDEN
→ throw 403 { code: 'hardware_reassignment_forbidden' }
// assignedTo là readonly — không bao giờ được UPDATE

POST /api/altar-management/hardware-items/:id/retire
1. Validate wrappingCommitted = true
2. Validate notUsedForPersonalUse = true
3. UPDATE status = RETIRED, retiredAt = now()
4. Audit: hardware.status_retired
```

---

## FE Behavior

```
Khi user kéo thả item sang Bồ Tát khác:

❌ LỖI: KHÔNG ĐƯỢC ĐỔI CHỦ PHẬT CỤ

Cốc nước này đã được ấn định cho:
🙏 Thích Ca Mâu Ni Phật

Luật PMTL: Phật cụ đã được tách riêng
cho vị Bồ Tát nào thì vĩnh viễn
không được đổi chủ.

────────────────────────────────
Lựa chọn:
[Giữ nguyên]  [Thêm Phật Cụ Mới cho Bồ Tát khác]

────────────────────────────────

Modal Retire + Tạo Mới:

Phật cụ cũ (Thích Ca) sẽ được Retired.
Bạn cam kết:
[ ] Bọc vải đỏ/giấy đỏ phật cụ cũ
[ ] Cất đi, KHÔNG dùng sinh hoạt cá nhân

[Hủy]    [Tạo Phật Cụ Mới]
```

---

## Schema Notes

```prisma
model HardwareItem {
  id               String   @id @default(cuid())
  userId           String
  name             String
  itemType         String   // CUP | INCENSE_BURNER | WATER_BOWL
  assignedTo       String   // Bodhisattva — IMMUTABLE
  assignedAt       DateTime @default(now())
  status           String   @default("ACTIVE")  // ACTIVE | RETIRED
  retiredAt        DateTime?
  retirementPledge String?
  // Migration: CREATE TABLE "HardwareItem" (...)
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `hardware.created_and_assigned` | Item mới được tạo |
| `hardware.reassignment_attempted` | Drag-drop bị block |
| `hardware.status_retired` | Item được retire |
| `hardware.retirement_commitment_logged` | Pledge xác nhận |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Cố PATCH assignedTo | `hardware_reassignment_forbidden` | 403 |
| Retire không có pledge | `retirement_pledge_required` | 400 |

---

## Related

- [altar-profile-spatial-validation.md](../../vows-merit/USE_CASES/altar-profile-spatial-validation.md) — spatial layout validation

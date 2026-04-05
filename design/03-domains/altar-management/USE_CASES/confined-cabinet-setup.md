# Không Gian Hẹp Bằng Tủ Thờ Gỗ — Confined Cabinet Setup

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — limited space altar design
> **Cập nhật:** 2026-04-04

---

## Purpose

Nếu nhà quá chật hoặc bắt buộc đặt bàn thờ ở nơi có trường khí không tốt (gần bếp, phòng vợ chồng), phải mua một chiếc **tủ mới có cửa gỗ** để thờ tượng Bồ Tát bên trong. Mở cửa tủ **khi thắp nhang**, đóng cửa tủ **lại khi nhang đã cháy xong**. Tuyệt đối cấm đặt bất cứ thứ gì ở phía trên tượng Bồ Tát, và trong tủ chỉ để Phật cụ, Kinh sách, cấm đặt vật dụng khác.

---

## Owner module

`altar-management` — AltarService / CabinetAltarSetup
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — setup confined cabinet altar
- `system` — enforce cabinet state sync with incense burning

---

## Trigger

User indicates limited space or problematic location, or manually selects [Confined Cabinet Setup]

---

## Business Rules

| Điều Kiện | Hành Động |
|---|---|
| Cabinet setup confirmed | ✅ Enable cabinet state tracking |
| User about to light incense | ⚠️ Remind: "Mở cửa tủ" |
| Incense burning | ✅ Cabinet door OPEN (tracked) |
| Incense burnt out | ⚠️ Remind: "Đóng cửa tủ" |
| Cabinet closed, incense burning | ⚠️ Warning alert |
| Item placed ABOVE statue | ❌ BLOCK 400 |
| Non-dharma item placed in cabinet | ❌ BLOCK 400 |

---

## Input Contract

```typescript
interface CabinetAltarSetupDto {
  confinedCabinetEnabled: boolean
  doorState: 'OPEN' | 'CLOSED'
  incenseActive: boolean
  itemsInside: Array<{
    name: string
    category: 'BUDDHA_STATUE' | 'INCENSE' | 'SCRIPTURE' | 'OIL_LAMP' | 'OTHER'
    position: 'ABOVE_STATUE' | 'BESIDE_STATUE' | 'BELOW_STATUE'
  }>
}

interface CabinetStateValidationResult {
  valid: boolean
  violations: string[]
}
```

---

## Write Path

```
POST /api/altar-management/cabinet/setup

1. If confinedCabinetEnabled:
   a. Store preference
   b. Enable cabinet state monitoring
   c. Audit: altar.cabinet.enabled

POST /api/altar-management/cabinet/door-state

1. Load incense status
2. If incenseActive && doorState === 'CLOSED':
   → Return 400 {
       error: 'cabinet_door_must_open',
       message: 'Phải mở cửa tủ khi nhang đang cháy'
     }

POST /api/altar-management/cabinet/add-item

1. Parse item.position & item.category
2. If position === 'ABOVE_STATUE':
   → 400 { error: 'item_above_statue_forbidden', message: 'Cấm đặt vật gì ở phía trên tượng' }
3. If category === 'OTHER':
   → 400 { error: 'non_dharma_item_forbidden', message: 'Chỉ để Phật cụ, Kinh sách' }
4. If valid:
   a. Add item
   b. Audit: altar.cabinet.item_added

```

---

## FE Behavior

### Confined Cabinet Setup Modal

```
┌────────────────────────────────────────────────────────┐
│ 🚪 Tủ Thờ Phật Gỗ (Không Gian Hẹp)                    │
│────────────────────────────────────────────────────────│
│                                                        │
│ Nếu nhà quá chật hoặc nơi đặt bàn thờ có từ trường   │
│ không tốt (gần bếp, phòng vợ chồng), sử dụng tủ      │
│ thờ sẽ giúp bảo vệ từ trường bàn thờ.                │
│                                                        │
│ [ ] Tôi sử dụng tủ thờ gỗ có cửa                     │
│                                                        │
│ Lưu ý quan trọng:                                      │
│ • Mở cửa khi thắp nhang                               │
│ • Đóng cửa sau khi nhang cháy hết                     │
│ • Chỉ để Phật cụ, Kinh sách bên trong                │
│ • Cấm đặt vật gì ở TRÊN tượng Bồ Tát                 │
│                                                        │
│         [Xác Nhận]                                    │
└────────────────────────────────────────────────────────┘
```

### Cabinet Door State Tracking

```
┌────────────────────────────────────────────────────────┐
│ 🚪 Trạng Thái Cửa Tủ                                   │
│────────────────────────────────────────────────────────│
│                                                        │
│ Nhang đang cháy — Cửa tủ phải MỞ                      │
│ Hiện tại: 🔴 CLOSED (SAI!)                             │
│                                                        │
│ ⚠️  Vui lòng MỞ cửa tủ ngay khi nhang đang cháy.      │
│                                                        │
│        [MỞ CỬA TỦ]                                    │
└────────────────────────────────────────────────────────┘
```

### Items Placement Validation

```
┌────────────────────────────────────────────────────────┐
│ ❌ Không Thể Đặt Vật Này                               │
│────────────────────────────────────────────────────────│
│                                                        │
│ Vật dụng "Sách Phật Giáo" không thể đặt ở vị trí      │
│ "Phía trên tượng Bồ Tát".                              │
│                                                        │
│ Quy tắc: Cấm đặt BẤT CỨ VẬT GÌ ở phía trên tượng.    │
│                                                        │
│ Vị trí cho phép:                                       │
│ ✅ Bên cạnh tượng                                      │
│ ✅ Phía dưới tượng                                     │
│                                                        │
│       [Chọn Vị Trí Khác]                              │
└────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model CabinetAltarSetup {
  id                  String   @id @default(cuid())
  userId              String
  altarId             String
  enabled             Boolean  @default(false)
  createdAt           DateTime @default(now())

  @@unique([userId, altarId])
}

model CabinetDoorState {
  id                  String   @id @default(cuid())
  userId              String
  altarId             String
  doorState           String   // OPEN | CLOSED
  incenseActive       Boolean
  lastStateChangeAt   DateTime @default(now())

  @@index([userId, altarId])
}

model CabinetItem {
  id                  String   @id @default(cuid())
  userId              String
  altarId             String
  itemName            String
  category            String   // BUDDHA_STATUE | INCENSE | SCRIPTURE | OIL_LAMP
  position            String   // ABOVE_STATUE (forbidden) | BESIDE_STATUE | BELOW_STATUE
  addedAt             DateTime @default(now())

  @@index([userId, altarId, position])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.cabinet.enabled` | Confined setup activated |
| `altar.cabinet.door_opened` | Door opened for incense |
| `altar.cabinet.door_closed` | Door closed after incense |
| `altar.cabinet.door_state_mismatch` | Door closed while incense burning |
| `altar.cabinet.item_added` | Item placed inside |
| `altar.cabinet.forbidden_position` | Item blocked (above statue) |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Door closed + incense burning | `cabinet_door_must_open` | 400 |
| Item above statue | `item_above_statue_forbidden` | 400 |
| Non-dharma item | `non_dharma_item_forbidden` | 400 |

---

## Notes for AI/codegen

- Cabinet state is paired with incense status (if one, other must be in sync)
- Items whitelist: only BUDDHA_STATUE, INCENSE, SCRIPTURE, OIL_LAMP allowed
- "ABOVE_STATUE" position is absolute block
- Real-time door state monitoring via UI or optional sensor (Phase 2)
- Audit trail helps educate users on proper cabinet usage

---

## Related

- [statue-hygiene-mantra-protocol.md](./statue-hygiene-mantra-protocol.md) — Cleaning in cabinet
- [internal-relocation-lock.md](./internal-relocation-lock.md) — Moving statue in cabinet
- [electric-lotus-lamp-sequence.md](./electric-lotus-lamp-sequence.md) — Lamp rules

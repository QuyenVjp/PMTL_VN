# Quy Trình Nhang Đàn Hương Bột Ép — Pressed Sandalwood Incense Alternative Procedure

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 917, 918)
> **Trạng thái:** Verified source — simplified alternative to raw sandalwood
> **Cập nhật:** 2026-04-04

---

## Purpose

Ngoài gỗ đàn hương nguyên miếng, người tu học có thể dùng **nhang đàn hương bột ép** (loại được làm từ bột gỗ đàn hương ép lại, cháy liên tục). Quy trình sử dụng loại này khác biệt với gỗ nguyên miếng — không cần châm lửa rồi dập tắt để tạo khói 3 lần, mà chỉ cần thắp và cắm vào lư hương để cháy tự nhiên.

---

## Owner module

`altar-management` — AltarService / PressedIncenseAlternative
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người dùng nhang bột ép thay cho gỗ nguyên miếng
- `system` — validate incense type, disable raw sandalwood steps for pressed variant

---

## Trigger

Khi user chọn loại Đại Hương là **nhang bột ép** (pressed incense) thay vì gỗ nguyên miếng

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User chọn gỗ nguyên miếng | ✅ Show 6-step ritual (light, fan, repeat 3x each altar) |
| User chọn nhang bột ép | ✅ Show simplified 2-step ritual (light & place) |
| User không chọn loại | ❌ BLOCK 400 |
| Pressed incense cháy tự nhiên | ✅ No hand-fanning needed |

---

## Input Contract

```typescript
interface BurnIncenseDto {
  incenseType: 'RAW_SANDALWOOD_STICK' | 'PRESSED_SANDALWOOD_INCENSE'
  auspiciousDayConfirmed: boolean
  ritualStepsCompleted: {
    // For RAW_SANDALWOOD_STICK:
    lampLit?: boolean
    handFanned3Times?: boolean

    // For PRESSED_SANDALWOOD_INCENSE:
    incenseStick1Placed?: boolean  // First stick in Thích Ca altar
    incenseStick2Placed?: boolean  // Second stick in Quán Âm altar
  }
}

interface IncenseValidationResult {
  type: string
  allowed: boolean
  requiredSteps: string[]
}
```

---

## Write Path

```
POST /api/altar-management/grand-incense/burn

1. Load incenseType from request:
   const { incenseType } = payload

2. If incenseType === 'PRESSED_SANDALWOOD_INCENSE':
   a. Validate requiredSteps = ['incenseStick1Placed', 'incenseStick2Placed']
   b. Check both === true:
      - incenseStick1Placed (Thích Ca)
      - incenseStick2Placed (Quán Âm)
   c. If either false → 400 error
   d. Create IncenseSession with type='PRESSED'
   e. Audit: altar.pressed-incense.burned
   f. Return success

3. If incenseType === 'RAW_SANDALWOOD_STICK':
   → Follow 6-step ritual from grand-incense-state-machine.md
```

---

## FE Behavior

### Selection Modal - Incense Type

```
┌────────────────────────────────────────────────────────┐
│ 🍃 Chọn Loại Đại Hương                                 │
│────────────────────────────────────────────────────────│
│ Bạn muốn dùng loại Đại Hương nào?                      │
│                                                        │
│ ⭕ Gỗ đàn hương nguyên miếng (Sandalwood stick)        │
│    → Cần phẩy tay 3 lần ở mỗi bàn thờ                 │
│    → Quy trình phức tạp hơn                           │
│                                                        │
│ ⭕ Nhang đàn hương bột ép (Pressed incense)             │
│    → Chỉ cần thắp và cắm vào lư hương                 │
│    → Để cháy tự nhiên (đơn giản hơn)                  │
│                                                        │
│            [Tiếp Tục]                                 │
└────────────────────────────────────────────────────────┘
```

### Pressed Incense Ritual Checklist (Simplified)

```
┌────────────────────────────────────────────────────────┐
│ 🙏 Nghi Thức Nhang Đàn Hương Bột Ép                    │
│────────────────────────────────────────────────────────│
│                                                        │
│ BƯỚC 1: Chuẩn Bị                                       │
│ [ ] Thắp một nén nhang đàn hương bột ép               │
│                                                        │
│ BƯỚC 2: Cắm Vào Lư Hương                               │
│ [ ] Cắm nén thứ nhất vào lư hương của Thích Ca        │
│ [ ] Cắm nén thứ hai vào lư hương của Quán Âm         │
│                                                        │
│ Nhang sẽ cháy tự nhiên — không cần phẩy tay.          │
│                                                        │
│ [ ] Tôi xác nhận đã hoàn thành nghi thức trên         │
│                                                        │
│          [Tiếp Tục]   [Hủy]                           │
└────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model IncenseSession {
  // ... existing fields ...
  incenseType    String   // RAW_SANDALWOOD_STICK | PRESSED_SANDALWOOD_INCENSE

  // For pressed incense only:
  stick1Placed   Boolean?
  stick2Placed   Boolean?
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.pressed-incense.selected` | User chọn loại nhang bột ép |
| `altar.pressed-incense.burned` | Nhang bột ép được đốt |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Pressed incense, stick 1 missing | `incense_stick_1_required` | 400 |
| Pressed incense, stick 2 missing | `incense_stick_2_required` | 400 |
| Invalid incenseType | `invalid_incense_type` | 400 |

---

## Notes for AI/codegen

- Pressed incense là alternative đơn giản cho người bận rộn hoặc không muốn thực hiện 6-step ritual
- Vẫn phải là auspicious day
- 2 sticks: một cho Thích Ca, một cho Quán Âm
- Không cần anti-mouth-blowing guard vì không có fire-fanning
- Pressed incense cháy liên tục ~ 45 phút

---

## Related

- [grand-incense-state-machine.md](./grand-incense-state-machine.md) — Raw sandalwood 6-step ritual
- [sandalwood-residue-storage-tracker.md](./sandalwood-residue-storage-tracker.md) — Storage of remaining wood
- [anti-mouth-blowing-detection-guard.md](./anti-mouth-blowing-detection-guard.md) — Camera guard for raw sandalwood

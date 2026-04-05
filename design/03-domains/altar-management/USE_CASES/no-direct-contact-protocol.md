# Giao Thức "Sang Chiết" và Cấm Chạm Môi — No-Direct-Contact Protocol

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 905, 906)
> **Trạng thái:** Verified source — UI guidance + animation enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi hạ Nước Đại Bi xuống để uống, tuyệt đối không được uống trực tiếp từ ly cúng. Phải rót Nước Đại Bi từ ly cúng sang một chiếc ly khác của mình để uống. Môi tuyệt đối không được chạm vào ly cúng của Bồ Tát.

---

## Owner module

`altar-management` — AltarService / WaterConsumptionGate
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người hạ nước để uống
- `system` — hiển thị hướng dẫn animation, ép confirm

---

## Trigger

Khi user bấm nút `[Hạ Nước Đại Bi / Retrieve Water]` để uống

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User click `[Hạ Nước]` | ⚠️ Hiển thị animation hướng dẫn sang chiết |
| User chưa xác nhận sang chiết | ❌ Nút `[Uống]` disabled |
| User tick checkbox "Đã sang chiết" | ✅ Nút `[Uống]` enable |
| User click `[Uống]` | ✅ Proceed to Visualization step |

---

## Input Contract

```typescript
interface RetrieveWaterDto {
  waterId: string
  decantedToSeparateCup: boolean  // BẮT BUỘC = true
  lipsNotTouched: boolean          // BẮT BUỘC = true
}

interface WaterRetrievalConfirmation {
  success: boolean
  nextStep: 'VISUALIZATION'
}
```

---

## Write Path

```
POST /api/altar-management/water/retrieve-for-drinking

1. Show animation overlay with instruction:
   "Hãy rót Nước Đại Bi từ ly cúng sang một chiếc ly khác.
    Môi tuyệt đối KHÔNG được chạm vào ly cúng!"

2. Display 2 checkboxes:
   [x] Tôi đã sang chiết nước sang ly khác
   [x] Tôi cam kết KHÔNG chạm môi vào ly cúng

3. Validate both === true:
   a. If any false → return 400 {
       error: 'decanting_not_confirmed',
       message: 'Bắt buộc phải rót nước sang ly khác và không chạm môi'
      }
   b. If both true:
      → Advance to Visualization step
      → Audit: altar.water.decanting_confirmed

```

---

## FE Behavior

### Animation + Checklist Modal

```
┌────────────────────────────────────────────────────────┐
│ 💧 Chuẩn Bị Uống Nước Đại Bi                           │
│────────────────────────────────────────────────────────│
│                                                        │
│ [Animation: Hand pouring water into separate cup]     │
│                                                        │
│ Hãy rót Nước Đại Bi từ ly cúng sang một chiếc        │
│ ly khác trước khi uống.                               │
│                                                        │
│ Môi tuyệt đối KHÔNG được chạm vào ly cúng             │
│ của Bồ Tát.                                           │
│                                                        │
│ [ ] Tôi đã sang chiết nước sang ly khác               │
│ [ ] Tôi KHÔNG chạm môi vào ly cúng                    │
│                                                        │
│        [Tiếp Tục Uống]                               │
│       (disabled)                                      │
└────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model WaterConsumptionSession {
  id                     String   @id @default(cuid())
  userId                 String
  waterId                String
  decantedToSeparateCup  Boolean
  lipsNotTouched         Boolean
  startedAt              DateTime @default(now())
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.water.decanting_confirmed` | User xác nhận sang chiết |
| `altar.water.consumption_started` | Bước Visualization begin |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `decantedToSeparateCup = false` | `decanting_not_confirmed` | 400 |
| `lipsNotTouched = false` | `decanting_not_confirmed` | 400 |

---

## Notes for AI/codegen

- Cả 2 checkboxes phải true
- Animation là step bắt buộc trước khi user có thể proceed
- Câu hỏi rõ ràng, không mơ hồ

---

## Related

- [water-source-validation.md](./water-source-validation.md) — Kiểm tra loại nước
- [visualization-engine-water-flow.md](./visualization-engine-water-flow.md) — Quán tưởng dòng chảy

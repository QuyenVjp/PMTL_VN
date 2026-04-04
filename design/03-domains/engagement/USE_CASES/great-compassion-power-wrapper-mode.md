# Chế Độ Bao Bọc Đại Bi — Great Compassion Power-Wrapper Mode

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 59, 60, 299, 300)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi hành giả trì tụng trong nghi thức Ngôi Nhà Nhỏ, Chú Đại Bi đóng vai trò "bao bọc năng lượng" cho toàn bộ phiên tụng. Chế độ này enforce trình tự chính xác:

- 9 biến Chú Đại Bi mở đầu
- 3 biến Chú Đại Bi → 49 biến Tâm Kinh
- 3 biến Chú Đại Bi → 84 biến Vãng Sanh Chú
- 3 biến Chú Đại Bi → 87 biến Thất Phật Diệt Tội
- 9 biến Chú Đại Bi kết thúc

Khi toggle TẮT: cho phép trì tụng tự do như hành vi hiện tại.

---

## Owner module

`engagement` — LittleHouseService / RecitationSequencer
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — bật/tắt chế độ bao bọc, thực hiện trình tự tụng niệm
- `system` — enforce trình tự, disable nút chuyển section khi chưa đủ số biến Đại Bi yêu cầu

---

## Trigger

Khi user kích hoạt toggle "Chế Độ Bao Bọc Năng Lượng" trong NNN E-Reader UI và bắt đầu phiên tụng niệm mới.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Toggle OFF | ✅ Trì tụng tự do (hành vi mặc định) |
| Toggle ON, đang ở section mở đầu | ✅ Yêu cầu 9 biến Chú Đại Bi trước khi chuyển sang section 1 |
| Toggle ON, đang ở section 1/2/3 | ✅ Yêu cầu 3 biến Chú Đại Bi trước khi bắt đầu nội dung chính |
| Toggle ON, nội dung chính đang tụng | ✅ Phải hoàn thành đủ số biến (49/84/87) trước khi chuyển section |
| User bấm "Tiếp theo" khi chưa đủ Đại Bi | ❌ 400 `power_wrapper_sequence_violation` |
| Toggle ON, đang ở section kết thúc | ✅ Yêu cầu 9 biến Chú Đại Bi để đóng phiên |
| Phiên hoàn tất đúng trình tự | ✅ Audit `lh.power-wrapper.completed` |

---

## Input Contract

```typescript
interface ActivatePowerWrapperDto {
  sessionId: string
  enabled: boolean
}

enum PowerWrapperSection {
  OPENING_GREAT_COMPASSION  = 'OPENING_GREAT_COMPASSION',   // 9 biến
  SECTION_1_WRAPPER         = 'SECTION_1_WRAPPER',          // 3 biến
  SECTION_1_HEART_SUTRA     = 'SECTION_1_HEART_SUTRA',      // 49 biến Tâm Kinh
  SECTION_2_WRAPPER         = 'SECTION_2_WRAPPER',          // 3 biến
  SECTION_2_REBIRTH_MANTRA  = 'SECTION_2_REBIRTH_MANTRA',   // 84 biến Vãng Sanh
  SECTION_3_WRAPPER         = 'SECTION_3_WRAPPER',          // 3 biến
  SECTION_3_SEVEN_BUDDHA    = 'SECTION_3_SEVEN_BUDDHA',     // 87 biến Thất Phật Diệt Tội
  CLOSING_GREAT_COMPASSION  = 'CLOSING_GREAT_COMPASSION',   // 9 biến
}

interface PowerWrapperSessionState {
  sessionId: string
  powerWrapperEnabled: boolean
  currentSection: PowerWrapperSection
  currentSectionCount: number
  currentSectionRequired: number
  completedSections: PowerWrapperSection[]
}

interface AdvanceSectionDto {
  sessionId: string
  currentSection: PowerWrapperSection
}
```

---

## Write Path

```
POST /api/engagement/little-house/power-wrapper/activate
1. Validate sessionId exists
2. Update LittleHouseSession.powerWrapperEnabled = enabled
3. If enabled:
   → Init PowerWrapperSessionState, currentSection = OPENING_GREAT_COMPASSION, required = 9
4. Audit: lh.power-wrapper.enabled

POST /api/engagement/little-house/power-wrapper/advance-section
1. Validate sessionId, powerWrapperEnabled = true
2. Check currentSectionCount >= currentSectionRequired
   → If not: throw 400 power_wrapper_sequence_violation
3. Advance to next section, reset count
4. Audit: lh.power-wrapper.section-advanced
5. If all sections complete:
   → Audit: lh.power-wrapper.completed
```

---

## FE Behavior

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CHẾ ĐỘ BAO BỌC NĂNG LƯỢNG ĐẠI BI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Kích hoạt Chế Độ Bao Bọc Năng Lượng]  ●○ (toggle)

Khi BẬT — trình tự bắt buộc:

  ┌────────────────────────────────────┐
  │ 🔵 MỞ ĐẦU: 9 biến Chú Đại Bi      │
  │    Đã tụng: [7/9]  ← progress bar  │
  └────────────────────────────────────┘
        ↓ (mở khóa khi đủ 9)
  ┌────────────────────────────────────┐
  │ 🟡 PHẦN 1                          │
  │    3 biến Chú Đại Bi [0/3]         │
  │    → 49 biến Tâm Kinh [0/49]       │
  └────────────────────────────────────┘
        ↓
  ┌────────────────────────────────────┐
  │ 🟡 PHẦN 2                          │
  │    3 biến Chú Đại Bi [0/3]         │
  │    → 84 biến Vãng Sanh Chú [0/84]  │
  └────────────────────────────────────┘
        ↓
  ┌────────────────────────────────────┐
  │ 🟡 PHẦN 3                          │
  │    3 biến Chú Đại Bi [0/3]         │
  │    → 87 biến Thất Phật Diệt Tội    │
  │       [0/87]                       │
  └────────────────────────────────────┘
        ↓
  ┌────────────────────────────────────┐
  │ 🔵 KẾT THÚC: 9 biến Chú Đại Bi    │
  │    [0/9]                           │
  └────────────────────────────────────┘

  [Tiếp Theo ▶]  ← disabled (màu xám) khi chưa đủ số biến
                 ← enabled  (màu xanh) khi đủ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Lỗi khi bấm sớm:
  ┌────────────────────────────────────┐
  │ ⚠️  Chưa đủ biến Chú Đại Bi       │
  │  Cần hoàn thành [X] biến trước    │
  │  khi chuyển sang phần tiếp theo.  │
  └────────────────────────────────────┘
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Schema Notes

```prisma
model LittleHouseSession {
  // ... existing fields ...
  powerWrapperEnabled  Boolean @default(false)
  wrapperCurrentSection String? // PowerWrapperSection enum value
  wrapperSectionCount   Int     @default(0)
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `lh.power-wrapper.enabled` | Toggle bật/tắt chế độ |
| `lh.power-wrapper.section-advanced` | Chuyển sang section tiếp theo thành công |
| `lh.power-wrapper.completed` | Hoàn thành toàn bộ trình tự bao bọc |

---

## Errors

| Điều kiện | Mã lỗi | HTTP | Phục hồi |
|---|---|---|---|
| Bấm tiếp theo khi chưa đủ số biến Đại Bi | `power_wrapper_sequence_violation` | 400 | Hoàn thành đủ số biến yêu cầu |
| sessionId không tồn tại | `session_not_found` | 404 | Kiểm tra lại sessionId |
| Chưa đăng nhập | `unauthorized` | 401 | — |

---

## Notes for AI/codegen

- Nút "Tiếp Theo" phải được disable ở tầng UI **và** validate ở tầng API — không chỉ disable frontend.
- `currentSectionRequired` tính theo enum: OPENING/CLOSING = 9, SECTION_X_WRAPPER = 3, SECTION_X_CONTENT = target count.
- Toggle OFF không xóa session history — chỉ tắt enforcement. User có thể bật lại.
- Phase 1 implementation: không cần auto-count tụng niệm — user tự bấm tăng số biến.

---

## Related

- [burn-container-sanitization-protocol.md](./burn-container-sanitization-protocol.md) — post-burn checklist pattern
- [little-house-ash-disposal.md](./little-house-ash-disposal.md) — ash handling sequence

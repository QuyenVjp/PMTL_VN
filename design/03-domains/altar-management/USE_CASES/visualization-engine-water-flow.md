# Trình Quán Tưởng Dòng Chảy Đa Chiều — Multi-Dimensional Visualization Engine

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 907, 908)
> **Trạng thái:** Verified source — UI meditation guide + timed checkpoint
> **Cập nhật:** 2026-04-04

---

## Purpose

Nước Đại Bi không phải cứ ngửa cổ uống là xong. Trước khi uống, phải dùng hai tay cung kính nâng ly nước cao ngang lông mày, hướng mặt về phía tượng/ảnh Bồ Tát. Đọc lời khấn, sau đó nhắm mắt lại và quán tưởng (tưởng tượng) hình ảnh Bồ Tát đang dùng bình tịnh thủy rót nước từ từ xuống đỉnh đầu của mình, dòng nước chảy xuyên suốt và lan tỏa khắp toàn bộ cơ thể, gột rửa mọi bệnh tật.

---

## Owner module

`altar-management` — AltarService / VisualizationEngine
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người quán tưởng
- `system` — camera detection + timer + meditation voice guide

---

## Trigger

Sau khi user confirm No-Direct-Contact Protocol, step Visualization kích hoạt

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User nhâm mắt + camera detect 2 tay nâng cao | ✅ Timer 10s countdown |
| User niệm 1 biến Chú Đại Bi (optional) | ✅ Enhanced merit |
| Timer hết 10s | ✅ Nút `[Uống Ngay]` enable |
| User click `[Uống Ngay]` | ✅ Mark completion |

---

## Input Contract

```typescript
interface VisualizationSessionDto {
  waterId: string
  closedEyes: boolean               // Camera: both eyes closed
  handsRaisedHigh: boolean          // Camera: hands holding cup high
  chantedMantra: boolean            // Optional: niệm Chú Đại Bi
  visualizationDuration: number     // seconds
}

interface VisualizationResult {
  success: boolean
  meritsAccumulated: number
  nextStep: 'DRINK'
}
```

---

## Write Path

```
POST /api/altar-management/water/visualization-complete

--- FE Flow: Meditation Phase ---

1. Display meditation overlay:
   "Đặt điện thoại xuống. Nâng ly nước cao ngang lông mày.
    Nhắm mắt lại.

    Quán tưởng: Quán Thế Âm Bồ Tát đang dùng bình tịnh thủy
    rót nước từ từ xuống đỉnh đầu bạn...

    Dòng nước chảy xuyên suốt cơ thể, gột rửa mọi bệnh tật."

2. Start 10-second countdown timer:
   - Camera front-facing checks if eyes are closed
   - Optional: play meditation music / Chú Đại Bi audio
   - If User taps screen before timer ends → restart

3. After 10 seconds:
   - Soft meditation bell sound
   - Enable button `[Uống Ngay]`
   - Optional prompt: "Bạn đã niệm Chú Đại Bi chưa?"

4. User click `[Uống Ngay]`:
   a. Record visualization session
   b. Audit: altar.water.visualization_completed
   c. Return merits (base 1, +1 if chanted)
   d. Transition to consumption logging

```

---

## FE Behavior

### Meditation Screen (10s Visualization)

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│               🧘 Bước Quán Tưởng 🧘                   │
│                                                        │
│ Nhắm mắt lại.                                          │
│                                                        │
│ Quán tưởng: Quán Thế Âm Bồ Tát đang rót nước         │
│ từ từ xuống đỉnh đầu bạn. Dòng nước chảy xuyên        │
│ suốt cơ thể, sáng suốt tâm thức, gột rửa bệnh tật.   │
│                                                        │
│              ⏳ Còn lại: 00:08                         │
│                                                        │
│ (Meditation music plays softly in background)         │
│                                                        │
│         [Hủy]                                          │
└────────────────────────────────────────────────────────┘
```

### After Countdown Complete

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│ 🔔 (Soft bell sound)                                  │
│                                                        │
│ Bạn đã hoàn tất bước quán tưởng.                      │
│                                                        │
│ 🌟 Tích lũy: +1 Merit                                 │
│                                                        │
│ Bạn có niệm Chú Đại Bi không?                         │
│ [ ] Có, tôi đã niệm [+1 extra merit]                  │
│                                                        │
│              [Uống Ngay]                              │
└────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model VisualizationSession {
  id                      String   @id @default(cuid())
  userId                  String
  waterId                 String
  closedEyes              Boolean
  handsRaised             Boolean
  chantedMantra           Boolean
  durationSeconds         Int      @default(10)
  meritsAccumulated       Int      @default(1)
  completedAt             DateTime @default(now())
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.water.visualization_started` | Bước quán tưởng bắt đầu |
| `altar.water.visualization_completed` | Hoàn tất 10s countdown |
| `altar.water.mantra_chanted` | User xác nhận niệm Chú |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Visualization incomplete | `visualization_incomplete` | 400 |

---

## Notes for AI/codegen

- 10s countdown là bắt buộc, không skip được
- Camera detect eyes closed là advisory, không block (user có thể cheat, nhưng lợi ích là của họ)
- Chú Đại Bi optional → +1 merit bonus
- Meditation music recommend để tăng focus

---

## Related

- [no-direct-contact-protocol.md](./no-direct-contact-protocol.md) — Sang chiết nước
- [thermal-water-bath-constraint.md](./thermal-water-bath-constraint.md) — Làm ấm nước

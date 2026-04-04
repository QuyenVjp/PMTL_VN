# Phong Ấn Tụng Niệm Khi Tạm Dừng — Pause Mantra Seal

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Tạm dừng niệm kinh không phải là hành động tức thì. Phải niệm *Ông Lai Mu Suo He* (嗡來牟梭訶) 1 biến để phong ấn (seal) phiên niệm trước khi ngắt. Tương tự, khi tiếp tục cũng cần niệm lại để mở phiên. Không phong ấn đúng cách = năng lượng niệm bị phân tán.

---

## Owner module

`content` — RecitationService / PauseProtocol
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — đang niệm kinh và cần tạm dừng
- `system` — intercept Pause button, demand mantra confirmation

---

## Trigger

Khi user nhấn nút `[Pause]` trong lúc recitation session đang active.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User nhấn Pause | ⏸️ Không tạm dừng ngay |
| Modal hiện: yêu cầu niệm phong ấn | ✅ Disable counter, show modal |
| User check "Đã niệm xong" | ✅ Enable [Xác Nhận Tạm Dừng] |
| User confirm pause | ✅ Session saved, state = PAUSED |
| User nhấn Resume | ⏸️ Tương tự: yêu cầu niệm khai mở |
| User confirm resume | ✅ Counter resumes |

---

## Input Contract

```typescript
interface RecitationSessionState {
  status: 'ACTIVE' | 'PAUSED_PENDING' | 'PAUSED' | 'RESUMED'
  mantraCount: number
  pauseRequestedAt?: DateTime
  completionMantraRecited?: boolean
  pausedAt?: DateTime
}

const PAUSE_MANTRA = 'Ông Lai Mu Suo He'  // 嗡來牟梭訶

async function requestPause(sessionId: string): Promise<void> {
  // Lock to PAUSED_PENDING
  // Show completion mantra modal
  // Only transition to PAUSED after user confirms
}
```

---

## Write Path

```
POST /api/content/recitation/pause
1. Set session.status = PAUSED_PENDING
2. Return { requiresMantra: true, mantra: '嗡來牟梭訶' }
3. FE shows modal — user confirms recitation
4. POST /api/content/recitation/pause/confirm
   → status = PAUSED, pausedAt = now()
   → Audit: session.officially_paused

POST /api/content/recitation/resume
1. Set session.status = RESUME_PENDING
2. Return { requiresMantra: true, mantra: '嗡來牟梭訶' }
3. FE shows modal — user confirms
4. POST /api/content/recitation/resume/confirm
   → status = ACTIVE
   → Audit: session.officially_resumed
```

---

## FE Behavior

```
Đang niệm kinh: 127 biến

[Pause]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

完成咒 — Phong Ấn Tạm Dừng

Hãy niệm "Ông Lai Mu Suo He" 1 biến
để phong ấn phiên niệm.

[ ] Tôi đã niệm xong

[Hủy]  [Xác Nhận Tạm Dừng]
(button disabled until checked)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(Sau khi pause, user nhấn Resume:)

開啟咒 — Mở Lại Phiên Niệm

Hãy niệm "Ông Lai Mu Suo He" 1 biến
để khai mở lại phiên niệm.

[ ] Tôi đã niệm xong

[Tiếp Tục Niệm] (disabled until checked)
```

---

## Audit

| Action | Trigger |
|---|---|
| `session.pause_requested` | User clicks Pause |
| `session.mantra_required` | Lock modal shown |
| `session.mantra_confirmed_pause` | User confirms pause mantra |
| `session.officially_paused` | State saved as PAUSED |
| `session.resume_requested` | User clicks Resume |
| `session.mantra_confirmed_resume` | User confirms resume mantra |
| `session.officially_resumed` | Counter active again |

---

## Notes for AI/codegen

- Mantra text = "Ông Lai Mu Suo He" (Vietnamese romanization) = 嗡來牟梭訶 (Chinese).
- Không có nút bypass — user phải check modal để Pause/Resume.
- Session counter không increment trong lúc PAUSED_PENDING.

---

## Related

- [daily-recitation-system.md](../../wisdom-qa/USE_CASES/daily-recitation-system.md) — core recitation
- [88-buddhas-overnight-deadzone.md](../../wisdom-qa/USE_CASES/88-buddhas-overnight-deadzone.md) — time restrictions

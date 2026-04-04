# Khôi Phục Kinh Dài Bị Gián Đoạn — Long Sutra Interruption Recovery Gate

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Đọc kinh dài (Đại Bi, Tâm Kinh) là việc tập trung cao độ. Nếu bị gián đoạn (cuộc gọi điện thoại, khách đến) thì không thể tạm dừng bình thường mà phải niệm "Ông Lai Mu Suo He" (嗡來牟梭訶) để phong ấn (seal) phiên đọc. Khi tiếp tục, cũng phải niệm lại để mở khóa (unlock).

Kinh ngắn (Tâm Chư, Đơn Niệm) không hỗ trợ tạm dừng — phải khởi động lại từ đầu.

---

## Owner module

`content` — SutraInterruptionRecoveryGate / RecitationService
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — đang đọc kinh dài và bị gián đoạn
- `system` — detect pause/background, enforce recovery chant ritual

---

## Triggers

1. User nhấn `[Tạm Dừng]` trong session đọc kinh dài (long sutra).
2. App detects pause/background state (user minimize app, nhận cuộc gọi, chuyển tab).
3. User nhấn `[Tiếp Tục Đọc]` để resume.

---

## Business Rules

| Kinh | Behavior | Điều kiện |
|---|---|---|
| **Kinh Dài** (Đại Bi, Tâm Kinh, v.v.) | Hỗ trợ tạm dừng với recovery chant | Phải niệm "Ông Lai Mu Suo He" để khóa + mở khóa |
| **Kinh Ngắn** (Tâm Chư, Đơn Niệm) | KHÔNG hỗ trợ tạm dừng | Khi user tạm dừng → restart from beginning |

---

## Sutra Classification

### Long Sutras (Support Pause with Recovery Chant)

```typescript
const LONG_SUTRAS = [
  'DA_BI_KINH',           // Đại Bi Tâm Chúng
  'TAM_KINH',             // Tâm Bát Nhã Ba La Mật Đa Tâm Kinh
  'LOTUS_SUTRA',          // Bộ Pháp Hoa Niên
  'AMITABHA_SUTRA',       // A Di Đà Kinh
  // ... thêm theo cần
]

const RECOVERY_CHANT = 'Ông Lai Mu Suo He'  // 嗡來牟梭訶
```

### Short Sutras (Restart Only)

```typescript
const SHORT_SUTRAS = [
  'TAM_CHU_KINH',         // Tâm Chư
  'DON_NIEM',             // Đơn Niệm
  // ... thêm theo cần
]
```

---

## Pause Flow (Long Sutras)

```
User tạm dừng đọc Đại Bi Kinh (100/200 dòng)
        ↓
POST /api/content/sutras/:sutraId/pause
  Body: { pauseReason: 'PHONE_CALL' | 'VISITOR' | 'MANUAL' }
        ↓
Server: session.status = PAUSE_PENDING, session.recoveryChantLock = true
        ↓
FE: Modal hiện
┌─────────────────────────────────────────┐
│ Phong Ấn Kinh — Lock Recovery Chant    │
│                                         │
│ Hãy niệm "Ông Lai Mu Suo He"           │
│ (嗡來牟梭訶) 1 biến để khóa phiên.     │
│                                         │
│ [ ] Tôi đã niệm xong                   │
│                                         │
│ [Hủy]  [Xác Nhận Tạm Dừng]             │
│        (disabled until checked)         │
└─────────────────────────────────────────┘
        ↓
User checks + submits
        ↓
POST /api/content/sutras/:sutraId/pause/confirm
  Body: { recoveryChantRecited: true }
        ↓
Server: session.status = PAUSED, pausedAt = now()
Audit: content.sutra.interrupted
        ↓
Session saved: dòng 100/200 lưu trữ
```

---

## Resume Flow (Long Sutras)

```
User nhấn [Tiếp Tục Đọc]
        ↓
POST /api/content/sutras/:sutraId/resume
        ↓
Server: session.status = RESUME_PENDING, session.recoveryChantLock = true
        ↓
FE: Modal hiện
┌──────────────────────────────────────────┐
│ Khai Mở Kinh — Unlock Recovery Chant   │
│                                          │
│ Hãy niệm "Ông Lai Mu Suo He"            │
│ (嗡來牟梭訶) 1 biến để khai mở lại.    │
│                                          │
│ [ ] Tôi đã niệm xong                    │
│                                          │
│ [Tiếp Tục Đọc]                          │
│  (disabled until checked)                │
└──────────────────────────────────────────┘
        ↓
User checks + submits
        ↓
POST /api/content/sutras/:sutraId/resume/confirm
  Body: { recoveryChantRecitedAgain: true }
        ↓
Server: session.status = ACTIVE, resumedAt = now()
Audit: content.sutra.recovery-chant-confirmed, content.sutra.resumed
        ↓
Counter resumes from dòng 100/200
```

---

## Short Sutra Behavior

```
User tạm dừng đọc Tâm Chư
        ↓
System: Detect short sutra
        ↓
FE: Toast message (không modal)
┌─────────────────────────┐
│ Kinh ngắn phải đọc lại  │
│ từ đầu. [Khởi Động Lại] │
└─────────────────────────┘
        ↓
User click [Khởi Động Lại]
        ↓
POST /api/content/sutras/:sutraId/start-session
  Body: { restart: true }
        ↓
Server: session.status = ACTIVE, lineIndex = 0
Audit: content.sutra.short-restart-initiated
```

---

## Data Model

```prisma
model SutraSession {
  id                      String    @id @default(cuid())
  userId                  String
  sutraId                 String

  // Reading state
  status                  String    // ACTIVE | PAUSED | COMPLETED
  currentLineIndex        Int       @default(0)
  totalLines              Int

  // Pause metadata
  pausedAt                DateTime?
  pausedDuration          Int?      // in seconds
  pauseReason             String?   // PHONE_CALL | VISITOR | MANUAL

  // Recovery chant lock
  recoveryChantLock       Boolean   @default(false)
  recoveryChantRecited    Boolean   @default(false)
  recoveryChantConfirmedAt DateTime?

  // Timestamps
  startedAt               DateTime  @default(now())
  resumedAt               DateTime?
  completedAt             DateTime?
  updatedAt               DateTime  @updatedAt

  user                    User      @relation(fields: [userId], references: [id])
  sutra                   Sutra     @relation(fields: [sutraId], references: [id])

  @@index([userId, sutraId])
  @@index([status])
}
```

---

## API Endpoints

### Pause Session (Long Sutras Only)

```
POST /api/content/sutras/:sutraId/pause
Content-Type: application/json

Body:
{
  "pauseReason": "PHONE_CALL" | "VISITOR" | "MANUAL"
}

Response 200:
{
  "status": "PAUSE_PENDING",
  "recoveryChantRequired": true,
  "recoveryChant": "Ông Lai Mu Suo He",
  "message": "Hãy niệm 'Ông Lai Mu Suo He' (1 biến) để khóa Kinh"
}

Response 400:
{
  "code": "short_sutra_no_pause",
  "message": "Kinh ngắn không hỗ trợ tạm dừng. Vui lòng khởi động lại."
}
```

### Confirm Pause

```
POST /api/content/sutras/:sutraId/pause/confirm
Content-Type: application/json

Body:
{
  "recoveryChantRecited": true
}

Response 200:
{
  "status": "PAUSED",
  "pausedAt": "2026-04-04T10:30:00Z",
  "currentLineIndex": 100,
  "totalLines": 200
}
```

### Resume Session

```
POST /api/content/sutras/:sutraId/resume
Content-Type: application/json

Response 200:
{
  "status": "RESUME_PENDING",
  "recoveryChantRequired": true,
  "recoveryChant": "Ông Lai Mu Suo He",
  "message": "Hãy niệm 'Ông Lai Mu Suo He' (1 biến) để mở khóa"
}
```

### Confirm Resume

```
POST /api/content/sutras/:sutraId/resume/confirm
Content-Type: application/json

Body:
{
  "recoveryChantRecitedAgain": true
}

Response 200:
{
  "status": "ACTIVE",
  "resumedAt": "2026-04-04T10:35:00Z",
  "currentLineIndex": 100,
  "message": "Phiên đọc tiếp tục từ dòng 100/200"
}
```

### Start Session (New or Restart Short Sutra)

```
POST /api/content/sutras/:sutraId/start-session
Content-Type: application/json

Body (optional):
{
  "enableAudioMonitoring": false,  // linked to Logic 8
  "restart": false
}

Response 200:
{
  "sessionId": "session_xxx",
  "status": "ACTIVE",
  "currentLineIndex": 0,
  "totalLines": 150
}
```

---

## DTO Definitions

```typescript
// Pause Request
interface PauseSutraSessionDto {
  pauseReason: 'PHONE_CALL' | 'VISITOR' | 'MANUAL'
}

// Pause Confirmation
interface ConfirmPauseSutraSessionDto {
  recoveryChantRecited: boolean  // user must check box
}

// Resume Confirmation
interface ResumeSutraSessionDto {
  recoveryChantRecitedAgain: boolean  // user must check box again
}

// Start/Restart
interface StartSutraSessionDto {
  enableAudioMonitoring?: boolean
  restart?: boolean
}
```

---

## Audit

| Action | Trigger | Details |
|---|---|---|
| `content.sutra.interrupted` | User pauses long sutra | pauseReason logged |
| `content.sutra.recovery-chant-confirmed` | User confirms pause recovery chant | timestamp recorded |
| `content.sutra.resumed` | User resumes and confirms chant again | pausedDuration calculated |
| `content.sutra.short-restart-initiated` | User attempts pause on short sutra | auto-restart initiated |

---

## Error Handling

### 400 Errors

```typescript
enum SutraSessionErrorCode {
  RECOVERY_CHANT_REQUIRED = 'recovery_chant_required',
  SHORT_SUTRA_NO_PAUSE = 'short_sutra_no_pause',
  SESSION_NOT_FOUND = 'session_not_found',
  SESSION_NOT_PAUSED = 'session_not_paused',
  INVALID_SUTRA_TYPE = 'invalid_sutra_type',
}
```

---

## FE Component Spec

### Pause Lock Modal

```tsx
interface PauseLockModalProps {
  recoveryChant: string  // "Ông Lai Mu Suo He"
  isConfirming: boolean
  onConfirm: (confirmed: boolean) => void
  onCancel: () => void
}

// State: user must check [ ] before enabling [Xác Nhận Tạm Dừng]
```

### Resume Unlock Modal

```tsx
interface ResumeLockModalProps {
  recoveryChant: string
  isConfirming: boolean
  onConfirm: (confirmed: boolean) => void
}

// Similar to Pause but button text = "Tiếp Tục Đọc"
```

### Short Sutra Restart Toast

```tsx
interface ShortSutraToastProps {
  sutraName: string
  onRestart: () => void
}

// Non-dismissible until user clicks [Khởi Động Lại]
```

---

## Notes for AI/codegen

- **Long vs Short Detection:** Query Sutra type from `sutra.category` = LONG | SHORT.
- **Pause Lock State:** Once `recoveryChantLock = true`, counter does NOT increment until `recoveryChantRecited = true`.
- **Modal Persistence:** Pause/Resume lock modals do NOT auto-dismiss — user must check checkbox + click button.
- **Audit Trail:** Log both `pauseReason` and `pausedDuration` for analytics.
- **Error Message:** When user tries to pause short sutra, return 400 with code `short_sutra_no_pause` + user-friendly message.
- **Time Calculation:** `pausedDuration` = `resumedAt - pausedAt` in seconds.
- **Restart Semantic:** Short sutra "pause" = auto-transition to `[Khởi Động Lại]` flow, not shown as pause option.

---

## Related

- [pause-mantra-seal.md](./pause-mantra-seal.md) — Core pause/resume logic for mantra recitation
- [vocal-resonance-health-guard.md](./vocal-resonance-health-guard.md) — Volume monitoring (Phase 41 Logic 8)
- [ereader-anti-face-down.md](./ereader-anti-face-down.md) — Device orientation rules
- [memory-recitation-error-buffer.md](./memory-recitation-error-buffer.md) — Error tolerance in recitation

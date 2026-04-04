# Đốt Đại Hương Theo Nghi Thức Hoàn Toàn — Grand Incense State Machine

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Nghi thức thắp hương gỗ đàn hương / Đại Hương
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Gỗ đàn hương (Grand Incense / Đại Hương) là vật thiêng liêm, chỉ được đốt trên **Mùng 1 / Rằm / Ngày Vía** lịch âm,
và phải tuân theo **nghi thức cứng** gồm:

1. **Thắp đèn dầu + nhang thường trước**
2. **Châm gỗ đàn hương vào đèn dầu, sau đó PHẨY TAY cho tắt lửa (TUYỆT ĐỐI CẤM thổi bằng miệng)**
3. **Lặp lại chính xác 3 lần**

Hệ thống sử dụng **state machine** để:
- **Ẩn button [Đốt Đại Hương]** trên các ngày bình thường.
- **Mở button + hiển thị ritual checklist** trên Auspicious Days.
- **Block submit** nếu user chưa confirm tất cả ritual steps.

---

## Owner module

`altar-management` — [xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — khi attempt burn sandalwood via POST /api/altar-management/grand-incense/burn
- `system` — validate auspicious day, enforce ritual checklist, manage state machine, audit

---

## Trigger

User bấm **[Đốt Đại Hương]** button (hoặc attempt POST /api/altar-management/grand-incense/burn).

---

## Preconditions

- User đã đăng nhập và có `memberProfile` hợp lệ.
- Có `UserAltarProfile` setup.
- Có gỗ đàn hương sẵn có (hoặc unlimited supply mặc định).

---

## Input contract

```typescript
BurnGrandIncenseDto {
  auspiciousDayConfirmed:   boolean
  ritualStepsCompleted: {
    lampLit:              boolean   // Đã thắp đèn dầu + nhang thường
    handFanned3Times:     boolean   // Đã phẩy tay cho tắt lửa 3 lần, không thổi miệng
  }
}
```

---

## State Machine — UI Visibility & Form State

### State A: Regular Day (Mon–Sun, except Auspicious Days)

**[Đốt Đại Hương] button:** HIDDEN

- FE checks `GET /api/altar-management/grand-incense/can-burn?date=today`.
- Response: `{ canBurn: false, reason: "not_auspicious_day", nextAuspiciousDate: "2026-04-08" }`.
- Button không render hoặc render disabled với tooltip: *"Gỗ đàn hương chỉ được đốt vào Mùng 1, Rằm, hoặc Ngày Vía. Ngày tiếp theo hợp lệ: 2026-04-08 (Rằm âm lịch)."*

### State B: Auspicious Day

**[Đốt Đại Hương] button:** VISIBLE & ENABLED

- FE checks `GET /api/altar-management/grand-incense/can-burn?date=today`.
- Response: `{ canBurn: true, auspiciousDayType: "LUNAR_15TH", requiresChecklist: true }`.
- Button text: **[Đốt Đại Hương]** (thay vì [Đốt Đại Hương - Không khả dụng])
- Khi user bấm → modal ritual checklist hiện lên (xem Step 2 bên dưới).

---

## Write path — Validation & Ritual Enforcement

### Gate 1: Auspicious Day Verification

1. **Check today's date against auspicious calendar:**
   - Nếu `date` là Mùng 1, Rằm, hoặc Buddha Holy Day → `isAuspiciousDay = true`
   - Nếu không → **HARD BLOCK**:
     ```json
     {
       "error": "grand_incense_not_auspicious_day",
       "code": "403",
       "message": "Gỗ đàn hương chỉ được đốt vào Mùng 1, Rằm, hoặc Ngày Vía. Vui lòng chọn ngày hợp lệ.",
       "nextAuspiciousDate": "2026-04-08"
     }
     ```

### Gate 2: Ritual Checklist Validation

2. **Parse `ritualStepsCompleted`:**
   ```typescript
   z.object({
     auspiciousDayConfirmed: z.boolean(),
     ritualStepsCompleted: z.object({
       lampLit: z.boolean(),
       handFanned3Times: z.boolean()
     })
   })
   ```

3. **Check all ritual steps confirmed:**
   - Verify `lampLit === true` (Đã thắp đèn dầu + nhang thường)
   - Verify `handFanned3Times === true` (Đã phẩy tay 3 lần, không thổi miệng)
   - Verify `auspiciousDayConfirmed === true` (Xác nhận ngày Vía)

4. **Nếu ANY step is `false`:**
   ```json
   {
     "error": "grand_incense_ritual_incomplete",
     "code": "400",
     "message": "Vui lòng hoàn thành tất cả bước nghi thức trước khi đốt gỗ đàn hương.",
     "missingSteps": ["lampLit", "handFanned3Times"],
     "severity": "RITUAL_BLOCK"
   }
   ```

### Gate 3: Create Grand Incense Session

5. Tạo `GrandIncenseSession` record:
   ```prisma
   GrandIncenseSession {
     id:                           String @id
     userId:                       String
     date:                         DateTime

     // Ritual completion timestamps
     burnedAt:                     DateTime?
     ritualStepsConfirmedAt:       DateTime  // khi user confirm ritual

     // Ritual details
     lampLitConfirmedAt:           DateTime?
     handFanned3TimesConfirmedAt:  DateTime?

     // Audit trail
     createdAt:                    DateTime
     updatedAt:                    DateTime
   }
   ```

6. Set:
   - `ritualStepsConfirmedAt = now()`
   - `burnedAt = now()`

7. Audit:
   - `altar.grand-incense.unlocked-auspicious-day` (khi button first appears)
   - `altar.grand-incense.ritual-complete` (khi user confirms all steps)

### Gate 4: Return Success

8. Return success response:
   ```json
   {
     "success": true,
     "data": {
       "sessionId": "uuid",
       "date": "2026-04-04",
       "auspiciousDayType": "LUNAR_15TH",
       "burnedAt": "2026-04-04T14:32:00Z",
       "ritualStepsCompleted": {
         "lampLit": true,
         "handFanned3Times": true
       },
       "message": "Ghi nhận đốt gỗ đàn hương hôm Rằm âm lịch. Chúc bạn lợi ích vô lượng!"
     }
   }
   ```

---

## FE Behavior — Ritual Checklist Modal

### Step 1: Button Visibility (Regular Day → Auspicious Day)

**Regular Day:**
- Button [Đốt Đại Hương] render nhưng DISABLED.
- Tooltip: *"Gỗ đàn hương chỉ được đốt vào Mùng 1, Rằm, hoặc Ngày Vía."*
- Hoặc ẩn hoàn toàn nếu UX design không muốn confuse user.

**Auspicious Day:**
- Button [Đốt Đại Hương] render ENABLED.
- Badge icon (star/⭐) bên cạnh để nổi bật.

### Step 2: Modal Opens on Button Click

Khi user bấm [Đốt Đại Hương]:

**Modal Title:** *"Nghi Thức Đốt Gỗ Đàn Hương"*

**Modal Content (Checklist):**

```
⭐ Hôm nay là Rằm âm lịch — ngày thích hợp để đốt gỗ đàn hương

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BƯỚC 1: Chuẩn bị
[ ] Đã thắp đèn dầu và nhang thường

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BƯỚC 2: Đốt Gỗ Đàn Hương (lặp lại 3 lần)
[ ] Châm thanh gỗ đàn hương vào đèn dầu, sau đó PHẨY TAY cho tắt lửa (TUYỆT ĐỐI CẤM dùng miệng thổi) để khói bay ra. Lặp lại đúng 3 lần.

⚠️  CẢNH BÁO:
Tuyệt đối KHÔNG thổi bằng miệng, chỉ PHẨY TAY để tắt lửa. Đây là quy tắc linh thiêng của pháp môn.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] Tôi xác nhận đã hoàn thành đúng nghi thức trên

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Huỷ]  [Xác Nhận Đốt]
```

### Step 3: Checkbox Interaction

- 3 checkboxes là **mandatory** — user phải tick tất cả 3 để active [Xác Nhận Đốt].
- [Xác Nhận Đốt] button disabled đến khi tất cả 3 checkboxes ticked.
- Khi user tick checkbox cuối → [Xác Nhận Đốt] sáng lên.

### Step 4: Submit Handler

Khi user bấm [Xác Nhận Đốt]:

1. FE POST `/api/altar-management/grand-incense/burn` với payload:
   ```json
   {
     "auspiciousDayConfirmed": true,
     "ritualStepsCompleted": {
       "lampLit": true,
       "handFanned3Times": true
     }
   }
   ```

2. API response handling:
   - **Success (200):** Close modal, show success toast: *"Ghi nhận đốt gỗ đàn hương. Chúc bạn tu tập an lạc!"*
   - **Error 403 (not_auspicious_day):** Show red error modal: *"Hôm nay không phải Ngày Vía. Vui lòng chọn ngày Mùng 1 hoặc Rằm."*
   - **Error 400 (ritual_incomplete):** Show warning modal: *"Vui lòng hoàn thành tất cả bước nghi thức."* + Highlight unchecked boxes (FE side).

---

## Warning Copy — Hand-Fanning Requirement

**Critical instruction** (NOT dismissible):

```
⚠️  TUYỆT ĐỐI CẤM THỔI BẰNG MIỆNG
Chỉ dùng PHẨY TAY để tắt lửa trên gỗ đàn hương.
Thổi bằng miệng làm ô uế hơi thở, phá vỡ nghi thức.
```

This message is **static, bold, red, and appears above the checkbox** — không dismissible, không hide được.

---

## Errors

| Condition | Error code | HTTP | Message |
|---|---|---|---|
| Date không phải Auspicious Day | `grand_incense_not_auspicious_day` | 403 | "Gỗ đàn hương chỉ được đốt vào Mùng 1, Rằm, hoặc Ngày Vía." |
| Ritual steps chưa complete | `grand_incense_ritual_incomplete` | 400 | "Vui lòng hoàn thành tất cả bước nghi thức trước khi đốt gỗ đàn hương." |
| `auspiciousDayConfirmed = false` | `grand_incense_ritual_incomplete` | 400 | "Vui lòng xác nhận Ngày Vía." |
| User không đăng nhập | `unauthorized` | 401 | — |
| No altar profile | `altar_profile_not_found` | 404 | "Vui lòng setup bàn thờ trước khi đốt gỗ đàn hương" |

---

## Audit

| Action | Trigger | Severity |
|---|---|---|
| `altar.grand-incense.unlocked-auspicious-day` | Button becomes visible (FE side, optional) | INFO |
| `altar.grand-incense.ritual-complete` | User successfully confirms all ritual steps | INFO |
| `altar.grand-incense.ritual-failed` | User attempts to burn without completing ritual | WARN |
| `altar.grand-incense.burned` | GrandIncenseSession created with burnedAt timestamp | INFO |

---

## Rate-limit requirement

- **No rate limit** on burn attempts.
- However, if same user attempts to burn >10 times in 24 hours → optional flag for admin review (not blocking).

---

## Schema Notes for AI/codegen

```prisma
model GrandIncenseSession {
  id                        String   @id @default(cuid())
  userId                    String
  user                      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  date                      DateTime // ngày đốt

  // Ritual completion tracking
  ritualStepsConfirmedAt    DateTime // khi user confirm all steps
  burnedAt                  DateTime // khi record được tạo (thời gian actual burn)

  // Individual step confirmations (optional, for detailed audit)
  lampLitConfirmedAt        DateTime?
  handFanned3TimesConfirmedAt DateTime?

  // Metadata
  auspiciousDayType         String?  // "LUNAR_1ST" | "LUNAR_15TH" | "BUDDHA_HOLY_DAY"

  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt

  @@index([userId, date])
}

// Optional: Track ritual verification service
service GrandIncenseRitualVerifier {
  isAuspiciousDay(date: DateTime): Promise<{ isAuspicious: boolean, type?: string }>
  validateRitualSteps(dto: BurnGrandIncenseDto): Result<void, ValidationError>
}
```

---

## Related

- [altar-hardware-upgrade-protocol.md](./altar-hardware-upgrade-protocol.md) — Incense stick requirements on Auspicious Days (companion logic)
- [grand-incense-reuse-protocol.md](../../../vows-merit/USE_CASES/grand-incense-reuse-protocol.md) — Reusing sandalwood ash
- [schedule-altar-lamp-reminder.md](../../../vows-merit/USE_CASES/schedule-altar-lamp-reminder.md) — Lamp-Incense sync
- [altar-offerings-guide.md](../../../content/USE_CASES/altar-offerings-guide.md) — General altar offering practices

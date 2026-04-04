# Khóa Chữ Ký Trước Đọc Kinh — Pre-Recitation Signature Lock

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Trước khi đọc kinh cho người quá cố (NNN), **BẮT BUỘC phải khai báo rõ "Người Tặng" (Người tế độ)** để năng lượng công đức được ghi nhận chính xác. Tên người tặng là chữ ký thiêng liêng của buổi cầu siêu. **KHÔNG được bỏ trống.**

---

## Owner module

`engagement` — PreRecitationSignatureGate
`content` — SutraSessionValidator

---

## Actors

- `member` — khai báo tên người tặng trước đọc kinh
- `system` — enforce mandatory OfferedBy field, hide Date until completion, lock button state

---

## Trigger

Khi user POST `/api/content/sutras/start-session` với littleHouseId để bắt đầu đọc kinh.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Start recitation without OfferedBy | ❌ 400 offered_by_required |
| OfferedBy field is empty/null | ❌ Button [Bắt đầu Đếm Kinh] disabled |
| OfferedBy has valid text (>= 1 char) | ✅ Button enabled |
| Recitation in progress | ✅ Date field hidden |
| completionPercentage = 100 | ✅ Date revealed, auto-populated with today |
| Recitation complete | ✅ dateCompleted = today (auto) |

---

## Input Contract

```typescript
interface StartSutraSessionDto {
  littleHouseId: string
  offeredByName: string     // MANDATORY, non-empty
}

interface SutraSession {
  id: string
  littleHouseId: string
  littleHouse: LittleHouse
  offeredByName: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  completionPercentage: number  // 0–100
  dateCompleted: DateTime?
  createdAt: DateTime
  updatedAt: DateTime
}

interface LittleHouse {
  // ... existing fields
  offeredByName: string          // MANDATORY before recitation
  completionPercentage: number   // 0–100
  dateCompleted: DateTime?       // auto-set when 100%
}
```

---

## Write Path

### Start Recitation Session

```
POST /api/content/sutras/start-session
Body: {
  littleHouseId: "lh_xyz",
  offeredByName: "Nguyễn Văn A"
}

1. Fetch LittleHouse by littleHouseId
2. Validate offeredByName:
   → If empty/null/whitespace:
      • return 400 offered_by_required
      • Message: "Vui lòng khai báo tên người tặng trước khi bắt đầu đọc kinh"
   → If valid (non-empty):
      • Trim and normalize name
      • Proceed
3. Create SutraSession:
   → offeredByName = (trimmed value)
   → status = IN_PROGRESS
   → completionPercentage = 0
   → dateCompleted = null
4. Update LittleHouse:
   → offeredByName = (same value)
   → completionPercentage = 0
5. Audit: lh.recitation.signature-validated, lh.recitation.started
6. Response: { sutraSessionId, offeredByName, completionPercentage: 0, ... }
```

### Update Recitation Progress

```
PATCH /api/content/sutras/session/:sessionId
Body: {
  completionPercentage: number  // 0–100
}

1. Fetch SutraSession by sessionId
2. Validate completionPercentage in range [0, 100]
3. Update SutraSession:
   → completionPercentage = new value
   → If new value = 100:
      • status = COMPLETED
      • dateCompleted = today()
      • Audit: lh.recitation.completed-100-percent
4. Update linked LittleHouse:
   → completionPercentage = new value
   → If new value = 100:
      • dateCompleted = today()
5. Response includes updated state + dateCompleted if 100%
```

### Get Recitation Status

```
GET /api/content/sutras/session/:sessionId

1. Fetch SutraSession
2. Return:
   {
     offeredByName: string
     completionPercentage: number
     dateCompleted: DateTime | null
     showDateField: completionPercentage === 100
   }
```

---

## FE Behavior

### Before Recitation Starts

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    📿 CHUẨN BỊ ĐỌC KINH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Người Tặng (Người Tế Độ):

[_________________________]
(Bắt buộc nhập trước khi bắt đầu)

Ngày Cầu Siêu:
(Sẽ hiển thị sau khi đọc xong)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Quay lại]  [Bắt đầu Đếm Kinh] (disabled)
```

### Input Validation (FE)

```
When user types in "Người Tặng" field:

- Disable button if field empty
- Enable button once >= 1 character entered
- Trim whitespace on submit
- Max 255 characters (per schema)
```

### During Recitation

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    📿 ĐANG ĐỌC KINH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Người Tặng: Nguyễn Văn A
(locked, not editable during session)

Tiến độ: 45%
████████░░░░░░░░░░░

Ngày Cầu Siêu:
(hidden - not shown until complete)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Tạm Dừng]  [Tiếp Tục Đọc]
```

### On 100% Completion

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ✅ HOÀN THÀNH ĐỌC KINH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Người Tặng: Nguyễn Văn A
(locked, not editable)

Tiến độ: 100%
████████████████████

Ngày Cầu Siêu:
[2026-04-04] (auto-filled, locked)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Công đức cầu siêu đã ghi nhận.

[← Quay lại]  [Hoàn Tất]
```

---

## Schema Notes

```prisma
model SutraSession {
  id                      String    @id @default(cuid())
  littleHouseId           String    @unique
  littleHouse             LittleHouse @relation(fields: [littleHouseId], references: [id], onDelete: Cascade)
  offeredByName           String    @db.VarChar(255)  // MANDATORY
  status                  String    @default("NOT_STARTED")
  completionPercentage    Int       @default(0)  // 0–100
  dateCompleted           DateTime?
  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt

  @@index([littleHouseId])
  @@index([status])
}

model LittleHouse {
  // ... existing fields
  offeredByName           String    @db.VarChar(255)  // MANDATORY before recitation
  completionPercentage    Int       @default(0)  // 0–100
  dateCompleted           DateTime?
}
```

---

## Audit

| Action | Trigger | Context |
|---|---|---|
| `lh.recitation.signature-validated` | offeredByName successfully set | Session starts |
| `lh.recitation.started` | SutraSession created, IN_PROGRESS | Button pressed |
| `lh.recitation.completed-100-percent` | completionPercentage reaches 100 | Session complete |

---

## Error Handling

| Code | Status | Message | Recovery |
|---|---|---|---|
| `offered_by_required` | 400 | Vui lòng khai báo tên người tặng trước khi bắt đầu đọc kinh | Enter non-empty name in OfferedBy field |
| `invalid_completion_percentage` | 400 | Tiến độ phải nằm trong khoảng 0–100 | Provide valid percentage |
| `little_house_not_found` | 404 | NNN không tìm thấy | Verify littleHouseId is correct |
| `recitation_already_completed` | 400 | Đọc kinh đã hoàn thành, không thể chỉnh sửa | Start new session if needed |

---

## Notes for AI/codegen

- **Mandatory field:** offeredByName MUST be non-empty before starting recitation. Hard 400 block if missing.
- **Button state:** [Bắt đầu Đếm Kinh] is disabled until OfferedBy has text. Validate on both FE and BE.
- **Date field visibility:** Date is HIDDEN during recitation (completionPercentage < 100), SHOWN when 100%, auto-populated with today's date.
- **Read-only after start:** Once recitation begins, offeredByName is locked and cannot be edited.
- **Auto-completion:** When completionPercentage reaches 100, dateCompleted automatically becomes today's date.
- **Name normalization:** Trim whitespace on both sides; max 255 characters per DB schema.

---

## Related

- [spiritual-merit-counter.md](./spirit-merit-counter.md) — track cumulative merit from recitations
- [recitation-completion-attestation.md](./recitation-completion-attestation.md) — proof of recitation
- [burn-container-sanitization-protocol.md](./burn-container-sanitization-protocol.md) — post-recitation cleanup

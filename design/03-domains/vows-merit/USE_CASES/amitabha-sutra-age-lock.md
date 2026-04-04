# Rào Chắn Tuổi Cho Kinh A Di Đà — Amitabha Sutra Age Lock

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Thọ Mệnh Ổn Định)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Kinh A Di Đà (Amitabha Sutra) là công đức nâng cao thọ mệnh, dành cho những người có nền tảng tu tập vững chắc và có thọ mệnh ổn định. Những người trẻ (dưới 60 tuổi) chưa có kinh nghiệm tu tập sâu thường tập trung vào Tâm Kinh và Chú Đại Bi trước, để xây dựng nền tảng tín tâm và định lực. Mục đích của rule này là cảnh báo (ADVISORY) mà không chặn, để khuyến khích người trẻ theo hướng dẫn mà vẫn tôn trọng quyết định cuối cùng của họ.

---

## Owner module

`vows-merit` — AmitabhaSutraAgeGate
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người bắt đầu phiên tụng niệm Kinh A Di Đà
- `system` — kiểm tra độ tuổi, hiển thị yellow warning advisory

---

## Trigger

Khi user gọi `POST /api/content/sutras/amitabha/start-session` để bắt đầu phiên tụng niệm Kinh A Di Đà.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| `user.profile.age >= 60` | ✅ ALLOWED — không cần cảnh báo |
| `user.profile.age < 60` | ⚠️ ADVISORY — trả về 200 + ageWarning object, hiển thị yellow banner |
| User dismiss warning | ✅ ALLOWED — quyết định cuối thuộc user |

---

## Input Contract

```typescript
interface StartAmitabhaSutraSessionDto {
  userId: string
  sessionDate?: Date
}

interface MemberAgeContext {
  age: number
  userId: string
}

interface AgeWarningResponse {
  success: true
  data: {
    sessionId: string
    ageWarning: {
      code: 'amitabha_age_advisory'
      severity: 'WARNING'
      message: string  // "Bạn chưa đủ 60 tuổi. Theo Pháp Môn, Kinh A Di Đà thường dành cho thọ mệnh ổn định. Bạn vẫn có thể tiếp tục, nhưng khuyến khích tập trung Tâm Kinh trước."
      acknowledged: false
    }
  }
}
```

---

## Write Path

```
POST /api/content/sutras/amitabha/start-session

1. Load user.profile.age
2. Create AmitabhaSutraSession record
3. If age < 60:
   a. Return 200 with ageWarning object: {
        code: 'amitabha_age_advisory',
        severity: 'WARNING',
        message: 'Bạn chưa đủ 60 tuổi. Theo Pháp Môn, Kinh A Di Đà thường dành cho thọ mệnh ổn định. Bạn vẫn có thể tiếp tục, nhưng khuyến khích tập trung Tâm Kinh trước.',
        acknowledged: false
      }
   b. Audit: vow.amitabha.age-warning-shown
4. If age >= 60:
   a. Return 200 without ageWarning
```

---

## FE Behavior

```
┌──────────────────────────────────────────────────────┐
│ ⚠️  Cảnh Báo Trước Khi Bắt Đầu                      │
│──────────────────────────────────────────────────────│
│ Bạn chưa đủ 60 tuổi. Theo Pháp Môn, Kinh A Di Đà   │
│ thường dành cho thọ mệnh ổn định. Bạn vẫn có thể   │
│ tiếp tục, nhưng khuyến khích tập trung Tâm Kinh    │
│ trước.                                              │
│                                                     │
│ ☐ Tôi hiểu khuyến cáo và muốn tiếp tục            │
│                                                     │
│ [Tiếp Tục]   [Chọn Tâm Kinh Thay Vào]              │
└──────────────────────────────────────────────────────┘
```

- Checkbox `☐ Tôi hiểu khuyến cáo và muốn tiếp tục` — user phải check trước khi bấm "Tiếp Tục"
- Nút `[Tiếp Tục]` → khởi động session, log `vow.amitabha.proceeded-despite-warning`
- Nút `[Chọn Tâm Kinh Thay Vào]` → redirect sang mantra selection page
- Banner màu YELLOW (advisory), không chặn
- Không trả về 4xx

---

## Schema Notes

```prisma
model AmitabhaSutraSession {
  id          String   @id @default(cuid())
  userId      String
  createdAt   DateTime @default(now())
  endedAt     DateTime?
  ageAtStart  Int      // lưu tuổi tại thời điểm bắt đầu
  ageWarningAck Boolean @default(false)  // user acknowledged warning

  @@index([userId])
  @@index([createdAt])
}

// Migration:
// CREATE TABLE "AmitabhaSutraSession" (
//   "id" TEXT NOT NULL PRIMARY KEY,
//   "userId" TEXT NOT NULL,
//   "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
//   "endedAt" DATETIME,
//   "ageAtStart" INTEGER NOT NULL,
//   "ageWarningAck" BOOLEAN NOT NULL DEFAULT false
// );
// CREATE INDEX "AmitabhaSutraSession_userId_idx" ON "AmitabhaSutraSession"("userId");
// CREATE INDEX "AmitabhaSutraSession_createdAt_idx" ON "AmitabhaSutraSession"("createdAt");
```

---

## Audit

| Action | Trigger |
|---|---|
| `vow.amitabha.age-warning-shown` | User < 60 tuổi bắt đầu phiên, system hiển thị warning |
| `vow.amitabha.proceeded-despite-warning` | User confirm checkbox và bấm "Tiếp Tục" |
| `vow.amitabha.redirected-to-heart-sutra` | User bấm "Chọn Tâm Kinh Thay Vào" |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Không có lỗi — chỉ advisory warning | `amitabha_age_advisory` | 200 + ageWarning |

---

## Notes for AI/codegen

- Rule này là ADVISORY (soft-block) — không bao giờ trả về 4xx hay block cứng
- Age được lấy từ `user.profile.birthDate` → calculate tuổi
- ageWarning object được trả về cùng với sessionId trong response payload
- FE phải render yellow banner, không phải red alert
- Checkpoint `ageWarningAck` để track user acknowledgment
- Phase 2+: Có thể kết hợp với merit multiplier system — nếu user < 60 tụng Kinh A Di Đà thì merit factor có thể giảm

---

## Related

- [lifespan-mantra-age-gate.md](./lifespan-mantra-age-gate.md) — similar age-based advisory cho Chú Trường Thọ
- [create-prayer-session-with-merit-transfer.md](./create-prayer-session-with-merit-transfer.md) — prayer session creation pattern

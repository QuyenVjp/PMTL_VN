# Cấm Gộp Chung Lời Cầu Xin — Prayer Request Specificity & Anti-Greed Validator

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Đặc Thù Nguyện Lực Sâu Xa
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi phát nguyện/cầu xin trước bàn thờ, không được nói câu chung chung như "cầu cho cả nhà khoẻ mạnh bình an" hay "cầu mọi việc suôn sẻ". Lời cầu xin phải **cụ thể cho một người đơn lẻ và một sự việc đơn lẻ**, tối đa không quá **2-3 việc** trong một lần khấn. Cầu xin càng cụ thể và tập trung, nguyện lực sẽ càng linh ứng. Nếu cầu xin quá chung chung hoặc quá tham lam, nguyện lực sẽ yếu đi hoặc không linh ứng.

---

## Owner module

`vows-merit` — PrayerService / PrayerRequestValidator
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — Người dùng nhập lời cầu xin
- `system` — Kiểm tra validation, chặn lời cầu chung chung

---

## Trigger

User điền form `[Lời Cầu Xin]` trước khi bắt đầu niệm kinh hoặc đốt NNN, rồi bấm `[Xác nhận cầu xin]`.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Input 1 người + 1 việc cụ thể | ✅ ALLOWED |
| Input 2-3 việc riêng biệt (người giống, việc khác) | ✅ ALLOWED (max 3) |
| Input chứa từ chung chung: "cả nhà", "tất cả", "mọi người", "mọi việc" | ❌ REJECTED |
| Input > 3 việc | ❌ REJECTED |
| User submit form rỗng | ⚠️ WARNING (optional, not blocking) |

---

## Input Contract

```typescript
// Prayer Request Form
interface PrayerRequestInput {
  userId: string;
  prayers: {
    beneficiary: string;       // Tên người cầu cho (vd: "Mẹ tôi", "Bạn A")
    intention: string;         // Việc cầu (vd: "Cầu bệnh khỏi", "Cầu tìm việc")
  }[];                         // Array max 3 items
}

// Validation Response
interface PrayerValidationResponse {
  isValid: boolean;
  errors: {
    vaguePhrases: string[];    // Words like "cả nhà", "mọi người"
    tooManyIntentions: boolean;
    emptyFields: boolean;
  };
  message: string;
}
```

---

## Write Path

```
POST /api/vows-merit/prayer-requests/validate

1. Load payload (prayers array)
2. Validate:
   a. Check length:
      - If prayers.length > 3:
        → return 400 { error: "too_many_prayer_intentions", message: "Tối đa 3 việc cầu xin" }
   b. Check for vague phrases (regex):
      - vaguePhrases = ["cả nhà", "tất cả", "mọi người", "mọi việc", "mọi thứ"]
      - For each prayer, scan beneficiary + intention for vague phrases
      - If found:
        → return 400 { 
            error: "vague_prayer_request",
            message: "Luật PMTL cấm cầu xin qua loa, chung chung...",
            detectedPhrases: [...]
          }
   c. Check for empty fields:
      - If any beneficiary or intention is empty:
        → return 400 { error: "incomplete_prayer_request" }

3. If all valid:
   → Create PrayerRequest record
   → Return 200 { isValid: true, message: "Lời cầu xin của bạn đã được ghi nhận" }

4. Emit audit: "prayer.request.submitted"
```

---

## FE Behavior

```
USER OPENS PRAYER FORM

┌────────────────────────────────────────────┐
│  🙏 Lời Cầu Xin                           │
├────────────────────────────────────────────┤
│                                            │
│  📌 Quy tắc:                              │
│  • Cầu cụ thể cho 1 người (không "cả nhà")│
│  • 1 việc cụ thể (không "mọi việc")       │
│  • Tối đa 3 việc trong 1 lần              │
│                                            │
│  ─────────────────────────────────────────│
│  Việc cầu #1:                            │
│  Người: [Mẹ tôi________] (required)      │
│  Việc:  [Cầu bệnh khỏi_] (required)      │
│                                            │
│  ⊕ Thêm việc #2                          │
│  ⊕ Thêm việc #3                          │
│  (grayed out if 3 items exist)            │
│                                            │
│  [Huỷ]  [Xác nhận cầu xin]               │
└────────────────────────────────────────────┘

⬇️ User tries to submit with vague phrase ⬇️

Người: [Cả nhà tôi_____]
Việc:  [Cầu mọi việc suôn sẻ]

⬇️ Submit ⬇️

┌────────────────────────────────────────────┐
│  ❌ LỜI CẦU XIN KHÔNG HỢP LỆ              │
├────────────────────────────────────────────┤
│                                            │
│  Luật PMTL cấm cầu xin qua loa, chung    │
│  chung cho tất cả!                       │
│                                            │
│  🔍 Phát hiện:                            │
│  • "Cả nhà" → Phải cầu cụ cho 1 người   │
│  • "Mọi việc" → Phải cầu 1 việc cụ thể  │
│                                            │
│  💡 Ví dụ đúng:                          │
│  • "Mẹ tôi, cầu bệnh khỏi"              │
│  • "Anh tôi, cầu tìm việc"              │
│  • "Bà, cầu cơm ăn đủ" + "Cháu, cầu   │
│    học giỏi" + "Bố, cầu tiền nuôi nhà"  │
│    (tối đa 3 việc rõ ràng)               │
│                                            │
│  [Quay lại sửa]                          │
└────────────────────────────────────────────┘

⬇️ User corrects & re-submit ⬇️

Người: [Mẹ tôi_____]
Việc:  [Cầu bệnh khỏi]

✅ ACCEPTED

┌────────────────────────────────────────────┐
│  ✅ LỜI CẦU XIN ĐÃ ĐƯỢC GHI NHẬN          │
├────────────────────────────────────────────┤
│                                            │
│  Người cầu: Mẹ tôi                       │
│  Việc cầu:  Cầu bệnh khỏi                │
│                                            │
│  🌟 Nguyện lực của bạn sẽ được ghi       │
│     nhận và linh ứng cho người này.      │
│                                            │
│  [Tiếp tục niệm kinh]                    │
└────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model PrayerRequest {
  id            String @id @default(cuid())
  userId        String
  
  // JSON array to store multiple prayers
  prayers       Json  // [{ beneficiary: string, intention: string }]
  
  isValid       Boolean @default(true)
  validatedAt   DateTime @default(now())
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `prayer.request.submitted` | Lời cầu xin được ghi nhận |
| `prayer.request.rejected_vague` | Lời cầu xin bị reject do chung chung |
| `prayer.request.rejected_too_many` | Lời cầu xin bị reject do > 3 việc |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Vague phrases detected | vague_prayer_request | 400 |
| Too many intentions | too_many_prayer_intentions | 400 |
| Missing required fields | incomplete_prayer_request | 400 |

---

## Notes for AI/codegen

- Danh sách vague phrases nên live configurable (có thể thêm/sửa từ admin panel).
- Regex validation nên case-insensitive và trim whitespace.
- Max 3 prayers là hard limit.
- Có thể mở rộng: Detect cụm từ lợi tục ("cầu tiền nhiều", "cầu giàu nhanh") và warn user.

---

## Related

- [heavy-karma-activation-nnn-commitment-gate.md](../wisdom-qa/USE_CASES/heavy-karma-activation-nnn-commitment-gate.md) — Heavy karma validation

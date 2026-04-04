# Cảm Biến Chống Ép Buộc & Ngăn Chặn Khẩu Nghiệp — Anti-Coercion Guard & Tùy Duyên Wisdom

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Hệ Thống Quản Trị Phụng Sự Viên
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi Phụng sự viên hướng dẫn người mới hoặc hướng dẫn người nhà, nếu họ không tin hoặc phản đối, Phụng sự viên **tuyệt đối không được ép buộc hay tranh cãi**. Việc ép buộc sẽ khiến đối phương bực tức và phỉ báng Phật pháp, từ đó tạo ra "Khẩu nghiệp" cực nặng. Cách đúng đắn là dừng lại ngay, tùy duyên (tuân theo duyên phận, không ép buộc), và âm thầm niệm 7 biến *Tâm Kinh* mỗi ngày để xin Bồ Tát mở trí tuệ cho đối phương. Hệ thống phải cung cấp gợi ý khi Phụng sự viên đang ở rủi ro tạo khẩu nghiệp, và yêu cầu họ xác nhận cam kết tùy duyên.

---

## Owner module

`wisdom-qa` — VolunteerGuidanceService / TeacherTrainingProtocol  
`community` — ConversationSafetyMonitor  
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `volunteer-teacher` — Phụng sự viên hướng dẫn độ người
- `newcomer-or-relative` — Người mới hoặc người nhà được hướng dẫn
- `system` — Detect escalation signals, suggest de-escalation
- `volunteer-conscience` — Internal mechanism to remind volunteer about karma consequences

---

## Trigger

- Volunteer initiate new-member guidance or family dharma discussion
- Conversation pattern shows pushback (newcomer says "không tin", "không thích", "bây giờ không")
- Volunteer message contains imperative language (phải, bắt buộc, không được không làm)
- Volunteer attempt 3+ explanations without acceptance from newcomer

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Newcomer say "không tin" or "không thích" | ⚠️ WARNING — show volunteer de-escalation tips |
| Volunteer continue pressing after 1st refusal | ⚠️ WARNING — remind about khẩu nghiệp risk |
| Volunteer continue pressing after 2nd refusal | ⚠️ WARNING + prompt: "Dừng lại. Tùy duyên. Niệm 7 biến Tâm Kinh mỗi ngày." |
| Volunteer respect refusal + stop | ✅ ALLOWED — system suggest "silent prayer" mode |
| Volunteer tick "Tôi cam kết tùy duyên độ người" checkbox | ✅ Recorded commitment, lower escalation alert threshold |
| Volunteer bypass de-escalation + force issue | ❌ FLAGGED — alert Secretariat (pattern of coercion) |
| Newcomer report feeling pressured (via report button) | ❌ ESCALATE to Secretariat; may issue warning to volunteer |

---

## Input Contract

```
POST /api/wisdom-qa/volunteer-guidance/start-session
{
  "volunteerId": "uuid",
  "recipientId": "uuid",
  "relationship": "STRANGER" | "FAMILY_MEMBER" | "COWORKER" | "FRIEND",
  "guidanceType": "INTRODUCTION" | "DEEPEN_PRACTICE" | "HEALING" | "GENERAL_DHARMA",
  "commitmentToTuyenDuyen": "boolean (checkbox)"
}

POST /api/community/conversation/send-message
{
  "senderId": "uuid",
  "conversationId": "uuid",
  "content": "string",
  "messageType": "TEXT" | "GUIDANCE_TIP" | "PRAYER_SUGGESTION"
}

POST /api/community/conversation/report-pressure
{
  "recipientId": "uuid",
  "volunteerId": "uuid",
  "conversationId": "uuid",
  "reason": "FEELING_PRESSURED" | "UNWANTED_GUIDANCE" | "COERCION",
  "details": "string (optional)"
}
```

---

## Write Path

### Path A: Start Guidance Session with Commitment
```
1. Query volunteerId, recipientId; verify relationship valid
2. Validate DTO:
   - commitmentToTuyenDuyen === true → warning if false (proceed anyway, but flag)
3. If commitmentToTuyenDuyen === false:
   - Show modal: "⚠️ Lưu ý: Bạn có cam kết tùy duyên độ người không?"
   - "Nếu người đó phản đối, bạn PHẢI dừng lại ngay, không tranh cãi, và niệm 7 biến Tâm Kinh mỗi ngày."
   - Require check before proceeding
4. Create GuidanceSession record:
   {
     volunteerId, recipientId, relationship, guidanceType,
     commitmentToTuyenDuyen: true, status: "ACTIVE", createdAt: now()
   }
5. Send system message to volunteer:
   "Hãy hướng dẫn tùy duyên. Nếu bạn thấy người đó không tin, hãy dừng lại và niệm 7 biến Tâm Kinh mỗi ngày."
6. Return 201 { sessionId, reminders: [...] }
```

### Path B: Conversation Message Escalation Detection
```
1. Query conversationId, senderId (volunteer)
2. If senderId = volunteer_role:
   a. Analyze message tone for imperative language:
      - regex: /phải|bắt buộc|không được không|tuyệt đối phải/i
      - If found → escalationScore += 30
   b. Check message for emotional pressure:
      - regex: /nếu không.*sẽ|sẽ bị mắc bệnh|tội lỗi|chết đi/i
      - If found → escalationScore += 50
3. Query recent messages in conversation:
   a. Count newcomer/recipient refusals:
      - "không tin", "không thích", "bây giờ không", "chưa sẵn sàng"
      - refusals >= 2 AND volunteer continue → escalationScore += 40
4. If escalationScore >= 80:
   - Insert WarningSuggestion into conversation:
     "⏸️ Tạm dừng. Người này đang phản đối. Hãy tôn trọng lựa chọn của họ. 
     Niệm 7 biến Tâm Kinh mỗi ngày để xin Bồ Tát mở trí tuệ cho họ.
     Khẩu nghiệp là rất nặng."
   - Show volunteer this suggestion (not delivered to recipient)
5. If escalationScore >= 100:
   - Create CoercionAlert:
     { volunteerId, conversationId, escalationScore, alertType: "PATTERN_OF_COERCION" }
   - Notify Secretariat
6. Return escalationScore to volunteer for self-reflection
```

### Path C: Recipient Report Pressure
```
1. Query recipientId, volunteerId, conversationId
2. Validate DTO:
   - reason in enum
   - details optional
3. Create PressureReport:
   {
     volunteerId, recipientId, conversationId, reason,
     details, reportedAt: now(), status: "PENDING_REVIEW"
   }
4. Hide conversation from public (mark as PRIVATE_UNDER_REVIEW)
5. Notify Secretariat immediately:
   - priority: CRITICAL
   - subject: "[Pressure Report] Volunteer [name] may have coerced [recipient name]"
6. Send message to volunteer:
   "Có thành viên báo cáo rằng họ cảm thấy bị ép buộc trong cuộc trò chuyện với bạn. 
   Ban Thư Ký sẽ điều tra. Hãy tôn trọng tùy duyên của họ."
7. Return 201 { reportId, acknowledgment: "Báo cáo của bạn đã được gửi đến Ban Thư Ký." }
```

---

## FE Behavior

### Volunteer Starting Guidance
```
┌──────────────────────────────────────────────┐
│  🙏 Bắt Đầu Hướng Dẫn Độ Người              │
├──────────────────────────────────────────────┤
│                                              │
│  Người được hướng dẫn:                       │
│  [Mẹ tôi ▼]                                 │
│                                              │
│  Loại hướng dẫn:                             │
│  [Giới thiệu ban đầu ▼]                     │
│                                              │
│  ⚠️  Cam kết quan trọng:                     │
│  ☐ Tôi cam kết tùy duyên độ người.          │
│    Nếu người đó không tin hay phản đối,     │
│    tôi sẽ dừng lại ngay, không tranh cãi,   │
│    và niệm 7 biến Tâm Kinh mỗi ngày để      │
│    xin Bồ Tát mở trí tuệ cho họ.            │
│                                              │
│  [Bắt đầu]  [Hủy]                          │
│                                              │
└──────────────────────────────────────────────┘

Checkbox MUST be ticked to proceed.
```

### De-Escalation Suggestion
```
Volunteer's message: "Mẹ ơi, bạn phải niệm Tâm Kinh mỗi ngày, 
                      nếu không sẽ bị bệnh..."

System detects high escalation → show:

┌──────────────────────────────────────────────┐
│  ⏸️  Tạm Dừng & Suy Tư                       │
├──────────────────────────────────────────────┤
│                                              │
│  Lời nhắn của bạn có dấu hiệu ép buộc.      │
│                                              │
│  Hãy nhớ:                                   │
│  ✓ Tùy duyên = không ép buộc                │
│  ✓ Mẹ bạn có quyền chọn riêng               │
│  ✓ Ép buộc tạo khẩu nghiệp nặng             │
│                                              │
│  Lựa chọn tốt hơn:                          │
│  "Mẹ ơi, nếu bạn muốn thử, tôi sẵn sàng   │
│   hướng dẫn. Nếu chưa sẵn sàng, không sao. │
│   Tôi sẽ niệm 7 biến Tâm Kinh mỗi ngày     │
│   để xin Bồ Tát mở trí tuệ cho mẹ."        │
│                                              │
│  [Hiểu rồi, sửa lại]  [Tiếp tục như vậy]  │
│                                              │
└──────────────────────────────────────────────┘
```

### Recipient Pressure Report
```
┌──────────────────────────────────────────────┐
│  📢 Báo Cáo Cảm Giác Bị Ép Buộc             │
├──────────────────────────────────────────────┤
│                                              │
│  Bạn có cảm thấy bị ép buộc hoặc            │
│  không thoải mái trong cuộc hướng dẫn này    │
│  không?                                      │
│                                              │
│  ○ Không, tôi cảm thấy thoải mái            │
│  ○ Hơi áp lực, nhưng chịu được             │
│  ● Cảm thấy bị ép buộc                     │
│  ○ Cảm thấy xúc phạm, bực tức              │
│                                              │
│  Chi tiết (tùy chọn):                       │
│  ┌──────────────────────────────────────┐   │
│  │ [Mô tả cảm giác của bạn...]          │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ℹ️  Báo cáo này là bí mật. Ban Thư Ký    │
│     sẽ điều tra và liên lạc lại với bạn.   │
│                                              │
│           [Gửi báo cáo]  [Hủy]             │
│                                              │
└──────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model GuidanceSession {
  id                  String    @id @default(cuid())
  volunteerId         String
  volunteer           User      @relation("guidance-sessions", fields: [volunteerId], references: [id])
  
  recipientId         String
  recipient           User      @relation("received-guidance", fields: [recipientId], references: [id])
  
  relationship        String    // STRANGER | FAMILY_MEMBER | COWORKER | FRIEND
  guidanceType        String    // INTRODUCTION | DEEPEN_PRACTICE | HEALING | GENERAL_DHARMA
  commitmentToTuyenDuyen Boolean @default(true)
  
  status              String    @default("ACTIVE") // ACTIVE, COMPLETED, PAUSED, ENDED_BY_RECIPIENT
  escalationScore     Int       @default(0)
  
  createdAt           DateTime  @default(now())
  endedAt             DateTime?
  
  @@index([volunteerId])
  @@index([recipientId])
  @@index([status])
}

model CoercionAlert {
  id                  String    @id @default(cuid())
  volunteerId         String
  volunteer           User      @relation("coercion-alerts", fields: [volunteerId], references: [id])
  
  conversationId      String
  sessionId           String?   // FK to GuidanceSession if applicable
  
  escalationScore     Int       // threshold: >= 100
  alertType           String    // SINGLE_INCIDENT | PATTERN_OF_COERCION
  
  flaggedMessages     Json      // array of message indices that triggered alert
  
  status              String    @default("PENDING_SECRETARIAT_REVIEW") // PENDING, REVIEWED, CONFIRMED, DISMISSED
  secretariatNotes    String?
  
  reviewedAt          DateTime?
  createdAt           DateTime  @default(now())
  
  @@index([volunteerId])
  @@index([status])
}

model PressureReport {
  id                  String    @id @default(cuid())
  volunteerId         String
  volunteer           User      @relation("pressure-reports-against", fields: [volunteerId], references: [id])
  
  recipientId         String
  recipient           User      @relation("pressure-reports-filed", fields: [recipientId], references: [id])
  
  conversationId      String
  reason              String    // FEELING_PRESSURED | UNWANTED_GUIDANCE | COERCION
  details             String?
  
  status              String    @default("PENDING_REVIEW") // PENDING_REVIEW, CONFIRMED, RESOLVED, DISMISSED
  secretariatReview   String?
  
  reportedAt          DateTime  @default(now())
  reviewedAt          DateTime?
  
  @@unique([recipientId, conversationId]) // one report per recipient per conversation
  @@index([volunteerId])
  @@index([status])
}

// Migration hints:
// CREATE TABLE IF NOT EXISTS "GuidanceSession" (
//   "id" TEXT NOT NULL PRIMARY KEY,
//   "volunteerId" TEXT NOT NULL,
//   "recipientId" TEXT NOT NULL,
//   "commitmentToTuyenDuyen" BOOLEAN NOT NULL DEFAULT true,
//   "status" TEXT NOT NULL DEFAULT 'ACTIVE',
//   "escalationScore" INTEGER NOT NULL DEFAULT 0,
//   "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY ("volunteerId") REFERENCES "User"("id"),
//   FOREIGN KEY ("recipientId") REFERENCES "User"("id")
// );
```

---

## Audit

| Action | Trigger |
|---|---|
| `guidance.session.started` | Volunteer start guidance with commitment |
| `guidance.escalation.detected` | AI detects coercive language (score >= 80) |
| `coercion.alert.created` | Pattern confirmed (score >= 100) |
| `coercion.alert.secretariat.notified` | Secretariat alerted |
| `pressure.report.filed` | Recipient report feeling pressured |
| `pressure.report.confirmed` | Secretariat investigates + confirms |
| `volunteer.guidance.suspended` | Volunteer suspended from guiding (post-confirmation) |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Volunteer attempt start guidance without commitment | `tuyen_duyen_commitment_required` | 400 |
| Recipient report pressure | `pressure_report_filed` | 201 (alert, not error) |
| Escalation score >= 100 | `coercion_pattern_detected` | 400 (soft block) |
| Volunteer suspended from guidance | `volunteer_guidance_suspended` | 403 |

---

## Notes for AI/codegen

- **Escalation scoring:** Machine-readable heuristics:
  - Imperative language (phải, bắt buộc): +30
  - Fear/threat language (sẽ bị, chết): +50
  - Recipient refusals (>= 2): +40 each
  - Escalation threshold: 80 (warning), 100 (alert Secretariat)
- **De-escalation suggestions:** Pre-written templates in DB; show to volunteer when score >= 80.
- **Silent prayer reminder:** When volunteer accepts refusal gracefully, show: "Hãy niệm 7 biến Tâm Kinh mỗi ngày cho [recipientName]." (optional tracking).
- **Recipient autonomy:** Emphasize that recipient can report anytime; report is confidential.
- **Volunteer coaching:** After first alert, offer training: "Hướng dẫn tùy duyên: Cách tôn trọng lựa chọn của người khác."
- **False positive risk:** AI might flag cultural communication style (some cultures use stronger language). Add human review step for PATTERN_OF_COERCION alerts before disciplinary action.
- **Recovery path:** If volunteer apologizes + undergoes training, can resume guidance (flag not permanent).

---

## Related

- [USE_CASE_CENTRALIZED_SECRETARIAT_DIRECTIVES.md](../contact/USE_CASE_CENTRALIZED_SECRETARIAT_DIRECTIVES.md) — Secretariat review process
- [USE_CASE_TESTIMONIAL_DISCLAIMER_AUTO_INJECT.md](../community/USE_CASE_TESTIMONIAL_DISCLAIMER_AUTO_INJECT.md) — Volunteer responsibility framing
- [USE_CASE_EVENT_MERIT_TRANSFER_PROTOCOL.md](../vows-merit/USE_CASE_EVENT_MERIT_TRANSFER_PROTOCOL.md) — Volunteer positive reinforcement (merit transfer)

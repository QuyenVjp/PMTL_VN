# Lower Tooth Nightmare Alert — Cảnh Báo Mộng Thấy Rụng Răng Dưới

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — CRITICAL distinction: LOWER teeth = descendants/younger; UPPER teeth = ancestors/older
> **Cập nhật:** 2026-04-05

## Purpose

Detect dream entries containing "rụng răng dưới" (lower tooth loss) or "gãy răng dưới" (lower tooth breaking) in Dream Journal and trigger immediate RED_ALERT notification. Lower teeth dreams signal imminent danger to descendants, children, or mother-child relationships per PMTL esoteric teachings. System must push critical alert with mantra and ritual instructions.

## Owner Module

`wisdom-qa` — Dream Journal intake → pattern detection → RED_ALERT dispatch → ritual guidance

## Actors

1. **User** — logs dream in Dream Journal
2. **Dream Intake Service** — receives dream text
3. **Tooth Pattern Detector** — parses dream for tooth-loss keywords
4. **Alert Classification Engine** — distinguishes LOWER vs UPPER teeth
5. **Push Notification Service** — delivers RED_ALERT
6. **Ritual Guidance System** — links Giải Kết Chú, Tâm Kinh, Ngôi Nhà Nhỏ ceremony
7. **Audit Logger** — records alert dispatch

## Trigger

User logs dream entry containing:
- "rụng răng dưới"
- "gãy răng dưới"
- "đánh mất răng dưới"
- "cắn răng dưới rơi"
- Any fuzzy match on "dưới" (below/lower) + "răng" (tooth) + "rụng/gãy/mất"

## Business Rules

| Rule | Vietnamese | Logic |
|------|-----------|-------|
| **TOOTH_POSITION_CRITICAL** | Phân biệt TUYỆT ĐỐI: Răng dưới = con cái/người trẻ; Răng trên = tổ tiên/người già | Must classify correctly or risk false alarm or missed alert |
| **LOWER_TOOTH_RED_ALERT** | Nếu phát hiện rụng/gãy răng DỰ: Kích hoạt RED_ALERT ngay lập tức | No delay, must fire immediately |
| **ALERT_MESSAGE_MANDATORY** | Thông báo phải chứa: "CẢNH BÁO TỪ BỒ TÁT" + điều báo + mục đích siêu độ | Exact Vietnamese phrasing non-negotiable |
| **DESCENDANT_PROTECTION** | Cảnh báo cho con cái/vãn bối/mối quan hệ mẹ con sắp gặp nguy hiểm | Scope to younger generation, family relationships |
| **RITUAL_TRIAGE** | Phải khuyến cáo: Niệm Giải Kết Chú + đọc Tâm Kinh + đốt Ngôi Nhà Nhỏ cho con cái NGAY LẬP TỨC | Three-part ritual stack, emphasize urgency |
| **UPPER_TOOTH_NEUTRAL** | Nếu phát hiện rụng/gãy răng TRÊN: Xử lý khác (ancestor alert), không phải use case này | Out of scope for this use case |
| **NO_TOOTH_MATCH** | Nếu không phát hiện ký hiệu răng: Xử lý như dream entry thường | No alert, log as normal dream |

## Input Contract (TypeScript DTOs)

```typescript
interface DreamJournalEntry {
  userId: string;
  entryText: string; // Free text dream description
  dreamDate?: Date;
  tags?: string[]; // User-provided tags like "teeth", "family", "danger"
}

interface ToothDreamAnalysis {
  entryId: string;
  toothKeywordDetected: boolean;
  toothPosition: "upper" | "lower" | "mixed" | "unclassified";
  dreamType: "teeth_loss" | "teeth_breaking" | "teeth_pain" | "other";
  confidenceScore: number; // 0-1, fuzzy match strength
  triggerAlert: boolean; // true if LOWER teeth detected with confidence > 0.7
}

interface RedAlertPayload {
  alertId: string;
  severity: "CRITICAL";
  dreamAnalysisId: string;
  targetUserId: string;
  notificationTitle: "CẢNH BÁO TỪ BỒ TÁT";
  notificationBody: string; // "Đây là điềm báo con cái hoặc vãn bối của bạn sắp gặp nguy hiểm về sức khỏe hoặc mối quan hệ mẹ con sắp rạn nứt!"
  ritualStack: {
    mantra: "Giải Kết Chú";
    scriptureRecitation: "Tâm Kinh";
    ritual: "đốt Ngôi Nhà Nhỏ cho con cái";
    urgency: "NGAY LẬP TỨC"; // NOW, non-negotiable
  };
  callToActionLink?: string; // to ritual guidance page
}

interface DreamAuditEntry {
  alertId: string;
  entryId: string;
  userId: string;
  toothClassification: "upper" | "lower";
  alertDispatched: boolean;
  dispatchTimestamp: Date;
  userAcknowledged?: boolean;
  acknowledgmentTimestamp?: Date;
  metadata: {
    dreamText: string;
    analysisConfidence: number;
  };
}
```

## Write Path (Pseudocode API)

```
POST /api/wisdom-qa/dream-journal/log-entry
  Input: DreamJournalEntry

  1. Store raw entry in database
     → dreamJournalEntry.create(userId, entryText, dreamDate)

  2. Trigger async ToothDreamAnalysis
     → async analysis(entryId, entryText)

  3. Parse dream text for tooth keywords:
     → regex search for (rụng|gãy|mất) + (răng|toothed?)
     → fuzzy match Vietnamese diacritics

  4. If tooth keyword found:
     → determine toothPosition:
        - if contains "dưới" or "lower" → toothPosition = "lower"
        - if contains "trên" or "upper" → toothPosition = "upper"
        - else → "unclassified"

  5. Calculate confidenceScore (0-1)
     → exact keyword match = 0.95
     → fuzzy match = 0.70
     → partial match = 0.50

  6. If toothPosition === "lower" AND confidenceScore > 0.7:
     → RED_ALERT triggered
     → build RedAlertPayload

  7. Dispatch RED_ALERT notification (push)
     → title: "CẢNH BÁO TỪ BỒ TÁT"
     → body: "Đây là điềm báo con cái hoặc vãn bối của bạn sắp gặp nguy hiểm về sức khỏe hoặc mối quan hệ mẹ con sắp rạn nứt! Lập tức niệm Giải Kết Chú, đọc Tâm Kinh và đốt Ngôi Nhà Nhỏ cho con cái ngay lập tức!"

  8. Create DreamAuditEntry
     → log classification, alert dispatch, timestamp

  9. Return success response to FE
     → include alert status, ritual guidance link
```

## FE Behavior (ASCII Wireframe)

```
STEP 1: User writes dream entry
┌─────────────────────────────────────┐
│ 📖 Nhật Ký Mộng                     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Tôi mơ rằng tôi bị rụng răng    │ │
│ │ dưới. Rất sợ hãi.               │ │
│ │                                 │ │
│ │ Tags: [mộng sợ] [sức khỏe]     │ │
│ └─────────────────────────────────┘ │
│                                     │
│  [ LƯU ]       [ HỦY ]              │
└─────────────────────────────────────┘

STEP 2: System processes → tooth detected → RED_ALERT fires
┌─────────────────────────────────────┐
│ 🔴 CẢNH BÁO TỪ BỒ TÁT              │
│                                     │
│ Đây là điềm báo con cái hoặc vãn   │
│ bối của bạn sắp gặp nguy hiểm về  │
│ sức khỏe hoặc mối quan hệ mẹ con   │
│ sắp rạn nứt!                       │
│                                     │
│ Lập tức niệm Giải Kết Chú, đọc    │
│ Tâm Kinh và đốt Ngôi Nhà Nhỏ cho   │
│ con cái ngay lập tức!               │
│                                     │
│  [ Xem Hướng Dẫn Nghi Thức ]       │
│  [ Xác Nhận Đã Hiểu ]              │
└─────────────────────────────────────┘

STEP 3: User taps "Xem Hướng Dẫn Nghi Thức" (View Ritual Guide)
┌─────────────────────────────────────┐
│ 🙏 HƯỚNG DẪN NGHI THỨC KHẨN CẤP   │
│                                     │
│ ☑ Niệm Giải Kết Chú                │
│   (Break karmic knots for children) │
│   [ Xem Text ]                      │
│                                     │
│ ☑ Đọc Tâm Kinh                     │
│   (Heart Sutra for protection)      │
│   [ Xem Text ]                      │
│                                     │
│ ☑ Đốt Ngôi Nhà Nhỏ cho Con         │
│   (Paper house offering for child)  │
│   [ Hướng Dẫn ]                     │
│                                     │
│ [ Tôi Đã Hoàn Thành ]              │
└─────────────────────────────────────┘

STEP 4: User acknowledges completion
┌─────────────────────────────────────┐
│ ✅ Cảm Ơn Bạn Đã Thực Hành         │
│                                     │
│ Bạn đã bắt đầu quá trình siêu độ  │
│ cho con cái. Hãy tiếp tục thực     │
│ hành các nghi thức này trong vài    │
│ ngày tới.                           │
│                                     │
│ Ngôi Phật sẽ bảo vệ gia đình bạn   │
│                                     │
│  [ Quay Lại Nhật Ký ]              │
└─────────────────────────────────────┘
```

## Schema Notes (Prisma Snippet)

```prisma
model DreamJournalEntry {
  id                String    @id @default(cuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id])

  entryText         String    @db.Text
  dreamDate         DateTime?
  tags              String[]  // User-provided dream tags

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relationship to analysis
  toothAnalysis     ToothDreamAnalysis?

  @@index([userId])
  @@index([createdAt])
}

model ToothDreamAnalysis {
  id                String    @id @default(cuid())
  dreamEntryId      String    @unique
  dreamEntry        DreamJournalEntry @relation(fields: [dreamEntryId], references: [id], onDelete: Cascade)

  toothKeywordDetected Boolean @default(false)
  toothPosition     String    // "upper" | "lower" | "mixed" | "unclassified"
  dreamType         String    // "teeth_loss" | "teeth_breaking" | "teeth_pain" | "other"
  confidenceScore   Float     // 0.0 to 1.0

  // Alert triggering
  triggerAlert      Boolean   @default(false)
  alertId           String?   @unique
  alert             RedAlert? @relation(fields: [alertId], references: [id])

  analyzedAt        DateTime  @default(now())

  @@index([dreamEntryId])
  @@index([toothPosition])
  @@index([triggerAlert])
}

model RedAlert {
  id                String    @id @default(cuid())
  severity          String    @default("CRITICAL") // Always CRITICAL

  toothAnalysisId   String    @unique
  toothAnalysis     ToothDreamAnalysis @relation(fields: [toothAnalysisId], references: [id])

  userId            String
  user              User      @relation(fields: [userId], references: [id])

  notificationTitle String    @default("CẢNH BÁO TỪ BỒ TÁT")
  notificationBody  String    @db.Text

  // Ritual stack
  ritualMantra      String    @default("Giải Kết Chú")
  ritualScripture   String    @default("Tâm Kinh")
  ritualOffering    String    @default("đốt Ngôi Nhà Nhỏ cho con cái")
  urgency           String    @default("NGAY LẬP TỨC")

  // Dispatch tracking
  dispatchedAt      DateTime  @default(now())
  userAcknowledged  Boolean   @default(false)
  acknowledgedAt    DateTime?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([userId])
  @@index([severity])
  @@index([dispatchedAt])
}

model DreamAuditLog {
  id                String    @id @default(cuid())
  dreamEntryId      String
  alertId           String?
  userId            String

  action            String    // "entry_created" | "analysis_complete" | "alert_triggered" | "alert_dispatched" | "user_acknowledged"
  toothClassification String? // "upper" | "lower"
  confidenceScore   Float?

  metadata          Json      // { dreamText, analysisDetails, dispatchMethod }
  timestamp         DateTime  @default(now())

  @@index([dreamEntryId])
  @@index([alertId])
  @@index([userId])
  @@index([timestamp])
}
```

## Audit

- Log every dream entry received (even if no tooth match detected)
- Log tooth keyword detection attempt with confidence score
- Log alert classification decision (LOWER vs UPPER)
- Log RED_ALERT dispatch (timestamp, notification ID, target user)
- Log user acknowledgment of alert (if tracked)
- Flag any repeated lower-tooth dreams within 7 days for escalation review
- Maintain immutable audit trail for family safety

## Errors

| Code | Message | Action |
|------|---------|--------|
| `TOOTH_UNCLASSIFIED` | Không xác định được vị trí răng (trên/dưới) | Escalate to manual review, mark for user confirmation |
| `CONFIDENCE_TOO_LOW` | Độ tin cậy phát hiện < 0.7 | Do not fire alert, log as low-confidence match |
| `ALERT_DISPATCH_FAILED` | Push notification thất bại | Retry queue + fallback to in-app banner notification |
| `AUDIT_LOG_MISSING` | Lỗi ghi nhật ký kiểm toán | Fail gracefully, do not block dream entry save |
| `UPPER_TOOTH_DETECTED` | Phát hiện rụng/gãy răng trên (ancestor alert) | Route to separate ancestor-alert use case, NOT this use case |
| `RITUAL_GUIDANCE_UNAVAILABLE` | Không tải được hướng dẫn nghi thức | Still fire alert, but link goes to fallback resource list |

## Notes for AI/Codegen

1. **Tooth position classification is CRITICAL** — system must never confuse LOWER (descendants) with UPPER (ancestors). False classification could cause wrong ritual guidance or missed alerts. Use explicit keyword checks: "dưới" = lower, "trên" = upper.

2. **Fuzzy matching is essential** — users may:
   - Misspell diacritics: "rung" instead of "rụng"
   - Use colloquial phrasing: "my teeth fell out" (English) vs "rang tôi rơi"
   - Describe indirectly: "tôi thấy một chiếc răng nằm dưới lưỡi"
   - Use multiple teeth: "several lower teeth"

   Handle all gracefully.

3. **RED_ALERT is non-negotiable** — if LOWER tooth pattern detected above confidence threshold, MUST fire immediately. No "check settings" or "let user opt out". This is critical family safety protection.

4. **Notification exact wording** — Vietnamese phrasing must match exactly:
   - "CẢNH BÁO TỪ BỒ TÁT" (Alert from Bodhisattva)
   - "Đây là điềm báo con cái hoặc vãn bối của bạn sắp gặp nguy hiểm..." (This is a sign your descendants will soon face danger...)
   - "Lập tức niệm... đốt Ngôi Nhà Nhỏ cho con cái ngay lập tức!" (Immediately recite... burn house for child NOW!)

   No paraphrasing or simplification.

5. **Ritual stack is fixed** — three elements in order:
   - Giải Kết Chú (Knot-Breaking Mantra)
   - Tâm Kinh (Heart Sutra)
   - Đốt Ngôi Nhà Nhỏ (Paper House Offering for Child)

   All three must be presented together.

6. **No medical claims** — system is advisory spiritual guidance only. Never claim to prevent actual harm. Include disclaimer: "This is based on PMTL esoteric teachings and is not medical advice."

7. **Descendant scope** — ensure ritual guidance emphasizes protection of:
   - Direct children
   - Grandchildren
   - Younger family members
   - People under user's care

   Do not extend to adult relatives without clear user indication.

## Related

- `wisdom-qa` domain root
- `dream-journal` feature (intake module)
- `upper-tooth-ancestor-alert` (complementary use case, opposite classification)
- `push-notification-service` (dispatch dependency)
- `ritual-guidance-library` (downstream for mantra/sutra/offering instructions)
- `family-safety-tracker` (coordination module for protection protocols)

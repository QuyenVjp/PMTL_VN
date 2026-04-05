# Chronic ENT Karma Mapper — Viêm Họng Mãn Tính & Căn Nguyên Nghiệp Báu

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-05

## Purpose

Detect chronic throat/sinusitis complaints in Symptom Checker and diagnose karmic root cause based on PMTL teachings about dietary karma (eating raw seafood) and killing karma. Provide targeted karmic remedy protocol.

## Owner Module

`wisdom-qa` — Symptom validation → karmic diagnosis → remedy generation

## Actors

1. **User** — enters throat/sinus symptoms
2. **Symptom Checker Service** — triggers karma inquiry
3. **Karma Mapper Engine** — correlates symptoms to karmic causes
4. **Remedy Generator** — outputs mantra + release protocol
5. **System** — logs diagnostic outcome

## Trigger

User enters symptom matching:
- "Viêm họng mãn tính"
- "Viêm mũi dị ứng dai dẳng"
- "Đau họng kéo dài"
- "Xoang nghẹt liên tục"

## Business Rules

| Rule | Vietnamese | Logic |
|------|-----------|-------|
| **SYMPTOM_MATCH** | Phát hiện triệu chứng viêm họng/mũi mãn tính | Exact or fuzzy match on complaint text |
| **KARMA_INQUIRY** | Hỏi: "Bạn có từng có sở thích ăn hải sản tươi sống (tôm, cua) hoặc từng sát sinh không?" | Show yes/no dialog to user |
| **KARMIC_AFFIRMATION** | Nếu YES: Xác nhận đó là nghiệp quả từ tham ăn & giết sinh | System must not doubt user response |
| **REMEDY_MANDATE** | Nếu YES: Bắt buộc tăng cường niệm Chú Vãng Sanh lên 49 hoặc 108 biến mỗi ngày kết hợp phóng sinh để siêu độ tiểu linh tính | Non-negotiable protocol |
| **NO_ANSWER_NEUTRAL** | Nếu NO: Không đưa ra nhận xét, chỉ hỏi về các yếu tố sức khỏe khác | Do not suggest karmic cause if user denies |

## Input Contract (TypeScript DTOs)

```typescript
interface ENTSymptomInput {
  userId: string;
  symptomText: string; // Free text from Symptom Checker
  symptomCategory: "throat" | "sinus" | "nasal";
  durationWeeks?: number;
}

interface KarmaInquiryRequest {
  symptomId: string;
  userResponse: "yes" | "no" | "unsure";
  clarificationNotes?: string; // "ate raw shrimp for years", "hunted frogs"
}

interface KarmaRemedyOutput {
  diagnosisId: string;
  karmaType: "tham_ân" | "sát_sinh" | "kết_hợp";
  remedyProtocol: {
    mantra: "Chú Vãng Sanh";
    recitationMinimum: 49 | 108; // per day
    pairedAction: "phóng sinh"; // release/liberation ritual
    durationDays?: number; // recommended continuous period
  };
  targetBenefit: "siêu độ tiểu linh tính"; // liberate minor spirits from harm
}
```

## Write Path (Pseudocode API)

```
POST /api/wisdom-qa/chronic-ent/diagnose
  Input: ENTSymptomInput

  1. Parse symptom text
     → match against keyword list (viêm họng mãn tính, viêm mũi, xoang, etc.)

  2. If match found:
     → return KarmaInquiryPrompt with question about seafood/killing

  3. User responds (UI → KarmaInquiryRequest)

  4. If userResponse === "yes":
     → generate KarmaRemedyOutput
     → store in audit log (user_karma_diagnosis table)
     → return remedy protocol to FE

  5. If userResponse === "no" or "unsure":
     → do not suggest karmic cause
     → return generic sinus health tips instead

  6. Return KarmaRemedyOutput OR SymptomGenericResponse
```

## FE Behavior (ASCII Wireframe)

```
STEP 1: User enters symptom
┌─────────────────────────────────────┐
│ Triệu Chứng Hiện Tại                │
│ ┌─────────────────────────────────┐ │
│ │ [Tôi bị viêm họng mãn tính]     │ │
│ └─────────────────────────────────┘ │
│                                     │
│  [ Kiểm Tra ]                       │
└─────────────────────────────────────┘

STEP 2: System triggers karma inquiry
┌─────────────────────────────────────┐
│ ⚠️ Khám Phá Căn Nguyên Nghiệp Báu   │
│                                     │
│ Bạn có từng có sở thích ăn hải sản │
│ tươi sống (tôm, cua) hoặc từng sát │
│ sinh không?                         │
│                                     │
│  [ CÓ ]        [ KHÔNG ]            │
└─────────────────────────────────────┘

STEP 3: YES response → Remedy protocol
┌─────────────────────────────────────┐
│ 🙏 PHƯƠNG PHÁP SIÊU ĐỘ             │
│                                     │
│ Bắt buộc tăng cường niệm:           │
│ ┌─────────────────────────────────┐ │
│ │ Chú Vãng Sanh: 49 hoặc 108      │ │
│ │ Mỗi ngày                        │ │
│ │ + Phóng Sinh                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Mục đích: Siêu độ tiểu linh tính   │
│ (liberate minor spirits from harm)  │
│                                     │
│ [ Lưu Ghi Chú ]  [ Xong ]          │
└─────────────────────────────────────┘
```

## Schema Notes (Prisma Snippet)

```prisma
model ENTSymptomDiagnosis {
  id                String    @id @default(cuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id])

  symptomText       String    // "viêm họng mãn tính"
  symptomCategory   String    // "throat" | "sinus" | "nasal"
  durationWeeks     Int?

  // Karma inquiry
  karmaInquiryAsked Boolean   @default(false)
  userKarmaResponse String?   // "yes" | "no" | "unsure"
  clarificationNotes String?

  // Remedy assignment
  karmaType         String?   // "tham_ân" | "sát_sinh" | "kết_hợp"
  remedyMantra      String?   // "Chú Vãng Sanh"
  recitationMin     Int?      // 49 or 108
  remedyAction      String?   // "phóng sinh"

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([userId])
  @@index([symptomCategory])
}

model KarmaAuditLog {
  id                String    @id @default(cuid())
  diagnosisId       String
  diagnosis         ENTSymptomDiagnosis @relation(fields: [diagnosisId], references: [id])

  action            String    // "inquiry_shown" | "affirmation_recorded" | "remedy_assigned"
  timestamp         DateTime  @default(now())
  metadata          Json      // { userResponse, systemAction }

  @@index([diagnosisId])
}
```

## Audit

- Log all karma inquiry attempts (even "no" answers)
- Log remedy assignments with timestamp
- Store user response (yes/no/unsure) for medical/karmic tracking
- Flag any multi-response changes (user changes answer) for review

## Errors

| Code | Message | Action |
|------|---------|--------|
| `SYMPTOM_NOT_MATCHED` | Triệu chứng không phù hợp | Return generic health response |
| `KARMA_INQUIRY_SKIPPED` | Người dùng không trả lời | Retry inquiry, offer alternative questions |
| `REMEDY_GEN_FAILED` | Không tạo được phương pháp siêu độ | Log error, show generic mantra suggestion |
| `AUDIT_LOG_FAIL` | Không ghi lại chẩn đoán | Fail gracefully, do not block UX |

## Notes for AI/Codegen

1. **Fuzzy matching** on Vietnamese symptoms essential — handle typos, missing diacritics
2. **Do not pre-judge** user response — system treats "yes" as absolute fact
3. **Remedy is mandatory** once karmic cause confirmed — UI must emphasize non-negotiable protocol
4. **Phóng sinh** (release ceremony) should link to animal welfare resources or local temple contacts
5. **No medical override** — system is advisory only; never claim to treat ENT disease
6. **Cultural sensitivity** — honor PMTL teachings without mocking or condescension

## Related

- `wisdom-qa` domain root
- `symptom-checker` feature (triggering module)
- `mantra-recitation-tracker` (downstream for remedy adherence)
- `release-ceremony-scheduler` (phóng sinh coordination)

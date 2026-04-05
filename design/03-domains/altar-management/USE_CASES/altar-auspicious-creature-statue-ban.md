# Tượng Bồ Tát Kèm Linh Thú — Auspicious Creature Statue Ban
> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Phase 47)
> **Trạng thái:** AI vision detection + advisory
> **Cập nhật:** 2026-04-06

## Purpose
Khi tự thỉnh tượng Quán Thế Âm Bồ Tát về nhà thờ, tốt nhất nên chọn tượng **đứng, cầm bình tịnh thủy và cành dương liễu**. **CỐ GẮNG TRÁNH** sử dụng các bức tượng có kèm theo hình ảnh các linh thú may mắn (như tượng Bồ Tát cưỡi Rồng), vì năng lượng Bồ Tát sẽ bị "phân tán" sang linh thú.

## Owner module
`altar-management` — statue form selection & AI validation

## Actors
- User (statue selection / upload)
- AI Vision model (image detection)
- System (advisory/alert)
- Admin/Mod (escalation)

## Trigger
User upload ảnh tượng Bồ Tát để verify hoặc thỉnh mua tượng online

## Business Rules

| Rule | Detail |
|------|--------|
| Preferred Form | Tượng đứng, cầm bình tịnh thủy & cành dương liễu |
| Avoid | Tượng cưỡi Rồng, cưỡi các linh thú khác |
| Detection | AI quét ảnh để phát hiện hình dáng Rồng/linh thú |
| Advisory | Soft advisory (không hard-block) |
| Escalation | Report để Admin review nếu detect linh thú |

## Input Contract

```typescript
interface StatueUploadDto {
  statueName: string;
  bodhisattvaType: "GUANYIN" | "AVALOKITESHVARA" | "OTHER";
  imageUrl: string;
  userDescription?: string;
}

interface AiStatueAnalysisDto {
  dragonDetected?: boolean;
  beastDetected?: string[];  // ["DRAGON", "TIGER", "PHOENIX", etc.]
  statuFormCorrect?: boolean;
  holdsPureVesselAndWillow?: boolean;
}

interface StatueValidationResponseDto {
  isPreferred: boolean;
  beastWarning?: string;
  adminEscalation?: boolean;
  recommendation: string;
}
```

## Write Path

```
POST /altar-management/statue/validate-form
  Input: StatueUploadDto

  1. Call AI Vision API:
     → detectObjects(imageUrl) → return { objects: [...] }

  2. Check for beasts:
     If objects includes "DRAGON" or other mythical creature:
       → beastDetected = true
       → Create advisory message

  3. Check for correct form:
     If detectWillow(image) && detectPureVessel(image):
       → statuFormCorrect = true

  4. Return validation:
     {
       isPreferred: (beastDetected == false && statuFormCorrect == true),
       beastWarning: (if detected) "Cảnh báo Hình tướng: Tượng Bồ Tát có kèm linh thú (Rồng). Khuyên chọn tượng đứng bình tịnh thủy tiêu chuẩn!",
       recommendation: "Tốt nhất thỉnh tượng: Quán Thế Âm Bồ Tát đứng, cầm bình tịnh thủy và cành dương liễu"
     }

POST /altar-management/statue/report-admin
  → If beastDetected, create admin ticket for human review
```

## FE Behavior

```
[Tôi muốn Thỉnh Tượng Quán Thế Âm]

[Upload ảnh tượng hoặc link sản phẩm]
  ↓
[Hệ thống phân tích...]
  ↓
[✅ TƯỢNG CHUẨN]
┌────────────────────────────────┐
│ Đây là hình tướng đúng chuẩn    │
│ Quán Thế Âm Bồ Tát:            │
│                                │
│ ✓ Đứng                         │
│ ✓ Cầm bình tịnh thủy           │
│ ✓ Cầm cành dương liễu          │
│ ✓ Không kèm linh thú           │
│                                │
│ [Tiếp Tục]                    │
└────────────────────────────────┘

---

[❌ CẢNH BÁO - HÌNH TƯỚNG]
┌────────────────────────────────┐
│ Cảnh báo: Tượng Bồ Tát có kèm  │
│ linh thú (Rồng).               │
│                                │
│ 📌 Khuyên chọn tượng đứng bình  │
│ tịnh thủy tiêu chuẩn thay vì   │
│ tượng cưỡi.                    │
│                                │
│ Năng lượng Bồ Tát sẽ không bị  │
│ phân tán sang linh thú.        │
│                                │
│ [Xác nhận & Tiếp Tục] [Chọn Lại]
└────────────────────────────────┘
```

## Schema Notes

```prisma
model StatueValidationLog {
  id                    String   @id @default(cuid())
  userId                String
  statueName            String
  imageUrl              String
  beastDetected         Boolean
  detectedBeasts        String[]  // JSON array
  statuFormCorrect      Boolean
  adminReviewRequested  Boolean
  validationDate        DateTime @default(now())
}

model AdminStatueReview {
  id              String   @id @default(cuid())
  validationLogId String   @unique
  status          String   // PENDING, APPROVED, REJECTED
  reviewerNote    String?
  reviewedAt      DateTime?
}
```

## Audit
Mỗi lần upload tượng = log vào StatueValidationLog. Nếu beast detected → auto escalate

## Error Codes
Không có error (advisory only)

## Notes
- AI detection không 100% chính xác, admin có thể override
- Mục đích là educate user, không reject merch

## Related
- `altar-management/self-blessing-activation-sequence.md` — statue blessing
- `altar-management/statue-hygiene-mantra-protocol.md` — statue care

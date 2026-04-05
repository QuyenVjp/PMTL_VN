# Người Già Yếu & Bệnh Tật Không Nên Đến Mộ Phần — Graveyard Visit Elderly & Sick Prohibition
> **Nguồn:** Huyền Nghệ Vấn Đáp 12052012 — Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Health safety advisory
> **Cập nhật:** 2026-04-06

## Purpose
Người già tuổi và người đang bị bệnh **tốt nhất không nên đến mộ phần (nghĩa địa)**. Khi đến mộ phần, lòng buồn bã + thương xót → quỷ dễ nhập vào. Dương khí không mạnh → không có cách nào để tự bảo vệ. Hậu quả có thể là ốm đau, rắc rối thêm.

## Owner module
`wisdom-qa` — health safety + spiritual vulnerability guidance

## Actors
- Elderly person / sick person (người già, người bệnh)
- Family members (khuyên ngăn)
- Spirits at cemetery (vong linh, quỷ)

## Trigger
Family planning cemetery visit during Qingming, or elderly/sick person expresses intention to visit gravesite

## Business Rules

| Rule | Detail |
|------|--------|
| Elderly Ban | Người >70 tuổi (hoặc yếu tuổi) không nên đến mộ phần |
| Sick Ban | Người đang bị bệnh (acute/chronic) không nên đến |
| Emotional Vulnerability | Lòng buồn bã, thương xót tại mộ phần = cửa mở cho quỷ |
| Yang Energy Weakness | Dương khí yếu = không bảo vệ được bản thân |
| Alternative Solution | Người khác (trẻ, khỏe mạnh) có thể thay người già đi cúng |

## Input Contract

```typescript
enum HealthStatus {
  ELDERLY = "ELDERLY",              // >70 tuổi
  FRAIL = "FRAIL",                  // yếu tuổi dù chưa 70
  ACUTE_ILLNESS = "ACUTE_ILLNESS",  // ốm cấp tính
  CHRONIC_ILLNESS = "CHRONIC_ILLNESS", // bệnh mãn tính
  TERMINAL = "TERMINAL",            // bệnh nặng
  HEALTHY = "HEALTHY",              // khỏe mạnh
}

interface CemeteryVisitRequestDto {
  userId: string;
  healthStatus: HealthStatus;
  age?: number;
  currentIllnesses?: string[];
  emotionalState?: "SAD" | "GRIEVING" | "NEUTRAL" | "PEACEFUL";
  intendToVisit: boolean;
}

interface CemeteryVisitRiskAssessmentDto {
  isSafeToVisit: boolean;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  recommendation: string;
  alternativeSuggestion?: string;
}
```

## Write Path

```
POST /wisdom-qa/cemetery-visit/assess-safety
  Input: CemeteryVisitRequestDto

  1. Health check:
     If healthStatus in [ELDERLY, FRAIL, ACUTE_ILLNESS, CHRONIC_ILLNESS, TERMINAL]:
       → riskLevel = "HIGH"
       → isSafeToVisit = false
       → recommendation: "Người già yếu hoặc bệnh tật tốt nhất không nên đến mộ phần. Dương khí yếu, quỷ dễ nhập vào."

  2. Age check:
     If age >= 70:
       → riskLevel = "HIGH"
       → recommendation: "Khi tuổi cao, dương khí không mạnh. Tốt nhất cho người con em khỏe mạnh đi thay."

  3. Emotional state:
     If emotionalState in [SAD, GRIEVING]:
       → riskLevel += 1 (increase risk)

  4. Return: CemeteryVisitRiskAssessmentDto with alternative:
     "Lời khuyên: Hãy để người con trẻ khỏe mạnh đi cúng thay bạn. Bạn ở nhà tụng kinh cầu phúc cho tổ tiên."

POST /wisdom-qa/cemetery-visit/submit-intention
  Input: { userId, isCemeteryVisitConfirmed: boolean }
  → If HIGH risk + isCemeteryVisitConfirmed == true: log warning audit
```

## FE Behavior

```
[Chuẩn Bị Lễ Thanh Minh - Đi Cúng Tổ Tiên]

[Bạn có định đi mộ phần không?]
[Có] [Không]

(Nếu chọn "Có")

[Kiểm Tra Sức Khỏe]
Tuổi: ___
Bạn có bệnh gì không? ___
Tình trạng hiện tại:
  - Khỏe mạnh
  - Yếu tuổi
  - Đang ốm

(User điền: Tuổi 76, bệnh tật mãn tính)

  ↓

[⚠️ CẢNH BÁO - KHÔNG NÊN ĐI MỘ PHẦN]
┌────────────────────────────────────┐
│ Người già yếu hoặc bệnh tật TỐT    │
│ NHẤT KHÔNG NÊN ĐI MỘ PHẦN!         │
│                                    │
│ 📌 LÝ DO:                          │
│ • Tuổi cao → dương khí yếu        │
│ • Bệnh mãn tính → cơ thể không    │
│   cân bằng                         │
│ • Tại mộ phần, lòng buồn bã +      │
│   thương xót → quỷ dễ nhập vào    │
│                                    │
│ 💡 GIẢI PHÁP THAY THẾ:            │
│ Để người con em khỏe mạnh đi      │
│ cúng thay bạn.                     │
│ Bạn ở nhà tụng Kinh cầu phúc cho  │
│ tổ tiên — cùng hiệu quả!          │
│                                    │
│ [Hiểu Rồi - Ở Nhà Tụng Kinh]      │
│ [Vẫn Muốn Đi] ⚠️ (nguy hiểm)     │
└────────────────────────────────────┘

(Nếu click [Vẫn Muốn Đi])

[⚠️ CẢNH BÁO CUỐI CÙNG]
┌────────────────────────────────────┐
│ BẠN ĐÃ ĐƯỢC CẢNH BÁO!             │
│                                    │
│ Nếu gặp chuyện xui xẻo, ốm nặng,  │
│ rắc rối sau khi đi mộ phần → đây  │
│ là hậu quả của việc bỏ lời khuyên. │
│                                    │
│ Bạn chịu trách nhiệm toàn bộ.     │
│                                    │
│ [Tôi Cam Kết Đi Dù Có Rủi Ro] ✓  │
└────────────────────────────────────┘
```

## Schema Notes

```prisma
model CemeteryVisitIntent {
  id              String   @id @default(cuid())
  userId          String
  healthStatus    String
  age             Int?
  currentIllnesses String[]  // JSON array
  emotionalState  String?
  riskLevel       String   // "HIGH", "MEDIUM", "LOW"
  isSafeToVisit   Boolean
  confirmedDespiteWarning Boolean @default(false)
  visitDate       DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model CemeteryVisitAuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String   // "RISK_ASSESSED", "HIGH_RISK_CONFIRMED", "VISITED"
  riskLevel String
  timestamp DateTime @default(now())
}
```

## Audit
- Risk assessment → log
- High-risk confirmation (user insists) → flag audit as "HIGH_RISK_CONFIRMED"
- Post-visit health issue reports → correlate with audit log

## Error Codes

| Code | Message |
|------|---------|
| ELDERLY_GRAVEYARD_UNSAFE | Người già yếu không nên đến mộ phần. Dương khí yếu, quỷ dễ nhập vào. |
| SICK_GRAVEYARD_UNSAFE | Người bệnh đến mộ phần sẽ làm bệnh nặng hơn. |
| EMOTIONAL_VULNERABILITY | Tình trạng buồn bã + thương xót = cửa mở cho quỷ. |

## Notes
- Quỷ (malevolent spirits) tìm kiếm người có dương khí yếu
- Buồn bã + thương xót tạo "emotional portal"
- Alternative: người trẻ khỏe mạnh đi thay + elderly người ở nhà tụng kinh = cùng hiệu quả
- Prevention tốt hơn treatment

## Related
- `wisdom-qa/pain-triggered-karma-radar.md` — illness as karma signal
- `wisdom-qa/heavy-karma-activation-nnn-commitment-gate.md` — health + recitation
- `identity/avatar-sanctity-guard.md` — spiritual protection

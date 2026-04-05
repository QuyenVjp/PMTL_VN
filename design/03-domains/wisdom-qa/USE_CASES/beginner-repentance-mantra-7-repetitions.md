# Người Mới Bắt Đầu Chỉ Nên Niệm 7 Biến Lễ Phật Đại Sám Hối Văn, Không 21 Biến — Beginner Repentance Mantra 7-Repetition Limit
> **Nguồn:** Wenda 20160110A 13:55 — Master Wenda Khai Thị Chính Thức
> **Trạng thái:** Hard constraint for newcomers
> **Cập nhật:** 2026-04-06

## Purpose
Người mới bắt đầu tu tâm **KHÔNG THÍCH HỢP** niệm 21 biến Lễ Phật Đại Sám Hối Văn mỗi ngày. Nếu niệm quá nhiều, sẽ **kích hoạt nghiệp chướng**. Chỉ nên niệm **7 biến** là phù hợp. Ngay cả người bình thường cũng không nên niệm 21 biến — rất nguy hiểm nếu không có Ngôi Nhà Nhỏ để hóa giải.

## Owner module
`wisdom-qa` — beginner recitation safety limit

## Actors
- Beginner practitioner (người mới bắt đầu)
- System (recitation validator)
- Admin (monitoring karmic activation)

## Trigger
User registers as "beginner" or "new practitioner" (nhập môn mới)

## Business Rules

| Rule | Detail |
|------|--------|
| Newcomer Ban | Người mới KHÔNG THÍCH HỢP niệm 21 biến/ngày |
| Safe Limit | Chỉ nên niệm **7 biến/ngày** cho người mới |
| Karmic Activation Risk | Niệm 21 biến quá sớm → kích hoạt nghiệp chướng |
| No Recovery Path | Nếu kích hoạt mà không có Ngôi Nhà Nhỏ → hoàn toàn không được |
| Veteran Caution | Ngay cả người bình thường cũng cần cẩn thận (not just newcomers) |

## Input Contract

```typescript
enum PractitionerLevel {
  BEGINNER = "BEGINNER",      // mới bắt đầu
  INTERMEDIATE = "INTERMEDIATE", // tu tâm 1-2 năm
  ADVANCED = "ADVANCED",      // tu tâm 3+ năm
  MASTER = "MASTER",          // có kinh nghiệm lâu
}

interface RepentanceMantraIntentDto {
  userId: string;
  practitionerLevel: PractitionerLevel;
  intendedDailyRepetitions: number;  // bao nhiêu biến/ngày
  hasLittleHouseSupport: boolean;   // có Ngôi Nhà Nhỏ để hóa giải không
}

interface MantraRepetitionValidationDto {
  isApproved: boolean;
  recommendedRepetitions: number;
  riskLevel: "SAFE" | "CAUTION" | "DANGEROUS";
  warningMessage?: string;
}
```

## Write Path

```
POST /wisdom-qa/repentance-mantra/validate-repetitions
  Input: RepentanceMantraIntentDto

  1. If practitionerLevel == BEGINNER && intendedDailyRepetitions > 7:
     → riskLevel = "DANGEROUS"
     → isApproved = false
     → warningMessage: "Người mới bắt đầu KHÔNG THÍCH HỢP niệm quá 7 biến/ngày. Sẽ kích hoạt nghiệp chướng!"
     → recommendedRepetitions = 7

  2. If practitionerLevel in [BEGINNER, INTERMEDIATE] && intendedDailyRepetitions == 21:
     → Check hasLittleHouseSupport
     → If false: riskLevel = "DANGEROUS", return error
     → If true: riskLevel = "CAUTION", allow but warn

  3. If practitionerLevel in [ADVANCED, MASTER] && intendedDailyRepetitions == 21:
     → riskLevel = "CAUTION" (still not fully safe)
     → warningMessage: "Ngay cả bạn cũng nên cẩn thận. Nếu kích hoạt nghiệp chướng mà không có hóa giải → nguy hiểm."

  4. Default safe: 7 biến

POST /wisdom-qa/repentance-mantra/start-daily-practice
  Input: { userId, practitionerLevel, dailyRepetitions, acknowledged: boolean }
  → If acknowledged == true: log audit with risk level
```

## FE Behavior

```
[Bắt Đầu Tụng Lễ Phật Đại Sám Hối Văn]

[Bạn là ai?]
  - Mới bắt đầu (nhập môn < 1 năm)
  - Tu tâm 1-2 năm
  - Tu tâm 3+ năm
  - Có kinh nghiệm dài hạn

(User chọn "Mới bắt đầu")

[Bạn dự định niệm bao nhiêu biến/ngày?]
  - 7 biến (Recommended) ✓
  - 21 biến
  - Tùy chỉnh: ___

(User chọn "21 biến")

  ↓

[⚠️ CẢNH BÁO - NGUY HIỂM!]
┌────────────────────────────────────┐
│ Người mới bắt đầu KHÔNG THÍCH HỢP  │
│ niệm 21 biến/ngày!                 │
│                                    │
│ ❌ Sẽ KÍCH HOẠT NGHIỆP CHƯỚNG!     │
│                                    │
│ 💡 Khuyên cáo:                     │
│ • Chỉ niệm 7 biến/ngày là tốt nhất│
│ • Tích lũy qua 1-2 năm rồi tăng   │
│                                    │
│ Nếu bạn không có Ngôi Nhà Nhỏ để  │
│ hóa giải → TUYỆT ĐỐI KHÔNG nên   │
│ niệm 21 biến!                      │
│                                    │
│ [Thay Đổi Thành 7 Biến] [Tiếp Tục]│
└────────────────────────────────────┘

(Click [Tiếp Tục] → 2nd warning)

[⚠️ XÁC NHẬN CUỐI CÙNG]
┌────────────────────────────────────┐
│ BẠN ĐÃ ĐƯỢC CẢNH BÁO!             │
│                                    │
│ Niệm 21 biến quá sớm = kích hoạt  │
│ nghiệp chướng. Nếu gặp vấn đề     │
│ (ốm đau, rắc rối) mà không có      │
│ Ngôi Nhà Nhỏ → không cách nào.    │
│                                    │
│ Bạn chịu trách nhiệm.             │
│                                    │
│ [Tôi Cam Kết Niệm 7 Biến] ✓      │
│ [Tôi Cam Kết Niệm 21 Biến] ⚠️    │
└────────────────────────────────────┘

---

[Bắt Đầu Tụng Kinh - Mỗi Ngày]

(Mỗi ngày khi vào app)

[Lịch Tụng Kinh Hôm Nay]
📿 Lễ Phật Đại Sám Hối Văn: 7 biến (Recommended) ✓
   [Bắt Đầu] [Đã Hoàn Thành]
```

## Schema Notes

```prisma
model RepentanceMantraSchedule {
  id                  String   @id @default(cuid())
  userId              String
  practitionerLevel   String   // BEGINNER, INTERMEDIATE, etc.
  dailyRepetitions    Int      // 7, 14, 21, etc.
  riskLevel           String   // SAFE, CAUTION, DANGEROUS
  hasLittleHouseSupport Boolean @default(false)
  acknowledged        Boolean @default(false)
  acknowledgedAt      DateTime?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model RepentanceMantraAudit {
  id                String   @id @default(cuid())
  userId            String
  scheduleId        String
  dailyRepetitions  Int
  riskLevel         String
  action            String   // "CREATED", "WARNED", "ACTIVATED_KARMA"
  timestamp         DateTime @default(now())
}
```

## Audit
- Mỗi khi user tạo schedule → log với risk level
- Nếu activate karma (report symptoms sau) → escalate audit

## Error Codes

| Code | Message |
|------|---------|
| BEGINNER_REPENTANCE_UNSAFE | Người mới không thích hợp niệm quá 7 biến/ngày. Sẽ kích hoạt nghiệp chướng! |
| REPENTANCE_NO_RECOVERY_PATH | Niệm 21 biến mà không có Ngôi Nhà Nhỏ để hóa giải → nguy hiểm tối đa! |
| REPENTANCE_EXCESSIVE | Ngay cả bạn cũng nên cẩn thận. Niệm quá nhiều không an toàn. |

## Notes
- 7 biến là "con số an toàn" cho mọi người
- 21 biến chỉ cho người có kinh nghiệm + Ngôi Nhà Nhỏ support
- Kích hoạt nghiệp chướng không có cách khác ngoài tụng Ngôi Nhà Nhỏ hoặc phóng sinh
- Người bình thường cũng cần cẩn thận (Master's warning)

## Related
- `wisdom-qa/non-fungible-repentance-rule.md` — repentance uniqueness constraint
- `wisdom-qa/perfection-mantra-end-session-only.md` — perfection mantra timing
- `wisdom-qa/heavy-karma-activation-nnn-commitment-gate.md` — karma activation monitoring
- `engagement/karmic-transference-shield.md` — karma absorption risk

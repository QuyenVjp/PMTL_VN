# Ma Trận 3 Bậc Siêu Độ Lên Cõi Trời — Three-Tier Heavenly Ascension Tracker
> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Phase 47)
> **Trạng thái:** Gamified progression system
> **Cập nhật:** 2026-04-06

## Purpose
Để siêu độ một người thân đã khuất lên các cõi cao, số lượng Ngôi Nhà Nhỏ tuân theo ma trận toán học:
- Tier 1 (Địa Ngục → Nhân Đạo): **ít nhất 21 tấm**
- Tier 2 (Nhân Đạo → A Tu La): **thêm 21 tấm nữa**
- Tier 3 (A Tu La → Thiên Giới): **thêm 21 tấm nữa**
Tối thiểu 63+ tấm để đạt Thiên Giới.

## Owner module
`engagement` — salvation progress tracking

## Actors
- User (người làm công đức)
- Deceased beneficiary (vong linh)
- System UI (progress bar)

## Trigger
User tạo Task siêu độ người thân với `beneficiaryStatus = "DECEASED"`

## Business Rules

| Tier | From | To | Required LH | Total Cumulative |
|------|------|----|----|---|
| 1 | Địa Ngục | Nhân Đạo | 21 | 21 |
| 2 | Nhân Đạo | A Tu La | 21 | 42 |
| 3 | A Tu La | Thiên Giới | 21 | 63 |

| Rule | Detail |
|------|--------|
| Tier Unlock | Phải hoàn thành Tier N trước khi unlock Tier N+1 |
| Progress Visibility | Hiển thị visual staircase, avatar của vong linh "climb" từng bậc |
| No Backsliding | Một khi đạt Tier N, không thể lùi lại Tier N-1 |
| Burnouts Count | Mỗi tấm LH đốt = +1 count, cộng dồn |

## Input Contract

```typescript
interface DeceasedSalvationTaskDto {
  beneficiaryName: string;
  deceasedDate: Date;
  initialTier: "HELL" | "HUMAN" | "ASURA" | "HEAVEN";  // tiên đoán tier ban đầu
  targetTier: "HUMAN" | "ASURA" | "HEAVEN";
}

interface AscensionProgressDto {
  currentTier: "HELL" | "HUMAN" | "ASURA" | "HEAVEN";
  littleHousesBurnedInTier: number;
  littleHousesRequiredForTier: number;
  totalBurned: number;
  nextMilestone: number;
  tierCompletionPercent: number;
}
```

## Write Path

```
POST /engagement/deceased-salvation/create-task
  Input: DeceasedSalvationTaskDto
  → Create SalvationTask record
  → Set currentTier = initialTier
  → Initialize tierProgress = { HELL: 0, HUMAN: 0, ASURA: 0, HEAVEN: 0 }

POST /engagement/little-house/burn (existing endpoint)
  When LH burns for deceased beneficiary:
  → Update tierProgress[currentTier] += 1
  → Check if tierProgress[currentTier] == 21
    → If yes: advance currentTier to next tier, reset tierProgress[newTier] = 0
    → Emit event: ASCENSION_TIER_UNLOCKED
  → Log audit
```

## FE Behavior

```
[Siêu Độ "Tên Người Thân"]
┌──────────────────────────────┐
│ Tier 1: 🧗 Địa Ngục → Nhân Đạo
│ Progress: ████████░░░░░░░░ 10/21
│ Avatar: 👻 (bên dưới)
│
│ Tier 2: 📍 Nhân Đạo → A Tu La (LOCKED)
│ Progress: ░░░░░░░░░░░░░░░░ 0/21
│ Avatar: 👻 (bên giữa) [Sẽ unlock khi Tier 1 hoàn thành]
│
│ Tier 3: 👼 A Tu La → Thiên Giới (LOCKED)
│ Progress: ░░░░░░░░░░░░░░░░ 0/21
│ Avatar: ✨ (bên trên) [Sẽ unlock khi Tier 2 hoàn thành]
│
│ [Tiếp tục đốt 11 tấm Ngôi Nhà Nhỏ để hoàn thành Tier 1]
└──────────────────────────────┘

[Đốt LH]
  ↓
[LH burn #21 thành công!]
  ↓
[🎉 TIER 1 HOÀN THÀNH!]
[Avatar "Người Thân" di chuyển từ Địa Ngục lên Nhân Đạo]
[Tier 2 giờ đã UNLOCK]
```

## Schema Notes

```prisma
model DeceasedSalvationTask {
  id                 String   @id @default(cuid())
  userId             String
  beneficiaryName    String
  deceasedDate       DateTime
  currentTier        String   // "HELL", "HUMAN", "ASURA", "HEAVEN"
  targetTier         String
  totalLittleHousesBurned Int @default(0)
  tierProgressHell   Int @default(0)
  tierProgressHuman  Int @default(0)
  tierProgressAsura  Int @default(0)
  tierProgressHeaven Int @default(0)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}
```

## Audit
Mỗi tier unlock → insert vào AscensionAudit table với timestamp

## Error Codes

| Code | Message |
|------|---------|
| ASCENSION_TIER_LOCKED | Tier này chưa unlock. Hoàn thành Tier trước đó trước. |
| ASCENSION_INVALID_TIER | Tier không hợp lệ. |

## Notes
- Gamification: Avatar của vong linh sẽ hiển thị tiến triển qua từng cõi, motivate user tiếp tục đốt LH
- Nếu user muốn "tăng tốc", họ có thể đốt thêm LH ngoài 63 tấm (không giới hạn)

## Related
- `engagement/manage-ngoi-nha-nho-sheet.md` — LH sheet management
- `engagement/bardo-49day-priority-queue.md` — 49-day bardo schedule

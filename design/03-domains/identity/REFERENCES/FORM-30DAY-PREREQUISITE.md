# FORM-30DAY-PREREQUISITE

## Owner
- `identity` (Sacred Forms)

## Purpose
Tiền đề 30 ngày cho "Đơn Khuyến Đạo Người Nhà" (30-Day Prerequisite Lock)

---

## Business Rule

### Rule - Requires 30+ Days of Heart Sutra for Target
**Nghiệp vụ [Nguồn 427]:**
- Không được tùy tiện in *Đơn Khuyến Đạo Người Nhà* ra đọc ngay
- **BẮT BUỘC** phải có nền tảng: niệm *Tâm Kinh* (7 biến/ngày) cho người đó liên tục **hơn 1 tháng** (30+ ngày)
- Chỉ sau khi đã chuẩn bị năng lượng đủ lâu thì mới được làm đơn

---

## Schema Hints

```prisma
model ConvincingFamilyForm {
  id                String   @id
  userId            String
  targetName        String
  targetRelation    String
  
  // Prerequisite tracking
  prerequisiteMet   Boolean  @default(false)
  heartSutraDays    Int      @default(0) // Days of Heart Sutra for this target
  
  status            String   @default('LOCKED') // LOCKED, UNLOCKED, SUBMITTED
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@map("convincing_family_forms")
}
```

---

## Service Logic

```typescript
export class SacredFormsService {
  private readonly MIN_HEART_SUTRA_DAYS = 30;

  async checkFormEligibility(userId: string, targetName: string) {
    // Query recitation logs
    const logs = await this.prisma.recitationLog.findMany({
      where: {
        userId,
        mantraType: 'XIN_JING',
        proxyTarget: targetName,
        count: { gte: 7 }, // At least 7 times per day
      },
      orderBy: { logDate: 'asc' },
    });

    // Count consecutive days
    const consecutiveDays = this.countConsecutiveDays(logs);

    return {
      eligible: consecutiveDays >= this.MIN_HEART_SUTRA_DAYS,
      currentDays: consecutiveDays,
      requiredDays: this.MIN_HEART_SUTRA_DAYS,
      daysRemaining: Math.max(0, this.MIN_HEART_SUTRA_DAYS - consecutiveDays),
    };
  }

  async requestForm(userId: string, dto: RequestConvincingFormDto) {
    const eligibility = await this.checkFormEligibility(userId, dto.targetName);

    if (!eligibility.eligible) {
      throw new ForbiddenException({
        code: '30DAY_PREREQUISITE_NOT_MET',
        message: `Bạn cần niệm Tâm Kinh 7 biến/ngày cho ${dto.targetName} liên tục hơn 1 tháng trước khi được phép dùng Đơn Khuyến Đạo.`,
        currentDays: eligibility.currentDays,
        requiredDays: eligibility.requiredDays,
        daysRemaining: eligibility.daysRemaining,
      });
    }

    return this.prisma.convincingFamilyForm.create({
      data: {
        userId,
        targetName: dto.targetName,
        targetRelation: dto.targetRelation,
        prerequisiteMet: true,
        heartSutraDays: eligibility.currentDays,
        status: 'UNLOCKED',
      },
    });
  }

  private countConsecutiveDays(logs: any[]): number {
    if (logs.length === 0) return 0;

    let count = 1;
    for (let i = 1; i < logs.length; i++) {
      const prevDate = new Date(logs[i - 1].logDate);
      const currDate = new Date(logs[i].logDate);
      const dayDiff = differenceInDays(currDate, prevDate);

      if (dayDiff === 1) {
        count++;
      } else {
        break; // Not consecutive
      }
    }

    return count;
  }
}
```

---

## UI Components

### Locked Form (Progress Indicator)
```
┌────────────────────────────────────────────┐
│  🔒 Đơn Khuyến Đạo Người Nhà              │
├────────────────────────────────────────────┤
│  Đối tượng: Mẹ                            │
│                                            │
│  CHƯA ĐỦ ĐIỀU KIỆN                        │
│                                            │
│  Yêu cầu:                                 │
│  Niệm Tâm Kinh 7 biến/ngày cho Mẹ liên   │
│  tục hơn 30 ngày.                         │
│                                            │
│  Tiến độ của bạn:                         │
│  [████████████░░░░░░░░░░░] 18/30 ngày    │
│                                            │
│  Còn: 12 ngày nữa                         │
│                                            │
│  [Xem hướng dẫn niệm]                     │
└────────────────────────────────────────────┘
```

---

## References
- Source 427: Convincing Family Form prerequisites

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 10 Logic 3

# BARDO-49-DAY-TRACKER

## Owner
- `calendar` (Deceased tracking)

## Purpose
Cửa sổ Bardo 49 Ngày (49-Day Bardo Window) - Emergency campaign for deceased relatives

---

## Business Rule

### Rule - Mandatory 49 Little Houses in 49 Days
**Nghiệp vụ [Nguồn: Intro to Guan Yin Citta]:**
- Bắt buộc đốt ít nhất **49 Tiểu Phương Tử (TPT)** trong vòng **49 ngày** ngay sau khi người thân mất
- Đây là cửa sổ vàng (golden window) để siêu độ vong linh
- Sau 49 ngày, vong linh đã định cõi, việc siêu độ khó khăn hơn nhiều

---

## Schema Hints

```prisma
model DeceasedRelative {
  id              String   @id
  publicId        String   @unique
  userId          String
  name            String
  relationship    String   // "Mother", "Father", "Spouse", etc.
  dateOfDeath     DateTime
  bardoEndDate    DateTime // dateOfDeath + 49 days
  
  // 49-day tracking
  targetLH        Int      @default(49)
  completedLH     Int      @default(0)
  bardoCompleted  Boolean  @default(false)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
  littleHouses LittleHouse[] @relation("DeceasedLittleHouses")

  @@index([userId])
  @@index([bardoEndDate])
  @@map("deceased_relatives")
}
```

---

## Service Logic

```typescript
export class BardoCampaignService {
  async createDeceasedProfile(userId: string, dto: CreateDeceasedDto) {
    const bardoEndDate = addDays(dto.dateOfDeath, 49);

    const deceased = await this.prisma.deceasedRelative.create({
      data: {
        userId,
        name: dto.name,
        relationship: dto.relationship,
        dateOfDeath: dto.dateOfDeath,
        bardoEndDate,
        targetLH: 49,
        completedLH: 0,
      },
    });

    // Create cronjob for daily reminders
    await this.schedulerService.createBardoReminder(deceased.id, {
      startDate: dto.dateOfDeath,
      endDate: bardoEndDate,
      frequency: 'DAILY',
    });

    return deceased;
  }

  async updateProgress(deceasedId: string) {
    const deceased = await this.prisma.deceasedRelative.findUnique({
      where: { id: deceasedId },
      include: {
        littleHouses: {
          where: { status: 'BURNED' },
        },
      },
    });

    const completedLH = deceased.littleHouses.length;
    const bardoCompleted = completedLH >= deceased.targetLH;

    return this.prisma.deceasedRelative.update({
      where: { id: deceasedId },
      data: {
        completedLH,
        bardoCompleted,
      },
    });
  }

  async sendDailyReminder(deceasedId: string) {
    const deceased = await this.prisma.deceasedRelative.findUnique({
      where: { id: deceasedId },
    });

    const daysRemaining = differenceInDays(deceased.bardoEndDate, new Date());
    const lhRemaining = deceased.targetLH - deceased.completedLH;

    if (daysRemaining > 0 && lhRemaining > 0) {
      await this.notificationService.send(deceased.userId, {
        title: `Chiến dịch Siêu độ ${deceased.name}`,
        body: `Còn ${daysRemaining} ngày, cần đốt thêm ${lhRemaining} TPT`,
        priority: 'HIGH',
      });
    }
  }
}
```

---

## UI Components

### Bardo Campaign Dashboard
```
┌────────────────────────────────────────────┐
│  ⏳ Chiến dịch Siêu độ 49 Ngày            │
├────────────────────────────────────────────┤
│  Người quá cố: Mẹ                         │
│  Ngày mất: 2026-03-01                     │
│  Kết thúc Bardo: 2026-04-19               │
│                                            │
│  Tiến độ:                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  32/49 TPT đã đốt                         │
│  [████████████████░░░░░░░░░] 65%          │
│                                            │
│  ⏰ Còn 17 ngày                           │
│  🎯 Cần thêm 17 TPT                       │
│                                            │
│  📊 Tốc độ trung bình: 1 TPT/ngày        │
│     (Tốt! Đang đúng tiến độ)              │
│                                            │
│  [Đốt TPT] [Xem lịch sử] [Chi tiết]     │
└────────────────────────────────────────────┘
```

### Daily Reminder Notification
```
┌────────────────────────────────────────────┐
│  🔔 NHẮC NHỞ KHẨN CẤP                     │
├────────────────────────────────────────────┤
│  Chiến dịch Siêu độ: Mẹ                   │
│                                            │
│  ⏰ Còn 5 ngày nữa là hết 49 ngày!        │
│  🎯 Cần đốt thêm 8 TPT                    │
│                                            │
│  Đây là cửa sổ vàng để siêu độ. Sau 49   │
│  ngày, vong linh đã định cõi, việc siêu   │
│  độ khó khăn hơn rất nhiều.               │
│                                            │
│  [Đốt TPT ngay] [Xem chi tiết]           │
└────────────────────────────────────────────┘
```

### Success State
```
┌────────────────────────────────────────────┐
│  ✅ Hoàn thành 49 Ngày                    │
├────────────────────────────────────────────┤
│  Người quá cố: Mẹ                         │
│  Hoàn thành: 50/49 TPT                    │
│                                            │
│  Chúc mừng! Bạn đã hoàn thành chiến dịch │
│  siêu độ 49 ngày.                         │
│                                            │
│  Hãy tiếp tục niệm kinh và ghi nhật ký   │
│  giấc mơ để xác nhận người quá cố đã     │
│  chuyển cõi.                              │
│                                            │
│  [Ghi mộng] [Xem lịch sử]                │
└────────────────────────────────────────────┘
```

---

## References
- Source: Intro to Guan Yin Citta - 49-day Bardo window
- `design/03-domains/engagement/REFERENCES/DREAM-SIN-TRACKER.md`

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 9 Logic 6

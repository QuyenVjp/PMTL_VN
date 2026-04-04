# STATUE-ACTIVATION-FLOW

## Owner
- `vows-merit` (altar management)

## Purpose
Thuật toán Kích hoạt Tôn tượng (Statue Activation Sequence) - Tự thỉnh Bồ Tát nhập tượng

---

## Business Rule

### Rule - Activation Requirements per Bodhisattva
**Nghiệp vụ [Nguồn: Intro to Guan Yin Citta]:**
- Nếu tượng chưa được Sư phụ Lư Quân Hoành ban phước, người dùng phải tự thỉnh.
- **Mỗi vị Bồ Tát có yêu cầu riêng:**

**Quán Thế Âm Bồ Tát (Guan Yin):**
- 7 biến Đại Bi Chú
- 7 biến Tâm Kinh

**Nam Kinh Bồ Tát (Nanjing Bodhisattva):**
- 108 biến Thánh hiệu (Holy Names)

**Thái Tuế Bồ Tát (Tai Sui):**
- 108 biến Thánh hiệu
- 21 biến Tiêu Tai Cát Tường Thần Chú

**Quan Đế / Châu Xương / Quan Bình:**
- 108 biến Thánh hiệu

---

## Business Rule 2: Timing Constraints

### Rule - Must be 1st or 15th Lunar Calendar
**Nghiệp vụ:**
- Nghi thức kích hoạt tượng **BẮT BUỘC** phải thực hiện vào:
  - Mùng 1 Âm lịch
  - Mùng 15 Âm lịch
- Khung giờ: 6:00 AM hoặc 8:00 AM

---

## Schema Hints

```prisma
enum StatueType {
  GUAN_YIN
  NANJING_BODHISATTVA
  TAI_SUI
  GUAN_DI
  ZHOU_CANG
  GUAN_PING
}

enum StatueStatus {
  PENDING          // Chưa kích hoạt
  ACTIVATED        // Đã thỉnh Bồ Tát nhập tượng
  BLESSED_BY_MASTER // Được Sư phụ khai quang (bypass activation)
}

model AltarStatue {
  id              String       @id
  publicId        String       @unique
  userId          String
  statueType      StatueType
  status          StatueStatus @default(PENDING)
  activatedAt     DateTime?
  activationLunarDate String?   // "2026-03-01" or "2026-03-15"
  activationHour  Int?         // 6 or 8

  // Activation completion tracking
  completedChants Json?        // {"daBeiZhou": 7, "xinJing": 7} or {"holyNames": 108}

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@map("altar_statues")
}
```

---

## Service Logic

```typescript
export class StatueActivationService {
  private readonly ACTIVATION_REQUIREMENTS: Record<
    StatueType,
    { daBeiZhou?: number; xinJing?: number; holyNames?: number; xiaoZai?: number }
  > = {
    GUAN_YIN: { daBeiZhou: 7, xinJing: 7 },
    NANJING_BODHISATTVA: { holyNames: 108 },
    TAI_SUI: { holyNames: 108, xiaoZai: 21 },
    GUAN_DI: { holyNames: 108 },
    ZHOU_CANG: { holyNames: 108 },
    GUAN_PING: { holyNames: 108 },
  };

  async activateStatue(
    userId: string,
    statueId: string,
    dto: ActivateStatueDto
  ) {
    const statue = await this.prisma.altarStatue.findUnique({
      where: { id: statueId, userId },
    });

    if (!statue) {
      throw new NotFoundException('Statue not found');
    }

    if (statue.status === StatueStatus.ACTIVATED) {
      throw new BadRequestException('Statue is already activated');
    }

    // Validate lunar date (1st or 15th)
    const lunarDay = this.lunarCalendar.getLunarDay(dto.activationDate);
    if (lunarDay !== 1 && lunarDay !== 15) {
      throw new BadRequestException(
        'Activation must be performed on 1st or 15th of lunar calendar'
      );
    }

    // Validate hour (6 AM or 8 AM)
    const hour = dto.activationDate.getHours();
    if (hour !== 6 && hour !== 8) {
      throw new BadRequestException(
        'Activation must be performed at 6:00 AM or 8:00 AM'
      );
    }

    // Validate completed chants
    const requirements = this.ACTIVATION_REQUIREMENTS[statue.statueType];
    const completed = dto.completedChants;

    if (requirements.daBeiZhou && completed.daBeiZhou !== requirements.daBeiZhou) {
      throw new BadRequestException(
        `Guan Yin requires exactly ${requirements.daBeiZhou} Da Bei Zhou, you provided ${completed.daBeiZhou}`
      );
    }

    if (requirements.xinJing && completed.xinJing !== requirements.xinJing) {
      throw new BadRequestException(
        `Guan Yin requires exactly ${requirements.xinJing} Xin Jing, you provided ${completed.xinJing}`
      );
    }

    if (requirements.holyNames && completed.holyNames !== requirements.holyNames) {
      throw new BadRequestException(
        `${statue.statueType} requires exactly ${requirements.holyNames} Holy Names, you provided ${completed.holyNames}`
      );
    }

    if (requirements.xiaoZai && completed.xiaoZai !== requirements.xiaoZai) {
      throw new BadRequestException(
        `Tai Sui requires exactly ${requirements.xiaoZai} Xiao Zai mantras, you provided ${completed.xiaoZai}`
      );
    }

    // All validations passed - activate
    return this.prisma.altarStatue.update({
      where: { id: statueId },
      data: {
        status: StatueStatus.ACTIVATED,
        activatedAt: dto.activationDate,
        activationLunarDate: this.lunarCalendar.formatLunarDate(dto.activationDate),
        activationHour: hour,
        completedChants: completed,
      },
    });
  }
}
```

---

## UI Components

### Statue Activation Form
```
┌────────────────────────────────────────────┐
│  🙏 Kích hoạt Tôn tượng                   │
├────────────────────────────────────────────┤
│  Tượng: Quán Thế Âm Bồ Tát               │
│  Trạng thái: Chưa kích hoạt               │
│                                            │
│  Yêu cầu niệm:                            │
│  [x] 7 biến Đại Bi Chú                    │
│  [x] 7 biến Tâm Kinh                      │
│                                            │
│  ⚠️ QUAN TRỌNG:                           │
│  • Phải thực hiện vào mùng 1 hoặc 15     │
│    Âm lịch                                 │
│  • Khung giờ: 6:00 AM hoặc 8:00 AM       │
│                                            │
│  Ngày thực hiện:                          │
│  [2026-04-15] (Mùng 15 Âm lịch)          │
│                                            │
│  Giờ thực hiện:                           │
│  ( ) 6:00 AM  (●) 8:00 AM                │
│                                            │
│  [Hủy]                [Kích hoạt]         │
└────────────────────────────────────────────┘
```

### Validation Error
```
┌────────────────────────────────────────────┐
│  🚫 KHÔNG THỂ KÍCH HOẠT                   │
├────────────────────────────────────────────┤
│  Ngày bạn chọn KHÔNG phải mùng 1 hoặc    │
│  mùng 15 Âm lịch.                         │
│                                            │
│  Nghi thức thỉnh Bồ Tát nhập tượng chỉ   │
│  được thực hiện vào 2 ngày này.           │
│                                            │
│  Hãy chọn lại ngày.                       │
│                                            │
│  [Chọn lại]                               │
└────────────────────────────────────────────┘
```

---

## References
- Source: Intro to Guan Yin Citta - Statue activation protocols
- `design/03-domains/vows-merit/REFERENCES/PHAT-DAI-BAO-DUONG.md`

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 9 Logic 1

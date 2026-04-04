# HARD-CAP-88-BUDDHAS

## Owner
- `wisdom-qa` (Prescription Engine)

## Purpose
Trần tối đa của Lễ Phật Đại Sám Hối Văn (Hard Cap on 88 Buddhas) - Prevent uncontrollable karma activation

---

## Business Rule

### Rule - Absolute Maximum 7 Times Per Day
**Nghiệp vụ [Nguồn 239]:**
- *Lễ Phật Đại Sám Hối Văn* (88 Buddhas Great Repentance) kích hoạt nghiệp chướng rất mạnh
- Dù mắc bệnh nan y (ung thư) cần sám hối gấp
- Số lượng tối đa mỗi ngày **TUYỆT ĐỐI KHÔNG ĐƯỢC VƯỢT QUÁ 7 BIẾN**
- **Lý do:** Nếu vượt, nghiệp chướng sẽ kéo đến ồ ạt, cơ thể không thể chịu đựng nổi

---

## Schema Hints

```prisma
model RecitationTask {
  id              String     @id
  userId          String
  mantraType      MantraType
  dailyCount      Int
  maxLimit        Int?       // For hard-capped mantras
  createdAt       DateTime   @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId, createdAt])
  @@map("recitation_tasks")
}

// Validation tracking
model DailyRecitationLog {
  id              String     @id
  userId          String
  mantraType      MantraType
  count           Int
  logDate         DateTime   @default(now())
  
  user User @relation(fields: [userId], references: [id])

  @@unique([userId, mantraType, logDate])
  @@map("daily_recitation_logs")
}
```

---

## Service Logic

```typescript
export class RecitationPrescriptionEngine {
  private readonly HARD_CAPS: Record<string, { max: number; reason: string }> = {
    '88_BUDDHAS': {
      max: 7,
      reason: 'Exceeding 7 times will activate uncontrollable karmic obstacles',
    },
  };

  async addDailyTask(userId: string, dto: AddDailyTaskDto) {
    // Check hard cap for 88 Buddhas
    if (dto.mantraType === '88_BUDDHAS') {
      const cap = this.HARD_CAPS['88_BUDDHAS'];

      if (dto.count > cap.max) {
        throw new BadRequestException({
          code: 'HARD_CAP_VIOLATION',
          message: `KHÔNG được vượt quá ${cap.max} biến/ngày để tránh nghiệp chướng bùng phát không thể kiểm soát.`,
          requestedCount: dto.count,
          maxAllowed: cap.max,
          mantra: '88 Buddhas Great Repentance',
        });
      }
    }

    return this.prisma.recitationTask.create({
      data: {
        userId,
        mantraType: dto.mantraType,
        dailyCount: dto.count,
        maxLimit: dto.mantraType === '88_BUDDHAS' ? 7 : null,
      },
    });
  }

  async validateDailyLog(userId: string, dto: LogRecitationDto) {
    if (dto.mantraType === '88_BUDDHAS') {
      // Check today's total
      const today = startOfDay(new Date());
      const todayLogs = await this.prisma.dailyRecitationLog.findMany({
        where: {
          userId,
          mantraType: '88_BUDDHAS',
          logDate: {
            gte: today,
          },
        },
      });

      const currentTotal = todayLogs.reduce((sum, log) => sum + log.count, 0);
      const newTotal = currentTotal + dto.count;

      if (newTotal > 7) {
        throw new BadRequestException({
          code: 'DAILY_LIMIT_EXCEEDED',
          message: `Hôm nay bạn đã niệm ${currentTotal} biến. Thêm ${dto.count} biến nữa sẽ vượt giới hạn 7 biến/ngày.`,
          currentTotal,
          requestedAdd: dto.count,
          newTotal,
          maxAllowed: 7,
        });
      }
    }

    return this.prisma.dailyRecitationLog.create({
      data: {
        userId,
        mantraType: dto.mantraType,
        count: dto.count,
      },
    });
  }
}
```

---

## UI Components

### Form Validation (Hard Block)
```
┌────────────────────────────────────────────┐
│  🚫 VƯỢT GIỚI HẠN AN TOÀN                 │
├────────────────────────────────────────────┤
│  Bài: 88 Buddhas Great Repentance         │
│  Số lượng bạn nhập: 10 biến               │
│  Giới hạn tối đa: 7 biến/ngày             │
│                                            │
│  LÝ DO:                                   │
│  Lễ Phật 88 Buddhas kích hoạt nghiệp     │
│  chướng cực mạnh.                         │
│                                            │
│  Nếu vượt quá 7 biến/ngày, nghiệp chướng │
│  sẽ kéo đến ồ ạt và cơ thể KHÔNG THỂ     │
│  chịu đựng nổi.                           │
│                                            │
│  Ngay cả khi bạn đang bệnh nan y cần sám │
│  hối gấp, vẫn TUYỆT ĐỐI KHÔNG được vượt. │
│                                            │
│  [Giảm xuống 7 biến] [Hủy]               │
└────────────────────────────────────────────┘
```

### Input Field with Visual Limit
```
┌────────────────────────────────────────────┐
│  Lễ Phật Đại Sám Hối Văn (88 Buddhas)    │
├────────────────────────────────────────────┤
│  Số biến/ngày:                            │
│  [_____7_____] (Tối đa: 7)               │
│                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  [██████████████████████████] 7/7 MAX    │
│  ⚠️ ĐÃ ĐẠT GIỚI HẠN AN TOÀN              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                            │
│  💡 TẠI SAO CHỈ 7 BIẾN?                   │
│  Bài này kích hoạt nghiệp chướng rất     │
│  mạnh. Vượt quá 7 sẽ khiến nghiệp chướng │
│  bùng phát không kiểm soát được.          │
│                                            │
│  [Lưu]                                    │
└────────────────────────────────────────────┘
```

### Daily Progress Tracker
```
┌────────────────────────────────────────────┐
│  📊 Tiến độ Hôm Nay                       │
├────────────────────────────────────────────┤
│  88 Buddhas Great Repentance:             │
│                                            │
│  Đã niệm: 5 biến                          │
│  Còn lại: 2 biến                          │
│  Giới hạn: 7 biến/ngày                    │
│                                            │
│  [█████████████████░░░░░] 5/7             │
│                                            │
│  ⚠️ Sắp đạt giới hạn an toàn              │
│                                            │
│  [Ghi nhận thêm]                          │
└────────────────────────────────────────────┘
```

### Exceeded Warning (Inline)
```
┌────────────────────────────────────────────┐
│  🔴 HÔM NAY ĐÃ ĐẠT GIỚI HẠN              │
├────────────────────────────────────────────┤
│  Bạn đã niệm 7 biến 88 Buddhas hôm nay.  │
│                                            │
│  KHÔNG thể thêm nữa.                      │
│                                            │
│  Hãy chuyển sang niệm:                    │
│  • Chú Đại Bi (cầu sức khỏe)             │
│  • Tâm Kinh (giải quyết vấn đề)          │
│                                            │
│  [Về Dashboard]                           │
└────────────────────────────────────────────┘
```

---

## References
- Source 239: 88 Buddhas hard cap restrictions
- `design/03-domains/vows-merit/REFERENCES/REPENTANCE-LH-RATIO.md`

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 10 Logic 2

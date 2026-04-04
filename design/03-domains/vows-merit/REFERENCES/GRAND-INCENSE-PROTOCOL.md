# GRAND-INCENSE-PROTOCOL

## Owner
- `vows-merit` (altar management)

## Purpose
Giao thức "Đại Hương" (Grand Incense / Sandalwood Protocol) - 3-step loop validation

---

## Business Rule

### Rule - Sandalwood Grand Incense on 1st & 15th
**Nghiệp vụ [Nguồn: Intro to Guan Yin Citta]:**
- Cúng Đại Hương (Gỗ Trầm hương/Sandalwood) vào mùng 1/15 Âm lịch
- **Quy trình bắt buộc:**
  1. Mồi lửa từ đèn dầu
  2. Dùng tay quạt tắt lửa (KHÔNG ĐƯỢC thổi)
  3. Khói bốc lên mới là Đại Hương
- **Bắt buộc lặp lại CHÍNH XÁC 3 LẦN**

---

## Schema Hints

```prisma
model GrandIncenseSession {
  id              String   @id
  publicId        String   @unique
  userId          String
  sessionDate     DateTime
  lunarDate       String   // "2026-03-01" or "2026-03-15"
  
  // 3-step loop tracking
  step1Completed  Boolean  @default(false)
  step2Completed  Boolean  @default(false)
  step3Completed  Boolean  @default(false)
  
  completedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@map("grand_incense_sessions")
}
```

---

## Service Logic

```typescript
export class GrandIncenseService {
  async startSession(userId: string, dto: StartGrandIncenseDto) {
    // Validate lunar date
    const lunarDay = this.lunarCalendar.getLunarDay(dto.sessionDate);
    if (lunarDay !== 1 && lunarDay !== 15) {
      throw new BadRequestException(
        'Grand Incense can only be offered on 1st or 15th of lunar calendar'
      );
    }

    return this.prisma.grandIncenseSession.create({
      data: {
        userId,
        sessionDate: dto.sessionDate,
        lunarDate: this.lunarCalendar.formatLunarDate(dto.sessionDate),
      },
    });
  }

  async completeStep(
    userId: string,
    sessionId: string,
    step: 1 | 2 | 3
  ) {
    const session = await this.prisma.grandIncenseSession.findUnique({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Update step
    const updateData: any = {};
    if (step === 1) updateData.step1Completed = true;
    if (step === 2) updateData.step2Completed = true;
    if (step === 3) updateData.step3Completed = true;

    // Check if all 3 steps completed
    const allCompleted =
      (step === 1 ? true : session.step1Completed) &&
      (step === 2 ? true : session.step2Completed) &&
      (step === 3 ? true : session.step3Completed);

    if (allCompleted) {
      updateData.completedAt = new Date();
    }

    return this.prisma.grandIncenseSession.update({
      where: { id: sessionId },
      data: updateData,
    });
  }
}
```

---

## UI Components

### 3-Step Loop Interface
```
┌────────────────────────────────────────────┐
│  🔥 Dâng Đại Hương (Grand Incense)        │
├────────────────────────────────────────────┤
│  Ngày: Mùng 15 Âm lịch                    │
│                                            │
│  Quy trình (Lặp lại 3 lần):              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                            │
│  LẦN 1:                                   │
│  [x] Đã mồi lửa từ đèn dầu                │
│  [x] Đã dùng tay quạt tắt lửa (KHÔNG thổi)│
│                                            │
│  LẦN 2:                                   │
│  [x] Đã mồi lửa từ đèn dầu                │
│  [x] Đã dùng tay quạt tắt lửa (KHÔNG thổi)│
│                                            │
│  LẦN 3:                                   │
│  [x] Đã mồi lửa từ đèn dầu                │
│  [ ] Đã dùng tay quạt tắt lửa (KHÔNG thổi)│
│                                            │
│  ⚠️ Phải hoàn thành cả 3 lần              │
│                                            │
│  [Hoàn thành lần 3]                       │
└────────────────────────────────────────────┘
```

### Success State
```
┌────────────────────────────────────────────┐
│  ✅ Đại Hương đã hoàn thành               │
├────────────────────────────────────────────┤
│  Bạn đã hoàn thành quy trình dâng Đại    │
│  Hương đúng pháp (3 lần).                 │
│                                            │
│  Công đức đã được ghi nhận.               │
│                                            │
│  [OK]                                     │
└────────────────────────────────────────────┘
```

---

## References
- Source: Intro to Guan Yin Citta - Grand Incense protocols
- `design/03-domains/vows-merit/REFERENCES/ALTAR-POWER-SEQUENCE.md`

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 9 Logic 2

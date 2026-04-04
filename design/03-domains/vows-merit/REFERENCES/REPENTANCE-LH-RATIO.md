# REPENTANCE-LH-RATIO

## Owner
- `vows-merit` + `engagement`

## Purpose
Bộ kiểm soát tỷ lệ Sám hối - Tiểu Phương Tử (Repentance-to-Little House Ratio Enforcer)

---

## Business Rule: Ratio Enforcement

### Rule - 88 Buddhas Activates Karma → Must Burn LH
**Nghiệp vụ:**
- *Lễ Phật Đại Sám Hối Văn* (88 Buddhas Great Repentance) kích hoạt nghiệp chướng thành linh tính.
- **Tỷ lệ bắt buộc:** Niệm `N` biến/ngày → Đốt tối thiểu `N` TPT/tuần

**Examples:**
- User set 3 biến/ngày → Bắt buộc 3 TPT/tuần
- User set 5 biến/ngày → Bắt buộc 5 TPT/tuần
- User set 7 biến/ngày → Bắt buộc 7 TPT/tuần

---

## Schema Hints

```prisma
model RepentanceRatioMandate {
  id                    String   @id
  publicId              String   @unique
  userId                String
  dailyRepentanceCount  Int      // N biến/ngày
  weeklyLHMandate       Int      // N TPT/tuần (same as daily)
  currentWeekLHCount    Int      @default(0)
  weekStartDate         DateTime
  mandateDeficit        Int      @default(0) // Nợ TPT
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@map("repentance_ratio_mandates")
}
```

---

## Service Logic

```typescript
export class RepentanceRatioService {
  async updateDailyRepentance(userId: string, dailyCount: number) {
    await this.prisma.repentanceRatioMandate.upsert({
      where: { userId },
      create: {
        userId,
        dailyRepentanceCount: dailyCount,
        weeklyLHMandate: dailyCount, // Same number
        weekStartDate: startOfWeek(new Date()),
      },
      update: {
        dailyRepentanceCount: dailyCount,
        weeklyLHMandate: dailyCount,
      },
    });
  }

  async checkWeeklyCompliance(userId: string): Promise<{
    mandate: number;
    completed: number;
    deficit: number;
    warning: string | null;
  }> {
    const mandate = await this.prisma.repentanceRatioMandate.findUnique({
      where: { userId },
    });

    if (!mandate) return { mandate: 0, completed: 0, deficit: 0, warning: null };

    const deficit = mandate.weeklyLHMandate - mandate.currentWeekLHCount;

    return {
      mandate: mandate.weeklyLHMandate,
      completed: mandate.currentWeekLHCount,
      deficit: deficit > 0 ? deficit : 0,
      warning: deficit > 0 
        ? `BẠN ĐANG NỢ ${deficit} TPT. Hãy giảm số biến Lễ Phật xuống để tránh nghiệp chướng bùng phát.`
        : null,
    };
  }
}
```

---

## UI Components

### Dashboard Warning Widget
```
┌────────────────────────────────────────────┐
│  ⚠️ CẢNH BÁO: Nợ Tiểu Phương Tử          │
├────────────────────────────────────────────┤
│  Tuần này:                                │
│  • Lễ Phật 88 Buddhas: 5 biến/ngày       │
│  • Bắt buộc đốt: 5 TPT/tuần              │
│  • Đã đốt: 2 TPT                          │
│  • Còn nợ: 3 TPT                          │
│                                            │
│  🚨 Bạn đang nợ 3 TPT!                    │
│     Hãy giảm Lễ Phật xuống để tránh      │
│     nghiệp chướng bùng phát.              │
│                                            │
│  [Đốt TPT ngay] [Giảm Lễ Phật]           │
└────────────────────────────────────────────┘
```

---

## References
- External source: Master Lu teachings về tỷ lệ sám hối và TPT

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 7 Logic 4

# ABORTION-KARMA-LATENCY

## Owner
- `wisdom-qa` (Diagnostic Engine)

## Purpose
Bộ đếm "Bom nổ chậm" Nghiệp Phá Thai (Abortion Karma Latency Alert)

---

## Business Rule

### Rule - 10-Year Latency Bomb
**Nghiệp vụ [Nguồn: Testimonial Case Huiping Wang]:**
- Nghiệp phá thai có thể "ngủ đông" (latent) nhiều năm
- Trường hợp thực tế: Phá thai 1993 → Ung thư cổ tử cung 2009 (16 năm sau)
- **Critical window: 10-15 năm sau phá thai**
- Nếu chưa siêu độ đủ TPT → nghiệp bùng phát thành bệnh hiểm nghèo

---

## Schema Hints

```prisma
model UserHealthProfile {
  id                  String   @id
  userId              String   @unique
  hasAbortion         Boolean  @default(false)
  abortionDate        DateTime?
  abortionCount       Int?
  
  // Latency tracking
  latencyAlertSent    Boolean  @default(false)
  yearsSinceAbortion  Int?     // Calculated field
  
  user User @relation(fields: [userId], references: [id])
  @@map("user_health_profiles")
}

model AbortionKarmaAlert {
  id              String   @id
  userId          String
  triggerDate     DateTime @default(now())
  yearsSince      Int
  lhBurned        Int      // LH burned for child
  lhRequired      Int      @default(21)
  severity        String   // WARNING, CRITICAL
  
  user User @relation(fields: [userId], references: [id])
  @@map("abortion_karma_alerts")
}
```

---

## Service Logic

```typescript
export class KarmicLatencyCronService {
  @Cron('0 0 * * *') // Daily check
  async checkAbortionLatency() {
    const profiles = await this.prisma.userHealthProfile.findMany({
      where: {
        hasAbortion: true,
        latencyAlertSent: false,
      },
      include: {
        user: {
          include: {
            littleHouses: {
              where: {
                offerTo: { contains: 'Child of' },
                status: 'BURNED',
              },
            },
          },
        },
      },
    });

    for (const profile of profiles) {
      const yearsSince = this.calculateYearsSince(profile.abortionDate);
      
      if (yearsSince >= 10) {
        const lhBurned = profile.user.littleHouses.length;
        
        if (lhBurned < 21) {
          await this.triggerLatencyAlert(profile.userId, yearsSince, lhBurned);
        }
      }
    }
  }

  private async triggerLatencyAlert(
    userId: string,
    yearsSince: number,
    lhBurned: number
  ) {
    await this.prisma.abortionKarmaAlert.create({
      data: {
        userId,
        yearsSince,
        lhBurned,
        severity: yearsSince >= 15 ? 'CRITICAL' : 'WARNING',
      },
    });

    await this.notificationService.send(userId, {
      title: '🚨 CẢNH BÁO: Nghiệp phá thai bom nổ chậm',
      body: `Ác nghiệp phá thai thường bùng phát mạnh mẽ thành bệnh hiểm nghèo sau ${yearsSince} năm. Hãy lập tức niệm TPT để hóa giải trước khi quá muộn!`,
      priority: 'CRITICAL',
    });
  }

  private calculateYearsSince(date: Date): number {
    return Math.floor(
      (new Date().getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
  }
}
```

---

## UI Components

```
┌────────────────────────────────────────────┐
│  🚨 CẢNH BÁO KHẨN CẤP                     │
├────────────────────────────────────────────┤
│  NGHIỆP PHÁ THAI BOM NỔ CHẬM              │
│                                            │
│  Năm phá thai: 1993                       │
│  Thời gian đã qua: 16 năm                 │
│                                            │
│  ⚠️ CỬA SỔ NGUY HIỂM (10-15 năm)        │
│                                            │
│  TPT đã đốt cho con: 8/21                 │
│  [████████░░░░░░░░░░░░] 38%              │
│                                            │
│  CẢNH BÁO:                                │
│  Nghiệp phá thai thường "ngủ đông" nhiều │
│  năm rồi BÙNGphát mạnh mẽ thành ung thư  │
│  hoặc bệnh nan y.                         │
│                                            │
│  Hãy lập tức niệm 13 TPT còn lại!        │
│                                            │
│  [Niệm TPT ngay] [Xem chi tiết]          │
└────────────────────────────────────────────┘
```

---

## References
- Testimonial Case: Huiping Wang (1993 abortion → 2009 cancer)

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 11 Logic 1

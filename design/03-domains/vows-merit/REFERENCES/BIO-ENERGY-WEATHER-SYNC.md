# BIO-ENERGY-WEATHER-SYNC

## Owner
- `vows-merit` (Recitation Guard) + `engagement`

## Purpose
Đồng bộ Môi trường & Thời tiết cho Bệnh nhân suy nhược (Bio-Energy Weather Sync)

---

## Business Rule

### Rule - Weak Patients: Sunny Daytime Only
**Nghiệp vụ [Nguồn: Intro to Guan Yin Citta - Recitation]:**
- Người cơ thể ốm yếu/suy nhược
- **KHÔNG ĐƯỢC** niệm Tâm Kinh/Vãng Sinh Chú:
  - Ban đêm
  - Trời nhiều mây (cloudy)
- **BẮT BUỘC:**
  - Ban ngày
  - Trời nắng (sunny)
  - Mượn năng lượng Dương

---

## Schema Hints

```prisma
model UserHealthProfile {
  // ... existing
  healthStatus     String @default('NORMAL') // NORMAL, WEAK, CRITICAL
}
```

---

## Service Logic

```typescript
export class BioEnergyWeatherGuard {
  async validateRecitation(userId: string, dto: LogRecitationDto) {
    const profile = await this.prisma.userHealthProfile.findUnique({
      where: { userId },
    });

    if (profile.healthStatus === 'WEAK') {
      const isNight = this.isAfterSunset();
      const weather = await this.weatherAPI.getCurrent();

      if (
        (dto.mantraType === 'XIN_JING' || dto.mantraType === 'WANG_SHENG_ZHOU') &&
        (isNight || weather.cloudCover > 50)
      ) {
        throw new BadRequestException(
          'Người cơ thể yếu PHẢI niệm vào ban ngày và trời nắng để mượn năng lượng Dương'
        );
      }
    }
  }

  private isAfterSunset(): boolean {
    const now = new Date();
    const sunsetTime = this.getSunsetTime();
    return now > sunsetTime;
  }
}
```

---

## UI Component

```
┌────────────────────────────────────────────┐
│  ☁️ CẢNH BÁO: Thời tiết không phù hợp    │
├────────────────────────────────────────────┤
│  Tình trạng sức khỏe: Yếu                 │
│  Thời tiết hiện tại: Nhiều mây (70%)      │
│  Thời gian: 19:00 (Sau hoàng hôn)         │
│                                            │
│  Bạn KHÔNG THỂ niệm Tâm Kinh/Vãng Sinh   │
│  Chú vào lúc này.                         │
│                                            │
│  Hãy đợi đến:                             │
│  • Ban ngày (6:00 - 18:00)                │
│  • Trời nắng (< 30% mây)                  │
│                                            │
│  Để mượn năng lượng Dương bảo vệ cơ thể. │
│                                            │
│  [Tôi hiểu]                               │
└────────────────────────────────────────────┘
```

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 11 Logic 9

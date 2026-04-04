# ANCESTRAL-KILLING-KARMA

## Owner
- `wisdom-qa` (Prescription Engine)

## Purpose
Thuật toán Di truyền Nghiệp Sát Sinh (Ancestral Killing Karma Propagator)

---

## Business Rule

### Rule - Hereditary Killing Karma from Parents/Grandparents
**Nghiệp vụ [Nguồn: Intro to Guan Yin Citta - Severe Illness]:**
- Cha mẹ/ông bà làm nghề sát sinh → Nghiệp truyền sang con cháu
- **Nghề sát sinh:**
  - Giết mổ (Butcher)
  - Ngư dân (Fisherman)
  - Săn bắn (Hunter)
  - Chủ lò mổ
- Gây ra bệnh nan y cho thế hệ sau

**Hóa giải:**
- Niệm **27-49 biến Vãng Sinh Chú** mỗi ngày (vĩnh viễn)
- Đốt **3 TPT/tuần** cho oan gia trái chủ

---

## Schema Hints

```prisma
enum AncestralOccupation {
  BUTCHER
  FISHERMAN
  HUNTER
  SLAUGHTERHOUSE_OWNER
  FARMER_NO_KILLING
  OFFICE_WORKER
  OTHER
}

model UserProfile {
  // ... existing
  ancestralOccupation  AncestralOccupation?
  hasHereditaryKillingKarma Boolean @default(false)
}
```

---

## Service Logic

```typescript
export class AncestralKarmaService {
  private readonly KILLING_OCCUPATIONS = [
    AncestralOccupation.BUTCHER,
    AncestralOccupation.FISHERMAN,
    AncestralOccupation.HUNTER,
    AncestralOccupation.SLAUGHTERHOUSE_OWNER,
  ];

  async setupHereditaryKarma(userId: string, occupation: AncestralOccupation) {
    if (this.KILLING_OCCUPATIONS.includes(occupation)) {
      // Auto-inject daily mantras
      await this.prisma.dailyRecitation.create({
        data: {
          userId,
          mantraType: 'WANG_SHENG_ZHOU',
          count: 49,
          isPermanent: true,
          reason: 'Hereditary killing karma from ancestors',
        },
      });

      // Auto-inject weekly LH mandate
      await this.prisma.debtLedger.create({
        data: {
          userId,
          type: 'HEREDITARY_KILLING_KARMA',
          weeklyLHMandatory: 3,
          reason: 'Ancestors worked in killing profession',
        },
      });

      // Update profile
      await this.prisma.userProfile.update({
        where: { userId },
        data: { hasHereditaryKillingKarma: true },
      });
    }
  }
}
```

---

## UI Component

```
┌────────────────────────────────────────────┐
│  ⚠️ NGHIỆP DI TRUYỀN                      │
├────────────────────────────────────────────┤
│  Nghề tổ tiên: Ngư dân                    │
│                                            │
│  Nghiệp sát sinh từ cha/ông bà sẽ truyền │
│  sang con cháu và gây bệnh nan y.         │
│                                            │
│  HÓA GIẢI BẮT BUỘC:                       │
│  • 49 biến Vãng Sinh Chú/ngày (vĩnh viễn)│
│  • 3 TPT/tuần cho oan gia trái chủ        │
│                                            │
│  Đã tự động thêm vào công khóa hằng ngày. │
│                                            │
│  [Tôi hiểu]                               │
└────────────────────────────────────────────┘
```

---

## References
- Source: Intro to Guan Yin Citta - Severe Illness chapter

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 11 Logic 2

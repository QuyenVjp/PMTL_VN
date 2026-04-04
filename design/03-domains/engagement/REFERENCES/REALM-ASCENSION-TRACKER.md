# REALM-ASCENSION-TRACKER

## Owner
- `engagement` (Little House tracking)

## Purpose
Thuật toán Chuyển Cõi 21x3 (Realm Ascension Tracker) - Track soul progression through realms

---

## Business Rule

### Rule - 21 Little Houses per Realm
**Nghiệp vụ [Nguồn: Intro to Guan Yin Citta]:**
- Để đẩy vong linh lên cõi cao hơn, cứ mỗi cõi cần **1 đợt 21 TPT**
- **Thứ tự cõi:**
  1. Địa phủ (Underworld) → 21 TPT
  2. Nhân đạo (Human Realm) → 21 TPT  
  3. A-tu-la (Asura Realm) → 21 TPT
  4. Cõi Trời (Heaven Realm)

- Sau mỗi đợt 21 TPT, phải kiểm tra giấc mơ để xác nhận vong linh đã chuyển cõi

---

## Schema Hints

```prisma
enum SoulRealm {
  UNDERWORLD    // Địa phủ
  HUMAN         // Nhân đạo
  ASURA         // A-tu-la
  HEAVEN        // Cõi Trời
  UNKNOWN       // Chưa xác định
}

model RealmAscensionTracker {
  id              String     @id
  publicId        String     @unique
  deceasedId      String
  currentRealm    SoulRealm  @default(UNKNOWN)
  targetRealm     SoulRealm  @default(HEAVEN)
  
  // 21-batch tracking
  totalBatches    Int        @default(0) // Số đợt 21 TPT đã hoàn thành
  currentBatchLH  Int        @default(0) // Số TPT trong đợt hiện tại
  
  // Dream verification
  lastDreamCheck  DateTime?
  lastDreamResult String?    // "BRIGHTER", "SAME", "WORSE"
  
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  deceased DeceasedRelative @relation(fields: [deceasedId], references: [id])

  @@unique([deceasedId])
  @@map("realm_ascension_trackers")
}
```

---

## Service Logic

```typescript
export class RealmAscensionService {
  async updateProgress(deceasedId: string) {
    const tracker = await this.prisma.realmAscensionTracker.findUnique({
      where: { deceasedId },
      include: {
        deceased: {
          include: {
            littleHouses: {
              where: { status: 'BURNED' },
              orderBy: { burnedAt: 'asc' },
            },
          },
        },
      },
    });

    const totalLH = tracker.deceased.littleHouses.length;
    const totalBatches = Math.floor(totalLH / 21);
    const currentBatchLH = totalLH % 21;

    // Check if completed a new batch
    if (totalBatches > tracker.totalBatches) {
      // New batch completed - prompt dream verification
      await this.notificationService.send(tracker.deceased.userId, {
        title: 'Hoàn thành đợt 21 TPT!',
        body: `Hãy ghi lại giấc mơ để xác nhận ${tracker.deceased.name} đã chuyển cõi`,
        priority: 'HIGH',
      });
    }

    return this.prisma.realmAscensionTracker.update({
      where: { deceasedId },
      data: {
        totalBatches,
        currentBatchLH,
      },
    });
  }

  async recordDreamVerification(
    deceasedId: string,
    dto: RecordDreamDto
  ) {
    const tracker = await this.prisma.realmAscensionTracker.findUnique({
      where: { deceasedId },
    });

    // Ascend realm if dream is positive
    let newRealm = tracker.currentRealm;
    if (dto.result === 'BRIGHTER') {
      newRealm = this.getNextRealm(tracker.currentRealm);
    }

    return this.prisma.realmAscensionTracker.update({
      where: { deceasedId },
      data: {
        currentRealm: newRealm,
        lastDreamCheck: new Date(),
        lastDreamResult: dto.result,
      },
    });
  }

  private getNextRealm(current: SoulRealm): SoulRealm {
    const progression = [
      SoulRealm.UNDERWORLD,
      SoulRealm.HUMAN,
      SoulRealm.ASURA,
      SoulRealm.HEAVEN,
    ];
    const currentIndex = progression.indexOf(current);
    return progression[Math.min(currentIndex + 1, progression.length - 1)];
  }
}
```

---

## UI Components

### Realm Progression Dashboard
```
┌────────────────────────────────────────────┐
│  🏯 Trạm Chuyển Cõi                       │
├────────────────────────────────────────────┤
│  Người quá cố: Mẹ                         │
│                                            │
│  Cõi hiện tại: Nhân đạo                   │
│  Mục tiêu: Cõi Trời                       │
│                                            │
│  Tiến trình:                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                            │
│  Đợt 1: [████████████████████] 21/21 ✅   │
│         Địa phủ → Nhân đạo                │
│         Đã xác nhận qua giấc mơ           │
│                                            │
│  Đợt 2: [████████████░░░░░░░░] 13/21 ⏳   │
│         Nhân đạo → A-tu-la                │
│         Cần thêm 8 TPT                    │
│                                            │
│  Đợt 3: [░░░░░░░░░░░░░░░░░░░░] 0/21 🔒   │
│         A-tu-la → Cõi Trời                │
│                                            │
│  [Đốt TPT] [Ghi mộng]                     │
└────────────────────────────────────────────┘
```

### Batch Completion Notification
```
┌────────────────────────────────────────────┐
│  🎉 Hoàn thành đợt 21 TPT!                │
├────────────────────────────────────────────┤
│  Người quá cố: Mẹ                         │
│  Đợt: 2/3 (Nhân đạo → A-tu-la)           │
│                                            │
│  Bạn đã hoàn thành 21 TPT cho đợt này.   │
│                                            │
│  Hãy ghi lại giấc mơ gần đây để xác nhận │
│  Mẹ đã chuyển cõi:                        │
│  • Có thấy Mẹ trong mộng không?           │
│  • Mẹ có vẻ sáng sủa, vui vẻ hơn không?  │
│                                            │
│  [Ghi mộng ngay] [Để sau]                │
└────────────────────────────────────────────┘
```

### Dream Verification Form
```
┌────────────────────────────────────────────┐
│  💭 Xác nhận Chuyển Cõi qua Giấc Mơ      │
├────────────────────────────────────────────┤
│  Người quá cố: Mẹ                         │
│  Đợt: 2 (Nhân đạo → A-tu-la)             │
│                                            │
│  Bạn có mơ thấy Mẹ gần đây không?        │
│  (●) Có  ( ) Không                        │
│                                            │
│  Trạng thái của Mẹ trong mộng:           │
│  (●) Sáng sủa, vui vẻ hơn (TÍCH CỰC)    │
│  ( ) Giống như trước (TRUNG LẬP)         │
│  ( ) Buồn bã, u ám (TIÊU CỰC)           │
│                                            │
│  Ghi chú về giấc mơ:                     │
│  [_________________________________]      │
│  [_________________________________]      │
│                                            │
│  [Lưu]                                    │
└────────────────────────────────────────────┘
```

---

## References
- Source: Intro to Guan Yin Citta - Realm ascension protocols
- `design/03-domains/calendar/REFERENCES/BARDO-49-DAY-TRACKER.md`

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 9 Logic 7

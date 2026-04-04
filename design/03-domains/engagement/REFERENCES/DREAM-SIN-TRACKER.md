# DREAM-SIN-TRACKER

## Owner
- `engagement` (Dream Journal + Symptom Tracking)

## Purpose
Báo cáo Tội sát sinh trong giấc mơ (Dream Sin / Virtual Killing Tracker)

---

## Business Rule 1: Dream Animal Harm

### Rule - Harming Animals in Dreams → Auto-prescribe Mantras
**Nghiệp vụ:**
- Vô tình làm tổn thương động vật trong đời thực
- Hoặc **MƠ THẤY** mình giết/làm đau động vật trong giấc mơ
- → Sinh ra ác nghiệp và phải niệm **21 biến Vãng Sinh Chú**

---

## Business Rule 2: Home Appliance Malfunction

### Rule - Plumbing/Electrical Failures → House Spirit Issue
**Nghiệp vụ:**
- Nhà bị tắc ống nước liên tục (sewage pipes constantly clogged)
- Đồ điện hỏng đột ngột (electrical appliances unexpectedly malfunction)
- → Điềm báo **chắc chắn có linh tính lạ** trong nhà
- → Đốt ngay **4-7 TPT** cho "Oan gia trái chủ trong ngôi nhà của [Tên]"

---

## UX Flow

### Flow 1: Dream Animal Harm
```
User chọn [Dream Journal]
  ↓
Tag: [x] Mơ thấy giết/đánh đập động vật
  ↓
Auto-prescribe:
  "21 biến Vãng Sinh Chú - Siêu độ ác nghiệp trong giấc mơ"
  ↓
Add to Daily Task của ngày hôm đó
```

### Flow 2: Home Appliance Warning
```
User chọn [Sự cố nhà cửa]
  ↓
Options:
  [x] Tắc ống nước liên tục
  [x] Đồ điện hỏng đột ngột
  [x] Tiếng động lạ ban đêm
  ↓
Auto-prescribe:
  "KHÔNG phải sự cố vật lý!
   Hãy lập tức đốt 4-7 TPT cho
   'Oan gia trái chủ trong ngôi nhà của [Tên]'"
```

---

## Schema Hints

```prisma
model DreamJournal {
  id                String   @id
  userId            String
  dreamDate         DateTime
  tags              String[] // "HARMED_ANIMALS", "SAW_DECEASED", etc.
  autoMantraPrescribed Boolean @default(false)
  mantraCount       Int?     // 21 if HARMED_ANIMALS
  createdAt         DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  @@map("dream_journals")
}

model HomeIncidentLog {
  id                String   @id
  userId            String
  incidentType      String[] // "PIPES_CLOGGED", "APPLIANCE_BROKEN", "STRANGE_NOISE"
  incidentDate      DateTime
  lhPrescribed      Int      @default(5) // 4-7 TPT
  createdAt         DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  @@map("home_incident_logs")
}
```

---

## Service Logic

```typescript
export class DreamSinService {
  async logDream(userId: string, dto: CreateDreamJournalDto) {
    let autoMantraPrescribed = false;
    let mantraCount = null;

    if (dto.tags.includes('HARMED_ANIMALS_IN_DREAM')) {
      autoMantraPrescribed = true;
      mantraCount = 21;

      // Auto-add to Daily Task
      await this.dailyTaskService.addTask(userId, {
        taskType: 'MANTRA',
        mantraName: 'Vãng Sinh Chú',
        count: 21,
        reason: 'Siêu độ ác nghiệp trong giấc mơ',
        dueDate: new Date(),
      });
    }

    return this.prisma.dreamJournal.create({
      data: {
        userId,
        dreamDate: dto.dreamDate,
        tags: dto.tags,
        autoMantraPrescribed,
        mantraCount,
      },
    });
  }
}

export class HomeIncidentService {
  async logIncident(userId: string, dto: CreateHomeIncidentDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // Auto-prescribe 4-7 TPT
    await this.littleHouseService.prescribe(userId, {
      offerTo: `Oan gia trái chủ trong ngôi nhà của ${user.name}`,
      count: 5, // Default 5 TPT (middle of 4-7 range)
      reason: 'Sự cố nhà cửa - linh tính trong nhà',
    });

    return this.prisma.homeIncidentLog.create({
      data: {
        userId,
        incidentType: dto.incidentType,
        incidentDate: dto.incidentDate,
        lhPrescribed: 5,
      },
    });
  }
}
```

---

## UI Components

### Dream Animal Harm Prescription
```
┌────────────────────────────────────────────┐
│  ⚡ ÁC NGHIỆP TRONG GIẤC MƠ               │
├────────────────────────────────────────────┤
│  Bạn đã mơ thấy mình làm tổn thương       │
│  động vật.                                 │
│                                            │
│  Đây là ác nghiệp và phải siêu độ.        │
│                                            │
│  Kê đơn:                                  │
│  • 21 biến Vãng Sinh Chú                  │
│  • Lý do: Siêu độ ác nghiệp trong mơ     │
│                                            │
│  Đã thêm vào Daily Task hôm nay.          │
│                                            │
│  [OK]                                     │
└────────────────────────────────────────────┘
```

### Home Appliance Warning
```
┌────────────────────────────────────────────┐
│  🏠 CẢNH BÁO: Linh tính trong nhà        │
├────────────────────────────────────────────┤
│  Tắc cống liên tục hoặc đồ điện hỏng     │
│  KHÔNG phải sự cố vật lý thông thường!   │
│                                            │
│  Đây là điềm báo có linh tính lạ trong   │
│  nhà.                                      │
│                                            │
│  Kê đơn:                                  │
│  • 4-7 TPT cho "Oan gia trái chủ trong   │
│    ngôi nhà của [Tên bạn]"               │
│                                            │
│  [Đốt TPT ngay]                           │
└────────────────────────────────────────────┘
```

---

## References
- External source: Wenda Q&A về ác mộng sát sinh, sự cố nhà cửa

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 7 Logic 11 & 12

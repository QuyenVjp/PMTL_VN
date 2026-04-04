# ANIMAL-KARMA-CALCULATOR

## Owner
- `vows-merit` (karma calculation + merit tracking)
- Cross-reference: `content` (siêu độ guidance)

## Purpose
Hệ thống tính toán **nợ mạng sát sinh** (Animal Killing Karma Debt) và số lượng **Vãng Sinh Chú** (Amitabha Pure Land Rebirth Mantra) bắt buộc phải niệm để siêu độ.

---

## Business Rule: Karma Calculation Algorithm

### Rule - Mantra Count by Animal Type
**Nghiệp vụ:**
Rất nhiều người bệnh nặng, tai nạn, hoặc gặp vận xấu là do nghiệp sát sinh (từng làm đầu bếp, bán hải sản, giết mổ, ăn sống).

Theo giáo lý PMTL, để siêu độ cho các chúng sinh đã bị giết, cần niệm **Vãng Sinh Chú** với số lượng tùy theo loại động vật:

| Loại động vật | Số biến Vãng Sinh Chú / con |
|---------------|----------------------------|
| Bò (Cow) | 108 biến |
| Heo / Cừu / Chuột (Pig / Sheep / Mouse) | 49 biến |
| Cá / Cua / Gà (Fish / Crab / Chicken) | 7 biến |
| Tôm (Shrimp) | 3 biến |
| Muỗi / Kiến (Mosquito / Ant) | 1 biến |

**Logic App:**
- User nhập loại động vật + số lượng đã giết/ăn.
- Hệ thống tính:
  ```
  Tổng nợ (biến) = Số lượng con × Số biến/con
  ```
- Cộng dồn vào `Pending Mantras` trên Dashboard.

---

## Calculation Examples

### Ví dụ 1: Đầu bếp nhà hàng
```
Input:
- 50 con Cá (Fish)
- 100 con Tôm (Shrimp)
- 20 con Gà (Chicken)

Calculation:
- Cá: 50 × 7 = 350 biến
- Tôm: 100 × 3 = 300 biến
- Gà: 20 × 7 = 140 biến

Tổng: 790 biến Vãng Sinh Chú
```

### Ví dụ 2: Người từng giết mổ
```
Input:
- 2 con Bò (Cow)
- 10 con Heo (Pig)

Calculation:
- Bò: 2 × 108 = 216 biến
- Heo: 10 × 49 = 490 biến

Tổng: 706 biến Vãng Sinh Chú
```

### Ví dụ 3: Sát sinh côn trùng
```
Input:
- 1000 con Muỗi (Mosquito)
- 500 con Kiến (Ant)

Calculation:
- Muỗi: 1000 × 1 = 1000 biến
- Kiến: 500 × 1 = 500 biến

Tổng: 1500 biến Vãng Sinh Chú
```

---

## UX Flow

### Flow: Input Karma Debt
```
User click [Tính nợ mạng sát sinh]
  ↓
Show KarmaCalculatorModal
  ↓ Step 1: "Chọn loại động vật"
  ↓   → Dropdown: Bò, Heo, Cừu, Chuột, Cá, Cua, Gà, Tôm, Muỗi, Kiến, ...
  ↓ Step 2: "Nhập số lượng"
  ↓   → Input: [______] con
  ↓ Step 3: "Tính toán"
  ↓   → Show: "Bạn cần niệm: 350 biến Vãng Sinh Chú cho 50 con Cá"
  ↓ Step 4: "Thêm vào nợ chưa trả?"
  ↓   → [Thêm vào danh sách]
  ↓
Append to PendingMantraRecitation table
  ↓
Update Dashboard: "Pending Mantras: 790 biến"
```

### Flow: Track Repayment
```
User niệm xong 100 biến Vãng Sinh Chú
  ↓
Click [Ghi nhận niệm xong 100 biến]
  ↓
System decrement: pendingCount -= 100
  ↓
Update Dashboard: "Pending Mantras: 690 biến (còn lại)"
  ↓
Toast: "Tuyệt vời! Bạn đã trả được 100 biến nợ mạng. Hãy tiếp tục!"
```

---

## Schema Hints

### Enum: AnimalType
```prisma
enum AnimalType {
  COW              // Bò - 108 biến
  PIG              // Heo - 49 biến
  SHEEP            // Cừu - 49 biến
  MOUSE            // Chuột - 49 biến
  FISH             // Cá - 7 biến
  CRAB             // Cua - 7 biến
  CHICKEN          // Gà - 7 biến
  SHRIMP           // Tôm - 3 biến
  MOSQUITO         // Muỗi - 1 biến
  ANT              // Kiến - 1 biến
  OTHER            // Khác (user input custom count)
}
```

### Table: KarmaDebtRecord
```prisma
model KarmaDebtRecord {
  id                String     @id @default(cuid())
  publicId          String     @unique @map("public_id")
  userId            String     @map("user_id")
  animalType        AnimalType @map("animal_type")
  quantity          Int        // số lượng con
  mantrasPerAnimal  Int        @map("mantras_per_animal")  // số biến/con
  totalMantras      Int        @map("total_mantras")        // quantity × mantrasPerAnimal
  note              String?    // ghi chú tình huống (ví dụ: "Làm đầu bếp nhà hàng hải sản 2015-2018")
  createdAt         DateTime   @default(now()) @map("created_at")

  user User @relation("karmaDebtRecords", fields: [userId], references: [id])

  @@index([userId])
  @@index([animalType])
  @@map("karma_debt_records")
}
```

### Table: PendingMantraRecitation
```prisma
model PendingMantraRecitation {
  id            String   @id @default(cuid())
  publicId      String   @unique @map("public_id")
  userId        String   @map("user_id")
  mantraType    String   @default("AMITABHA_REBIRTH")  // Vãng Sinh Chú
  totalPending  Int      @map("total_pending")         // Tổng số biến cần niệm
  completedCount Int     @default(0) @map("completed_count")  // Đã niệm xong
  remainingCount Int     @map("remaining_count")       // Còn lại (computed)
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  user User @relation("pendingMantras", fields: [userId], references: [id])

  @@unique([userId, mantraType])
  @@index([userId])
  @@map("pending_mantra_recitations")
}
```

---

## Service Logic

### AnimalKarmaCalculatorService (NestJS)
```typescript
export class AnimalKarmaCalculatorService {
  // Mapping table
  private readonly MANTRA_COUNT_MAP: Record<AnimalType, number> = {
    [AnimalType.COW]: 108,
    [AnimalType.PIG]: 49,
    [AnimalType.SHEEP]: 49,
    [AnimalType.MOUSE]: 49,
    [AnimalType.FISH]: 7,
    [AnimalType.CRAB]: 7,
    [AnimalType.CHICKEN]: 7,
    [AnimalType.SHRIMP]: 3,
    [AnimalType.MOSQUITO]: 1,
    [AnimalType.ANT]: 1,
  };

  async calculateKarmaDebt(
    userId: string,
    animalType: AnimalType,
    quantity: number,
    note?: string
  ): Promise<{ totalMantras: number; recordId: string }> {
    const mantrasPerAnimal = this.MANTRA_COUNT_MAP[animalType];
    const totalMantras = quantity * mantrasPerAnimal;

    // Create karma debt record
    const record = await this.prisma.karmaDebtRecord.create({
      data: {
        userId,
        animalType,
        quantity,
        mantrasPerAnimal,
        totalMantras,
        note,
      },
    });

    // Update or create pending mantra recitation
    await this.addToPendingMantras(userId, totalMantras);

    return { totalMantras, recordId: record.publicId };
  }

  private async addToPendingMantras(userId: string, additionalMantras: number) {
    await this.prisma.pendingMantraRecitation.upsert({
      where: {
        userId_mantraType: {
          userId,
          mantraType: 'AMITABHA_REBIRTH',
        },
      },
      create: {
        userId,
        mantraType: 'AMITABHA_REBIRTH',
        totalPending: additionalMantras,
        remainingCount: additionalMantras,
      },
      update: {
        totalPending: { increment: additionalMantras },
        remainingCount: { increment: additionalMantras },
      },
    });
  }

  async recordMantraCompletion(userId: string, completedCount: number) {
    const pending = await this.prisma.pendingMantraRecitation.findUnique({
      where: {
        userId_mantraType: {
          userId,
          mantraType: 'AMITABHA_REBIRTH',
        },
      },
    });

    if (!pending) {
      throw new Error('No pending mantras found');
    }

    await this.prisma.pendingMantraRecitation.update({
      where: { id: pending.id },
      data: {
        completedCount: { increment: completedCount },
        remainingCount: { decrement: completedCount },
      },
    });
  }
}
```

---

## UI Components

### 1. KarmaCalculatorForm
```
┌────────────────────────────────────────────┐
│  🙏 Tính nợ mạng sát sinh                 │
├────────────────────────────────────────────┤
│                                            │
│  Loại động vật:                           │
│  [Dropdown: Bò, Heo, Cá, Tôm, ...]       │
│                                            │
│  Số lượng (con):                          │
│  [______]                                  │
│                                            │
│  Ghi chú (tùy chọn):                      │
│  [Làm đầu bếp nhà hàng 2015-2018...]      │
│                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                            │
│  Kết quả:                                  │
│  Bạn cần niệm: 350 biến Vãng Sinh Chú     │
│  cho 50 con Cá                             │
│                                            │
│  [Hủy]        [Thêm vào danh sách nợ]     │
└────────────────────────────────────────────┘
```

### 2. PendingMantrasWidget (Dashboard)
```
┌────────────────────────────────────────────┐
│  📿 Nợ mạng cần siêu độ                   │
├────────────────────────────────────────────┤
│                                            │
│  Vãng Sinh Chú còn lại:                   │
│  790 biến                                  │
│                                            │
│  Đã niệm: 0 biến (0%)                     │
│  Còn lại: 790 biến                         │
│                                            │
│  [Ghi nhận niệm xong]  [Xem chi tiết]     │
└────────────────────────────────────────────┘
```

### 3. KarmaRepaymentProgress
```
┌────────────────────────────────────────────┐
│  Chi tiết nợ mạng                          │
├────────────────────────────────────────────┤
│                                            │
│  🐄 Bò: 216 biến (2 con × 108)            │
│     └─ Đã niệm: 0 / 216                   │
│                                            │
│  🐷 Heo: 490 biến (10 con × 49)           │
│     └─ Đã niệm: 0 / 490                   │
│                                            │
│  🐟 Cá: 350 biến (50 con × 7)             │
│     └─ Đã niệm: 0 / 350                   │
│                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Tổng: 1056 biến                           │
│  Tiến độ: [▓▓░░░░░░░░] 10%                │
│                                            │
└────────────────────────────────────────────┘
```

---

## References
- `design/03-domains/vows-merit/REFERENCES/VOW-BREACH-RECOVERY-GUIDE.md`
- `design/03-domains/vows-merit/REFERENCES/MERIT-TRANSFER-PERCENTAGE.md`
- `design/03-domains/content/REFERENCES/LIFE-RELEASE-GUIDE-XU-LY-KHI-CO-LOAI-VAT-TU-VONG.MD`
- External source: Master Lu teachings về siêu độ động vật, nợ mạng sát sinh
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 2 Module 10

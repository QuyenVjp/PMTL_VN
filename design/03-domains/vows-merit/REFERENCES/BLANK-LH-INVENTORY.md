# BLANK-LH-INVENTORY

## Owner
- `vows-merit` (Little House management)

## Purpose
Kho Dự Trữ TPT Vô Danh (Blank Little House Inventory) - Emergency reserve system

---

## Business Rule

### Rule - Pre-chanted Reserved Little Houses
**Nghiệp vụ [Nguồn: Intro to Guan Yin Citta]:**
- Nên tích trữ TPT trống (blank/reserved) để dùng khi khẩn cấp
- **TPT trống = TPT đã:**
  - ✅ Niệm đủ số lượng (27, 49, 84, 87)
  - ✅ Điền "Người tặng" (Your Name)
  - ❌ BỎ TRỐNG "Kính tặng" (Recipient)
  - ❌ BỎ TRỐNG "Ngày tháng" (Date)

- Khi có sự cố khẩn cấp → Lôi ra điền tên người nhận + ngày tháng → Đốt ngay

---

## Schema Hints

```prisma
enum LittleHouseStatus {
  DRAFT
  SIGNED
  CHANTED
  RESERVED_BLANK    // NEW: Pre-chanted, recipient blank
  BURNED
  INVALIDATED
}

model LittleHouse {
  // ... existing fields
  status          LittleHouseStatus
  
  // For RESERVED_BLANK status
  isReservedBlank Boolean @default(false)
  redeemedAt      DateTime? // When converted from blank to specific recipient
  emergencyType   String?   // "HOUSE_SPIRIT", "SUDDEN_ILLNESS", etc.
}

model BlankLHInventory {
  id              String   @id
  publicId        String   @unique
  userId          String
  totalBlank      Int      @default(0) // Total reserved blank LH
  availableCount  Int      @default(0) // Not yet redeemed
  redeemedCount   Int      @default(0) // Already converted
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@unique([userId])
  @@map("blank_lh_inventories")
}
```

---

## Service Logic

```typescript
export class BlankLHInventoryService {
  async createBlankLH(userId: string, dto: CreateBlankLHDto) {
    // Create LH with RESERVED_BLANK status
    const blankLH = await this.prisma.littleHouse.create({
      data: {
        userId,
        status: LittleHouseStatus.RESERVED_BLANK,
        isReservedBlank: true,
        offerFrom: dto.offerFrom, // User's name
        // offerTo: null (blank)
        // burnDate: null (blank)
        daBeiZhouCount: dto.daBeiZhouCount,
        xinJingCount: dto.xinJingCount,
        wangShengZhouCount: dto.wangShengZhouCount,
        qiYuanZhenYanCount: dto.qiYuanZhenYanCount,
      },
    });

    // Update inventory
    await this.prisma.blankLHInventory.upsert({
      where: { userId },
      create: {
        userId,
        totalBlank: 1,
        availableCount: 1,
      },
      update: {
        totalBlank: { increment: 1 },
        availableCount: { increment: 1 },
      },
    });

    return blankLH;
  }

  async redeemBlank(
    userId: string,
    blankLHId: string,
    dto: RedeemBlankLHDto
  ) {
    const blankLH = await this.prisma.littleHouse.findUnique({
      where: { id: blankLHId, userId },
    });

    if (!blankLH || blankLH.status !== LittleHouseStatus.RESERVED_BLANK) {
      throw new BadRequestException('This is not a blank LH');
    }

    // Convert to specific recipient
    const redeemedLH = await this.prisma.littleHouse.update({
      where: { id: blankLHId },
      data: {
        status: LittleHouseStatus.CHANTED,
        isReservedBlank: false,
        offerTo: dto.recipientName,
        burnDate: dto.burnDate || new Date(),
        redeemedAt: new Date(),
        emergencyType: dto.emergencyType,
      },
    });

    // Update inventory
    await this.prisma.blankLHInventory.update({
      where: { userId },
      data: {
        availableCount: { decrement: 1 },
        redeemedCount: { increment: 1 },
      },
    });

    return redeemedLH;
  }
}
```

---

## UI Components

### Inventory Dashboard
```
┌────────────────────────────────────────────┐
│  📦 Kho Dự Trữ TPT Trống                  │
├────────────────────────────────────────────┤
│  Tổng số TPT trống: 15                    │
│  Đã quy đổi: 3                            │
│  Còn lại: 12                              │
│                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                            │
│  TPT trống là gì?                         │
│  • Đã niệm đủ số lượng                    │
│  • Đã điền "Người tặng" (tên bạn)        │
│  • BỎ TRỐNG "Kính tặng" và "Ngày"        │
│                                            │
│  Dùng khi nào?                            │
│  Khi có sự cố khẩn cấp, điền tên người   │
│  nhận và đốt ngay.                        │
│                                            │
│  [Thêm TPT trống] [Quy đổi khẩn cấp]    │
└────────────────────────────────────────────┘
```

### Quick Redeem Form
```
┌────────────────────────────────────────────┐
│  ⚡ Quy Đổi Khẩn Cấp                      │
├────────────────────────────────────────────┤
│  Kho hiện có: 12 TPT trống                │
│                                            │
│  Sự cố khẩn cấp:                          │
│  (●) Nhà bị ma trêu                       │
│  ( ) Người thân ốm đột ngột               │
│  ( ) Tai nạn/Nguy hiểm                    │
│  ( ) Khác                                 │
│                                            │
│  Người cần kinh (Kính tặng):              │
│  [_____________________________]          │
│                                            │
│  Số lượng TPT cần quy đổi:                │
│  [__5__] TPT                              │
│                                            │
│  Ngày đốt:                                │
│  (●) Hôm nay (2026-04-04)                │
│  ( ) Chọn ngày khác                       │
│                                            │
│  [Hủy] [Quy đổi ngay]                    │
└────────────────────────────────────────────┘
```

### Success State
```
┌────────────────────────────────────────────┐
│  ✅ Đã quy đổi thành công                 │
├────────────────────────────────────────────┤
│  Đã chuyển 5 TPT trống thành:             │
│                                            │
│  Kính tặng: Oan gia trái chủ trong ngôi  │
│             nhà của Nguyễn Văn A          │
│  Người tặng: Nguyễn Văn A                 │
│  Ngày: 2026-04-04                         │
│                                            │
│  Kho còn lại: 7 TPT trống                 │
│                                            │
│  Bạn có thể đốt ngay.                     │
│                                            │
│  [Đốt TPT] [Về kho]                       │
└────────────────────────────────────────────┘
```

---

## References
- Source: Intro to Guan Yin Citta - Blank Little House strategy
- `design/03-domains/content/REFERENCES/LITTLE-HOUSE-INVALIDATION-FLOW.md`

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 9 Logic 9

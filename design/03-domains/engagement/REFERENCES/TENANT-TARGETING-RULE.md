# TENANT-TARGETING-RULE

## Owner
- `engagement` (Little House module)

## Purpose
Định danh Chủ nhà thuê - Tenant vs Landlord targeting

---

## Business Rule

### Rule - Nhà thuê → Dùng tên NGƯỜI ĐANG Ở
**Nghiệp vụ:**
- Nhà bị ma trêu (tiếng động lạ, tắc cống, hỏng đồ điện)
- Phải đốt TPT cho "Oan gia trái chủ trong ngôi nhà của <Tên>"
- Nếu là nhà đi thuê, `<Tên>` phải là tên của **NGƯỜI ĐANG Ở (Tenant)**
- **TUYỆT ĐỐI KHÔNG** được điền tên ông chủ nhà (Landlord)

---

## UX Flow

```
User chọn mục đích TPT: [Cho ngôi nhà]
  ↓
Question: "Bạn là chủ nhà hay đi thuê?"
  [ ] Tôi là chủ nhà
  [x] Tôi đang đi thuê
  ↓
If Tenant:
  Auto-fill: "Oan gia trái chủ trong ngôi nhà của [Tên User]"
  Warning: "❌ KHÔNG được điền tên chủ nhà"
  ↓
Submit
```

---

## Schema Hints

```prisma
model LittleHouse {
  // ... existing
  recipientType        RecipientType
  recipientName        String?
  recipientRelation    String?
  
  // NEW
  isForHouseSpirit     Boolean @default(false)
  housingStatus        HousingStatus? // OWNER, TENANT, OTHER
  landlordName         String? // For reference only, NOT used in targeting
}

enum HousingStatus {
  OWNER
  TENANT
  OTHER
}
```

---

## Service Logic

```typescript
export class LittleHouseTargetingService {
  async createHouseSpiritLH(
    userId: string,
    dto: CreateHouseSpiritLHDto
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (dto.housingStatus === HousingStatus.TENANT) {
      // Force tenant name, block landlord name
      if (dto.recipientName !== user.name) {
        throw new BadRequestException(
          'Nếu đang đi thuê, PHẢI dùng tên người đang ở (tên của bạn), KHÔNG được dùng tên chủ nhà.'
        );
      }

      return this.prisma.littleHouse.create({
        data: {
          userId,
          recipientType: RecipientType.HOUSE_SPIRIT,
          recipientName: user.name,
          offerTo: `Oan gia trái chủ trong ngôi nhà của ${user.name}`,
          isForHouseSpirit: true,
          housingStatus: HousingStatus.TENANT,
          landlordName: dto.landlordName, // Reference only
        },
      });
    }

    // If owner
    return this.prisma.littleHouse.create({
      data: {
        userId,
        recipientType: RecipientType.HOUSE_SPIRIT,
        recipientName: user.name,
        offerTo: `Oan gia trái chủ trong ngôi nhà của ${user.name}`,
        isForHouseSpirit: true,
        housingStatus: HousingStatus.OWNER,
      },
    });
  }
}
```

---

## UI Components

```
┌────────────────────────────────────────────┐
│  Đốt TPT cho Ngôi nhà                     │
├────────────────────────────────────────────┤
│  Bạn là chủ nhà hay đi thuê?              │
│  ○ Tôi là chủ nhà                         │
│  ● Tôi đang đi thuê                       │
│                                            │
│  ⚠️ LƯU Ý QUAN TRỌNG:                     │
│  Nếu đi thuê, PHẢI dùng tên của NGƯỜI    │
│  ĐANG Ở (tên bạn), KHÔNG được dùng tên   │
│  ông chủ nhà trên giấy tờ.                │
│                                            │
│  Người cần kinh:                          │
│  "Oan gia trái chủ trong ngôi nhà của    │
│   [Nguyễn Văn A]"                         │
│                                            │
│  Tên chủ nhà (chỉ tham khảo):            │
│  [Trần Thị B] (không dùng trong TPT)     │
│                                            │
│  [Tiếp tục]                               │
└────────────────────────────────────────────┘
```

---

## References
- External source: Master Lu teachings về định danh nhà thuê vs chủ nhà

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 7 Logic 7

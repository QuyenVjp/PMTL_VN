# VIRTUAL-VIOLENCE-GAMING

## Owner
- `engagement` (Child Profile + Symptom Tracking)

## Purpose
Thuật toán Bắt Nghiệp Bạo Lực Ảo (Virtual Violence / Gaming Entity Attraction)

---

## Business Rule

### Rule - Violent Games Attract Underworld Spirits
**Nghiệp vụ [Nguồn: Testimonial Case 6 - Internet Addiction]:**
- Trẻ em nghiện game bạo lực/chém giết
- Thu hút linh tính từ cõi âm nhập vào đứa trẻ
- Do từ trường bạo lực

**Hóa giải:**
- Tâm Kinh cho trẻ
- TPT cho "Oan gia trái chủ của [Tên trẻ]"

---

## Schema Hints

```prisma
model ChildProfile {
  id              String   @id
  userId          String   // Parent
  childName       String
  hasGamingAddiction Boolean @default(false)
  virtualViolenceKarma Boolean @default(false)
  
  user User @relation(fields: [userId], references: [id])
  @@map("child_profiles")
}
```

---

## Service Logic

```typescript
export class VirtualViolenceEngine {
  async diagnoseGamingAddiction(childId: string) {
    const child = await this.prisma.childProfile.update({
      where: { id: childId },
      data: { virtualViolenceKarma: true },
    });

    // Auto-prescribe
    await this.debtLedgerService.addDebt(child.userId, {
      type: 'VIRTUAL_VIOLENCE_KARMA',
      amount: 7,
      reason: `Game bạo lực thu hút linh tính cho ${child.childName}`,
    });
  }
}
```

---

## UI Component

```
┌────────────────────────────────────────────┐
│  🎮 CẢNH BÁO: Nghiệp Bạo Lực Ảo          │
├────────────────────────────────────────────┤
│  Con: Nguyễn Văn B (12 tuổi)             │
│  Triệu chứng: Nghiện game bạo lực         │
│                                            │
│  CẢNH BÁO:                                │
│  Game bạo lực/chém giết trực tiếp THU    │
│  HÚT các linh tính từ cõi âm đến nhập    │
│  vào đứa trẻ.                             │
│                                            │
│  KÊ ĐƠN:                                  │
│  • 7 TPT cho "Oan gia trái chủ của con"  │
│  • 21 biến Tâm Kinh/ngày                  │
│  • Hạn chế tiếp xúc game bạo lực          │
│                                            │
│  [Niệm TPT] [Xem hướng dẫn]              │
└────────────────────────────────────────────┘
```

---

## References
- Testimonial Case 6: Internet Addiction

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 11 Logic 5

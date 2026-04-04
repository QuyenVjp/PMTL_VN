# URGENCY-BURNING-DIRECTION

## Owner
- `engagement` (Little House)

## Purpose
Hướng Đốt TPT Dựa Trên Nhu Cầu (Demand-Based Burning Direction)

---

## Business Rule

### Rule - Urgent Cases: Burn from "Offer To" Corner
**Nghiệp vụ [Nguồn 304]:**
- **Thông thường:** Đốt từ Dưới Lên Trên (xây nền móng)
- **Ngoại lệ Năng lượng:** Nếu Oan gia trái chủ đang **rất đòi hỏi/cấp bách** (very eager/demanding):
  - Bệnh nhân ung thư nguy kịch
  - Ác mộng liên tục
  - Triệu chứng cấp bách
- → TPT **BẮT BUỘC ĐỐT TỪ GÓC CHỮ "KÍNH TẶNG" (Offer To) XUỐNG DƯỚI**
- Vong linh nhận được ngay lập tức

---

## Schema Hints

```prisma
model LittleHouse {
  // ... existing
  isUrgent            Boolean @default(false)
  burningDirection    String  @default('BOTTOM_UP') // BOTTOM_UP, OFFER_TO_DOWN
  urgencyReason       String? // "CRITICAL_ILLNESS", "SEVERE_NIGHTMARES"
}
```

---

## Service Logic

```typescript
export class LittleHouseBurningService {
  getBurningDirection(dto: BurnLHDto): string {
    if (dto.isUrgent) {
      return 'OFFER_TO_DOWN'; // From top-right "Kính Tặng" corner
    }
    return 'BOTTOM_UP'; // Normal direction
  }
}
```

---

## UI Component

```
┌────────────────────────────────────────────┐
│  🔥 Hướng Dẫn Đốt TPT                     │
├────────────────────────────────────────────┤
│  Oan gia trái chủ có cấp bách không?      │
│  ( ) Không - Trường hợp thông thường      │
│  (●) Có - Bệnh nan y/Ác mộng liên tục    │
│                                            │
│  HƯỚNG ĐỐT:                               │
│  🔴 Châm lửa từ góc chữ "KÍNH TẶNG"      │
│     (góc trên bên phải) XUỐNG DƯỚI        │
│                                            │
│  ⚡ Vong linh sẽ nhận ngay lập tức        │
│                                            │
│  [Xem hình minh họa]                      │
└────────────────────────────────────────────┘
```

---

## References
- Source 304: Urgency-based burning direction

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 10 Logic 7

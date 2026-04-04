# LH-OVER-RECITATION-ALLOWANCE

## Owner
- `engagement` (Little House module)

## Purpose
Cho phép niệm DƯ, cấm niệm THIẾU (Over-recitation Allowance)

---

## Business Rule

### Rule - Thừa thì được, Thiếu một biến cũng TUYỆT ĐỐI KHÔNG
**Nghiệp vụ:**
- Số lần đọc kinh trên TPT có thể **VƯỢT QUÁ** số chấm tròn
- Tuyệt đối **KHÔNG được ít hơn**

**Standard counts:**
- Đại Bi Chú: 27 biến (min)
- Tâm Kinh: 49 biến (min)
- Vãng Sinh Chú: 84 biến (min)
- Quy Nguyên Chân Ngôn: 87 biến (min)

**Allowed:**
- ✅ Đại Bi Chú: 30, 35, 50... (OK)
- ✅ Tâm Kinh: 60, 70, 100... (OK)

**FORBIDDEN:**
- ❌ Đại Bi Chú: 26 (THIẾU 1 → INVALID)
- ❌ Tâm Kinh: 48 (THIẾU 1 → INVALID)

---

## Schema Hints

```prisma
model LittleHouse {
  // ... existing fields
  daBeiZhouCount    Int  // min: 27, max: unlimited
  xinJingCount      Int  // min: 49, max: unlimited
  wangShengZhouCount Int // min: 84, max: unlimited
  qiYuanZhenYanCount Int // min: 87, max: unlimited

  // Validation flags
  hasDeficit        Boolean @default(false) // Auto-set if any < min
}
```

---

## Service Logic

```typescript
export class LittleHouseValidationService {
  private readonly MIN_COUNTS = {
    daBeiZhou: 27,
    xinJing: 49,
    wangShengZhou: 84,
    qiYuanZhenYan: 87,
  };

  validateCounts(dto: UpdateLHCountsDto): void {
    if (dto.daBeiZhouCount < this.MIN_COUNTS.daBeiZhou) {
      throw new BadRequestException(
        `Đại Bi Chú thiếu! Tối thiểu 27 biến, bạn chỉ niệm ${dto.daBeiZhouCount}. TUYỆT ĐỐI KHÔNG được thiếu.`
      );
    }

    if (dto.xinJingCount < this.MIN_COUNTS.xinJing) {
      throw new BadRequestException(
        `Tâm Kinh thiếu! Tối thiểu 49 biến, bạn chỉ niệm ${dto.xinJingCount}. TUYỆT ĐỐI KHÔNG được thiếu.`
      );
    }

    if (dto.wangShengZhouCount < this.MIN_COUNTS.wangShengZhou) {
      throw new BadRequestException(
        `Vãng Sinh Chú thiếu! Tối thiểu 84 biến, bạn chỉ niệm ${dto.wangShengZhouCount}. TUYỆT ĐỐI KHÔNG được thiếu.`
      );
    }

    if (dto.qiYuanZhenYanCount < this.MIN_COUNTS.qiYuanZhenYan) {
      throw new BadRequestException(
        `Quy Nguyên Chân Ngôn thiếu! Tối thiểu 87 biến, bạn chỉ niệm ${dto.qiYuanZhenYanCount}. TUYỆT ĐỐI KHÔNG được thiếu.`
      );
    }

    // All good - surplus is OK
  }
}
```

---

## UI Components

### Form Input with Validation
```
┌────────────────────────────────────────────┐
│  Nhập số biến đã niệm:                    │
├────────────────────────────────────────────┤
│  Đại Bi Chú:                              │
│  [___28___] (Tối thiểu: 27)              │
│  💡 Thừa thì được, thiếu 1 biến cũng      │
│     tuyệt đối KHÔNG được                  │
│                                            │
│  Tâm Kinh:                                │
│  [___50___] (Tối thiểu: 49)              │
│                                            │
│  Vãng Sinh Chú:                           │
│  [___90___] (Tối thiểu: 84)              │
│                                            │
│  Quy Nguyên Chân Ngôn:                    │
│  [___87___] (Tối thiểu: 87)              │
│                                            │
│  [Lưu]                                    │
└────────────────────────────────────────────┘
```

### Error State
```
┌────────────────────────────────────────────┐
│  🚫 LỖI: Thiếu số biến                    │
├────────────────────────────────────────────┤
│  Tâm Kinh: Tối thiểu 49 biến, bạn chỉ    │
│  niệm 48 biến.                            │
│                                            │
│  TUYỆT ĐỐI KHÔNG được thiếu một biến.    │
│                                            │
│  Hãy niệm thêm 1 biến nữa hoặc HỦY        │
│  tờ TPT này theo đúng quy trình.          │
│                                            │
│  [Sửa lại]  [Hủy TPT này]                │
└────────────────────────────────────────────┘
```

---

## References
- `design/03-domains/content/REFERENCES/LITTLE-HOUSE-INVALIDATION-FLOW.md`

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 7 Logic 6

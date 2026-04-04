# CUP-VISUAL-VALIDATION

## Owner
- `vows-merit` (Altar Management)

## Purpose
Cấm in Kinh văn lên Cốc cúng (Cup Visual Strict Validation)

---

## Business Rule

### Rule - Plain White Cup Only, NO Scriptures Printed
**Nghiệp vụ [Nguồn 373]:**
- Cốc cúng nước Đại Bi phải màu trắng trơn
- **TUYỆT ĐỐI CẤM:**
  - ❌ In chữ *Tâm Kinh* lên cốc
  - ❌ In chữ *Chú Đại Bi* lên cốc
  - ❌ In hình Phật lên cốc
  - ❌ In hình động vật/linh thú lên cốc

---

## Schema Hints

```prisma
model AltarProfile {
  // ... existing
  cupType             String?  @default('PLAIN_WHITE')
  cupHasScriptures    Boolean  @default(false) // MUST BE FALSE
  cupHasBuddhaImage   Boolean  @default(false) // MUST BE FALSE
}
```

---

## Service Logic

```typescript
export class AltarSetupValidation {
  async validateCup(dto: AltarSetupDto) {
    if (dto.cupHasScriptures || dto.cupHasBuddhaImage) {
      throw new BadRequestException(
        'Cốc nước trắng trơn, KHÔNG in Kinh Văn (Tâm Kinh/Đại Bi), KHÔNG in hình Phật hay linh thú.'
      );
    }
  }
}
```

---

## UI Component

```
┌────────────────────────────────────────────┐
│  ☕ Kiểm tra Cốc Cúng Nước                │
├────────────────────────────────────────────┤
│  Cốc của bạn có in gì không?              │
│  [ ] In chữ Tâm Kinh                      │
│  [ ] In chữ Đại Bi Chú                    │
│  [ ] In hình Phật                         │
│  [ ] In hình động vật/linh thú            │
│  [x] Trắng trơn, không in gì              │
│                                            │
│  ⚠️ Nếu có in → PHẢI MUA LẠI CỐC MỚI     │
└────────────────────────────────────────────┘
```

---

## References
- Source 373: Cup visual requirements

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 10 Logic 5

# OIL-LAMP-RULES

## Owner
- `vows-merit` (altar maintenance domain)

## Purpose
Quy định về loại dầu và thiết bị bảo vệ cho Phật đài.

---

## Business Rule 1: Soybean Oil Ban

### Rule - CẤM DẦU ĐẬU NÀNH (Soybean Oil)
**Nghiệp vụ:**
- **Dầu Đậu Nành (Soybean oil)** quá đặc, khó cháy, tạo khói đen.
- **Tuyệt đối KHÔNG dùng** cho đèn dầu trên bàn thờ.

**Dầu được phép:**
- ✅ Dầu ô liu (Olive oil)
- ✅ Dầu thực vật trong (Clear vegetable oil)
- ✅ Dầu hướng dương (Sunflower oil)

**Dầu bị cấm:**
- ❌ Dầu đậu nành (Soybean oil)
- ❌ Dầu thơm (Scented oil) - đã cấm từ trước
- ❌ Dầu mè (Sesame oil) - đã cấm từ trước
- ❌ Dầu đậu phộng (Peanut oil) - đã cấm từ trước

---

## Business Rule 2: Glass Dome Ban

### Rule - TUYỆT ĐỐI KHÔNG ÚP LỒNG KÍNH (No Glass Dome)
**Nghiệp vụ:**
- Tượng Bồ Tát **TUYỆT ĐỐI KHÔNG được úp lồng kính** (glass dome/case) bảo vệ bên ngoài.
- **Lý do:** Lồng kính sẽ **nhốt khí trường** (trap energy field), ngăn cản luồng năng lượng từ Bồ Tát lan ra.

**Ngoại lệ:**
- Nếu nhà có trẻ nhỏ hoặc thú cưng hay làm đổ đồ, có thể dùng **rào chắn thấp** (low barrier) ở xung quanh bàn thờ, nhưng **KHÔNG được** úp trực tiếp lên tượng.

---

## Business Rule 3: Objects Underneath Altar

### Rule - Dưới bàn thờ chỉ để kinh sách/pháp khí
**Nghiệp vụ:**
- Dưới bàn thờ (underneath altar table) **chỉ được** đặt:
  - ✅ Kinh sách (Scriptures/Sutras)
  - ✅ Pháp khí (Dharma instruments: chuông, mõ, niệm châu)
  - ✅ Đồ cúng dường (Offering items: hoa, quả dự trữ)

- **KHÔNG được** đặt:
  - ❌ Đồ tạp (miscellaneous items)
  - ❌ Giày dép
  - ❌ Rác thải
  - ❌ Vật dụng sinh hoạt hằng ngày

---

## Schema Hints

### Extend OilType enum:
```prisma
enum OilType {
  OLIVE          // Dầu ô liu - OK
  VEGETABLE      // Dầu thực vật - OK
  SUNFLOWER      // Dầu hướng dương - OK
  SOYBEAN        // Dầu đậu nành - BANNED (NEW)
  SESAME         // Dầu mè - BANNED
  PEANUT         // Dầu đậu phộng - BANNED
  SCENTED        // Dầu thơm - BANNED
}
```

### Table: AltarProfile (Validation Fields)
```prisma
model AltarProfile {
  id                    String   @id @default(cuid())
  publicId              String   @unique @map("public_id")
  userId                String   @map("user_id")
  oilType               OilType  @map("oil_type")
  hasGlassDome          Boolean  @default(false) @map("has_glass_dome")  // MUST BE FALSE
  hasObjectsUnderneath  Boolean  @default(false) @map("has_objects_underneath")
  underneathItems       String[] @default([]) @map("underneath_items")  // ["scriptures", "dharma_instruments"]
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  user User @relation("altarProfiles", fields: [userId], references: [id])

  @@unique([userId])
  @@index([userId])
  @@map("altar_profiles")
}
```

---

## Service Logic

### AltarProfileService (NestJS)
```typescript
export class AltarProfileService {
  private readonly BANNED_OIL_TYPES = [
    OilType.SOYBEAN,
    OilType.SESAME,
    OilType.PEANUT,
    OilType.SCENTED,
  ];

  private readonly ALLOWED_UNDERNEATH = [
    'scriptures',
    'dharma_instruments',
    'offering_supplies',
  ];

  async createProfile(userId: string, dto: CreateAltarProfileDto) {
    // Validate oil type
    if (this.BANNED_OIL_TYPES.includes(dto.oilType)) {
      throw new BadRequestException(
        `Oil type ${dto.oilType} is not allowed. It is too thick/scented and will cause smoke.`
      );
    }

    // Validate glass dome
    if (dto.hasGlassDome === true) {
      throw new BadRequestException(
        'Glass dome/case is strictly prohibited. It traps the energy field.'
      );
    }

    // Validate underneath items
    if (dto.hasObjectsUnderneath && dto.underneathItems?.length > 0) {
      const invalid = dto.underneathItems.filter(
        item => !this.ALLOWED_UNDERNEATH.includes(item)
      );
      if (invalid.length > 0) {
        throw new BadRequestException(
          `Invalid items underneath altar: ${invalid.join(', ')}. Only scriptures, dharma instruments, and offering supplies are allowed.`
        );
      }
    }

    return this.prisma.altarProfile.create({
      data: {
        userId,
        oilType: dto.oilType,
        hasGlassDome: false, // Force false
        hasObjectsUnderneath: dto.hasObjectsUnderneath,
        underneathItems: dto.underneathItems,
      },
    });
  }
}
```

---

## UI Components

### 1. AltarProfileForm (Validation)
```
┌────────────────────────────────────────────┐
│  🏠 Thiết lập thông tin Phật đài          │
├────────────────────────────────────────────┤
│                                            │
│  Loại dầu đèn:                            │
│  [Dropdown: Ô liu, Thực vật, Hướng dương] │
│  ❌ Đậu nành, Mè, Đậu phộng (Bị cấm)      │
│                                            │
│  Kiểm tra an toàn:                        │
│  [ ] Tượng có bị úp lồng kính không?      │
│      ⚠️ Nếu có → PHẢI gỡ bỏ               │
│                                            │
│  Dưới bàn thờ có đặt gì?                  │
│  [✓] Kinh sách                            │
│  [✓] Pháp khí (chuông, mõ)                │
│  [ ] Đồ khác (KHÔNG nên)                  │
│                                            │
│  [Hủy]                         [Lưu]      │
└────────────────────────────────────────────┘
```

### 2. GlassDomeWarning (Blocker)
```
┌────────────────────────────────────────────┐
│  🚫 CẢNH BÁO QUAN TRỌNG                   │
├────────────────────────────────────────────┤
│  Tượng Bồ Tát tuyệt đối KHÔNG được úp    │
│  lồng kính (glass dome/case) bảo vệ.      │
│                                            │
│  Lý do:                                   │
│  Lồng kính sẽ nhốt khí trường, ngăn cản  │
│  năng lượng từ Bồ Tát lan ra.            │
│                                            │
│  Nếu bạn lo sợ bụi hoặc trẻ nhỏ phá,     │
│  hãy dùng rào chắn thấp xung quanh bàn    │
│  thờ, KHÔNG úp trực tiếp lên tượng.       │
│                                            │
│  [Tôi hiểu]                               │
└────────────────────────────────────────────┘
```

### 3. OilTypeSelector (With Banned Items)
```
┌────────────────────────────────────────────┐
│  Chọn loại dầu đèn:                       │
├────────────────────────────────────────────┤
│  ✅ Dầu ô liu (Olive)                     │
│  ✅ Dầu thực vật (Vegetable)              │
│  ✅ Dầu hướng dương (Sunflower)           │
│                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  KHÔNG được dùng:                         │
│                                            │
│  ❌ Dầu đậu nành (quá đặc, khó cháy)      │
│  ❌ Dầu mè (có mùi)                       │
│  ❌ Dầu đậu phộng (có mùi)                │
│  ❌ Dầu thơm (không tôn kính)             │
└────────────────────────────────────────────┘
```

---

## References
- `design/03-domains/vows-merit/REFERENCES/PHAT-DAI-BAO-DUONG.md`
- `design/03-domains/vows-merit/REFERENCES/ALTAR-MAINTENANCE-CHECKLIST.md`
- External source: Wenda Q&A về dầu đèn, lồng kính bảo vệ tượng

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 7 Logic 2

# DECEASED-RELATIONSHIP-SYNTAX

## Owner
- `engagement` (Little House)

## Purpose
Cú pháp "Quan Hệ Vong Linh" (Deceased Relationship Syntax)

---

## Business Rule

### Rule - Allow [Relationship] + [Name] Format
**Nghiệp vụ [Nguồn: Intro to Guan Yin Citta - LH]:**
- Cho phép ghi thêm "Mối quan hệ" trước tên người quá cố
- Ví dụ:
  - "Ông nội Nguyễn Văn A"
  - "Grandfather John Doe"
  - "Bà ngoại Trần Thị B"

---

## Schema Hints

```prisma
enum DeceasedRelationship {
  GRANDFATHER_PATERNAL  // Ông nội
  GRANDMOTHER_PATERNAL  // Bà nội
  GRANDFATHER_MATERNAL  // Ông ngoại
  GRANDMOTHER_MATERNAL  // Bà ngoại
  FATHER
  MOTHER
  SPOUSE
  CHILD
  SIBLING
  OTHER
}

model LittleHouse {
  // ... existing
  deceasedRelationship  DeceasedRelationship?
  deceasedName          String?
  offerTo               String  // Auto-generated from relationship + name
}
```

---

## Service Logic

```typescript
export class LittleHouseOfferToFormatter {
  private readonly RELATIONSHIP_LABELS = {
    GRANDFATHER_PATERNAL: 'Ông nội',
    GRANDMOTHER_PATERNAL: 'Bà nội',
    GRANDFATHER_MATERNAL: 'Ông ngoại',
    GRANDMOTHER_MATERNAL: 'Bà ngoại',
    FATHER: 'Cha',
    MOTHER: 'Mẹ',
    SPOUSE: 'Vợ/Chồng',
    CHILD: 'Con',
    SIBLING: 'Anh/Chị/Em',
  };

  formatOfferTo(relationship: DeceasedRelationship, name: string): string {
    const label = this.RELATIONSHIP_LABELS[relationship];
    return `${label} ${name}`;
  }

  validateOfferTo(dto: CreateLHDto) {
    if (dto.deceasedRelationship && !dto.deceasedName) {
      throw new BadRequestException('Phải điền tên người quá cố');
    }

    // Auto-format
    if (dto.deceasedRelationship) {
      dto.offerTo = this.formatOfferTo(dto.deceasedRelationship, dto.deceasedName);
    }
  }
}
```

---

## UI Component

```
┌────────────────────────────────────────────┐
│  Kính tặng:                               │
│                                            │
│  Mối quan hệ:                             │
│  [Ông nội ▼]                              │
│                                            │
│  Họ tên đầy đủ:                           │
│  [Nguyễn Văn Cường__________________]     │
│                                            │
│  → Kính tặng: "Ông nội Nguyễn Văn Cường" │
│                                            │
│  [Lưu]                                    │
└────────────────────────────────────────────┘
```

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 11 Logic 10

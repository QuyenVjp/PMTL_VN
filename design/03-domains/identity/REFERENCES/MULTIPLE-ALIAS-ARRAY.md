# MULTIPLE-ALIAS-ARRAY

## Owner
- `identity` (Sacred Forms)

## Purpose
Mảng Đa Danh Xưng trong Đơn Đổi Tên (Multiple Alias Array Support)

---

## Business Rule

### Rule - All Past Names Must Be Listed
**Nghiệp vụ [Nguồn: Intro to Guan Yin Citta - Name Change]:**
- User từng bị gọi bằng nhiều tên khác nhau
- **BẮT BUỘC** viết TẤT CẢ tên đó vào "Tên gốc/Original Name"

---

## Schema Hints

```prisma
model NameChangeApplication {
  // ... existing
  originalNames    String[]  // Array of all past names
  newName          String
}
```

---

## Service Logic

```typescript
export class NameChangeFormService {
  async generatePDF(app: NameChangeApplication) {
    const originalNamesText = app.originalNames.join(', ');
    
    return this.pdfService.render('name-change-template', {
      originalNames: originalNamesText,
      newName: app.newName,
    });
  }
}
```

---

## UI Component

```
┌────────────────────────────────────────────┐
│  Tên gốc (tất cả tên từng dùng):          │
│  [Nguyễn Văn A_____________________]  +   │
│  [Nguyễn Văn B_____________________]  +   │
│  [A Vân (Tên thân mật)_____________]  ×   │
│                                            │
│  [+ Thêm tên khác]                        │
│                                            │
│  Tên mới:                                 │
│  [Nguyễn Hạnh Phúc_________________]      │
└────────────────────────────────────────────┘
```

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 11 Logic 6

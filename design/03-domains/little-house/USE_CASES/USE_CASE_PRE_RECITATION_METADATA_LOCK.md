# USE CASE: Pre-Recitation Metadata Lock
**Module:** `little-house`  
**Phase:** 33 - Kiểm Soát Nhân Quả Chuyên Sâu & Ràng Buộc Pháp Bảo Vật Lý  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

Ngoại trừ trường hợp niệm tích lũy dự phòng, phần **"Kính Tặng"** (Offer To) và **"Người Tặng"** (Offered by) bên trái Ngôi Nhà Nhỏ **BẮT BUỘC PHẢI ĐƯỢC VIẾT** trước khi bắt đầu niệm và chấm đỏ.

### ⚠️ TẠI SAO?
Nếu không viết trước mà niệm rồi mới chấm, Kinh văn có thể bị **linh giới lấy mất**, làm **mất năng lượng**.

### ✅ QUYẾT TẮC:
1. Viết "Kính Tặng" (người/mục đích)
2. Ký tên "Người Tặng" (người niệm)
3. **SAU ĐÓ** mới bắt đầu đếm Kinh

---

## 🎯 Acceptance Criteria

### AC1: Mandatory Fields Validation
**GIVEN** user tạo mới 1 Task `LittleHouse`  
**WHEN** họ click "Bắt Đầu Đếm Kinh"  
**THEN** 
- Zod validation check:
  ```typescript
  const LittleHouseStartDto = z.object({
    offerTo: z.string().min(1, "Bắt buộc nhập Kính Tặng"),
    offeredBy: z.string().min(1, "Bắt buộc ký tên Người Tặng"),
    count: z.number().optional()
  }).strict();
  ```

### AC2: Block Start If Fields Empty
**GIVEN** một trong 2 trường còn trống  
**WHEN** user bấm "Bắt Đầu Đếm Kinh"  
**THEN** 
- Nút bị vô hiệu hóa (Disabled)
- Hiển thị error tooltip:
  ```
  ❌ CHƯA ĐỦ THÔNG TIN
  
  Bắt buộc phải điền:
  ☐ Kính Tặng: [__________]
  ☐ Người Tặng: [__________]
  ```

### AC3: Clear Visual Indication
**GIVEN** form không đầy đủ  
**WHEN** render page  
**THEN** 
- Highlight missing fields bằng màu đỏ:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📝 THÔNG TIN NGÔI NHÀ NHỎ
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Kính Tặng:
  [_________________________] ❌ Bắt buộc
  
  Người Tặng (Ký Tên):
  [_________________________] ❌ Bắt buộc
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  [Bắt Đầu Đếm Kinh] ← DISABLED
  ```

### AC4: API-Level Protection
**GIVEN** client cố bypass frontend  
**WHEN** send request với empty fields  
**THEN** 
- Backend trả về `400 Bad Request`:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "Bắt buộc phải điền Kính Tặng và Người Tặng trước khi bắt đầu niệm",
    "fields": {
      "offerTo": "Bắt buộc",
      "offeredBy": "Bắt buộc"
    },
    "code": "METADATA_REQUIRED_BEFORE_RECITATION"
  }
  ```

### AC5: Exemption For Backup Recitation
**GIVEN** user chọn "Niệm Tích Lũy Dự Phòng"  
**WHEN** tạo backup task  
**THEN** 
- Bypass metadata requirement:
  ```
  ☐ Đây là Kinh Tích Lũy Dự Phòng
  
  [Nếu tick, không cần điền Kính Tặng]
  ```

### AC6: Lock After Start
**GIVEN** user điền xong metadata  
**WHEN** họ bấm "Bắt Đầu Đếm"  
**THEN** 
- Fields become **READ-ONLY** (không chỉnh sửa được)
- Hiển thị lock icon:
  ```
  Kính Tặng: Người cần kinh của [Tên] 🔒
  Người Tặng: Nguyễn Văn A 🔒
  ```

---

## 🔧 Technical Notes

### Zod Schema
```typescript
// Location: apps/api/src/little-house/dto/start-recitation.dto.ts

export const StartRecitationDto = z.object({
  littleHouseId: z.string().cuid(),
  offerTo: z.string().trim().min(1, "Kính Tặng bắt buộc"),
  offeredBy: z.string().trim().min(1, "Người Tặng bắt buộc"),
  isBackupRecitation: z.boolean().optional()
}).refine(
  (data) => {
    // Allow empty if backup
    if (data.isBackupRecitation) return true;
    
    // Otherwise require both fields
    return data.offerTo.length > 0 && data.offeredBy.length > 0;
  },
  {
    message: "Ngoài backup, bắt buộc phải có Kính Tặng và Người Tặng"
  }
);
```

### Database Schema
```prisma
model LittleHouse {
  id              String   @id @default(cuid())
  offerTo         String   // Kính Tặng (locked after start)
  offeredBy       String   // Người Tặng (locked after start)
  isReciting      Boolean  @default(false)
  isLocked        Boolean  @default(false) // Metadata locked
  
  @@index([isLocked])
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Trình tự Ngôi Nhà Nhỏ
- **Q&A Huyền học:** Vai trò của Kính Tặng và Người Tặng
- **Hướng dẫn thực hành:** Cách điền thông tin Ngôi Nhà Nhỏ

---

## 🏷️ Tags
`#phase-33` `#little-house` `#metadata-lock` `#pre-recitation` `#dharma-protection`

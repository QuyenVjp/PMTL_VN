# USE CASE: Past-Life Merit Transfer Age Gate
**Module:** `vows-merit`, `wisdom-qa`  
**Phase:** 25 - Micro-Normalization & Specific Karma Measurement  
**Source:** Buddhism in Plain Terms, Hướng dẫn Ngôi Nhà Nhỏ, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp Vụ

**Công Đức Bảo Sơn Thần Chú** (Merit Treasure Mountain Mantra) có tác dụng đặc biệt: chuyển hóa **việc thiện ở kiếp trước** thành công đức bảo vệ kiếp này.

**Giới hạn nghiêm ngặt:** Phương pháp này **CHỈ CÓ TÁC DỤNG** đối với:
- Thai nhi đang nằm trong bụng mẹ, HOẶC
- Trẻ em **DƯỚI 5 TUỔI**

**Lý do:** Sau 5 tuổi, nghiệp lực của kiếp này đã bắt đầu phát động mạnh mẽ, việc chuyển hóa từ kiếp trước không còn hiệu quả.

---

## 🎯 Acceptance Criteria

### AC1: Mandatory Target & DOB Input
**GIVEN** user chọn mục đích niệm là `[Cho con cái]`  
**AND** chọn bài chú "Công Đức Bảo Sơn Thần Chú"  
**WHEN** họ điền form Prescription  
**THEN** 
- Form DTO bắt buộc có field `targetChild` với:
  - `childName` (required)
  - `childDateOfBirth` (required, ISO date format)
- Hiển thị tooltip: *"Bài chú này yêu cầu xác định chính xác độ tuổi của trẻ"*

### AC2: Age Validation - Block Over 5 Years Old
**GIVEN** user đã nhập `childDateOfBirth`  
**WHEN** system tính toán tuổi hiện tại của trẻ  
**AND** `currentAge > 5 years`  
**THEN** 
- Zod validation ném lỗi `400 Bad Request`
- Error message:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "Thuật toán chuyển hóa việc thiện từ kiếp trước qua 'Công Đức Bảo Sơn Thần Chú' chỉ áp dụng giới hạn cho thai nhi và trẻ nhỏ DƯỚI 5 TUỔI. Trẻ lớn hơn 5 tuổi không thể áp dụng phương pháp này.",
    "field": "targetChild.dateOfBirth",
    "childAge": "6 years 3 months",
    "maxAllowedAge": "5 years",
    "mantraCode": "MERIT_TREASURE_MOUNTAIN"
  }
  ```

### AC3: Allow Unborn & Under-5
**GIVEN** `childDateOfBirth` trong tương lai (thai nhi chưa sinh)  
**OR** `currentAge ≤ 5 years`  
**WHEN** user submit form  
**THEN** 
- Validation pass ✅
- Lưu thành công vào database
- Ghi log: *"Merit transfer mantra prescribed for child under age limit"*

### AC4: Future-Date Handling (Unborn Child)
**GIVEN** `childDateOfBirth > today`  
**WHEN** system validate  
**THEN** 
- Accept as valid (thai nhi chưa sinh)
- Display badge: `[🤰 Cho thai nhi]`
- Set `isUnborn: true` flag

### AC5: Frontend Real-Time Age Display
**GIVEN** user đang nhập `childDateOfBirth`  
**WHEN** họ chọn ngày  
**THEN** 
- Hiển thị real-time age calculation:
  ```
  Độ tuổi hiện tại: 3 tuổi 7 tháng ✅
  Phù hợp cho bài chú này
  ```
  
  HOẶC nếu quá tuổi:
  ```
  Độ tuổi hiện tại: 6 tuổi 2 tháng ❌
  Bài chú này chỉ áp dụng cho trẻ DƯỚI 5 tuổi
  ```

---

## 🔧 Technical Notes

### Zod Validation Schema
```typescript
// DTO: CreateRecitationPrescriptionDto
const PastLifeMeritTargetSchema = z.object({
  childName: z.string().min(1, "Tên trẻ là bắt buộc"),
  childDateOfBirth: z.coerce.date(),
}).refine(
  (data) => {
    const today = new Date();
    const dob = new Date(data.childDateOfBirth);
    
    // Allow future dates (unborn)
    if (dob > today) return true;
    
    // Calculate age in years
    const ageInYears = (today.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    return ageInYears <= 5;
  },
  {
    message: "Thuật toán chuyển hóa việc thiện từ kiếp trước qua 'Công Đức Bảo Sơn Thần Chú' chỉ áp dụng giới hạn cho thai nhi và trẻ nhỏ DƯỚI 5 TUỔI. Trẻ lớn hơn 5 tuổi không thể áp dụng phương pháp này.",
    path: ["childDateOfBirth"]
  }
);
```

### Database Schema Extension
```prisma
model RecitationPrescription {
  // ... existing fields
  
  // Past-life merit transfer tracking
  targetChildName        String?
  targetChildDateOfBirth DateTime?
  isUnborn               Boolean  @default(false)
  
  @@index([targetChildDateOfBirth])
}
```

### Age Calculation Utility
```typescript
// Location: packages/shared/src/utils/age-calculator.ts

export function calculateAgeInYears(dateOfBirth: Date): number {
  const today = new Date();
  const ageMs = today.getTime() - dateOfBirth.getTime();
  return ageMs / (1000 * 60 * 60 * 24 * 365.25);
}

export function isEligibleForPastLifeMeritTransfer(dateOfBirth: Date): boolean {
  const today = new Date();
  
  // Future date = unborn child = eligible
  if (dateOfBirth > today) return true;
  
  // Under 5 years old = eligible
  return calculateAgeInYears(dateOfBirth) <= 5;
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Chương về nghiệp lực kiếp trước
- **Q&A Huyền học:** Cơ chế chuyển hóa công đức qua các kiếp
- **Hướng dẫn thực hành:** Giới hạn độ tuổi cho các phương pháp tu đặc thù

---

## 🏷️ Tags
`#phase-25` `#age-gate` `#past-life-merit` `#child-protection` `#merit-transfer` `#vows-merit` `#wisdom-qa`

# USE CASE: Mantra Polarity Inversion Lock
**Module:** `vows-merit`, `wisdom-qa`  
**Phase:** 36 - Tầng Định Luật Vật Lý Lượng Tử & Quản Trị Trạng Thái Pháp Bảo  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

**Chú Đại Bi** (Great Compassion Mantra) → tăng năng lượng dương  
**Tâm Kinh** (Heart Sutra) → xoa dịu vong linh

### ⚠️ QUY TẮC NGƯỢC CHIỀU:

#### 🧠 BỆNH TÂM THẦN / TRẦM CẢM:
- Vong linh đang **khống chế não**
- ❌ CẤM niệm Chú Đại Bi quá nhiều (≤ 21 biến)
- ✅ ĐẶC BIỆT dốc sức niệm Tâm Kinh (21-49 biến)

#### 🔥 BỆNH UNG THƯ:
- **Giai đoạn sớm**: Tránh Chú Đại Bi quá nhiều
- **Giai đoạn ổn định (Remission)**: 
  - ✅ BẮT BUỘC 49 biến Chú Đại Bi/ngày (vĩnh viễn)
  - ✅ Duy trì suốt phần đời còn lại để giữ mạng sống

---

## 🎯 Acceptance Criteria

### AC1: Health Record Integration
**GIVEN** user setup daily recitation  
**WHEN** check health tags  
**THEN** 
- Query `HealthProfile`:
  ```typescript
  const healthTags = user.healthProfile?.tags || [];
  // Possible: MENTAL_ILLNESS, CANCER, CANCER_REMISSION, etc.
  ```

### AC2: Mental Illness Hard-Limit
**GIVEN** `healthTag = MENTAL_ILLNESS`  
**WHEN** user try to input Chú Đại Bi count  
**THEN** 
- Hard-cap at **21 biến**:
  ```
  🧠 BỆNH TÂM THẦN - HẠNG CHẾ NGHIÊM CẤP
  
  Chú Đại Bi: [____] (MAX: 21 biến)
  Tâm Kinh: [____] (KHUYẾN NGHỊ: 21-49 biến)
  
  ⚠️  CẢNH BÁO:
  Bệnh tâm linh không được niệm Chú Đại Bi 
  quá 21 biến (sẽ chọc giận vong linh).
  Hãy tăng Tâm Kinh để xoa dịu!
  ```

### AC3: Cancer Early Stage Caution
**GIVEN** `healthTag = CANCER` AND `status = EARLY`  
**WHEN** user input daily count  
**THEN** 
- Show warning but allow moderate count:
  ```
  Giai đoạn sớm: Tránh Chú Đại Bi quá nhiều
  Chú Đại Bi: [____] (KHUYẾN CÁO: ≤ 21 biến)
  Tâm Kinh: [____] (KHUYẾN CÁO: 21-49 biến)
  ```

### AC4: Cancer Remission - Permanent 49
**GIVEN** `healthTag = CANCER` AND `status = REMISSION`  
**WHEN** try to change Chú Đại Bi count  
**THEN** 
- **LOCK at 49** (Cannot modify):
  ```
  🔒 CHIA HÓA ỔNĐỊNH - LẠM NHẬP DUY TRÌ
  
  Chú Đại Bi: 49 biến 🔒 (VĨ VIỄN KHÔNG GIẢM)
  Tâm Kinh: [____]
  
  ℹ️  THÔNG BÁO HỆ THỐNG:
  
  Bệnh ung thư của bạn đã ổn định (Remission).
  
  Để GIỮ MẠNG SỐNG, bạn BẮT BUỘC duy trì 
  49 biến Chú Đại Bi mỗi ngày SUỐT ĐỜI.
  
  Bồ Tát sẽ bảo vệ sức khỏe của bạn qua số 
  Chú Đại Bi liên tục này.
  
  ❌ KHÔNG ĐƯỢC giảm xuống dưới 49 biến
  ```

### AC5: API-Level Enforcement
**GIVEN** client try POST with invalid count  
**WHEN** submit to backend  
**THEN** 
- Validate and reject:
  ```json
  {
    "statusCode": 400,
    "error": "INVALID_MANTRA_CONFIGURATION",
    "healthTag": "MENTAL_ILLNESS",
    "requestedCount": 108,
    "maxAllowed": 21,
    "message": "Bệnh tâm thần tuyệt đối không được niệm Chú Đại Bi quá 21 biến"
  }
  ```

### AC6: Audit Trail For Violations
**GIVEN** user repeatedly try to bypass  
**WHEN** 3+ violations detected  
**THEN** 
- Flag for moderation:
  ```typescript
  {
    userId: <uuid>,
    violation: "MANTRA_LIMIT_OVERRIDE_ATTEMPT",
    healthTag: "MENTAL_ILLNESS",
    attemptCount: 3,
    action: "ACCOUNT_WARNING"
  }
  ```

---

## 🔧 Technical Notes

### Zod Validation
```typescript
// Location: apps/api/src/vows-merit/dto/daily-recitation.dto.ts

export const DailyRecitationDto = z.object({
  daBeiCount: z.number(),
  heartSutraCount: z.number()
}).superRefine((data, ctx) => {
  const userHealth = getUserHealthTags(); // from context
  
  if (userHealth.includes('MENTAL_ILLNESS')) {
    if (data.daBeiCount > 21) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mental illness: max 21 Da Bei",
        path: ['daBeiCount']
      });
    }
  }
  
  if (userHealth.includes('CANCER') && 
      userHealth.includes('REMISSION')) {
    if (data.daBeiCount !== 49) {
      // Force set to 49
      data.daBeiCount = 49;
    }
  }
});
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Chú Đại Bi vs Tâm Kinh cho bệnh
- **Q&A Huyền học:** Polarity inversion cho bệnh tâm thần và ung thư
- **Hướng dẫn thực hành:** Cách chọn mantras phù hợp với tình trạng sức khỏe

---

## 🏷️ Tags
`#phase-36` `#vows-merit` `#mantra-polarity` `#health-gating` `#cancer-remission`

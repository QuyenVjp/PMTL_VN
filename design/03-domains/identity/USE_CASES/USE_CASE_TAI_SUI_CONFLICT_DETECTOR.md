# USE CASE: Tai Sui Conflict Detector
**Module:** `identity`, `calendar`  
**Phase:** 38 - Toàn Bộ Lịch Trình Pháp Môn Tâm Linh & Bộ Định Tuyến Thời Gian Đa Chiều  
**Source:** Buddhism in Plain Terms, Zodiac Protection Protocols

---

## 📋 Tóm Tắt Nghiệp VỤ

**Phạm Thái Tuế - Năm tuổi trùng với con giáp của năm hiện tại hoặc xung khắc.**

### 🐀 CÁC CON GIÁP:
- Chuột, Trâu, Hổ, Mèo, Rồng, Rắn
- Ngựa, Dê, Khỉ, Gà, Chó, Lợn

### ✅ PHẢI LÀM KHI PHẠM THÁI TUẾ:
1. **Niệm NNN theo đúng số tuổi**
2. **Dâng Kính Tặng cho Oan gia trái chủ**

---

## 🎯 Acceptance Criteria

### AC1: Zodiac Detection
**GIVEN** user profile with birthdate  
**WHEN** calculate zodiac  
**THEN** 
- Determine Chinese zodiac:
  ```typescript
  const ZODIAC_ANIMALS = [
    'Chuột', 'Trâu', 'Hổ', 'Mèo',
    'Rồng', 'Rắn', 'Ngựa', 'Dê',
    'Khỉ', 'Gà', 'Chó', 'Lợn'
  ];
  
  function getZodiacAnimal(year: number): string {
    return ZODIAC_ANIMALS[(year - 1900) % 12];
  }
  
  // User born 1987 -> Mèo
  ```

### AC2: Tai Sui Year Matching
**GIVEN** current year zodiac  
**WHEN** check user zodiac  
**THEN** 
- Detect conflict:
  ```typescript
  const currentYearZodiac = getZodiacAnimal(2026); // Hổ
  const userZodiac = getZodiacAnimal(1987); // Mèo
  
  if (userZodiac === currentYearZodiac) {
    flagTaiSui = true; // Phạm Thái Tuế
  }
  ```

### AC3: Tai Sui Alert on App Startup
**GIVEN** user in Tai Sui year  
**WHEN** open app  
**THEN** 
- Display warning:
  ```
  ⚠️  CẢNH BÁO: PHẠM THÁI TUẾ
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🐯 Năm 2026 là năm Hổ
  👤 Bạn sinh năm 1987 (tuổi Mèo)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  😔 NĂM NÀY BẠN PHẠM THÁI TUẾ
  
  Theo tứ trụ ngũ hành, Mèo (Thỏ) 
  xung khắc với Hổ trong năm này.
  
  ⚡ Có thể gặp:
  - Xung khắc gia đình
  - Mâu thuẫn công việc
  - Sức khỏe bất ổn
  - Tài lộc không tốt
  
  ✅ PHẢI HÓA GIẢI:
  
  Bạn phải niệm:
  [Số tuổi] tấm Ngôi Nhà Nhỏ
  Kính Tặng: "Oan gia trái chủ của
  bạn để hóa giải xung Thái Tuế"
  
  [Xem Chi Tiết]
  [Tạo NNN Hóa Giải]
  ```

### AC4: Zodiac Conflict Calendar
**GIVEN** multiple potential conflict years  
**WHEN** initialize system  
**THEN** 
- Show forecast:
  ```
  🔮 DỰ ĐỐN THÁI TUẾ CÓ THỂ CỦA BẠN
  
  Sinh năm 1987 (Mèo):
  
  📅 Các năm có xung khắc:
  - 2026 (Hổ) ⚠️  ← HIỆN TẠI
  - 2029 (Rồng) ⚠️
  - 2032 (Tuần Hoàn)
  - 2035 (Hổ) ⚠️
  ...
  
  💡 Mẹo: Bạn có thể chuẩn bị sớm 
  cho những năm này.
  ```

### AC5: Custom NNN Target Generator
**GIVEN** Tai Sui year detected  
**WHEN** user request solution  
**THEN** 
- Auto-create batch:
  ```typescript
  {
    batchId: <uuid>,
    purpose: 'TAI_SUI_CONFLICT_RESOLUTION',
    userAge: 39, // 2026 - 1987
    targetQuantity: userAge, // 39 NNN
    offerToTemplate: 'Oan gia trái chủ của [Name] để 
                       hóa giải xung Thái Tuế năm [Year]',
    priority: 'HIGH',
    estimatedCompletionDays: Math.ceil(userAge / 2),
    autoSchedule: true
  }
  ```

### AC6: NNN Completion Ceremony
**GIVEN** user complete NNN batch  
**WHEN** reach target  
**THEN** 
- Show celebration:
  ```
  ✨ HÓA GIẢI THÁI TUẾ THÀNH CÔNG!
  
  🎉 Bạn đã hoàn thành [39/39] tấm NNN
     để hóa giải xung Thái Tuế!
  
  📊 Công đức:
  ✓ Đã cầu xin hóa giải từ 
    Oan gia trái chủ
  ✓ Phật & Bồ Tát sẽ can thiệp
  
  🌟 Năm [2026] sẽ được bảo vệ!
  
  💝 Cảm tạ!
  
  [Tiếp Tục Hành Trình Tu]
  ```

### AC7: Zodiac Harmony Guide
**GIVEN** show non-conflict years  
**WHEN** provide encouragement  
**THEN** 
- Display hopeful message:
  ```
  💚 NĂM TIẾP THEO SẼ TỐT HƠN
  
  Sinh năm 1987 (Mèo), những năm 
  sau sẽ không xung khắc:
  
  ✅ 2027 (Rắn) - Hợp
  ✅ 2028 (Ngựa) - Tương Hợp
  ✅ 2030 (Khỉ) - Thịnh Vượng
  
  Hãy tiếp tục hành sự tu tập, 
  Phật sẽ che chở bạn!
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Thái Tuế xung khắc
- **Q&A Huyền học:** Cách hóa giải năm khó khăn
- **Hướng dẫn thực hành:** Niệm NNN hóa giải

---

## 🏷️ Tags
`#phase-38` `#tai-sui` `#zodiac-conflict` `#harmony-resolver` `#annual-protection`

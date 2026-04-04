# USE CASE: Incense Offering Timing & Quantity Protocol
**Module:** `altar-management`, `vows-merit`  
**Phase:** 39 - Chi Tiết Quy Tắc Thắp Hương & Nghi Thức Thực Hương  
**Source:** Buddhism in Plain Terms, Sacred Incense Protocols

---

## 📋 Tóm Tắt Nghiệp VỤ

**Thắp hương không chỉ hình thức mà là phương tiện kết nối năng lượng với chư Phật và Bồ Tát.**

### ⏰ THỜI GIAN CẤN CHẶT:
- **Sáng:** 6h, 8h, 10h
- **Tối:** 6h (18h), 8h (20h), 10h (22h)

### 📊 SỐ LƯỢNG NHANG:
- **Ngày thường:** 1 nén/lư hương
- **Mùng 1, 15 Âm lịch & Lễ vía:** **3 nén/lư hương**
- **Chỉ có 1 lư chung:** **3 nén buổi sáng + 3 nén buổi tối = 6 nén/ngày**

---

## 🎯 Acceptance Criteria

### AC1: Morning Golden Hour Windows
**GIVEN** user schedule morning incense  
**WHEN** check time  
**THEN** 
- Allow only 6am, 8am, 10am:
  ```typescript
  const MORNING_INCENSE_HOURS = [6, 8, 10];
  const currentHour = new Date().getHours();
  
  if (!MORNING_INCENSE_HOURS.includes(currentHour)) {
    throw ForbiddenException({
      code: 'WRONG_MORNING_HOUR',
      message: 'Thắp hương sáng phải vào 6h, 8h hoặc 10h'
    });
  }
  ```

### AC2: Evening Golden Hour Windows
**GIVEN** user schedule evening incense  
**WHEN** check time  
**THEN** 
- Allow only 6pm (18h), 8pm (20h), 10pm (22h):
  ```typescript
  const EVENING_INCENSE_HOURS = [18, 20, 22];
  const currentHour = new Date().getHours();
  
  if (!EVENING_INCENSE_HOURS.includes(currentHour)) {
    throw ForbiddenException({
      code: 'WRONG_EVENING_HOUR',
      message: 'Thắp hương tối phải vào 18h, 20h hoặc 22h'
    });
  }
  ```

### AC3: Normal Day Quantity = 1 Stick per Altar
**GIVEN** regular day (not lunar 1/15 or festival)  
**WHEN** user record incense offering  
**THEN** 
- Require 1 stick per altar:
  ```
  🕯️  NGÀY THƯỜNG - THẮP HƯƠNG
  
  Bạn có bao nhiêu lư hương?
  
  ○ 1 lư (chung cho toàn bộ)
  ○ 2 lư riêng biệt
  ○ 3 lư riêng biệt
  ○ 4+ lư
  
  Xác nhận số nhang cần dùng:
  [1 lư] → [1 nén nhang]
  [2 lư] → [2 nén nhang] (1 nén/lư)
  [3 lư] → [3 nén nhang] (1 nén/lư)
  
  ☐ Tôi sẽ dùng [X] nén nhang
  
  [Xác Nhận]
  ```

### AC4: Lunar 1/15 - Triple Stick Requirement
**GIVEN** lunar 1st or 15th detected  
**WHEN** user try to record  
**THEN** 
- Enforce 3 sticks per altar:
  ```
  🌸 MÙNG 1 / 15 ÂM LỊCH
  
  ⚠️  BẮTÙ BUỘC: 3 NÉN/LƯ HƯƠNG
  
  Hôm nay là ngày mùng 1/15:
  
  Bạn có bao nhiêu lư hương?
  
  ○ 1 lư (chung) → [3 nén bắt buộc]
  ○ 2 lư → [3 nén/lư = 6 nén tổng]
  ○ 3 lư → [3 nén/lư = 9 nén tổng]
  
  Cần chuẩn bị số nhang:
  [X] nén nhang bắt buộc hôm nay
  
  ☐ Tôi đã chuẩn bị đủ nhang
  
  [Xác Nhận Đã Sẵn Sàng]
  ```

### AC5: Festival Day Triple Requirement
**GIVEN** festival day (Vesak, Buddha's Enlightenment, etc.)  
**WHEN** user try to record  
**THEN** 
- Enforce 3 sticks like lunar 1/15:
  ```
  🌸 NGÀY KỶ NIỆM - NGÔI VÍA
  
  ⚠️  BẮTÙ BUỘC: 3 NÉN/LƯ HƯƠNG
  
  Hôm nay là ngày vía [Bồ Tát/Phật]:
  [Ngày X Tháng Y - Ngôi Vía]
  
  Năng lượng từ bi đạt đỉnh!
  
  Quy tắc như ngày mùng 1/15:
  [3 nén/lư hương]
  
  Ví dụ:
  - 1 lư → 3 nén
  - 2 lư → 6 nén
  - 3 lư → 9 nén
  
  ☐ Tôi đã chuẩn bị [X] nén nhang
  
  [Xác Nhận]
  ```

### AC6: Single Altar with 3 Sticks All Day
**GIVEN** user have only 1 shared altar  
**WHEN** it's lunar 1/15 or festival  
**THEN** 
- Clarify daily requirement:
  ```
  ⚠️  BẠN CHỈ CÓ 1 LƯ CHUNG
  
  Quy tắc cho ngày [Mùng 1 / Kỷ Niệm]:
  
  📍 BỘ SỐ HẰNG NGÀY (khi có 1 lư):
  
  Sáng: 3 nén
  Tối: 3 nén
  
  TỔNG HÔM NAY: 6 nén nhang
  
  ✅ LƯUÙ Ý:
  - Cả 3 nén PHẢI CẮM CÙNG LÚC
    (không được tách rời từng nén)
  - Cầm hương cao ngang trán
  - Lạy 3 lạy
  - Cắm đồng thời vào lư
  
  ☐ Tôi sẽ dùng 6 nén hôm nay
  
  [Xác Nhận]
  ```

### AC7: Timing Audit Log
**GIVEN** user complete incense task  
**WHEN** record  
**THEN** 
- Document timing + quantity:
  ```typescript
  {
    userId: <uuid>,
    incenseSessionId: <uuid>,
    date: <date>,
    timeOfOffering: 8, // 8am
    dayType: 'LUNAR_1ST' | 'FESTIVAL' | 'NORMAL',
    quantityPerAltar: 1 | 3,
    totalAltar: 1,
    totalSticksUsed: 1 | 3,
    timestamp: now()
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Quy tắc thắp hương
- **Q&A Huyền học:** Thời gian và số lượng hương
- **Hướng dẫn thực hành:** Lịch trình hằng ngày thắp hương

---

## 🏷️ Tags
`#phase-39` `#altar-management` `#incense-timing` `#quantity-rules` `#lunar-protocol`

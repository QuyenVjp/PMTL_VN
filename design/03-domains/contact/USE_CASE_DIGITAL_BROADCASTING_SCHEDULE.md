# USE CASE: Digital Broadcasting Schedule Guard
**Module:** `contact`, `calendar`  
**Phase:** 37 - Tầng Định Luật Vật Lý Lượng Tử & Bảo Mật Không Gian Tâm Linh  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

**Lịch gọi điện thoại cho Đài Trưởng Lư Quân Hoành cực kỳ nghiêm ngặt:**

### 📻 LỊCH PHÁT SÓNG (Múi Giờ Sydney, Úc):

| Loại | Thời Gian | Ghi Chú |
|---|---|---|
| 🔮 Xem Đồ Đằng | T3, T4, T7 @ 17:30-18:00 | Totem Reading |
| 📖 Bạch Thoại Phật Pháp | T3, T4, T7 @ 17:10-17:30 | Buddhist Discourse |
| ❓ Vấn Đáp (KHÔNG xem đồ) | T6, CN @ 13:00-14:30 | Q&A (No Totem) |

### ⚠️ TÍNH TỚI DAYLIGHT SAVING:
- **Mùa Đông (4/4 - 3/10):** Sydney chênh Bắc Kinh **2 tiếng**
- **Mùa Hè (3/10 - 4/4):** Sydney chênh Bắc Kinh **3 tiếng**

---

## 🎯 Acceptance Criteria

### AC1: Timezone Calculation Library
**GIVEN** initialize schedule system  
**WHEN** bootstrap  
**THEN** 
- Import timezone handler:
  ```typescript
  import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
  
  const SYDNEY_TZ = 'Australia/Sydney';
  
  function getScheduleInSydney(): DateTime {
    const now = new Date();
    return utcToZonedTime(now, SYDNEY_TZ);
  }
  ```

### AC2: Schedule Configuration
**GIVEN** define broadcast windows  
**WHEN** setup routes  
**THEN** 
- Store schedule matrix:
  ```typescript
  const BROADCAST_SCHEDULE = [
    {
      type: 'TOTEM_READING',
      days: [3, 4, 7], // Tue, Wed, Sat (1-7)
      startTime: '17:30',
      endTime: '18:00',
      sydneyTime: true,
      maxCallers: null
    },
    {
      type: 'BUDDHIST_DISCOURSE',
      days: [3, 4, 7],
      startTime: '17:10',
      endTime: '17:30',
      sydneyTime: true,
      maxCallers: null
    },
    {
      type: 'QA_SESSION',
      days: [6, 0], // Fri, Sun
      startTime: '13:00',
      endTime: '14:30',
      sydneyTime: true,
      maxCallers: null
    }
  ];
  ```

### AC3: Call Button State on UI
**GIVEN** render contact page  
**WHEN** check current time  
**THEN** 
- Show dynamic button state:
  ```
  🎤 GỌI TỔNG ĐÀI ĐÔNG PHƯƠNG
  
  ┌─────────────────────────────────┐
  │                                 │
  │  ⏱️  Giờ Sydney (Úc):            │
  │      [THỨ 3] 17:45 (Chiều)      │
  │                                 │
  │  ✅ ĐANG MỞ CỬA                  │
  │  → Xem Đồ Đằng (15 phút nữa)    │
  │                                 │
  │  ┌─────────────────────────┐   │
  │  │  📞 Gọi Xem Đồ Đằng     │   │
  │  │  [ENABLED - Green]      │   │
  │  └─────────────────────────┘   │
  │                                 │
  │  Countdown: 00:15 giây           │
  │  ▓▓▓▓▓░░░░░░░░░░░ 25%          │
  │                                 │
  └─────────────────────────────────┘
  ```

### AC4: During Wrong Time
**GIVEN** outside schedule window  
**WHEN** check availability  
**THEN** 
- Show disabled state:
  ```
  🎤 GỌI TỔNG ĐÀI ĐÔNG PHƯƠNG
  
  ┌─────────────────────────────────┐
  │                                 │
  │  ⏱️  Giờ Sydney (Úc):            │
  │      [THỨ 2] 09:15 (Sáng)      │
  │                                 │
  │  ❌ ĐÓNG CỬA                    │
  │  → Xem Đồ Đằng mở vào T3-T7    │
  │    17:30 (Sydney time)          │
  │                                 │
  │  ┌─────────────────────────┐   │
  │  │  📞 Gọi Xem Đồ Đằng     │   │
  │  │  [DISABLED - Grey]      │   │
  │  └─────────────────────────┘   │
  │                                 │
  │  Mở lại trong: 32 giờ 15 phút   │
  │  ▓░░░░░░░░░░░░░░░░░░░░ 5%     │
  │                                 │
  │  💡 Bạn có thể Vấn Đáp          │
  │     vào T6, CN 13:00-14:30      │
  │     (Không xem Đồ Đằng)         │
  │                                 │
  └─────────────────────────────────┘
  ```

### AC5: QA Mode Indicator
**GIVEN** Friday 13:00 Sydney  
**WHEN** show availability  
**THEN** 
- Display QA-specific message:
  ```
  ❓ VẤN ĐÁP PHẬT HỌC
  
  ┌─────────────────────────────────┐
  │                                 │
  │  ⏱️  Giờ Sydney (Úc):            │
  │      [THỨ 6] 13:15 (Chiều)      │
  │                                 │
  │  ✅ ĐANG MỞ CỬA                  │
  │  → Vấn Đáp (1 giờ 15 phút nữa)  │
  │                                 │
  │  ⚠️  LƯU Ý:                      │
  │  Chuyên mục này KHÔNG XEM        │
  │  ĐỒ ĐẰNG. Chỉ Vấn Đáp Phật học. │
  │                                 │
  │  ┌─────────────────────────┐   │
  │  │  ❓ Gọi Vấn Đáp Phật Học │   │
  │  │  [ENABLED - Blue]       │   │
  │  └─────────────────────────┘   │
  │                                 │
  └─────────────────────────────────┘
  ```

### AC6: Daylight Saving Transition
**GIVEN** approach DST transition  
**WHEN** system detect change  
**THEN** 
- Auto-adjust times:
  ```typescript
  const transitionDate = new Date('2025-04-04');
  
  if (now >= transitionDate) {
    // Summer time: Sydney +3 hours vs Beijing
    TIMEZONE_OFFSET = 3;
  } else {
    // Winter time: Sydney +2 hours vs Beijing
    TIMEZONE_OFFSET = 2;
  }
  
  // Recalculate all UI times
  ```

### AC7: Call Routing Logic
**GIVEN** user click call button  
**WHEN** verify eligibility  
**THEN** 
- Route to correct service:
  ```typescript
  const now = getScheduleInSydney();
  const dayOfWeek = now.getDay();
  const time = `${now.getHours()}:${now.getMinutes()}`;
  
  if (dayOfWeek in [3,4,7] && time in ['17:30-18:00']) {
    route = 'TOTEM_READING';
  } else if (dayOfWeek in [6,0] && time in ['13:00-14:30']) {
    route = 'QA_SESSION';
  } else {
    throw new ForbiddenException('Outside schedule window');
  }
  ```

### AC8: Notification Before Window
**GIVEN** 30 minutes before start  
**WHEN** cronjob trigger  
**THEN** 
- Send reminder:
  ```
  📢 NHẮC NHỚ: CHUYÊN MỤC SẮP BẮT ĐẦU
  
  ✨ Xem Đồ Đằng (Totem Reading)
  
  ⏱️  Trong 30 phút (17:30 Sydney time)
  🎤 Gọi ngay để dự trữ slot
  
  [Gọi Ngay]  [Bỏ Qua]
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Lịch công khai phát sóng
- **Q&A Huyền học:** Múi giờ và Daylight Saving
- **Hướng dẫn thực hành:** Cách gọi tổng đài đúng giờ

---

## 🏷️ Tags
`#phase-37` `#contact` `#broadcast-schedule` `#sydney-timezone` `#daylightsaving`

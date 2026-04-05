# USE CASE: Daily Golden Hours Protocol
**Module:** `vows-merit`, `engagement`  
**Phase:** 38 - Toàn Bộ Lịch Trình Pháp Môn Tâm Linh & Bộ Định Tuyến Thời Gian Đa Chiều  
**Source:** Buddhism in Plain Terms, Dharma Door Daily Practice Schedule

---

## 📋 Tóm Tắt Nghiệp VỤ

**Thời gian trong ngày quyết định dòng chảy năng lượng m-Dương.**

Hệ thống phải khóa cứng các tính năng dựa trên múi giờ địa phương (Local Time) của người dùng.

### ✅ KHUNG GIỜ "VÀNG" (OPTIMAL WINDOWS):
- **Thắp Hương:** 6h, 8h, 10h sáng; 18h, 20h, 22h tối
- **Đốt NNN:** 8h, 10h sáng; 16h chiều (phải từ 6h sáng - trước lặn mặt trời)
- **Đốt Thăng Văn Đổi Tên:** CHỈ 6h, 8h sáng HOẶC 16h chiều (trời phải nắng)
- **Làm Thăng Văn Khuyến Đạo:** Ban ngày (6h, 8h, 16h, tối đa 22h) - TUYỆT ĐỐI TỪ BAN ĐÊM

---

## 🎯 Acceptance Criteria

### AC1: Incense Offering Time Windows
**GIVEN** user open altar-management  
**WHEN** try to record incense offering  
**THEN** 
- Restrict to golden hours:
  ```typescript
  const INCENSE_GOLDEN_HOURS = [6, 8, 10, 18, 20, 22];
  const currentHour = new Date().getHours();
  
  if (!INCENSE_GOLDEN_HOURS.includes(currentHour)) {
    throw ForbiddenException({
      code: 'INCENSE_WRONG_HOUR',
      message: 'Thắp hương phải vào 6h, 8h, 10h sáng hoặc 18h, 20h, 22h tối',
      nextOptimalTime: findNextGoldenHour()
    });
  }
  ```

### AC2: NNN Burning Time Window
**GIVEN** user try to burn Little House  
**WHEN** check time constraints  
**THEN** 
- Only allow 8, 10am or 4pm:
  ```
  🔥 ĐỐT NGÔI NHÀ NHỎ
  
  ⏱️  Thời điểm tốt nhất để đốt:
  ○ 08:00 - 09:30 (Sáng)
  ○ 10:00 - 11:30 (Sáng)
  ○ 16:00 - 17:30 (Chiều)
  
  ⚠️  LƯU Ý:
  - Phải từ 6h sáng đến trước lặn mặt trời
  - Chỉ đốt vào ngày thời tiết tốt, nắng ráo
  
  Thời điểm hiện tại: 14:45 ❌ KHÔNG HỢP LỆ
  
  ⏳ Thời điểm tiếp theo: 16:00 (1 giờ 15 phút nữa)
  
  [Chờ Đến 16:00]  [Tìm Hiểu Thêm]
  ```

### AC3: Name Change Form Burning - Strict Window
**GIVEN** user attempt name change burn  
**WHEN** validate timing  
**THEN** 
- ONLY 6am, 8am, 4pm on sunny days:
  ```typescript
  const STRICT_HOURS = [6, 8, 16]; // 6am, 8am, 4pm
  const current = new Date().getHours();
  
  if (!STRICT_HOURS.includes(current)) {
    throw ForbiddenException({
      code: 'NAME_CHANGE_STRICT_HOURS',
      message: 'Đốt Thăng Văn Đổi Tên chỉ được 6h, 8h sáng hoặc 16h chiều'
    });
  }
  ```

### AC4: Convincing Family Form - Day-Only Lock
**GIVEN** user create family form task  
**WHEN** schedule  
**THEN** 
- Enforce daytime only (no night):
  ```
  📝 LÀM THĂNG VĂN KHUYẾN ĐẠO
  
  ⏱️  Thời điểm cho phép:
  ☑️  6h sáng
  ☑️  8h sáng
  ☑️  16h chiều
  ☑️  22h tối (tối đa)
  
  ❌ TUYỆT ĐỐI KHÔNG:
  - Ban đêm ngoài 22h
  - Sau 22h tối
  
  Lý do: Giấy này nhạy cảm và chỉ được 
  để trên bàn thờ trong lúc nhang cháy.
  Không được để lưu lại quá lâu.
  ```

### AC5: UI Indicator for Golden Hours
**GIVEN** user open any offering task  
**WHEN** render form  
**THEN** 
- Show real-time indicator:
  ```
  🕐 THỜI GIAN HIỆN TẠI: 07:30 (Sáng)
  
  Thắp Hương: ✅ TỐT
  Đốt NNN: ⏳ CHƯA (chờ 08:00)
  Đốt Thăng Văn: ⏳ CHƯA (chờ 08:00)
  Khuyến Đạo: ✅ TỐT
  
  🔔 Countdown: 00:30 đến 08:00 
              (NNN Optimal Time)
  ```

### AC6: Geolocation Timezone Sync
**GIVEN** user travel to different timezone  
**WHEN** app detect location change  
**THEN** 
- Use local time, not server time:
  ```typescript
  const userTimezone = getTimezoneFromGeolocation(gpsCoordinates);
  const localTime = toZonedTime(new Date(), userTimezone);
  const hour = localTime.getHours();
  
  // Validate golden hours in LOCAL timezone
  ```

### AC7: Audit Log
**GIVEN** task created during golden hour  
**WHEN** record event  
**THEN** 
- Document timing:
  ```typescript
  {
    userId: <uuid>,
    taskType: 'INCENSE_OFFERING' | 'NNN_BURN' | 'NAME_CHANGE',
    scheduledHour: 8,
    isGoldenHour: true,
    timezone: 'Asia/Ho_Chi_Minh',
    timestamp: now()
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Lịch trình hàng ngày
- **Q&A Huyền học:** Thời điểm tốt nhất để dâng hương
- **Hướng dẫn thực hành:** Nguyên tắc "ngũ phục" hàng ngày

---

## 🏷️ Tags
`#phase-38` `#daily-protocol` `#golden-hours` `#timezone-sync` `#offering-schedule`

# USE CASE: Forbidden Hour Deadzone Lock
**Module:** `content`, `vows-merit`  
**Phase:** 38 - Toàn Bộ Lịch Trình Pháp Môn Tâm Linh & Bộ Định Tuyến Thời Gian Đa Chiều  
**Source:** Buddhism in Plain Terms, Spiritual Protection Protocols

---

## 📋 Tóm Tắt Nghiệp VỤ

**Khung giờ "Tử Huyệt" - Absolute Prohibition Hours:**

### ⏰ KHUNG GIỜ CẤM TUYỆT ĐỐI:
- **22:00 (10h tối):** E-Reader vô hiệu hóa *Tâm Kinh* & *Chú Vãng Sanh*
- **02:00 - 05:00 (Rạng sáng):** **TUYỆT ĐỐI CẤM** niệm bất kỳ Kinh văn nào

### ✅ NGOẠI LỆ (Override):
Nếu **Kính Tặng (Offer To) đã được điền**, cho phép niệm đến **23:59 (12h đêm)**

---

## 🎯 Acceptance Criteria

### AC1: 10 PM Hard Disable
**GIVEN** user open E-Reader  
**WHEN** time reach 22:00 (10pm)  
**THEN** 
- Auto-disable Heart Sutra and Amitabha:
  ```
  ⛔ KHÓA - CẤM NIỆM TỪ 22:00 TRỞ ĐI
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Kinh Tâm - DISABLED (🔴 Khóa)
  Chú Vãng Sanh - DISABLED (🔴 Khóa)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ⏱️  Thời gian hiện tại: 22:15
  
  🚫 Lý do: Để tránh thu hút linh giới
  vào thời khắc tối tần (10h tối đến
  12h đêm là giờ cao điểm của âm lực)
  
  ✅ Kinh Kinh có thể niệm 
     (ít ảnh hưởng bởi thời gian)
  
  💤 Khuyến nghị: Đi ngủ và niệm lại
     vào sáng hôm sau từ 6h trở đi
  ```

### AC2: Override Lock - Offer To Check
**GIVEN** user have existing NNN with dedication  
**WHEN** system detect filled "Kính Tặng" field  
**THEN** 
- Allow bypass until midnight:
  ```typescript
  const hasActiveNnnWithOffer = await checkNnnQueue({
    userId,
    status: 'PENDING',
    offerToName: { $ne: null } // Offer To filled
  });
  
  if (hasActiveNnnWithOffer && hour <= 23) {
    // Allow Heart Sutra + Amitabha until 23:59
    allowRecitation = true;
  }
  ```

### AC3: Override UI Display
**GIVEN** override condition met  
**WHEN** show E-Reader at 22:30 with active NNN  
**THEN** 
- Display temporary unlock:
  ```
  ⏰ 22:30 - TRƯỜNG HỢP ĐẶC BIỆT: MỞ KHÓA
  
  Bạn có 1 tấm NNN chờ niệm:
  📿 Kính Tặng: Bác của [Người A]
  
  ✅ Hệ thống cho phép niệm đến 23:59
  
  Kinh Tâm: ENABLED (🟢 Mở)
  Chú Vãng Sanh: ENABLED (🟢 Mở)
  
  ⏳ Mở khóa đến: 23:59
     (1h 29p nữa)
  
  💡 Lưu ý: Sau 23:59 sẽ tự động khóa.
  Hãy niệm hết NNN chờ trước deadline.
  ```

### AC4: 2 AM - 5 AM Absolute Blackout
**GIVEN** time window 02:00-05:00  
**WHEN** user try any action  
**THEN** 
- Show RED emergency lock screen:
  ```
  🚨🚨🚨 KHÓA TUYỆT ĐỐI - GIỜ QUỶ GATE 🚨🚨🚨
  
  ⏱️  02:00 - 05:00 (RẠNG SÁNG)
  
  💀 ĐÂY LÀ THỜI KHẮC TỐI TẦN NHẤT
     TRONG NGÀY:
  
  Các linh thể âm độc, quỷ quái, vong linh
  hoạt động mạnh nhất vào thời gian này.
  
  🚫 TUYỆT ĐỐI KHÔNG ĐƯỢC:
  ✗ Niệm Tâm Kinh
  ✗ Niệm Chú Vãng Sanh
  ✗ Niệm bất kỳ Kinh văn nào
  ✗ Thậm chí bấm mở App khi thấy cần
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  📢 Nếu bạn vô tình không ngủ được
     và thức dậy lúc này:
  
  ➡️  Hãy:
     1. Ngồi ngay dậy
     2. Niệm Tiêu Tai Cát Tường Thần Chú
     3. Hoặc chỉ niệm im lặng tên Phật
     4. Tuyệt đối không bấm điện thoại
  
  ➡️  NHỚ: Đặt chuông báo thức
        và thức dậy sớm vào 6h sáng
        để niệm Kinh Tâm thay thế!
  
  [Đóng]
  ```

### AC5: Weather Guard Integration
**GIVEN** storm or heavy rain detected  
**WHEN** any time of day  
**THEN** 
- Apply weather override (separate from time):
  ```typescript
  const isStormy = await getWeatherData(userLocation);
  
  if (isStormy && (currentHour >= 22 || 
      (currentHour >= 2 && currentHour < 5))) {
    
    // Even more restrictive during bad weather
    allowRecitation = false;
    reason = 'WEATHER_DANGER + FORBIDDEN_HOUR';
  }
  ```

### AC6: Notification Before Lockout
**GIVEN** 30 minutes before 22:00  
**WHEN** cronjob runs  
**THEN** 
- Send reminder:
  ```
  ⏰ NHẮC NHỚ: SẮP VÀO GIỜ CẤM
  
  ⏳ Trong 30 phút (22:00), 
     ứng dụng sẽ khóa Tâm Kinh 
     và Chú Vãng Sanh.
  
  🎯 Hãy hoàn thành NNN của hôm nay 
     trước 22:00 nếu có thể!
  
  [Xem NNN Chờ Niệm]  [OK]
  ```

### AC7: Audit Trail
**GIVEN** complete recitation session  
**WHEN** record  
**THEN** 
- Log time validation:
  ```typescript
  {
    userId: <uuid>,
    recitationType: 'HEART_SUTRA' | 'AMITABHA',
    sessionStartHour: 21,
    sessionEndHour: 23,
    overrideUsed: true,
    overrideReason: 'ACTIVE_NNN_OFFER_TO',
    timestamp: now()
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Giờ cấm kỵ
- **Q&A Huyền học:** Thời khắc tối tần - Quỷ gate mở
- **Hướng dẫn thực hành:** Bảo vệ tâm thức vào ban đêm

---

## 🏷️ Tags
`#phase-38` `#forbidden-hours` `#deadzone-lock` `#night-protection` `#spirit-safety`

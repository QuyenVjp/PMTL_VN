# USE CASE: Weather Guard Recitation Block
**Module:** `wisdom-qa`, `content`  
**Phase:** 38 - Toàn Bộ Lịch Trình Pháp Môn Tâm Linh & Bộ Định Tuyến Thời Gian Đa Chiều  
**Source:** Buddhism in Plain Terms, Environmental Protection Protocols

---

## 📋 Tóm Tắt Nghiệp VỤ

**Điều kiện thời tiết ảnh hưởng đến năng lượng tâm linh:**

### ⛈️ TUYỆT ĐỐI CẤM KHI:
- **Trời quá âm u, tối tăm** (ngập mây)
- **Mưa to** có sấm sét, giông bão
- **Gió mạnh gió lốc**

### ✅ NGOẠI LỆ:
Nếu **trường hợp khẩn cấp cứu mạng**, có thể đốt NNN dù thời tiết xấu

---

## 🎯 Acceptance Criteria

### AC1: Weather Data Integration
**GIVEN** initialize weather module  
**WHEN** bootstrap  
**THEN** 
- Connect to weather API:
  ```typescript
  const WEATHER_API = 'OpenWeatherMap' | 'Local Weather Service';
  
  async function getWeatherAtLocation(coordinates) {
    return {
      condition: 'CLEAR' | 'CLOUDY' | 'RAINY' | 'STORMY',
      cloudCover: 0-100, // percent
      rainIntensity: 0-5, // mm/hour scale
      windSpeed: 0-50, // km/h
      visibility: 0-10, // km
      hasLightning: boolean
    };
  }
  ```

### AC2: Heart Sutra Block on Dark Skies
**GIVEN** user open E-Reader  
**WHEN** check weather cloudiness  
**THEN** 
- Block if too dark:
  ```typescript
  const weather = await getWeatherAtLocation();
  
  if (weather.cloudCover > 80 && 
      weather.visibility < 3) {
    
    disableRecitation('HEART_SUTRA');
    disableRecitation('AMITABHA');
    
    throw ForbiddenException({
      code: 'WEATHER_TOO_DARK',
      message: 'Trời quá tối tăm, không thể niệm Kinh Tâm'
    });
  }
  ```

### AC3: Amitabha Recitation Storm Block
**GIVEN** thunder storm detected  
**WHEN** user try Amitabha  
**THEN** 
- Block with warning:
  ```
  ⛈️  CẢNH BÁO: GIÔNG BÃO
  
  Hệ thống phát hiện:
  ⚡ Sấm sét trong vùng
  🌧️  Mưa to 
  💨 Gió mạnh
  
  ✗ Chú Vãng Sanh bị KHÓA
  
  Lý do: Khi trời có giông bão, linh 
  thế điện từ rất hỗn loạn. Niệm 
  Chú Vãng Sanh lúc này sẽ bị "giật" 
  bởi tia sét tinh thần, nguy hiểm cho 
  hệ thần kinh tâm linh của bạn.
  
  ✅ Lựa chọn an toàn:
  - Niệm tên Phật im lặng
  - Đọc Kinh Phổ Môn
  - Niệm Tiêu Tai Cát Tường
  
  [Xem Kinh Khác]
  ```

### AC4: NNN Burning Weather Prevention
**GIVEN** user try to burn Little House  
**WHEN** check conditions  
**THEN** 
- Prevent burning in bad weather:
  ```
  🔥 ĐỐT NGÔI NHÀ NHỎ
  
  ⛈️  CẢNH BÁO: THỜI TIẾT XẤU
  
  Hệ thống phát hiện:
  ☁️  Mây kín trời (92% phủ)
  🌧️  Mưa (25mm/giờ)
  💨 Gió (35 km/h)
  
  ❌ KHÔNG THỂ ĐỐT VÀO LÚC NÀY
  
  Lý do: Trời mưa gió khiến lửa không 
  ổn định, khói lẫn với mây, năng lượng 
  tán xạ không hiệu quả.
  
  ✅ Chờ đến:
  - Trời ráo (Cloud cover < 50%)
  - Không mưa (Dry conditions)
  - Gió nhẹ (Wind < 20 km/h)
  
  ⏳ Dự báo: Chiều mai 14:00 
             sẽ là thời tiếp tốt
  
  [Xác Nhận - Chờ Thời Tiết]
  ```

### AC5: Emergency Override - Life-Saving Exception
**GIVEN** user in critical situation  
**WHEN** select emergency mode  
**THEN** 
- Allow burn despite weather:
  ```
  🚨 TRƯỜNG HỢP KHẨN CẤP
  
  Tôi cần đốt NNN NGAY TỨC THỨ để 
  cứu mạng sống (bệnh nhân liệt sống 
  sắp qua đời, tai nạn, v.v.).
  
  ☐ Xác nhận: Đây là trường hợp 
             khẩn cấp cứu mạng
  ☐ Xác nhận: Tôi hiểu rủi ro 
             của thời tiết xấu
  
  [Cho Phép Đốt - Khẩn Cấp]
  ```

### AC6: Real-Time Weather Updates
**GIVEN** burn session in progress  
**WHEN** weather condition deteriorate  
**THEN** 
- Monitor and warn:
  ```typescript
  // Check every 5 minutes during burning
  setInterval(async () => {
    const updated = await getWeatherAtLocation();
    
    if (updated.hasLightning || 
        updated.rainIntensity > 4) {
      
      sendWarning('Thời tiết đang xấu đi. 
                   Vui lòng dừng đốt ngay.');
    }
  }, 5 * 60_000);
  ```

### AC7: Post-Weather Recovery Suggestion
**GIVEN** weather clear after block  
**WHEN** conditions improve  
**THEN** 
- Send notification:
  ```
  ☀️  THỜI TIẾT ĐÃ TỐTÙ
  
  Trời đã ráo hôn. Bây giờ là thời 
  điểm tốt để đốt NNN hoặc niệm Kinh Tâm.
  
  Bạn có NNN chờ? 
  
  [Xem NNN Chờ]  [Cảm ơn]
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Thời tiết và pháp hành
- **Q&A Huyền học:** Giông bão và năng lượng tâm linh
- **Hướng dẫn thực hành:** Làm thế nào để bảo vệ bản thân vào thời tiết xấu

---

## 🏷️ Tags
`#phase-38` `#weather-guard` `#recitation-protection` `#storm-safety` `#environmental-blocking`

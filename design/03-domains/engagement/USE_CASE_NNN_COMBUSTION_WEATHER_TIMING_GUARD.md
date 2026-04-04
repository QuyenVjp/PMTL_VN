# USE CASE: NNN Combustion Weather & Timing Guard
**Module:** `engagement`, `calendar`  
**Phase:** 40 - 15 Luật Vật Lý & Tâm Linh Cực Kỳ Vi Tế  
**Source:** Dharma Door Core Texts, NNN Burning Protocols

---

## 📋 Tóm Tắt Nghiệp VỤ

**Ngôi Nhà Nhỏ (NNN) chỉ được đốt vào thời tiết nắng ráo từ 6h sáng đến trước khi mặt trời lặn.**

### ✅ ĐƯỢC ĐỐT:
- 6h sáng → trước khi mặt trời lặn
- Trời nắng ráo, không mây mù
- Trời thoáng, không mưa/gió

### ❌ CẤM ĐỐT:
- Sau khi mặt trời lặn (ban đêm)
- Trời âm u, mây mù
- Mưa bão, sấm sét, giông gió
- **Ngoại lệ khẩn cấp:** Bệnh nặng, người cần kinh nôn nóng đòi nợ (thì được đốt)

---

## 🎯 Acceptance Criteria

### AC1: Sunrise Boundary Enforcement
**GIVEN** current time before sunrise  
**WHEN** check NNN burn permission  
**THEN** 
- Block with countdown:
  ```
  ⛔ CHƯA ĐỐT ĐƯỢC
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Thời gian hiện tại: 5:45 AM
  
  ⚠️  NNN chỉ được đốt từ 6 giờ sáng.
  
  ⏱️  Còn lại: 15 phút
  
  Mặt trời mọc lúc: 5:47 AM
  
  [Đợi 15 Phút]
  ```

### AC2: Sunset Boundary Enforcement
**GIVEN** close to or after sunset  
**WHEN** check NNN burn permission  
**THEN** 
- Show sunset time + warning:
  ```
  🌅 CHÊM CẢNH BÁO: GẦN TỚI HOÀNG HÔN
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Thời gian hiện tại: 17:40
  Mặt trời lặn lúc: 17:50 (10 phút nữa)
  
  ⚠️  NNN phải đốt xong trước lúc 
      mặt trời lặn.
  
  ❌ KHÔNG được đốt sau hoàng hôn!
  
  ⏱️  Còn: 10 phút
  
  Nếu không kịp, phải đợi ngày mai:
  [Ngày mai 6h AM]
  
  [Bắt Đầu Đốt Ngay]
  [Đợi Ngày Mai]
  ```

### AC3: Darkness Absolute Block
**GIVEN** after sunset or night time  
**WHEN** try to burn NNN  
**THEN** 
- Complete block:
  ```
  ⛔ TUYỆTÙ ĐỐI CẤM - BAN ĐÊM
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Thời gian: 18:25 (Đã tối)
  
  🚫 TUYỆTÙ ĐỐI CẤMUÙ ĐỐT NNN 
     VÀO BAN ĐÊM!
  
  Lý do: Ban đêm là thời gian âm khí 
  thịnh hành. Đốt NNN ban đêm sẽ:
  - Kêu gọi vong linh xấu
  - NNN kém hiệu quả
  - Gây rắc rối cho gia đình
  
  ✅ NGOẠI LỆ (khẩn cấp cứu mạng):
  
  Chỉ được đốt ban đêm nếu:
  ○ Người cần kinh bị bệnh nặng
  ○ Người cần kinh nôn nóng đòi nợ
  ○ Trường hợp khẩn cấp mang tính 
    cứu mạng
  
  Nếu khẩn cấp, vui lòng:
  [Nhập Mã Khẩn Cấp]
  [Đợi Ngày Mai]
  ```

### AC4: Weather Condition Gates
**GIVEN** check weather API  
**WHEN** rain/storm/poor visibility detected  
**THEN** 
- Show weather warning:
  ```
  🌧️  THỜI TIẾT XẤU - CẤM ĐỐT
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Thời tiết tại vị trí của bạn:
  
  ❌ MƯA TO (Heavy Rain)
  ❌ SẤM SẾT (Thunder)
  ❌ GIÔNG GIÓ (Typhoon)
  ❌ MÂY MỊ (Heavy Overcast)
  
  ⚠️  TUYỆTÙ ĐỐI CẤM ĐỐT NNN 
     VÀO NGÀY NHƯ VẬY!
  
  Lý do: Thời tiết tồi làm:
  - Tro sớ bị gió thổi rác rối
  - Khói không bay thẳng → công đức 
    giảm
  - Linh giới không lành tiếp nhận
  - Nguy hiểm cho an toàn cá nhân
  
  ⏱️  Dự báo thời tiết sạch:
  [Ngày Mai 7h-17h: Nắng ráo]
  
  [Chờ Thời Tiết Tốt]
  [Khẩn Cấp Override]
  ```

### AC5: Sunny/Clear Weather Confirmation
**GIVEN** within burning window + good weather  
**WHEN** ready to burn  
**THEN** 
- Allow with confirmation:
  ```
  ✅ CÓ THỂ ĐỐT
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Thời gian: 8:30 AM
  Thời tiết: Nắng ráo, thoáng mát
  Độ cao mặt trời: 40°
  
  ✅ ĐỦ ĐIỀU KIỆN ĐỐT NNN!
  
  ✓ Nằm trong khung 6h-trước lặn
  ✓ Trời nắng ráo
  ✓ Không mưa, gió mạnh
  ✓ Không sấm sét
  
  Lưu ý:
  - Dũa tro sớ ra ngoài không gian 
    thoáng
  - Không để tro bay vào nhà
  - Sau đốt xong, bọc tro vào giấy 
    → thùng rác (cấm xả toilet)
  
  [Bắt Đầu Đốt NNN]
  [Hủy]
  ```

### AC6: Emergency Protocol
**GIVEN** need to burn NNN at night  
**WHEN** health emergency detected  
**THEN** 
- Require emergency confirmation:
  ```
  ⚠️  KHẨN CẤP: ĐỐT ĐÊM
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Bạn yêu cầu đốt NNN ban đêm 
  (20:30 tối).
  
  Để override cấm kỵ, vui lòng:
  
  ✓ Xác nhận: Người cần kinh gặp 
    trường hợp khẩn cấp:
  
  ○ Bệnh nặng, đau đớn gây nguy hiểm
  ○ Người cần kinh nôn nóng đòi nợ 
    (bóng/linh thể)
  ○ Tình trạng cận kề tử vong
  
  [Xác Nhận Khẩn Cấp]
  [Hủy - Đợi Mai]
  ```

### AC7: Audit Log
**GIVEN** NNN burn complete  
**WHEN** record session  
**THEN** 
- Log with weather conditions:
  ```typescript
  {
    nnnBurnSessionId: <uuid>,
    userId: <uuid>,
    startTime: <timestamp>,
    endTime: <timestamp>,
    weather: 'SUNNY' | 'PARTLY_CLOUDY' | 'OVERCAST',
    hasRain: false,
    hasStorm: false,
    windSpeed: 5, // km/h
    visibility: 'CLEAR',
    withinGoldenHours: true,
    afterSunset: false,
    emergencyOverride: false,
    compliance: true
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Dharma Door Texts - NNN Burning Protocols
- **Q&A Huyền học:** Tại sao không được đốt NNN ban đêm
- **Hướng dẫn thực hành:** Xử lý tro sớ an toàn

---

## 🏷️ Tags
`#phase-40` `#nnn-combustion` `#weather-guard` `#timing-enforcement` `#emergency-protocol`

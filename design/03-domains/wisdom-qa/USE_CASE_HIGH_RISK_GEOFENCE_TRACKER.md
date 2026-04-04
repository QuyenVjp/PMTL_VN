# USE CASE: High-Risk Geofence Karma Tracker
**Module:** `wisdom-qa`, `calendar`  
**Phase:** 37 - Tầng Định Luật Vật Lý Lượng Tử & Bảo Mật Không Gian Tâm Linh  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

**Những nơi tập trung vong linh cực nhiều:**
- 🏥 Bệnh viện
- 💀 Mộ phần
- 🔥 Lò hỏa táng

### ⚠️ NGUY HIỂM:
Đi đến những nơi này → Vong linh có thể bám vào người

### ✅ PHẢI LÀM:
Niệm Ngôi Nhà Nhỏ siêu độ để bảo vệ

---

## 🎯 Acceptance Criteria

### AC1: High-Risk Location Database
**GIVEN** initialize geofence system  
**WHEN** setup tracking  
**THEN** 
- Define high-risk zones:
  ```typescript
  const HIGH_RISK_ZONES = [
    {
      type: 'HOSPITAL',
      displayName: 'Bệnh viện',
      riskLevel: 'HIGH',
      radius: 500 // meters
    },
    {
      type: 'CEMETERY',
      displayName: 'Mộ phần',
      riskLevel: 'CRITICAL',
      radius: 1000
    },
    {
      type: 'CREMATORIUM',
      displayName: 'Lò hỏa táng',
      riskLevel: 'CRITICAL',
      radius: 1000
    }
  ];
  ```

### AC2: GPS Geofence Monitoring
**GIVEN** user app running  
**WHEN** check location continuously  
**THEN** 
- Monitor for 30+ minutes in zone:
  ```typescript
  if (gpsDistance < RISK_ZONE.radius && 
      durationInZone > 30_minutes) {
    // Trigger alert
  }
  ```

### AC3: Exit Alert Notification
**GIVEN** user leave high-risk zone  
**WHEN** trigger alert  
**THEN** 
- Send push notification:
  ```
  🚨 CẬP CỨU: TÌNH HUỐNG NGUY HIỂM
  
  Bạn vừa rời khỏi [Bệnh viện/Mộ phần/
  Lò hỏa táng].
  
  Trường khí tại đây rất xấu. Vong linh 
  có thể đã bám vào bạn.
  
  ⚡ HÃY LÀMÙ NGAY:
  
  1. Tăng cường Chú Đại Bi ngay hôm nay
  2. Chuẩn bị niệm 4-7 tấm NNN nếu cảm 
     thấy cơ thể đau mỏi đột ngột
  
  [Xem Hướng Dẫn]  [Bắt Đầu Chú Đại Bi]
  ```

### AC4: Symptom Checker Integration
**GIVEN** user feel sudden pain  
**WHEN** open Wisdom-QA within 24h  
**THEN** 
- Suggest NNN creation:
  ```
  💫 LIÊN QUAN ĐẾN CHUYẾN VIẾNG THĂM
  
  Bạn vừa trở về từ [Bệnh viện].
  Hôm nay bạn cảm thấy đau mỏi đột ngột?
  
  Điều này có thể do vong linh đã bám.
  
  Hệ thống khuyến nghị tạo NGAY 4-7 
  tấm Ngôi Nhà Nhỏ để siêu độ.
  
  [Tạo NNN Khẩn Cấp]
  ```

### AC5: Location History Audit
**GIVEN** track user movement  
**WHEN** analyze patterns  
**THEN** 
- Record geofence events:
  ```typescript
  {
    userId: <uuid>,
    zoneType: 'HOSPITAL',
    entryTime: <timestamp>,
    exitTime: <timestamp>,
    durationMinutes: 45,
    warningIssued: true,
    nnwRecommended: 7
  }
  ```

### AC6: Optional Opt-Out
**GIVEN** privacy concern  
**WHEN** user settings  
**THEN** 
- Allow disable:
  ```
  ⚙️  CÀI ĐẶT GEOFENCE
  
  ☐ Bật giám sát vị trí cao nguy hiểm
  
  (Tắt nếu bạn lo lắng về quyền riêng tư.
   Lưu ý: Bạn sẽ không nhận được cảnh báo)
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Những nơi tập trung vong linh
- **Q&A Huyền học:** Bảo vệ bản thân tại các địa điểm nguy hiểm
- **Hướng dẫn thực hành:** Xử lý sau khi viếng bệnh viện

---

## 🏷️ Tags
`#phase-37` `#wisdom-qa` `#geofence-tracker` `#high-risk-zones` `#spirit-protection`

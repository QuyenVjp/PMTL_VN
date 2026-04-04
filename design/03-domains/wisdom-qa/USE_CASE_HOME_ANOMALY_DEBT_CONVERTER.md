# USE CASE: Home Anomaly-to-Debt Converter
**Module:** `wisdom-qa`, `little-house`  
**Phase:** 36 - Tầng Định Luật Vật Lý Lượng Tử & Quản Trị Trạng Thái Pháp Bảo  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

Khi trong nhà xuất hiện những **dị thường không rõ nguyên nhân**:
- 🔊 Âm thanh lạ (không ai biết từ đâu)
- ⚡ Thiết bị điện tử đột ngột hỏng liên tục
- 🚰 Đường ống nước thải liên tục tắc nghẽn

### ⚠️ ĐIỀU NÀY KHÔNG PHẢI SỰ CỐ VẬT LÝ THƯỜNG!
**Đây là dấu hiệu: Vong linh ngoại lai đang chiếm giữ không gian nhà**

### ✅ PHẢI LÀM:
**Không gọi thợ sửa chữa** → Tạo **Karmic Debt**: 4-7 tấm NNN

---

## 🎯 Acceptance Criteria

### AC1: Anomaly Symptom Checker
**GIVEN** user open Wisdom-QA (Symptom Checker)  
**WHEN** browse symptoms  
**THEN** 
- Add new category: `[Dị thường Không gian sống / Home Anomalies]`
  ```
  Bạn có gặp hiện tượng lạ trong nhà không?
  
  ☐ Âm thanh lạ (không biết từ đâu)
  ☐ Thiết bị điện hỏng liên tục
  ☐ Nước/cống tắc liên tục
  ☐ Cảm giác lạnh bất thường
  ☐ Cơm cơm hay bị lục soát
  ☐ Khác...
  ```

### AC2: AI Diagnosis → Karmic Debt Auto-Creation
**GIVEN** user tick 2+ anomaly items  
**WHEN** click "Phân Tích"  
**THEN** 
- AI NOT suggest calling repair service
- Instead: **Auto-create Karmic Debt**
  ```json
  {
    type: "LITTLE_HOUSE",
    targetType: "HOME_CREDITOR",
    quantity: 5, // Default mid-range
    reason: "HOME_ANOMALY_DETECTED",
    description: "Phát hiện vong linh ngoại lai chiếm giữ không gian nhà",
    offerToTemplate: "Người cần kinh của ngôi nhà của [User Name]"
  }
  ```

### AC3: Notification Alert
**GIVEN** debt created  
**WHEN** system respond  
**THEN** 
- Show alert:
  ```
  ⚠️  PHÁT HIỆN DỊ THƯỜNG KHÔNG GIAN
  
  Hệ thống phát hiện vong linh ngoại lai đang 
  chiếm giữ không gian nhà bạn.
  
  ❌ KHÔNG NÊN: Gọi thợ sửa chữa
  ✅ PHẢI LÀM: Niệm Ngôi Nhà Nhỏ
  
  Hệ thống đã TỰ ĐỘNG tạo khoản nợ:
  📋 4-7 tấm Ngôi Nhà Nhỏ cho:
  "Người cần kinh của ngôi nhà của [Tên]"
  
  [Xem Chi Tiết]  [Bắt Đầu Niệm]
  ```

### AC4: Offer To Auto-Fill
**GIVEN** debt record created  
**WHEN** generate template  
**THEN** 
- Auto-fill `offerTo`:
  ```
  Kính Tặng: Người cần kinh của ngôi nhà của [User Name]
  Người Tặng: [User Name]
  
  (Cannot edit - locked)
  ```

### AC5: Audit Log
**GIVEN** debt creation complete  
**WHEN** save  
**THEN** 
- Record:
  ```typescript
  {
    eventType: "HOME_ANOMALY_DEBT_CREATED",
    userId: <uuid>,
    detectedAnomalies: ["Strange_sounds", "Appliance_failures", "Water_issues"],
    debtQuantity: 5,
    createdAt: now(),
    reason: "VONG_LINH_OCCUPATION"
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Vong linh ngoại lai trong nhà
- **Q&A Huyền học:** Cách phát hiện và xử lý dị thường
- **Hướng dẫn thực hành:** Không gọi thợ, mà niệm Kinh

---

## 🏷️ Tags
`#phase-36` `#wisdom-qa` `#home-anomaly` `#karma-debt` `#spirit-occupation`

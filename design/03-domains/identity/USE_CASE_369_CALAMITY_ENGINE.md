# USE CASE: 369 Calamity Engine
**Module:** `identity`, `wisdom-qa`  
**Phase:** 38 - Toàn Bộ Lịch Trình Pháp Môn Tâm Linh & Bộ Định Tuyến Thời Gian Đa Chiều  
**Source:** Buddhism in Plain Terms, Calamity & Protection Protocols

---

## 📋 Tóm Tắt Nghiệp VỤ

**Nạn Quan 3-6-9 - Con người gặp kiếp nạn lớn khi số tuổi kết thúc bằng 3, 6, hoặc 9.**

### ⚠️ CÁC TUỔI NGUY HIỂM:
- 19, 23, 29, 33, 39, 43, 49, 53, 59, 63, 69, 73, 79, 83, 89, 93, 99, ...

### ✅ XỬ LÝ CALAMITY YEAR:
1. **Niệm NNN số lượng lớn**
2. **Phóng sinh**
3. **Niệm *Tiêu Tai Cát Tường Thần Chú***
4. **Niệm *Thánh Vô Lượng Thọ Quyết Định Quang Minh Vương Đà La Ni***

---

## 🎯 Acceptance Criteria

### AC1: 369 Age Detection
**GIVEN** user age profile  
**WHEN** analyze birthday  
**THEN** 
- Flag calamity years:
  ```typescript
  const CALAMITY_ENDINGS = [3, 6, 9];
  
  function is369Age(age: number): boolean {
    return CALAMITY_ENDINGS.includes(age % 10);
  }
  
  // Examples:
  is369Age(19); // true
  is369Age(33); // true
  is369Age(49); // true
  is369Age(20); // false
  ```

### AC2: RED ALERT - Calamity Year Detected
**GIVEN** user profile shows 369 age  
**WHEN** system startup  
**THEN** 
- Display critical alert:
  ```
  🚨 CẬP CỨU: NĂM "NẠNÙ QUAN"
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔴 BẠN ĐANG Ở TRONG NĂM NGUY HIỂM!
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Tuổi của bạn: [X] ← Kết thúc bằng 9
  
  Năm này là "Nạn Quan" - năm con 
  người dễ gặp những sự cố lớn, 
  bệnh tật, tai nạn, hoặc mất mát.
  
  ⚠️  TUYỆT ĐỐI PHẢI:
  ✗ KHÔNG chủ quan
  ✗ KHÔNG đánh bạc
  ✗ KHÔNG uống rượu
  ✗ KHÔNG lái xe khinh suất
  ✗ KHÔNG lên cao, leo núi
  ✗ KHÔNG bơi lội nơi sâu
  
  ✅ PHẢI LÀM:
  ✓ Ăn chay nhiều ngày
  ✓ Phóng sinh liên tục
  ✓ Niệm Kinh số lượng lớn
  ✓ Cầu Bồ Tát bảo vệ
  
  [Xem Kế Hoạch Hóa Giải]
  ```

### AC3: Emergency Recitation Protocol
**GIVEN** calamity year active  
**WHEN** user open app  
**THEN** 
- Suggest special mantras:
  ```
  🛡️  KINH CẦUU HÓA GIẢI NẠNÙ QUAN
  
  ⏱️  Còn [X] ngày đến sinh nhật tiếp theo
  
  Hệ thống khuyến cáo:
  
  📿 NIỆM NGAY:
  
  1. Tiêu Tai Cát Tường Thần Chú
  (tiêu tan các tai họa, giải nạn)
  
  2. Thánh Vô Lượng Thọ Quyết Định 
     Quang Minh Vương Đà La Ni
  (kéo dài tuổi thọ, vượt qua nạn)
  
  3. Chú Đại Bi
  (mẹ giáo, bảo vệ)
  
  📊 Mục tiêu hàng ngày:
  - Chú Tiêu Tai Cát Tường: 49 biến
  - Chú Vô Lượng Thọ: 21 biến
  - Chú Đại Bi: 21 biến
  
  [Nghe Kinh Âm]
  [Tạo Task Hàng Ngày]
  ```

### AC4: NNN Generation for 369 Ages
**GIVEN** calamity year detected  
**WHEN** user open Little House  
**THEN** 
- Auto-generate protective NNN batch:
  ```typescript
  {
    batchId: <uuid>,
    purpose: '369_CALAMITY_PROTECTION',
    targetQuantity: age, // e.g., 33 NNN for age 33
    nnwPerDay: 3,
    expectedCompletionDays: ceil(age / 3),
    priority: 'CRITICAL',
    offerToTemplate: 'Oan gia trái chủ của bạn',
    autoSchedule: true,
    urgency: 'CALAMITY_YEAR'
  }
  ```

### AC5: Life-Release Quota
**GIVEN** calamity year  
**WHEN** track life releases  
**THEN** 
- Set target:
  ```
  🐠 PHÓNG SINH - GIẢI NẠN
  
  Năm "Nạn Quan", hệ thống khuyến 
  cáo phóng sinh tối thiểu:
  
  📊 Mục tiêu:
  - Phóng sinh [age] lần
  - Hoặc ít nhất [age ÷ 2] lần
  - Mỗi lần ≥ 50 con
  
  Tiến độ:
  Phóng Sinh: [██░░░░░░░░] 8/33
  
  Còn: [25/33] lần
  
  💡 Gợi ý: Phóng 1 lần mỗi ngày 
     + 1-2 lần vào cuối tuần
  
  [Tìm Địa Điểm Phóng Sinh]
  ```

### AC6: Preventive Dental Care Warning
**GIVEN** calamity year  
**WHEN** send preventive tip  
**THEN** 
- Alert user:
  ```
  🦷 CẢNH BÁO: CHĂM SÓC RĂNG
  
  Trong năm "Nạn Quan", rất dễ bị 
  sâu răng, chảy máu chân răng, hoặc 
  mất răng.
  
  ✅ PHẢI LÀM:
  ✓ Vệ sinh miệng 3 lần/ngày
  ✓ Thay bàn chải mỗi 3 tháng
  ✓ Khám nha sỹ 2 lần/năm
  ✓ Không nhai gì cứng
  
  🙏 Nếu bị mất răng hoặc sâu:
  Phải niệm NNN thêm để bù công đức
  
  [Xem Hướng Dẫn Chăm Sóc Miệng]
  ```

### AC7: End-of-Calamity-Year Celebration
**GIVEN** calamity year complete  
**WHEN** reach next birthday  
**THEN** 
- Show success message:
  ```
  ✨ VỀ ĐÍCH - NĂM "NẠNÙ QUAN" ĐÃ QUA!
  
  🎉 Chúc mừng! Bạn đã vượt qua 
     năm "Nạn Quan"!
  
  📊 Thành tích:
  ✓ Niệm Tiêu Tai Cát Tường: 1,764 biến
  ✓ Phóng Sinh: 45 lần
  ✓ NNN: 105 tấm
  
  💪 Bạn đã cùng với Phật & Bồ Tát 
     vượt qua nạn!
  
  🙏 Cảm tạ Bồ Tát bảo vệ bạn
  
  👉 Năm tiếp theo sẽ an lành hơn!
  
  [Tiếp Tục Hành Trình Tu]
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Nạn Quan 369
- **Q&A Huyền học:** Cách xử lý tuổi khó khăn
- **Hướng dẫn thực hành:** Kế hoạch hóa giải nạn

---

## 🏷️ Tags
`#phase-38` `#369-calamity` `#protection` `#emergency-protocol` `#lifespan-defense`

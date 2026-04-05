# USE CASE: Incense Angle & Directional Guard
**Module:** `altar-management`  
**Phase:** 39 - Chi Tiết Quy Tắc Thắp Hương & Nghi Thức Thực Hương  
**Source:** Buddhism in Plain Terms, Spatial Integrity Protocols

---

## 📋 Tóm Tắt Nghiệp VỤ

**Hướng của nhang phải đúng cách để tránh ô uế không gian thiêng liêng.**

### 🚫 TUYỆT ĐỐI KHÔNG:
- **Đầu nhang không được chĩa thẳng vào tượng Bồ Tát**
- Cắm nhang sai hướng → năng lượng bị xuyên tâm, mất công đức

### ✅ PHẢI LÀM:
- Nhang cắm thẳng đứng vào lư hương
- Toàn bộ thân nhang dựng thẳng (không cong vẹo)
- Khói bay thẳng lên trên

---

## 🎯 Acceptance Criteria

### AC1: Incense Angle Validation
**GIVEN** user insert incense  
**WHEN** detect improper angle  
**THEN** 
- Show warning:
  ```
  ⚠️  CẢNHÙ BÁO: HƯỚNG NHANG SAI
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ❌ Bạn vừa cắm nhang sai hướng!
  
  Lý do nguy hiểm:
  - Đầu nhang chĩa vào tượng Bồ Tát
    = xuyên tâm không gian
  - Năng lượng bị tán xạ sai hướng
  - Mất công đức, không ghi nhận
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ✅ CÁCH ĐÚNG:
  
  [Sơ đồ]
  
  ❌ SAI:                ✅ ĐÚNG:
  
    Tượng                Tượng
      ↑                    ↑
      |                    |
     (X) ← nhang         (O) ← nhang
       chĩa thẳng      cắm thẳng
       vào tượng         trong lư
  
  Hãy điều chỉnh:
  1. Rút nhang ra
  2. Cắm lại vào lư hương sao cho 
     thân nhang thẳng đứng
  3. Đầu nhang phải ở TRÊN tượng 
     (khói bay lên trên)
  
  [Tôi Đã Sửa Lại]
  ```

### AC2: Straight Vertical Position
**GIVEN** user re-insert incense  
**WHEN** check alignment  
**THEN** 
- Verify proper setup:
  ```
  ✅ HỮ ĐÚNG - NHANG CẮM THẲNG ĐỨC
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  📊 Kiểm tra chuẩn:
  
  ✓ Thân nhang: thẳng đứng 90°
  ✓ Lư hương: ở giữa bàn thờ
  ✓ Khói: bay thẳng lên trên
  ✓ Đầu nhang: KHÔNG chĩa vào tượng
  ✓ Khoảng cách: ≥ 10 cm từ tượng
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  🌟 Lợi ích khi đúng cách:
  - Năng lượng kết nối Bồ Tát
  - Khí trường bàn thờ sạch sẽ
  - Công đức được ghi nhận 100%
  
  Tiếp tục niệm Kinh!
  ```

### AC3: Smoke Flow Visualization
**GIVEN** incense burning properly  
**WHEN** show meditation focus  
**THEN** 
- Guide smoke observation:
  ```
  💨 QUÁN TƯỞNG DÒNG KHÓI HƯƠNG
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Khi nhang đang cháy, hãy quan tâm 
  đến dòng khói:
  
  🌀 Dòng khói nên:
  - Bay thẳng lên trên
  - Không uốn cong
  - Không bị gió thổi lệch
  - Tạo thành một cột khói sạch sẽ
  
  🧘 Kỹ thuật quán tưởng:
  
  1. Nhìn vào dòng khói từ 1-2 phút
  2. Quán tưởng: Khói = năng lượng 
     từ bi của Bồ Tát đang kết nối 
     với bạn
  3. Cảm nhận sự bình an, thanh tịnh
  
  💡 Mẹo: Nếu khói uốn cong → có 
     gió trong nhà hoặc cửa sổ mở, 
     hãy đóng lại để khí lưu thông ổn định.
  ```

### AC4: Incense Angle Correction Guide
**GIVEN** user report improper positioning  
**WHEN** provide guidance  
**THEN** 
- Show step-by-step fix:
  ```
  🔧 HƯỚNGÛ DẪN ĐIỀU CHỈNH HƯỚNG NHANG
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Nếu bạn không chắc chắn:
  
  ✅ BƯỚC 1: Quan sát từ phía trước
  - Đứng thẳng trước bàn thờ
  - Nhìn vào lư hương
  - Hỏi: Đầu nhang có chĩa vào tượng 
    không?
  
  ✅ BƯỚC 2: Quan sát từ phía bên
  - Đứng ở bên trái/phải bàn thờ
  - Quan sát hình bóng của nhang
  - Hỏi: Thân nhang có thẳng 90° 
    không?
  
  ✅ BƯỚC 3: Nếu sai
  - Chần chừ 5-10 phút để khí ổn định
  - Rút nhang ra một chút (không rút 
    hết, chỉ lỏng lẻo)
  - Xoay lư hoặc điều chỉnh góc nhang
  - Cắm lại chắc chắn
  
  ✅ BƯỚC 4: Kiểm tra lại
  - Quan sát dòng khói
  - Xác nhận thẳng đứng
  ```

### AC5: Distance Guard - Minimum Safe Gap
**GIVEN** altar layout recorded  
**WHEN** validate spatial bounds  
**THEN** 
- Enforce minimum distance:
  ```typescript
  const MIN_DISTANCE_FROM_STATUE_CM = 10;
  
  // When incense inserted, calculate distance
  const distance = calculateDistance(
    incensePosition,
    statuePosition
  );
  
  if (distance < MIN_DISTANCE_FROM_STATUE_CM) {
    throw ValidationError({
      code: 'INCENSE_TOO_CLOSE_TO_STATUE',
      message: 'Nhang quá gần tượng Bồ Tát (< 10cm)',
      recommendation: 'Dịch nhang ra xa ít nhất 10cm'
    });
  }
  ```

### AC6: Audit Log for Angle Violations
**GIVEN** user correct improper angle  
**WHEN** record  
**THEN** 
- Log the incident:
  ```typescript
  {
    userId: <uuid>,
    incenseSessionId: <uuid>,
    initialAngle: 'INCORRECT',
    initialProblem: 'POINT_AT_STATUE',
    correctionTime: <timestamp>,
    finalAngle: 'CORRECT_90_DEGREE',
    finalDistance: 12, // cm from statue
    correctionAcknowledged: true
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Không gian thanh tịnh bàn thờ
- **Q&A Huyền học:** Vì sao hướng nhang quan trọng
- **Hướng dẫn thực hành:** Kiểm tra góc độ nhang

---

## 🏷️ Tags
`#phase-39` `#altar-management` `#spatial-integrity` `#angle-guard` `#purity-protocol`

# USE CASE: Incense Lighting & Fire Extinguishing Sequence
**Module:** `altar-management`  
**Phase:** 39 - Chi Tiết Quy Tắc Thắp Hương & Nghi Thức Thực Hương  
**Source:** Buddhism in Plain Terms, Sacred Incense Sequences

---

## 📋 Tóm Tắt Nghiệp VỤ

**Trình tự thắp hương có 6 bước khắt khe, mỗi bước đều ảnh hưởng đến năng lượng liên kết.**

### 6️⃣ TRÌNH TỰ BẮT BUỘC:
1. **Bật đèn hoa sen điện**
2. **Thắp sáng đèn dầu**
3. **Châm nhang từ đèn dầu**
4. **Cầm nhang cao ngang trán → Lạy 3 lạy**
5. **Cắm đồng thời cả 3 nén (KHÔNG TÁCH RỜI)**
6. **Tắt đèn dầu TRƯỚC khi nhang cháy hết (TUYỆT ĐỐI KHÔNG THỔI)**

---

## 🎯 Acceptance Criteria

### AC1: Electric Lotus Lamp First
**GIVEN** user start incense ritual  
**WHEN** guide sequence  
**THEN** 
- Show step 1:
  ```
  🕯️  BƯỚC 1: BẬT ĐÈN HOA SEN ĐIỆN
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Trước tiên, bật đèn hoa sen điện 
  lên trên bàn thờ.
  
  ✅ Lý do: Chiếu sáng bàn thờ, 
     làm Bồ Tát sáng rõ
  
  💡 Hiện tại: [Đèn LED Off]
  
  ☐ Tôi đã bật đèn hoa sen
  
  [Tiếp Tục - Bước 2]
  ```

### AC2: Oil Lamp Ignition
**GIVEN** electric lamp on  
**WHEN** step 2  
**THEN** 
- Guide oil lamp lighting:
  ```
  🔥 BƯỚC 2: THẮPÙ SÁNG ĐÈN DẦU
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Lấy đèn dầu (đèn để dâng Bồ Tát).
  
  Dùng bật lửa hoặc que diêm châm 
  vào bấc dầu để thắp sáng.
  
  ✅ Ngọn lửa đèn dầu phải:
  - Sáng rõ
  - Cháy ổn định
  - Không chìm trong dầu
  
  ⏱️  Kiểm tra:
  [Đèn dầu chưa thắp]
  [Đèn dầu đã sáng ✓]
  
  [Tiếp Tục - Bước 3]
  ```

### AC3: Incense From Oil Lamp Flame
**GIVEN** oil lamp lit  
**WHEN** step 3  
**THEN** 
- Guide incense lighting:
  ```
  🔥 BƯỚC 3: CHÂMÙ NHANG TỪ ĐÈN DẦU
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ⚠️  TUYỆTÙ ĐỐI QUAN TRỌNG:
  ✗ KHÔNG được dùng bật lửa trực tiếp
  ✗ PHẢI dùng ngọn lửa từ đèn dầu
  
  Lấy một nén nhang (hoặc cả 3 nén):
  - Hạ đầu nhang xuống sát ngọn lửa
  - Cho đầu nhang tiếp xúc với lửa
  - Chờ cho đầu nhang bắt lửa sáng rõ
  - Kéo ra khi thấy ngọn lửa phát triển
  
  ✓ Nhang phải:
  - Bắt lửa sáng rõ
  - Có khói bay ra
  - Cháy ổn định
  
  [Đã Châm Nhang Thành Công]
  
  [Tiếp Tục - Bước 4]
  ```

### AC4: Hold High to Forehead & Bow 3 Times
**GIVEN** incense lit  
**WHEN** step 4  
**THEN** 
- Guide veneration:
  ```
  🙏 BƯỚC 4: CẦM NHANG CAO VÀ LẠY 3 LẠY
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Cầm nhang (hay 3 nén nhang) lên cao 
  ngang hai lông mày hoặc giữa trán.
  
  ✅ Tâm niệm:
  "Con cầm hương này xin dâng 
  lên Đại Từ Đại Bi 
  Quán Thế Âm Bồ Tát..."
  
  Sau đó:
  1️⃣  Lạy lần 1 (cúi 90°, chạm tay 
     xuống mặt đất)
  2️⃣  Lạy lần 2
  3️⃣  Lạy lần 3
  
  Hãy lạy với tâm dĩ nhất, không 
  vội vàng.
  
  💡 Duration: 30-60 giây cho 3 lạy
  
  [Đã Lạy 3 Lạy - Tiếp Tục]
  
  [Tiếp Tục - Bước 5]
  ```

### AC5: Insert All Sticks Simultaneously
**GIVEN** completed 3 bows  
**WHEN** step 5  
**THEN** 
- Enforce simultaneous insertion:
  ```
  🔥 BƯỚC 5: CẮM NHANG VÀO LƯ HƯƠNG
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ⚠️  TUYỆTÙ ĐỐI KHÔNG ĐƯỢC:
  ✗ Cắm từng nén một (tách rời)
  ✗ Cắm một nén, chờ chút, rồi cắm nên tiếp
  
  ✅ PHẢI LÀM:
  ✓ Cầm cả 3 nén nhang lại
  ✓ Cắm đồng thời vào lư hương cùng 
     một lúc trong 1-2 giây
  
  Kỹ thuật:
  1. Cầm 3 nén hương lại gần nhau
  2. Cắm vào lư hương cùng lúc
  3. Kéo tay ra sau khi cắm vào
  
  ⏱️  Timer: 2 giây để cắm cả 3
  
  [Đã Cắm Đồng Thời - Tiếp Tục]
  
  [Tiếp Tục - Bước 6]
  ```

### AC6: Extinguish Oil Lamp Without Blowing
**GIVEN** incense in altar  
**WHEN** step 6 final  
**THEN** 
- Enforce safe extinguishing:
  ```
  🌙 BƯỚC 6 (CUỐI): TẮT ĐÈN DẦU
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ⚠️  TUYỆTÙ ĐỐI CẤMÙ:
  ✗ KHÔNG ĐƯỢC DÙNG MIỆNG THỔI
  ✗ Thổi = cung cấp năng lượng sai
  
  ✅ PHẢI LÀM:
  ✓ Dùng nắp kim loại để đậy
  ✓ Hoặc dụng cụ chuyên dùng để đắp
  ✓ Hoặc nhanh chóng thả một vật 
     lạnh (đá, cát) vào để tắt
  
  Thời điểm:
  - Tắt ĐỀN DẦU TRƯỚC khi nhang 
    cháy hết (≈ nhang cháy 1/3 đến 1/2)
  - KHÔNG để đèn dầu cháy khi không 
    có nhang → dễ thu hút vong linh
  
  ⏱️  Đèn dầu còn cháy: [5-10 phút]
  
  ☐ Tôi đã tắt đèn dầu an toàn
     (không thổi)
  
  [Tiếp Tục - Kết Thúc Nghi Thức]
  ```

### AC7: Turn Off Electric Lamp Last
**GIVEN** oil lamp extinguished  
**WHEN** final cleanup  
**THEN** 
- Complete ritual:
  ```
  ✨ BƯỚC CUỐI: TẮT ĐÈN ĐIỆN
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Chỉ sau khi đèn dầu đã tắt, 
  bạn mới tắt đèn hoa sen điện.
  
  ✅ Trình tự cuối:
  1. Nhang đã cắm vào lư (đang cháy)
  2. Đèn dầu đã tắt (đã đắp lại)
  3. Bây giờ tắt đèn hoa sen điện
  
  💡 Niệm thầm lần cuối:
  "Cảm tạ Bồ Tát đã tiếp nhận 
   hương thơm của con."
  
  ☐ Tôi đã tắt đèn điện
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✨ NGHI THỨC THẮP HƯƠNG HOÀN THÀNH!
  
  Nhang sẽ cháy tiếp khoảng 30-60 phút.
  
  [Hoàn Tất Nghi Thức]
  ```

### AC8: Audit Complete Sequence
**GIVEN** ritual finished  
**WHEN** record session  
**THEN** 
- Log all 6 steps:
  ```typescript
  {
    incenseSessionId: <uuid>,
    userId: <uuid>,
    steps: [
      { step: 1, name: 'ELECTRIC_LAMP_ON', completed: true, time: 6:00 },
      { step: 2, name: 'OIL_LAMP_LIT', completed: true, time: 6:01 },
      { step: 3, name: 'INCENSE_LIGHTED', completed: true, time: 6:02 },
      { step: 4, name: 'HOLD_HIGH_BOW_3X', completed: true, time: 6:03 },
      { step: 5, name: 'INSERT_SIMULTANEOUSLY', completed: true, time: 6:05 },
      { step: 6, name: 'EXTINGUISH_NO_BLOW', completed: true, time: 6:06 },
      { step: 7, name: 'TURN_OFF_ELECTRIC', completed: true, time: 6:07 }
    ],
    sequenceValid: true,
    timestamp: now()
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Trình tự thắp hương chi tiết
- **Q&A Huyền học:** Lý do mỗi bước có quan trọng
- **Hướng dẫn thực hành:** Tránh sai lầm phổ biến

---

## 🏷️ Tags
`#phase-39` `#altar-management` `#incense-sequence` `#fire-safety` `#ritual-protocol`

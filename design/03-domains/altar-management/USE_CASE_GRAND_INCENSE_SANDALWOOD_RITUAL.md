# USE CASE: Grand Incense Sandalwood Ritual
**Module:** `altar-management`, `engagement`  
**Phase:** 39 - Chi Tiết Quy Tắc Thắp Hương & Nghi Thức Thực Hương  
**Source:** Buddhism in Plain Terms, Grand Incense Protocols

---

## 📋 Tóm Tắt Nghiệp VỤ

**"Đại Hương" (Grand Incense) là khói từ gỗ đàn hương - hương thơm của Bồ Tát.**

### ⏰ CHỈ ĐỐT VÀO:
- **Mùng 1, 15 Âm lịch**
- **Ngày kỷ niệm vía Phật/Bồ Tát**

### 🔥 QUY TRÌNH 3 BƯỚC:
1. Châm gỗ đàn hương vào lửa đèn dầu
2. Phẩy tắt lửa (KHÔNG thổi) → khói bay ra
3. **Lặp lại đúng 3 lần**

---

## 🎯 Acceptance Criteria

### AC1: Grand Incense Date Detection (LUNAR NEW YEAR ONLY)
**GIVEN** today is lunar 1st only (Mùng 1 Tết)  
**WHEN** check incense options  
**THEN** 
- Unlock grand incense ritual:
  ```
  🔥 ĐẠI HƯƠNG NGỌ THỨC (Grand Incense - Mùng 1 Tết ONLY)
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ✨ HÔM NAY LÀ MÙNG 1 TẾT ÂM LỊCH!
  
  ⭐ NGÀY THIÊNG LIÊNG CẬP KỴ!
  
  Đây là một trong những ngày tháng 
  quý giá nhất trong năm để thực hiện 
  Đại Hương.
  
  🔥 ĐẠI HƯƠNG NGỌ THỨC
  (Gỗ Đàn Hương - Sandalwood Ritual)
  
  Đây là hương thơm tuyệt vời 
  của Bồ Tát, chỉ đốt vào Mùng 1 Tết.
  Công đức gấp trăm lần!
  
  [Bắt Đầu Đại Hương Nghi Thức]
  [Tiếp Tục Thắp Hương Bình Thường]
  ```

### AC2: Non-Lunar-New-Year Block
**GIVEN** not lunar 1st (Mùng 1 Tết)  
**WHEN** user try grand incense  
**THEN** 
- Block access:
  ```
  ⛔ TUYỆTÙ ĐỐI KHÔNG ĐƯỢC
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ⚠️  CẬP KỴ:
  
  Đại Hương là nghi thức TUYỆTÙ ĐỐI
  dành riêng cho MÙNG 1 TẾT ÂM LỊCH.
  
  ❌ KHÔNG được đốt vào:
  - Mùng 15 Âm lịch
  - Các ngày lễ khác
  - Các ngày thường
  
  Hôm nay: [Ngày X Tháng Y (Ngày thường)]
  
  ❌ Không phải Mùng 1 Tết
  
  Lần tới Đại Hương: 
  [Mùng 1 Tết - X ngày nữa]
  
  [Về Lại]
  ```

### AC3: Step 1 - Light Sandalwood
**GIVEN** user ready for ritual  
**WHEN** guide process  
**THEN** 
- Show step 1:
  ```
  🔥 BƯỚC 1: CHÂMÙ GỖ ĐÀN HƯƠNG
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Giả định bạn đã:
  1. ✓ Bật đèn hoa sen
  2. ✓ Thắp đèn dầu
  3. ✓ Thắp nhang bình thường (3 nén)
  4. ✓ Lạy 3 lạy
  
  Giờ thực hiện Đại Hương:
  
  Lấy một thanh gỗ đàn hương.
  Hạ đầu gỗ xuống sát ngọn lửa 
  của đèn dầu cho bắt lửa.
  
  ✓ Lửa phải bắt lên trên thanh gỗ
  ✓ Có khí cháy phát triển
  ✓ Gỗ phải sáng rõ
  
  [Lửa Bắt Lên Thành Công]
  
  [Tiếp Tục - Bước 2]
  ```

### AC4: Step 2 - Fan Out Fire (No Blowing)
**GIVEN** sandalwood lit  
**WHEN** step 2  
**THEN** 
- Guide fanning technique:
  ```
  💨 BƯỚC 2: PHẨY TẮT (3 LẦN)
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ⚠️  TUYỆTÙ ĐỐI CẤM:
  ✗ KHÔNG ĐƯỢC DÙNG MIỆNG THỔI
  ✗ Phải dùng tay phẩy quạt
  
  Kỹ thuật PHẨY TẮT:
  
  1️⃣  Cầm thanh gỗ đang cháy
  2️⃣  Nhanh chóng vẫy tay từ trước 
      ra sau để quạt tắt lửa
  3️⃣  Khi lửa tắt → Khói vàng óng 
      bay ra (đó là "Đại Hương")
  4️⃣  Cảm nhận khí thơm từ gỗ đàn
  
  ⏱️  Timer cho 3 lần phẩy:
  
  Lần 1/3: [Phẩy tắt ✓]
  Lần 2/3: [Phẩy tắt ✓]
  Lần 3/3: [Phẩy tắt ✓]
  
  [Hoàn Thành 3 Lần Phẩy]
  
  [Tiếp Tục - Bước 3]
  ```

### AC5: Sandalwood Reuse Option
**GIVEN** 3 fans complete  
**WHEN** check remaining wood  
**THEN** 
- Offer reuse or disposal:
  ```
  ♻️  GỖ ĐÀN HƯƠNG CÒN DỰ
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Thanh gỗ đàn hương chưa cháy hết.
  
  Lựa chọn:
  
  ○ CÁCH 1: Lưu để sử dụng tiếp
  "Tôi sẽ để gỗ vào lư hương để 
  sử dụng lần sau"
  
  → Cắm dựng thẳng vào lư hương 
    để bảo quản
  → Lần sau bắt lửa từ đèn dầu 
    và lặp lại
  
  ○ CÁCH 2: Để cho cháy hết
  "Để thanh gỗ cháy tiếp vào lư 
  hương"
  
  → Cắm vào lư → Để cho cháy tự nhiên
  → Khói vẫn tiếp tục nâng lên
  
  [Chọn Cách 1 - Lưu Trữ]
  [Chọn Cách 2 - Để Cháy]
  ```

### AC6: Audit Grand Incense Session
**GIVEN** ritual complete  
**WHEN** record  
**THEN** 
- Log event:
  ```typescript
  {
    grandIncenseSessionId: <uuid>,
    userId: <uuid>,
    date: <date>,
    dayType: 'LUNAR_1ST' | 'LUNAR_15' | 'FESTIVAL',
    fanSequence: [
      { fan: 1, status: 'COMPLETED', duration: 15 },
      { fan: 2, status: 'COMPLETED', duration: 15 },
      { fan: 3, status: 'COMPLETED', duration: 15 }
    ],
    woodPreserved: true, // or false
    timestamp: now()
  }
  ```

### AC7: Merit Recognition
**GIVEN** 3 fans complete  
**WHEN** show completion  
**THEN** 
- Celebrate:
  ```
  ✨ ĐẠI HƯƠNG THÀNH CÔNG!
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  🎉 Bạn vừa hoàn thành nghi thức 
     Đại Hương!
  
  📊 Kết quả:
  ✓ 3 lần phẩy gỗ đàn hương
  ✓ Khí thánh bay lên tới chư Phật
  ✓ Công đức gấp trăm lần!
  
  🌟 Cảm tạ Bồ Tát!
  
  Bạn có thể tiếp tục niệm Kinh 
  hay kết thúc nghi thức.
  
  [Tiếp Tục Niệm Kinh]
  [Kết Thúc Nghi Thức]
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Đại Hương nghi thức
- **Q&A Huyền học:** Ý nghĩa gỗ đàn hương
- **Hướng dẫn thực hành:** Kỹ thuật phẩy tắt chính xác

---

## 🏷️ Tags
`#phase-39` `#altar-management` `#grand-incense` `#sandalwood-ritual` `#merit-multiplier`

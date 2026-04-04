# USE CASE: Lunar Auspicious Days Engine
**Module:** `calendar`, `altar-management`  
**Phase:** 38 - Toàn Bộ Lịch Trình Pháp Môn Tâm Linh & Bộ Định Tuyến Thời Gian Đa Chiều  
**Source:** Buddhism in Plain Terms, Lunar Calendar Protocols

---

## 📋 Tóm Tắt Nghiệp VỤ

**Vào ngày mùng 1 & 15 Âm lịch hàng tháng, năng lượng từ bi đạt đỉnh.**

Cũng như các ngày Vía Phật, Bồ Tát (Đản sanh, Thành đạo, Xuất gia).

### ✅ NHỮNG ĐIỀU BẮT BUỘC VÀO NGÀY LỄ:
1. **Ăn Chay**
2. **Phóng Sinh** (công đức gấp vạn lần)
3. **Thắp Nhang 3 Nén** (bắt buộc)
4. **Kích hoạt Đại Hương Nghi Thức**

---

## 🎯 Acceptance Criteria

### AC1: Lunar Calendar Detection
**GIVEN** initialize calendar module  
**WHEN** sync lunar dates  
**THEN** 
- Mark auspicious days:
  ```typescript
  async function getLunarAuspiciousDays(year: number) {
    return [
      { lunar: '初一', solar: <date>, type: 'MONTHLY_FIRST' },
      { lunar: '十五', solar: <date>, type: 'MONTHLY_FIFTEENTH' },
      { lunar: '二月十九', solar: <date>, 
        type: 'GUANYIN_BIRTHDAY' },
      { lunar: '六月十九', solar: <date>, 
        type: 'GUANYIN_ENLIGHTENMENT' },
      { lunar: '九月十九', solar: <date>, 
        type: 'GUANYIN_MONASTIC_ORDINATION' },
      // ... other festival dates
    ];
  }
  ```

### AC2: Auto-Vegetarian Promotion
**GIVEN** user open app on lunar 1st or 15th  
**WHEN** day detected  
**THEN** 
- Suggest vegetarian vow:
  ```
  🌸 NGÀY MÙNG 1 ÂM LỊCH
  
  ✨ Ngày VÀNG cho từ thiện & hành 
     bồ tát hạnh!
  
  💚 Hôm nay là ngày tốt nhất 
     để ĂN CHAY.
  
  ┌──────────────────────────────┐
  │ Bạn muốn phát nguyện ăn chay │
  │ hôm nay không?               │
  │                              │
  │ [Ăn Chay Hôm Nay]  [Sau Này] │
  └──────────────────────────────┘
  ```

### AC3: Life-Release Campaign Activation
**GIVEN** lunar 1st or 15th + festival detected  
**WHEN** push notification  
**THEN** 
- Highlight life-release:
  ```
  🐠 NGÀY TỐT NHẤT PHÓNG SINH!
  
  Hôm nay là ngày Mùng 1 Âm lịch.
  
  ✨ Công đức phóng sinh hôm nay 
     gấp VẠN LẦN so với ngày thường.
  
  🐦 Hãy phóng sinh chim, cá, hay 
     tôm ngay hôm nay!
  
  Bạn có rừng phóng sinh nào 
  không hoàn thành?
  
  [Xem Danh Sách Phóng Sinh]
  ```

### AC4: Triple Incense Requirement
**GIVEN** user try to light incense  
**WHEN** on lunar 1st/15th  
**THEN** 
- Enforce 3 sticks:
  ```
  🌸 NGÀY MÙNG 1 ÂM LỊCH
  
  Hôm nay là ngày may mắn.
  
  ⚠️  BẮTÙ BUỘC: Phải thắp ĐÚNG 3 
     nén nhang (không phải 1 hay 5).
  
  ☐ Nén thứ 1: Dâng Phật
  ☐ Nén thứ 2: Dâng Bồ Tát
  ☐ Nén thứ 3: Dâng Bộ pháp tôn
  
  Hệ thống sẽ theo dõi số nén.
  
  [Bắt Đầu - Thắp 3 Nén]
  ```

### AC5: Triple Incense Counter
**GIVEN** user light incense  
**WHEN** track count  
**THEN** 
- Record and validate:
  ```typescript
  {
    incenseSessionId: <uuid>,
    date: lunarDate, // mùng 1 or 15
    sticksLit: 0,
    targetSticks: 3,
    history: [
      { time: '06:15', sticksAdded: 1, status: 'OK' },
      { time: '06:18', sticksAdded: 1, status: 'OK' },
      { time: '06:21', sticksAdded: 1, status: 'COMPLETE' }
    ]
  }
  ```

### AC6: Grand Incense Ritual Unlock
**GIVEN** lunar 1st/15th  
**WHEN** user look for offerings  
**THEN** 
- Activate special ritual:
  ```
  🔥 ĐẠI HƯƠNG NGỌ THỨC
  
  ✨ Ngày Mùng 1 / 15 - Năng lượng 
     từ bi đạt ĐỈNH CAO!
  
  🌟 Hôm nay bạn có thể thực hiện:
  
  Đại Hương Nghi Thức:
  1. Lấy gỗ đàn hương mồi từ đèn dầu
  2. Dập tắt lửa (KHÔNG thổi)
  3. Để khói tự nhiên bay ra
  4. Lặp lại đúng 3 lần
  
  📿 Lợi ích: Gấp trăm lần công đức!
  
  [Bắt Đầu Đại Hương Nghi Thức]
  ```

### AC7: Grand Incense Verification
**GIVEN** user start ritual  
**WHEN** perform steps  
**THEN** 
- Guide and verify:
  ```
  🔥 HƯỚNG DẪN TỪNG BƯỚC
  
  Bước 1: Lấy gỗ đàn hương
  ☐ Lấy gỗ khô từ đèn dầu Phật
  ☐ Gỗ phải cháy đỏ
  
  Bước 2: Dập tắt (Không thổi!)
  ☐ Dập vào chậu cát
  ☐ Tuyệt đối không thổi
  
  Bước 3: Quan tưởng khói
  ☐ Xem khói tự nhiên bay lên
  ☐ Niệm Phật quy y Bồ Tát Quán Âm
  
  Lặp lại bước 1-3: [1/3]  [2/3]  [3/3]
  
  [Hoàn Tất Ritual]
  ```

### AC8: Seasonal Festival Alerts
**GIVEN** approach major festival  
**WHEN** send reminder  
**THEN** 
- Notify user 1 week before:
  ```
  📅 NHẮC NHỚ LỄ HỘI
  
  Tuần tới là:
  🌸 Lễ Phật Đản (Vesak)
  Ngày [Ngày Âm]: [Ngày Dương]
  
  Chuẩn bị:
  ✓ Ăn chay toàn ngày
  ✓ Dâng trái cây tươi
  ✓ Thắp nhang 3 nén
  ✓ Phóng sinh (tùy chọn)
  ✓ Niệm Kinh số lượng lớn
  
  [Xem Chi Tiết]
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Lịch ngũ lễ
- **Q&A Huyền học:** Năng lượng Âm Dương vào ngày lễ
- **Hướng dẫn thực hành:** Cách thực hiện Đại Hương

---

## 🏷️ Tags
`#phase-38` `#lunar-calendar` `#auspicious-days` `#festival-tracker` `#merit-multiplier`

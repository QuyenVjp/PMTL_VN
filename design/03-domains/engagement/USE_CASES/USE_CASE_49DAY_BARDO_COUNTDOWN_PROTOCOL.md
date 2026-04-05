# USE CASE: 49-Day Bardo Countdown Protocol
**Module:** `engagement`, `life-liberation`  
**Phase:** 38 - Toàn Bộ Lịch Trình Pháp Môn Tâm Linh & Bộ Định Tuyến Thời Gian Đa Chiều  
**Source:** Buddhism in Plain Terms, Bardo & Death Transition Protocols

---

## 📋 Tóm Tắt Nghiệp VỤ

**Trong vòng 49 ngày sau khi người thân qua đời, phải dốc toàn lực siêu độ.**

### ⏳ 49-DAY BARDO PHASE:
- **Giai đoạn 1-7 (Ngày 1-7):** Ý thức vẫn còn, niệm Kinh có tác dụng lớn nhất
- **Giai đoạn 2-7 (Ngày 8-14):** Linh hồn bắt đầu gặp những hiện tượng
- **Tiếp tục đến ngày 49:** Linh hồn chờ tái sinh

### ✅ PHẢI LÀM:
1. **Niệm ≥ 49 tấm NNN**
2. **Phóng sinh**
3. Phía gia đình phải giữ chuyên tâm

---

## 🎯 Acceptance Criteria

### AC1: Death Record Creation
**GIVEN** user record someone's passing  
**WHEN** create memorial entry  
**THEN** 
- Initialize 49-day tracker:
  ```typescript
  {
    bardo49Id: <uuid>,
    deceasedName: 'string',
    dateOfPassing: <date>,
    relationshipToUser: 'PARENT' | 'SIBLING' | 'CHILD' | 'FRIEND',
    bardoEndDate: dateOfPassing + 49_days,
    countdownActive: true,
    status: 'IN_PROGRESS'
  }
  ```

### AC2: Countdown Timer on App
**GIVEN** bardo49 active  
**WHEN** user open app  
**THEN** 
- Display prominently:
  ```
  ⏰ BARDO 49 NGÀY - SIÊU ĐỘ [TÊN]
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Người mất: [Tên]
  Ngày mất: [Ngày/Tháng/Năm]
  
  ⏳ Bardo 49 ngày:
  Ngày 15 / 49 (31%)
  
  ████████░░░░░░░░░░░░░░░░░░
  
  ⏱️  Còn: 34 ngày
  Deadline: [Ngày X Tháng Y]
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC3: Daily Bardo Checklist
**GIVEN** countdown active  
**WHEN** user open app each day  
**THEN** 
- Show daily required tasks:
  ```
  📿 HÔM NAY - SIÊU ĐỘ NGÀY 15
  
  Các công tác bắt buộc hôm nay:
  
  1. Niệm NNN cho [Tên]
     Mục tiêu: 7 tấm (Bắt buộc)
     ☐ Chưa làm
  
  2. Niệm Chú Đại Bi
     Mục tiêu: 49 biến
     ☐ Chưa làm
  
  3. Phóng Sinh (Nếu có thể)
     Mục tiêu: ≥ 20 con
     ☐ Chưa làm
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  📊 Tiến độ 15 ngày qua:
  
  NNN: ████████░░░░░░░ 56/105
  Phóng Sinh: ██████░░░░░░░░░░░ 120/280
  
  [Bắt Đầu Niệm]
  ```

### AC4: 49-Day NNN Auto-Generation
**GIVEN** bardo49 record created  
**WHEN** system process  
**THEN** 
- Create mandatory NNN batch:
  ```typescript
  {
    batchId: <uuid>,
    purpose: 'BARDO_49_DAY_ASCENSION',
    linkedToDeceasedId: <deceased>,
    totalNnnTarget: 49, // minimum
    offerToTemplate: 'Bồ Tát phù hộ cho 
                      [Deceased Name] 
                      siêu thoát trong 49 ngày',
    dailyTarget: Math.ceil(49 / 49), // 1 per day
    autoSchedule: true,
    startDate: dateOfPassing,
    endDate: dateOfPassing + 49_days,
    urgency: 'CRITICAL'
  }
  ```

### AC5: Phase-by-Phase Guidance
**GIVEN** track 49-day progress  
**WHEN** reach 7-day milestones  
**THEN** 
- Provide spiritual guidance:
  ```
  📿 GIAI ĐOẠN 1: NGÀY 1-7
  
  ⏰ Ngày 7/49 - Kết thúc giai đoạn đầu
  
  Trong 7 ngày đầu, ý thức của [Tên] 
  vẫn còn rất căng thẳng và sợ hãi. 
  Niệm Kinh có tác dụng NHẤT vào lúc này.
  
  💪 Bạn đã niệm:
  ✓ NNN: 7/7 tấm ✅
  ✓ Phóng Sinh: 30 con ✅
  ✓ Chú Đại Bi: 343 biến ✅
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  📿 GIAI ĐOẠN 2: NGÀY 8-14 (SẮP BẮT ĐẦU)
  
  Linh hồn sẽ bắt đầu gặp các hiện 
  tượng, có thể thấy các Phật Bồ Tát 
  hoặc các cảnh tương.
  
  Tiếp tục niệm để hướng dẫn linh hồn
  đi đến Tây Phương!
  ```

### AC6: Life-Release Emphasis
**GIVEN** bardo49 progress  
**WHEN** check life-release quota  
**THEN** 
- Encourage releases:
  ```
  🐠 PHÓNG SINH - VÔ CÙNG QUAN TRỌNG
  
  Trong 49 ngày, PHÓNG SINH là công 
  đức LỚNHẤT để siêu độ linh hồn!
  
  📊 Mục tiêu: Phóng sinh [49+ lần]
  Hiện tại: [20/49] (41%)
  
  Còn phải phóng: [29 lần]
  
  💡 Kế hoạch:
  - Mỗi ngày phóng 1 lần
  - Cuối tuần phóng thêm 1-2 lần
  
  🐠 Địa điểm phóng sinh gần bạn:
  [Danh Sách]
  
  [Tìm Cơ Hội Phóng Sinh Hôm Nay]
  ```

### AC7: 49-Day Completion Ceremony
**GIVEN** reach day 49  
**WHEN** bardo period complete  
**THEN** 
- Show celebration:
  ```
  ✨ HOÀN THÀNH BARDO 49 NGÀY!
  
  🎉 Bạn đã hoàn thành toàn bộ 
     49 ngày siêu độ cho [Tên]!
  
  📊 Thành tích:
  ✓ NNN: 49/49 tấm ✅
  ✓ Phóng Sinh: 105 lần ✅
  ✓ Chú Đại Bi: 2,401 biến ✅
  
  💪 Công đức lớn lao của bạn 
     sẽ giúp [Tên] tái sinh vào 
     nơi tốt lành!
  
  🌟 Xin Bồ Tát phù hộ cho linh hồn 
     [Tên] đi đến Tây Phương Cực Lạc!
  
  🙏 Cảm tạ bạn vì yêu thương 
     người thân!
  
  [Tiếp Tục Hành Trình Tu]
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Bardo 49 ngày
- **Q&A Huyền học:** Những giai đoạn tinh thần sau khi qua đời
- **Hướng dẫn thực hành:** Cách siêu độ trong 49 ngày

---

## 🏷️ Tags
`#phase-38` `#bardo-49-day` `#death-transition` `#ascension-protocol` `#memorial-service`

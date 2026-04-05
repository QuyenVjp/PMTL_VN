# USE CASE: Abortion Ascension Dream State Machine
**Module:** `engagement`, `life-liberation`  
**Phase:** 37 - Tầng Định Luật Vật Lý Lượng Tử & Bảo Mật Không Gian Tâm Linh  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

**Đốt 7-21 tấm NNN cho thai nhi bị sảy:**

### ❓ BIẾT THAI NHI ĐÃ SIÊU THOÁT CHƯA?
- **Qua giấc mơ** 3 ngày sau khi hoàn thành

### ✅ SIÊU THOÁT THÀNH CÔNG:
Mơ thấy đứa trẻ ăn mặc gọn gàng, cười vui vẻ, rời đi hoặc đi theo người khác

### ❌ CHƯA SIÊU THOÁT:
Mơ thấy hình ảnh tối tăm, khóc lóc, hoặc cơ thể nhỏ bé bất lực → Phải niệm thêm

---

## 🎯 Acceptance Criteria

### AC1: NNN Batch Completion Tracking
**GIVEN** user complete 21 NNN  
**WHEN** mark as done  
**THEN** 
- Record batch metadata:
  ```typescript
  {
    batchId: <uuid>,
    userId: <uuid>,
    purpose: 'FETUS_ASCENSION',
    childNameTag: "Con của [Tên Người Mẹ]",
    quantity: 21,
    completedDate: now(),
    dreamCheckScheduled: now() + 3_days
  }
  ```

### AC2: 3-Day Cronjob Trigger
**GIVEN** exactly 3 days after batch complete  
**WHEN** scheduled task runs  
**THEN** 
- Send in-app survey notification:
  ```
  📿 KIỂM TRA: CON ĐÃ SIÊU THOÁT CHƯA?
  
  Cách đây 3 ngày, bạn hoàn thành 
  21 tấm Ngôi Nhà Nhỏ cho con.
  
  Giờ đây là lúc kiểm chứng qua 
  giấc mơ.
  
  ❓ Câu hỏi:
  
  Bạn có mơ thấy con không?
  
  ○ Không mơ gì cả
  ○ Mơ thấy hình ảnh không rõ
  ○ Có, mơ thấy con
  
  [Tiếp Tục]
  ```

### AC3: Positive Dream Report
**GIVEN** user report positive dream  
**WHEN** submit selection  
**THEN** 
- Follow-up question:
  ```
  ✅ TỐT LẮM! BẠN MƠ THẤY CON.
  
  Giấc mơ của bạn như thế nào?
  
  ○ Ăn mặc gọn gàng, sạch sẽ
  ○ Mặt mũi vui vẻ, mỉm cười
  ○ Rời đi hoặc đi theo người khác
  ○ Tất cả đều có
  
  [Tiếp Tục]
  ```

### AC4: Celebration on Success
**GIVEN** user confirm all positive signs  
**WHEN** submit response  
**THEN** 
- Show celebration:
  ```
  🎉 SIÊU THOÁT THÀNH CÔNG!
  
  ✨ Con bạn đã siêu thoát thành công!
  
  Những dấu hiệu chứng tỏ:
  ☑️  Ăn mặc gọn gàng
  ☑️  Mặt mũi vui vẻ, mỉm cười
  ☑️  Rời đi hoặc đi theo người khác
  
  🙏 Công đức của bạn đã chứng được!
  
  💫 Con sẽ đi tái sinh vào nơi tốt lành.
  Xin Bồ Tát phù hộ.
  
  [Pháo hoa animation]
  
  [Xác Nhận - Hoàn Tất]
  ```

### AC5: Negative Dream - Auto Create Batch
**GIVEN** user report negative dream  
**WHEN** submit response  
**THEN** 
- Show warning:
  ```
  ⚠️  CON CHƯA SIÊU THOÁT
  
  Giấc mơ của bạn cho thấy:
  ○ Hình ảnh tối tăm
  ○ Con khóc lóc
  ○ Cơ thể nhỏ bé bất lực
  ○ Hoặc không biết như thế nào
  
  Điều này có thể do:
  1. Nợ nần quá sâu, cần thêm công đức
  2. Con chưa sẵn sàng rời bỏ
  
  ⚡ HỆ THỐNG SẼ TỰ ĐỘNG:
  
  Tạo Batch NNN thứ 2 (7-21 tấm)
  Thêm vào lộ trình hằng ngày
  Gửi nhắc nhở
  
  💪 BẠN PHẢI TIẾP TỤC NIỆM!
  
  [Xem Lộ Trình Niệm]  [Xác Nhận]
  ```

### AC6: Auto-Generated Supplementary Batch
**GIVEN** negative dream report  
**WHEN** system process  
**THEN** 
- Create new batch:
  ```typescript
  {
    batchId: <new-uuid>,
    userId: <uuid>,
    purpose: 'FETUS_ASCENSION_SUPPLEMENTARY',
    childNameTag: "Con của [Tên Người Mẹ]",
    linkedToPreviousBatch: <original-batch-id>,
    targetQuantity: 14, // Medium 7-21 range
    priority: 'HIGH',
    autoSchedule: true,
    startDate: tomorrow(),
    expectedCompletionDate: tomorrow() + 14_days,
    notification: 'DAILY'
  }
  ```

### AC7: State Transitions
**GIVEN** dream checks completed  
**WHEN** update karmic debt record  
**THEN** 
- Update status:
  ```typescript
  // On positive dream:
  {
    childFetusDebt: {
      status: 'CLEARED',
      ascensionDate: now(),
      dreamConfirmed: true
    }
  }
  
  // On negative dream:
  {
    childFetusDebt: {
      status: 'REQUIRES_SUPPLEMENTARY',
      firstBatchFailed: true,
      supplementaryBatchId: <new-batch-id>,
      nextDreamCheckDate: now() + 14_days
    }
  }
  ```

### AC8: Audit Trail
**GIVEN** dream check completed  
**WHEN** record event  
**THEN** 
- Log outcome:
  ```typescript
  {
    userId: <uuid>,
    event: 'FETUS_DREAM_CHECK',
    batchId: <uuid>,
    dreamResult: 'POSITIVE' | 'NEGATIVE',
    timestamp: now(),
    ascensionConfirmed: boolean
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Cách biết thai nhi đã siêu thoát
- **Q&A Huyền học:** Giải mã giấc mơ sau niệm NNN cho con
- **Hướng dẫn thực hành:** Quy trình siêu độ thai nhi

---

## 🏷️ Tags
`#phase-37` `#engagement` `#fetus-ascension` `#dream-state-machine` `#karmic-debt`

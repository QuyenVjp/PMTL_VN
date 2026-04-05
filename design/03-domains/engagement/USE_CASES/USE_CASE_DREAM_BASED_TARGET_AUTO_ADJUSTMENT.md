# USE CASE: Dream-Based Target Auto-Adjustment
**Module:** `engagement`, `little-house`  
**Phase:** 33 - Kiểm Soát Nhân Quả Chuyên Sâu & Ràng Buộc Pháp Bảo Vật Lý  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

Sau khi đốt **đủ số lượng Ngôi Nhà Nhỏ** cho một đứa trẻ bị **sảy thai**, kết quả được phát hiện qua **giấc mơ**:

### ✅ GIẤC MƠ TỐT:
Thấy đứa trẻ **ăn mặc đẹp đẽ, rời đi vui vẻ** → Đã siêu độ thành công ✅

### ⚠️ GIẤC MƠ XẤU:
Thấy đứa trẻ **trong tình trạng tồi tệ** (hình ảnh không tốt, khóc lóc,...) → **BẮT BUỘC niệm thêm** 7-21 tấm Ngôi Nhà Nhỏ

---

## 🎯 Acceptance Criteria

### AC1: Automatic Dream Survey After 3 Days
**GIVEN** user hoàn thành batch Ngôi Nhà Nhỏ cho thai nhi  
**WHEN** 3 ngày sau (trigger cronjob)  
**THEN** 
- Gửi In-App Survey:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  😴 KIỂM TRA KẾT QUẢ SIÊU ĐỘ
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Bạn đã hoàn thành niệm Ngôi Nhà Nhỏ 
  cho [Tên thai nhi/người] vào 3 ngày trước.
  
  Giấc mơ là dấu hiệu của kết quả siêu độ.
  
  📋 Câu hỏi: 
  Bạn có mơ thấy thai nhi ăn mặc đẹp đẽ, 
  vui vẻ rời đi không?
  
  ○ Có, mơ thấy hình ảnh tốt ✅
  ○ Không, chưa mơ
  ○ Mơ thấy hình ảnh không tốt ❌
  ○ Không chắc
  
  [Bỏ Qua]  [Gửi]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC2: Handle Good Dream Response
**GIVEN** user chọn "Có, mơ thấy hình ảnh tốt"  
**WHEN** gửi  
**THEN** 
- Notification:
  ```
  ✅ SIÊU ĐỘ THÀNH CÔNG!
  
  Hình ảnh tốt trong giấc mơ là dấu hiệu 
  thai nhi đã được siêu độ thành công.
  
  Công đức của bạn đã trọn vẹn 🙏
  ```

### AC3: Handle Bad Dream Response
**GIVEN** user chọn "Mơ thấy hình ảnh không tốt"  
**WHEN** gửi  
**THEN** 
- System tự động tạo new task:
  ```
  🚨 PHÁT HIỆN NỢ MỚI
  
  Hình ảnh không tốt trong giấc mơ cho biết 
  thai nhi chưa được hoàn toàn siêu độ.
  
  Hệ thống đã TỰ ĐỘNG tạo khoản nợ mới:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  📋 KHOẢN NỢ MỚI:
  
  Người cần kinh: [Tên thai nhi]
  Loại: Ngôi Nhà Nhỏ (Bổ sung)
  Số lượng: 7-21 tấm (tuỳ theo tình huống)
  Mục đích: Hoàn thiện siêu độ
  
  [Xem Chi Tiết]  [Bắt Đầu Niệm]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC4: Database New Debt Record
**GIVEN** bad dream detected  
**WHEN** system process  
**THEN** 
- Create `KarmaDebt`:
  ```typescript
  {
    targetId: <original_target>,
    debtType: 'LITTLE_HOUSE_SUPPLEMENT',
    quantity: 14, // Average mid-range
    reason: 'DREAM_BASED_AUTO_ADJUSTMENT',
    linkedTo: <original_batch_id>,
    createdAt: now(),
    createdBy: 'SYSTEM',
    dreamIndicatorDescription: <user_input>
  }
  ```

### AC5: Dream History Tracking
**GIVEN** user respond to survey  
**WHEN** save  
**THEN** 
- Ghi vào `DreamEntry`:
  ```typescript
  {
    littleHouseId: <uuid>,
    dreamDate: <date_of_dream>,
    dreamQuality: 'GOOD' | 'BAD' | 'UNCLEAR',
    dreamDescription: <user_description>,
    aiAnalysis: <auto_generated>,
    adjustmentTriggered: <boolean>,
    followUpRequired: <boolean>
  }
  ```

### AC6: Manual Override For No Dream Response
**GIVEN** user chọn "Không chắc"  
**WHEN** họ muốn tự báo cáo kết quả  
**THEN** 
- Cung cấp option:
  ```
  📝 TỰ BÁO CÁO KẾT QUẢ
  
  Nếu bạn muốn tự báo cáo hoặc có 
  kết quả khác, vui lòng mô tả:
  
  [Mô tả giấc mơ/kết quả:________]
  
  Dựa vào mô tả, hệ thống sẽ:
  • Phân tích bằng AI
  • Quyết định có cần bổ sung hay không
  ```

---

## 🔧 Technical Notes

### Cronjob Service
```typescript
// Location: apps/api/src/engagement/services/dream-survey.service.ts

@Cron('0 9 * * *') // 9 AM daily
async sendDreamSurveys() {
  const completedBatches = await this.prisma.littleHouse.findMany({
    where: {
      status: 'COMPLETED',
      completedAt: {
        equals: subDays(new Date(), 3)
      },
      targetType: 'FETUS'
    }
  });
  
  for (const batch of completedBatches) {
    await this.notificationService.sendDreamSurvey(batch);
  }
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Giấc mơ như dấu hiệu
- **Q&A Huyền học:** Cách phát hiện siêu độ thành công
- **Hướng dẫn thực hành:** Xử lý giấc mơ tồi tệ

---

## 🏷️ Tags
`#phase-33` `#engagement` `#dream-based-adjustment` `#karma-debt` `#auto-scaling`

# USE CASE: Vegetarian Vow Dynamic Migration
**Module:** `calendar`  
**Phase:** 25 - Micro-Normalization & Specific Karma Measurement  
**Source:** Buddhism in Plain Terms, Hướng dẫn Ngôi Nhà Nhỏ, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp Vụ

User đã phát nguyện ăn chay **mùng 1, 15 âm lịch**, nhưng gặp sự cố bất khả kháng:
- Nhập viện
- Đi công tác
- Sự kiện gia đình bắt buộc

**TUYỆT ĐỐI KHÔNG ĐƯỢC** im lặng phá giới (silent violation).

### Quy Trình Cấp Cứu Thất Nguyện:
1. ✅ Khấn Bồ Tát xin dời ngày ăn chay sang ngày khác trong tháng
2. ✅ HOẶC xin đổi nguyện thành **"Ăn chay 2 ngày linh hoạt trong tháng"** (thay vì cứng ngắc mùng 1, 15)

**Nguyên tắc:** Thay đổi cam kết với Bồ Tát tốt hơn **VÔ SỐ LẦN** so với phá giới im lặng.

---

## 🎯 Acceptance Criteria

### AC1: Detect Missed Vow Day
**GIVEN** user có vow `VEGETARIAN_1ST_15TH_LUNAR`  
**AND** hôm nay là mùng 1 hoặc 15 âm lịch  
**WHEN** đến 23:59 mà user KHÔNG check-in `VegetarianDay`  
**THEN** 
- **KHÔNG** đánh dấu ngay là `FAILED`
- Thay vào đó, kích hoạt luồng `[Cấp Cứu Thất Nguyện]`

### AC2: Emergency Rescue Flow Trigger
**GIVEN** vow day bị miss  
**WHEN** ngày kế tiếp (mùng 2 hoặc 16)  
**THEN** 
- Gửi notification:
  ```
  ⚠️  BẠN ĐÃ BỎ LỠ NGÀY ĂN CHAY
  
  Hôm qua (mùng 1/15) bạn đã không check-in ăn chay.
  
  ĐỪNG IM LẶNG! Bạn có 2 lựa chọn:
  
  1️⃣ Xin dời ngày ăn chay sang ngày khác trong tháng
  2️⃣ Chuyển đổi nguyện sang "2 Ngày Linh Hoạt/Tháng"
  
  [Xem Chi Tiết]
  ```

### AC3: Postponement Prayer Template
**GIVEN** user chọn option 1 (dời ngày)  
**WHEN** họ bấm `[Xin Dời Ngày]`  
**THEN** 
- Hiển thị prayer template trên màn hình:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🙏 LỜI KHẤN XIN DỜI NGÀY ĂN CHAY
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  "Con kính xin Đại Từ Đại Bi Quán Thế Âm Bồ Tát 
  từ bi gia hộ.
  
  Con đã phát nguyện ăn chay mùng 1, 15 âm lịch 
  hằng tháng. Nhưng hôm [Ngày bỏ lỡ] vì lý do 
  [Lý do bất khả kháng], con không thể giữ được giới.
  
  Con kính xin Bồ Tát cho phép con dời ngày ăn chay 
  sang ngày [Ngày dời đến] trong tháng này.
  
  Con xin hứa sẽ giữ giới nghiêm túc vào ngày đã hẹn."
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  📋 Điền thông tin:
  Lý do: [___________________]
  Ngày dời đến: [Chọn ngày trong tháng này]
  
  ☐ Tôi đã đọc to lời khấn này
  
  [Hủy]  [Xác Nhận Dời Ngày]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC4: Flexible Vow Conversion
**GIVEN** user chọn option 2 (chuyển đổi nguyện)  
**WHEN** họ bấm `[Chuyển Đổi Nguyện]`  
**THEN** 
- Hiển thị confirmation:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔄 CHUYỂN ĐỔI NGUYỆN ĂN CHAY
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Bạn sẽ chuyển từ:
  ❌ Ăn chay CỐ ĐỊNH mùng 1, 15 âm lịch
  
  Sang:
  ✅ Ăn chay LINH HOẠT 2 ngày/tháng 
     (tự chọn ngày phù hợp)
  
  Điều này vẫn giữ được cam kết với Bồ Tát, 
  chỉ linh hoạt hơn với lịch trình của bạn.
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  🙏 Lời khấn chuyển đổi:
  
  "Con kính xin Đại Từ Đại Bi Quán Thế Âm Bồ Tát 
  từ bi gia hộ.
  
  Con đã phát nguyện ăn chay mùng 1, 15 âm lịch. 
  Nhưng do hoàn cảnh thực tế, con xin Bồ Tát 
  cho phép con chuyển đổi thành:
  
  'Ăn chay 2 ngày linh hoạt trong mỗi tháng'
  
  Con xin cam kết sẽ giữ giới nghiêm túc."
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ☐ Tôi đã đọc to lời khấn này
  
  [Hủy]  [Xác Nhận Chuyển Đổi]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC5: Update Vow In Database
**GIVEN** user xác nhận chuyển đổi  
**WHEN** hệ thống xử lý  
**THEN** 
- Update vow record:
  ```typescript
  await prisma.vow.update({
    where: { id: vowId },
    data: {
      vowType: 'FLEXIBLE_2_DAYS',
      previousVowType: 'VEGETARIAN_1ST_15TH_LUNAR',
      migratedAt: new Date(),
      migrationReason: 'EMERGENCY_RESCUE'
    }
  });
  ```

### AC6: Track Postponed Days
**GIVEN** user chọn dời ngày  
**WHEN** hệ thống ghi nhận  **THEN** 
- Tạo `PostponedVowDay` record:
  ```typescript
  {
    vowId: <vow_id>,
    originalDate: <missed_date>,
    postponedToDate: <new_date>,
    reason: <user_reason>,
    prayerAcknowledged: true,
    status: 'PENDING'
  }
  ```

### AC7: Success Reminder For Postponed Day
**GIVEN** user đã dời ngày ăn chay sang ngày X  
**WHEN** đến ngày X  
**THEN** 
- Gửi reminder:
  ```
  📅 HÔM NAY LÀ NGÀY ĂN CHAY ĐÃ HỨA
  
  Bạn đã xin Bồ Tát dời ngày ăn chay từ mùng 1/15
  sang hôm nay.
  
  Hãy giữ lời hứa và check-in khi hoàn thành!
  
  [Check-in Ăn Chay]
  ```

### AC8: Audit Trail Display
**GIVEN** user xem lịch sử vow  
**WHEN** họ mở timeline  
**THEN** 
- Hiển thị migration history:
  ```
  📜 Lịch Sử Nguyện Ăn Chay
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📅 04/04/2026 - Chuyển đổi nguyện
     Từ: Mùng 1, 15 cố định
     Sang: 2 ngày linh hoạt/tháng
     Lý do: Cấp cứu thất nguyện
  
  📅 15/03/2026 - Dời ngày ăn chay
     Từ: Mùng 15 (bỏ lỡ)
     Sang: Ngày 20 (đã hoàn thành ✅)
     Lý do: Nhập viện khẩn cấp
  
  📅 01/01/2026 - Phát nguyện ban đầu
     Loại: Mùng 1, 15 âm lịch
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

---

## 🔧 Technical Notes

### Database Schema
```prisma
model Vow {
  id              String   @id @default(cuid())
  userId          String
  vowType         String   // VEGETARIAN_1ST_15TH_LUNAR, FLEXIBLE_2_DAYS, etc.
  previousVowType String?
  status          String   // ACTIVE, PAUSED, MIGRATED
  createdAt       DateTime @default(now())
  migratedAt      DateTime?
  migrationReason String?
  
  postponedDays PostponedVowDay[]
  
  user User @relation(fields: [userId], references: [id])
  
  @@index([userId, status])
}

model PostponedVowDay {
  id                 String   @id @default(cuid())
  vowId              String
  originalDate       DateTime
  postponedToDate    DateTime
  reason             String
  prayerAcknowledged Boolean  @default(false)
  status             String   // PENDING, COMPLETED, FAILED
  completedAt        DateTime?
  
  vow Vow @relation(fields: [vowId], references: [id])
  
  @@index([vowId, status])
  @@index([postponedToDate])
}
```

### Vow Type Enum
```typescript
enum VowType {
  VEGETARIAN_1ST_15TH_LUNAR = 'VEGETARIAN_1ST_15TH_LUNAR',
  FLEXIBLE_2_DAYS = 'FLEXIBLE_2_DAYS',
  FULL_VEGETARIAN = 'FULL_VEGETARIAN',
  // ... other types
}
```

### Notification Scheduler
```typescript
// Cron job: Check for missed vow days
// Run daily at 00:30 (after day rollover)

async function checkMissedVowDays() {
  const yesterday = subDays(new Date(), 1);
  const lunarDate = toLunarDate(yesterday);
  
  if (lunarDate.day !== 1 && lunarDate.day !== 15) {
    return; // Not a vow day
  }
  
  // Find users with active fixed vows
  const activeVows = await prisma.vow.findMany({
    where: {
      vowType: 'VEGETARIAN_1ST_15TH_LUNAR',
      status: 'ACTIVE'
    },
    include: { user: true }
  });
  
  for (const vow of activeVows) {
    const hasCheckIn = await checkVegetarianCheckIn(vow.userId, yesterday);
    
    if (!hasCheckIn) {
      // Trigger emergency rescue flow
      await triggerEmergencyRescue(vow);
    }
  }
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Chương về phát nguyện và giữ giới
- **Q&A Huyền học:** Xử lý khi không thể giữ nguyện do bất khả kháng
- **Hướng dẫn thực hành:** Cách khấn Bồ Tát khi cần thay đổi cam kết

---

## 🏷️ Tags
`#phase-25` `#calendar` `#vow-migration` `#emergency-rescue` `#vegetarian` `#flexible-vow`

# USE CASE: Name Change Probation Timer & Interim Alias
**Module:** `sacred-forms`, `engagement`, `little-house`  
**Phase:** 34 - Tầng Kiểm Soát Vật Lý & Chống Trục Lợi Pháp Bảo  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

**Đơn Thăng Văn Đổi Tên** (Name Change Application):

### 🔥 BURN REQUIREMENT:
- Phải đốt vào **ngày trời nắng** (Weather.Sunny)
- Chỉ được đốt lúc: **6am, 8am, 4pm** (TimeGate)

### ⏰ PROBATION PERIOD:
- **3 tháng đến 100 ngày** để cái tên mới có tính linh động ở linh giới
- Trong 100 ngày này: **Tên chưa hoàn toàn "sống"**

### 📝 INTERIM ALIAS RULE:
- Nếu không chắc tên đã linh nghiệm, phải viết NNN dạng: `Kính tặng Người cần kinh của Tên Mới (Tên Cũ)`
- Sau 100 ngày: Tên Mới được ghi vào Sổ Nam Tào → Được phép viết dạng thông thường

---

## 🎯 Acceptance Criteria

### AC1: Burn Date Time Gate
**GIVEN** user submit name change form  
**WHEN** try to burn  
**THEN** 
- Check 2 conditions:
  1. **Weather**: Phải là "Sunny" (không mây, không mưa)
  2. **Time**: Chỉ cho phép 06:00-07:00, 08:00-09:00, 16:00-17:00

- If fail:
  ```json
  {
    "statusCode": 400,
    "error": "INVALID_BURN_CONDITIONS",
    "message": "Phải đốt vào ngày nắng, lúc 6am, 8am hoặc 4pm",
    "requiredConditions": {
      "weather": "Sunny",
      "allowedTimes": ["06:00-07:00", "08:00-09:00", "16:00-17:00"]
    }
  }
  ```

### AC2: Burn Success & Create 100-Day Timer
**GIVEN** conditions met  
**WHEN** user confirm burn  
**THEN** 
- Create probation record:
  ```typescript
  {
    nameChangeId: <uuid>,
    burnedAt: now(),
    newName: "Tên Mới",
    oldName: "Tên Cũ",
    probationEndDate: addDays(now(), 100),
    status: 'PROBATION_100_DAYS',
    isNameLingActive: false // Will become true on day 101
  }
  ```

### AC3: Auto-Inject Interim Alias In NNN PDFs
**GIVEN** user generate PDF of LH (Little House) during probation  
**WHEN** system render "Kính Tặng" field  
**THEN** 
- Auto-format:
  ```
  If LH.offerTo contains newName AND within 100-day probation:
    → Force format: "Người cần kinh của Tên Mới (Tên Cũ)"
  
  Else (after 100 days):
    → Allow: "Người cần kinh của Tên Mới"
  ```

### AC4: Countdown Display
**GIVEN** during probation period  
**WHEN** user view dashboard  
**THEN** 
- Show countdown banner:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⏳ TÊN MỚI ĐANG TRONG QUÁ ĐỘ
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Tên Mới: Tên Mới
  Ngày Đốt: [Date]
  
  Còn: 75 ngày nữa để tên được ghi vào Sổ Nam Tào
  
  💡 Lưu Ý: Khi viết Tiểu Phương Tử, 
  hãy dùng cú pháp "Tên Mới (Tên Cũ)" 
  để chắc chắn cái tên được linh giới nhận.
  
  Dự kiến Tên Mới "sống" hoàn toàn: [Date]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC5: Auto-Unlock On Day 101
**GIVEN** 100 days pass  
**WHEN** system cronjob trigger  
**THEN** 
- Update status:
  ```typescript
  {
    status: 'NAME_FULLY_ACTIVE',
    isNameLingActive: true,
    activatedAt: now(),
    probationComplete: true
  }
  ```
- Send notification:
  ```
  ✅ TÊN MỚI ĐÃ ĐƯỢC GHI VÀO SỔ NAM TÀO
  
  Tên Mới của bạn đã hoàn toàn "sống" 
  trong linh giới. 
  
  Từ bây giờ, bạn có thể viết Tiểu Phương Tử 
  với tên mới mà không cần cú pháp "Tên Cũ".
  
  🎉 Chúc mừng!
  ```

### AC6: Template Validation For NNN
**GIVEN** during probation  
**WHEN** generate LH PDF  
**THEN** 
- Append footer note:
  ```
  [Ghi chú hệ thống]
  
  Tính từ [Burn Date], đơn đổi tên của bạn 
  vẫn đang trong giai đoạn xác nhận 
  (chưa đủ 100 ngày). 
  
  Để an toàn, hệ thống tự động dùng cú pháp:
  "Kính tặng Người cần kinh của [Tên Mới] 
  ([Tên Cũ])"
  
  Hết 100 ngày, bạn có thể dùng tên mới riêng.
  ```

---

## 🔧 Technical Notes

### Cronjob Auto-Unlock
```typescript
// Location: apps/api/src/sacred-forms/services/name-change.service.ts

@Cron('0 0 * * *') // Daily at midnight
async unlockFullyActiveName() {
  const expiredProbations = await this.prisma.nameChange.findMany({
    where: {
      status: 'PROBATION_100_DAYS',
      probationEndDate: { lte: new Date() }
    }
  });
  
  for (const record of expiredProbations) {
    await this.prisma.nameChange.update({
      where: { id: record.id },
      data: {
        status: 'NAME_FULLY_ACTIVE',
        isNameLingActive: true,
        activatedAt: new Date()
      }
    });
    
    await this.notificationService.sendActivationNotice(record.userId);
  }
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Đơn Đổi Tên & Probation
- **Q&A Huyền học:** 100 ngày để tên có tính linh động
- **Hướng dẫn thực hành:** Cách viết Tiểu Phương Tử trong thời gian probation

---

## 🏷️ Tags
`#phase-34` `#sacred-forms` `#name-change-probation` `#100-day-timer` `#interim-alias`

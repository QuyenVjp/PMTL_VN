# USE CASE: Altar Fruit Decay Auto-Clear Mechanism
**Module:** `altar-management`, `vows-merit`  
**Phase:** 37 - Tầng Định Luật Vật Lý Lượng Tử & Bảo Mật Không Gian Tâm Linh  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

**Trái cây không được để quá 1 tuần** trên bàn thờ.

### ⚠️ NGHIÊM CẤP:
Dù **KHÔNG có trái cây mới** để thay, vẫn **BẮT BUỘC dọn bỏ trái cây đã hỏng**

### ✅ PHẢI LÀM:
Thà để **đĩa trống** còn hơn dâng **đồ hỏng** lên Phật

---

## 🎯 Acceptance Criteria

### AC1: 6-Day Warning
**GIVEN** fruit placed on altar  
**WHEN** day 6 since `offeredAt`  
**THEN** 
- Send Yellow Alert:
  ```
  ⚠️  CẢNH BÁO: TRÁI CÂY SẮP HỏNG
  
  Trái cây đã cúng 6 ngày.
  
  Hãy chuẩn bị thay mới hoặc dọn bỏ 
  trong 24 giờ tới để tránh hỏng.
  
  [Xác Nhận]
  ```

### AC2: 7-Day Hard Deadline
**GIVEN** fruit reach day 7  
**WHEN** cronjob trigger  
**THEN** 
- Push Forced Task:
  ```
  🔴 CẤP CỨU: TRÁI CÂY PHẢI DỌNÙ
  
  Trái cây đã cúng ĐÚNG 7 ngày!
  
  BẮT BUỘC bây giờ phải:
  1. Dọn bỏ đĩa trái cây cũ
  2. Hoặc thay mới
  
  Xác nhận bạn đã dọc bỏ:
  
  ☐ Tôi đã dọn bỏ đĩa trái cây đã hỏng
  
  [Xác Nhận - Đã Dọn]
  ```

### AC3: Allow Empty Plate State
**GIVEN** user confirm fruit removed  
**WHEN** submit task  
**THEN** 
- Allow state transition:
  ```typescript
  {
    fruitPlateId: <uuid>,
    status: 'EMPTY', // NEW STATE (from Phase 36: had to replace whole plate)
    lastRemovedAt: now(),
    reason: 'DECAY_REMOVAL'
  }
  ```

### AC4: Positive Reinforcement Message
**GIVEN** removal confirmed  
**WHEN** show success  
**THEN** 
- Display approval:
  ```
  ✅ TỐT LẮM!
  
  Bạn đã tuân theo giáo lý: 
  "Thà để đĩa không, tuyệt đối không 
  dâng đồ đã hỏng lên Phật!"
  
  💡 Lần tới bạn có thể:
  1. Thay trái cây mới
  2. Hoặc để đĩa trống cho đến khi 
     có trái cây sạch
  
  Bồ Tát sẽ ghi nhận lòng tôn kính 
  của bạn 🙏
  ```

### AC5: Statistics Tracking
**GIVEN** removal pattern  
**WHEN** analyze user behavior  
**THEN** 
- Track metrics:
  ```typescript
  {
    userId: <uuid>,
    totalFruitRemovals: 48,
    averageDaysBeforeRemoval: 6.8,
    complianceRate: 98%, // Removed before decay
    timestamp: now()
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Dâng trái cây
- **Q&A Huyền học:** Tôn kính trong dâng hương
- **Hướng dẫn thực hành:** Cách bảo quản đĩa trái cây

---

## 🏷️ Tags
`#phase-37` `#altar-management` `#fruit-decay` `#purity-protocol` `#automation-alert`

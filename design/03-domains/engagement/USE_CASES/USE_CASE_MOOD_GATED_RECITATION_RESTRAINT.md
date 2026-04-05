# USE CASE: Mood-Gated Recitation Restraint
**Module:** `little-house`, `engagement`  
**Phase:** 36 - Tầng Định Luật Vật Lý Lượng Tử & Quản Trị Trạng Thái Pháp Bảo  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

Niệm **Ngôi Nhà Nhỏ (NNN) là hoạt động cực kỳ hao tổn năng lượng**.

### ⚠️ TUYỆT ĐỐI TRÁNH khi:
- Mệt mỏi, kiệt sức
- Tức giận, phiền não
- Tâm trạng không ổn định

### ⚡ LÝ DO:
- **Không thể tập trung** → NNN sẽ **mất tác dụng**
- Năng lượng bị tiêu hao mà không có công đức

### ✅ PHẢI LÀM:
Nếu tâm trạng xấu → Niệm **Chú Đại Bi** để phục hồi trước

---

## 🎯 Acceptance Criteria

### AC1: Mood Assessment Before Recitation
**GIVEN** user click "Bắt Đầu Đếm NNN"  
**WHEN** trigger pre-flight check  
**THEN** 
- Show **Mood Slider** (Gamified 1-10 scale):
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  😊 KIỂM TRA TRẠNG THÁI NĂNG LƯỢNG
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Bạn cảm thấy như thế nào bây giờ?
  
  😭 1 ─────●───── 10 😄
  
  [Tiếp Tục Đếm NNN]
  [Hủy - Niệm Chú Đại Bi Trước]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC2: Energy Threshold Lock
**GIVEN** user select mood < 4  
**WHEN** try to proceed  
**THEN** 
- **DISABLE** NNN counting for **1 hour**:
  ```
  ⚠️  TRƯỜNG NĂNG LƯỢNG THẤPÙ
  
  Bạn đang có tâm trạng không ổn định 
  (Mệt mỏi / Tức giận / Phiền não).
  
  Niệm Ngôi Nhà Nhỏ lúc này sẽ:
  ❌ Làm bạn kiệt sức hơn
  ❌ Kinh văn sẽ KHÔNG có tác dụng
  ❌ Công đức sẽ BỊ MẤT
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  🙏 PHƯƠNG ÁN THAY THẾ:
  
  Hãy niệm Chú Đại Bi để phục hồi công lực trước.
  Hệ thống đã khóa chức năng NNN trong 1 giờ.
  
  [Niệm Chú Đại Bi]
  [Thoát]
  ```

### AC3: Recommendation To Use Da Bei
**GIVEN** lock triggered  
**WHEN** user see recommendation  
**THEN** 
- Suggest direct action:
  ```
  💡 LỰA CHỌN:
  
  [Niệm Chú Đại Bi để phục hồi]
  → Sau 20-30 phút, bạn sẽ cảm thấy 
    năng lượng tốt hơn
  → Khi đó hãy quay lại niệm NNN
  ```

### AC4: Countdown Timer
**GIVEN** lock applied  
**WHEN** display UI  
**THEN** 
- Show countdown:
  ```
  🔒 Chức năng NNN bị khóa
  
  Mở khóa lại trong: 00:58:32
  
  (Mood phục hồi sau ~1 giờ hoặc 
   khi bạn tự đặt lại tâm trạng)
  ```

### AC5: Manual Mood Reset
**GIVEN** user want to re-assess earlier  
**WHEN** click "Kiểm tra lại"  
**THEN** 
- Allow re-assessment:
  ```
  Bạn cảm thấy tốt hơn rồi sao?
  
  😭 1 ─────●───── 10 😄
  
  (Nếu > 5, chúng tôi sẽ mở khóa)
  ```

### AC6: Database Audit
**GIVEN** lock triggered  
**WHEN** save  
**THEN** 
- Record:
  ```typescript
  {
    littleHouseId: <uuid>,
    moodCheckAt: now(),
    moodScore: 3,
    action: "LOCK_FOR_1_HOUR",
    unlocksAt: addHours(now(), 1),
    reason: "LOW_ENERGY_DETECTION"
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Năng lượng và Niệm Kinh
- **Q&A Huyền học:** Tầm quan trọng tâm trạng khi tụng NNN
- **Hướng dẫn thực hành:** Cách phục hồi năng lượng trước khi niệm

---

## 🏷️ Tags
`#phase-36` `#little-house` `#mood-gating` `#energy-threshold` `#dharma-protection`

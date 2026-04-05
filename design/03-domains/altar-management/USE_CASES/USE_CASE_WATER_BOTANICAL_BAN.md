# USE CASE: Great Compassion Water Botanical Ban
**Module:** `altar-management`, `vows-merit`  
**Phase:** 36 - Tầng Định Luật Vật Lý Lượng Tử & Quản Trị Trạng Thái Pháp Bảo  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

**Nước Đại Bi** (cúng cho Bồ Tát):

### ✅ CÓ THỂ DÙNG CHO:
- Uống để nhận gia trì Bồ Tát
- Rửa tay/mặt để tịnh hóa

### ❌ TUYỆT ĐỐI KHÔNG ĐƯỢC DÙNG CHO:
- **Tưới cây**
- **Tưới hoa cỏ**
- Bất kỳ mục đích hạ cấp nào

### ⚠️ LÝ DO:
Nước cúng Bồ Tát là "Pháp bảo tâm linh"  
Tưới cây = Gán cho "đối tượng thấp hơn" = Bất kính

---

## 🎯 Acceptance Criteria

### AC1: Daily Water Usage Workflow
**GIVEN** user manage altar water  
**WHEN** select "Hạ Nước Cúng" (Consume Water)  
**THEN** 
- Show usage options:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  💧 CÁCH DÙNG NƯỚC ĐẠI BI
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ✅ CÓ THỂ:
  
  ○ Uống để nhận gia trì Bồ Tát
  ○ Rửa tay/mặt để tịnh hóa
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ☐ Tôi cam kết TỰ NIỆM 
    không dùng nước để tưới cây
  
  [Xác Nhận - Hạ Nước]
  ```

### AC2: Hard-Stop Commitment
**GIVEN** options displayed  
**WHEN** user proceed  
**THEN** 
- Require checkbox:
  ```
  ⚠️  CẢNH BÁO PHÁP BẢO
  
  ☐ Tôi sẽ uống hoặc đổ bỏ đúng nơi.
  
  ☐ TÔI CAM KẾT TUYỆT ĐỐI KHÔNG dùng 
    nước Đại Bi để tưới cây/hoa cỏ.
  
  (Nước cúng Bồ Tát không được gán cho 
   các đối tượng thấp hơn)
  
  [Hủy]  [Xác Nhận - Đã Hiểu]
  ```

### AC3: Button Lock Until Confirmed
**GIVEN** checkbox not ticked  
**WHEN** try to proceed  
**THEN** 
- Button disabled:
  ```
  [🔒 Xác Nhận Hạ Nước] ← DISABLED
  
  Bắt buộc phải xác nhận cam kết trước
  ```

### AC4: Usage Tracking
**GIVEN** user confirm  
**WHEN** process water usage  
**THEN** 
- Record action:
  ```typescript
  {
    waterUsageId: <uuid>,
    altarId: <uuid>,
    action: "CONSUME_OR_DISCARD",
    commitmentConfirmed: true,
    botanicalBanAcknowledged: true,
    timestamp: now()
  }
  ```

### AC5: Monthly Audit Check
**GIVEN** cronjob run  
**WHEN** check usage patterns  
**THEN** 
- Verify no "watering plants" entries
- If violation detected:
  ```typescript
  {
    violation: "BOTANICAL_BAN_VIOLATION",
    userId: <uuid>,
    action: "SEND_WARNING"
  }
  ```

### AC6: Educational Tooltip
**GIVEN** user view water section  
**WHEN** hover info icon  
**THEN** 
- Show explanation:
  ```
  ℹ️  TẠI SAO CẤM TƯ CÂY?
  
  🌿 Nước cúng Bồ Tát = Pháp bảo tâm linh
  
  Tưới cây = "Gán cho đối tượng thấp hơn"
  = Bất kính với Pháp bảo
  
  ✅ Chỉ dùng cho:
  - Uống (nhận gia trì)
  - Rửa tay/mặt (tịnh hóa)
  - Đổ bỏ vào sông/nước sạch
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Cách dùng nước cúng
- **Q&A Huyền học:** Tôn kính Pháp bảo tâm linh
- **Hướng dẫn thực hành:** Quy tắc xử lý nước cúng

---

## 🏷️ Tags
`#phase-36` `#altar-management` `#water-botanical-ban` `#dharma-respect` `#purity-gate`

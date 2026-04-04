# USE CASE: Proxy Recitation Transference Shield
**Module:** `little-house`, `vows-merit`  
**Phase:** 36 - Tầng Định Luật Vật Lý Lượng Tử & Quản Trị Trạng Thái Pháp Bảo  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

Khi tụng **NNN cho người khác đang bệnh nặng**:

### ⚠️ NGUY HIỂM:
Vong linh đang chiếm giữ cơ thể người bệnh → Có thể **nhảy sang chiếm giữ cơ thể bạn**

### ✅ PHẢI LÀM:
**Khấn "miễn trừ" cực kỳ chính xác và rõ ràng**

---

## 🎯 Acceptance Criteria

### AC1: Proxy Mode Flag
**GIVEN** user create NNN task  
**WHEN** select recipient  
**THEN** 
- Ask: *"Bạn niệm cho ai?"*
  ```
  ○ Cho chính mình
  ○ Cho người khác (Proxy)
  ```

### AC2: Proxy Waiver Modal
**GIVEN** user select "Proxy"  
**WHEN** proceed  
**THEN** 
- Bung **Hard-stop Modal**:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⚠️  CẢNH BÁO NIỆM THAY NGƯỜI BỆNH
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Khi bạn niệm Ngôi Nhà Nhỏ cho một người 
  bệnh nặng, vong linh đó có thể nhảy sang 
  chiếm giữ cơ thể BẠN.
  
  ⚠️  ĐỂ AN TOÀN, BẮT BUỘC phải khấn:
  
  📖 LỜI KHẤN (Vui lòng đọc to):
  
  "Xin Nam Mô Đại Từ Đại Bi Quán Thế Âm 
  Bồ Tát từ bi, con xin khấn với Bồ Tát.
  
  Con sắp niệm X tấm Tiểu Phương Tử cho 
  [Tên Người Bệnh], phần công đức còn lại 
  của người đó xin Người cần kinh hãy tìm 
  [Tên Người Bệnh] để đòi, đừng đòi từ con.
  
  Con khấn xin Bồ Tát phù hộ cho con, 
  không cho vong linh nhảy sang chiếm giữ 
  cơ thể con. Xin Bồ Tát phù hộ."
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ☐ Tôi đã đọc to lời khấn
  
  [Hủy]  [Xác Nhận - Đã Khấn]
  ```

### AC3: Commitment Checkbox
**GIVEN** user click "Đã Khấn"  
**WHEN** checkbox required  
**THEN** 
- Must tick:
  ```
  ☐ Tôi cam kết:
  
  ✓ Đã khấn lời trên trước tượng Bồ Tát
  ✓ Vong linh KHÔNG được đòi công đức từ con
  ✓ Con hiểu rằng nếu không khấn đúng,
    vong linh sẽ chiếm giữ cơ thể con
  
  [Xác Nhận - Tạo Task NNN]
  ```

### AC4: API Enforcement
**GIVEN** user submit without confirmation  
**WHEN** try to POST  
**THEN** 
- Require both conditions:
  ```json
  {
    isProxy: true,
    proxyPrayerConfirmed: true, // Required
    targetPersonId: <uuid>,
    quantity: 27
  }
  ```
  
  If missing: `400 Bad Request`

### AC5: Audit Trail For Protection
**GIVEN** proxy task created  
**WHEN** save  
**THEN** 
- Record protective measures:
  ```typescript
  {
    littleHouseId: <uuid>,
    isProxy: true,
    targetPerson: <name>,
    prayerConfirmedAt: now(),
    prayerText: "[Stored for audit]",
    transferenceShieldActive: true
  }
  ```

### AC6: Reminder At Completion
**GIVEN** user finish proxy NNN  
**WHEN** mark as completed  
**THEN** 
- Show reminder:
  ```
  ✅ NIỆM XONG
  
  Nhắc nhở: Vì bạn đã khấn đúng lời khấn,
  vong linh sẽ không được đòi công đức từ 
  bạn. Nếu [Tên Người Bệnh] phục hồi, họ 
  cần tự làm công đức bù để xóa hết nợ.
  
  Bồ Tát sẽ bảo vệ bạn ✨
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Niệm thay người bệnh nặng
- **Q&A Huyền học:** Cách bảo vệ bản thân khi niệm thay
- **Hướng dẫn thực hành:** Lời khấn miễn trừ

---

## 🏷️ Tags
`#phase-36` `#little-house` `#proxy-recitation` `#transference-shield` `#karma-protection`

# USE CASE: Temporary Relocation Altar Bridge
**Module:** `altar-management`, `calendar`  
**Phase:** 37 - Tầng Định Luật Vật Lý Lượng Tử & Bảo Mật Không Gian Tâm Linh  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

**Nếu nhà đang sửa chữa:**
- Bạn phải ra ngoài ở tạm (khách sạn, nhà thuê, nhà khác)
- **PHẢI lập bàn thờ tạm thời** tại nơi ở tạm
- Khi nhà mới xong → Thỉnh bàn thờ về địa điểm cũ

---

## 🎯 Acceptance Criteria

### AC1: House Status Transition
**GIVEN** user initiate home renovation  
**WHEN** update calendar  
**THEN** 
- Activate state:
  ```typescript
  {
    userId: <uuid>,
    homeStatus: 'UNDER_RENOVATION',
    startDate: <date>,
    expectedCompletionDate: <date>,
    temporaryResidenceAddress: "123 Đường X, TP Y"
  }
  ```

### AC2: Automatic Temporary Altar Creation
**GIVEN** homeStatus = UNDER_RENOVATION  
**WHEN** system process  
**THEN** 
- Auto-create linked profile:
  ```typescript
  {
    altarId: <new-uuid>,
    type: 'TEMPORARY',
    linkedToMainAltar: <main-altar-id>,
    location: "123 Đường X, TP Y",
    status: 'ACTIVE',
    createdAt: now(),
    expectedDurationDays: <days-until-completion>
  }
  ```

### AC3: Task Routing to Temporary Altar
**GIVEN** temporary altar active  
**WHEN** user create daily offering task  
**THEN** 
- Route to temp profile:
  ```
  🏠 ĐỔI ĐỊA ĐIỂM TẠMÙ
  
  Nhà của bạn đang sửa chữa (dự kiến 
  xong vào [Ngày]).
  
  Những tác vụ dâng hương/nước hôm nay 
  sẽ dâng tại:
  
  📍 Bàn Thờ Tạm: 123 Đường X, TP Y
  
  [Xác Nhận - Dâng Tại Đây]
  ```

### AC4: Daily Routing Logic
**GIVEN** user open morning routine  
**WHEN** render task list  
**THEN** 
- Show temporary altar indicator:
  ```
  🌅 BUỔI SÁNG HÔM NAY
  
  ⚠️  TÌNH HUỐNG ĐẶC BIỆT: Đang ở tạm
  
  [🏠 Bàn Thờ Tạm - 123 Đường X, TP Y]
  
  ☐ Dâng hương (5-7 tấm)
  ☐ Dâng nước
  ☐ Niệm Chú Đại Bi (21 biến)
  
  (Tất cả dâng tại BÀN THỜ TẠM)
  ```

### AC5: Completion - Switch Back
**GIVEN** renovation complete  
**WHEN** user click [Hoàn thành sửa nhà]  
**THEN** 
- Show transition workflow:
  ```
  ✨ HOÀN THÀNH CÔNG TRÌNH
  
  Nhà của bạn đã xong sửa chữa!
  
  Tiến hành:
  
  1️⃣  Chuẩn bị bàn thờ chính tại:
      [Nhập lại địa chỉ bàn thờ chính]
  
  2️⃣  Dâng hương chuyển về lại:
      □ Tôi đã dâng hương tại bàn thờ
        chính lần đầu
  
  3️⃣  Dọn bỏ bàn thờ tạm:
      □ Tôi đã dọn bỏ bàn thờ tạm an toàn
  
  [Hoàn Tất - Quay Về Bình Thường]
  ```

### AC6: Temporary Altar Deactivation
**GIVEN** user confirm completion  
**WHEN** submit  
**THEN** 
- Deactivate temp, reactivate main:
  ```typescript
  // Deactivate temp
  {
    altarId: <temp-altar-id>,
    status: 'ARCHIVED',
    deactivatedAt: now(),
    deactivationReason: 'HOME_RENOVATION_COMPLETE'
  }
  
  // Reactivate main
  {
    homeStatus: 'NORMAL',
    mainAltarActive: true
  }
  ```

### AC7: Audit Trail
**GIVEN** process complete  
**WHEN** record event  
**THEN** 
- Document transition:
  ```typescript
  {
    userId: <uuid>,
    event: 'ALTAR_RELOCATION_CYCLE_COMPLETE',
    temporaryAltarDuration: 45 // days
    startDate: <start>,
    endDate: <end>,
    mainAltarResumed: true
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Bàn thờ tạm thời
- **Q&A Huyền học:** Cách xử lý khi di chuyển tạm thời
- **Hướng dẫn thực hành:** Chuyển bàn thờ an toàn

---

## 🏷️ Tags
`#phase-37` `#altar-management` `#temporary-relocation` `#home-renovation` `#altar-bridge`

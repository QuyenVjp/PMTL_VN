# USE CASE: Sub-Altar Storage Isolation Guard
**Module:** `altar-management`  
**Phase:** 37 - Tầng Định Luật Vật Lý Lượng Tử & Bảo Mật Không Gian Tâm Linh  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

**Gầm bàn thờ** (dưới mặt bàn) rất nhạy cảm trong từ trường tâm linh.

### ✅ ĐƯỢC PHÉP cất ở dưới gầm:
- Kinh sách
- Phật cụ (chuông, trống,...)
- Bùa hộ thân nhỏ
- Vộ tạm khi du lịch

### ❌ TUYỆT ĐỐI CẤM:
- **Tượng Bồ Tát khác**
- Những bức tượng thứ hai
- Hình nhân dân sư

### ⚠️ LÝ DO:
Để tượng Bồ Tát dưới gầm = **tội bất kính cực lớn**

---

## 🎯 Acceptance Criteria

### AC1: Inventory Zone Separation
**GIVEN** user manage altar inventory  
**WHEN** open inventory system  
**THEN** 
- Divide into 2 zones:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📦 KHO HÀNG BÀN THỜ
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ZONE 1: PHÍA TRÊN (Mặt Bàn Thờ)
  ✓ Tượng Bồ Tát chính
  ✓ Hương cây
  ✓ Đĩa hoa quả
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ZONE 2: PHÍA DƯỚI (Gầm Bàn)
  ✓ Kinh sách
  ✓ Phật cụ
  ✓ Bùa hộ thân nhỏ
  
  ❌ CẤM: Tượng Bồ Tát
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC2: Item Type Classification
**GIVEN** user try to add item  
**WHEN** select "ZONE 2 / Gầm Bàn"  
**THEN** 
- Query item type:
  ```typescript
  const ALLOWED_UNDER_ALTAR = [
    'SCRIPTURE',
    'RITUAL_TOOL', // chuông, trống
    'PROTECTIVE_AMULET', // Bùa nhỏ
    'PORTABLE_SHRINE' // Vộ tạm du lịch
  ];
  
  const FORBIDDEN_UNDER_ALTAR = [
    'BODHISATTVA_STATUE',
    'DEITY_STATUE',
    'HUMAN_FIGURE_IMAGE'
  ];
  ```

### AC3: Hard-Block Bodhisattva Statue
**GIVEN** user try to add Bodhisattva statue  
**WHEN** select Zone 2 location  
**THEN** 
- Return `422 Unprocessable Entity`:
  ```json
  {
    "statusCode": 422,
    "error": "DISRESPECTFUL_PLACEMENT",
    "code": "BODHISATTVA_STATUE_FORBIDDEN_UNDER_ALTAR",
    "message": "CẢNH BÁO BẤT KÍNH: Không được cất giấu Tượng Bồ Tát ở gầm bên dưới bàn thờ"
  }
  ```

### AC4: Educational Alert
**GIVEN** violation triggered  
**WHEN** show modal  
**THEN** 
- Display explanation:
  ```
  🚨 TỘI BẤT KÍNH CỰC LỚN
  
  Tượng Bồ Tát là Pháp bảo tâm linh cao cấp.
  
  ❌ KHÔNG ĐƯỢC để dưới gầm bàn thờ
  (Đó là vị trí thấp hạ, không tôn kính)
  
  ✅ CHỈ ĐƯỢC để dưới gầm:
  - Kinh sách
  - Phật cụ (chuông, trống)
  - Bùa hộ thân nhỏ
  - Vộ tạm du lịch
  
  💡 Nếu có quá nhiều tượng:
  Vui lòng sắp xếp trên bàn phụ hoặc 
  lập bàn thờ thứ hai.
  
  [Hiểu Rồi - Sắp Xếp Lại]
  ```

### AC5: Audit Trail
**GIVEN** violation attempt  
**WHEN** save attempt  
**THEN** 
- Record:
  ```typescript
  {
    userId: <uuid>,
    violation: "STATUE_MISPLACEMENT_ATTEMPT",
    itemType: "BODHISATTVA_STATUE",
    location: "UNDER_ALTAR",
    action: "REJECTED",
    timestamp: now()
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Cách bố trí bàn thờ
- **Q&A Huyền học:** Vị trí thích hợp cho các Phật cụ
- **Hướng dẫn thực hành:** Quy tắc tôn kính Pháp bảo

---

## 🏷️ Tags
`#phase-37` `#altar-management` `#storage-zone` `#bodhisattva-protection` `#respect-hierarchy`

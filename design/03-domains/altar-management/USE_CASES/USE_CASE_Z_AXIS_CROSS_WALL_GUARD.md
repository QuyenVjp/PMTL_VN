# USE CASE: Z-Axis Cross-Wall Collision Guard
**Module:** `altar-management`, `identity`  
**Phase:** 37 - Tầng Định Luật Vật Lý Lượng Tử & Bảo Mật Không Gian Tâm Linh  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

**Bàn thờ không được để trong phòng ngủ vợ chồng** (Logic từ Phase 36)

### ⚠️ NHƯNG CÒN CÓ QUY TẮC VI MỌ HƠN:
- Phòng ngủ vợ chồng **KHÔNG ĐƯỢC nằm phía sau bức tường** đặt bàn thờ
- Bàn thờ **KHÔNG ĐƯỢC đối diện trực tiếp với giường ngủ** qua tường
- Nếu lạy bái ở vị trí đó lâu dài → Người ngủ phía sau tường **gặp xui xẻo**

### ✅ PHẢI TRÁNH:
Z-axis collision (cùng một đường thẳng vuông góc qua tường)

---

## 🎯 Acceptance Criteria

### AC1: Multi-Dimensional Wall Check
**GIVEN** user setup altar placement  
**WHEN** select wall location  
**THEN** 
- Ask comprehensive questions:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🧭 KIỂM TRA TƯỜNG - PHÒNG NGỦ (Z-AXIS)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Bạn sắp đặt bàn thờ vào vách tường.
  
  ⚠️  CẢNH BÁO NHIỀU CHIỀU:
  
  1️⃣  Phía sau bức tường này:
  ☐ Tôi xác nhận KHÔNG PHẢI là phòng ngủ 
     của vợ chồng
  
  2️⃣  Phía qua bức tường này:
  ☐ Tôi xác nhận KHÔNG CÓ chiếc giường 
     nào kê sát vách tường
  
  3️⃣  Khoảng cách an toàn:
  ☐ Bàn thờ cách giường ≥ 1.5m (nếu cùng 
     phòng)
  
  [Tiếp Tục]
  ```

### AC2: Cross-Wall Collision Detection
**GIVEN** user not confirm all  
**WHEN** try to save  
**THEN** 
- Block placement:
  ```
  ⚠️  CẤM ĐẶTÙ - VỊ TRÍ CÓ NGUY HIỂM
  
  Hệ thống phát hiện vách tường này 
  có nguy cơ Z-axis collision (giường 
  ngủ phía sau hoặc cùng phòng).
  
  ❌ Nếu để ở đây:
  → Người ngủ phía sau sẽ gặp xui xẻo
  → Từ trường của bàn thờ sẽ "tấn công" 
     qua tường
  
  ✅ ĐỀ NGHỊ:
  - Chọn tường khác (không phải phòng ngủ)
  - Hoặc lập bàn thờ trong phòng khách
  - Hoặc lập bàn thờ phòng riêng
  
  [Chọn Vị Trí Khác]
  ```

### AC3: Elderly Couple Exception Check
**GIVEN** user claim is elderly couple  
**WHEN** bypass questions  
**THEN** 
- Require additional confirmation:
  ```
  📋 NGOẠI LỆ - VỢ CHỒNG LỚN TUỔI
  
  Vợ chồng lớn tuổi (≥ 60 tuổi) có thể 
  để bàn thờ trong phòng ngủ vì không 
  còn hoạt động sinh sản.
  
  ☐ Cả hai người ≥ 60 tuổi?
  ☐ Không còn hoạt động sinh sản?
  
  [Xác Nhận]
  ```

### AC4: 3D Visualization Aid
**GIVEN** user unsure about placement  
**WHEN** click "Xem 3D"  
**THEN** 
- Show simple 3D visualization:
  ```
  [3D Diagram showing:]
  - Wall with altar marker
  - Behind-wall bedroom marker
  - Z-axis collision warning line
  - Safe distance indicators
  ```

### AC5: Audit Log
**GIVEN** placement confirmed  
**WHEN** save altar profile  
**THEN** 
- Record safety checks:
  ```typescript
  {
    altarId: <uuid>,
    wallPlacement: true,
    behindWallIsNotBedroom: true,
    noBedsAgainstWall: true,
    zAxisClearanceConfirmed: true,
    timestamp: now()
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Vị trí đặt bàn thờ 3D
- **Q&A Huyền học:** Từ trường xuyên tường
- **Hướng dẫn thực hành:** Kiểm tra vị trí an toàn

---

## 🏷️ Tags
`#phase-37` `#altar-management` `#z-axis-guard` `#dimensional-safety` `#wall-collision`

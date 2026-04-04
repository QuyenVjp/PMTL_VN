# USE CASE: Combustion Metal Segregation Protocol
**Module:** `little-house`, `engagement`  
**Phase:** 37 - Tầng Định Luật Vật Lý Lượng Tử & Bảo Mật Không Gian Tâm Linh  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

**Tinh vi: Kim loại khi đốt NNN có 2 quy tắc ngược chiều:**

### ❌ CONTAINER (Chậu/Đĩa):
- **TUYỆT ĐỐI CẤM kim loại** (chặn năng lượng)
- Phải dùng sứ, gốm, hay tờ quế

### ✅ TOOL (Nhíp/Đũa):
- **ĐƯỢC PHÉP kim loại** (tốt cho năng lượng)
- Phải có lõi sắt để "chỉnh đạo" công đức

---

## 🎯 Acceptance Criteria

### AC1: Pre-Burn Checklist with 2 Fields
**GIVEN** user start burning LH  
**WHEN** open pre-flight checklist  
**THEN** 
- Show 2 separate sections:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔥 KIỂM TRA TRƯỚC KHI ĐỐT
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  PHẦN 1: VẬT CHỨA TRO (Container)
  
  Bạn dùng loại gì để chứa NNN khi cháy?
  
  ○ Chậu/Đĩa Sứ (Porcelain)
  ○ Chậu/Đĩa Gốm (Ceramic)
  ○ Tờ Quế (Foil/Paper)
  ○ Kim Loại (Metal) ← CẢNH BÁO
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  PHẦN 2: DỤC CỤ KẸPÙ (Tool)
  
  Bạn dùng gì để kẹp Ngôi Nhà Nhỏ?
  
  ○ Nhíp Kim Loại (Metal Tweezers) ← OK
  ○ Đũa Kim Loại (Metal Chopsticks) ← OK
  ○ Đũa Gỗ (Wooden Chopsticks)
  ○ Tay (Bare Hand) ← CẤM
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC2: Container Metal Rejection
**GIVEN** user select metal container  
**WHEN** try to confirm  
**THEN** 
- Show RED alert:
  ```
  🚨 CẤM KỴ - VẬT CHỨA KHÔNG HỢPLỆ
  
  ❌ Kim loại sẽ chặn năng lượng Kinh văn
  
  Kim loại có khả năng shielding điện 
  từ, làm chặn từ trường tâm linh từ NNN 
  khi đốt.
  
  ✅ HÃY DÙNG:
  - Chậu/Đĩa Sứ
  - Chậu/Đĩa Gốm
  - Tờ Quế
  
  [Thay Đổi Vật Chứa]
  ```

### AC3: Tool Metal Acceptance
**GIVEN** user select metal tool  
**WHEN** confirm choice  
**THEN** 
- Show GREEN confirmation:
  ```
  ✅ HỢP LỆ - DỤCỤ KIM LOẠI
  
  Kim loại trong dục cụ sẽ giúp 
  "chỉnh đạo" năng lượng công đức 
  khi kẹp giấy.
  
  💡 Lưu Ý: Kẹp vào chữ "Kính Tặng",
  không kẹp vào chấm đỏ.
  
  [Xác Nhận - Sẵn Sàng Đốt]
  ```

### AC4: API Validation
**GIVEN** user submit pre-burn form  
**WHEN** backend validate  
**THEN** 
- Check both fields:
  ```typescript
  if (containerType === 'METAL') {
    throw new BadRequestException({
      code: 'METAL_CONTAINER_FORBIDDEN',
      message: 'Container cannot be metal'
    });
  }
  
  if (toolType === 'METAL') {
    // Allow - actually preferred
  }
  ```

### AC5: Audit Log
**GIVEN** burn completed  
**WHEN** record event  
**THEN** 
- Document materials:
  ```typescript
  {
    littleHouseId: <uuid>,
    combustionDate: now(),
    containerType: "CERAMIC",
    toolType: "METAL_TWEEZERS",
    validationPassed: true
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Vật liệu khi đốt NNN
- **Q&A Huyền học:** Kim loại trong âm lịch
- **Hướng dẫn thực hành:** Chuẩn bị vật liệu đốt NNN

---

## 🏷️ Tags
`#phase-37` `#little-house` `#metal-segregation` `#combustion-protocol` `#material-purity`

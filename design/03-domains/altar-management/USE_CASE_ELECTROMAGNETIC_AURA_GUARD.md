# USE CASE: Electromagnetic & Aura Collision Guard
**Module:** `altar-management`  
**Phase:** 36 - Tầng Định Luật Vật Lý Lượng Tử & Quản Trị Trạng Thái Pháp Bảo  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

**Bàn thờ Phật phải được đặt đúng vị trí** để không bị nhiễu loạn từ trường.

### ❌ TUYỆT ĐỐI KHÔNG ĐƯỢC ĐẶT TRÊN:
- Nóc TV
- Tủ lạnh
- Dưới máy điều hòa (nhiễu loạn điện từ)

### ❌ TUYỆT ĐỐI KHÔNG ĐƯỢC ĐẶT TRONG:
- **Phòng ngủ vợ chồng trẻ** (tuổi < 60, đang trong thời kỳ sinh hoạt)
- Lý do: Từ trường sinh hoạt phàm tục → ô uế không gian Bồ Tát

### ✅ NGOẠI LỆ:
- Phòng ngủ của vợ chồng **lớn tuổi** (tuổi ≥ 60)

---

## 🎯 Acceptance Criteria

### AC1: Location Validation Checklist
**GIVEN** user start Altar Setup Wizard  
**WHEN** select placement  
**THEN** 
- Show mandatory checklist:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔌 KIỂM TRA VỊ TRÍ ĐẶT BÀN THỜ
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Bàn thờ KHÔNG được đặt:
  
  ☐ Trên nóc Tivi hoặc Tủ lạnh
  ☐ Dưới máy điều hòa (nhiễu điện từ)
  
  Tôi xác nhận bàn thờ của tôi:
  ✓ KHÔNG ở các vị trí trên
  ✓ Ở vị trí sạch sẽ, tôn kính
  
  [Tiếp Tục]
  ```

### AC2: Bedroom Age-Gate
**GIVEN** user select `Location = Bedroom`  
**WHEN** trigger validation  
**THEN** 
- Cross-check profile:
  ```typescript
  if (location === 'BEDROOM') {
    const age = getUserAge();
    const maritalStatus = user.maritalStatus;
    
    if (maritalStatus === 'MARRIED' && age < 60) {
      // Hard-block
    } else if (maritalStatus === 'MARRIED' && age >= 60) {
      // Allow (exception for elderly couples)
    }
  }
  ```

### AC3: Young Couple - Hard Block
**GIVEN** `MARRIED` AND `age < 60`  
**WHEN** try to place in bedroom  
**THEN** 
- Return `403 Forbidden`:
  ```json
  {
    "statusCode": 403,
    "error": "FORBIDDEN_LOCATION",
    "code": "AURA_COLLISION_RISK",
    "message": "CẤM KỴ: Không được đặt bàn thờ trong phòng ngủ của vợ chồng trẻ"
  }
  ```

### AC4: Full Error Message
**GIVEN** rejection  
**WHEN** show modal  
**THEN** 
- Display explanation:
  ```
  ⚠️  CẤM KỴ - VỊ TRÍ CẤM KỴ
  
  KHÔNG được đặt bàn thờ trong phòng ngủ 
  của vợ chồng đang tuổi sinh hoạt.
  
  Lý do: 
  Từ trường sinh hoạt phàm tục sẽ ô uế 
  không gian Bồ Tát và gây mất tôn kính.
  
  ✅ NGOẠI LỆ:
  Phòng ngủ của vợ chồng lớn tuổi (≥ 60 tuổi) 
  có thể được đặt (không có hoạt động sinh sản).
  
  💡 ĐỀ NGHỊ:
  - Phòng khách
  - Phòng thờ riêng
  - Góc thanh tịnh khác
  
  [Thay Đổi Vị Trí]
  ```

### AC5: Elderly Exception Allowed
**GIVEN** `age >= 60` AND `MARRIED`  
**WHEN** select bedroom  
**THEN** 
- Allow with note:
  ```
  ✅ Được Phép (Ngoại Lệ Vợ Chồng Lớn Tuổi)
  
  Lưu ý: Nếu quá 60 tuổi hoặc không còn
  sinh hoạt, bàn thờ trong phòng ngủ là
  được chấp nhận.
  
  [Xác Nhận Vị Trí]
  ```

### AC6: Audit Trail
**GIVEN** location confirmed  
**WHEN** save  
**THEN** 
- Record:
  ```typescript
  {
    altarId: <uuid>,
    location: "BEDROOM",
    maritalStatus: "MARRIED",
    userAge: 62,
    exemptionApplied: true,
    reason: "ELDERLY_COUPLE_EXCEPTION"
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Vị trí đặt bàn thờ
- **Q&A Huyền học:** Điều kiện tôn kính không gian Bồ Tát
- **Hướng dẫn thực hành:** Chọn vị trí đặt bàn thờ

---

## 🏷️ Tags
`#phase-36` `#altar-management` `#electromagnetic-guard` `#bedroom-age-gate` `#aura-collision`

# USE CASE: Altar Placement Spatial Taboo Guard
**Module:** `altar-management`, `identity`  
**Phase:** 40 - 15 Luật Vật Lý & Tâm Linh Cực Kỳ Vi Tế  
**Source:** Dharma Door Core Texts, Altar Placement Rules

---

## 📋 Tóm Tắt Nghiệp VỤ

**Bàn thờ có nhiều vị trí cấm: gần nhà vệ sinh, đối diện bếp, trong phòng vợ chồng, trên ban công, vật nổi.**

### 🚫 CẤM:
- Sát vách nhà vệ sinh
- Đối diện bếp
- Phòng ngủ vợ chồng (trừ người già)
- Ban công nhô ra ngoài
- Bàn/giá vật nổi lơ lửng

---

## 🎯 Acceptance Criteria

### AC1: Bathroom Wall Adjacency Check
**GIVEN** mark altar location  
**WHEN** check proximity to bathroom  
**THEN** 
- Block if too close:
  ```
  🚽 KIỂM TRA: VÁCH NHÀ VỆ SINH
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Vị trí bàn thờ: Phòng khách
  Khoảng cách: Sát vách (20cm)
  Phía sau vách: Nhà vệ sinh
  
  ❌ KHÔNG ĐƯỢC!
  
  Lý do CẤM:
  - Nhà vệ sinh là nơi bẩn nhất nhà
  - Năng lượng từ nhà vệ sinh ô uế
  - Phát tán qua vách → bàn thờ
  - Bồ Tát sẽ tức giận, rời đi
  - Gia đình sẽ gặp rắc rối
  
  ✅ PHẢI LÀM:
  ✓ Khoảng cách: Ít nhất 1-2 mét
  ✓ Hoặc đặt ở phòng khác
  ✓ Hoặc thay vách thành lối
  
  [Chọn Vị Trí Khác]
  ```

### AC2: Kitchen Facing Prohibition
**GIVEN** select location  
**WHEN** check kitchen orientation  
**THEN** 
- Block if directly facing:
  ```
  🍳 KIỂM TRA: ĐỐI DIỆN BẾP
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Vị trí bàn thờ: Phòng khách
  Hướng: Đối diện bếp (view)
  
  ❌ KHÔNG ĐƯỢC!
  
  Lý do CẤM:
  - Bếp là nơi công tác với thịt, máu
  - Năng lượng thịt rất ô uế
  - Đối diện bếp = nhìn vào cảnh giết thịt
  - Bồ Tát sẽ buồn, rời đi
  - Gia đình mất công đức
  
  ✅ PHẢI LÀM:
  ✓ Quay lưng vào bếp
  ✓ Đặt ở phòng khác
  ✓ Dùng bức rèm che bếp nếu cần
  
  [Chọn Hướng Khác]
  ```

### AC3: Bedroom Location Prohibition
**GIVEN** consider bedroom placement  
**WHEN** check bedroom rule  
**THEN** 
- Block with age-exception info:
  ```
  🛏️  KIỂM TRA: PHÒNG NGỦVỢ CHỒNG
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Bạn muốn đặt: Phòng ngủ của 
  bạn và vợ/chồng
  
  ❌ TUYỆTÙ ĐỐI CẤM!
  
  Lý do:
  - Phòng ngủ vợ chồng là nơi tình dục
  - Năng lượng tình dục rất ô uế
  - Bồ Tát không thích
  - Bàn thờ sẽ "tự động rơi vấn"
  
  ✅ NGOẠI LỆ:
  - Người già (60+) có thể đặt
  - Lý do: Không còn sống với vợ chồng 
    phong lưu
  - Nhưng vẫn nên tránh tốt hơn
  
  ✅ PHẢI LÀM:
  ✓ Phòng khách, phòng công, phòng riêng
  ✓ Nếu chỉ có phòng ngủ:
    - Cách giường 2m+
    - Hoặc ngăn bằng bức rèm vải
    - Hoặc để lên kệ cao (cách giường)
  
  [Chọn Phòng Khác]
  ```

### AC4: Balcony Overhang Prohibition
**GIVEN** consider balcony placement  
**WHEN** check overhang  
**THEN** 
- Block floating structures:
  ```
  🏢 KIỂM TRA: BAN CÔNG NHÔÙ RA
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Vị trí: Ban công của nhà
  Cấu trúc: Nhô ra ngoài không trung
  
  ❌ KHÔNG ĐƯỢC!
  
  Lý do:
  - Bàn thờ phải có móng chạm đất
  - Ban công nhô ra = không có nền
  - Năng lượng sẽ "lơ lửng"
  - Bồ Tát không ngự giá
  - Gia đình sẽ thiếu may mắn
  
  ✅ PHẢI LÀM:
  ✓ Đặt trên mặt đất tầng 1
  ✓ Hoặc phòng bên trong (không ban công)
  ✓ Cấu trúc phải có "nền" vững chắc
  
  [Chọn Vị Trí Có Nền]
  ```

### AC5: Furniture Footing Requirement
**GIVEN** select furniture for altar  
**WHEN** check base structure  
**THEN** 
- Enforce feet-on-ground:
  ```
  🪑 KIỂM TRA: CHÂN BÀN CHẠM ĐẤT
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Bàn thờ: Giá treo lơ lửng (dán tường)
  
  ❌ KHÔNG ĐƯỢC!
  
  Quy tắc:
  - Bàn thờ PHẢI có CHÂN
  - Chân PHẢI chạm đất
  - Không được treo / dán tường
  - Không được để trên bệ lơ lửng
  
  Lý do:
  - Chân chạm đất = kết nối với vũ trụ
  - Lơ lửng = mất kết nối
  - Bồ Tát không ngự
  - Năng lượng sẽ "rơi vào hỗn độn"
  
  ✅ PHẢI LÀM:
  ✓ Bàn gỗ / sứ với 4 chân
  ✓ Chân phải chạm sàn trực tiếp
  ✓ Không có vật ngoại lai nằm dưới
  ✓ Bề mặt sạch, chắc chắn
  
  [Chọn Bàn Có Chân]
  ```

### AC6: Location Audit Questionnaire
**GIVEN** before altar installation  
**WHEN** verify all conditions  
**THEN** 
- Show audit checklist:
  ```
  ✅ DANH SÁCH KIỂM TRA VỊ TRÍ
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ☐ Khoảng cách từ vách nhà vệ sinh: 1m+
  ☐ Không đối diện bếp (quay lưng/cạnh)
  ☐ Không phòng ngủ (trừ người 60+)
  ☐ Không ban công nhô ra ngoài
  ☐ Bàn thờ có chân chạm đất trực tiếp
  ☐ Vị trí sáng sủa, thoáng khí
  ☐ Không có tủ lạnh / máy giặt gần
  ☐ Không ở giữa đường đi lại
  
  Nếu TẤT CẢ đều ✓ → ĐƯỢC LẬP BÀN THỜ
  Nếu bất kỳ ☐ → CHỌN VỊ TRÍ KHÁC
  
  [Kiểm Tra Toàn Bộ]
  ```

### AC7: Audit Placement Compliance
**GIVEN** altar installed  
**WHEN** log location  
**THEN** 
- Record placement:
  ```typescript
  {
    altarPlacementId: <uuid>,
    userId: <uuid>,
    location: 'LIVING_ROOM' | 'BEDROOM' | 'BALCONY',
    furnitureType: 'TABLE_WITH_FEET' | 'FLOATING_SHELF',
    
    spatialCompliance: {
      bathroomWallDistance: 250, // cm
      facingKitchen: false,
      inMasterBedroom: false,
      onBalconyOverhang: false,
      furnitureHasFooting: true,
      contactWithGround: true
    },
    
    complianceScore: 100, // 0-100
    violations: [],
    timestamp: now()
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Dharma Door Texts - Altar Placement Taboos
- **Q&A Huyền học:** Tại sao những vị trí này bị cấm?
- **Hướng dẫn thực hành:** Chọn vị trí phù hợp

---

## 🏷️ Tags
`#phase-40` `#altar-placement` `#spatial-rules` `#taboo-guard` `#energy-compliance`

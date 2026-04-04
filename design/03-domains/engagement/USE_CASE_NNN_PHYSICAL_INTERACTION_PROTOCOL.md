# USE CASE: NNN Physical Interaction Protocol
**Module:** `engagement`, `little-house`  
**Phase:** 40 - 15 Luật Vật Lý & Tâm Linh Cực Kỳ Vi Tế  
**Source:** Dharma Door Core Texts, NNN Composition Rules

---

## 📋 Tóm Tắt Nghiệp VỤ

**Ngôi Nhà Nhỏ có quy tắc vô cùng cụ thể về cách viết, chấm đỏ, kẹp, và cất chứa.**

### ✅ QUYỀN HẠNÙ TRONG NNN:
- **Bút chấm:** Bút lông đỏ chính hãng
- **Chấm:** Đầy 80% vòng tròn (không tick, không X)
- **Kẹp:** Nhíp/đũa kẹp vào chữ "Kính Tặng"
- **Chứa tro:** Đĩa/chén sứ trắng (cấm kim loại)
- **Xử lý tro:** Bọc giấy → thùng rác (cấm toilet)

---

## 🎯 Acceptance Criteria

### AC1: Correct Writing Pen Type
**GIVEN** about to fill out NNN  
**WHEN** select pen  
**THEN** 
- Validate pen type:
  ```
  ✏️  CHỌN BÚT CHẤM ĐÚNG
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Loại bút được phép:
  ✅ Bút lông đỏ (red felt pen)
  ✅ Bút mực đỏ (red ink pen)
  
  ❌ CẤM:
  ✗ Bút chì
  ✗ Bút xanh / đen
  ✗ Bút bi
  ✗ Bút gel
  
  💡 Lý do: Chỉ màu đỏ (Mộc kỳ) 
     mới có năng lượng kết nối với 
     thiên giới.
  
  [Đã Có Bút Lông Đỏ]
  [Giúp Tôi Mua]
  ```

### AC2: Fill Percentage Enforcement
**GIVEN** chấm đỏ vòng tròn  
**WHEN** fill percentage < 80%  
**THEN** 
- Show warning:
  ```
  ⚠️  CHẤM ĐỦMÙ 80% VÒNG TRÒN
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Tiến độ: ▓▓▓▓▓▓▓░░░ (70%)
  
  ❌ CHƯA ĐỦ!
  
  Quy tắc:
  ✓ Chấm đầy 80-100% vòng tròn
  ✓ Chấm từ lề ngoài vào giữa
  ✓ Để lại khoảng trắng nhỏ là được
  
  ❌ KHÔNG ĐƯỢC:
  ✗ Chấm kiểu tick (✓)
  ✗ Chấm kiểu dấu X (✕)
  ✗ Chấm lẻ lếch
  ✗ Chấm ra ngoài viền vòng tròn
  
  Lý do: Hình dáng vòng tròn đầy đặn 
  tượng trưng quá khứ và hiện tại 
  bị xóa sạch.
  
  Tiếp tục chấm...
  
  [Hoàn Tất 80%+]
  ```

### AC3: Mark Shape Validation
**GIVEN** chấm xong  
**WHEN** verify mark  
**THEN** 
- Reject invalid shapes:
  ```
  ❌ HÌNH DÁNG SAI
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Hệ thống phát hiện:
  - Bạn chấm kiểu TICK (✓)
  - Hoặc chấm kiểu X (✕)
  - Hoặc chấm lẻ lếch
  
  ❌ KHÔNG ĐƯỢC PHÉP!
  
  Phải chấm lại bằng hình dáng đúng:
  - Vòng tròn đầy đặn (●)
  - Hoặc chấm kín vòng tròn (●●●)
  
  Tờ NNN này sẽ bị:
  ⚠️  Đánh dấu SAI (không dùng được)
  
  [Viết NNN Mới]
  [Hủy]
  ```

### AC4: Container Material Validation
**GIVEN** before burning NNN  
**WHEN** select ash container  
**THEN** 
- Block metal containers:
  ```
  ⛔ CẤM KỴ: CHỨA KIM LOẠI
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Bạn chọn: Bát kim loại (Metal bowl)
  
  🚫 TUYỆTÙ ĐỐI CẤM!
  
  Vật chứa tro sớ (Ash container):
  
  ✅ ĐƯỢC PHÉP:
  ✓ Đĩa sứ trắng
  ✓ Chén sứ trắng
  ✓ Bát gốm
  ✓ Bộ cúng sứ truyền thống
  
  ❌ TUYỆTÙ ĐỐI CẤM:
  ✗ Kim loại (nhôm, thép, inox)
  ✗ Bộ Kim loại Vàng/Bạc
  ✗ Thủy tinh có cạnh sắc
  ✗ Nhựa (cấm vì sợ cháy)
  
  Lý do: Kim loại chặn năng lượng 
  linh thiêng. Sứ trắng dẫn năng lượng 
  tốt nhất.
  
  [Chọn Đĩa Sứ Trắng]
  [Hủy Đốt]
  ```

### AC5: Tool Selection - Tweezers/Chopsticks Allowed
**GIVEN** about to handle NNN while burning  
**WHEN** select tool  
**THEN** 
- Allow metal tweezers/chopsticks ONLY:
  ```
  ✅ CHỌN DỤNG CỤ KẸP
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Khi đốt NNN, phải dùng dụng cụ để 
  kẹp giấy:
  
  ✅ ĐƯỢC PHÉP:
  ✓ Nhíp kim loại (Tweezers) - TỐTÙ NHẤT
  ✓ Đũa kim loại
  ✓ Kìm gỗ với miếng da
  
  ❌ CẤM:
  ✗ Tay trần (cấm cầm NNN bare hands)
  ✗ Tay cầm gần các chấm đỏ
  
  💡 CẬP KỴ:
  - Kẹp CHÍNH XÁC vào chữ "Kính Tặng"
  - KHÔNG kẹp vào các chấm đỏ 
    (nếu không, người cần kinh sẽ 
    bị đau chân/chân nhục)
  
  [Chọn Nhíp Kim Loại]
  [Chọn Đũa]
  ```

### AC6: Ash Disposal Protocol
**GIVEN** NNN burned, ash remains  
**WHEN** dispose ash  
**THEN** 
- Show correct disposal:
  ```
  🗑️  XỬ LÝ TRO SỚ - ĐÚNG CÁCH
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Bước 1: Bọc tro
  - Lấy khăn giấy mềm
  - Nhẹ nhàng gót tro vào giấy
  - Bọc gọn, không để rơi rác
  
  Bước 2: Cất giữ
  ✅ ĐƯỢC PHÉP:
  ✓ Bỏ vào thùng rác sinh hoạt
  ✓ Chôn trong đất vườn (lạc quan)
  ✓ Thả vào sông (nếu có sông gần)
  
  ❌ TUYỆTÙ ĐỐI CẤM:
  ✗ XẢ TRO VÀO BỒN CẦU
  ✗ Để tro bay quanh nhà
  ✗ Để tro trên bàn thờ quá lâu (max 1 ngày)
  
  Lý do xả toilet bị cấm:
  - Toilet là nơi bẩn nhất nhà
  - Xả tro vào = tôn không lúc
  - Sẽ gây vận đen cho gia đình
  
  [Bọc & Vứt Đi]
  ```

### AC7: Audit Physical Interaction
**GIVEN** NNN burn complete  
**WHEN** log session  
**THEN** 
- Track compliance:
  ```typescript
  {
    nnnBurnSessionId: <uuid>,
    userId: <uuid>,
    penType: 'RED_FELT' | 'RED_INK' | 'INVALID',
    fillPercentage: 85, // 0-100
    markShape: 'CIRCLE' | 'TICK' | 'X' | 'INVALID',
    containerMaterial: 'PORCELAIN' | 'CERAMIC' | 'METAL' | 'INVALID',
    toolUsed: 'TWEEZERS' | 'CHOPSTICKS' | 'BARE_HAND' | 'INVALID',
    ashDisposal: 'TRASH' | 'BURIED' | 'RIVER' | 'TOILET' | 'UNKNOWN',
    complianceScore: 95, // 0-100
    violations: ['METAL_CONTAINER'],
    timestamp: now()
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Dharma Door Texts - NNN Physical Rules
- **Q&A Huyền học:** Tại sao vòng tròn, không tick?
- **Hướng dẫn thực hành:** Chi tiết từng bước vật lý

---

## 🏷️ Tags
`#phase-40` `#nnn-physical-rules` `#material-guard` `#disposal-protocol` `#compliance`

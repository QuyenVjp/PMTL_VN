# USE CASE: Fruit Offering Mathematics & Material Rules
**Module:** `vows-merit`, `altar-management`  
**Phase:** 40 - 15 Luật Vật Lý & Tâm Linh Cực Kỳ Vi Tế  
**Source:** Dharma Door Core Texts, Fruit Offering Protocol

---

## 📋 Tóm Tắt Nghiệp VỤ

**Trái cây dâng lên bàn thờ có quy tắc: cấm chuối/đào, số lẻ, 1 loại/đĩa, thay hết.**

### ✅ QUY TẮC:
- **Cấm:** Chuối, đào (tinh gảo vong linh)
- **Số lượng:** Lẻ (1, 3, 5...)
- **Loại:** 1 loại trên 1 đĩa
- **Thay:** Hỏng → thay toàn bộ (cấm nhặt)

---

## 🎯 Acceptance Criteria

### AC1: Fruit Type Validation
**GIVEN** select fruit for offering  
**WHEN** validate type  
**THEN** 
- Block forbidden fruits:
  ```
  🍌 KIỂM TRA: LOẠI TRÁI CÂY
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Loại trái cây bạn chọn: ChuốI
  
  ❌ TUYỆTÙ ĐỐI CẤM!
  
  Loại quả bị cấm:
  ❌ Chuối (tên Việt = Chuối)
  ❌ Đào (tên Việt = Đào)
  
  Lý do CẤM:
  - Chuối: "Chuối" tương đồng âm với 
    "Tinh" (tinh quái, vong linh)
  - Đào: Vốn được để trong mộ phần
  - Đặt trên bàn thờ Phật sẽ kêu gọi 
    vong linh, linh quái đến bám
  
  ✅ ĐƯỢC PHÉP:
  ✓ Táo, cam, quýt, dâu tây
  ✓ Xoài, ổi, mít, nhãn
  ✓ Nho, lê, mận, cóc
  ✓ Hầu hết loại quả khác
  
  [Chọn Loại Quả Khác]
  ```

### AC2: Quantity Odd Number Enforcement
**GIVEN** select quantity  
**WHEN** set count  
**THEN** 
- Block even numbers:
  ```
  🔢 SỐ LƯỢNG: PHẢ LỀ
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Số lượng trái cây:
  ❌ SAI: 2, 4, 6, 8...
  ✅ ĐÚNG: 1, 3, 5, 7, 9...
  
  Bạn nhập: 6 quả
  ❌ KHÔNG ĐƯỢC!
  
  Lý do:
  - Số chẵn = ngoại cảnh (tang lễ)
  - Số lẻ = may mắn, tôn trọng
  - Bàn thờ chỉ nhận số lẻ
  
  ✅ PHẢI LÀM:
  ✓ 1 quả, 3 quả, 5 quả, 7 quả...
  
  [Điều Chỉnh Thành Số Lẻ]
  ```

### AC3: Single Fruit Type per Plate
**GIVEN** filling plate  
**WHEN** add multiple types  
**THEN** 
- Block mixing:
  ```
  🍎 LOẠI: MỘT LOẠI MỖI ĐĨA
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Bạn chuẩn bị:
  Đĩa 1: Táo (3 quả)
  Đĩa 2: Cam + Quýt + Dâu tây (mix)
  
  ❌ ĐĨA 2 SAI!
  
  Quy tắc:
  - TUYỆTÙ ĐỐI 1 loại/đĩa
  - Không được trộn
  - Mỗi loại quả riêng một đĩa
  
  Lý do:
  - Mỗi loại quả có năng lượng riêng
  - Trộn lẫn sẽ gây lộn xộn
  - Bồ Tát không thích năng lượng 
    trộn lẫn
  
  ✅ PHẢI LÀM:
  Đĩa 1: Táo (3 quả)
  Đĩa 2: Cam (3 quả)
  Đĩa 3: Quýt (3 quả)
  Đĩa 4: Dâu tây (3 quả)
  
  [Tách Rời Từng Loại]
  ```

### AC4: Layering with Odd Quantities
**GIVEN** display fruit arrangement  
**WHEN** stack layers  
**THEN** 
- Guide odd-number layering:
  ```
  📚 XẾP CHỒNG: SỐ LẺ MỖI TẦNG
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Mỗi TẦNG trên đĩa phải là số lẻ:
  
  ❌ SAI:
  Tầng 1 (dưới): 2 quả
  Tầng 2 (trên): 4 quả
  (Cả hai là số chẵn)
  
  ✅ ĐÚNG:
  Tầng 1 (dưới): 3 quả (lẻ)
  Tầng 2 (trên): 1 quả (lẻ)
  (Cả hai là số lẻ)
  
  Lý do:
  - Từ dưới lên trên = xây nhà
  - Mỗi tầng lẻ = công đức vững chắc
  - Không có hạn hẫn
  
  [Sắp Xếp Đúng]
  ```

### AC5: Decay Monitoring & Full Replacement
**GIVEN** fruit showing decay  
**WHEN** detect rot  
**THEN** 
- Block partial replacement:
  ```
  🍎 THAY ĐỎI: CẤM NHẶT
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Phát hiện: 1/3 quả cam bị hỏng.
  
  ❌ TUYỆTÙ ĐỐI CẤM:
  ✗ Nhặt quả hỏng ra
  ✗ Chêm quả tươi vào chỗ trống
  
  Lý do CẤM:
  - Đĩa là toàn thể (entity)
  - Nếu có 1 quả hỏng = đĩa bị mực
  - Nhặt ra rồi chêm vào = "vá víu"
  - Bồ Tát sẽ tức giận
  
  ✅ PHẢI LÀM:
  ✓ Gỡ toàn bộ 3 quả cam
  ✓ Vứt hết đi
  ✓ Thay bằng 3 quả cam mới tươi
  ✓ Sắp xếp lại đĩa
  
  Nếu không kịp thay:
  ✓ Để đĩa trống (tốt hơn) 
    thay vì để quả hỏng
  
  [Thay Toàn Bộ Đĩa]
  ```

### AC6: Empty Plate is Preferred
**GIVEN** no replacement fruit available  
**WHEN** decide what to do  
**THEN** 
- Show alternative:
  ```
  🍽️  NẾU KHÔNG KỊP THAY
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Tình huống:
  - Quả cam trên bàn thờ bị hỏng
  - Không có quả cam tươi để thay
  
  Lựa chọn:
  
  ❌ SAI: Để quả hỏng trên bàn
  - Tôn không lúc Bồ Tát
  - Gây rắc rối cho gia đình
  
  ✅ ĐÚNG: Gỡ hết, để đĩa trống
  - Đĩa trống vẫn là tôn trọng
  - Bồ Tát sẽ chấp nhận
  - Lần sau thay quả tươi
  
  💡 Ngôn ngữ Dharma:
  "Thà để đĩa không còn, tuyệt đối 
  không dâng đồ đã hỏng lên Phật!"
  
  [Gỡ Sạch - Để Đĩa Trống]
  ```

### AC7: Audit Fruit Offering
**GIVEN** display configured  
**WHEN** log setup  
**THEN** 
- Record compliance:
  ```typescript
  {
    fruitOfferingId: <uuid>,
    userId: <uuid>,
    plateSetup: [
      { 
        plateIndex: 1, 
        fruitType: 'APPLE',
        quantity: 3, // must be odd
        layers: [
          { position: 'BOTTOM', count: 2, parity: 'EVEN' },
          { position: 'TOP', count: 1, parity: 'ODD' }
        ],
        singleTypeCompliance: true,
        noForbiddenFruits: true,
        status: 'VALID'
      }
    ],
    complianceScore: 100,
    timestamp: now()
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Dharma Door Texts - Fruit Offering Rules
- **Q&A Huyền học:** Tại sao cấm chuối/đào?
- **Hướng dẫn thực hành:** Xếp chồng và bảo quản trái cây

---

## 🏷️ Tags
`#phase-40` `#fruit-offerings` `#mathematics` `#material-rules` `#altar-compliance`

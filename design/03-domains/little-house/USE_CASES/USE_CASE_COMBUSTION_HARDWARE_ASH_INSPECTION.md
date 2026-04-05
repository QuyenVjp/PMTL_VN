# USE CASE: Combustion Hardware & Ash Inspection Guard
**Module:** `little-house`, `engagement`  
**Phase:** 33 - Kiểm Soát Nhân Quả Chuyên Sâu & Ràng Buộc Pháp Bảo Vật Lý  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

Khi **hóa (đốt) Ngôi Nhà Nhỏ**:

### ⚠️ QUY TẮC TUYỆT ĐỐI:
1. ❌ **KHÔNG được** dùng tay không cầm giấy
2. ✅ **PHẢI dùng nhíp hoặc đũa** (kim loại cũng được)
3. ✅ Kẹp tại vị trí chữ **"Kính Tặng"** KHÔNG kẹp các **chấm đỏ**
4. ✅ **Giấy phải cháy 100%**, không được để sót lại mảnh giấy vụn chưa cháy

### Lý Do:
- Tay trần → Linh giới sẽ "nhầm" là do người còn sống
- Kẹp chấm đỏ → Hủy hoại "tín hiệu linh" của Kinh
- Giấy không cháy 100% → Công đức "mất một phần"

---

## 🎯 Acceptance Criteria

### AC1: Pre-Combustion Safety Checklist
**GIVEN** user bấm nút "Xác Nhận Đã Đốt"  
**WHEN** modal mở  
**THEN** 
- Hiển thị **2 Checkbox bắt buộc** (Hard-stop):
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔥 KIỂM TRA VỆ SINH TRƯỚC KHI HÓA
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ⚠️  Bạn sắp xác nhận đã đốt Ngôi Nhà Nhỏ.
  
  Vui lòng xác nhận rằng bạn tuân thủ 
  quy tắc vật lý:
  
  ☐ Tôi đã dùng nhíp/kẹp để gắp, 
    KHÔNG dùng tay trần,
    và KHÔNG kẹp vào các chấm đỏ
  
  ☐ Tôi xác nhận toàn bộ Ngôi Nhà Nhỏ 
    đã cháy thành tro 100%, 
    KHÔNG còn sót lại mảnh giấy nào 
    chưa cháy
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  [Hủy]  [Xác Nhận - Đã Tuân Thủ]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC2: Both Checkboxes Required
**GIVEN** user chưa tick đủ 2 checkbox  
**WHEN** họ bấm "Xác Nhận"  
**THEN** 
- Nút bị disabled (xám)
- Hiển thị: *"Bắt buộc phải xác nhận cả 2 điều kiện"*

### AC3: API Safety Guard
**GIVEN** client cố bypass frontend  
**WHEN** send request với missing check  
**THEN** 
- Backend trả về `400 Bad Request`:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "Bắt buộc phải xác nhận tuân thủ quy tắc vật lý trước khi hóa",
    "code": "COMBUSTION_SAFETY_NOT_CONFIRMED",
    "requiredConfirmations": 2,
    "currentConfirmations": 0
  }
  ```

### AC4: Audit Trail For Hardware Compliance
**GIVEN** user confirm  
**WHEN** transaction saved  
**THEN** 
- Ghi audit:
  ```typescript
  {
    eventType: "LITTLE_HOUSE_COMBUSTION",
    littleHouseId: <uuid>,
    userConfirmedHardwareSafety: true,
    toolUsed: "TONGS_OR_METAL", // inferred from confirmation
    ashInspectionConfirmed: true,
    timestamp: <timestamp>
  }
  ```

### AC5: Educational Inline Text
**GIVEN** modal shows  
**WHEN** user reads checkboxes  
**THEN** 
- Include explanatory text:
  ```
  ℹ️  TẠI SAO CÓ QUY TẮC VẬT LÝ?
  
  🔥 TUYỆT ĐỐI KHÔNG dùng tay trần:
  → Linh giới sẽ "nhầm" là người còn sống
  → Giáng xuống tai nạn trên thân
  
  🔥 PHẢI dùng nhíp/kẹp:
  → Kẹp chỉ ở chữ "Kính Tặng"
  → KHÔNG kẹp vào chấm đỏ
  → Chấm đỏ là "tín hiệu linh"
  
  🔥 Giấy PHẢI cháy 100%:
  → Giấy chưa cháy = công đức "mất"
  → Phải kiểm tra tro, không sót giấy vụn
  ```

---

## 🔧 Technical Notes

### Zod Validation
```typescript
// Location: apps/api/src/little-house/dto/confirm-combustion.dto.ts

export const ConfirmCombustionDto = z.object({
  littleHouseId: z.string().cuid(),
  confirmedNoBareTouching: z.boolean().refine(
    (val) => val === true,
    { message: "Bắt buộc xác nhận không dùng tay trần" }
  ),
  confirmedFullyCombust: z.boolean().refine(
    (val) => val === true,
    { message: "Bắt buộc xác nhận giấy cháy 100%" }
  )
}).strict();
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Quy tắc hóa Ngôi Nhà Nhỏ
- **Q&A Huyền học:** Tầm quan trọng của quy tắc vật lý
- **Hướng dẫn thực hành:** Cách hóa đúng

---

## 🏷️ Tags
`#phase-33` `#little-house` `#combustion-safety` `#hardware-guard` `#ash-inspection`

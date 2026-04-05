# USE CASE: Form Disposal Polarity Engine
**Module:** `sacred-forms`, `engagement`  
**Phase:** 36 - Tầng Định Luật Vật Lý Lượng Tử & Quản Trị Trạng Thái Pháp Bảo  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

**Hai loại Đơn Từ Tâm Linh** → **Hoàn toàn ngược chiều** trong xử lý:

### 🔥 ĐƠNTHĂNG VĂN ĐỔI TÊN (Name Change Application):
- **BẮT BUỘC ĐỐT** (Burn)
- Đốt vào ngày nắng, lúc 6am/8am/4pm

### 📝 ĐƠN KHUYẾN ĐẠO NGƯỜI NHÀ (Convincing Family Form):
- **TUYỆT ĐỐI CẤM ĐỐT** (Do not burn)
- Để trên bàn thờ 1-2 tháng (trong lúc nhang cháy)
- Sau đó bọc phong bì vứt đi

### ⚠️ LÝ DO:
Nếu sai: 
- Đốt đơn Khuyến Đạo → Vong linh sẽ "thoát"
- Không đốt đơn Đổi Tên → Tên không được ghi vào Sổ Nam Tào

---

## 🎯 Acceptance Criteria

### AC1: Form Type Enum
**GIVEN** create sacred form  
**WHEN** select type  
**THEN** 
- Define enum:
  ```typescript
  enum FormType {
    NAME_CHANGE = "NAME_CHANGE",           // MUST BURN
    CONVINCING_FAMILY = "CONVINCING_FAMILY" // MUST NOT BURN
  }
  ```

### AC2: Name Change Form - Burn Button
**GIVEN** `FormType = NAME_CHANGE`  
**WHEN** reach completion stage  
**THEN** 
- Display burn workflow:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔥 ĐƠNTHĂNG VĂN ĐỔI TÊN
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  📋 Đơn của bạn đã hoàn thành.
  
  ✅ BƯỚC TIẾP THEO: ĐỐT ĐƠN
  
  Vui lòng đốt đơn này vào:
  📅 Ngày trời nắng
  🕐 Lúc: 6am, 8am hoặc 4pm
  
  Sau khi đốt, xác nhận ở đây:
  
  [Xác Nhận Đã Đốt]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC3: Convincing Family - Watermark & Hide Burn
**GIVEN** `FormType = CONVINCING_FAMILY`  
**WHEN** generate PDF  
**THEN** 
1. **Add watermark**:
   ```
   🚫 CẤM ĐỐT ĐƠN NÀY 🚫
   (Diagonal, subtle watermark on PDF)
   ```

2. **Hide burn option** entirely:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📋 ĐƠN KHUYẾN ĐẠO NGƯỜI NHÀ
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   Đơn của bạn đã hoàn thành.
   
   📌 HƯỚNG DẪN CÁCH HÀNH:
   
   1. Để đơn trên bàn thờ
   2. Nhang cháy trong 1-2 tháng liên tục
   3. SAU ĐÓ: Bọc phong bì + vứt đi
   
   🚫 TUYỆT ĐỐI CẤM ĐỐT
   (Vong linh sẽ thoát nếu bạn đốt)
   
   [Đã Bọc Phong Bì Cất Đi]
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

### AC4: PDF Watermark Implementation
**GIVEN** render PDF  
**WHEN** check form type  
**THEN** 
- Inject watermark logic:
  ```typescript
  if (formType === 'CONVINCING_FAMILY') {
    pdf.addWatermark({
      text: 'CẤM ĐỐT ĐƠN NÀY',
      opacity: 0.2,
      angle: 45,
      repeat: true
    });
  }
  ```

### AC5: Completion Status Differences
**GIVEN** form ready for completion  
**WHEN** render options  
**THEN** 
- Name Change:
  ```
  [Xác Nhận Đã Đốt]  [Tải PDF]
  ```
  
- Convincing Family:
  ```
  [Đã Bọc Phong Bì & Vứt]  [Tải PDF]
  ```

### AC6: Audit Trail - Disposal Method
**GIVEN** form marked complete  
**WHEN** save  
**THEN** 
- Record disposal:
  ```typescript
  {
    formId: <uuid>,
    formType: "NAME_CHANGE",
    disposalMethod: "BURNED",
    burnedAt: <timestamp>,
    burnWeather: "SUNNY",
    burnTime: "06:00"
  }
  
  // OR for Convincing Family:
  {
    formId: <uuid>,
    formType: "CONVINCING_FAMILY",
    disposalMethod: "WRAPPED_AND_DISCARDED",
    discardedAt: <timestamp>,
    storageDays: 60
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Cách xử lý Đơn Từ
- **Q&A Huyền học:** Polarity ngược chiều giữa 2 loại đơn
- **Hướng dẫn thực hành:** Vứt/Đốt đơn đúng cách

---

## 🏷️ Tags
`#phase-36` `#sacred-forms` `#disposal-polarity` `#form-routing` `#dharma-protocol`

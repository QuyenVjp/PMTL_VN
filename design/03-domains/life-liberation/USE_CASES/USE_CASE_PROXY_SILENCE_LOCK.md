# USE CASE: Proxy Life Liberation Silence Lock
**Module:** `life-liberation`, `engagement`  
**Phase:** 34 - Tầng Kiểm Soát Vật Lý & Chống Trục Lợi Pháp Bảo  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

Khi dùng **tiền của bạn** mua cá để **phóng sinh cho người nhà**:

### 🙏 BƯỚC CẦN:
1. Khấn chuyển giao số tiền → trở thành "của họ"
2. Ra đến hồ thả cá
3. **TUYỆT ĐỐI CẤM nhắc đến tên bạn** hoặc nghĩ đến bạn
4. **Chỉ được phép đọc tên người nhà**

### ⚠️ TẠI SAO?
Nếu nhắc tên bạn → công đức bị chia ngược lại cho bạn → Người nhà không nhận được trọn vẹn

---

## 🎯 Acceptance Criteria

### AC1: Proxy Mode Selection
**GIVEN** user create life liberation task  
**WHEN** choose recipient  
**THEN** 
- Ask: *"Tiền dùng để phóng sinh này là của ai?"*
  ```
  ○ Của tôi (tôi sẽ làm)
  ○ Của tôi nhưng phóng sinh thay cho [Tên người nhà]
  ```

### AC2: Pre-Release Commitment
**GIVEN** user select "Proxy Mode"  
**WHEN** confirm  
**THEN** 
- Bung commitment modal:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🙏 KHẤN CHUYỂN GIAO TIỀN
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Vì đây là Phóng Sinh Thay, bạn phải 
  khấn chuyển giao số tiền này cho họ.
  
  Vui lòng đọc to lời sau trước tượng:
  
  "Xin Nam Mô Đại Từ Đại Bi Quán Thế Âm 
  Bồ Tát từ bi, con xin chuyển giao toàn bộ 
  công đức và tiền bạc của con cho 
  [Tên Người Nhà] để phóng sinh cứu độ 
  chúng sanh, từ nay số tiền này 
  thuộc về [Tên Người Nhà]."
  
  ☐ Đã đọc to lời khấn
  
  [Tiếp Tục - Bắt Đầu Thả Cá]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC3: Release Location Lock
**GIVEN** user confirm prayer  
**WHEN** ready for release  
**THEN** 
- Ask for GPS:
  ```
  📍 XÁC NHẬN VỊ TRÍ PHÓNG SINH
  
  Bạn đang ở tại: [GPS Location]
  [Sông / Hồ / Đầm]
  
  Xác nhận đây là nơi thả cá?
  
  [Hủy]  [Xác Nhận]
  ```

### AC4: Silence Enforcer - Hide User Name
**GIVEN** user arrive at release location  
**WHEN** GPS confirmed  
**THEN** 
- AUTO-HIDE user name on screen:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🐟 PHÓNG SINH THAY
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  🔴 TUYỆT ĐỐI KHÔNG NHẮC ĐẾN TÊN CỦA BẠN!
  
  Người Nhân: [TÊN CỰC TO - CHỈNH HƯỚNG CÁ]
  
  [CẤM KỴ - Chỉ đọc tên ở trên]
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC5: Microphone Optional Warning
**GIVEN** if mic access available  
**WHEN** during release  
**THEN** 
- OPTIONAL: Monitor for mention of user's name
- If detected:
  ```
  ⚠️  CẢNH BÁO!
  
  Hệ thống phát hiện bạn nhắc đến tên của mình.
  
  Công đức sẽ bị chia ngược lại cho bạn.
  Người nhà sẽ KHÔNG nhận được công đức toàn vẹn.
  
  ❌ LẠI HẾT: Chỉ được đọc tên [Người Nhân]!
  ```

### AC6: Completion Confirmation
**GIVEN** user confirm release complete  
**WHEN** all fish released  
**THEN** 
- Show success:
  ```
  ✅ PHÓNG SINH THAY ĐÃ HOÀN THÀNH
  
  🎉 Công đức:
  - Toàn bộ thuộc về: [Tên Người Nhà]
  - Bồ Tát chứng minh
  - Không bị chia cho bạn
  
  🙏 Lưu Ý: Duy trì im lặng tuyệt đối 
  về tên của bạn trong suốt quá trình.
  
  [Hoàn Thành]
  ```

---

## 🔧 Technical Notes

### Silence Lock State
```typescript
// Location: apps/mobile/src/features/life-liberation/components/ProxyReleaseSilenceLock.tsx

export function ProxyReleaseSilenceLock({ userId, targetPersonName }) {
  return (
    <Container>
      {/* Hide user name completely */}
      <HiddenName>{userId}</HiddenName>
      
      {/* Display target person prominently */}
      <TargetPersonName size="xl" color="red">
        {targetPersonName.toUpperCase()}
      </TargetPersonName>
      
      {/* Warning banner */}
      <WarningBanner>
        CẤM NHẮC ĐẾN TÊN CỦA BẠN - CÔ ĐỤC CƯỜ CÔNG ĐỨC
      </WarningBanner>
    </Container>
  );
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Phóng sinh thay
- **Q&A Huyền học:** Tầm quan trọng của im lặng
- **Hướng dẫn thực hành:** Cách phóng sinh thay cho người nhân

---

## 🏷️ Tags
`#phase-34` `#life-liberation` `#proxy-release` `#silence-lock` `#merit-transfer`

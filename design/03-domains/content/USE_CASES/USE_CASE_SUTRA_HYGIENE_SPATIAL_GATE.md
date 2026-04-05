# USE CASE: Sutra Hygiene & Spatial Boundaries Gate
**Module:** `content`, `engagement`  
**Phase:** 34 - Tầng Kiểm Soát Vật Lý & Chống Trục Lợi Pháp Bảo  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

Sách Kinh là **Pháp bảo tuyệt đối**, không thể tối nhẹ các quy tắc vật lý:

### ❌ TUYỆT ĐỐI KHÔNG:
- Mang Kinh vào nhà vệ sinh
- Đặt dưới eo / kẹp dưới nách
- Đặt trên giường vợ chồng
- Úp ngược mặt Kinh tạo hình chữ "Nhân" (人)

### ✅ TRƯỚC KHI ĐỌC:
- Rửa tay sạch sẽ
- Cầm cao hơn thắt lưng

---

## 🎯 Acceptance Criteria

### AC1: Hand Washing & Location Verification
**GIVEN** user mở E-Reader để đọc Kinh  
**WHEN** trigger modal  
**THEN** 
- Hiển thị Modal toàn màn hình:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🙏 CHUẨN BỊ PHÁP BẢO
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Trước khi đọc Kinh, bạn phải:
  
  ☐ Rửa tay sạch sẽ
  ☐ KHÔNG ở trong nhà vệ sinh hoặc phòng tắm
  ☐ Cầm điện thoại cao hơn thắt lưng
  
  Tôi xác nhận đã tuân thủ các quy tắc trên.
  
  [Hủy]  [Đồng Ý - Mở Kinh]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC2: Hard-Stop If Not Confirmed
**GIVEN** user chưa tick checkbox  
**WHEN** họ bấm "Mở Kinh"  
**THEN** 
- Nút bị disabled
- Error: *"Bắt buộc phải xác nhận để bảo vệ Pháp bảo"*

### AC3: DeviceOrientation Detection (Mobile)
**GIVEN** user đang đọc Kinh trên mobile  
**WHEN** điện thoại bị lật úp ngược (face-down)  
**THEN** 
1. Detect via `DeviceOrientationEvent`:
   ```typescript
   if (beta > 135) { // Face-down threshold
     // Blur content + Alert
   }
   ```
2. Auto-blur nội dung Kinh
3. Alert xuất hiện:
   ```
   ⚠️  CẢNH BÁO
   
   Pháp bảo vô giá - CẤM úp mặt Kinh xuống!
   
   Khi cần tạm dừng, hãy dùng tính năng 
   Đánh Dấu (Bookmark) để lưu vị trí.
   
   Lật điện thoại lên để tiếp tục đọc.
   ```

### AC4: Bookmark Auto-Save On Flip
**GIVEN** user úp máy xuống  
**WHEN** detect face-down  
**THEN** 
- Auto-save current position:
  ```typescript
  {
    sutraName: "Tâm Kinh",
    currentPage: 42,
    currentLine: 15,
    savedAt: now(),
    resumePoint: "Địa Chỉ"
  }
  ```

### AC5: Session Persistence
**GIVEN** user close app khi đang đọc  
**WHEN** reopen app  
**THEN** 
- Restore position:
  ```
  📚 TIẾP TỤC ĐỌC
  
  Tâm Kinh - Trang 42, dòng 15
  
  [Tiếp Tục Đọc]  [Đọc Từ Đầu]
  ```

---

## 🔧 Technical Notes

### DeviceOrientation API
```typescript
// Location: apps/web/src/features/content/hooks/useSutraHygieneGate.ts

export function useSutraHygieneGate() {
  const [isFaceDown, setIsFaceDown] = useState(false);
  
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { beta } = event;
      if (beta && beta > 135) {
        setIsFaceDown(true);
        blurContent();
        showAlert();
      } else {
        setIsFaceDown(false);
        unblurContent();
      }
    };
    
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Tôn kính Pháp bảo
- **Q&A Huyền học:** Các quy tắc vật lý khi đọc Kinh
- **Hướng dẫn thực hành:** Vệ sinh sinh học trước khi tiếp xúc Pháp bảo

---

## 🏷️ Tags
`#phase-34` `#content` `#hygiene-gate` `#spatial-boundaries` `#dharma-respect`

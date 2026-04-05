# USE CASE: Red Dot Foundation Builder - Geometric Algorithm
**Module:** `little-house`, `engagement`  
**Phase:** 34 - Tầng Kiểm Soát Vật Lý & Chống Trục Lợi Pháp Bảo  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

Khi **chấm đỏ** lên Tiểu Phương Tử:

### ✅ QUY TẮC:
- **Phải dùng bút lông đỏ** (không bút bi)
- **Chấm từ dưới đáy lên trên** (Bottom-to-Top, như xây nền móng)
- **Điền ~80%** vòng tròn (KHÔNG tô kín 100%)
- **Không đánh dấu tick/X**, không chấm lẹm ra ngoài viền

### ⚠️ TẠI SAO?
Cách chấm = biểu tượng của việc xây dựng công đức từ dưới lên trên.

---

## 🎯 Acceptance Criteria

### AC1: Animation Guide - Bottom-to-Top
**GIVEN** user open "Chấm Đỏ" guide  
**WHEN** trigger tutorial  
**THEN** 
- Display animated instruction:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔴 HƯỚNG DẪN CHẤM ĐỎ (Geometric)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  [Animation: Vòng tròn trống]
  
  BƯỚC 1: Bắt đầu TỪ DƯỚI ĐÁYÙ
  [Animation: Bút chấm từ bottom → top]
  
  BƯỚC 2: Tiến dần LÊN TRÊN (Nền Móng)
  [Animation: Filling 80% gradually]
  
  BƯỚC 3: Dừng khi khoảng 80% (KHÔNG tô kín)
  [Animation: Final result - 80% filled]
  
  ❌ TUYỆT ĐỐI KHÔNG:
  - Tô kín 100%
  - Gạch chéo hoặc đánh dấu X
  - Chấm lẹm ra ngoài viền
  
  ✅ ĐỦ TIÊU CHUAN khi: 80% đỏ, 20% trắng
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC2: Red Pen Verification Checkbox
**GIVEN** user acknowledge guide  
**WHEN** confirm understanding  
**THEN** 
- Require confirmation:
  ```
  ☐ Tôi cam kết:
  
  ✓ Dùng bút lông ĐỎ (không bút bi)
  ✓ Chấm từ DƯỚI LÊN TRÊN
  ✓ Điền khoảng 80% (không tô kín)
  ✓ KHÔNG gạch chéo hay tick
  ✓ KHÔNG chấm lẹm ra ngoài viền
  
  [Hiểu Rồi - Tiếp Tục]
  ```

### AC3: Physical Demo Reference
**GIVEN** user want to see example  
**WHEN** click "[Xem Ví Dụ]"  
**THEN** 
- Show reference image/video:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📷 VÍ DỤ CHẤM ĐỐ ĐÚNG
  
  [Image: 3 examples]
  
  ✅ Chấm Đúng      ❌ Chấm Sai      ❌ Chấm Sai
  80% đỏ            Tô kín 100%    Gạch chéo
  (Bottom-to-top)   (Không đúng)    (Không đúng)
  
  Khi chấm lên Tiểu Phương Tử hãy 
  tuân theo hình ví dụ bên trái.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC4: Digital Spot Tracker (Optional)
**GIVEN** app support digital marking  
**WHEN** user use stylus/touch  
**THEN** 
- Provide guided drawing canvas:
  ```
  [Canvas: Vòng tròn trắng trên nền]
  
  Hướng dẫn:
  1. Bắt đầu từ đáy
  2. Tô từ từ về phía trên
  3. Dừng ở 80%
  
  [Reset] [Xong - Lưu]
  ```

### AC5: Audit Log For Dot Marking
**GIVEN** user confirm dot completion  
**WHEN** save  
**THEN** 
- Record:
  ```typescript
  {
    littleHouseId: <uuid>,
    redDotMarked: true,
    markedAt: now(),
    geometricMethodConfirmed: true,
    fillingPercentage: "~80%",
    toolUsed: "RED_PEN" // From user confirmation
  }
  ```

---

## 🔧 Technical Notes

### Canvas Drawing Ref
```typescript
// Location: apps/web/src/features/little-house/components/RedDotMarker.tsx

export function RedDotMarker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const drawGuidedCircle = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    // Draw guide circle (80% threshold)
    ctx.strokeStyle = '#ddd';
    ctx.setLineDash([5, 5]);
    ctx.arc(100, 100, 80, 0, Math.PI * 2);
    ctx.stroke();
  };
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Cách chấm đỏ Tiểu Phương Tử
- **Q&A Huyền học:** Ý nghĩa hình học của việc chấm từ dưới lên
- **Hướng dẫn thực hành:** Tiêu chuẩn vật lý

---

## 🏷️ Tags
`#phase-34` `#little-house` `#red-dot-geometry` `#foundation-builder` `#physical-standard`

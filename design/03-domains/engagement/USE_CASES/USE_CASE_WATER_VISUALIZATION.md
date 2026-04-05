# USE CASE: Great Compassion Water Visualization Step
**Module:** `engagement`, `vows-merit`  
**Phase:** 37 - Tầng Định Luật Vật Lý Lượng Tử & Bảo Mật Không Gian Tâm Linh  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

**Uống nước Đại Bi không phải cứ uống là xong:**

### ✅ PHẢI LÀM:
1. Nâng ly cao ngang lông mày
2. Khấn nguyện
3. **Quán tưởng:** Bình tịnh thủy của Bồ Tát từ từ đổ dòng nước dọc đỉnh đầu, chảy khắp toàn bộ cơ thể

### ⚠️ KHÔNG QUÁN TƯỞNG:
Ăn năng lượng gia trì không ghi nhận

---

## 🎯 Acceptance Criteria

### AC1: Water Ritual UI
**GIVEN** user open daily water task  
**WHEN** start consumption flow  
**THEN** 
- Show guided interface:
  ```
  💧 UỐNG NƯỚC ĐẠI BI
  
  Hướng dẫn từng bước:
  
  1️⃣  Nâng ly cao ngang lông mày
      (Vừa mắt)
  
  2️⃣  Khấn nguyện:
      "Xin Bồ Tát Quán Âm phù hộ con"
  
  3️⃣  Quán tưởng dòng nước chảy
      [ANIMATION - See below]
  
  [Tiếp Tục]
  ```

### AC2: Animation Layer
**GIVEN** user ready for visualization  
**WHEN** click "Tiếp Tục"  
**THEN** 
- Show animated water flow:
  ```
  ╔════════════════════════════════╗
  ║                                ║
  ║        👤                       ║
  ║    (Head - top view)            ║
  ║                                ║
  ║    ▼  ▼  ▼  ▼  ▼               ║
  ║    💧 💧 💧 💧 💧                ║
  ║  (Water droplets flowing        ║
  ║   from top of head)             ║
  ║                                ║
  ║    🫀 Heart                     ║
  ║    🦴 Torso                     ║
  ║    🦵 Legs                      ║
  ║  (Illuminating warm glow)       ║
  ║                                ║
  ║    ✨ ✨ ✨ ✨                   ║
  ║  (Light radiating outward)      ║
  ║                                ║
  ╚════════════════════════════════╝
  
  Animation sequence:
  - Droplets start at forehead
  - Flow down spine
  - Spread to shoulders, arms
  - Continue down to legs
  - Radiate light outward
  - Loop 3-5 times (7-15 seconds)
  
  Audio: Soft Guanyin mantra (optional)
  ```

### AC3: Hold-to-Visualize Button
**GIVEN** animation running  
**WHEN** require engagement  
**THEN** 
- Replace completion button:
  ```
  ┌─────────────────────────────────┐
  │                                 │
  │  🟢 GIỮ NỘI ĐỂ QUÁN TƯỞNG         │
  │    (Hold to Visualize)          │
  │                                 │
  │  ⏱️  Giữ trong 5-7 giây          │
  │                                 │
  │  Progress: ████████░░░░░ 60%    │
  │                                 │
  └─────────────────────────────────┘
  
  If user releases early:
  ⚠️  Bạn đã buông tay quá sớm!
  
  Hãy nhắm mắt và giữ trong suốt 
  5-7 giây để hoàn thành quán tưởng.
  
  [Thử Lại]
  ```

### AC4: Successful Completion
**GIVEN** user hold for full duration  
**WHEN** reach 7 seconds  
**THEN** 
- Show success:
  ```
  ✨ QUÁN TƯỞNG THÀNH CÔNG!
  
  Nước Đại Bi đã chảy khắp toàn thân 
  của bạn.
  
  💪 Năng lượng gia trì đã ghi nhận!
  
  Bạn sẽ nhận được:
  - Bảo vệ cơ thể
  - Xóa tội lỗi
  - Tăng trí huệ
  
  🙏 Cảm tạ Bồ Tát
  
  [Hoàn Tất]
  ```

### AC5: Energy Recording
**GIVEN** completion confirmed  
**WHEN** save to database  
**THEN** 
- Record meditation session:
  ```typescript
  {
    userId: <uuid>,
    taskType: 'WATER_CONSUMPTION',
    visualizationComplete: true,
    visualizationDurationSeconds: 7,
    meritGained: 'WATER_ENERGY_TRANSFER',
    timestamp: now()
  }
  ```

### AC6: Incomplete Session Handling
**GIVEN** user cannot complete  
**WHEN** close modal or abandon  
**THEN** 
- Show partial credit option:
  ```
  ⚠️  QUÁN TƯỞNG CHƯA HOÀN THÀNH
  
  Bạn chỉ giữ được 3 giây 
  (cần 5-7 giây).
  
  Lợi ích giảm 40%:
  ○ Tiếp tục thử lại
  ○ Tính nửa công đức (Partial)
  ○ Từ bỏ (Abandon)
  
  Khuyên: Hãy thử lại khi bạn 
  có thể tập trung tốt hơn.
  
  [Thử Lại]  [Tính Nửa]  [Từ Bỏ]
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Quán tưởng khi uống nước
- **Q&A Huyền học:** Năng lượng gia trì từ nước Đại Bi
- **Hướng dẫn thực hành:** Kỹ thuật quán tưởng dòng nước

---

## 🏷️ Tags
`#phase-37` `#engagement` `#water-visualization` `#meditation` `#energy-transfer`

# USE CASE: Multi-Threaded Bottom-Up Dotting Algorithm
**Module:** `little-house`, `engagement`  
**Phase:** 37 - Tầng Định Luật Vật Lý Lượng Tử & Bảo Mật Không Gian Tâm Linh  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

**Cách chấm NNN nguyên lý xây nhà từ móng:**

### ✅ ĐƯỢC PHÉP:
1. Chấm **1 loại Kinh** từ dưới lên hết, rồi qua Kinh khác
2. **Chấm đồng thời 4 loại Kinh** dàn hàng ngang, từ dưới đáy lên trên

### ⚠️ TUYỆT ĐỐI KHÔNG:
- Chấm **lên mặt** từ trên xuống
- Chấm **ngẫu hứng** (bỏ qua dòng)

---

## 🎯 Acceptance Criteria

### AC1: Vertical Lock Matrix
**GIVEN** user open red dot marking UI  
**WHEN** render dotting interface  
**THEN** 
- Display SVG matrix locked vertically:
  ```
  Kinh 1    Kinh 2    Kinh 3    Kinh 4
  [ ]       [ ]       [ ]       [ ]     ← Row 1 (Top - Locked)
  [ ]       [ ]       [ ]       [ ]
  [ ]       [ ]       [ ]       [ ]
  ●         ●         ●         ●       ← Row 4 (Bottom - Only allowed)
  ```

### AC2: Click-Only-Lowest-Row
**GIVEN** user try to click upper rows  
**WHEN** attempt interaction  
**THEN** 
- Disable upper rows (greyed out):
  ```
  ⚠️  LỚP MẤY PHẢI CHẤM TỪ DƯỚI LÊN
  
  Bạn chỉ có thể chấm ở hàng thấp nhất 
  chưa được chấm.
  
  Khi hoàn thành hàng này, hàng tiếp 
  theo sẽ được mở khóa.
  ```

### AC3: Horizontal Sweep Mode
**GIVEN** render UI  
**WHEN** offer options  
**THEN** 
- Provide toggle:
  ```
  ○ Chế độ Tuần Tự (Một loại xong mới sang)
  ● Chế độ Quét Ngang (4 cột cùng lúc)
  
  [Toggle Mode]
  ```

### AC4: Sweep Mode Animation
**GIVEN** user select sweep mode  
**WHEN** enable feature  
**THEN** 
- Show guided animation:
  ```
  [Animation showing 4 columns being filled 
   from bottom to top simultaneously, 
   like pouring foundation across 4 pillars]
  
  Hướng dẫn:
  Chấm từ trái sang phải (hoặc phải sang 
  trái) một dòng tại một thời điểm.
  
  Khi hoàn thành dòng này, tất cả 4 cột 
  sẽ cùng mở khóa dòng tiếp theo.
  ```

### AC5: Progress Tracking
**GIVEN** user dot red marks  
**WHEN** update matrix  
**THEN** 
- Show progress:
  ```
  Hàng 1/4: ●●●● (100%)
  Hàng 2/4: ●●○○ (50%)
  Hàng 3/4: ○○○○ (0%)
  Hàng 4/4: ○○○○ (0%)
  
  Tổng: 6/16 chấm (37.5%)
  ```

### AC6: Completion Celebration
**GIVEN** all dots complete  
**WHEN** mark final dot  
**THEN** 
- Show success:
  ```
  ✨ HOÀN THÀNH CHẤM ĐỎ!
  
  Bạn đã chấm NNN từ DƯỚI LÊN TRÊN 
  như xây nền móng nhà linh địa.
  
  📿 Giờ bạn có thể bắt đầu niệm 
     hoặc dọn bỏ để chuẩn bị đốt.
  
  [Tiếp Tục]
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Cách chấm NNN
- **Q&A Huyền học:** Nguyên lý xây dựng từ móng
- **Hướng dẫn thực hành:** Quét ngang vs tuần tự

---

## 🏷️ Tags
`#phase-37` `#little-house` `#dotting-algorithm` `#vertical-lock` `#horizontal-sweep`

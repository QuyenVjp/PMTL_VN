# USE CASE: Post-Completion Date Lock
**Module:** `little-house`  
**Phase:** 33 - Kiểm Soát Nhân Quả Chuyên Sâu & Ràng Buộc Pháp Bảo Vật Lý  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

Trái ngược với "Kính Tặng" phải điền **TRƯỚC khi** niệm, mục **"Ngày, Tháng, Năm"** ở góc trái Ngôi Nhà Nhỏ **BẮT BUỘC chỉ được điền SAU KHI** đã tụng niệm hoàn thành 100% và chấm đỏ xong.

### ⚠️ TẠI SAO?
- Ngày tháng là dấu hiệu "Kinh đã hoàn thành"
- Nếu điền trước → Linh giới hiểu là "đã xong rồi" → Không ghi nhận công đức
- Phải niệm **xong mới được ghi ngày hoàn thành** theo "lịch sử thật"

---

## 🎯 Acceptance Criteria

### AC1: Hide Date Field During Recitation
**GIVEN** user bắt đầu niệm Ngôi Nhà Nhỏ  
**WHEN** progress bar < 100%  
**THEN** 
- Trường "Ngày Hoàn Thành" bị **HIDDEN** hoàn toàn
- Form chỉ hiển thị:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📿 NIỆM NGÔI NHÀ NHỎ
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Kính Tặng: [Hiển thị, không chỉnh]
  Người Tặng: [Hiển thị, không chỉnh]
  
  Progress: ████████░░ 80/100
  
  [Tiếp Tục Đếm]  [Tạm Dừng]
  
  ℹ️  Ngày hoàn thành sẽ được điền 
     sau khi niệm xong 100%
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC2: Unlock Date Field At 100%
**GIVEN** progress bar đạt 100%  
**WHEN** system detect completion  
**THEN** 
- Trường "Ngày Hoàn Thành" được **UNLOCK** (Visible):
  ```
  Progress: ██████████ 100/100 ✅ HOÀN THÀNH
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  📅 Ngày Hoàn Thành / Ngày Đốt:
  [Chọn ngày dương lịch...]
  
  [Bỏ Qua]  [Xác Nhận]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC3: Bung Modal To Select Date
**GIVEN** progress = 100%  
**WHEN** trigger date picker  
**THEN** 
- Hiển thị calendar popup:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📅 CHỌN NGÀY HOÀN THÀNH
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  [← April 2026 →]
  
  Sun Mon Tue Wed Thu Fri Sat
   31   1   2   3   4   5   6
   7    8   9  10  11  12  13
  14   15  16  17  18  19  20
  21   22  23  24  25  26  27
  28   29  30
  
  [Ngày Hôm Nay]  [Xác Nhận]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC4: Default To Today
**GIVEN** user không chọn ngày  
**WHEN** click "Xác Nhận"  
**THEN** 
- Auto-fill: `completionDate = today()`

### AC5: Database Timestamp Recording
**GIVEN** user confirm date  
**WHEN** save  
**THEN** 
- Ghi:
  ```typescript
  {
    completionDate: <user_selected_date>,
    completedAt: now(),
    progress: 100,
    status: 'COMPLETED'
  }
  ```

### AC6: Prevent Date Backdating
**GIVEN** user cố chọn ngày trong quá khứ  
**WHEN** system validate  
**THEN** 
- Allow với warning:
  ```
  ⚠️  CHÚ Ý: Bạn chọn ngày trong quá khứ
  
  Nếu bạn đốt Ngôi Nhà Nhỏ hôm qua nhưng 
  quên điền ngày, bạn có thể chọn ngày đó.
  
  ☐ Tôi xác nhận chọn ngày này đúng
  
  [Xác Nhận]
  ```

---

## 🔧 Technical Notes

### Frontend State
```typescript
// Location: apps/web/src/features/little-house/components/CompletionDatePicker.tsx

export function CompletionDatePicker({ progress, onConfirm }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Only show when progress = 100%
  if (progress < 100) return null;
  
  return (
    <Modal>
      {/* Date picker */}
      <Button 
        onClick={() => onConfirm(selectedDate)}
      >
        Xác Nhận
      </Button>
    </Modal>
  );
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Nguyên tắc ghi ngày hoàn thành
- **Q&A Huyền học:** Tầm quan trọng của ngày tháng năm
- **Hướng dẫn thực hành:** Khi nào được phép điền ngày

---

## 🏷️ Tags
`#phase-33` `#little-house` `#date-lock` `#post-completion` `#dharma-precision`

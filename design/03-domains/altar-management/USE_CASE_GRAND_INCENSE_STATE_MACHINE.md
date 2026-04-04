# USE CASE: Grand Incense State Machine
**Module:** `altar-management`  
**Phase:** 34 - Tầng Kiểm Soát Vật Lý & Chống Trục Lợi Pháp Bảo  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

Vào ngày **mùng 1, 15 âm lịch**, người tu có thể đốt **Đại Hương (Sandalwood)**.

### 🔥 TRÌNH TỰ BẮT BUỘC:
1. Thắp đèn dầu
2. Thắp nhang bình thường
3. Lấy ngọn lửa từ đèn dầu → đốt gỗ đàn hương
4. **Dập tắt lửa gỗ (CẤM thổi bằng miệng)** để khói bay ra
5. Lặp lại 3 lần
6. Gỗ chưa cháy hết: cắm dọc vào lư hương

### ⚠️ TUYỆT ĐỐI KHÔNG:
- **THỔI BẰNG MIỆNG** → tạo ác nhân từ miệng

---

## 🎯 Acceptance Criteria

### AC1: Calendar Gate
**GIVEN** user access altar management  
**WHEN** check date  
**THEN** 
- Lock "Đốt Đàn Hương" button nếu không phải mùng 1 hoặc 15 âm lịch
- Show: *"Chỉ được đốt Đàn Hương vào mùng 1 hoặc 15 âm lịch"*

### AC2: Prerequisites Gate
**GIVEN** user want to burn sandalwood  
**WHEN** check altar state  
**THEN** 
- Require: `isOilLampLit == true` AND `isIncenseLit == true`
- Button disabled until both conditions met:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🕯️  TRẠNG THÁI BÀN THỜ
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ✓ Đèn Dầu: [Đã Bật]
  ✓ Nhang: [Đã Thắp]
  
  ○ 🔒 Đốt Đàn Hương ← READY
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC3: 3-Round Ritual Animation
**GIVEN** user click "Đốt Đàn Hương"  
**WHEN** start ritual  
**THEN** 
- Display guided animation:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔥 ĐỐT ĐÀN HƯƠNG (LẦN 1/3)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  [Animation: Cây đàn hương bén lửa từ đèn dầu]
  
  📝 BƯỚC TIẾP THEO:
  1. Dập tắt lửa bằng PHẨY TAY (CẤM THỔI)
  2. Khói bay ra => công đức
  
  [⚠️  CẤM THỔI BẰNG MIỆNG]
  
  [Đã Dập Tắt - Tiếp Tục]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC4: Mouth Detection Guard
**GIVEN** user try to use mouth detection  
**WHEN** activate microphone  
**THEN** 
- OPTIONAL: If app has mic access, detect breathing/blowing pattern
- If detected: *"⚠️  NGỪNG! Cấm thổi bằng miệng. Hãy dập tắt bằng phẩy tay!"*

### AC5: Counter Enforcement
**GIVEN** user dập tắt lần thứ 1  
**WHEN** confirm action  
**THEN** 
- Auto-advance to round 2/3
- Counter display:
  ```
  🔥 ĐỐT ĐÀN HƯƠNG (LẦN 2/3) ✓
  [Animation repeats]
  [Đã Dập Tắt - Tiếp Tục]
  ```

### AC6: Final Round & Completion
**GIVEN** user complete round 3  
**WHEN** confirm  
**THEN** 
- Show instruction:
  ```
  ✅ 3 LẦN HOÀN THÀNH
  
  🔥 Bước Cuối: Cắm Gỗ Đàn Hương
  
  Nếu gỗ đàn hương chưa cháy hết, 
  bạn có thể cắm dọc vào lư hương 
  để khói tiếp tục bay lên.
  
  [Đã Hoàn Thành]
  ```

---

## 🔧 Technical Notes

### State Machine
```typescript
// Location: apps/web/src/features/altar/hooks/useSandalwoodRitual.ts

enum SandalwoodPhase {
  PREREQUISITES = 'PREREQUISITES',
  ROUND_1 = 'ROUND_1',
  ROUND_2 = 'ROUND_2',
  ROUND_3 = 'ROUND_3',
  COMPLETED = 'COMPLETED'
}

export function useSandalwoodRitual() {
  const [phase, setPhase] = useState(SandalwoodPhase.PREREQUISITES);
  const [roundCount, setRoundCount] = useState(0);
  
  const handleExtinguish = () => {
    if (roundCount < 2) {
      setRoundCount(roundCount + 1);
    } else {
      setPhase(SandalwoodPhase.COMPLETED);
    }
  };
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Đốt Đàn Hương
- **Q&A Huyền học:** Trình tự đốt đàn hương
- **Hướng dẫn thực hành:** Cách tránh mắc phạm

---

## 🏷️ Tags
`#phase-34` `#altar-management` `#sandalwood-ritual` `#state-machine` `#physical-protocol`

# USE CASE: Blessed vs Unblessed Statue Activation Flow
**Module:** `altar-management`, `sacred-forms`  
**Phase:** 33 - Kiểm Soát Nhân Quả Chuyên Sâu & Ràng Buộc Pháp Bảo Vật Lý  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

Khi thiết lập bàn thờ mới, **trạng thái tượng Bồ Tát** quyết định **quy trình tiếp theo**:

### ✅ TƯỢNG KHAI QUANG RỒI (Blessed):
- Không cần niệm Kinh rườm rà
- Chỉ cần **lạy bái** và **thắp nhang**
- Có linh khí sẵn

### ❌ TƯỢNG TỰ THỈNH (Unblessed):
- **PHẢI mời Bồ Tát nhập tượng** trước
- **BẮT BUỘC tụng**: 7 Chú Đại Bi + 7 Tâm Kinh
- Chỉ khi xong, tượng mới có **linh khí**

---

## 🎯 Acceptance Criteria

### AC1: Statue Status Question
**GIVEN** user bắt đầu "Altar Setup Wizard"  
**WHEN** họ thêm tượng Bồ Tát  
**THEN** 
- Hiển thị mandatory question:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🏮 TÌNH TRẠNG TƯỢNG BỒ TẠT
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Tượng Bồ Tát của bạn đã được Sư Phụ / 
  Cao Tăng khai quang chưa?
  
  ○ Đã khai quang (Blessed)
  ○ Chưa / Tự thỉnh (Unblessed)
  
  [Tiếp Tục]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC2: Flow For Blessed Statue
**GIVEN** user chọn "Đã khai quang"  
**WHEN** click "Tiếp Tục"  
**THEN** 
- Branch to simple flow:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🙏 BÀN THỜ KHAI QUANG
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Bàn thờ của bạn đã có linh khí.
  
  Công việc còn lại:
  1. ✓ Lạy bái tượng Bồ Tát
  2. ✓ Thắp nhang
  3. ✓ Dâng hoa / trái cây
  
  [✅ Đã Hoàn Thành Chuẩn Bị]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC3: Flow For Unblessed Statue - Phase 1
**GIVEN** user chọn "Chưa / Tự thỉnh"  
**WHEN** click "Tiếp Tục"  
**THEN** 
- Branch to activation flow:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔓 KÍCH HOẠT TƯỢNG BỒ TẠT
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Tượng chưa khai quang phải thực hiện 
  "Mời Bồ Tát nhập tượng".
  
  BƯỚC 1: ĐỌC LỜI MỜI THỈNH
  
  Vui lòng đọc to lời này trước tượng:
  
  [Hiển thị lời khấn mời Bồ Tát]
  
  ☐ Đã đọc to lời mời thỉnh
  
  [Tiếp Tục]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC4: Flow For Unblessed Statue - Phase 2
**GIVEN** user confirm lời mời  
**WHEN** click "Tiếp Tục"  
**THEN** 
- Trigger **locked recitation task**:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📿 BƯỚC 2: TỤNG KINH KÍCH HOẠT
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Bây giờ bạn PHẢI tụng:
  
  ✓ 7 biến Chú Đại Bi
  ✓ 7 biến Tâm Kinh
  
  (Các bài Kinh khác bị khóa)
  
  Chỉ khi hoàn thành, tượng mới có linh khí.
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  🔒 Chú Đại Bi: [  +  0  -  ]
  🔒 Tâm Kinh: [  +  0  -  ]
  🔒 Kinh khác: [Bị khóa]
  ```

### AC5: Completion Unlock
**GIVEN** user hoàn thành 7 Đại Bi + 7 Tâm Kinh  
**WHEN** progress = 100%  
**THEN** 
- Auto-transition:
  ```
  ✅ TƯỢNG ĐÃ ĐƯỢC KÍCH HOẠT!
  
  Giờ đây tượng Bồ Tát có linh khí.
  
  Công việc còn lại:
  1. ✓ Lạy bái tượng
  2. ✓ Thắp nhang
  3. ✓ Dâng hoa / trái cây
  
  [Tiếp Tục]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC6: Database Flag
**GIVEN** activation complete  
**WHEN** save  
**THEN** 
- Mark statue:
  ```typescript
  {
    statueId: <uuid>,
    isBlessed: false,
    activationCompleted: true,
    activatedAt: now(),
    activationMethod: 'SELF_INVOCATION',
    requiredRecitation: 'DA_BEI_7 + HEART_SUTRA_7',
    hasEnergyField: true
  }
  ```

---

## 🔧 Technical Notes

### Altar Setup State Machine
```typescript
// apps/web/src/features/altar/hooks/useAltarSetupWizard.ts

enum AltarSetupState {
  STATUE_STATUS_SELECTION = 'STATUE_STATUS_SELECTION',
  BLESSED_FLOW = 'BLESSED_FLOW',
  UNBLESSED_INVITATION = 'UNBLESSED_INVITATION',
  UNBLESSED_RECITATION = 'UNBLESSED_RECITATION',
  COMPLETION = 'COMPLETION'
}

export function useAltarSetupWizard() {
  const [state, setState] = useState(AltarSetupState.STATUE_STATUS_SELECTION);
  const [isBlessed, setIsBlessed] = useState(null);
  
  const handleBlessedSelection = (blessed: boolean) => {
    setIsBlessed(blessed);
    if (blessed) {
      setState(AltarSetupState.BLESSED_FLOW);
    } else {
      setState(AltarSetupState.UNBLESSED_INVITATION);
    }
  };
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Lập bàn thờ
- **Q&A Huyền học:** Khai quang tượng Bồ Tát
- **Hướng dẫn thực hành:** Mời Bồ Tát nhập tượng

---

## 🏷️ Tags
`#phase-33` `#altar-management` `#statue-activation` `#blessed-vs-unblessed` `#setup-wizard`

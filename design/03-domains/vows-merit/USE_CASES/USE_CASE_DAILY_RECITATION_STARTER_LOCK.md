# USE CASE: Daily Recitation Starter Lock
**Module:** `vows-merit`, `content`  
**Phase:** 33 - Kiểm Soát Nhân Quả Chuyên Sâu & Ràng Buộc Pháp Bảo Vật Lý  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

Công khóa hằng ngày (Daily Recitation - Kinh Bài Tập) **BẮT BUỘC bắt đầu bằng Chú Đại Bi** (Thiên Thủ Thiên Nhãn Vô Ngại Đại Bi Tâm Đà La Ni).

### ✅ Trình Tự An Toàn:
1. Niệm **Chú Đại Bi** trước (được bấm đếm)
2. Sau đó mới được bấm các Kinh khác

### Lý Do:
Chú Đại Bi là **Kinh Chính**, mang năng lượng "mở cửa" từ trường Bát Nhã. Nếu không niệm Đại Bi trước, các Kinh khác sẽ "vô đối tượng" (không có mục tiêu rõ ràng), công đức sẽ bị phân tán.

---

## 🎯 Acceptance Criteria

### AC1: Daily Recitation UI Lock
**GIVEN** user mở trang "Daily Recitation Tracker"  
**WHEN** họ xem danh sách các bài Kinh để đếm  
**THEN** 
- Tất cả nút đếm **EXCEPT** `Chú Đại Bi` bị vô hiệu hóa (Disabled):
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📿 CÔNG KHÓA HẰNG NGÀY
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ✅ Chú Đại Bi: [  +  0  -  ] ← ENABLED
  
  🔒 Chú Vãng Sanh: [  +  -  ] ← DISABLED
  🔒 Tâm Kinh: [  +  -  ] ← DISABLED
  🔒 Kinh A Di Đà: [  +  -  ] ← DISABLED
  
  ℹ️  Bắt buộc niệm Chú Đại Bi trước
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC2: Lock Icon & Tooltip
**GIVEN** user hover vào nút disabled  
**WHEN** tooltip shows  
**THEN** 
- Hiển thị:
  ```
  🔒 Bị Khóa
  
  Bắt buộc niệm Chú Đại Bi trước (≥1 biến)
  để mở khóa các Kinh khác.
  
  Chú Đại Bi mang năng lượng "mở cửa" từ 
  trường Bát Nhã. Nếu không niệm trước, 
  công đức sẽ bị phân tán.
  ```

### AC3: Auto-Unlock Condition
**GIVEN** user bấm đếm Chú Đại Bi  
**WHEN** `daBeiBiCount >= 1` ghi nhận  
**THEN** 
- Tất cả nút khác **đồng loạt UNLOCK** (Enabled)
- Notification:
  ```
  ✅ MỞ KHÓA THÀNH CÔNG!
  
  Chú Đại Bi đã được niệm.
  Bạn có thể tiếp tục niệm các Kinh khác.
  ```

### AC4: Daily Reset
**GIVEN** hôm mới (00:00 mỗi ngày)  
**WHEN** system reset  
**THEN** 
- Lock lại: `daBeiBiCount = 0`
- Tất cả nút khác lại Disabled
- User phải niệm Đại Bi lại từ đầu mỗi ngày

### AC5: Database Tracking
**GIVEN** session active  
**WHEN** logging  
**THEN** 
- Ghi:
  ```typescript
  {
    date: <today>,
    daBeiBiUnlocked: true,
    unlockedAt: <timestamp>,
    unlockedCount: 1
  }
  ```

---

## 🔧 Technical Notes

### Frontend State
```typescript
// Location: apps/web/src/features/vows-merit/hooks/useDailyRecitationLock.ts

export function useDailyRecitationLock() {
  const [daBeiBiCount, setDaBeiBiCount] = useState(0);
  const isUnlocked = daBeiBiCount >= 1;
  
  const getButtonState = (mantras: string) => {
    if (mantras === 'DA_BEI_ZHOU') {
      return { disabled: false, locked: false };
    }
    
    return { 
      disabled: !isUnlocked, 
      locked: !isUnlocked,
      message: 'Bắt buộc niệm Chú Đại Bi trước'
    };
  };
  
  return { daBeiBiCount, isUnlocked, getButtonState };
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Trình tự Công Khóa
- **Q&A Huyền học:** Vai trò của Chú Đại Bi
- **Hướng dẫn thực hành:** Công Khóa hằng ngày

---

## 🏷️ Tags
`#phase-33` `#vows-merit` `#starter-lock` `#daily-recitation` `#content`

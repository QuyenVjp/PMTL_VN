# USE CASE: Interruption State Machine
**Module:** `content`  
**Phase:** 33 - Kiểm Soát Nhân Quả Chuyên Sâu & Ràng Buộc Pháp Bảo Vật Lý  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp Vụ

Khi đang tụng Kinh bị gián đoạn (điện thoại, có người gõ cửa), hành xử phụ thuộc **loại Kinh**:

### Kinh/Chú Ngắn (Chú Vãng Sanh, Thất Phật...):
- ❌ Nếu bị gián đoạn → **BẮT BUỘC niệm lại từ đầu**

### Kinh Dài (Chú Đại Bi, Tâm Kinh...):
- ✅ Niệm 1 biến **"Ông Lai Mu Suo He"** (Ong Lai Mu Suo Ho) để tạm dừng
- ✅ Làm xong việc gián đoạn
- ✅ Niệm 1 biến **"Ông Lai Mu Suo He"** để tiếp tục
- ✅ Rồi mới được niệm tiếp phần dang dở

### Lý Do:
Kinh chú có sức mạnh riêng. Nếu bị cắt ngang mà không "khóa" (seal) bằng câu chú đặc biệt, năng lượng sẽ loạn xạ.

---

## 🎯 Acceptance Criteria

### AC1: Recitation Type Detection
**GIVEN** user đang đếm Kinh  
**WHEN** system initialize session  
**THEN** 
- Classify recitation:
  ```typescript
  const SHORT_MANTRAS = [
    'REBIRTH_MANTRA',    // Chú Vãng Sanh
    'SEVEN_BUDDHAS',     // Thất Phật
    'AMITABHA_SHORT'
  ];
  
  const LONG_MANTRAS = [
    'DA_BEI_ZHOU',       // Chú Đại Bi
    'HEART_SUTRA',       // Tâm Kinh
    'UNIVERSAL_DOOR'     // Phẩm Phổ Môn
  ];
  ```

### AC2: Pause Button Behavior For Short Mantras
**GIVEN** user đang tụng Kinh ngắn  
**WHEN** họ bấm nút `[Tạm Dừng]`  
**THEN** 
- Hiển thị modal:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⚠️  KINH NGẮN BỊ GIÁN ĐOẠN
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Bạn đang tụng "Chú Vãng Sanh" (Kinh ngắn).
  
  Nếu bị gián đoạn, bắt buộc phải 
  NIỆM LẠI TỪ ĐẦU biến này.
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Bộ đếm sẽ được RESET về 0.
  
  [Hủy - Tiếp tục]  [Xác Nhận Reset]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC3: Reset Counter For Short Mantras
**GIVEN** user confirm pause  
**WHEN** click "Xác Nhận Reset"  
**THEN** 
- Counter reset: `currentBiến = 0`
- Notification: *"Bộ đếm đã reset. Vui lòng niệm lại từ biến 1"*

### AC4: Seal Ritual For Long Mantras
**GIVEN** user đang tụng Kinh dài  
**WHEN** họ bấm nút `[Tạm Dừng]`  
**THEN** 
- Hiển thị modal khác:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔐 KHÓA NĂNG LƯỢNG TRƯỚC KHI DỪNG
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Bạn đang tụng "Chú Đại Bi" (Kinh dài).
  
  Trước khi tạm dừng, PHẢI niệm 1 biến:
  
  "Ông Lai Mu Suo He"
  
  để KHÓA năng lượng, tránh loạn xạ.
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Vui lòng đọc to 1 lần và bấm:
  
  [Đã Niệm - Khóa Xong]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC5: Lock Resumed Session
**GIVEN** user bấm "Đã Niệm - Khóa Xong"  
**WHEN** họ sau đó bấm `[Tiếp Tục]`  
**THEN** 
- Hiển thị modal mở khóa:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔓 MỞ KHÓA VÀ TIẾP TỤC NIỆM
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Trước khi tiếp tục, PHẢI niệm 1 biến:
  
  "Ông Lai Mu Suo He"
  
  để MỞ KHÓA và tiếp tục phần dang dở.
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Sau đó, bộ đếm mới được enable để 
  tiếp tục đếm từ biến sau.
  
  [Đã Niệm - Mở Khóa]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC6: Counter State Tracking
**GIVEN** session bị pause/resume  
**WHEN** ghi log  
**THEN** 
- Track state:
  ```typescript
  {
    mantras: 'DA_BEI_ZHOU',
    currentBiến: 35,
    status: 'PAUSED',
    pausedAt: <timestamp>,
    sealRecitation: {
      count: 1,
      mantra: 'ONG_LAI_MU_SUO_HE',
      purpose: 'LOCK_ENERGY'
    },
    resumed: false
  }
  ```

### AC7: Meilisearch Index
**GIVEN** need quick lookup  
**WHEN** user search "interrupt handling"  
**THEN** 
- Meilisearch suggest:
  ```
  🔍 Kết quả tìm kiếm: "interrupt handling"
  
  📖 Kinh ngắn (Vãng Sanh):
  → Reset bộ đếm từ 0
  
  📖 Kinh dài (Đại Bi, Tâm Kinh):
  → Niệm 1x "Ông Lai Mu Suo He" (khóa)
  → Làm việc gián đoạn
  → Niệm 1x "Ông Lai Mu Suo He" (mở)
  → Tiếp tục
  ```

---

## 🔧 Technical Notes

### Recitation Service
```typescript
// Location: apps/api/src/content/services/recitation-interruption.service.ts

async handlePause(sessionId: string) {
  const session = await this.getSession(sessionId);
  const recitationType = this.classifyRecitation(session.mantras);
  
  if (this.isShortMantra(recitationType)) {
    return { action: 'RESET', message: 'Reset counter từ đầu' };
  }
  
  if (this.isLongMantra(recitationType)) {
    return {
      action: 'SEAL_REQUIRED',
      message: 'Phải niệm "Ông Lai Mu Suo He" trước',
      sealMantra: 'ONG_LAI_MU_SUO_HE'
    };
  }
}

async handleResume(sessionId: string) {
  const session = await this.getSession(sessionId);
  
  if (session.sealRecitation.purpose === 'LOCK_ENERGY') {
    return {
      action: 'UNLOCK_REQUIRED',
      message: 'Phải niệm "Ông Lai Mu Suo He" để mở khóa trước',
      sealMantra: 'ONG_LAI_MU_SUO_HE'
    };
  }
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Trình tự tụng Kinh
- **Q&A Huyền học:** Xử lý gián đoạn khi tụng Kinh
- **Hướng dẫn thực hành:** Câu chú "Ông Lai Mu Suo He"

---

## 🏷️ Tags
`#phase-33` `#content` `#interruption-handler` `#state-machine` `#seal-mantra`

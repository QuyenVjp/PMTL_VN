# USE CASE: Error Invalidation Protocol - Little House Correction
**Module:** `little-house`, `engagement`  
**Phase:** 34 - Tầng Kiểm Soát Vật Lý & Chống Trục Lợi Pháp Bảo  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

Nếu điền sai thông tin trên Tiểu Phương Tử:

### ❌ TUYỆT ĐỐI KHÔNG ĐƯỢC:
- Dùng bút xóa
- Xé giấy
- Đốt tấm giấy sai

### ✅ PHẢI LÀM:
1. Gạch chéo phần "Kính Tặng" và "Người Tặng"
2. Gấp nhỏ lại
3. Bọc trong giấy
4. Vứt đi
5. Khấn xin Bồ Tát hủy bỏ

---

## 🎯 Acceptance Criteria

### AC1: Error Reporting Button
**GIVEN** user realize made mistake on LH  
**WHEN** open record  
**THEN** 
- Show "Báo Cáo Viết Sai" button:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📄 TIỂU PHƯƠNG TỬ
  
  Kính Tặng: [Hiển thị, không edit]
  Người Tặng: [Hiển thị, không edit]
  
  [🔴 Báo Cáo Viết Sai]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC2: Cannot Delete - Mark Invalidated
**GIVEN** user click "Báo Cáo Viết Sai"  
**WHEN** trigger workflow  
**THEN** 
- **CANNOT delete** record
- Instead, update status:
  ```typescript
  {
    littleHouseId: <uuid>,
    status: 'INVALIDATED', // Changed from DRAFT/PENDING
    invalidatedAt: now(),
    reason: 'USER_REPORTED_ERROR'
  }
  ```

### AC3: Instruction Modal Popup
**GIVEN** record marked as invalidated  
**WHEN** show instruction  
**THEN** 
- Display modal:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⚠️  CÁCH XỬ LÝ TIỂU PHƯƠNG TỬ SAI
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  TUYỆT ĐỐI KHÔNG ĐƯỢC:
  
  ❌ Dùng bút xóa
  ❌ Xé giấy
  ❌ ĐỐT tấm giấy sai
  
  PHẢI LÀM THEO:
  
  ✓ BƯỚC 1: Gạch chéo tên "Kính Tặng"
  ✓ BƯỚC 2: Gạch chéo tên "Người Tặng"
  ✓ BƯỚC 3: Gấp nhỏ lại
  ✓ BƯỚC 4: Bọc trong giấy/phong bì
  ✓ BƯỚC 5: Vứt vào thùng rác bình thường
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  BƯỚC 6: KHẤN XIN BỒ TẠT
  
  Đọc to lời sau trước tượng Bồ Tát:
  
  "Xin Nam Mô Đại Từ Đại Bi Quán Thế Âm 
  Bồ Tát từ bi, con lỡ viết sai tấm 
  Tiểu Phương Tử, nay con xin phép 
  hủy bỏ nó. Xin Bồ Tát từ bi tha thứ 
  cho con."
  
  [Đã Đọc Lời Khấn]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC4: Confirmation of Prayer
**GIVEN** user confirm prayed  
**WHEN** click "Đã Đọc"  
**THEN** 
- Mark as resolved:
  ```typescript
  {
    status: 'INVALIDATED_AND_DISCARDED',
    prayerConfirmedAt: now(),
    prayerText: "[Stored for audit]"
  }
  ```

### AC5: Create Replacement Task
**GIVEN** invalidation complete  
**WHEN** close modal  
**THEN** 
- Suggest new entry:
  ```
  ✅ HOÀN THÀNH XỬ LÝ
  
  Giờ bạn có thể tạo một tấm 
  Tiểu Phương Tử MỚI với thông tin đúng.
  
  [Tạo Tiểu Phương Tử Mới]
  
  Ghi chú: Tấm cũ vẫn lưu trong lịch sử 
  (INVALIDATED), nhưng không tính công đức.
  ```

### AC6: Audit Trail
**GIVEN** workflow complete  
**WHEN** save all data  
**THEN** 
- Keep immutable record:
  ```typescript
  {
    originalLittleHouseId: <uuid>,
    status: 'INVALIDATED',
    invalidationWorkflow: {
      reportedAt: <timestamp>,
      userFollowedProtocol: true,
      prayerRecitedAt: <timestamp>,
      discardedPhysically: true
    },
    // NEVER deleted from DB
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Xử lý lỗi trong tụng Kinh
- **Q&A Huyền học:** Tầm quan trọng của gạch chéo (không xóa)
- **Hướng dẫn thực hành:** Lời khấn xin hủy bỏ

---

## 🏷️ Tags
`#phase-34` `#little-house` `#error-handling` `#invalidation-protocol` `#dharma-correction`

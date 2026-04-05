# USE CASE: Totem-Authorized Mantra Guard
**Module:** `vows-merit`, `wisdom-qa`  
**Phase:** 25 - Micro-Normalization & Specific Karma Measurement  
**Source:** Buddhism in Plain Terms, Hướng dẫn Ngôi Nhà Nhỏ, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp Vụ

**Quán Âm Linh Cảm Chân Ngôn** (Guanyin Spiritual Response Mantra) có uy lực thỉnh Bồ Tát hiển linh cực nhanh, NHƯNG là "con dao hai lưỡi". Điều kiện tiên quyết:
- Người niệm phải có tâm trí cực kỳ thanh tịnh, không có tạp niệm
- Phải có đủ công đức làm nền tảng

**Nếu tự ý niệm khi tâm vẩn đục** → Hậu quả không mong muốn, phản tác dụng.

**Quy tắc bắt buộc:** Bài chú này **CHỈ ĐƯỢC NIỆM** sau khi Lư Đài Trưởng xem Đồ Đằng (Totem Reading) và chỉ định đích danh.

---

## 🎯 Acceptance Criteria

### AC1: Hard-Block Mantra By Default
**GIVEN** user đang tạo/chỉnh sửa Recitation Prescription  
**WHEN** họ cố thêm "Quán Âm Linh Cảm Chân Ngôn" vào danh sách kinh chú  
**THEN** 
- Bài chú này mặc định bị **Khóa (Disabled)**
- Hiển thị trạng thái `[🔒 Requires Totem Authorization]`

### AC2: Digital Waiver Requirement
**GIVEN** user muốn unlock "Quán Âm Linh Cảm Chân Ngôn"  
**WHEN** họ bấm nút `[Yêu cầu Mở Khóa]`  
**THEN** hệ thống bung ra Digital Waiver form:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  CAM KẾT SỬ DỤNG BÀI CHÚ ĐẶC BIỆT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

☐ Tôi xác nhận đã được Đài Trưởng Lư / Ban Thư Ký 
  chỉ định đích danh niệm bài chú này thông qua 
  việc xem Đồ Đằng (Totem Reading)

[Hủy]  [Xác Nhận Cam Kết]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### AC3: API-Level Protection
**GIVEN** user chưa tick checkbox cam kết  
**WHEN** họ cố submit form tạo Prescription có "Quán Âm Linh Cảm Chân Ngôn"  
**THEN** 
- API trả về `403 Forbidden`
- Error message:
  ```json
  {
    "statusCode": 403,
    "error": "Forbidden",
    "message": "Tuyệt đối không tự ý trì tụng 'Quán Âm Linh Cảm Chân Ngôn' để tránh hậu quả phản tác dụng do thiếu công đức nền tảng. Bắt buộc phải được Lư Đài Trưởng xem Đồ Đằng rồi mới được phép niệm.",
    "mantraCode": "GUANYIN_SPIRITUAL_RESPONSE",
    "requiresAuthorization": true
  }
  ```

### AC4: Authorization Record Audit
**GIVEN** user đã tick checkbox và submit thành công  
**WHEN** hệ thống ghi nhận Prescription  
**THEN** 
- Lưu vào audit log với flag `hasTotemAuthorizationWaiver: true`
- Timestamp: `totemWaiverAcknowledgedAt`
- Ghi chú: *"User tự cam kết đã được Đài Trưởng phê chuẩn qua Totem Reading"*

---

## 🔧 Technical Notes

### Database Schema Extension
```prisma
model RecitationPrescription {
  // ... existing fields
  
  // Special mantra authorization tracking
  hasTotemAuthorizationWaiver Boolean @default(false)
  totemWaiverAcknowledgedAt   DateTime?
  authorizedByLeader          String?   // Optional: Đài Trưởng name reference
}

model Mantra {
  // ... existing fields
  
  requiresTotemAuthorization Boolean @default(false)
  authorizationWarningText   String?
}
```

### Validation Guard (NestJS)
```typescript
// Guard: TotemAuthorizedMantraGuard
// Location: apps/api/src/vows-merit/guards/

const TOTEM_REQUIRED_MANTRAS = [
  'GUANYIN_SPIRITUAL_RESPONSE', // Quán Âm Linh Cảm Chân Ngôn
  // Add more codes as needed
];

// If prescription includes totem-required mantra
// AND hasTotemAuthorizationWaiver !== true
// → Throw ForbiddenException
```

### Frontend Behavior
```typescript
// Mantra selector component:
// - Display lock icon for totem-required mantras
// - On click → Show digital waiver modal
// - Prevent submission unless waiver accepted
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Chương về năng lượng kinh chú
- **Q&A Huyền học:** Điều kiện niệm các bài chú đặc biệt
- **Hướng dẫn thực hành:** Vai trò của Đồ Đằng trong việc xác định phương pháp tu

---

## 🏷️ Tags
`#phase-25` `#mantra-authorization` `#totem-reading` `#hard-block` `#digital-waiver` `#vows-merit` `#wisdom-qa`

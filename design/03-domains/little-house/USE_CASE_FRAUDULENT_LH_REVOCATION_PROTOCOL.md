# USE CASE: Fraudulent LH Revocation Protocol
**Module:** `little-house`, `moderation`  
**Phase:** 28 - Ngũ Đại Pháp Bảo Enterprise Integration  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp Vụ

Bạn tặng một tấm Ngôi Nhà Nhỏ (NNN) đã niệm xong (trạng thái `RESERVED`) cho một người bạn đang bệnh. 

**NHƯNG** sau đó bạn phát hiện:
- ❌ Người này không dùng để trị bệnh
- ❌ Họ đem bán lấy tiền (phạm tội lừa đảo pháp bảo)
- ❌ Hoặc họ đem tặng tẩu tán cho người không xứng đáng

### ⚠️ Hậu Quả:
- Năng lượng công đức của bạn **bị ô uế**
- Vong linh người bệnh bị mắc kẹt, không được giải thoát
- Bạn phải **khấn xin Quán Thế Âm Bồ Tát thu hồi** lại năng lượng

### ✅ Giải Pháp:
Hệ thống cho phép **"Khởi kiện / Thu hồi Năng lượng"** khẩn cấp.

---

## 🎯 Acceptance Criteria

### AC1: Transfer Tracking For Every LH
**GIVEN** user transfer NNN cho người khác trong hệ thống  
**WHEN** transfer happens  
**THEN** 
- Tạo `TransferLog` record:
  ```typescript
  {
    littleHouseId: <uuid>,
    fromUserId: <user_id>,
    toUserId: <recipient_id>,
    transferredAt: <timestamp>,
    transferReason: 'GIFT' | 'CHARITY',
    status: 'ACTIVE'
  }
  ```

### AC2: Revocation Request Interface
**GIVEN** user phát hiện NNN bị lạm dụng  
**WHEN** họ vào page LittleHouse details  
**THEN** 
- Hiển thị nút (chỉ nếu status là `RESERVED` hoặc `TRANSFERRED`):
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [⚠️  Khởi Kiện / Thu Hồi Năng Lượng]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC3: Revocation Prayer Template
**GIVEN** user click nút "Khởi Kiện"  
**WHEN** form mở  
**THEN** 
- Hiển thị prayer template bắt buộc:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🙏 LỜI KHẤN XIN THU HỒI NĂNG LƯỢNG
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  "Con kính xin Đại Từ Đại Bi Quán Thế Âm 
  Bồ Tát từ bi gia hộ.
  
  Con đã niệm xong [Số lượng] tấm Ngôi Nhà 
  Nhỏ và tặng cho [Tên người] để giúp họ 
  trị bệnh.
  
  Nhưng con phát hiện [Tên người] đã:
  ☐ Bán lấy tiền
  ☐ Tặng người không xứng đáng
  ☐ Lạm dụng năng lượng
  
  Con kính xin Bồ Tát thu hồi năng lượng 
  công đức của những tấm sớ này để:
  ☐ Ngăn chặn ô uế
  ☐ Giải thoát người bệnh bị mắc kẹt
  ☐ Bảo vệ công đức của con
  
  Con xin Bồ Tát từ bi."
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  📋 THÔNG TIN CHI TIẾT:
  
  Tấm sớ bị lạm dụng:
  ☐ Ngôi Nhà Nhỏ #[UUID]
  ☐ Ngôi Nhà Nhỏ #[UUID]
  (Chọn các tấm cần thu hồi)
  
  Lý do lạm dụng:
  [Mô tả chi tiết]
  
  ☐ Tôi đã đọc to lời khấn này
  
  [Hủy]  [Xác Nhận Thu Hồi]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC4: Batch Selection For Multiple LH
**GIVEN** user phát hiện nhiều tấm NNN bị lạm dụng  
**WHEN** họ fill form  
**THEN** 
- Cho phép chọn multiple UUIDs:
  ```
  Danh sách Ngôi Nhà Nhỏ để Thu Hồi:
  
  ☐ #123-abc (Gửi ngày 01/04, Trạng thái: RESERVED)
  ☐ #456-def (Gửi ngày 02/04, Trạng thái: DELIVERED)
  ☐ #789-ghi (Gửi ngày 03/04, Trạng thái: RESERVED)
  
  Số lượng chọn: 3/5
  ```

### AC5: Database Status Update
**GIVEN** user confirm revocation  
**WHEN** xác nhận  
**THEN** 
- Update LH records:
  ```typescript
  await prisma.littleHouse.updateMany({
    where: { id: { in: selectedIds } },
    data: {
      status: 'REVOKED_DUE_TO_FRAUD',
      revokedAt: new Date(),
      revocationReason: <user_reason>,
      revokedByUserId: <current_user_id>
    }
  });
  ```

### AC6: Flag Fraudulent Recipient Account
**GIVEN** user reveal that recipient lạm dụng LH  
**WHEN** revocation approved  
**THEN** 
- Flag recipient account:
  ```typescript
  await prisma.user.update({
    where: { id: recipientUserId },
    data: {
      isFlaggedForFraud: true,
      fraudDescription: <details>,
      moderation: {
        create: {
          eventType: 'FRAUDULENT_LH_TRANSFER',
          severity: 'HIGH',
          status: 'PENDING_REVIEW'
        }
      }
    }
  });
  ```

### AC7: Moderation Review Queue
**GIVEN** fraudulent LH revocation reported  
**WHEN** moderation team sees queue  
**THEN** 
- Appears in admin dashboard:
  ```
  🚨 LIÊN HỆ LỪA ĐẢO PHÁP BẢO
  
  Người dùng: [Username]
  Lý do: Bán/tẩu tán Ngôi Nhà Nhỏ
  Số NNN liên quan: 3
  Người báo cáo: [Username]
  Ngày báo cáo: 2026-04-04
  
  [Xem Chi Tiết]  [Khóa Tài Khoản]
  ```

### AC8: Audit Trail For Revocation
**GIVEN** revocation completed  
**WHEN** logged to audit trail  
**THEN** 
- Ghi log immutable:
  ```typescript
  {
    eventType: "LH_REVOCATION_DUE_TO_FRAUD",
    littleHouseIds: [<ids>],
    revokerUserId: <user_id>,
    fraudulentRecipientUserId: <recipient_id>,
    revokedAt: <timestamp>,
    reason: <detailed_reason>,
    prayerAcknowledged: true,
    status: "REVOKED"
  }
  ```

### AC9: Recipient Notification
**GIVEN** NNN được revoke  
**WHEN** system processes  
**THEN** 
- Recipient nhận notification:
  ```
  ⚠️  CẢNH BÁO: NGÔI NHÀ NHỎ BỊ THU HỒI
  
  Một hoặc nhiều Ngôi Nhà Nhỏ đã được 
  người gửi thu hồi lại.
  
  Lý do: Lạm dụng năng lượng pháp bảo
  
  Hệ thống khuyến nghị: Bạn nên xin lỗi 
  người gửi và tu tập để bù đắp.
  ```

---

## 🔧 Technical Notes

### Database Schema
```prisma
model LittleHouse {
  id                    String   @id @default(cuid())
  createdByUserId       String
  recipientName         String
  status                String   // CREATED, RESERVED, DELIVERED, BURNED, REVOKED_DUE_TO_FRAUD
  
  // Transfer tracking
  transferredToUserId   String?
  transferredAt         DateTime?
  
  // Revocation tracking
  revokedAt             DateTime?
  revokedByUserId       String?
  revocationReason      String?
  fraudFlags            String[]
  
  createdBy User @relation("LittleHouseCreator", fields: [createdByUserId], references: [id])
  transferredTo User? @relation("LittleHouseTransferred", fields: [transferredToUserId], references: [id])
  revokedBy User? @relation("LittleHouseRevoker", fields: [revokedByUserId], references: [id])
  
  @@index([status])
  @@index([transferredToUserId])
  @@index([revokedAt])
}

model LHTransferLog {
  id                String   @id @default(cuid())
  littleHouseId     String
  fromUserId        String
  toUserId          String
  transferredAt      DateTime @default(now())
  reason            String?
  revokedAt         DateTime?
}

model Moderation {
  id                String   @id @default(cuid())
  userId            String
  eventType         String   // FRAUDULENT_LH_TRANSFER
  severity          String   // LOW, MEDIUM, HIGH
  status            String   // PENDING_REVIEW, APPROVED, REJECTED, ACTION_TAKEN
  details           Json?
  createdAt         DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
  
  @@index([userId, status])
}
```

### NestJS Service
```typescript
// Location: apps/api/src/little-house/services/revocation.service.ts

async revokeNNN(revocationDto: RevocationDto, userId: string) {
  // Validate prayer was read
  if (!revocationDto.prayerAcknowledged) {
    throw new BadRequestException("Bắt buộc xác nhận đã đọc lời khấn");
  }
  
  // Update LH records
  const revoked = await this.prisma.littleHouse.updateMany({
    where: { id: { in: revocationDto.littleHouseIds } },
    data: {
      status: 'REVOKED_DUE_TO_FRAUD',
      revokedAt: new Date(),
      revocationReason: revocationDto.reason,
      revokedByUserId: userId
    }
  });
  
  // Flag recipient if applicable
  if (revocationDto.fraudulentRecipientUserId) {
    await this.prisma.user.update({
      where: { id: revocationDto.fraudulentRecipientUserId },
      data: { isFlaggedForFraud: true }
    });
    
    // Create moderation record
    await this.prisma.moderation.create({
      data: {
        userId: revocationDto.fraudulentRecipientUserId,
        eventType: 'FRAUDULENT_LH_TRANSFER',
        severity: 'HIGH',
        status: 'PENDING_REVIEW',
        details: revocationDto
      }
    });
  }
  
  // Immutable audit log
  await this.prisma.auditLog.create({
    data: {
      eventType: 'LH_REVOCATION_DUE_TO_FRAUD',
      userId,
      details: revocationDto,
      timestamp: new Date()
    }
  });
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Chương về bảo vệ pháp bảo
- **Q&A Huyền học:** Hậu quả của lạm dụng Ngôi Nhà Nhỏ
- **Hướng dẫn thực hành:** Cách khấn xin thu hồi năng lượng

---

## 🏷️ Tags
`#phase-28` `#ngu-dai-phap-bao` `#fraud-revocation` `#little-house` `#moderation` `#karma-protection`

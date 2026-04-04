# USE CASE: Adult Proxy Vow Prohibition
**Module:** `vows-merit`  
**Phase:** 28 - Ngũ Đại Pháp Bảo Enterprise Integration  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp Vụ

Rất nhiều vợ vì muốn cứu chồng, quỳ trước Bồ Tát phát nguyện:

> *"Con xin phát nguyện cho chồng con từ nay sẽ ăn chay, không sát sinh"*

**ĐÂY LÀ HÀNH ĐỘNG VI PHẠM LUẬT NHÂN QUẢ.**

### ⚠️ LỲ NHÂN QUẢ CÓ QUYẾT:
- ❌ Người trưởng thành phải **tự chịu trách nhiệm** nhân quả
- ❌ **KHÔNG AI CÓ QUYỀN hứa thay** người khác
- ❌ Nếu họ không tự làm, Bồ Tát sẽ **KHÔNG chứng minh**
- ❌ Bạn sẽ mắc tội **"nói dối"** vì hứa nhưng họ không thực hiện

### ⚠️ NGOẠI LỆ CHỈ CÓ:
- ✅ Phát nguyện **thay cho con cái chưa vị thành niên** (dưới 18 tuổi)
- ✅ Vì trẻ em chưa có năng lực pháp lý, phụ huynh chịu trách nhiệm

### ✅ CÁCH ĐÚNG:
Thay vì phát nguyện thay chồng, hãy:
1. Niệm công đức của bạn
2. Chuyển công đức cho chồng
3. Để **chồng tự làm lựa chọn**

---

## 🎯 Acceptance Criteria

### AC1: Age Check On Proxy Vow Creation
**GIVEN** user tạo Vow với `targetType = PROXY` (cho người khác)  
**WHEN** họ select `targetPerson`  
**THEN** 
- System fetch `age` của target person
- Kiểm tra:
  ```typescript
  if (targetAge >= 18 && !isConsentObtained) {
    // BLOCK
  }
  ```

### AC2: Block Adult Proxy Vow
**GIVEN** `targetAge >= 18`  
**AND** `isConsentObtained = false` (chưa lấy consent từ người đó)  
**WHEN** user cố submit vow  
**THEN** 
- Hiển thị RED ALERT:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚨 LUẬT NHÂN QUẢ
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  KHÔNG ĐƯỢC phát nguyện thay cho 
  người trưởng thành!
  
  ⚠️  LỲ NHÂN QUẢ CÓ QUYẾT:
  
  Người trưởng thành phải tự chịu 
  trách nhiệm nhân quả. Bạn không thể 
  hứa thay họ nếu họ không tự nguyện.
  
  ❌ NẾU VI PHẠM:
  • Bồ Tát sẽ KHÔNG chứng minh
  • Bạn mắc tội "nói dối"
  • Công đức = KHÔNG
  
  ✅ CÁCH ĐÚNG:
  
  1. Niệm công đức riêng của bạn
  2. Chuyển công đức cho họ
  3. Để HỌ tự làm lựa chọn
  
  ➤ Hoặc lấy CONSENT từ họ trước
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC3: Option For Consent Verification
**GIVEN** user muốn phát nguyện cho người trưởng thành  
**WHEN** họ được chặn  
**THEN** 
- Cung cấp option: *"Lấy sự đồng ý từ họ"*
- Hiển thị:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  💬 LẤY SỰ ĐỒNG Ý TỪ [TÊN NGƯỜI]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Nếu [Tên] tự nguyện đồng ý, bạn có thể:
  
  1. Gửi lời mời (Email/SMS) để họ xác nhận
  2. Họ xác nhận trong app
  3. Sau đó bạn mới được phát nguyện
  
  [Gửi Lời Mời]  [Hủy]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC4: Consent Email Invitation
**GIVEN** user click "Gửi Lời Mời"  
**WHEN** system generate invite  
**THEN** 
- Target person nhận email:
  ```
  📧 LỜI MỜI PHÁT NGUYỆN
  
  Xin chào [Tên],
  
  [Tên người phát nguyện] muốn phát nguyện 
  cho bạn để hỗ trợ tu tập của bạn.
  
  Cụ thể: [Chi tiết nguyện]
  
  💡 LƯU Ý: 
  Bạn phải TỰ NGUYỆN ĐỒNG Ý. 
  Nếu bạn không thực sự muốn, vui lòng từ chối.
  
  [Đồng Ý]  [Từ Chối]
  
  Link xác nhận: [...]
  ```

### AC5: Consent Stored In Database
**GIVEN** target person click "Đồng Ý"  
**WHEN** confirm  
**THEN** 
- Lưu:
  ```typescript
  {
    targetUserId: <target_id>,
    vowInitiatorId: <initiator_id>,
    isConsentObtained: true,
    consentObtainedAt: <timestamp>,
    consentMethod: 'EMAIL_INVITATION',
    consentStatus: 'APPROVED'
  }
  ```

### AC6: Exception For Minor Children
**GIVEN** `targetAge < 18` (trẻ chưa vị thành niên)  
**WHEN** user phát nguyện cho trẻ  
**THEN** 
- **ALLOW** mà không cần xác nhận thêm:
  ```typescript
  if (targetAge < 18) {
    return true; // Parental vow allowed
  }
  ```

### AC7: Audit Log For Consent
**GIVEN** adult proxy vow được tạo sau consent  
**WHEN** vow được lưu  
**THEN** 
- Ghi audit:
  ```typescript
  {
    eventType: "ADULT_PROXY_VOW_CREATED_WITH_CONSENT",
    vowType: "VEGETARIAN",
    targetUserId: <target_id>,
    consentObtained: true,
    consentMethod: "EMAIL",
    consentDate: <date>,
    createdAt: <timestamp>
  }
  ```

---

## 🔧 Technical Notes

### Database Schema
```prisma
model Vow {
  id                    String   @id @default(cuid())
  userId                String
  vowType               String
  
  // Proxy vow tracking
  isProxy               Boolean  @default(false)
  targetUserId          String?
  targetUserAge         Int?
  
  // Consent for adult proxies
  requiresConsent       Boolean  @default(false)
  consentObtained       Boolean  @default(false)
  consentObtainedAt     DateTime?
  consentMethod         String?  // EMAIL_INVITATION, etc.
  consentStatus         String?  // PENDING, APPROVED, REJECTED
  
  user User @relation(fields: [userId], references: [id])
  
  @@index([userId, isProxy])
  @@index([targetUserId])
}

model VowConsent {
  id                String   @id @default(cuid())
  vowId             String
  targetUserId      String
  initiatorUserId   String
  status            String   // PENDING, APPROVED, REJECTED
  requestedAt       DateTime @default(now())
  respondedAt       DateTime?
  responseMethod    String   // EMAIL_LINK, IN_APP, etc.
  
  @@unique([vowId, targetUserId])
  @@index([targetUserId, status])
}
```

### Validation Guard
```typescript
// Guard: AdultProxyVowGuard
// Location: apps/api/src/vows-merit/guards/

@Injectable()
export class AdultProxyVowGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const dto = request.body;
    
    if (!dto.isProxy || !dto.targetUserId) {
      return true; // Not a proxy vow
    }
    
    // Get target user age
    const targetUser = await this.prisma.user.findUnique({
      where: { id: dto.targetUserId },
      select: { dateOfBirth: true }
    });
    
    const targetAge = calculateAge(targetUser.dateOfBirth);
    
    // Allow if minor
    if (targetAge < 18) {
      return true;
    }
    
    // Adult: require consent
    const hasConsent = await this.prisma.vowConsent.findFirst({
      where: {
        targetUserId: dto.targetUserId,
        initiatorUserId: request.user.id,
        status: 'APPROVED'
      }
    });
    
    if (!hasConsent) {
      throw new ForbiddenException({
        message: "LUẬT NHÂN QUẢ: Không được phát nguyện thay cho người trưởng thành mà không có sự đồng ý",
        code: "ADULT_PROXY_VOW_REQUIRES_CONSENT",
        targetAge,
        requiresConsent: true
      });
    }
    
    return true;
  }
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Chương về luật nhân quả
- **Q&A Huyền học:** Phát nguyện cho người khác
- **Hướng dẫn thực hành:** Cách chuyển công đức cho người thân

---

## 🏷️ Tags
`#phase-28` `#ngu-dai-phap-bao` `#adult-proxy-vow` `#karma-law` `#consent` `#vows-merit`

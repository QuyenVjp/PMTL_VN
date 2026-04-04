# USE CASE: Borrowed Money Karma Filter
**Module:** `life-liberation`  
**Phase:** 28 - Ngũ Đại Pháp Bảo Enterprise Integration  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp Vụ

Tiền dùng để **phóng sinh** hoặc **in Kinh sách** phải là **"Tịnh Tài"** (Tiền sạch/chính danh).

### ⚠️ Tiền "Bẩn" (Đi Vay/Mượn):
Nếu bạn dùng tiền **đang nợ/mượn** để làm công đức:
- ❌ Công đức bằng **KHÔNG (0)**
- ❌ Thậm chí mắc thêm tội **"ấp ủ hư vinh"** (giả dối)
- ❌ Vì công đức này từ tiền không phải là của bạn

### ✅ Tiền Sạch (Hợp Lệ):
- ✅ Tiền kiếm được từ công việc hợp pháp của bạn
- ✅ Tiền được tặng/thừa kế
- ✅ Tiền mình tiết kiệm từ trước

### Ví Dụ Vi Phạm:
- Đi vay tiền ngân hàng rồi dùng làm công đức
- Mượn bạn bè tiền rồi phóng sinh
- Dùng thẻ tín dụng quá hạn để in Kinh sách

---

## 🎯 Acceptance Criteria

### AC1: Mandatory Confirmation Dialog
**GIVEN** user đang tạo Life Release Event (Phóng Sinh)  
**OR** tạo Donation task (In Kinh)  
**WHEN** họ click "Bắt Đầu"  
**THEN** 
- Hiển thị **bắt buộc** confirmation dialog:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  💰 XÁC NHẬN NGUỒN TIỀN TỊNH TÀI
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Tiền được sử dụng làm công đức phải là:
  "TỊNH TÀI" (Tiền sạch/chính danh)
  
  ❌ KHÔNG ĐƯỢC DÙNG:
  • Tiền đi vay (ngân hàng, bạn bè)
  • Tiền từ thẻ tín dụng quá hạn
  • Tiền mượn
  
  ✅ CHỈ ĐƯỢC DÙNG:
  • Tiền kiếm được từ công việc hợp pháp
  • Tiền được tặng
  • Tiền tiết kiệm của bạn
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ☐ Tôi cam kết số tiền [Số tiền] dùng 
    cho [Phóng Sinh / In Kinh] này là 
    TIỀN TỊNH TÀI của bản thân tôi.
    
  ℹ️  Nếu dùng tiền đi vay/mượn, công đức 
    sẽ bằng KHÔNG và bạn mắc tội hư vinh.
  
  [Hủy]  [Xác Nhận]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC2: Zod Validation Schema
**GIVEN** user submit form với DTO  
**WHEN** backend validate  
**THEN** 
- Zod schema bắt buộc:
  ```typescript
  const LifeReleaseDto = z.object({
    amount: z.number().positive(),
    isCleanMoney: z.boolean().refine(
      (val) => val === true,
      { message: "Bắt buộc xác nhận tiền là Tịnh Tài" }
    ),
    cleanMoneyAcknowledgedAt: z.date()
  });
  ```

### AC3: Checkbox Cannot Be Bypassed In Frontend
**GIVEN** user không tick checkbox  
**WHEN** họ bấm "Xác Nhận"  
**THEN** 
- Nút "Xác Nhận" vẫn **disabled (xám)**
- Không thể click được
- Hiển thị tooltip:
  ```
  ℹ️  Bắt buộc phải tick để xác nhận 
    tiền là Tịnh Tài
  ```

### AC4: API-Level Double Check
**GIVEN** client cố bypass frontend check  
**WHEN** gửi request với `isCleanMoney = false`  
**THEN** 
- Backend trả về `400 Bad Request`:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "Bắt buộc xác nhận tiền sử dụng cho công đức là Tịnh Tài (tiền sạch)",
    "field": "isCleanMoney",
    "code": "CLEAN_MONEY_REQUIRED"
  }
  ```

### AC5: Audit Trail For Every Transaction
**GIVEN** user confirm clean money  
**WHEN** transaction lưu vào database  
**THEN** 
- Ghi audit log:
  ```typescript
  {
    eventType: "LIFE_RELEASE_CREATED",
    amount: 1000,
    isCleanMoneyConfirmed: true,
    confirmedAt: <timestamp>,
    userId: <user_id>,
    ipAddress: <hashed>,
    deviceInfo: <device_hash>
  }
  ```

### AC6: Educational Content
**GIVEN** user hover vào "Tịnh Tài" link  
**WHEN** tooltip/info shows  
**THEN** 
- Giải thích chi tiết:
  ```
  ℹ️  TỊNH TÀI LÀ GÌ?
  
  "Tịnh" = Sạch
  "Tài" = Tiền
  
  = Tiền sạch/chính danh, không mắc bẩn
  
  🚫 VI PHẠM TỊNH TÀI:
  • Dùng tiền vay từ ngân hàng
  • Dùng tiền mượn bạn bè
  • Dùng thẻ tín dụng quá hạn
  • Dùng tiền chiếm/cắp
  • Dùng tiền từ hoạt động bất hợp pháp
  
  ✅ TUÂN THỦ TỊNH TÀI:
  • Lương từ công việc hợp pháp ✓
  • Tiền kinh doanh hợp pháp ✓
  • Tiền tiết kiệm ✓
  • Tiền được tặng/thừa kế ✓
  
  💡 NẾU VI PHẠM:
  Công đức = KHÔNG
  + Mắc tội "ấp ủ hư vinh" (giả dối)
  + Bồ Tát không chứng minh
  ```

---

## 🔧 Technical Notes

### Zod Validation
```typescript
// Location: apps/api/src/life-liberation/dto/create-life-release.dto.ts

import { z } from 'zod';

export const CreateLifeReleaseDto = z.object({
  amount: z.number().int().positive("Số tiền phải lớn hơn 0"),
  species: z.array(z.string()),
  location: z.string(),
  
  // Clean money requirement
  isCleanMoney: z.boolean().refine(
    (val) => val === true,
    {
      message: "Bắt buộc xác nhận tiền sử dụng cho công đức là Tịnh Tài (tiền sạch, chính danh)",
      path: ["isCleanMoney"]
    }
  ),
  cleanMoneyAcknowledgedAt: z.date(),
  
  notes: z.string().optional()
});

export type CreateLifeReleaseDto = z.infer<typeof CreateLifeReleaseDto>;
```

### Database Schema
```prisma
model LifeReleaseEvent {
  id                        String   @id @default(cuid())
  userId                    String
  amount                    Int
  
  // Clean money verification
  isCleanMoneyConfirmed     Boolean  @default(false)
  cleanMoneyConfirmedAt     DateTime?
  cleanMoneyAcknowledgment  String?  // User's statement
  
  // Audit trail
  auditNotes                String?
  createdAt                 DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
  
  @@index([userId, createdAt])
}
```

### NestJS Guard
```typescript
// Guard: CleanMoneyGuard
// Location: apps/api/src/life-liberation/guards/

@Injectable()
export class CleanMoneyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const dto = request.body;
    
    if (!dto.isCleanMoney) {
      throw new BadRequestException({
        message: "Bắt buộc xác nhận tiền là Tịnh Tài",
        code: "CLEAN_MONEY_REQUIRED",
        field: "isCleanMoney"
      });
    }
    
    if (!dto.cleanMoneyAcknowledgedAt) {
      throw new BadRequestException({
        message: "Thiếu timestamp xác nhận",
        code: "MISSING_ACKNOWLEDGMENT_TIMESTAMP"
      });
    }
    
    return true;
  }
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Chương về Tịnh Tài
- **Q&A Huyền học:** Tiền bẩn trong công đức
- **Hướng dẫn thực hành:** Cách xác định tiền sạch

---

## 🏷️ Tags
`#phase-28` `#ngu-dai-phap-bao` `#clean-money` `#pure-wealth` `#karma-filter` `#life-liberation`

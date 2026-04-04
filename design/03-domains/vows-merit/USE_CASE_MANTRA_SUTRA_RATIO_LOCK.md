# USE CASE: Mantra-Sutra Ratio Lock (Giải Kết Chú & Tâm Kinh)
**Module:** `vows-merit`, `content`  
**Phase:** 28 - Ngũ Đại Pháp Bảo Enterprise Integration  
**Source:** Buddhism in Plain Terms [Nguồn 16, 17, 252], Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp Vụ

**Giải Kết Chú** (Jie Jie Zhou / Knot-Dissolving Mantra) dùng để hóa giải oán kết (với chồng, con, đồng nghiệp). Nhiều người nôn nóng niệm tới **108 biến/ngày**.

**NHƯNG** theo luật tâm linh: Nếu không có **Tâm Kinh** (Heart Sutra - trí tuệ Bát Nhã) làm nền tảng, việc niệm *Giải Kết Chú* sẽ:
- ❌ Thiếu từ trường hóa giải
- ❌ Không đủ năng lượng trí tuệ để mở khóa oan kết
- ❌ Thậm chí phản tác dụng (oan gia nghe thấy nhưng không được hóa giải → phẫn nộ hơn)

### Tỷ Lệ Bắt Buộc (Mandatory Ratio):
```
Heart Sutra Count >= (Jie Jie Zhou Count / 5)
```

**Ví dụ:**
- Giải Kết Chú 108 biến → Tâm Kinh phải >= 21 biến
- Giải Kết Chú 49 biến → Tâm Kinh phải >= 10 biến
- Giải Kết Chú 21 biến → Tâm Kinh phải >= 5 biến

---

## 🎯 Acceptance Criteria

### AC1: Validation At Prescription Creation
**GIVEN** user đang tạo/chỉnh sửa Daily Recitation Prescription  
**WHEN** họ set số lượng cho "Giải Kết Chú"  
**THEN** 
- System tự động tính `requiredHeartSutra = Math.ceil(jieJieZhouCount / 5)`
- Real-time validation hiển thị:
  ```
  Giải Kết Chú: 108 biến
  
  ⚠️  Yêu cầu Tâm Kinh tối thiểu: 21 biến
  Hiện tại bạn có: 7 biến ❌
  
  Còn thiếu: 14 biến
  ```

### AC2: Zod Validation Pipe (Backend)
**GIVEN** user submit form với tỷ lệ không hợp lệ  
**WHEN** API nhận request  
**THEN** 
- Zod schema validate:
  ```typescript
  heartSutraCount >= Math.ceil(jieJieZhouCount / 5)
  ```
- Nếu fail, trả về `400 Bad Request`:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "CẢNH BÁO: Không đủ lượng Tâm Kinh làm nền tảng trí tuệ. Việc niệm số lượng lớn Giải Kết Chú sẽ không đạt hiệu quả hóa giải. Hãy tăng Tâm Kinh lên mức tối thiểu 21 biến.",
    "field": "heartSutraCount",
    "required": 21,
    "current": 7,
    "ratio": "1:5 (Heart Sutra : Jie Jie Zhou)"
  }
  ```

### AC3: Frontend Smart Suggestion
**GIVEN** user đang điều chỉnh số lượng Giải Kết Chú  
**WHEN** số lượng thay đổi  
**THEN** 
- Frontend tự động suggest Tâm Kinh:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  💡 ĐIỀU CHỈNH THÔNG MINH
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Bạn vừa tăng Giải Kết Chú lên 108 biến.
  
  Hệ thống khuyến nghị tăng Tâm Kinh lên 21 biến
  để đảm bảo trí tuệ Bát Nhã làm nền tảng hóa giải.
  
  [Tự Động Điều Chỉnh] [Bỏ Qua]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC4: Educational Tooltip
**GIVEN** user hover/tap vào icon "?" bên cạnh Giải Kết Chú  
**WHEN** tooltip hiển thị  
**THEN** 
- Giải thích nguyên lý:
  ```
  ℹ️  TẠI SAO CẦN TÂM KINH?
  
  Giải Kết Chú giống như "chìa khóa" mở oan kết.
  Tâm Kinh là "năng lượng trí tuệ" làm chìa khóa hoạt động.
  
  Không có Tâm Kinh = Chìa khóa không có pin
  → Oan gia nghe thấy nhưng không được giải thoát
  → Có thể phẫn nộ hơn
  
  Tỷ lệ an toàn: 1 Tâm Kinh cho mỗi 5 Giải Kết Chú
  ```

### AC5: Override Warning For Advanced Users
**GIVEN** user là advanced practitioner  
**AND** họ có lý do đặc biệt (ví dụ: đã niệm nhiều Tâm Kinh trước đó)  
**WHEN** họ muốn bypass rule  
**THEN** 
- Cung cấp checkbox override:
  ```
  ⚠️  CHUYÊN GIA
  
  ☐ Tôi hiểu rủi ro và xác nhận:
    - Tôi đã tích lũy đủ trí tuệ Bát Nhã từ trước
    - Hoặc tôi sẽ bổ sung Tâm Kinh trong các ngày tới
    
  [Xác Nhận Bỏ Qua Cảnh Báo]
  ```
- Lưu flag `ratioOverrideAcknowledged: true` vào database

### AC6: Audit Log For Violations
**GIVEN** user bypass ratio rule  
**WHEN** prescription được lưu  
**THEN** 
- Ghi audit log:
  ```typescript
  {
    eventType: "MANTRA_RATIO_VIOLATION",
    prescription: {
      jieJieZhou: 108,
      heartSutra: 7,
      requiredRatio: 21
    },
    override: true,
    acknowledgedAt: <timestamp>,
    userId: <user_id>
  }
  ```

---

## 🔧 Technical Notes

### Zod Validation Schema
```typescript
// DTO: CreateRecitationPrescriptionDto
// Location: apps/api/src/vows-merit/dto/

import { z } from 'zod';

const RecitationPrescriptionSchema = z.object({
  mantras: z.array(z.object({
    mantraCode: z.string(),
    count: z.number().int().positive()
  })),
  ratioOverrideAcknowledged: z.boolean().optional()
}).refine(
  (data) => {
    const jieJieZhou = data.mantras.find(m => m.mantraCode === 'JIE_JIE_ZHOU');
    const heartSutra = data.mantras.find(m => m.mantraCode === 'HEART_SUTRA');
    
    // If no Jie Jie Zhou, no validation needed
    if (!jieJieZhou) return true;
    
    // If override acknowledged, allow bypass
    if (data.ratioOverrideAcknowledged) return true;
    
    // Calculate required Heart Sutra
    const requiredHeartSutra = Math.ceil(jieJieZhou.count / 5);
    const actualHeartSutra = heartSutra?.count || 0;
    
    return actualHeartSutra >= requiredHeartSutra;
  },
  {
    message: "CẢNH BÁO: Không đủ lượng Tâm Kinh làm nền tảng trí tuệ. Việc niệm số lượng lớn Giải Kết Chú sẽ không đạt hiệu quả hóa giải.",
    path: ["mantras"]
  }
);
```

### Frontend Validation Hook
```typescript
// Location: apps/web/src/features/vows-merit/hooks/useMantraRatioValidation.ts

export function useMantraRatioValidation(mantras: Mantra[]) {
  const jieJieZhou = mantras.find(m => m.code === 'JIE_JIE_ZHOU');
  const heartSutra = mantras.find(m => m.code === 'HEART_SUTRA');
  
  if (!jieJieZhou) {
    return { isValid: true, required: 0, current: 0, deficit: 0 };
  }
  
  const required = Math.ceil(jieJieZhou.count / 5);
  const current = heartSutra?.count || 0;
  const deficit = Math.max(0, required - current);
  
  return {
    isValid: deficit === 0,
    required,
    current,
    deficit
  };
}
```

### Database Schema Extension
```prisma
model RecitationPrescription {
  // ... existing fields
  
  // Ratio validation tracking
  ratioOverrideAcknowledged Boolean  @default(false)
  ratioViolationLogged      Boolean  @default(false)
  violationDetails          Json?
}
```

### NestJS Guard
```typescript
// Guard: MantraSutraRatioGuard
// Location: apps/api/src/vows-merit/guards/

@Injectable()
export class MantraSutraRatioGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const dto = request.body;
    
    const jieJieZhou = dto.mantras?.find(m => m.mantraCode === 'JIE_JIE_ZHOU');
    if (!jieJieZhou) return true;
    
    const heartSutra = dto.mantras?.find(m => m.mantraCode === 'HEART_SUTRA');
    const requiredHeartSutra = Math.ceil(jieJieZhou.count / 5);
    const actualHeartSutra = heartSutra?.count || 0;
    
    if (actualHeartSutra < requiredHeartSutra && !dto.ratioOverrideAcknowledged) {
      throw new BadRequestException({
        message: "Tỷ lệ Tâm Kinh không đủ",
        required: requiredHeartSutra,
        current: actualHeartSutra,
        deficit: requiredHeartSutra - actualHeartSutra
      });
    }
    
    return true;
  }
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms [Nguồn 16, 17, 252]
- **Q&A Huyền học:** Cơ chế hóa giải oan kết thông qua trí tuệ Bát Nhã
- **Hướng dẫn thực hành:** Tỷ lệ cân bằng giữa Mantra và Sutra

---

## 🏷️ Tags
`#phase-28` `#ngu-dai-phap-bao` `#mantra-ratio` `#heart-sutra` `#jie-jie-zhou` `#validation-guard` `#vows-merit`

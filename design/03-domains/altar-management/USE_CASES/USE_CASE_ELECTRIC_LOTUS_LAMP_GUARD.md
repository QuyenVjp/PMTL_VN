# USE CASE: Electric Lotus Lamp Timeout & Sequence Guard
**Module:** `altar-management`  
**Phase:** 25 - Micro-Normalization & Specific Karma Measurement  
**Source:** Buddhism in Plain Terms, Hướng dẫn Ngôi Nhà Nhỏ, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp Vụ

Đèn hoa sen bằng điện có thể dùng, nhưng **TUYỆT ĐỐI CẤM bật liên tục 24/24**.

### Trình Tự Bắt Buộc (Mandatory Sequence):
1. ✅ Bật đèn hoa sen điện
2. ✅ Thắp đèn dầu thật
3. ✅ Thắp nhang

### Khi Kết Thúc (Shutdown Sequence):
1. ✅ Nhang chưa cháy hết → Tắt đèn dầu thật
2. ✅ Tắt đèn hoa sen điện

### ⚠️ Hậu Quả Nếu Vi Phạm:
Để đèn hoa sen sáng trong thời gian dài **MÀ KHÔNG CÓ NHANG (HƯƠNG) CHÁY** → Sẽ thu hút vong linh bên ngoài vào nhà.

---

## 🎯 Acceptance Criteria

### AC1: Session Timer Initialization
**GIVEN** user mở giao diện Bàn Thờ Ảo  
**WHEN** họ bấm nút `[Bật Đèn Hoa Sen]`  
**THEN** 
- System khởi tạo `SessionTimer` với state:
  ```typescript
  {
    isLotusLampOn: true,
    lotusLampStartedAt: <timestamp>,
    isIncenseBurning: false,
    incenseStartedAt: null
  }
  ```

### AC2: 10-Minute Warning Without Incense
**GIVEN** `isLotusLampOn = true`  
**AND** `isIncenseBurning = false`  
**WHEN** đã trôi qua **10 phút** kể từ `lotusLampStartedAt`  
**THEN** 
- Gửi Push Notification khẩn cấp (Priority: HIGH):
  ```
  🚨 CẢNH BÁO BÀN THỜ
  
  Tắt đèn hoa sen ngay!
  
  Bật đèn ảo mà không có nhang cháy sẽ chiêu cảm ngạ quỷ.
  
  Vui lòng:
  - Thắp nhang ngay, HOẶC
  - Tắt đèn hoa sen
  
  [Tắt Đèn Ngay] [Tôi Đã Thắp Nhang]
  ```

### AC3: Prevent Session Close With Lamp On
**GIVEN** user muốn kết thúc Session thờ cúng  
**WHEN** họ bấm nút `[Kết Thúc]`  
**AND** `isLotusLampOn = true`  
**THEN** 
- Chặn hành động, hiển thị modal:
  ```
  ❌ CHƯA THỂ KẾT THÚC
  
  Đèn hoa sen vẫn đang bật.
  Bạn phải tắt đèn hoa sen trước khi kết thúc Session.
  
  [Quay Lại]  [Tắt Đèn & Kết Thúc]
  ```

### AC4: Proper Sequence Tracking
**GIVEN** user thực hiện đúng trình tự  
**WHEN** họ:
1. Bật đèn hoa sen → `isLotusLampOn = true`
2. Bật đèn dầu → `isOilLampOn = true` (optional tracking)
3. Thắp nhang → `isIncenseBurning = true`, clear any pending warnings
4. Tắt đèn dầu → `isOilLampOn = false`
5. Tắt đèn hoa sen → `isLotusLampOn = false`

**THEN** 
- Không có cảnh báo nào được kích hoạt
- Session được ghi nhận là "Hoàn thành đúng nghi thức"

### AC5: Audit Violation Records
**GIVEN** user để đèn hoa sen bật mà không thắp nhang quá 10 phút  
**WHEN** hệ thống phát hiện vi phạm  
**THEN** 
- Ghi vào audit log:
  ```json
  {
    "eventType": "ALTAR_SEQUENCE_VIOLATION",
    "violation": "LOTUS_LAMP_WITHOUT_INCENSE",
    "duration": "15 minutes",
    "timestamp": "<ISO timestamp>",
    "warningsSent": 1,
    "resolved": false
  }
  ```

---

## 🔧 Technical Notes

### State Machine (Frontend)
```typescript
// Location: apps/web/src/features/altar/state/altar-session.ts

interface AltarSessionState {
  isLotusLampOn: boolean;
  lotusLampStartedAt: Date | null;
  isOilLampOn: boolean;
  isIncenseBurning: boolean;
  incenseStartedAt: Date | null;
  warnings: AltarWarning[];
}

const LAMP_WITHOUT_INCENSE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

// Timer logic:
// - setInterval every 1 minute to check state
// - If isLotusLampOn && !isIncenseBurning
//   - Calculate elapsed time since lotusLampStartedAt
//   - If > 10 min → trigger warning
```

### Push Notification Integration
```typescript
// Use existing notification module
// Priority: HIGH
// Category: ALTAR_WARNING
// Action buttons:
//   1. "Tắt Đèn Ngay" → call turnOffLotusLamp()
//   2. "Tôi Đã Thắp Nhang" → call markIncenseBurning()
```

### Database Schema Extension
```prisma
model AltarSession {
  id                   String   @id @default(cuid())
  userId               String
  startedAt            DateTime @default(now())
  endedAt              DateTime?
  
  // Lamp & incense tracking
  isLotusLampOn        Boolean  @default(false)
  lotusLampStartedAt   DateTime?
  isIncenseBurning     Boolean  @default(false)
  incenseStartedAt     DateTime?
  
  // Violation tracking
  hasSequenceViolation Boolean  @default(false)
  violationDetails     Json?
  
  user User @relation(fields: [userId], references: [id])
  
  @@index([userId, startedAt])
}
```

### Validation Guard (Shutdown Prevention)
```typescript
// Guard: AltarSessionCloseGuard
// Location: apps/api/src/altar-management/guards/

export class AltarSessionCloseGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const session = request.body.session;
    
    if (session.isLotusLampOn) {
      throw new BadRequestException({
        message: "Không thể kết thúc Session khi đèn hoa sen vẫn đang bật. Vui lòng tắt đèn trước.",
        code: "LOTUS_LAMP_STILL_ON"
      });
    }
    
    return true;
  }
}
```

---

## 📚 References

- **Giáo lý gốc:** Hướng dẫn Ngôi Nhà Nhỏ - Chương về Bàn thờ gia đình
- **Q&A Huyền học:** Nguyên tắc sử dụng đèn điện trên bàn thờ
- **Hướng dẫn thực hành:** Trình tự thắp hương đúng cách

---

## 🏷️ Tags
`#phase-25` `#altar-management` `#lotus-lamp` `#sequence-guard` `#timeout-warning` `#spirit-protection`

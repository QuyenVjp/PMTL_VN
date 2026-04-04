# USE CASE: Impure Location Geofence
**Module:** `vows-merit`, `content`  
**Phase:** 28 - Ngũ Đại Pháp Bảo Enterprise Integration  
**Source:** Buddhism in Plain Terms [Nguồn 22], Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp Vụ

**TUYỆT ĐỐI CẤM** niệm Kinh trong:
- ❌ Nhà vệ sinh / Toilet
- ❌ Nhà tắm / Bathroom
- ❌ Phòng bếp đang nấu đồ mặn

### Lý Do:
- Những nơi này có **tạp khí** (impure energy)
- Niệm Kinh ở đây là **bất kính** với Phật Bồ Tát
- Năng lượng kinh văn bị **nhiễm bẩn**, không phát huy công đức
- Có thể chiêu cảm vong linh không tốt

### Ngoại Lệ:
- ✅ Có thể niệm **Chú Đại Bi** nhẹ nhàng khi đi vệ sinh (để bảo vệ)
- ✅ Nhưng **TUYỆT ĐỐI KHÔNG** niệm Kinh dài như Tâm Kinh, Lễ Phật

---

## 🎯 Acceptance Criteria

### AC1: Mandatory Location Confirmation
**GIVEN** user mở E-Reader để niệm Kinh (không phải Chú Đại Bi)  
**WHEN** app khởi động recitation mode  
**THEN** 
- Bắt buộc hiển thị Hard-Block Checkbox:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📍 XÁC NHẬN VỊ TRÍ TỤNG KINH
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ☐ Tôi xác nhận hiện TÔI KHÔNG ở trong:
    • Nhà vệ sinh / Toilet
    • Nhà tắm / Bathroom
    • Phòng bếp đang nấu đồ mặn
  
  ℹ️  Lý do: Niệm Kinh trong nơi bất tịnh là 
     bất kính với Phật Bồ Tát và không phát huy 
     công đức.
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  [Hủy]  [Xác Nhận & Bắt Đầu]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```
- Nút "Bắt Đầu" chỉ active khi checkbox được tick

### AC2: Recitation Type Detection
**GIVEN** app cần quyết định có show location check hay không  
**WHEN** phân tích loại kinh/chú  
**THEN** 
- Apply logic:
  ```typescript
  const REQUIRES_LOCATION_CHECK = [
    'HEART_SUTRA',           // Tâm Kinh
    'AMITABHA_SUTRA',        // Kinh A Di Đà
    'REPENTANCE_TEXT',       // Lễ Phật Đại Sám Hối Văn
    'UNIVERSAL_DOOR',        // Phẩm Phổ Môn
    // ... other long sutras
  ];
  
  const EXEMPT_FROM_CHECK = [
    'DA_BEI_ZHOU',          // Chú Đại Bi (có thể niệm mọi nơi để bảo vệ)
    'PROTECTION_MANTRA',     // Các chú bảo hộ ngắn
  ];
  ```

### AC3: Daily Reminder Persistence
**GIVEN** user đã tick checkbox một lần trong ngày  
**WHEN** họ mở E-Reader lần thứ 2 trong cùng ngày  
**THEN** 
- Option 1 (Strict): Vẫn phải tick lại mỗi session
- Option 2 (Balanced): Chỉ nhắc lần đầu tiên trong ngày
  - Lưu flag `locationConfirmedToday: true` vào localStorage
  - Reset vào 00:00 mỗi ngày

### AC4: Educational Tooltip
**GIVEN** user hover vào icon "?" bên cạnh checkbox  
**WHEN** tooltip hiển thị  
**THEN** 
- Giải thích chi tiết:
  ```
  ℹ️  TẠI SAO CẦN XÁC NHẬN VỊ TRÍ?
  
  🚫 NƠI CẤM TUYỆT ĐỐI:
  
  • Nhà vệ sinh: Tạp khí nặng nhất
  • Nhà tắm: Khí ẩm ướt, bất tịnh
  • Bếp nấu mặn: Sát khí từ thịt cá
  
  ✅ NƠI PHÙ HỢP:
  
  • Phòng khách sạch sẽ
  • Phòng ngủ (nếu không có vật bất tịnh)
  • Ban thờ gia đình
  • Nơi yên tĩnh ngoài trời
  
  💡 ĐẶC BIỆT:
  
  Chú Đại Bi có thể niệm mọi nơi để bảo vệ,
  kể cả khi đi vệ sinh (niệm nhẹ trong tâm).
  ```

### AC5: Audit Log For Compliance
**GIVEN** user tick checkbox và bắt đầu niệm  
**WHEN** session bắt đầu  
**THEN** 
- Ghi audit log:
  ```typescript
  {
    eventType: "RECITATION_STARTED",
    recitationType: "HEART_SUTRA",
    locationConfirmed: true,
    confirmedAt: <timestamp>,
    userId: <user_id>,
    deviceInfo: <device_info>
  }
  ```

### AC6: Exemption For Emergency Situations
**GIVEN** user đang trong tình huống khẩn cấp (ví dụ: động đất, hỏa hoạn)  
**WHEN** họ cần niệm Chú bảo hộ ngay  
**THEN** 
- Cung cấp bypass cho tình huống khẩn cấp:
  ```
  ⚠️  TÌNH HUỐNG KHẨN CẤP
  
  Nếu bạn đang trong tình huống nguy hiểm cần 
  niệm Chú bảo hộ ngay lập tức:
  
  [Bỏ Qua - Khẩn Cấp]
  ```
- Chỉ cho phép bypass với **Chú Đại Bi** và **Chú Bảo Hộ ngắn**

---

## 🔧 Technical Notes

### Frontend Component
```typescript
// Location: apps/web/src/features/vows-merit/components/LocationConfirmationModal.tsx

export function LocationConfirmationModal({ 
  recitationType, 
  onConfirm, 
  onCancel 
}: Props) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  // Check if this recitation type requires location check
  const requiresCheck = REQUIRES_LOCATION_CHECK.includes(recitationType);
  
  if (!requiresCheck) {
    // Auto-confirm for exempt types (Da Bei Zhou, etc.)
    useEffect(() => onConfirm(), []);
    return null;
  }
  
  // Check if already confirmed today
  const confirmedToday = localStorage.getItem('locationConfirmedToday');
  const today = format(new Date(), 'yyyy-MM-dd');
  
  if (confirmedToday === today) {
    // Skip modal if already confirmed today
    useEffect(() => onConfirm(), []);
    return null;
  }
  
  return (
    <Modal open>
      <ModalHeader>📍 Xác Nhận Vị Trí Tụng Kinh</ModalHeader>
      <ModalBody>
        <Checkbox
          checked={isConfirmed}
          onChange={(e) => setIsConfirmed(e.target.checked)}
          label="Tôi xác nhận hiện TÔI KHÔNG ở trong nhà vệ sinh, nhà tắm hay phòng bếp"
        />
        <InfoTooltip>
          {/* Educational content */}
        </InfoTooltip>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onCancel}>Hủy</Button>
        <Button 
          variant="primary" 
          disabled={!isConfirmed}
          onClick={() => {
            localStorage.setItem('locationConfirmedToday', today);
            onConfirm();
          }}
        >
          Xác Nhận & Bắt Đầu
        </Button>
      </ModalFooter>
    </Modal>
  );
}
```

### Recitation Type Config
```typescript
// Location: packages/shared/src/constants/recitation-types.ts

export const REQUIRES_LOCATION_CHECK = [
  'HEART_SUTRA',
  'AMITABHA_SUTRA',
  'REPENTANCE_TEXT',
  'UNIVERSAL_DOOR',
  'DIAMOND_SUTRA',
] as const;

export const EXEMPT_FROM_LOCATION_CHECK = [
  'DA_BEI_ZHOU',          // Chú Đại Bi
  'PROTECTION_MANTRA',    // Chú Bảo Hộ
  'REBIRTH_MANTRA',       // Chú Vãng Sanh
] as const;

export function requiresLocationCheck(recitationType: string): boolean {
  return REQUIRES_LOCATION_CHECK.includes(recitationType as any);
}
```

### Database Schema
```prisma
model RecitationSession {
  id                  String   @id @default(cuid())
  userId              String
  recitationType      String
  startedAt           DateTime @default(now())
  endedAt             DateTime?
  
  // Location confirmation tracking
  locationConfirmed   Boolean  @default(false)
  locationConfirmedAt DateTime?
  
  user User @relation(fields: [userId], references: [id])
  
  @@index([userId, startedAt])
}
```

### Settings Option
```typescript
// User preference to control strictness
interface RecitationSettings {
  locationCheckMode: 'strict' | 'daily' | 'off';
  // strict: Ask every session
  // daily: Ask once per day
  // off: Never ask (for advanced users who understand the rules)
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms [Nguồn 22]
- **Q&A Huyền học:** Nơi cấm niệm Kinh
- **Hướng dẫn thực hành:** Cách chọn địa điểm tụng kinh phù hợp

---

## 🏷️ Tags
`#phase-28` `#ngu-dai-phap-bao` `#location-check` `#impure-location` `#hard-block` `#vows-merit`

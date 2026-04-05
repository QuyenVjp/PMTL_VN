# Quy Tắc Vệ Sinh Sách Kinh Vật Lý — Physical Sutra Handling Rules
> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Phase 47)
> **Trạng thái:** Onboarding checklist + enforcement
> **Cập nhật:** 2026-04-06

## Purpose
Đối với Kinh sách vật lý (bản cứng), quy tắc tôn kính cực kỳ khắt khe. Không được đặt sách dưới các cuốn sách khác; không được vừa ăn vừa đọc; không được úp mặt Kinh xuống bàn thành hình "Nhân" hay gấp nếp trang; **TUYỆT ĐỐI CẤM** dùng nước bọt dính vào ngón tay để lật trang.

## Owner module
`content` — sutra digital + physical form management

## Actors
- User (nhân vật đọc Kinh)
- System (onboarding contract)
- Admin (monitoring)

## Trigger
User thỉnh Sách Kinh bản cứng hoặc quản lý tài liệu Kinh thánh

## Business Rules

| Rule | Detail |
|------|--------|
| Never Stack Under | Kinh KHÔNG được đặt dưới các cuốn sách khác |
| Separate Eating | KHÔNG vừa ăn vừa đọc Kinh |
| No Bent Spine | KHÔNG gấp nếp Kinh hay đặt mặt Kinh xuống bàn (hình "Nhân") |
| Ban Saliva Touch | **TUYỆT ĐỐI** không dùng nước bọt lật trang |
| Page Turning Tool | Sử dụng thẻ kẹp sách (bookmark stick) để lật trang |

## Input Contract

```typescript
interface SutraPhysicalHandlingContractDto {
  userId: string;
  sutraTitle: string;
  acknowledgeNoStackUnder: boolean;
  acknowledgeNoEatingWhileReading: boolean;
  acknowledgeNoFoldingSpine: boolean;
  acknowledgeNosalivaFinger: boolean;
  useBookmarkStick: boolean;
}

interface SutraDeliveryAcknowledgmentDto {
  userId: string;
  sutraId: string;
  contractSigned: boolean;
  signedAt: Date;
}
```

## Write Path

```
POST /content/sutra/request-physical
  Input: User requests physical sutra

  1. Display E-Signature Modal (Hợp đồng Tâm linh):
     ☐ Tôi cam kết KHÔNG dùng nước bọt dính vào tay để lật trang sách
     ☐ Tôi cam kết dùng thẻ kẹp sách (bookmark), KHÔNG gấp nếp hay úp mặt Kinh
     ☐ Tôi cam kết KHÔNG vừa ăn vừa đọc Kinh
     ☐ Tôi cam kết đặt Kinh lên cao nhất (không dưới sách khác)

  2. User tick all 4 checkboxes → enable [Thỉnh Kinh]

  3. POST /content/sutra/acknowledge
     → Store acknowledgment in DB
     → Send delivery order

POST /content/sutra/delivery-confirm
  Input: SutraDeliveryAcknowledgmentDto
  → Log: User confirmed receipt
```

## FE Behavior

```
[Yêu Cầu Thỉnh Sách Kinh Bản Cứng]
  ↓
[Modal: Hợp Đồng Tâm Linh]
┌────────────────────────────────┐
│ 📖 HỢP ĐỒNG TÔN KÍNH KINH SÁCH  │
│                                │
│ Bạn sắp nhận Sách Kinh bản      │
│ cứng. Vui lòng cam kết:        │
│                                │
│ [x] Không dùng nước bọt lật    │
│     trang. Dùng thẻ kẹp sách. │
│                                │
│ [x] Không gấp nếp hay úp mặt   │
│     Kinh xuống bàn.            │
│                                │
│ [x] Không vừa ăn vừa đọc.     │
│                                │
│ [x] Kinh đặt lên cao nhất,     │
│     không dưới sách khác.      │
│                                │
│ [Tôi Cam Kết - Thỉnh Kinh]   │
│ [Hủy]                          │
└────────────────────────────────┘
```

## Schema Notes

```prisma
model SutraPhysicalHandlingAgreement {
  id                          String   @id @default(cuid())
  userId                      String
  sutraId                     String
  acknowledgeNoStackUnder      Boolean @default(false)
  acknowledgeNoEatingWhile     Boolean @default(false)
  acknowledgeNoFoldingSpine    Boolean @default(false)
  acknowledgeNoSalivaFinger    Boolean @default(false)
  agreedAt                    DateTime @default(now())
}

model SutraDeliveryLog {
  id          String   @id @default(cuid())
  userId      String
  sutraId     String
  deliveredAt DateTime
  confirmedAt DateTime?
}
```

## Audit
Mỗi lần contract signed → log; mỗi lần deliver → log

## Error Codes

| Code | Message |
|------|---------|
| SUTRA_CONTRACT_NOT_SIGNED | Vui lòng cam kết các điều khoản tôn kính trước khi thỉnh Kinh. |

## Notes
- E-signature là binding commitment
- Nếu user violate (report từ monitoring), có thể suspend sutra ordering

## Related
- `content/sutra-physical-z-index-rule.md` — storage stacking rules
- `content/sutra-anti-pocket-underarm-guard.md` — disrespectful placement detection

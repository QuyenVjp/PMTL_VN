# FINANCIAL-TRANSFER-DECLARATION

## Owner
- `vows-merit` (Life Liberation)

## Purpose
Tuyên thệ Chuyển giao Tài chính (Financial Transfer Declaration for Proxy Liberation)

---

## Business Rule

### Rule - Proxy Liberation with Own Money → Must Declare
**Nghiệp vụ:**
- Dùng tiền túi của mình mua cá đi thả cho người thân (để trị bệnh cho họ)
- Nếu **KHÔNG khấn rõ ràng** ở nhà trước khi đi:
  - Hệ thống tâm linh tính công đức cho người bỏ tiền (người đi thả)
  - Người bệnh sẽ **KHÔNG nhận được** công đức

**Solution:**
- Đọc to trước bàn thờ (hoặc tâm hương):
  *"Con là [Tên con] sẽ bỏ ra [Số tiền] cho [Tên người bệnh]. Xin Bồ Tát chứng minh số tiền này coi như là của [Tên người bệnh]"*

---

## UX Flow

```
User tạo Proxy Liberation:
  fundedByMe = true
  beneficiaryName = "Mẹ của con"
  ↓
Block UI until Declaration:
  [Khấn chuyển giao tài chính]
  ↓
Modal hiện:
  "Bắt buộc phải đọc to trước bàn thờ:
   'Con là [Tên] sẽ bỏ ra [Số tiền] cho [Mẹ].
    Xin Bồ Tát chứng minh số tiền này coi như
    là của [Mẹ]'"
  ↓
User tick: [x] Tôi đã khấn
  ↓
Proceed
```

---

## Schema Hints

```prisma
model LifeReleaseJournal {
  // ... existing
  isProxy                Boolean @default(false)
  beneficiaryName        String?
  fundedByMe             Boolean @default(false)
  financialTransferDeclared Boolean @default(false)
  declaredAt             DateTime?
}
```

---

## Service Logic

```typescript
export class ProxyLiberationService {
  async createProxyLiberation(
    userId: string,
    dto: CreateProxyLiberationDto
  ) {
    if (dto.fundedByMe && !dto.financialTransferDeclared) {
      throw new BadRequestException(
        'Bắt buộc phải khấn chuyển giao tài chính trước khi proceed.'
      );
    }

    return this.prisma.lifeReleaseJournal.create({
      data: {
        userId,
        isProxy: true,
        beneficiaryName: dto.beneficiaryName,
        fundedByMe: dto.fundedByMe,
        financialTransferDeclared: dto.financialTransferDeclared,
        declaredAt: dto.financialTransferDeclared ? new Date() : null,
        ...dto,
      },
    });
  }
}
```

---

## UI Components

```
┌────────────────────────────────────────────┐
│  ⚠️ BẮT BUỘC: Khấn chuyển giao tài chính │
├────────────────────────────────────────────┤
│  Bạn đang dùng tiền của mình để phóng     │
│  sinh thay cho người khác.                │
│                                            │
│  Nếu KHÔNG khấn, công đức sẽ về bạn,     │
│  người thụ hưởng sẽ KHÔNG nhận được.      │
│                                            │
│  Hãy đọc to trước bàn thờ:                │
│                                            │
│  "Con là [Nguyễn Văn A] sẽ bỏ ra         │
│   [500.000đ] cho [Mẹ của con].           │
│   Xin Bồ Tát chứng minh số tiền này      │
│   coi như là của [Mẹ của con]."          │
│                                            │
│  [x] Tôi đã khấn trước bàn thờ           │
│                                            │
│  [Tiếp tục]                               │
└────────────────────────────────────────────┘
```

---

## References
- External source: Master Lu teachings về phóng sinh thay, chuyển giao công đức

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 7 Logic 10

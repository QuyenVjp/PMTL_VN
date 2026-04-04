# PROXY-KARMIC-BACKLASH

## Owner
- `vows-merit` (Proxy Little House)

## Purpose
Phản lực Nghiệp chướng khi Niệm Thay (Proxy Karmic Backlash Rule) - Auto-defense mechanism

---

## Business Rule

### Rule - Proxy Chanting Creates Karmic Debt for Helper
**Nghiệp vụ [Nguồn: Intro to Guan Yin Citta]:**
- Khi niệm TPT giúp một người đang bệnh nặng
- Linh tính trên người đó rất dễ nhảy sang chiếm xác người niệm
- **Tự vệ bắt buộc:**
  - Người niệm PHẢI tự động cộng thêm **3-7 TPT** cho Oan gia trái chủ của chính mình
  - Đây là chi phí tự vệ (defense cost) không thể tránh khỏi

---

## Schema Hints

```prisma
model LittleHouse {
  // ... existing fields
  isProxy         Boolean @default(false)
  proxyBacklashLH Int?    // Auto-generated defense LH count (3-7)
}

model ProxyBacklashDebt {
  id              String   @id
  publicId        String   @unique
  userId          String
  sourceLHId      String   // Original proxy LH that triggered this
  defenseLHCount  Int      // 3-7
  completed       Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
  sourceLH LittleHouse @relation(fields: [sourceLHId], references: [id])

  @@index([userId])
  @@map("proxy_backlash_debts")
}
```

---

## Service Logic

```typescript
export class ProxyLittleHouseService {
  async createProxyLH(userId: string, dto: CreateProxyLHDto) {
    // Create the proxy LH
    const proxyLH = await this.prisma.littleHouse.create({
      data: {
        userId,
        isProxy: true,
        recipientName: dto.beneficiaryName,
        ...dto,
      },
    });

    // Auto-generate backlash defense debt
    const defenseLHCount = this.calculateDefenseCost(dto);

    await this.prisma.proxyBacklashDebt.create({
      data: {
        userId,
        sourceLHId: proxyLH.id,
        defenseLHCount,
      },
    });

    // Update user's debt ledger
    await this.debtLedgerService.addDebt(userId, {
      type: 'PROXY_DEFENSE_BACKLASH',
      amount: defenseLHCount,
      reason: `Tự vệ sau khi niệm thay cho ${dto.beneficiaryName}`,
      sourceLHId: proxyLH.id,
    });

    // Send notification
    await this.notificationService.send(userId, {
      title: 'Tự động tạo nợ tự vệ',
      body: `Bạn cần niệm thêm ${defenseLHCount} TPT cho chính mình để tự vệ`,
      priority: 'HIGH',
    });

    return proxyLH;
  }

  private calculateDefenseCost(dto: CreateProxyLHDto): number {
    // Base defense: 3-7 LH
    const base = 5; // Middle of range

    // Increase if beneficiary is seriously ill
    if (dto.beneficiarySeverity === 'CRITICAL') {
      return 7;
    }

    // Decrease for minor issues
    if (dto.beneficiarySeverity === 'MINOR') {
      return 3;
    }

    return base;
  }
}
```

---

## UI Components

### Auto-Defense Warning (Pre-creation)
```
┌────────────────────────────────────────────┐
│  ⚠️ CẢNH BÁO: Niệm thay có rủi ro        │
├────────────────────────────────────────────┤
│  Bạn đang tạo TPT niệm thay cho:          │
│  [Bà ngoại - Bệnh nặng]                   │
│                                            │
│  Linh tính trên người họ có thể nhảy sang│
│  chiếm xác người niệm.                    │
│                                            │
│  Hệ thống sẽ TỰ ĐỘNG tạo nợ tự vệ:      │
│  • 7 TPT cho Oan gia trái chủ của BẠN    │
│                                            │
│  Bạn có chắc muốn tiếp tục?               │
│                                            │
│  [Hủy] [Tôi hiểu - Tiếp tục]             │
└────────────────────────────────────────────┘
```

### Auto-Generated Debt Notification
```
┌────────────────────────────────────────────┐
│  🛡️ Đã tự động tạo nợ tự vệ              │
├────────────────────────────────────────────┤
│  Bạn vừa tạo TPT niệm thay cho:           │
│  [Bà ngoại]                               │
│                                            │
│  Hệ thống đã tự động thêm vào sổ nợ:     │
│  • 7 TPT cho "Oan gia trái chủ của bạn"  │
│  • Lý do: Tự vệ sau khi niệm thay         │
│                                            │
│  Hãy ưu tiên niệm các TPT tự vệ này      │
│  trước để bảo vệ bản thân.                │
│                                            │
│  [Niệm TPT tự vệ] [Xem sổ nợ]            │
└────────────────────────────────────────────┘
```

### Debt Ledger Entry
```
┌────────────────────────────────────────────┐
│  📒 Sổ Nợ Tiểu Phương Tử                 │
├────────────────────────────────────────────┤
│  Tổng nợ hiện tại: 12 TPT                │
│                                            │
│  Chi tiết:                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                            │
│  🛡️ Tự vệ niệm thay (7 TPT)              │
│     Người nhận: Bà ngoại                  │
│     Ngày: 2026-04-04                      │
│     Trạng thái: Chưa hoàn thành          │
│     [Niệm TPT] [Chi tiết]                │
│                                            │
│  🏠 Nhà bị ma trêu (5 TPT)                │
│     Ngày: 2026-04-01                      │
│     Trạng thái: Đã niệm 3/5 TPT          │
│     [Niệm tiếp] [Chi tiết]               │
│                                            │
└────────────────────────────────────────────┘
```

---

## References
- Source: Intro to Guan Yin Citta - Proxy chanting risks
- `design/03-domains/content/REFERENCES/LITTLE-HOUSE-INVALIDATION-FLOW.md`

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 9 Logic 8

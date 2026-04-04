# MERIT-GATED-MANTRAS

## Owner
- `wisdom-qa` (Prescription Engine) + `vows-merit`

## Purpose
Engine Kê đơn dựa trên Mức độ Công Đức (Merit Balance Check for Advanced Mantras)

---

## Business Rule 1: Merit Prerequisites

### Rule - Advanced Mantras Require Merit Foundation
**Nghiệp vụ [Nguồn: Intro to Guan Yin Citta]:**
- 2 Thần chú cao cấp:
  - **Đại Cát Tường Thiên Nữ Chú** (Cầu thoát nghèo/tình duyên)
  - **Công Đức Bảo Sơn Thần Chú** (Chuyển việc thiện thành công đức)
  
- **Điều kiện tiên quyết:**
  - Người niệm **BẮT BUỘC** phải có nền tảng làm nhiều việc thiện/công đức từ trước
  - Nếu không đủ công đức → niệm không linh nghiệm

---

## Business Rule 2: Age-Based Exemption

### Rule - Children & Unborn Bypass Merit Check
**Nghiệp vụ [Nguồn: Intro to Guan Yin Citta]:**
- **Ngoại lệ cho trẻ nhỏ:**
  - Niệm *Công Đức Bảo Sơn Thần Chú* cho **thai nhi hoặc trẻ em < 5 tuổi**
  - Bài chú sẽ lấy thiện căn từ kiếp trước của đứa bé chuyển thành công đức
  - **KHÔNG cần** điều kiện công đức từ người niệm

---

## Schema Hints

```prisma
enum MantraType {
  DA_BEI_ZHOU
  XIN_JING
  DA_JI_XIANG_TIAN_NU_ZHOU      // Merit-gated
  GONG_DE_BAO_SHAN_SHEN_ZHOU    // Merit-gated (with age exemption)
  WANG_SHENG_ZHOU
  QI_YUAN_ZHEN_YAN
  XIAO_ZAI_JI_XIANG_ZHOU
}

model MeritLedger {
  id                String   @id
  publicId          String   @unique
  userId            String
  totalGoodDeeds    Int      @default(0) // Số lượng việc thiện
  totalLifeLiberation Int    @default(0) // Số lần phóng sinh
  totalVolunteerHours Int    @default(0) // Giờ làm tình nguyện
  meritScore        Int      @default(0) // Điểm công đức tổng hợp
  lastUpdated       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
  @@unique([userId])
  @@map("merit_ledgers")
}

model RecitationTask {
  id              String     @id
  userId          String
  mantraType      MantraType
  isProxy         Boolean    @default(false)
  proxyAge        Int?       // For exemption check
  proxyStatus     String?    // "UNBORN" for exemption
  meritCheckBypassed Boolean @default(false)
  createdAt       DateTime   @default(now())

  user User @relation(fields: [userId], references: [id])
  @@map("recitation_tasks")
}
```

---

## Service Logic

```typescript
export class RecitationPrescriptionEngine {
  private readonly MERIT_GATED_MANTRAS = [
    MantraType.DA_JI_XIANG_TIAN_NU_ZHOU,
    MantraType.GONG_DE_BAO_SHAN_SHEN_ZHOU,
  ];

  private readonly MERIT_THRESHOLD = 50; // Configurable

  async prescribeMantra(userId: string, dto: PrescribeMantraDto) {
    // Check if mantra is merit-gated
    if (this.MERIT_GATED_MANTRAS.includes(dto.mantraType)) {
      // Check age exemption for Gong De Bao Shan
      if (
        dto.mantraType === MantraType.GONG_DE_BAO_SHAN_SHEN_ZHOU &&
        dto.isProxy &&
        (dto.proxyStatus === 'UNBORN' || (dto.proxyAge && dto.proxyAge < 5))
      ) {
        // Bypass merit check for unborn/children < 5
        return this.createTask(userId, dto, { meritCheckBypassed: true });
      }

      // Check merit balance
      const meritLedger = await this.prisma.meritLedger.findUnique({
        where: { userId },
      });

      if (!meritLedger || meritLedger.meritScore < this.MERIT_THRESHOLD) {
        throw new BadRequestException({
          code: 'INSUFFICIENT_MERIT',
          message:
            'Cảnh báo: Thần chú này yêu cầu gốc rễ công đức lớn để linh ứng. ' +
            'Hệ thống khuyến nghị bạn nên tập trung niệm Đại Bi, Tâm Kinh và ' +
            'tăng cường Phóng sinh/Làm việc thiện trước.',
          currentMerit: meritLedger?.meritScore || 0,
          requiredMerit: this.MERIT_THRESHOLD,
        });
      }
    }

    return this.createTask(userId, dto, { meritCheckBypassed: false });
  }

  private async createTask(
    userId: string,
    dto: PrescribeMantraDto,
    meta: { meritCheckBypassed: boolean }
  ) {
    return this.prisma.recitationTask.create({
      data: {
        userId,
        mantraType: dto.mantraType,
        isProxy: dto.isProxy,
        proxyAge: dto.proxyAge,
        proxyStatus: dto.proxyStatus,
        meritCheckBypassed: meta.meritCheckBypassed,
      },
    });
  }
}
```

---

## UI Components

### Merit Warning (Soft Block)
```
┌────────────────────────────────────────────┐
│  ⚠️ CẢNH BÁO: Thiếu công đức nền tảng    │
├────────────────────────────────────────────┤
│  Bài: Đại Cát Tường Thiên Nữ Chú         │
│                                            │
│  Thần chú này yêu cầu GỐC RỄ CÔNG ĐỨC    │
│  LỚN để linh ứng.                         │
│                                            │
│  Điểm công đức của bạn: 15/50            │
│  ━━━━━━━━━━━━━━                        │
│  [██████░░░░░░░░] 30%                    │
│                                            │
│  Khuyến nghị:                             │
│  • Tập trung niệm Đại Bi, Tâm Kinh       │
│  • Tăng cường Phóng sinh                  │
│  • Làm nhiều việc thiện hơn               │
│                                            │
│  [Hiểu rồi] [Xem hướng dẫn tăng công đức]│
└────────────────────────────────────────────┘
```

### Age Exemption (Auto-bypass)
```
┌────────────────────────────────────────────┐
│  ✅ Đặc biệt cho trẻ nhỏ                  │
├────────────────────────────────────────────┤
│  Bài: Công Đức Bảo Sơn Thần Chú          │
│  Người nhận: Con bé 3 tuổi               │
│                                            │
│  Trẻ em dưới 5 tuổi KHÔNG cần điều kiện  │
│  công đức từ người niệm.                  │
│                                            │
│  Bài chú sẽ lấy thiện căn từ kiếp trước  │
│  của bé chuyển thành công đức bảo vệ.    │
│                                            │
│  Đã tự động thêm vào công khóa.          │
│                                            │
│  [OK]                                     │
└────────────────────────────────────────────┘
```

---

## References
- Source: Intro to Guan Yin Citta - Advanced mantra prerequisites
- `design/03-domains/vows-merit/REFERENCES/ANIMAL-KARMA-CALCULATOR.md`

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 9 Logic 4-5

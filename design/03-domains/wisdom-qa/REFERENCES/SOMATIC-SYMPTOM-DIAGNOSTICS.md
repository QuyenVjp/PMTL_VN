# SOMATIC-SYMPTOM-DIAGNOSTICS

## Owner
- `wisdom-qa` (Prescription Engine)

## Purpose
Engine Chẩn Đoán Triệu Chứng Thể Chất Tâm Linh (Somatic & Emotional Diagnostics) - Physical symptoms → LH prescription

---

## Business Rule

### Rule - Fixed LH Prescription per Symptom
**Nghiệp vụ [Nguồn: Intro to Guan Yin Citta]:**
- Triệu chứng cơ thể không rõ nguyên nhân y khoa → Nghiệp chướng/Linh tính
- **Mapping triệu chứng → Số lượng TPT cố định:**

| Triệu chứng | Số TPT bắt buộc | Người nhận |
|-------------|-----------------|------------|
| Đau thắt lưng/vai gáy (khám bác sĩ bình thường) | 7-9 | Oan gia trái chủ của [Tên] |
| Hay nổi cáu vô cớ (Losing temper) | 7+ | Oan gia trái chủ của [Tên] |
| Đau đầu / Sốt (Headache / Fever) | 7+ | Oan gia trái chủ của [Tên] |
| Mất ngủ / Ác mộng liên tục | 7-9 | Oan gia trái chủ của [Tên] |
| Trầm cảm / Lo âu không rõ lý do | 9-13 | Oan gia trái chủ của [Tên] |

---

## Schema Hints

```prisma
enum SymptomType {
  BACK_PAIN
  NECK_PAIN
  LOSING_TEMPER
  HEADACHE
  FEVER
  INSOMNIA
  NIGHTMARES
  DEPRESSION
  ANXIETY
  UNEXPLAINED_PAIN
}

model SymptomDiagnostic {
  id              String       @id
  publicId        String       @unique
  userId          String
  symptomType     SymptomType
  severity        Int          // 1-10
  medicalCheckDone Boolean     @default(false) // Đã khám bác sĩ chưa
  
  // Auto-prescription
  prescribedLH    Int          // 7, 9, 13, etc.
  prescriptionReason String
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@map("symptom_diagnostics")
}
```

---

## Service Logic

```typescript
export class SomaticDiagnosticsEngine {
  private readonly SYMPTOM_LH_MAP: Record<SymptomType, { min: number; max: number }> = {
    [SymptomType.BACK_PAIN]: { min: 7, max: 9 },
    [SymptomType.NECK_PAIN]: { min: 7, max: 9 },
    [SymptomType.LOSING_TEMPER]: { min: 7, max: 9 },
    [SymptomType.HEADACHE]: { min: 7, max: 9 },
    [SymptomType.FEVER]: { min: 7, max: 9 },
    [SymptomType.INSOMNIA]: { min: 7, max: 9 },
    [SymptomType.NIGHTMARES]: { min: 7, max: 9 },
    [SymptomType.DEPRESSION]: { min: 9, max: 13 },
    [SymptomType.ANXIETY]: { min: 9, max: 13 },
    [SymptomType.UNEXPLAINED_PAIN]: { min: 7, max: 9 },
  };

  async diagnose(userId: string, dto: DiagnoseSymptomDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const prescription = this.SYMPTOM_LH_MAP[dto.symptomType];
    const prescribedLH = dto.severity >= 7 ? prescription.max : prescription.min;

    // Create diagnostic record
    const diagnostic = await this.prisma.symptomDiagnostic.create({
      data: {
        userId,
        symptomType: dto.symptomType,
        severity: dto.severity,
        medicalCheckDone: dto.medicalCheckDone,
        prescribedLH,
        prescriptionReason: `Triệu chứng ${dto.symptomType} - Nghiệp chướng/Linh tính`,
      },
    });

    // Auto-inject into debt ledger
    await this.debtLedgerService.addDebt(userId, {
      type: 'SYMPTOM_KARMIC_DEBT',
      amount: prescribedLH,
      reason: `${dto.symptomType} - Cần ${prescribedLH} TPT cho Oan gia trái chủ`,
      sourceId: diagnostic.id,
    });

    return diagnostic;
  }
}
```

---

## UI Components

### Symptom Checker
```
┌────────────────────────────────────────────┐
│  🩺 Chẩn Đoán Triệu Chứng                 │
├────────────────────────────────────────────┤
│  Bạn đang gặp triệu chứng gì?             │
│                                            │
│  (●) Đau thắt lưng / vai gáy              │
│  ( ) Hay nổi cáu vô cớ                    │
│  ( ) Đau đầu / Sốt                        │
│  ( ) Mất ngủ / Ác mộng                    │
│  ( ) Trầm cảm / Lo âu                     │
│                                            │
│  Mức độ nghiêm trọng: [██████░░░░] 6/10  │
│                                            │
│  Bạn đã khám bác sĩ chưa?                 │
│  [x] Đã khám - Bác sĩ nói bình thường    │
│                                            │
│  [Chẩn đoán]                              │
└────────────────────────────────────────────┘
```

### Diagnosis Result
```
┌────────────────────────────────────────────┐
│  ⚡ KẾT QUẢ CHẨN ĐOÁN                     │
├────────────────────────────────────────────┤
│  Triệu chứng: Đau thắt lưng               │
│  Mức độ: Trung bình (6/10)                │
│                                            │
│  CHẨN ĐOÁN TÂM LINH:                      │
│  Đau không rõ nguyên nhân y khoa là dấu  │
│  hiệu nghiệp chướng đang kích hoạt.       │
│                                            │
│  KÊ ĐƠN:                                  │
│  • 7-9 TPT cho "Oan gia trái chủ của bạn"│
│  • Khuyến nghị: 7 TPT                     │
│                                            │
│  Đã tự động thêm vào Sổ Nợ.              │
│                                            │
│  [Niệm TPT] [Xem sổ nợ]                  │
└────────────────────────────────────────────┘
```

### Severity-Based Prescription
```
┌────────────────────────────────────────────┐
│  🔴 TRIỆU CHỨNG NGHIÊM TRỌNG              │
├────────────────────────────────────────────┤
│  Triệu chứng: Trầm cảm                    │
│  Mức độ: Nghiêm trọng (9/10)              │
│                                            │
│  CẢNH BÁO:                                │
│  Triệu chứng này cho thấy nghiệp chướng   │
│  rất nặng.                                 │
│                                            │
│  KÊ ĐƠN KHẨN CẤP:                         │
│  • 13 TPT cho "Oan gia trái chủ của bạn" │
│  • Ưu tiên cao nhất                       │
│                                            │
│  Khuyến nghị thêm:                        │
│  • Niệm thêm 49 biến Tâm Kinh mỗi ngày   │
│  • Phóng sinh 100 con cá nhỏ              │
│                                            │
│  [Bắt đầu ngay]                           │
└────────────────────────────────────────────┘
```

---

## References
- Source: Intro to Guan Yin Citta - Somatic symptoms and karmic debt
- `design/03-domains/engagement/REFERENCES/PHYSICAL-SORENESS-TRACKER.md`

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 9 Logic 10

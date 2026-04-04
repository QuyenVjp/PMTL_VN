# Phác đồ Chẩn đoán Viêm Mũi/Họng Do Linh Tính Nhỏ — Minor ENT Spirits Karma Diagnosis Engine

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Huỳnh Thái Thượng Quần Chúng Cơ Sở
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Theo khai thị Đài trưởng, bệnh viêm mũi dị ứng và viêm họng mãn tính mà y học không chữa được thực chất là do linh tính nhỏ (từ việc sát sinh thuỷ hải sản nhỏ: tôm, cá nhỏ, cua nhỏ trong quá khứ) bám vào đường hô hấp. Nếu chỉ chữa y khoa mãi, sẽ không bao giờ khỏi vì không giải quyết được nguyên nhân tâm linh. Hệ thống cần tự động nhận diện các triệu chứng này và cung cấp phác đồ tâm linh thay vì kê đơn y khoa.

---

## Owner module

`wisdom-qa` — SymptomChecker / DailyRecitationService
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — Người dùng thực hiện self-diagnosis qua symptom checker
- `system` — Tự động detect và recommend phác đồ niệm kinh

---

## Trigger

User đánh dấu một hoặc cả hai triệu chứng:
- `[Viêm mũi dị ứng mãn tính]`
- `[Viêm họng mãn tính]`

Trong công cụ `[Kiểm tra Sức Khỏe / Health Diagnostic Tool]` của App

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Người dùng mark triệu chứng: Viêm mũi dị ứng OR Viêm họng mãn tính | ⚠️ Trigger diagnosis flow |
| Hệ thống confirm diagnosis = "Minor Spirits ENT Karma" | ✅ Recommend 49-108 biến Chú Vãng Sanh/ngày vào Daily Recitation |
| Hiện Tooltip/Banner cảnh báo | ✅ Display spiritual explanation + Recovery path |
| Người dùng đồng ý → Lưu diagnosis + Auto-append to Daily Schedule | ✅ SAVED |
| Người dùng từ chối → Dismiss banner | ✅ OPTIONAL (không blocking) |

---

## Input Contract

```typescript
// Symptom Checker Request
{
  userId: string;
  symptoms: {
    chronicNasalAllergy?: boolean;      // Viêm mũi dị ứng mãn tính
    chronicSoreThroat?: boolean;        // Viêm họng mãn tính
    otherOrlSymptoms?: string[];        // Các triệu chứng ENT khác
  };
  durationMonths?: number;              // Bao lâu rồi?
  hadYakMedication?: boolean;           // Đã dùng thuốc y khoa?
  yaKMedicationHelpful?: boolean;       // Có hiệu quả không?
}

// Diagnosis Response
{
  diagnosisCode: "MINOR_SPIRITS_ENT";
  vietnameseName: "Viêm Mũi/Họng Do Linh Tính Nhỏ";
  explanation: "Bệnh này do sát sinh thuỷ hải sản nhỏ tạo ra linh tính bám trên đường hô hấp...";
  recommendedRecitations: {
    mainChant: "Chú Vãng Sanh (Great Compassion Mantra alternative: Chú Đại Bi)",
    dailyCount: 49 | 108,
    duration: "tối thiểu 3 tháng liên tục"
  };
  merits: {
    littleHouses: "Tối thiểu 21 tấm/tuần",
    lifeLiberation: "Phóng sinh cá để siêu độ linh tính"
  };
}
```

---

## Write Path

```
POST /api/wisdom-qa/symptom-checker/diagnose

1. Load payload (symptoms array).
2. If (symptoms includes "CHRONIC_NASAL_ALLERGY" OR "CHRONIC_SORE_THROAT") {
3.    Check durationMonths > 3 AND yaKMedicationHelpful === false
4.    If true:
        → diagnosisCode = "MINOR_SPIRITS_ENT"
        → Create Diagnosis record in DB
        → Return response with recommendedRecitations
        → Append to user's DailyRecitationTemplate:
           - 49–108 biến Chú Vãng Sanh
           - Duration: 3–6 tháng
5. } Else {
6.    Return standard ENT recommendation (not spiritual)
7. }
8. Emit audit event: "diagnosis.minor_spirits_ent.created"
```

---

## FE Behavior

```
┌──────────────────────────────────────────┐
│  📋 Kiểm Tra Sức Khỏe                   │
├──────────────────────────────────────────┤
│  Bạn gặp phải triệu chứng nào?          │
│  ☑ Viêm mũi dị ứng mãn tính             │
│  ☐ Viêm họng mãn tính                   │
│  ☐ Khác...                              │
│                                          │
│  Bao lâu rồi?                           │
│  ◉ > 3 tháng                            │
│  ○ 1-3 tháng                            │
│                                          │
│  Đã dùng thuốc y khoa?                  │
│  ◉ Có, nhưng không hiệu quả             │
│  ○ Chưa dùng                            │
│                                          │
│  [Phân tích]                            │
└──────────────────────────────────────────┘

⬇️ User bấm [Phân tích] ⬇️

┌──────────────────────────────────────────┐
│  ⚠️ KẾT QUẢ CHẨN ĐOÁN                  │
├──────────────────────────────────────────┤
│  🔮 Viêm Mũi/Họng Do Linh Tính Nhỏ    │
│                                          │
│  Theo khai thị Đài trưởng, bệnh này    │
│  do linh tính nhỏ (tôm, cá) bám trên   │
│  cổ họng. Y học không chữa được!      │
│                                          │
│  💡 Phác đồ Tâm Linh:                   │
│  • Niệm 108 Chú Vãng Sanh/ngày         │
│  • Tối thiểu 3 tháng liên tục          │
│  • Đốt 21 Tiểu Phương Tử/tuần          │
│  • Phóng sinh cá để siêu độ linh tính  │
│                                          │
│  [✓] Tôi đồng ý áp dụng phác đồ này   │
│  [Huỷ]                                  │
└──────────────────────────────────────────┘

✅ After accept:
"Phác đồ đã được thêm vào Thời khóa hằng ngày."
```

---

## Schema Notes

```prisma
model Diagnosis {
  id        String @id @default(cuid())
  userId    String
  code      String   // e.g., "MINOR_SPIRITS_ENT"
  viName    String   // Tên tiếng Việt
  explanation String @db.Text

  recommendedRecitations Json  // { mainChant, dailyCount, duration }
  recommendedMerits Json        // { littleHouses, lifeLiberation }

  acceptedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, code, createdAt])
}

// In DailyRecitationTemplate
// Add field if not exists:
// diagnoses: Diagnosis[]  @relation("DiagnosisRecitations")
```

---

## Audit

| Action | Trigger |
|---|---|
| `diagnosis.minor_spirits_ent.created` | Người dùng chẩn đoán thành công |
| `diagnosis.accepted` | Người dùng bấm [Đồng ý áp dụng] |
| `daily_recitation.auto_appended_from_diagnosis` | NNN được thêm vào thời khóa |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Invalid symptom combination | `invalid_symptom_combination` | 400 |
| Missing required fields | `incomplete_diagnosis_form` | 400 |

---

## Notes for AI/codegen

- Rule này không blocking — chỉ recommendation (soft warning).
- Có thể user từ chối phác đồ; vẫn lưu diagnosis record cho analytics.
- Chú Vãng Sanh có thể được thay bằng Chú Đại Bi tùy khả năng; hệ thống nên cho user select.
- Tương lai: Có thể mở rộng cho các bệnh mãn tính khác (huyết áp, tiểu đường, v.v.) dựa trên khai thị mới.

---

## Related

- [daily-recitation-starter-mahaprajna-sutra-lock.md](./daily-recitation-starter-mahaprajna-sutra-lock.md) — Khởi động thời khóa
- [heavy-karma-activation-nnn-commitment-gate.md](./heavy-karma-activation-nnn-commitment-gate.md) — NNN commitment validation

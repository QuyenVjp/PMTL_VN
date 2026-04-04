# Quét Lịch Sử Ăn Uống Khi Onboarding — Pre-Buddhism Diet Scanner

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Introduction to Guan Yin Citta
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Nếu trước khi biết đến Phật pháp, người tu từng ăn các **sinh vật bị giết thịt tươi sống** (hải sản sống, tiết canh, thịt tươi nguyên con — không phải đồ đông lạnh qua chế biến), họ đã tạo nghiệp sát sinh trực tiếp. Để siêu độ cho những sinh vật đó, phải niệm **Vãng Sinh Chú** hàng ngày.

Hệ thống phát hiện điều này **trong luồng Onboarding** và **tự động thêm Vãng Sinh Chú** vào lịch trình thực hành mặc định.

---

## Owner module

`wisdom-qa` — Recommendation Engine / Onboarding Flow
Phối hợp: `identity` (User onboarding state) + `vows-merit` (DailyPractice prescription)

---

## Actors

- `member` — đang setup profile lần đầu
- `system` — scan câu trả lời, inject prescription vào daily schedule

---

## Trigger

Câu hỏi onboarding về lịch sử ăn uống, hoặc khi user vào **Profile → Lịch sử thực hành** lần đầu.

---

## Onboarding Question

### Câu hỏi (bắt buộc trong setup wizard)

```
Trước khi học Phật pháp, bạn có từng ăn hải sản hoặc
động vật được giết thịt tươi sống không?

(Ví dụ: gỏi cá sống, tiết canh, hào sống, tôm sống,
 con vật vừa giết tại chỗ — không phải đồ đông lạnh
 hay đã qua chế biến sẵn)

○ Có — tôi từng ăn như vậy
○ Không — tôi chưa từng ăn
○ Không chắc / Không nhớ rõ
```

### Mapping kết quả

| Câu trả lời | Hành động |
|---|---|
| `YES` | Inject Vãng Sinh Chú vào daily prescription |
| `NO` | Không thêm |
| `UNSURE` | Hiện tooltip tư vấn, cho user tự quyết định thêm hay không |

---

## Write Path

```
POST /api/identity/onboarding/diet-scan
─────────────────────────────────────────
Body: {
  ateRawKilledAnimals: "YES" | "NO" | "UNSURE"
  unsureDecision?:     "ADD" | "SKIP"   // bắt buộc nếu UNSURE
}

1. Lưu vào UserOnboardingProfile:
   {
     ateRawKilledAnimals,
     unsureDecision,
     dietScanCompletedAt: now()
   }

2. Nếu ateRawKilledAnimals === "YES"
   HOẶC (ateRawKilledAnimals === "UNSURE" AND unsureDecision === "ADD"):

   → Gọi DailyPrescriptionService.inject({
       userId,
       sutra: "VANG_SINH_CHU",
       dailyCount: 21,       // mặc định 21 biến/ngày
       reason: "PRE_BUDDHISM_DIET_KARMA",
       source: "ONBOARDING_DIET_SCAN"
     })

3. Audit: onboarding.diet-scan.completed + (nếu inject) daily-prescription.vang-sinh-chu.injected.
```

---

## Prescription Detail

### Vãng Sinh Chú — Liều lượng mặc định

| Tham số | Giá trị |
|---|---|
| Tên kinh | Vãng Sinh Chú |
| Số biến/ngày | **21 biến** (mặc định) hoặc **27 biến** (nếu user chọn nâng) |
| Mục đích | Siêu độ cho sinh vật đã bị giết tươi sống |
| Loại | Bổ sung vào daily schedule (không thay thế kinh chính) |
| Có thể điều chỉnh | Có — user có thể tăng lên 27, không giảm xuống dưới 21 |

### UI sau khi inject

```
┌──────────────────────────────────────────────────────────┐
│  ✅  Đã thêm vào lịch thực hành của bạn                 │
│                                                          │
│  Vãng Sinh Chú — 21 biến/ngày                          │
│                                                          │
│  Để siêu độ cho những sinh vật mà bạn đã ăn            │
│  tươi sống trước khi học Phật pháp.                    │
│                                                          │
│  Khi nào ngừng được?                                    │
│  Tiếp tục cho đến khi cảm thấy nhẹ nhàng hơn và       │
│  không còn gặp các dấu hiệu nghiệp sát sinh.           │
│  Nên tham khảo thêm qua Q&A.                           │
│                                                          │
│  [Xem lịch thực hành]   [Tìm hiểu thêm]               │
└──────────────────────────────────────────────────────────┘
```

### UNSURE flow

```
┌──────────────────────────────────────────────────────────┐
│  ℹ️  Nếu bạn không chắc chắn                           │
│                                                          │
│  Theo lời khai thị: nếu từng ăn sinh vật tươi sống     │
│  (kể cả chỉ 1-2 lần), việc niệm Vãng Sinh Chú sẽ      │
│  không có hại và chỉ tạo thêm công đức.                │
│                                                          │
│  Bạn có muốn thêm Vãng Sinh Chú vào lịch không?        │
│                                                          │
│  [Có, thêm vào lịch]   [Không, bỏ qua]                │
└──────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model UserOnboardingProfile {
  id                       String    @id @default(cuid())
  userId                   String    @unique
  ateRawKilledAnimals      DietScanAnswer?
  unsureDecision           UnsureDecision?
  dietScanCompletedAt      DateTime?
  isVegetarian             Boolean?
  vegetarianSince          DateTime?
  onboardingCompletedAt    DateTime?

  user                     User      @relation(fields: [userId], references: [id])
}

enum DietScanAnswer {
  YES
  NO
  UNSURE
}

enum UnsureDecision {
  ADD
  SKIP
}

model DailyPrescription {
  id          String    @id @default(cuid())
  userId      String
  sutra       String    // "VANG_SINH_CHU" | "CHU_DAI_BI" | ...
  dailyCount  Int
  reason      String    // "PRE_BUDDHISM_DIET_KARMA" | "MANUAL" | ...
  source      String    // "ONBOARDING_DIET_SCAN" | "ADMIN" | "USER_SELF"
  isActive    Boolean   @default(true)
  addedAt     DateTime  @default(now())
  removedAt   DateTime?

  user        User      @relation(fields: [userId], references: [id])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `onboarding.diet-scan.completed` | User trả lời câu hỏi |
| `daily-prescription.vang-sinh-chu.injected` | Vãng Sinh Chú được thêm tự động |
| `daily-prescription.vang-sinh-chu.user-declined` | UNSURE + chọn Skip |

---

## Notes for AI/codegen

- `DailyPrescription` là bảng chung cho tất cả các loại kinh được "kê đơn" — không phải chỉ cho diet scan. Dùng `reason` và `source` để phân biệt.
- `isVegetarian` trên `UserOnboardingProfile` là nguồn gốc — được sync sang `UserProfile.isVegetarian` sau khi onboarding complete.
- Diet scan nên xuất hiện ở **Step 3/5** trong onboarding wizard — sau khi user đã hiểu cơ bản về pháp môn, trước khi setup lịch thực hành.
- Câu hỏi diet scan KHÔNG được skip — phải trả lời hoặc chọn UNSURE.
- Recommendation Engine (Phase 2+): nếu user sau này update `ateRawKilledAnimals` từ NO → YES, trigger re-injection logic.

---

## Related

- [heart-incense-diet-counter.md](../../vows-merit/USE_CASES/heart-incense-diet-counter.md) — isVegetarian ảnh hưởng Tịnh Khẩu quota
- [daily-recitation-system.md](./daily-recitation-system.md) — Sutra catalog (Vãng Sinh Chú là một trong 10 Tiểu Chú)
- [prescribe-karmic-remedy.md](./prescribe-karmic-remedy.md) — Prescription engine tổng quát

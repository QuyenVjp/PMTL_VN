# Phác Đồ Oan Gia & Bệnh Lý — Prescribe Karmic Remedy

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Bách Khoa Bệnh Tật của Đài Trưởng Lư Quân Hoành
> **Trạng thái:** Verified source — human review required before modifying prescription templates
> **Cập nhật:** 2026-04-04

---

## Purpose

Cho phép `member` tự tra cứu hoặc `admin` tư vấn phác đồ thực hành tâm linh phù hợp
dựa trên tình huống sống cụ thể. Hệ thống mapping tình huống → phác đồ kinh văn chuẩn
từ kho `RemedyPrescription`, không cho phép user tự chỉnh sửa phác đồ.

**Thiết kế UX:** Dạng Troubleshooter từng bước (chọn danh mục → chọn tình huống → xem phác đồ),
ưu tiên font lớn, thao tác đơn giản cho người lớn tuổi trên điện thoại.

---

## Owner module

`wisdom-qa` — [xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — tra cứu self-service
- `admin` / `super-admin` — quản lý `RemedyCategory` và `RemedyPrescription` templates
- `system` — serve phác đồ từ cache

---

## Trigger

- User vào chuyên mục **"Cẩm Nang Cấp Cứu Cuộc Sống"** và bấm chọn danh mục tình huống.
- Hoặc `admin` tạo/cập nhật prescription template.

---

## Preconditions (tra cứu)

- Không yêu cầu đăng nhập cho read-only lookup (public).
- Yêu cầu session nếu user muốn lưu phác đồ vào hồ sơ cá nhân.

---

## Input contract — Lookup (GET)

```
GET /api/remedy/prescribe?categorySlug=<slug>&situationSlug=<slug>
```

Hoặc step-by-step flow:
```
Step 1: GET /api/remedy/categories           → danh sách RemedyCategory
Step 2: GET /api/remedy/categories/:slug     → danh sách RemedySituation
Step 3: GET /api/remedy/prescriptions/:slug  → RemedyPrescription chi tiết
```

---

## Input contract — Admin CMS (POST/PATCH — chỉ admin+)

```
{
  categorySlug:   string
  situationSlug:  string
  situationLabel: string
  prescription: {
    sutras: SutraInstruction[]
    littleHouseInstruction?: LittleHouseInstruction
    lifeLiberationInstruction?: string
    criticalWarnings: WarningBlock[]
    sourceReference: string
  }
}

SutraInstruction {
  sutraKey:    string   // "chu_dai_bi" | "tam_kinh" | "le_phat" | "vang_sinh" | ...
  countMin:    number
  countMax:    number
  note?:       string
}

WarningBlock {
  severity:   "CRITICAL" | "HIGH" | "ADVISORY"
  message:    string
  sourceRef:  string
}
```

**Access control:** Chỉ `super-admin` mới được phép tạo/sửa `RemedyPrescription` templates.
`admin` chỉ được đọc và serve. Lý do: phác đồ là Pháp Bảo chuẩn toàn cầu.

---

## Hardcoded Prescription Rules (không lưu trong CMS — hardcode trong service)

Các rule sau là **bất biến**, phải nằm trong service code, không phải DB config:

### Rule 1 — Ung Thư / Bệnh Hiểm Nghèo (Cancer / Severe Illness)

```
category: HEALTH
situation: CANCER_SEVERE_ILLNESS

prescription:
  Chú Đại Bi:           max 21 biến (giai đoạn bùng phát — CỨNG, không tăng)
  Tâm Kinh:             49 biến
  Lễ Phật Đại Sám Hối: 3–5 biến
  Tiểu Phương Tử:       tối thiểu 49 tờ/đợt, liên tục

criticalWarnings:
  - severity: CRITICAL
    message: "Không niệm Chú Đại Bi quá 21 biến ở giai đoạn bùng phát
              để tránh kích động linh tính. Chỉ tăng lên 49 biến khi bệnh đã ổn định."
```

### Rule 2 — Trầm Cảm / Tâm Thần (Depression / Mental Illness)

```
category: HEALTH
situation: MENTAL_ILLNESS_DEPRESSION

prescription:
  Chú Đại Bi:  tối đa 21 biến (CỨNG — không tăng)
  Tâm Kinh:    21–49 biến (tăng dần theo khả năng)
  Lễ Phật:     1–3 biến

criticalWarnings:
  - severity: HIGH
    message: "Giới hạn Chú Đại Bi ở 21 biến để không tạo áp lực năng lượng.
              Tâm Kinh là chủ lực để bình ổn thần kinh và khai mở trí tuệ."
```

### Rule 3 — Nợ Sát Sinh (Killing Karma)

```
category: KARMA
situation: ABORTION_MISCARRIAGE (phá thai / sảy thai)

prescription:
  Vãng Sinh Chú:  27 hoặc 49 biến/ngày (thêm vào bài tập hàng ngày)
  Tiểu Phương Tử: tối thiểu 7–21 tờ, ghi người nhận:
                  "Đứa trẻ của [Tên người mẹ]"

situation: SEAFOOD_KILLER (ăn hải sản sống, làm nghề giết mổ)

prescription:
  Vãng Sinh Chú:  27 biến/ngày thêm vào bài tập
```

---

## Read set

- `RemedyCategory` list (cached, TTL 1 giờ)
- `RemedySituation` list theo category (cached)
- `RemedyPrescription` theo situation slug (cached, TTL 6 giờ)
- Hardcoded rules (in-memory, không query DB)

---

## Write path (Admin CMS — tạo/sửa prescription)

1. Verify `actor.role = SUPER_ADMIN`. Nếu không → `403 forbidden`.
2. Validate DTO đầy đủ: `categorySlug`, `situationSlug`, `prescription.sutras` không rỗng, `sourceReference` có giá trị.
3. Upsert `RemedyPrescription` record.
4. Invalidate cache key `remedy:prescription:<situationSlug>`.
5. Audit `wisdom-qa.prescription.updated` với full diff.
6. **Không cho phép** sửa các hardcoded rules trong DB — những rules này nằm trong code, không có endpoint CRUD tương ứng.

---

## Async side-effects

- Cache invalidation sau khi admin update prescription.
- **Phase 2+:** Nếu user lưu phác đồ vào hồ sơ → outbox event `wisdom-qa.remedy.saved` → `engagement` tạo practice reminder.

---

## Success result

- User thấy phác đồ rõ ràng: từng loại kinh văn, số biến, cảnh báo theo mức độ nghiêm trọng.
- Admin thấy confirmation update và cache invalidation.

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| `situationSlug` không tồn tại | `not_found` | 404 | Chọn lại danh mục |
| Admin không phải `super-admin` cố gắng sửa prescription | `forbidden` | 403 | — |
| `sourceReference` trống khi tạo prescription mới | `invalid_body` | 400 | Bắt buộc điền nguồn khai thị |
| Cache miss + DB fail | `service_unavailable` | 503 | Retry sau 30 giây |

---

## Audit

| Action | Actor | Trigger |
|---|---|---|
| `wisdom-qa.remedy.looked-up` | actorUserId / anonymous | User xem phác đồ (chỉ log nếu authenticated) |
| `wisdom-qa.prescription.created` | superAdminUserId | Tạo prescription mới |
| `wisdom-qa.prescription.updated` | superAdminUserId | Sửa prescription hiện có |
| `wisdom-qa.remedy.saved-to-profile` | actorUserId | User lưu phác đồ vào hồ sơ |

---

## Rate-limit requirement

- Public lookup: 60 requests/minute per IP
- Admin write: 20 requests/minute per account

---

## Outbox event

- Event type: `wisdom-qa.remedy.saved`
- Subscriber: `engagement` (tạo practice reminder)
- Mode: sync-inline (Phase 1), outbox-required (Phase 2+)

---

## Recovery path

- Nếu cache bị xóa toàn bộ: fallback về DB query, cache warm-up tự động sau request đầu tiên.
- Nếu hardcoded rule bị tranh chấp với DB record cùng `situationSlug`: hardcoded rule **luôn thắng** — service đọc hardcoded trước, không query DB cho các situation keys đã hardcode.

---

## Data Models mới cần tạo

```
RemedyCategory {
  id        String  @id
  publicId  String  @unique
  slug      String  @unique
  label     String  // VD: "Sức Khỏe", "Gia Đình", "Sự Nghiệp"
  sortOrder Int
  status    String  // ACTIVE | ARCHIVED
}

RemedySituation {
  id          String  @id
  publicId    String  @unique
  slug        String  @unique
  categoryId  String
  label       String  // VD: "Ung thư / Bệnh hiểm nghèo"
  sortOrder   Int
  status      String
}

RemedyPrescription {
  id              String   @id
  publicId        String   @unique
  situationId     String   @unique
  prescriptionJson Json    // toàn bộ SutraInstruction[] + warnings
  sourceReference String
  lastUpdatedBy   String   // super-admin userId
  updatedAt       DateTime
}
```

---

## Notes for AI/codegen

- Các hardcoded rules (Cancer, Mental Illness, Killing Karma) phải nằm trong một `HardcodedPrescriptionMap` constant trong service, **không có Prisma model tương ứng**. Nếu DB có record cùng slug → service ignore DB, dùng hardcoded.
- `RemedyPrescription.prescriptionJson` là JSON column — validate với Zod khi đọc ra, không trust raw DB value.
- UX "Troubleshooter" cần route `GET /api/remedy/categories` trả về đủ để build wizard mà không cần nhiều round-trips. Consider nested response: `category → situations[]` trong một call.
- Không expose `lastUpdatedBy` userId ra public API — chỉ nội bộ admin panel.
- Phác đồ không thay thế y tế. Footer của mỗi prescription **bắt buộc** hiển thị disclaimer: *"Phác đồ này mang tính tham khảo tâm linh, không thay thế chẩn đoán y tế."*

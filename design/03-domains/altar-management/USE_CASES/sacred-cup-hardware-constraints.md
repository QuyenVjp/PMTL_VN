# Ràng Buộc Vật Lý đối với Ly Cúng — Sacred Cup Hardware Constraints

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 903, 904)
> **Trạng thái:** Verified source — UI enforcement + AI camera detection
> **Cập nhật:** 2026-04-04

---

## Purpose

Ly đựng Nước Đại Bi phải là ly hoàn toàn mới, làm bằng thủy tinh, sứ hoặc gốm. Tốt nhất là ly trắng trơn, có nắp đậy để tránh côn trùng/bụi rơi vào. Cấm: không được dùng ly có in Kinh văn, không dùng ly có in hình/tên Phật Bồ Tát, tuyệt đối không dùng ly có hình động vật.

---

## Owner module

`altar-management` — AltarService / SacredCupValidator
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người chuẩn bị bàn thờ lần đầu
- `system` — UI checklist validator + AI vision detection

---

## Trigger

1. Lần đầu setup bàn thờ (Onboarding Altar)
2. User cố đặt nguyên chai nước lên bàn thờ (AI camera detection)

---

## Business Rules

### Part A: Xác Nhận Tính Chất Ly Cúng

| Điều kiện | Hành động |
|---|---|
| Ly mới, thủy tinh/sứ/gốm, trắng trơn | ✅ Nút Continue enable |
| User tick checkbox xác nhận | ✅ Proceed to next step |
| Checkbox chưa tick | ❌ Nút disabled |
| User không tick | ❌ Blocking |

### Part B: Cảnh Báo Camera AI (Anti-Lazy Guard)

| Điều kiện | Hành động |
|---|---|
| AI Camera quét thấy nguyên chai nhựa trên bàn thờ | ⚠️ Push notification cảnh báo |
| User đặt ly đúng quy định | ✅ No alert |

---

## Input Contract

```typescript
interface CupComplianceChecklistDto {
  cupMaterialConfirmed: boolean      // thủy tinh/sứ/gốm
  cupIsNew: boolean                  // chưa dùng bao giờ
  noPrintedText: boolean             // không in Kinh văn
  noBuddhaImages: boolean            // không in hình Phật/Bồ Tát
  noAnimalImages: boolean            // không in hình động vật
  hasLid: boolean                    // có nắp (tùy chọn)
}

interface CupValidationResult {
  compliant: boolean
  violations: string[]
}
```

---

## Write Path

```
--- Onboarding Flow: POST /api/altar-management/altar/setup ---

1. Display CupComplianceChecklist Modal:
   [x] Ly của tôi làm bằng thủy tinh, sứ hoặc gốm
   [x] Ly này là ly MỚI, chưa từng dùng để uống cơm nước
   [x] Ly KHÔNG in Kinh văn (Chú Đại Bi, Tâm Kinh, v.v.)
   [x] Ly KHÔNG in hình Phật, Bồ Tát hoặc tượng thánh
   [x] Ly KHÔNG in hình động vật bất kỳ

2. Validate all checkboxes == true:
   a. If any false → return 400 { error: 'cup_compliance_failed', violations: [] }
   b. If all true → proceed

3. Audit: altar.cup.compliance_confirmed

--- AI Camera Detection (Background) ---
1. Periodically scan altar image (smartphone rear camera)
2. If detect plastic bottle shape on altar surface:
   → Push notification: "Tội bất kính: Không được đặt trực tiếp chai nước khoáng lên thay cho ly cúng! Vui lòng rót nước ra ly kính/sứ trước!"
3. Audit: altar.cup.anti_lazy_guard_triggered
```

---

## FE Behavior

### Onboarding Modal - Cup Compliance Checklist

```
┌────────────────────────────────────────────────────────┐
│ 🍶 Xác Nhận Tiêu Chuẩn Ly Cúng                         │
│────────────────────────────────────────────────────────│
│ Ly đựng Nước Đại Bi phải đáp ứng các tiêu chuẩn sau:  │
│                                                        │
│ [ ] Ly làm bằng thủy tinh, sứ hoặc gốm                 │
│ [ ] Ly này là LY MỚI (chưa dùng lần nào)              │
│ [ ] Không in Kinh văn hay Chú trên ly                 │
│ [ ] Không in hình Phật hay Bồ Tát                     │
│ [ ] Không in hình động vật                            │
│                                                        │
│ Nếu không thỏa mãn, vui lòng chuẩn bị ly khác.       │
│                                                        │
│       [Tiếp Tục]   [Hủy]                             │
│      (disabled)     (enabled)                         │
└────────────────────────────────────────────────────────┘
```

### AI Camera Warning (Background Scan)

```
🔴 [PMTL — Cảnh Báo Bất Kính]
Tội bất kính: Không được đặt trực tiếp chai nước khoáng
lên bàn thờ thay cho ly cúng! Vui lòng rót nước ra ly
kính hoặc sứ trước khi dâng!
```

---

## Schema Notes

```prisma
model AltarCupCompliance {
  id                 String   @id @default(cuid())
  userId             String
  cupMaterialType    String   // GLASS | CERAMIC | PORCELAIN
  isNew              Boolean
  noPrintedText      Boolean
  noBuddhaImages     Boolean
  noAnimalImages     Boolean
  confirmedAt        DateTime @default(now())
}

model AltarImageScan {
  id                 String   @id @default(cuid())
  userId             String
  scanTime           DateTime @default(now())
  bottleDetected     Boolean
  alertSent          Boolean
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.cup.compliance_confirmed` | User xác nhận tất cả conditions |
| `altar.cup.anti_lazy_guard_triggered` | AI camera phát hiện chai nhựa |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Any checkbox = false | `cup_compliance_failed` | 400 |

---

## Notes for AI/codegen

- Tất cả 5 checkboxes phải true mới proceed
- AI camera scan chạy background, không block user nhưng gửi push warning
- Bottle detection dùng perceptual hashing để avoid false positives

---

## Related

- [water-source-validation.md](./water-source-validation.md) — Kiểm tra loại nước
- [no-direct-contact-protocol.md](./no-direct-contact-protocol.md) — Cấm chạm môi

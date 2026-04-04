# Phân Cực Phương Pháp Tiêu Hủy Đơn Từ — Form Disposal Polarity Guard

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Các đơn từ tâm linh khác nhau có phương pháp tiêu hủy đối lập nhau: một số PHẢI đốt, số khác TUYỆT ĐỐI KHÔNG đốt. Nhầm lẫn phương pháp gây ra hậu quả nghiêm trọng cho gia đình. Hệ thống encode `DisposalMethod` vào từng loại form template và chỉ hiển thị nút phù hợp.

---

## Owner module

`engagement` — FormService / DisposalPolarityGuard
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — hoàn thành đơn từ và cần tiêu hủy đúng cách
- `system` — hiển thị đúng nút, ẩn nút sai, block nếu cố dùng phương pháp sai

---

## Trigger

Khi form template được load/rendered — disposal method được set ngay từ template metadata.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Form template `MUST_BURN` | ✅ Hiển thị [Đã Đốt Xong], ẩn [Lưu Trữ] |
| Form template `STRICTLY_NO_BURN` | ✅ Hiển thị [Đã Lưu Trữ], ẩn [Đốt] |
| User cố dùng phương pháp sai | ❌ Block + critical warning |
| `STRICTLY_NO_BURN` forms | ✅ Hiển thị watermark đỏ: "TUYỆT ĐỐI KHÔNG ĐỐT" |
| Storage period | ✅ Hiển thị recommended duration (vd: 2 tháng) |

---

## Form Disposal Schema

```prisma
enum FormDisposalMethod {
  MUST_BURN            // Phải đốt — VD: Đơn Thăng Văn Đổi Tên, Đơn Cầu Xin
  STRICTLY_NO_BURN     // Tuyệt đối không đốt — VD: Đơn Khuyến Đạo, Đơn Tịnh Trạch
}

model SacredFormTemplate {
  id              String             @id
  name            String
  disposalMethod  FormDisposalMethod
  storageDuration Int?               // days (nếu STRICTLY_NO_BURN)
  watermark       String?            // RED: "TUYỆT ĐỐI KHÔNG ĐỐT" nếu NO_BURN
}
```

---

## Known Form Types

| Form Name | Method | Notes |
|---|---|---|
| Đơn Thăng Văn Đổi Tên | `MUST_BURN` | Phải đốt sau khi hoàn thành |
| Đơn Cầu Xin/Phát Nguyện | `MUST_BURN` | Đốt để gửi đến Bồ Tát |
| Đơn Khuyến Đạo Người Nhà | `STRICTLY_NO_BURN` | Lưu 2 tháng, sau đó xé nhỏ |
| Đơn Tịnh Trạch/Nhà Mới | `STRICTLY_NO_BURN` | Lưu theo nhà, không đốt |

---

## Write Path

```
GET /api/engagement/sacred-forms/:templateId
→ Returns: { ...form, disposalMethod, storageDuration, watermark }

POST /api/engagement/sacred-forms/:id/dispose
1. Load form.disposalMethod
2. Validate dto.method matches form.disposalMethod:
   - If mismatch: return 400 { code: 'disposal_method_forbidden' }
3. Mark form as disposed: { disposedAt: now(), method: dto.method }
4. Audit: form.correct_disposal_logged
```

---

## FE Behavior

```
─────────────────────────────────────
TYPE A: Đơn Thăng Văn Đổi Tên
(MUST_BURN)

✅ [Đã Đốt Xong]  ← enabled
❌ [Lưu Trữ]      ← HIDDEN

─────────────────────────────────────

TYPE B: Đơn Khuyến Đạo Người Nhà
(STRICTLY_NO_BURN)

🚨 WATERMARK: TUYỆT ĐỐI KHÔNG ĐỐT
              NẾU KHÔNG SẼ GÂY TAI HỌA

❌ [Đã Đốt Xong]       ← HIDDEN
✅ [Đã Lưu Trữ 2 Tháng] ← enabled

─────────────────────────────────────

(Nếu user cố nhấn nút sai qua dev tools:)

❌ CẢNH BÁO NGHIÊM TRỌNG

Phương pháp tiêu hủy BẮT BUỘC là:
[LƯUTRỮ]

Đốt đơn từ này sẽ gây tai họa
nghiêm trọng cho gia đình.

[Quay Lại]
```

---

## Audit

| Action | Trigger |
|---|---|
| `form.disposal_method_loaded` | Template loaded |
| `form.correct_button_shown` | Right method displayed |
| `form.wrong_method_attempted` | Incorrect method tried |
| `form.disposal_blocked` | Wrong disposal prevented |
| `form.correct_disposal_logged` | Proper disposal confirmed |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Disposal method mismatch | `disposal_method_forbidden` | 400 |
| Form not found | `sacred_form_not_found` | 404 |

---

## Notes for AI/codegen

- `disposalMethod` là **template-level constant** — không cho user thay đổi.
- Watermark "TUYỆT ĐỐI KHÔNG ĐỐT" phải visible trên toàn bộ document (absolute positioned, semi-transparent red).
- Nút sai HIDDEN (display: none) — không chỉ disabled — để tránh confusion.

---

## Related

- [spiritual-applications.md](../../content/USE_CASES/spiritual-applications.md) — sacred form catalog
- [convincing-family-form-duty-cycle.md](../../content/USE_CASES/convincing-family-form-duty-cycle.md) — khuyến đạo form cycle

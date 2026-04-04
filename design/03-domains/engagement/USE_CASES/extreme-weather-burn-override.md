# Mở Khóa Ngoại Lệ Đốt NNN Thời Tiết Xấu — Extreme Weather Burn Override

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Quy tắc tuyệt đối: **KHÔNG ĐỐT NNN sau hoàng hôn hoặc khi trời mưa/u ám**. NGOẠI LỆ duy nhất: tình huống sinh tử khẩn cấp (bệnh nhân ICU, chủ nợ nghiệp chướng đang đòi). Hệ thống cho phép mở khóa ngoại lệ bằng câu gõ xác nhận đặc biệt để tránh lạm dụng.

---

## Owner module

`engagement` — LittleHouseService / WeatherGuard
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người muốn đốt NNN trong điều kiện thời tiết không cho phép
- `system` — khóa nút đốt, yêu cầu xác nhận typed phrase

---

## Trigger

Khi user vào màn hình đốt NNN và hệ thống phát hiện: trời mưa HOẶC sau hoàng hôn.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Thời tiết = nắng + giờ < hoàng hôn | ✅ Nút `[Bắt Đầu Đốt NNN]` enabled |
| Thời tiết = mưa HOẶC giờ > hoàng hôn | 🔒 Nút grayed + lý do hiển thị |
| Lock active, user click `[Mở Khóa Ngoại Lệ]` | ⏳ Modal xác nhận khẩn cấp |
| User gõ đúng: `XÁC NHẬN NGUY KỊCH KHẨN CẤP` | ✅ Bypass guard, cho phép đốt |
| User gõ sai phrase | ❌ Lock giữ nguyên |
| Emergency burn logged | ✅ Audit với reason=EMERGENCY_OVERRIDE |

---

## Input Contract

```typescript
interface EmergencyBurnOverrideDto {
  confirmationPhrase: string  // Phải = "XÁC NHẬN NGUY KỊCH KHẨN CẤP"
  emergencyReason: string     // Mô tả lý do khẩn cấp
}
```

---

## Write Path

```
POST /api/engagement/little-house/burn/emergency-override
1. Validate confirmationPhrase === "XÁC NHẬN NGUY KỊCH KHẨN CẤP" (exact string match)
2. Validate emergencyReason không trống
3. Create BurnOverrideEvent: type=EMERGENCY, weatherCondition, sunsetTime
4. Grant temporary burn permission (expires = 2 hours)
5. Return: { overrideGranted: true, expiresAt }
```

---

## FE Behavior

```
🚫 KHÔNG ĐƯỢC PHÉP ĐỐT NNN HÔM NAY

Lý do: Trời mưa / Đã lặn mặt trời
Luật PMTL: Chỉ được đốt dưới nắng vàng
và trước khi mặt trời lặn.

[Bắt Đầu Đốt NNN]  ← grayed, disabled

─────────────────────────────────────

[Mở Khóa Ngoại Lệ]  ← small link, not prominent

───────── Modal sau khi click ─────────

⚠️ CHỈ DÀNH CHO TRƯỜNG HỢP SINH TỬ KHẨN CẤP

Ví dụ: Bệnh nhân đang hấp hối tại ICU,
        chủ nợ nghiệp đang đòi khẩn.

Nhập đúng cụm từ sau để mở khóa:

[ XÁC NHẬN NGUY KỊCH KHẨN CẤP ]  ← text input

Lý do khẩn cấp: _______________

[Hủy]    [Xác Nhận]  ← disabled until phrase matches
```

---

## Schema Notes

```prisma
model BurnOverrideEvent {
  id               String   @id @default(cuid())
  userId           String
  overrideType     String   @default("EMERGENCY")
  weatherCondition String   // RAIN | OVERCAST | AFTER_SUNSET
  emergencyReason  String
  grantedAt        DateTime @default(now())
  expiresAt        DateTime
  // Migration: CREATE TABLE "BurnOverrideEvent" (...)
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `burn.weather_guard_active` | Lock được kích hoạt |
| `burn.emergency_override_requested` | User mở modal |
| `burn.emergency_override_granted` | Phrase đúng, unlock thành công |
| `burn.emergency_override_rejected` | Phrase sai |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Phrase không khớp | `emergency_phrase_mismatch` | 400 |
| emergencyReason trống | `emergency_reason_required` | 422 |

---

## Notes for AI/codegen

- Exact string match (không trim/lowercase) để tránh lazy workaround.
- Override permission expires sau 2 giờ — sau đó lock lại.
- Button `[Mở Khóa Ngoại Lệ]` phải nhỏ và không nổi bật để discourage casual use.

---

## Related

- [validate-little-house-burn-conditions.md](./validate-little-house-burn-conditions.md) — điều kiện đốt NNN chuẩn
- [little-house-sky-facing-burn-gate.md](./little-house-sky-facing-burn-gate.md) — hướng đốt NNN
